import { Platform, Enemy, Coin, MysteryBox, FlagPole } from '../types';

export function createInitialLevel(): {
  platforms: Platform[];
  enemies: Enemy[];
  coins: Coin[];
  mysteryBoxes: MysteryBox[];
  flagPole: FlagPole;
} {
  // Ground and elevated platforms
  const platforms: Platform[] = [
    // === ZONE 1 (Spring/Peach, 0 - 1200) ===
    { x: 0, y: 390, width: 450, height: 60, type: 'ground' },
    { x: 200, y: 310, width: 110, height: 20, type: 'floating' },
    { x: 340, y: 240, width: 120, height: 20, type: 'floating' },
    
    // Pit 1: gap at 450-520
    { x: 520, y: 390, width: 380, height: 60, type: 'ground' },
    { x: 620, y: 300, width: 100, height: 20, type: 'floating' },
    { x: 760, y: 220, width: 130, height: 20, type: 'floating' },
    
    // Pit 2: gap at 900-980
    { x: 980, y: 390, width: 400, height: 60, type: 'ground' },
    { x: 1080, y: 310, width: 120, height: 20, type: 'floating' },
    { x: 1240, y: 230, width: 110, height: 20, type: 'floating' },

    // === ZONE 2 (Rainy Slate, 1200 - 2400) ===
    { x: 1420, y: 390, width: 480, height: 60, type: 'ground' },
    { x: 1530, y: 320, width: 100, height: 20, type: 'floating' },
    { x: 1680, y: 250, width: 110, height: 20, type: 'floating' },
    { x: 1820, y: 190, width: 120, height: 20, type: 'floating' },

    // Pit 3: gap at 1900-1980
    { x: 1980, y: 390, width: 420, height: 60, type: 'ground' },
    { x: 2070, y: 310, width: 110, height: 20, type: 'floating' },
    { x: 2230, y: 240, width: 120, height: 20, type: 'floating' },

    // === ZONE 3 (Winter Ice, 2400 - 3600) ===
    { x: 2450, y: 390, width: 420, height: 60, type: 'ground' },
    { x: 2550, y: 310, width: 100, height: 20, type: 'floating' },
    { x: 2700, y: 240, width: 120, height: 20, type: 'floating' },
    
    // Floating island steps
    { x: 2900, y: 320, width: 110, height: 20, type: 'floating' },
    { x: 3060, y: 260, width: 120, height: 20, type: 'floating' },
    
    // Final goal ground stretch
    { x: 3220, y: 390, width: 480, height: 60, type: 'ground' },
    { x: 3340, y: 300, width: 100, height: 20, type: 'floating' },
  ];

  // Enemies across the zones
  const enemies: Enemy[] = [
    // Zone 1
    {
      id: 'e1_snail',
      x: 320,
      y: 366,
      width: 26,
      height: 24,
      type: 'snail',
      emoji: '🐌',
      vx: 0.3,
      vy: 0,
      startX: 240,
      startY: 366,
      rangeX: 140,
      alive: true,
      facing: 1,
    },
    {
      id: 'e2_bee',
      x: 680,
      y: 190,
      width: 24,
      height: 24,
      type: 'bee',
      emoji: '🐝',
      vx: 0.35,
      vy: 0,
      startX: 650,
      startY: 190,
      rangeX: 160,
      alive: true,
      facing: 1,
      sinePhase: 0,
    },
    {
      id: 'e3_snail',
      x: 750,
      y: 366,
      width: 26,
      height: 24,
      type: 'snail',
      emoji: '🐌',
      vx: -0.3,
      vy: 0,
      startX: 600,
      startY: 366,
      rangeX: 180,
      alive: true,
      facing: -1,
    },

    // Zone 2 (Rainy)
    {
      id: 'e4_frog',
      x: 1480,
      y: 366,
      width: 26,
      height: 24,
      type: 'frog',
      emoji: '🐸',
      vx: 0.25,
      vy: 0,
      startX: 1460,
      startY: 366,
      rangeX: 120,
      alive: true,
      facing: 1,
      jumpTimer: 60,
      isGrounded: true,
    },
    {
      id: 'e5_bee',
      x: 1720,
      y: 180,
      width: 24,
      height: 24,
      type: 'bee',
      emoji: '🐝',
      vx: 0.38,
      vy: 0,
      startX: 1700,
      startY: 180,
      rangeX: 180,
      alive: true,
      facing: 1,
      sinePhase: 1.5,
    },
    {
      id: 'e6_frog',
      x: 2100,
      y: 366,
      width: 26,
      height: 24,
      type: 'frog',
      emoji: '🐸',
      vx: 0.25,
      vy: 0,
      startX: 2040,
      startY: 366,
      rangeX: 140,
      alive: true,
      facing: 1,
      jumpTimer: 100,
      isGrounded: true,
    },
    {
      id: 'e7_snail',
      x: 2280,
      y: 216,
      width: 26,
      height: 24,
      type: 'snail',
      emoji: '🐌',
      vx: 0.28,
      vy: 0,
      startX: 2240,
      startY: 216,
      rangeX: 80,
      alive: true,
      facing: 1,
    },

    // Zone 3 (Winter/Snow)
    {
      id: 'e8_snail',
      x: 2600,
      y: 366,
      width: 26,
      height: 24,
      type: 'snail',
      emoji: '🐌',
      vx: 0.32,
      vy: 0,
      startX: 2500,
      startY: 366,
      rangeX: 180,
      alive: true,
      facing: 1,
    },
    {
      id: 'e9_bee',
      x: 2800,
      y: 190,
      width: 24,
      height: 24,
      type: 'bee',
      emoji: '🐝',
      vx: 0.4,
      vy: 0,
      startX: 2750,
      startY: 190,
      rangeX: 200,
      alive: true,
      facing: 1,
      sinePhase: 3.14,
    },
    {
      id: 'e10_frog',
      x: 3260,
      y: 366,
      width: 26,
      height: 24,
      type: 'frog',
      emoji: '🐸',
      vx: 0.25,
      vy: 0,
      startX: 3240,
      startY: 366,
      rangeX: 130,
      alive: true,
      facing: 1,
      jumpTimer: 45,
      isGrounded: true,
    }
  ];

  // Coins positioned nicely on platforms & in arches
  const coinPositions: [number, number][] = [
    // Zone 1
    [150, 350], [180, 350],
    [230, 275], [260, 275],
    [370, 205], [400, 205],
    [560, 350], [650, 265], [680, 265],
    [790, 185], [820, 185],
    [1020, 350], [1120, 275], [1150, 275],

    // Zone 2
    [1450, 350], [1480, 350],
    [1560, 285], [1590, 285],
    [1710, 215], [1740, 215],
    [1850, 155], [1880, 155],
    [2020, 350], [2100, 275], [2260, 205],

    // Zone 3
    [2490, 350], [2520, 350],
    [2580, 275], [2610, 275],
    [2730, 205], [2760, 205],
    [2930, 285], [3090, 225],
    [3270, 350], [3370, 265], [3400, 265]
  ];

  const coins: Coin[] = coinPositions.map(([x, y], index) => ({
    id: `coin_${index}`,
    x,
    y,
    baseY: y,
    collected: false,
    bobOffset: Math.random() * Math.PI * 2,
  }));

  // Mystery boxes positioned throughout the level
  const mysteryBoxes: MysteryBox[] = [
    { id: 'mb_1', x: 280, y: 190, width: 34, height: 34, hit: false, alpha: 1, bumpOffsetY: 0, active: true },
    { id: 'mb_2', x: 830, y: 140, width: 34, height: 34, hit: false, alpha: 1, bumpOffsetY: 0, active: true },
    { id: 'mb_3', x: 1610, y: 200, width: 34, height: 34, hit: false, alpha: 1, bumpOffsetY: 0, active: true },
    { id: 'mb_4', x: 2150, y: 210, width: 34, height: 34, hit: false, alpha: 1, bumpOffsetY: 0, active: true },
    { id: 'mb_5', x: 2970, y: 220, width: 34, height: 34, hit: false, alpha: 1, bumpOffsetY: 0, active: true },
  ];

  // Flagpole at finish
  const flagPole: FlagPole = {
    x: 3500,
    y: 190,
    width: 20,
    height: 200,
    reached: false,
  };

  return {
    platforms,
    enemies,
    coins,
    mysteryBoxes,
    flagPole,
  };
}
