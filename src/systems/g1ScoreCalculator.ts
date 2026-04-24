import type { G1LevelData } from '@/game-data/g1Levels';

export interface ScoreState {
  total: number;
  combo: number;
  pairsCompleted: number;
}

export function calcPairScore(combo: number): number {
  const base = 100;
  if (combo >= 4) return base + 150;
  if (combo === 3) return base + 100;
  if (combo === 2) return base + 50;
  return base;
}

export function calcTimeBonus(timeLeft: number): number {
  return Math.max(0, timeLeft) * 10;
}

export function calcStars(levelData: G1LevelData, timeLeft: number, cleared: boolean): number {
  if (!cleared) return 0;
  const { star3 } = levelData.starThresholds;
  if (timeLeft >= star3) return 3;
  // 2★ = cleared within time limit (timeLeft >= 0)
  if (timeLeft >= 0) return 2;
  return 1;
}

export function applyPairScore(state: ScoreState): ScoreState {
  const newCombo = state.combo + 1;
  const gained = calcPairScore(newCombo);
  return {
    total: state.total + gained,
    combo: newCombo,
    pairsCompleted: state.pairsCompleted + 1,
  };
}

export function resetCombo(state: ScoreState): ScoreState {
  return { ...state, combo: 0 };
}
