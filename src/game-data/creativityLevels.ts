export interface CreativityLevelConfig {
  id: string;
  subject: 'creativity';
  cols: number;
  rows: number;
  blocked: Array<{ x: number; y: number }>;
  walls?: Array<{ x: number; y: number; dir: 'r' | 'd' }>;  // dir:'r' = (x,y)↔(x+1,y) 이동 불가, dir:'d' = (x,y)↔(x,y+1) 이동 불가
  timeLimit: number;    // 초
  starThresholds: [number, number, number]; // [1star, 2star, 3star] 사용 시간 상한 (초)
}

export const CREATIVITY_LEVELS: CreativityLevelConfig[] = [
  // Level 1-2: 3×3, 블록 없음
  {
    id: 'creativity-1',
    subject: 'creativity',
    cols: 3, rows: 3, blocked: [],
    timeLimit: 60,
    starThresholds: [60, 30, 15],
  },
  {
    id: 'creativity-2',
    subject: 'creativity',
    cols: 3, rows: 3,
    blocked: [{ x: 1, y: 1 }],
    timeLimit: 60,
    starThresholds: [60, 25, 12],
  },
  // Level 3-4: 4×3
  {
    id: 'creativity-3',
    subject: 'creativity',
    cols: 4, rows: 3, blocked: [],
    timeLimit: 90,
    starThresholds: [90, 50, 25],
  },
  {
    id: 'creativity-4',
    subject: 'creativity',
    cols: 4, rows: 3,
    blocked: [{ x: 1, y: 1 }],
    timeLimit: 90,
    starThresholds: [90, 45, 20],
  },
  // Level 5-6: 4×4
  {
    id: 'creativity-5',
    subject: 'creativity',
    cols: 4, rows: 4, blocked: [],
    timeLimit: 120,
    starThresholds: [120, 70, 35],
  },
  {
    id: 'creativity-6',
    subject: 'creativity',
    cols: 4, rows: 4,
    blocked: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
    timeLimit: 120,
    starThresholds: [120, 65, 30],
  },
  // Level 7-8: 5×4
  {
    id: 'creativity-7',
    subject: 'creativity',
    cols: 5, rows: 4, blocked: [],
    timeLimit: 150,
    starThresholds: [150, 90, 45],
  },
  {
    id: 'creativity-8',
    subject: 'creativity',
    cols: 5, rows: 4,
    blocked: [{ x: 0, y: 2 }, { x: 4, y: 1 }],
    timeLimit: 150,
    starThresholds: [150, 85, 40],
  },
  // Level 9-10: 5×5, 6×4
  {
    id: 'creativity-9',
    subject: 'creativity',
    cols: 5, rows: 5,
    blocked: [{ x: 1, y: 1 }, { x: 3, y: 3 }],
    timeLimit: 180,
    starThresholds: [180, 110, 55],
  },
  {
    id: 'creativity-10',
    subject: 'creativity',
    cols: 6, rows: 4,
    blocked: [{ x: 1, y: 2 }, { x: 4, y: 1 }],
    timeLimit: 180,
    starThresholds: [180, 100, 50],
  },
];

export function getCreativityLevel(id: string): CreativityLevelConfig | undefined {
  return CREATIVITY_LEVELS.find(l => l.id === id);
}

/**
 * 플레이어 레벨에 맞는 퍼즐 설정을 반환한다.
 * playerLevel 1-based. 10레벨 초과 시 마지막 4개(7~10) 를 순환.
 */
export function getCreativityLevelForPlayer(playerLevel: number): CreativityLevelConfig {
  if (playerLevel <= CREATIVITY_LEVELS.length) {
    return CREATIVITY_LEVELS[playerLevel - 1];
  }
  // 최고 난이도 4개를 순환
  const hardStart = CREATIVITY_LEVELS.length - 4;
  const idx = hardStart + ((playerLevel - 1 - hardStart) % 4);
  return CREATIVITY_LEVELS[idx];
}

