import React, { useRef, useEffect, useCallback } from 'react';
import {
  Player,
  Platform,
  Enemy,
  Coin,
  MysteryBox,
  FlagPole,
  Particle,
  WeatherParticle,
  CharacterRace,
} from '../types';
import { PHYSICS, BIOMES, CHARACTER_RACES } from '../game/constants';
import { soundManager } from '../utils/audio';

interface GameCanvasProps {
  race: CharacterRace;
  hearts: number;
  setHearts: React.Dispatch<React.SetStateAction<number>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setPlayerXPos: (x: number) => void;
  isPaused: boolean;
  onHitMysteryBox: (boxId: string) => void;
  onWin: () => void;
  onGameOver: () => void;
  mysteryBoxState: {
    pendingBoxId: string | null;
    wasCorrect: boolean | null;
    triggerEffect: boolean;
  };
  resetTriggerEffect: () => void;
  // External input controls (keyboard & mobile)
  inputs: {
    left: boolean;
    right: boolean;
    jump: boolean;
  };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  race,
  hearts,
  setHearts,
  score,
  setScore,
  setPlayerXPos,
  isPaused,
  onHitMysteryBox,
  onWin,
  onGameOver,
  mysteryBoxState,
  resetTriggerEffect,
  inputs,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game State Refs to avoid stale closures in requestAnimationFrame
  const playerRef = useRef<Player>({
    x: 60,
    y: 320,
    vx: 0,
    vy: 0,
    width: 32,
    height: 48,
    race,
    hearts,
    maxHearts: 3,
    isGrounded: false,
    facing: 1,
    walkCycle: 0,
    invulnerableTimer: 0,
    isHurt: false,
    knockbackTimer: 0,
  });

  // Keep race in sync
  useEffect(() => {
    playerRef.current.race = race;
  }, [race]);

  // Keep hearts in sync
  useEffect(() => {
    playerRef.current.hearts = hearts;
  }, [hearts]);

  const levelDataRef = useRef<{
    platforms: Platform[];
    enemies: Enemy[];
    coins: Coin[];
    mysteryBoxes: MysteryBox[];
    flagPole: FlagPole;
  } | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const weatherParticlesRef = useRef<WeatherParticle[]>([]);
  const cameraXRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  // Initialize weather particles
  useEffect(() => {
    const weather: WeatherParticle[] = [];
    for (let i = 0; i < 70; i++) {
      weather.push({
        x: Math.random() * PHYSICS.CANVAS_WIDTH,
        y: Math.random() * PHYSICS.CANVAS_HEIGHT,
        vx: -0.2 + Math.random() * 0.4,
        vy: 0.8 + Math.random() * 0.8, // Slow-mo rain/snow fall
        size: 1 + Math.random() * 2.5,
        length: 8 + Math.random() * 8,
        alpha: 0.3 + Math.random() * 0.5,
        type: Math.random() > 0.5 ? 'rain' : 'snow',
      });
    }
    weatherParticlesRef.current = weather;
  }, []);

  // Initialize level
  const initLevel = useCallback(() => {
    import('../game/levelData').then(({ createInitialLevel }) => {
      levelDataRef.current = createInitialLevel();
    });
  }, []);

  useEffect(() => {
    initLevel();
  }, [initLevel]);

  // Handle Mystery Box result effects (coin burst or fade out)
  useEffect(() => {
    if (!mysteryBoxState.triggerEffect || !mysteryBoxState.pendingBoxId) return;

    const box = levelDataRef.current?.mysteryBoxes.find(
      (b) => b.id === mysteryBoxState.pendingBoxId
    );

    if (box) {
      if (mysteryBoxState.wasCorrect) {
        // Spawn 10 physics coins in slow motion!
        soundManager.playCoinsBurst();
        for (let i = 0; i < 10; i++) {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
          const speed = 2.2 + Math.random() * 2.0; // Slow-motion burst
          levelDataRef.current?.coins.push({
            id: `physics_coin_${Date.now()}_${i}`,
            x: box.x + box.width / 2,
            y: box.y - 10,
            baseY: box.y - 10,
            collected: false,
            isPhysicsCoin: true,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            bounceCount: 0,
          });
        }

        // Add celebratory burst particles
        for (let i = 0; i < 20; i++) {
          particlesRef.current.push({
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3 - 1,
            size: 3 + Math.random() * 4,
            color: ['#fbbf24', '#f59e0b', '#10b981', '#38bdf8'][Math.floor(Math.random() * 4)],
            alpha: 1,
            life: 0,
            maxLife: 40 + Math.random() * 30,
            emoji: '✨',
          });
        }
      } else {
        // Wrong answer: mark box to fade away
        box.active = false;
      }
    }

    resetTriggerEffect();
  }, [mysteryBoxState, resetTriggerEffect]);

