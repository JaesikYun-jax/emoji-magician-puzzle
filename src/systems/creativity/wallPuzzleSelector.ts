import { ALL_WALL_PUZZLES, type WallPuzzle } from '../../game-data/wallPuzzles';

/** totalClears → tier 결정 */
export function getTierForClears(totalClears: number): 1 | 2 | 3 | 4 {
  if (totalClears < 13) return 1;
  if (totalClears < 31) return 2;
  if (totalClears < 56) return 3;
  return 4;
}

/** 제외할 최근 퍼즐 수 계산 */
function getExcludeCount(poolSize: number): number {
  return Math.min(10, Math.max(6, Math.floor(poolSize / 2)));
}

/**
 * 문제은행에서 다음 퍼즐 선택.
 * recentPuzzleIds에 있는 퍼즐을 제외하고 랜덤 선택.
 */
export function selectWallPuzzle(
  totalClears: number,
  recentPuzzleIds: string[],
): WallPuzzle {
  const tier = getTierForClears(totalClears);
  const pool: WallPuzzle[] = ALL_WALL_PUZZLES.filter(p => p.tier === tier);

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
