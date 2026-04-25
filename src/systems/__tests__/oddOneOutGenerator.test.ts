import { describe, it, expect } from 'vitest';
import { generateOddOneOutProblem, calcOddOneOutStars } from '../logic/oddOneOutGenerator';
import type { OddOneOutLevelConfig } from '../logic/oddOneOutTypes';

const baseConfig: OddOneOutLevelConfig = {
  id: 'test-odd-1',
  subject: 'logic',
  gameType: 'odd-one-out',
  difficultyLevel: 1,
  shapeCount: 4,
  totalRounds: 5,
  timeLimit: null,
  allowedOddReasons: ['color'],
  starThresholds: [3, 4, 5],
};

describe('generateOddOneOutProblem', () => {
  it('generates correct number of shapes', () => {
    const p = generateOddOneOutProblem(baseConfig, 42);
    expect(p.shapes).toHaveLength(4);
  });

  it('oddIndex is valid', () => {
    const p = generateOddOneOutProblem(baseConfig, 42);
    expect(p.oddIndex).toBeGreaterThanOrEqual(0);
    expect(p.oddIndex).toBeLessThan(p.shapes.length);
  });

  it('odd shape has different color from others when reason is color', () => {
    const p = generateOddOneOutProblem(baseConfig, 42);
    expect(p.oddReason).toBe('color');
    const odd = p.shapes[p.oddIndex];
    const others = p.shapes.filter((_, i) => i !== p.oddIndex);
    expect(others.every(s => s.color !== odd.color)).toBe(true);
  });

  it('all non-odd shapes share same base color', () => {
    const p = generateOddOneOutProblem(baseConfig, 42);
    const others = p.shapes.filter((_, i) => i !== p.oddIndex);
    const firstColor = others[0].color;
    expect(others.every(s => s.color === firstColor)).toBe(true);
  });

  it('generates 5 shapes when shapeCount is 5', () => {
    const cfg5: OddOneOutLevelConfig = { ...baseConfig, shapeCount: 5 };
    const p = generateOddOneOutProblem(cfg5, 1);
    expect(p.shapes).toHaveLength(5);
  });

  it('returns an id string', () => {
    const p = generateOddOneOutProblem(baseConfig, 42);
    expect(typeof p.id).toBe('string');
    expect(p.id.length).toBeGreaterThan(0);
  });

  it('returns difficultyLevel from config', () => {
    const p = generateOddOneOutProblem(baseConfig, 42);
    expect(p.difficultyLevel).toBe(1);
  });

  it('all shapes have required attributes', () => {
    const p = generateOddOneOutProblem(baseConfig, 42);
    for (const shape of p.shapes) {
      expect(shape).toHaveProperty('shape');
      expect(shape).toHaveProperty('color');
      expect(shape).toHaveProperty('size');
      expect(shape).toHaveProperty('fill');
      expect(shape).toHaveProperty('rotation');
      expect(shape).toHaveProperty('chirality');
    }
  });

  it('odd shape has different shape from others when reason is shape', () => {
    const cfgShape: OddOneOutLevelConfig = {
      ...baseConfig,
      allowedOddReasons: ['shape'],
    };
    const p = generateOddOneOutProblem(cfgShape, 7);
    expect(p.oddReason).toBe('shape');
    const odd = p.shapes[p.oddIndex];
    const others = p.shapes.filter((_, i) => i !== p.oddIndex);
    expect(others.every(s => s.shape !== odd.shape)).toBe(true);
  });

  it('odd shape has different size when reason is size', () => {
    const cfgSize: OddOneOutLevelConfig = {
      ...baseConfig,
      allowedOddReasons: ['size'],
    };
    const p = generateOddOneOutProblem(cfgSize, 3);
    expect(p.oddReason).toBe('size');
    const odd = p.shapes[p.oddIndex];
    const others = p.shapes.filter((_, i) => i !== p.oddIndex);
    expect(others.every(s => s.size !== odd.size)).toBe(true);
  });

  it('odd shape has different fill when reason is fill', () => {
    const cfgFill: OddOneOutLevelConfig = {
      ...baseConfig,
      allowedOddReasons: ['fill'],
    };
    const p = generateOddOneOutProblem(cfgFill, 5);
    expect(p.oddReason).toBe('fill');
    const odd = p.shapes[p.oddIndex];
    const others = p.shapes.filter((_, i) => i !== p.oddIndex);
    expect(others.every(s => s.fill !== odd.fill)).toBe(true);
  });

  it('odd shape has chirality mirrored when reason is chirality', () => {
    const cfgChirality: OddOneOutLevelConfig = {
      ...baseConfig,
      allowedOddReasons: ['chirality'],
    };
    const p = generateOddOneOutProblem(cfgChirality, 9);
    expect(p.oddReason).toBe('chirality');
    const odd = p.shapes[p.oddIndex];
    expect(odd.chirality).toBe('mirrored');
    const others = p.shapes.filter((_, i) => i !== p.oddIndex);
    expect(others.every(s => s.chirality === 'normal')).toBe(true);
  });

  it('odd shape rotation is 45 or 135 when reason is rotation', () => {
    const cfgRotation: OddOneOutLevelConfig = {
      ...baseConfig,
      allowedOddReasons: ['rotation'],
    };
    const p = generateOddOneOutProblem(cfgRotation, 11);
    expect(p.oddReason).toBe('rotation');
    const odd = p.shapes[p.oddIndex];
    expect([45, 135]).toContain(odd.rotation);
  });

  it('is deterministic with same seed', () => {
    const p1 = generateOddOneOutProblem(baseConfig, 77);
    const p2 = generateOddOneOutProblem(baseConfig, 77);
    expect(p1.oddIndex).toBe(p2.oddIndex);
    expect(p1.oddReason).toBe(p2.oddReason);
    expect(JSON.stringify(p1.shapes)).toBe(JSON.stringify(p2.shapes));
  });

  it('generates without seed (random)', () => {
    const p = generateOddOneOutProblem(baseConfig);
    expect(p.shapes).toHaveLength(4);
    expect(p.oddIndex).toBeGreaterThanOrEqual(0);
  });

  it('oddReason is within allowedOddReasons', () => {
    const cfgMulti: OddOneOutLevelConfig = {
      ...baseConfig,
      allowedOddReasons: ['color', 'shape', 'size'],
    };
    // 여러 시드로 실행해 oddReason이 항상 허용 범위 내인지 확인
    for (let seed = 1; seed <= 10; seed++) {
      const p = generateOddOneOutProblem(cfgMulti, seed);
      expect(cfgMulti.allowedOddReasons).toContain(p.oddReason);
    }
  });
});

