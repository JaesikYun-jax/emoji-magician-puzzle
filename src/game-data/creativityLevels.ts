export interface CreativityLevelConfig {
  id: string;
  subject: 'creativity';
  cols: number;
  rows: number;
  blocked: Array<{ x: number; y: number }>;
  walls?: Array<{ x: number; y: number; dir: 'r' | 'd' }>;  // dir:'r' = (x,y)↔(x+1,y) 이동 불가, dir:'d' = (x,y)↔(x,y+1) 이동 불가
  timeLimit: number;    // 초
  starThresholds: [number, number, number]; // [1star, 2star, 3star] 사용 시간 상한 (초)
  startCell?: { x: number; y: number };   // 시작점 강제 (없으면 자유)
  endCell?: { x: number; y: number };     // 끝점 강제 (없으면 자유)
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
  { threshold: 1,   emoji: '🌱', name: '첫 발걸음' },
  { threshold: 5,   emoji: '🔥', name: '열정 불꽃' },
  { threshold: 15,  emoji: '⚡', name: '연습의 빛' },
  { threshold: 30,  emoji: '💫', name: '별빛 탐험가' },
  { threshold: 60,  emoji: '🌊', name: '파도 정복자' },
  { threshold: 100, emoji: '💎', name: '다이아 의지' },
  { threshold: 150, emoji: '👑', name: '마스터의 왕관' },
] as const;

/** 색상 계급 랭크 정의 */
export interface CreativityRankDef {
  minScore: number;
  level: number;
  tier: string;
  title: string;
  emoji: string;
  color: string;
  nextThreshold: number | null;
  difficultyGate?: number;
}

export const CREATIVITY_RANKS: CreativityRankDef[] = [
  // ── 아이언 (Iron, #78716C) ─────────────────────────────────
  { minScore: 0,   level: 1,  tier: 'iron',     title: '아이언 III', emoji: '⚙️', color: '#78716C', nextThreshold: 3 },
  { minScore: 3,   level: 2,  tier: 'iron',     title: '아이언 II',  emoji: '⚙️', color: '#78716C', nextThreshold: 7 },
  { minScore: 7,   level: 3,  tier: 'iron',     title: '아이언 I',   emoji: '⚙️', color: '#78716C', nextThreshold: 12 },
  // ── 브론즈 (Bronze, #B45309) ───────────────────────────────
  { minScore: 12,  level: 4,  tier: 'bronze',   title: '브론즈 III', emoji: '🥉', color: '#B45309', nextThreshold: 19 },
  { minScore: 19,  level: 5,  tier: 'bronze',   title: '브론즈 II',  emoji: '🥉', color: '#B45309', nextThreshold: 28 },
  { minScore: 28,  level: 6,  tier: 'bronze',   title: '브론즈 I',   emoji: '🥉', color: '#B45309', nextThreshold: 40,  difficultyGate: 2 },
  // ── 실버 (Silver, #9CA3AF) ────────────────────────────────
  { minScore: 40,  level: 7,  tier: 'silver',   title: '실버 III',   emoji: '🥈', color: '#9CA3AF', nextThreshold: 55 },
  { minScore: 55,  level: 8,  tier: 'silver',   title: '실버 II',    emoji: '🥈', color: '#9CA3AF', nextThreshold: 73 },
  { minScore: 73,  level: 9,  tier: 'silver',   title: '실버 I',     emoji: '🥈', color: '#9CA3AF', nextThreshold: 95 },
  // ── 골드 (Gold, #D97706) ─────────────────────────────────
  { minScore: 95,  level: 10, tier: 'gold',     title: '골드 III',   emoji: '🥇', color: '#D97706', nextThreshold: 120 },
  { minScore: 120, level: 11, tier: 'gold',     title: '골드 II',    emoji: '🥇', color: '#D97706', nextThreshold: 150 },
  { minScore: 150, level: 12, tier: 'gold',     title: '골드 I',     emoji: '🥇', color: '#D97706', nextThreshold: 185, difficultyGate: 3 },
  // ── 에메랄드 (Emerald, #059669) ───────────────────────────
  { minScore: 185, level: 13, tier: 'emerald',  title: '에메랄드 III', emoji: '💚', color: '#059669', nextThreshold: 225 },
  { minScore: 225, level: 14, tier: 'emerald',  title: '에메랄드 II',  emoji: '💚', color: '#059669', nextThreshold: 270 },
  { minScore: 270, level: 15, tier: 'emerald',  title: '에메랄드 I',   emoji: '💚', color: '#059669', nextThreshold: 320 },
  // ── 사파이어 (Sapphire, #2563EB) ─────────────────────────
  { minScore: 320, level: 16, tier: 'sapphire', title: '사파이어 III', emoji: '💙', color: '#2563EB', nextThreshold: 376 },
  { minScore: 376, level: 17, tier: 'sapphire', title: '사파이어 II',  emoji: '💙', color: '#2563EB', nextThreshold: 438 },
  { minScore: 438, level: 18, tier: 'sapphire', title: '사파이어 I',   emoji: '💙', color: '#2563EB', nextThreshold: 506, difficultyGate: 4 },
  // ── 다이아몬드 (Diamond, #7C3AED) ────────────────────────
  { minScore: 506, level: 19, tier: 'diamond',  title: '다이아 III',  emoji: '💎', color: '#7C3AED', nextThreshold: 580, difficultyGate: 5 },
  { minScore: 580, level: 20, tier: 'diamond',  title: '다이아 II',   emoji: '💎', color: '#7C3AED', nextThreshold: 660 },
  { minScore: 660, level: 21, tier: 'diamond',  title: '다이아 I',    emoji: '💎', color: '#7C3AED', nextThreshold: 746 },
  // ── 마스터 ────────────────────────────────────────────────
  { minScore: 746, level: 22, tier: 'master',   title: '마스터',      emoji: '🏆', color: '#DC2626', nextThreshold: null, difficultyGate: 5 },
];

export type CreativityRank = CreativityRankDef;

/** 격자 크기로 난이도 티어 계산 (1=3×3, 2=4×3, 3=4×4, 4=5×4, 5=5×5/6×4) */
export function computeDifficultyTier(cols: number, rows: number): number {
  const cells = cols * rows;
  if (cells <= 9) return 1;
  if (cells <= 12) return 2;
  if (cells <= 16) return 3;
  if (cells <= 20) return 4;
  return 5;
}

/** 격자 크기로 난이도 가중치 점수 계산 */
export function computeDifficultyPoints(cols: number, rows: number): number {
  const tier = computeDifficultyTier(cols, rows);
  const pts: Record<number, number> = { 1: 1.0, 2: 1.5, 3: 2.0, 4: 2.5, 5: 3.0 };
  return pts[tier] ?? 1.0;
}

/**
 * rankScore와 maxDifficultyTier를 기반으로 현재 랭크를 반환.
 * difficultyGate가 있는 랭크는 maxDifficultyTier가 gate 미충족 시 해당 랭크에 멈춤.
 */
export function getCreativityRank(rankScore: number, maxDifficultyTier = 0): CreativityRankDef {
  let rank: CreativityRankDef = CREATIVITY_RANKS[0];
  for (const r of CREATIVITY_RANKS) {
    if (rankScore < r.minScore) break;
    if (r.difficultyGate && maxDifficultyTier < r.difficultyGate) break;
    rank = r;
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
