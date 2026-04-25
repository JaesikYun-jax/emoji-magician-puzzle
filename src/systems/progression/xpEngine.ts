import type { SubjectProgress, XpGain, SubjectId } from './types';

/** 레벨 구간 정의 — 인덱스 N 값은 레벨 N+1 진입에 필요한 누적 XP */
export const LEVEL_XP_THRESHOLDS: number[] = [
  0,    // Lv1 시작
  60,   // Lv2 시작 (Lv1→Lv2: 60 XP)
  150,  // Lv3 시작 (Lv2→Lv3: 90 XP)
  280,  // Lv4 시작 (Lv3→Lv4: 130 XP)
  460,  // Lv5 시작 (Lv4→Lv5: 180 XP)
  700,  // Lv6 시작 (Lv5→Lv6: 240 XP)
  1010, // Lv7 시작 (Lv6→Lv7: 310 XP)
  1400, // Lv8 시작 (Lv7→Lv8: 390 XP)
  1880, // Lv9 시작 (Lv8→Lv9: 480 XP)
  2460, // Lv10 시작 (Lv9→Lv10: 580 XP)
];

export const MAX_LEVEL = LEVEL_XP_THRESHOLDS.length; // 10

/** XP로부터 레벨 계산 */
export function computeLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_XP_THRESHOLDS.length - 1; i++) {
    if (xp >= LEVEL_XP_THRESHOLDS[i + 1]!) {
      level = i + 2;
    } else {
      break;
    }
  }
  return Math.min(level, MAX_LEVEL);
}

/** 현재 레벨 내 XP 진행 정보 계산 */
export function computeLevelProgress(xp: number): {
  level: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  levelProgressPercent: number;
} {
  const level = computeLevel(xp);
  const levelIndex = level - 1;
  const currentThreshold = LEVEL_XP_THRESHOLDS[levelIndex] ?? 0;
  const nextThreshold = LEVEL_XP_THRESHOLDS[levelIndex + 1];

  if (nextThreshold === undefined) {
    // 최대 레벨
    return { level, xpInCurrentLevel: xp - currentThreshold, xpToNextLevel: 0, levelProgressPercent: 100 };
  }

  const xpInCurrentLevel = xp - currentThreshold;
  const xpToNextLevel = nextThreshold - xp;
  const span = nextThreshold - currentThreshold;
  const levelProgressPercent = Math.round((xpInCurrentLevel / span) * 100);

  return { level, xpInCurrentLevel, xpToNextLevel, levelProgressPercent };
}

/** 클리어 1회당 XP 계산 */
export function computeXpGain(params: {
  subjectId: SubjectId;
  streak: number;
  isCorrect: boolean;
  difficultyMultiplier?: number;
}): XpGain {
  if (!params.isCorrect) return { base: 0, streakBonus: 0, total: 0 };

  const base = Math.round(10 * (params.difficultyMultiplier ?? 1.0));
  const streakBonus = Math.min(params.streak, 5) * 2; // 최대 +10
  return { base, streakBonus, total: base + streakBonus };
}

/** 별점 합계 → 초기 XP 마이그레이션 (기존 levelProgress 데이터 활용) */
export function estimateXpFromStars(totalStars: number): number {
  // 별 1개 = 약 5 XP
  return totalStars * 5;
}

/** SubjectProgress 전체 계산 */
export function buildSubjectProgress(params: {
  subjectId: string;
  xp: number;
  totalClears: number;
  streak: number;
  bestStreak: number;
}): SubjectProgress {
  const { level, xpInCurrentLevel, xpToNextLevel, levelProgressPercent } = computeLevelProgress(params.xp);
  const rank = computeRank(level);

  return {
    subjectId: params.subjectId,
    xp: params.xp,
    level,
    totalClears: params.totalClears,
    streak: params.streak,
    bestStreak: params.bestStreak,
    rank,
    xpInCurrentLevel,
    xpToNextLevel,
    levelProgressPercent,
  };
}

/** 레벨 → 랭크 이름 (탐험가 테마, 레벨 1:1 매핑) */
export function computeRank(level: number): string {
  const ranks: Record<number, string> = {
    1:  '골목 탐험가',
    2:  '공원 탐험가',
    3:  '숲 탐험가',
    4:  '산악 탐험가',
    5:  '동굴 탐험가',
    6:  '사막 탐험가',
    7:  '해양 탐험가',
    8:  '극지 탐험가',
    9:  '하늘 탐험가',
    10: '우주 탐험가',
  };
  return ranks[level] ?? ranks[10]!;
}
