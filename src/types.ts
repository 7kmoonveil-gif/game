export type CharacterRace = 'human' | 'elf' | 'ogre' | 'robot';

export interface RaceInfo {
  id: CharacterRace;
  name: string;
  nameEn: string;
  emoji: string;
  bodyColor: string;
  shirtColor: string;
  limbColor: string;
  description: string;
}

export type GameStatus = 'start' | 'playing' | 'quiz' | 'won' | 'gameover';

export interface QuizQuestion {
  id: number;
  question: string;
  hint: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LeaderboardEntry {
  playerName: string;
  race: CharacterRace;
  score: number; // Coins collected
  timeSeconds: number;
  formattedTime: string;
  status: 'WON' | 'LOST';
  timestamp?: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  emoji?: string;
  rotation?: number;
  vRot?: number;
}

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  length?: number;
  alpha: number;
  type: 'rain' | 'snow';
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'ground' | 'floating' | 'moving';
  vx?: number;
  minX?: number;
  maxX?: number;
}

export type EnemyType = 'snail' | 'bee' | 'frog';

export interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: EnemyType;
  emoji: string;
  vx: number;
  vy: number;
  startX: number;
  startY: number;
  rangeX: number;
  alive: boolean;
  facing: 1 | -1;
  // Specific properties
  sinePhase?: number;
  jumpTimer?: number;
  isGrounded?: boolean;
}

export interface Coin {
  id: string;
  x: number;
  y: number;
  baseY: number;
  collected: boolean;
  isPhysicsCoin?: boolean;
  vx?: number;
  vy?: number;
  bounceCount?: number;
  bobOffset?: number;
}

export interface MysteryBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hit: boolean;
  alpha: number;
  bumpOffsetY: number;
  active: boolean;
}

export interface FlagPole {
  x: number;
  y: number;
  width: number;
  height: number;
  reached: boolean;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  race: CharacterRace;
  hearts: number;
  maxHearts: number;
  isGrounded: boolean;
  facing: 1 | -1;
  walkCycle: number;
  invulnerableTimer: number;
  isHurt: boolean;
  knockbackTimer: number;
}