describe('calcOddOneOutStars', () => {
  it('returns 0 stars below first threshold', () => {
    expect(calcOddOneOutStars(2, [3, 4, 5])).toBe(0);
  });

  it('returns 1 star at first threshold', () => {
    expect(calcOddOneOutStars(3, [3, 4, 5])).toBe(1);
  });

  it('returns 2 stars at second threshold', () => {
    expect(calcOddOneOutStars(4, [3, 4, 5])).toBe(2);
  });

  it('returns 3 stars at third threshold', () => {
    expect(calcOddOneOutStars(5, [3, 4, 5])).toBe(3);
  });

  it('returns 3 stars for score above third threshold', () => {
    expect(calcOddOneOutStars(10, [3, 4, 5])).toBe(3);
  });

  it('returns 0 for zero score', () => {
    expect(calcOddOneOutStars(0, [1, 2, 3])).toBe(0);
  });

  it('returns 0 stars when score equals 0 with threshold [3,4,5]', () => {
    expect(calcOddOneOutStars(0, [3, 4, 5])).toBe(0);
  });

  it('boundary: score just below first threshold returns 0', () => {
    expect(calcOddOneOutStars(2, [3, 4, 5])).toBe(0);
  });

  it('boundary: score exactly at second threshold returns 2', () => {
    expect(calcOddOneOutStars(4, [3, 4, 5])).toBe(2);
  });
});
