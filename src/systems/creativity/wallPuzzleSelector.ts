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
): WallPuzzle {
  const tier = getTierForClears(totalClears, currentStreak);
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

/**
 * 특정 티어를 강제 지정하여 퍼즐 선택.
 * "이 게임만 하기"에서 사용자가 티어를 직접 고른 경우에 사용.
 * 제외 로직은 selectWallPuzzle과 동일한 3중 폴백 구조.
 */
export function selectWallPuzzleByTier(
  tier: 1 | 2 | 3 | 4 | 5,
  recentPuzzleIds: string[],
): WallPuzzle {
  let pool: WallPuzzle[] = ALL_WALL_PUZZLES.filter(p => p.tier === tier);

  // tier 5 퍼즐이 없으면 tier 4로 폴백
  if (pool.length === 0 && tier === 5) {
    pool = ALL_WALL_PUZZLES.filter(p => p.tier === 4);
  }

  const excludeCount = Math.min(10, Math.max(6, Math.floor(pool.length / 2)));
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