/** 뱃지 정의 */
export const CREATIVITY_BADGES = [
  { threshold: 1,  emoji: '🌱', name: '첫 발걸음' },
  { threshold: 3,  emoji: '🔥', name: '연속의 시작' },
  { threshold: 5,  emoji: '⚡', name: '번개 손가락' },
  { threshold: 10, emoji: '🏅', name: '두 자릿수 마법사' },
  { threshold: 15, emoji: '🌟', name: '빛나는 경로' },
  { threshold: 20, emoji: '🏆', name: '챔피언' },
  { threshold: 30, emoji: '👑', name: '달인의 경지' },
  { threshold: 50, emoji: '🧙', name: '이모지 마법사' },
] as const;

/** 랭크 정의 */
export const CREATIVITY_RANKS = [
  { minClears: 0,  level: 1,  title: '마법사 지망생', emoji: '✏️', nextThreshold: 1 },
  { minClears: 1,  level: 2,  title: '마법사 수련생', emoji: '🪄', nextThreshold: 3 },
  { minClears: 3,  level: 3,  title: '마법사 견습생', emoji: '🌱', nextThreshold: 6 },
  { minClears: 6,  level: 4,  title: '마법사 입문자', emoji: '🔮', nextThreshold: 10 },
  { minClears: 10, level: 5,  title: '마법사 중급자', emoji: '⚡', nextThreshold: 15 },
  { minClears: 15, level: 6,  title: '마법사 숙련자', emoji: '🌟', nextThreshold: 20 },
  { minClears: 20, level: 7,  title: '마법사 고수',   emoji: '🏅', nextThreshold: 30 },
  { minClears: 30, level: 8,  title: '마법사 달인',   emoji: '🏆', nextThreshold: 50 },
  { minClears: 50, level: 9,  title: '마법 기사',     emoji: '👑', nextThreshold: 80 },
  { minClears: 80, level: 10, title: '이모지 마법사', emoji: '🧙', nextThreshold: null },
] as const;

export type CreativityRank = typeof CREATIVITY_RANKS[number];

/** totalClears를 기반으로 현재 랭크를 반환 */
export function getCreativityRank(totalClears: number): typeof CREATIVITY_RANKS[number] {
  let rank: typeof CREATIVITY_RANKS[number] = CREATIVITY_RANKS[0];
  for (const r of CREATIVITY_RANKS) {
    if (totalClears >= r.minClears) rank = r;
    else break;
  }
  return rank;
}

/**
 * totalClears를 기반으로 자동 생성된 레벨 설정 반환.
 * 난이도: 0 → 3x3(빈), 1~2 → 3x3(구멍1), 3~5 → 4x3, ...
 */
export function generateCreativityConfig(totalClears: number): CreativityLevelConfig {
  let cols: number;
  let rows: number;
  let blocked: Array<{ x: number; y: number }>;
  let timeLimit: number;

  if (totalClears === 0) {
    cols = 3; rows = 3; blocked = []; timeLimit = 90;
  } else if (totalClears <= 2) {
    cols = 3; rows = 3; blocked = [{ x: 1, y: 1 }]; timeLimit = 75;
  } else if (totalClears <= 5) {
    cols = 4; rows = 3; blocked = []; timeLimit = 90;
  } else if (totalClears <= 9) {
    cols = 4; rows = 3; blocked = [{ x: 1, y: 1 }]; timeLimit = 80;
  } else if (totalClears <= 14) {
    cols = 4; rows = 4; blocked = []; timeLimit = 120;
  } else if (totalClears <= 19) {
    cols = 4; rows = 4; blocked = [{ x: 1, y: 1 }, { x: 2, y: 2 }]; timeLimit = 110;
  } else if (totalClears <= 29) {
    cols = 5; rows = 4; blocked = [{ x: 0, y: 2 }]; timeLimit = 140;
  } else if (totalClears <= 49) {
    cols = 5; rows = 4; blocked = [{ x: 0, y: 2 }, { x: 4, y: 1 }]; timeLimit = 130;
  } else if (totalClears <= 79) {
    cols = 5; rows = 5; blocked = [{ x: 1, y: 1 }, { x: 3, y: 3 }]; timeLimit = 180;
  } else {
    cols = 6; rows = 4; blocked = [{ x: 1, y: 2 }, { x: 4, y: 1 }]; timeLimit = 180;
  }

  return {
    id: '__auto__',
    subject: 'creativity',
    cols,
    rows,
    blocked,
    timeLimit,
    starThresholds: [timeLimit, Math.round(timeLimit * 0.7), Math.round(timeLimit * 0.4)],
  };
}
