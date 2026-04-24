import { describe, it, expect } from 'vitest';
import { judgePair, isSumTen } from '../g1PairJudge';

describe('isSumTen', () => {
  it('returns true for pairs that sum to 10', () => {
    expect(isSumTen(1, 9)).toBe(true);
    expect(isSumTen(2, 8)).toBe(true);
    expect(isSumTen(3, 7)).toBe(true);
    expect(isSumTen(4, 6)).toBe(true);
    expect(isSumTen(5, 5)).toBe(true);
    expect(isSumTen(9, 1)).toBe(true);
  });

  it('returns false for non-pairs', () => {
    expect(isSumTen(1, 1)).toBe(false);
    expect(isSumTen(5, 6)).toBe(false);
    expect(isSumTen(3, 3)).toBe(false);
  });
});

describe('judgePair', () => {
  it('returns correct for sum-10 pairs', () => {
    expect(judgePair(1, 9)).toBe('correct');
    expect(judgePair(4, 6)).toBe('correct');
    expect(judgePair(5, 5)).toBe('correct');
  });

  it('returns wrong for non-pairs', () => {
    expect(judgePair(1, 2)).toBe('wrong');
    expect(judgePair(5, 4)).toBe('wrong');
    expect(judgePair(9, 9)).toBe('wrong');
  });
});
