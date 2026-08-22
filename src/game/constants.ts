import { RaceInfo, CharacterRace } from '../types';

export const CHARACTER_RACES: Record<CharacterRace, RaceInfo> = {
  human: {
    id: 'human',
    name: 'มนุษย์',
    nameEn: 'Human',
    emoji: '🧑',
    bodyColor: '#ffd1a4', // Skin
    shirtColor: '#3b82f6', // Blue shirt
    limbColor: '#1d4ed8', // Jeans/arms
    description: 'สมดุลรอบด้าน คล่องแคล่ว มีไหวพริบ',
  },
  elf: {
    id: 'elf',
    name: 'เอลฟ์',
    nameEn: 'Elf',
    emoji: '🧝',
    bodyColor: '#ffedd5', // Fair skin
    shirtColor: '#10b981', // Emerald tunic
    limbColor: '#047857', // Forest green
    description: 'ว่องไว ลอยตัวนุ่มนวล รักธรรมชาติ',
  },
  ogre: {
    id: 'ogre',
    name: 'ยักษ์',
    nameEn: 'Ogre',
    emoji: '👹',
    bodyColor: '#ef4444', // Red demon
    shirtColor: '#78350f', // Leather armor
    limbColor: '#451a03', // Heavy brown
    description: 'พละกำลังมหาศาล หนักแน่น ทรงพลัง',
  },
  robot: {
    id: 'robot',
    name: 'หุ่นยนต์',
    nameEn: 'Robot',
    emoji: '🤖',
    bodyColor: '#94a3b8', // Steel
    shirtColor: '#06b6d4', // Cyan neon core
    limbColor: '#475569', // Chrome limbs
    description: 'กลไกจักรกลแม่นยำ ล้ำสมัย ประมวลผลเร็ว',
  },
};

// Physics constants tuned to 20% slow motion
export const PHYSICS = {
  GRAVITY: 0.12,
  MAX_FALL_SPEED: 3.5,
  MOVE_ACCEL: 0.18,
  MOVE_SPEED: 1.1,
  FRICTION: 0.88,
  JUMP_FORCE: -4.4,
  BOUNCE_STOMP_FORCE: -3.6,
  INVULNERABLE_DURATION: 90, // in frames (~1.5s)
  KNOCKBACK_FORCE_X: 1.8,
  KNOCKBACK_FORCE_Y: -2.8,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 450,
  LEVEL_WIDTH: 3600,
};

// Biome zones
export const BIOMES = {
  ZONE1_END: 1200,
  ZONE2_END: 2400,
  TOTAL_LENGTH: 3600,
};
