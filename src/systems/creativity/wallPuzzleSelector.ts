import { ALL_WALL_PUZZLES, type WallPuzzle } from '../../game-data/wallPuzzles';

/** streak 보너스 → 유효 클리어 수 계산 */
function effectiveClears(totalClears: number, currentStreak: number): number {
  // 연승이 쌓일수록 난이도가 더 빨리 오른다
  let bonus = 0;
  if (currentStreak >= 3)  bonus += 8;
  if (currentStreak >= 6)  bonus += 10;
  if (currentStreak >= 10) bonus += 15;
  return totalClears + bonus;
}

/** totalClears + streak → tier 결정 (1~5) */
export function getTierForClears(totalClears: number, currentStreak = 0): 1 | 2 | 3 | 4 | 5 {
  const ec = effectiveClears(totalClears, currentStreak);
  if (ec < 13)  return 1;
  if (ec < 31)  return 2;
  if (ec < 56)  return 3;
  if (ec < 90)  return 4;
  return 5;
}

/** 제외할 최근 퍼즐 수 계산 */
function getExcludeCount(poolSize: number): number {
  return Math.min(10, Math.max(6, Math.floor(poolSize / 2)));
}

/**
 * 문제은행에서 다음 퍼즐 선택.
 * recentPuzzleIds에 있는 퍼즐을 제외하고 랜덤 선택.
 * currentStreak 이 높을수록 더 높은 Tier 문제를 선택한다.
 */
export function selectWallPuzzle(
  totalClears: number,
  recentPuzzleIds: string[],
  currentStreak = 0,
  forcedTier?: 1 | 2 | 3 | 4 | 5,
): WallPuzzle {
  const tier = forcedTier ?? getTierForClears(totalClears, currentStreak);
  let pool: WallPuzzle[] = ALL_WALL_PUZZLES.filter(p => p.tier === tier);

  // Tier 5 퍼즐이 없으면 Tier 4로 폴백
  if (pool.length === 0) {
    pool = ALL_WALL_PUZZLES.filter(p => p.tier === 4);
  }

  const excludeCount = getExcludeCount(pool.length);
  const excluded = new Set(recentPuzzleIds.slice(-excludeCount));

  let candidates = pool.filter(p => !excluded.has(p.id));

  // Fallback 1: 절반만 제외
  if (candidates.length === 0) {
    const half = new Set(recentPuzzleIds.slice(-Math.floor(excludeCount / 2)));
    candidates = pool.filter(p => !half.has(p.id));
  }
  // Fallback 2: 직전 1개만 제외
  if (candidates.length === 0) {
    const last = recentPuzzleIds[recentPuzzleIds.length - 1];
    candidates = pool.filter(p => p.id !== last);
  }
  // Fallback 3: 전체 풀
  if (candidates.length === 0) {
    candidates = pool;
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
