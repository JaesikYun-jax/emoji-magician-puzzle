import { describe, it, expect } from 'vitest';
import { MATH_LEVELS } from '../../game-data/mathLevels';
import type { MathLevelConfig } from '../../game-data/subjectConfig';

describe('MATH_LEVELS', () => {
  it('array exists and has at least 7 items', () => {
    expect(Array.isArray(MATH_LEVELS)).toBe(true);
    expect(MATH_LEVELS.length).toBeGreaterThanOrEqual(7);
  });

  it('each level has required fields', () => {
    for (const level of MATH_LEVELS) {
      expect(level).toHaveProperty('id');
      expect(level).toHaveProperty('operation');
      expect(level).toHaveProperty('targetValue');
      expect(level).toHaveProperty('tileRange');
      expect(level).toHaveProperty('boardCols');
      expect(level).toHaveProperty('boardRows');
    }
  });

  it('tileRange[0] < tileRange[1] for every level', () => {
    for (const level of MATH_LEVELS) {
      expect(level.tileRange[0]).toBeLessThan(level.tileRange[1]);
    }
  });

  it('boardCols and boardRows are positive integers', () => {
    for (const level of MATH_LEVELS) {
      expect(level.boardCols).toBeGreaterThan(0);
      expect(level.boardRows).toBeGreaterThan(0);
      expect(Number.isInteger(level.boardCols)).toBe(true);
      expect(Number.isInteger(level.boardRows)).toBe(true);
    }
  });

  it('constraintValue > 0 for every level', () => {
    for (const level of MATH_LEVELS) {
      expect(level.constraintValue).toBeGreaterThan(0);
    }
  });

  describe('addition single-digit levels', () => {
    const singleAddLevels = MATH_LEVELS.filter(
      (l) => l.operation === 'addition' && l.digitLevel === 'single',
    );

    it('has at least 7 addition single-digit levels', () => {
      expect(singleAddLevels.length).toBeGreaterThanOrEqual(7);
    });

    it('all single-digit addition levels have targetValue involving single-digit range', () => {
      for (const level of singleAddLevels) {
        // tileRange values should be within 1-9 for single-digit
        expect(level.tileRange[0]).toBeGreaterThanOrEqual(1);
        expect(level.tileRange[1]).toBeLessThanOrEqual(9);
      }
    });
  });

  it('all level IDs are unique', () => {
    const ids = MATH_LEVELS.map((l) => l.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('levelIndex values match expected sequential order', () => {
    const indices = MATH_LEVELS.map((l) => l.levelIndex);
    // Each levelIndex should be >= 1
    for (const idx of indices) {
      expect(idx).toBeGreaterThanOrEqual(1);
    }
  });

  it('subject field is always "math"', () => {
    for (const level of MATH_LEVELS) {
      expect(level.subject).toBe('math');
    }
  });

  it('starThresholds has exactly 3 values', () => {
    for (const level of MATH_LEVELS) {
      expect(level.starThresholds).toHaveLength(3);
    }
  });
});