  // Main Game Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      frameCountRef.current++;

      if (!isPaused && levelDataRef.current) {
        const player = playerRef.current;
        const level = levelDataRef.current;

        // 1. UPDATE PLAYER MOVEMENT (Slow-motion ~20%)
        if (player.knockbackTimer > 0) {
          player.knockbackTimer--;
        } else {
          if (inputs.left) {
            player.vx = -PHYSICS.MOVE_SPEED;
            player.facing = -1;
            player.walkCycle += 0.08;
          } else if (inputs.right) {
            player.vx = PHYSICS.MOVE_SPEED;
            player.facing = 1;
            player.walkCycle += 0.08;
          } else {
            player.vx *= PHYSICS.FRICTION;
            if (Math.abs(player.vx) < 0.05) player.vx = 0;
          }

          // Jump
          if (inputs.jump && player.isGrounded) {
            player.vy = PHYSICS.JUMP_FORCE;
            player.isGrounded = false;
            soundManager.playJump();

            // Jump dust particles
            for (let i = 0; i < 5; i++) {
              particlesRef.current.push({
                x: player.x + player.width / 2 + (Math.random() - 0.5) * 12,
                y: player.y + player.height,
                vx: (Math.random() - 0.5) * 1,
                vy: -Math.random() * 0.6,
                size: 2 + Math.random() * 3,
                color: '#cbd5e1',
                alpha: 0.8,
                life: 0,
                maxLife: 20,
              });
            }
          }
        }

        // Apply slow-mo gravity
        player.vy += PHYSICS.GRAVITY;
        if (player.vy > PHYSICS.MAX_FALL_SPEED) {
          player.vy = PHYSICS.MAX_FALL_SPEED;
        }

        // Move horizontally
        player.x += player.vx;
        if (player.x < 0) player.x = 0;

        // Move vertically
        player.y += player.vy;
        player.isGrounded = false;

        // Decrease invulnerability timer
        if (player.invulnerableTimer > 0) {
          player.invulnerableTimer--;
          player.isHurt = player.invulnerableTimer % 10 < 5;
        } else {
          player.isHurt = false;
        }

        // Update player position for HUD progress bar
        setPlayerXPos(player.x);

        // 2. PLATFORM COLLISIONS (AABB)
        for (const plat of level.platforms) {
          if (
            player.x + player.width > plat.x &&
            player.x < plat.x + plat.width &&
            player.y + player.height >= plat.y &&
            player.y + player.height <= plat.y + plat.height + player.vy + 2 &&
            player.vy >= 0
          ) {
            player.y = plat.y - player.height;
            player.vy = 0;
            player.isGrounded = true;
          }
        }

        // 3. COINS INTERACTION (Floating & Physics Coins)
        for (const coin of level.coins) {
          if (coin.collected) continue;

          // Physics Coin motion
          if (coin.isPhysicsCoin && coin.vx !== undefined && coin.vy !== undefined) {
            coin.vy += PHYSICS.GRAVITY;
            coin.x += coin.vx;
            coin.y += coin.vy;

            // Bounce on platforms
            for (const plat of level.platforms) {
              if (
                coin.x + 12 > plat.x &&
                coin.x - 12 < plat.x + plat.width &&
                coin.y + 12 >= plat.y &&
                coin.y + 12 <= plat.y + plat.height + coin.vy + 2 &&
                coin.vy > 0
              ) {
                coin.y = plat.y - 12;
                coin.vy = -coin.vy * 0.65; // Elastic bounce
                coin.vx *= 0.85;
                coin.bounceCount = (coin.bounceCount || 0) + 1;
              }
            }
          }

          // Player collects coin
          const dist = Math.hypot(
            player.x + player.width / 2 - coin.x,
            player.y + player.height / 2 - coin.y
          );

          if (dist < 26) {
            coin.collected = true;
            setScore((prev) => prev + 1);
            soundManager.playCoin();

            // Sparkle particles
            for (let i = 0; i < 8; i++) {
              particlesRef.current.push({
                x: coin.x,
                y: coin.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: 2 + Math.random() * 3,
                color: '#fbbf24',
                alpha: 1,
                life: 0,
                maxLife: 25,
                emoji: '✨',
              });
            }
          }
        }

        // 4. MYSTERY BOXES INTERACTION
        for (const box of level.mysteryBoxes) {
          if (box.hit) {
            // Animate bump offset
            if (box.bumpOffsetY < 0) {
              box.bumpOffsetY += 0.5;
              if (box.bumpOffsetY > 0) box.bumpOffsetY = 0;
            }
            // If inactive (wrong answer), fade out
            if (!box.active && box.alpha > 0) {
              box.alpha -= 0.02;
            }
            continue;
          }

          // Check hit from below or collision
          const isColliding =
            player.x + player.width > box.x &&
            player.x < box.x + box.width &&
            player.y + player.height > box.y &&
            player.y < box.y + box.height;

          if (isColliding) {
            box.hit = true;
            box.bumpOffsetY = -8;
            player.vy = 1.5; // push down slightly
            soundManager.playMysteryHit();
            onHitMysteryBox(box.id);
            break;
          }
        }

        // 5. ENEMIES MOVEMENT & COMBAT (Slow-motion ~20%)
        for (const enemy of level.enemies) {
          if (!enemy.alive) continue;

          if (enemy.type === 'snail') {
            enemy.x += enemy.vx;
            if (enemy.x > enemy.startX + enemy.rangeX) {
              enemy.vx = -Math.abs(enemy.vx);
              enemy.facing = -1;
            } else if (enemy.x < enemy.startX) {
              enemy.vx = Math.abs(enemy.vx);
              enemy.facing = 1;
            }
          } else if (enemy.type === 'bee') {
            enemy.x += enemy.vx;
            if (enemy.x > enemy.startX + enemy.rangeX) {
              enemy.vx = -Math.abs(enemy.vx);
              enemy.facing = -1;
            } else if (enemy.x < enemy.startX) {
              enemy.vx = Math.abs(enemy.vx);
              enemy.facing = 1;
            }
            // Sine wave floating in slow-mo
            enemy.sinePhase = (enemy.sinePhase || 0) + 0.03;
            enemy.y = enemy.startY + Math.sin(enemy.sinePhase) * 20;
          } else if (enemy.type === 'frog') {
            enemy.jumpTimer = (enemy.jumpTimer || 0) - 1;
            if (enemy.jumpTimer <= 0 && enemy.isGrounded) {
              enemy.vy = -3.2; // Slow-mo jump arc
              enemy.isGrounded = false;
              enemy.jumpTimer = 80 + Math.random() * 40;
            }

            enemy.vy += PHYSICS.GRAVITY;
            enemy.y += enemy.vy;
            enemy.x += enemy.vx;

            if (enemy.x > enemy.startX + enemy.rangeX) {
              enemy.vx = -Math.abs(enemy.vx);
              enemy.facing = -1;
            } else if (enemy.x < enemy.startX) {
              enemy.vx = Math.abs(enemy.vx);
              enemy.facing = 1;
            }

            // Platform collision for frog
            for (const plat of level.platforms) {
              if (
                enemy.x + enemy.width > plat.x &&
                enemy.x < plat.x + plat.width &&
                enemy.y + enemy.height >= plat.y &&
                enemy.y + enemy.height <= plat.y + plat.height + enemy.vy + 2 &&
                enemy.vy >= 0
              ) {
                enemy.y = plat.y - enemy.height;
                enemy.vy = 0;
                enemy.isGrounded = true;
              }
            }
          }

          // Combat Collision check
          const isEnemyColliding =
            player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height;

          if (isEnemyColliding) {
            // STOMP CHECK: player is falling and player's feet hit the top third of the enemy
            const isStomp = player.vy > 0 && player.y + player.height - player.vy <= enemy.y + 12;

            if (isStomp) {
              enemy.alive = false;
              player.vy = PHYSICS.BOUNCE_STOMP_FORCE;
              soundManager.playStomp();

              // Defeat particles
              for (let i = 0; i < 12; i++) {
                particlesRef.current.push({
                  x: enemy.x + enemy.width / 2,
                  y: enemy.y + enemy.height / 2,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3,
                  size: 3 + Math.random() * 3,
                  color: '#fbbf24',
                  alpha: 1,
                  life: 0,
                  maxLife: 30,
                  emoji: '⭐',
                });
              }
            } else if (player.invulnerableTimer === 0) {
              // HURT COLLISION
              player.hearts -= 1;
              setHearts(player.hearts);
              player.invulnerableTimer = PHYSICS.INVULNERABLE_DURATION;
              player.knockbackTimer = 15;
              player.vx = -player.facing * PHYSICS.KNOCKBACK_FORCE_X;
              player.vy = PHYSICS.KNOCKBACK_FORCE_Y;
              soundManager.playHurt();

              // Hurt particles
              for (let i = 0; i < 6; i++) {
                particlesRef.current.push({
                  x: player.x + player.width / 2,
                  y: player.y + player.height / 2,
                  vx: (Math.random() - 0.5) * 2,
                  vy: (Math.random() - 0.5) * 2 - 1,
                  size: 3,
                  color: '#ef4444',
                  alpha: 1,
                  life: 0,
                  maxLife: 25,
                  emoji: '💔',
                });
              }

              if (player.hearts <= 0) {
                soundManager.playGameOver();
                onGameOver();
              }
            }
          }
        }

        // 6. FLAGPOLE VICTORY CHECK
        const flag = level.flagPole;
        if (
          !flag.reached &&
          player.x + player.width >= flag.x &&
          player.x <= flag.x + flag.width + 20 &&
          player.y + player.height >= flag.y
        ) {
          flag.reached = true;
          soundManager.playVictory();
          onWin();
        }

        // 7. ABYSS FALL CHECK (Falling below screen)
        if (player.y > PHYSICS.CANVAS_HEIGHT + 40) {
          player.hearts = 0;
          setHearts(0);
          soundManager.playGameOver();
          onGameOver();
        }

        // 8. CAMERA SMOOTH TRACKING
        const targetCamX = Math.max(
          0,
          Math.min(player.x - 260, PHYSICS.LEVEL_WIDTH - PHYSICS.CANVAS_WIDTH)
        );
        cameraXRef.current += (targetCamX - cameraXRef.current) * 0.08;
      }

