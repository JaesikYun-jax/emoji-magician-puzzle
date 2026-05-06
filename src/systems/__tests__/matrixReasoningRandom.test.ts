import { describe, it, expect } from 'vitest';
import { makeLcg, shuffleWith, pickWith, differentValue, pickN } from '../logic/matrixReasoningRandom';

describe('makeLcg', () => {
  it('produces deterministic sequence for same seed', () => {
    const r1 = makeLcg(42);
    const r2 = makeLcg(42);
    expect(r1()).toBe(r2());
    expect(r1()).toBe(r2());
    expect(r1()).toBe(r2());
  });

  it('produces values in [0,1)', () => {
    const r = makeLcg(1);
    for (let i = 0; i < 100; i++) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('produces different sequence for different seed', () => {
    const r1 = makeLcg(1);
    const r2 = makeLcg(2);
    expect(r1()).not.toBe(r2());
  });
});

describe('shuffleWith', () => {
  it('preserves length', () => {
    const r = makeLcg(7);
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleWith(arr, r)).toHaveLength(5);
  });

  it('preserves elements', () => {
    const r = makeLcg(7);
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleWith(arr, r);
    expect([...shuffled].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate original', () => {
    const r = makeLcg(7);
    const arr = [1, 2, 3];
    const original = [...arr];
    shuffleWith(arr, r);
    expect(arr).toEqual(original);
  });

  it('is deterministic for same seed', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const s1 = shuffleWith(arr, makeLcg(99));
    const s2 = shuffleWith(arr, makeLcg(99));
    expect(s1).toEqual(s2);
  });
});

describe('pickWith', () => {
  it('returns an element from the array', () => {
    const r = makeLcg(13);
    const arr = ['x', 'y', 'z'];
    expect(arr).toContain(pickWith(arr, r));
  });
});

describe('differentValue', () => {
  it('returns a value different from current', () => {
    const r = makeLcg(5);
    const pool = [1, 2, 3, 4];
    for (let i = 0; i < 20; i++) {
      expect(differentValue(pool, 2, r)).not.toBe(2);
    }
  });

  it('returns current when no alternatives exist', () => {
    const r = makeLcg(5);
    expect(differentValue([7], 7, r)).toBe(7);
  });
});

describe('pickN', () => {
  it('returns n elements', () => {
    const r = makeLcg(3);
    expect(pickN([1, 2, 3, 4, 5], 3, r)).toHaveLength(3);
  });

  it('returns subset of original', () => {
    const r = makeLcg(3);
    const result = pickN([1, 2, 3, 4, 5], 3, r);
    for (const v of result) {
      expect([1, 2, 3, 4, 5]).toContain(v);
    }
  });

  it('cycles to fill when n > arr.length', () => {
    const r = makeLcg(3);
    const result = pickN([1, 2], 5, r);
    expect(result).toHaveLength(5);
    for (const v of result) expect([1, 2]).toContain(v);
  });

  it('returns empty for empty input', () => {
    const r = makeLcg(3);
    expect(pickN([], 5, r)).toEqual([]);
  });

  it('cycles a single-element array to gridSize', () => {
    // 회귀: matrix-1처럼 categories.length=1, gridSize=2일 때 안전해야 함
    const r = makeLcg(3);
    const result = pickN(['fruit'], 3, r);
    expect(result).toEqual(['fruit', 'fruit', 'fruit']);
  });
});
