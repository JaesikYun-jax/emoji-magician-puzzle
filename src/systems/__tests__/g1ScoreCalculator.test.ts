import { describe, it, expect } from 'vitest';
import {
  calcPairScore,
  calcTimeBonus,
  calcStars,
  applyPairScore,
  resetCombo,
} from '../g1ScoreCalculator';
import { G1_LEVELS } from '@/game-data/g1Levels';

const level1 = G1_LEVELS[0];
const level2 = G1_LEVELS[1];
const level3 = G1_LEVELS[2];

describe('calcPairScore', () => {
  it('returns 100 for first pair (combo=1)', () => {
    expect(calcPairScore(1)).toBe(100);
  });
  it('returns 150 for combo 2', () => {
    expect(calcPairScore(2)).toBe(150);
  });
  it('returns 200 for combo 3', () => {
    expect(calcPairScore(3)).toBe(200);
  });
  it('returns 250 for combo 4+', () => {
    expect(calcPairScore(4)).toBe(250);
    expect(calcPairScore(10)).toBe(250);
  });
});

describe('calcTimeBonus', () => {
  it('is timeLeft * 10', () => {
    expect(calcTimeBonus(30)).toBe(300);
    expect(calcTimeBonus(0)).toBe(0);
    expect(calcTimeBonus(-5)).toBe(0);
  });
});

describe('calcStars', () => {
  it('returns 0 if not cleared', () => {
    expect(calcStars(level1, 50, false)).toBe(0);
  });
  it('level 1: 3 stars when timeLeft >= 45', () => {
    expect(calcStars(level1, 45, true)).toBe(3);
    expect(calcStars(level1, 50, true)).toBe(3);
  });
  it('level 1: 2 stars when cleared with time remaining but < 45s', () => {
    expect(calcStars(level1, 10, true)).toBe(2);
    expect(calcStars(level1, 0, true)).toBe(2);
  });
  it('level 2: 3 stars when timeLeft >= 40', () => {
    expect(calcStars(level2, 40, true)).toBe(3);
  });
  it('level 3: 3 stars when timeLeft >= 35', () => {
    expect(calcStars(level3, 35, true)).toBe(3);
  });
});

describe('applyPairScore', () => {
  it('increments combo and pairsCompleted', () => {
    const state = { total: 0, combo: 0, pairsCompleted: 0 };
    const next = applyPairScore(state);
    expect(next.combo).toBe(1);
    expect(next.pairsCompleted).toBe(1);
    expect(next.total).toBe(100);
  });

  it('applies combo bonus on consecutive pairs', () => {
    let state = { total: 0, combo: 0, pairsCompleted: 0 };
    state = applyPairScore(state); // combo 1 → +100
    state = applyPairScore(state); // combo 2 → +150
    expect(state.total).toBe(250);
    expect(state.combo).toBe(2);
  });
});

describe('resetCombo', () => {
  it('resets combo to 0', () => {
    const state = { total: 500, combo: 4, pairsCompleted: 5 };
    const next = resetCombo(state);
    expect(next.combo).toBe(0);
    expect(next.total).toBe(500);
    expect(next.pairsCompleted).toBe(5);
  });
});