      // === 9. RENDER SCENE ===
      render(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, onHitMysteryBox, onWin, onGameOver, setHearts, setScore, setPlayerXPos, inputs]);

  // Master Render Function
  const render = (ctx: CanvasRenderingContext2D) => {
    const camX = cameraXRef.current;
    const player = playerRef.current;
    const level = levelDataRef.current;
    const raceInfo = CHARACTER_RACES[player.race] || CHARACTER_RACES.human;

    ctx.clearRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);

    // Current zone at camera center
    const currentWorldX = camX + PHYSICS.CANVAS_WIDTH / 2;

    // === A. DRAW 3-SEASON DYNAMIC SKY ===
    const skyGrad = ctx.createLinearGradient(0, 0, 0, PHYSICS.CANVAS_HEIGHT);
    if (currentWorldX <= BIOMES.ZONE1_END) {
      // Zone 1: Peach / Orange Sunny
      skyGrad.addColorStop(0, '#fdba74'); // Orange 300
      skyGrad.addColorStop(1, '#ffedd5'); // Orange 100
    } else if (currentWorldX <= BIOMES.ZONE2_END) {
      // Zone 2: Rainy Slate / Darker Muted
      skyGrad.addColorStop(0, '#475569'); // Slate 600
      skyGrad.addColorStop(1, '#94a3b8'); // Slate 400
    } else {
      // Zone 3: Winter Ice / Soft Cyan White
      skyGrad.addColorStop(0, '#7dd3fc'); // Sky 300
      skyGrad.addColorStop(1, '#f0f9ff'); // Sky 50
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, PHYSICS.CANVAS_WIDTH, PHYSICS.CANVAS_HEIGHT);

    // === B. DRAW 3-LAYER PARALLAX MOUNTAINS ===
    // Layer 1: Far Mountains (slowest factor 0.15)
    ctx.save();
    const farOffset = -(camX * 0.15) % 800;
    ctx.translate(farOffset, 0);
    drawMountainLayer(ctx, currentWorldX, 1);
    ctx.translate(800, 0);
    drawMountainLayer(ctx, currentWorldX, 1);
    ctx.restore();

    // Layer 2: Mid Mountains (factor 0.35)
    ctx.save();
    const midOffset = -(camX * 0.35) % 800;
    ctx.translate(midOffset, 0);
    drawMountainLayer(ctx, currentWorldX, 2);
    ctx.translate(800, 0);
    drawMountainLayer(ctx, currentWorldX, 2);
    ctx.restore();

    // Layer 3: Near Hills (factor 0.6)
    ctx.save();
    const nearOffset = -(camX * 0.6) % 800;
    ctx.translate(nearOffset, 0);
    drawMountainLayer(ctx, currentWorldX, 3);
    ctx.translate(800, 0);
    drawMountainLayer(ctx, currentWorldX, 3);
    ctx.restore();

    // === C. DRAW WORLD OBJECTS (TRANSLATED BY CAMERAX) ===
    ctx.save();
    ctx.translate(-camX, 0);

    if (level) {
      // 1. Draw Platforms (with biome-specific styles)
      for (const plat of level.platforms) {
        drawBiomePlatform(ctx, plat);
      }

      // 2. Draw Flagpole at finish line 🏁
      drawFlagpole(ctx, level.flagPole);

      // 3. Draw Mystery Boxes 🎁
      for (const box of level.mysteryBoxes) {
        drawMysteryBox(ctx, box);
      }

      // 4. Draw Coins 🪙
      for (const coin of level.coins) {
        if (!coin.collected) {
          drawCoin(ctx, coin);
        }
      }

      // 5. Draw Enemies 🐌 🐝 🐸
      for (const enemy of level.enemies) {
        if (enemy.alive) {
          drawEnemy(ctx, enemy);
        }
      }
    }

    // 6. Draw Animated Player Character
    drawPlayerCharacter(ctx, player, raceInfo);

    // 7. Draw Custom Particles
    updateAndDrawParticles(ctx);

    ctx.restore();

    // === D. DRAW WEATHER OVERLAY (Rain / Snow in foreground) ===
    drawWeatherOverlay(ctx, currentWorldX);
  };

  // Draw 3-Layer Parallax Mountains
  const drawMountainLayer = (
    ctx: CanvasRenderingContext2D,
    worldX: number,
    layer: 1 | 2 | 3
  ) => {
    ctx.save();
    ctx.beginPath();

    let fillStyle = '#fb923c';
    if (worldX <= BIOMES.ZONE1_END) {
      // Zone 1: Peach/Coral
      fillStyle = layer === 1 ? 'rgba(251, 146, 60, 0.45)' : layer === 2 ? 'rgba(234, 88, 12, 0.65)' : 'rgba(194, 65, 12, 0.85)';
    } else if (worldX <= BIOMES.ZONE2_END) {
      // Zone 2: Slate/Grey
      fillStyle = layer === 1 ? 'rgba(100, 116, 139, 0.45)' : layer === 2 ? 'rgba(71, 85, 105, 0.65)' : 'rgba(51, 65, 85, 0.85)';
    } else {
      // Zone 3: Icy Cyan/White
      fillStyle = layer === 1 ? 'rgba(186, 230, 253, 0.5)' : layer === 2 ? 'rgba(125, 211, 252, 0.7)' : 'rgba(56, 189, 248, 0.85)';
    }

    ctx.fillStyle = fillStyle;

    if (layer === 1) {
      // Tall gentle peaks
      ctx.moveTo(0, 450);
      ctx.lineTo(0, 220);
      ctx.lineTo(200, 120);
      ctx.lineTo(420, 240);
      ctx.lineTo(620, 130);
      ctx.lineTo(800, 230);
      ctx.lineTo(800, 450);
    } else if (layer === 2) {
      // Mid ridges
      ctx.moveTo(0, 450);
      ctx.lineTo(0, 280);
      ctx.lineTo(150, 190);
      ctx.lineTo(320, 290);
      ctx.lineTo(500, 180);
      ctx.lineTo(680, 270);
      ctx.lineTo(800, 290);
      ctx.lineTo(800, 450);
    } else {
      // Near rolling hills
      ctx.moveTo(0, 450);
      ctx.lineTo(0, 340);
      ctx.quadraticCurveTo(120, 270, 260, 340);
      ctx.quadraticCurveTo(400, 260, 540, 330);
      ctx.quadraticCurveTo(680, 250, 800, 340);
      ctx.lineTo(800, 450);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Draw Biome-specific Platform
  const drawBiomePlatform = (ctx: CanvasRenderingContext2D, plat: Platform) => {
    ctx.save();
    const platMidX = plat.x + plat.width / 2;

    let soilColor = '#c2410c'; // Brick orange
    let grassColor = '#84cc16'; // Lime green
    let capHeight = 8;

    if (platMidX > BIOMES.ZONE1_END && platMidX <= BIOMES.ZONE2_END) {
      // Zone 2: Muddy brown soil + Dark moss
      soilColor = '#574032';
      grassColor = '#15803d';
    } else if (platMidX > BIOMES.ZONE2_END) {
      // Zone 3: Ice blue soil + Pure white snow cap
      soilColor = '#1e3a8a';
      grassColor = '#ffffff';
      capHeight = 10;
    }

    // Draw Soil Body
    ctx.fillStyle = soilColor;
    ctx.beginPath();
    ctx.roundRect(plat.x, plat.y, plat.width, plat.height, [6, 6, 4, 4]);
    ctx.fill();

    // Subtle Soil Texture Lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 2;
    for (let x = plat.x + 15; x < plat.x + plat.width - 10; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, plat.y + capHeight + 4);
      ctx.lineTo(x + 8, plat.y + plat.height - 6);
      ctx.stroke();
    }

    // Draw Grass / Snow Top Cap
    ctx.fillStyle = grassColor;
    ctx.beginPath();
    ctx.roundRect(plat.x, plat.y, plat.width, capHeight, [6, 6, 0, 0]);
    ctx.fill();

    // Cute Grass/Icicle Trim Droplets
    ctx.fillStyle = grassColor;
    for (let x = plat.x + 10; x < plat.x + plat.width - 5; x += 18) {
      ctx.beginPath();
      ctx.arc(x, plat.y + capHeight + 2, 3, 0, Math.PI);
      ctx.fill();
    }

    ctx.restore();
  };

  // Draw Flagpole 🏁
  const drawFlagpole = (ctx: CanvasRenderingContext2D, flag: FlagPole) => {
    ctx.save();
    // Pole
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(flag.x + 8, flag.y, 6, flag.height);

    // Golden Ball Top
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(flag.x + 11, flag.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Flag Top Banner Checkered
    ctx.font = '36px sans-serif';
    ctx.fillText('🏁', flag.x + 12, flag.y + 36);

    // Base podium
    ctx.fillStyle = '#475569';
    ctx.fillRect(flag.x, flag.y + flag.height - 12, 24, 12);
    ctx.restore();
  };

  // Draw Mystery Box 🎁
  const drawMysteryBox = (ctx: CanvasRenderingContext2D, box: MysteryBox) => {
    if (box.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = box.alpha;

    const renderY = box.y + box.bumpOffsetY;

    // Floating question mark above the box
    if (!box.hit) {
      const bobY = Math.sin(frameCountRef.current * 0.08) * 4;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('❓', box.x + box.width / 2, renderY - 8 + bobY);
    }

    // Box Body
    ctx.fillStyle = box.hit ? '#94a3b8' : '#f97316'; // Orange gift box
    ctx.beginPath();
    ctx.roundRect(box.x, renderY, box.width, box.height, 8);
    ctx.fill();

    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Gift Ribbon or Emoji
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(box.hit ? '📦' : '🎁', box.x + box.width / 2, renderY + box.height / 2);

    ctx.restore();
  };

  // Draw Coin 🪙
  const drawCoin = (ctx: CanvasRenderingContext2D, coin: Coin) => {
    ctx.save();
    let renderY = coin.y;
    if (!coin.isPhysicsCoin) {
      renderY = coin.baseY + Math.sin(frameCountRef.current * 0.06 + (coin.bobOffset || 0)) * 5;
    }

    // Glow
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;

    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🪙', coin.x, renderY);

    ctx.restore();
  };

  // Draw Enemies 🐌 🐝 🐸
  const drawEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    ctx.save();
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    if (enemy.facing === -1) {
      ctx.scale(-1, 1);
    }

    ctx.fillText(enemy.emoji, 0, 0);
    ctx.restore();
  };

  // Draw Player Character with animated limbs and chosen Race colors
  const drawPlayerCharacter = (
    ctx: CanvasRenderingContext2D,
    player: Player,
    raceInfo: typeof CHARACTER_RACES.human
  ) => {
    ctx.save();

    // Blink when invulnerable/hurt
    if (player.isHurt) {
      ctx.globalAlpha = 0.45;
    }

    const centerX = player.x + player.width / 2;
    const bottomY = player.y + player.height;

    ctx.translate(centerX, bottomY);
    if (player.facing === -1) {
      ctx.scale(-1, 1);
    }

    const isMoving = Math.abs(player.vx) > 0.1;
    const isJumping = !player.isGrounded;

    // Limb Swing Angles (Slow-motion animated)
    const legAngle1 = isJumping ? 0.35 : isMoving ? Math.sin(player.walkCycle) * 0.55 : 0;
    const legAngle2 = isJumping ? -0.35 : isMoving ? Math.sin(player.walkCycle + Math.PI) * 0.55 : 0;
    const armAngle1 = isJumping ? -1.1 : isMoving ? Math.sin(player.walkCycle + Math.PI) * 0.6 : 0.2;
    const armAngle2 = isJumping ? -1.1 : isMoving ? Math.sin(player.walkCycle) * 0.6 : -0.2;

    // 1. Back Leg
    drawLimb(ctx, 4, -16, 6, 16, legAngle2, raceInfo.limbColor);

    // 2. Back Arm
    drawLimb(ctx, 5, -28, 5, 14, armAngle2, raceInfo.bodyColor);

    // 3. Torso / Shirt
    ctx.fillStyle = raceInfo.shirtColor;
    ctx.beginPath();
    ctx.roundRect(-8, -32, 16, 18, [4, 4, 3, 3]);
    ctx.fill();

    // Belt / Trim
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-8, -16, 16, 3);

    // 4. Front Leg
    drawLimb(ctx, -4, -16, 6, 16, legAngle1, raceInfo.limbColor);

    // 5. Front Arm
    drawLimb(ctx, -5, -28, 5, 14, armAngle1, raceInfo.bodyColor);

    // 6. Character Head (Emoji of chosen race)
    ctx.font = '26px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(raceInfo.emoji, 0, -38);

    ctx.restore();
  };

  // Helper to draw a swinging limb with pivot
  const drawLimb = (
    ctx: CanvasRenderingContext2D,
    pivotX: number,
    pivotY: number,
    width: number,
    height: number,
    angle: number,
    color: string
  ) => {
    ctx.save();
    ctx.translate(pivotX, pivotY);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-width / 2, 0, width, height, width / 2);
    ctx.fill();
    ctx.restore();
  };

  // Update and draw particles
  const updateAndDrawParticles = (ctx: CanvasRenderingContext2D) => {
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = 1 - p.life / p.maxLife;

      if (p.life >= p.maxLife) {
        particlesRef.current.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      if (p.emoji) {
        ctx.font = `${p.size * 3.5}px sans-serif`;
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  };

  // Draw Rain / Snow Weather Overlay
  const drawWeatherOverlay = (
    ctx: CanvasRenderingContext2D,
    worldX: number
  ) => {
    const isRainZone = worldX > BIOMES.ZONE1_END && worldX <= BIOMES.ZONE2_END;
    const isSnowZone = worldX > BIOMES.ZONE2_END;

    if (!isRainZone && !isSnowZone) return;

    ctx.save();
    for (const wp of weatherParticlesRef.current) {
      wp.x += wp.vx;
      wp.y += wp.vy;

      if (wp.y > PHYSICS.CANVAS_HEIGHT) {
        wp.y = 0;
        wp.x = Math.random() * PHYSICS.CANVAS_WIDTH;
      }
      if (wp.x < 0) wp.x = PHYSICS.CANVAS_WIDTH;
      if (wp.x > PHYSICS.CANVAS_WIDTH) wp.x = 0;

      if (isRainZone) {
        // Slow-mo rain streaks
        ctx.strokeStyle = `rgba(186, 230, 253, ${wp.alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(wp.x, wp.y);
        ctx.lineTo(wp.x - 2, wp.y + (wp.length || 10));
        ctx.stroke();
      } else if (isSnowZone) {
        // Slow-mo snowflakes gently drifting
        ctx.fillStyle = `rgba(255, 255, 255, ${wp.alpha})`;
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, wp.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  };

  return (
    <div className="relative w-full aspect-[16/9] max-w-4xl mx-auto bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={PHYSICS.CANVAS_WIDTH}
        height={PHYSICS.CANVAS_HEIGHT}
        className="w-full h-full object-contain block select-none"
      />
    </div>
  );
};
