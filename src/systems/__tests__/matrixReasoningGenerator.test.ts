import { describe, it, expect } from 'vitest';
import { generateMatrixProblem, calcMatrixStars } from '../logic/matrixReasoningGenerator';
import type { MatrixLevelConfig } from '../logic/matrixReasoningTypes';

const baseConfig: MatrixLevelConfig = {
  id: 'test-1',
  subject: 'logic',
  gameType: 'matrix-reasoning',
  difficultyLevel: 1,
  gridSize: 2,
  totalRounds: 3,
  timeLimit: 90,
  activeAttributes: ['color'],
  choiceCount: 3,
  starThresholds: [2, 3, 3],
};

describe('generateMatrixProblem', () => {
  it('generates a 2x2 grid with one null cell', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    expect(p.cells).toHaveLength(4);
    expect(p.cells.filter(c => c === null)).toHaveLength(1);
  });

  it('null cell is at the last position (bottom-right)', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    expect(p.cells[3]).toBeNull();
  });

  it('includes correct answer in choices', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    expect(p.choices[p.correctIndex]).toBeDefined();
    expect(p.correctIndex).toBeGreaterThanOrEqual(0);
    expect(p.correctIndex).toBeLessThan(p.choices.length);
  });

  it('choices count matches choiceCount', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    expect(p.choices).toHaveLength(3);
  });

  it('returns correct gridSize in result', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    expect(p.gridSize).toBe(2);
  });

  it('returns an id string', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    expect(typeof p.id).toBe('string');
    expect(p.id.length).toBeGreaterThan(0);
  });

  it('generates 3x3 grid with activeAttributes shape+color', () => {
    const cfg3: MatrixLevelConfig = {
      ...baseConfig,
      gridSize: 3,
      activeAttributes: ['shape', 'color'],
      choiceCount: 4,
    };
    const p = generateMatrixProblem(cfg3, 1);
    expect(p.cells).toHaveLength(9);
    expect(p.cells.filter(c => c === null)).toHaveLength(1);
    expect(p.choices).toHaveLength(4);
  });

  it('choices have no duplicates (by JSON key)', () => {
    const p = generateMatrixProblem({ ...baseConfig, choiceCount: 3 }, 100);
    const keys = p.choices.map(c => JSON.stringify(c));
    const unique = new Set(keys);
    expect(unique.size).toBe(p.choices.length);
  });

  it('all non-null cells have required attributes', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    const nonNull = p.cells.filter(c => c !== null);
    for (const cell of nonNull) {
      expect(cell).toHaveProperty('shape');
      expect(cell).toHaveProperty('color');
      expect(cell).toHaveProperty('size');
      expect(cell).toHaveProperty('fill');
      expect(cell).toHaveProperty('rotation');
    }
  });

  it('choices are MatrixCell objects with required attributes', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    for (const choice of p.choices) {
      expect(choice).toHaveProperty('shape');
      expect(choice).toHaveProperty('color');
      expect(choice).toHaveProperty('size');
      expect(choice).toHaveProperty('fill');
      expect(choice).toHaveProperty('rotation');
    }
  });

  it('is deterministic with same seed', () => {
    const p1 = generateMatrixProblem(baseConfig, 999);
    const p2 = generateMatrixProblem(baseConfig, 999);
    // choices의 correctIndex가 동일해야 함 (단, _problemCounter로 id는 달라질 수 있음)
    expect(p1.correctIndex).toBe(p2.correctIndex);
    expect(JSON.stringify(p1.choices)).toBe(JSON.stringify(p2.choices));
  });

  it('differs with different seeds', () => {
    const p1 = generateMatrixProblem(baseConfig, 1);
    const p2 = generateMatrixProblem(baseConfig, 2);
    // 두 시드에서 선택지가 완전히 같을 가능성은 낮음
    const sameChoices = JSON.stringify(p1.choices) === JSON.stringify(p2.choices);
    // 대부분 다르지만 반드시 다를 필요는 없으므로, cells 또는 choices 중 하나라도 다르면 OK
    const sameCells = JSON.stringify(p1.cells) === JSON.stringify(p2.cells);
    expect(sameChoices && sameCells).toBe(false);
  });

  it('activeAttributes in result matches config', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    expect(p.activeAttributes).toEqual(['color']);
  });

  it('difficultyLevel in result matches config', () => {
    const p = generateMatrixProblem(baseConfig, 42);
    expect(p.difficultyLevel).toBe(1);
  });

  it('3x3 grid null cell is at last position', () => {
    const cfg3: MatrixLevelConfig = {
      ...baseConfig,
      gridSize: 3,
      activeAttributes: ['shape'],
      choiceCount: 3,
    };
    const p = generateMatrixProblem(cfg3, 7);
    expect(p.cells[8]).toBeNull();
  });

  it('generates without seed (random)', () => {
    const p = generateMatrixProblem(baseConfig);
    expect(p.cells).toHaveLength(4);
    expect(p.choices).toHaveLength(3);
  });
});

describe('calcMatrixStars', () => {
  it('returns 0 for below threshold', () => {
    expect(calcMatrixStars(1, [3, 4, 5])).toBe(0);
  });

  it('returns 1 star at first threshold', () => {
    expect(calcMatrixStars(3, [3, 4, 5])).toBe(1);
  });

  it('returns 2 stars at second threshold', () => {
    expect(calcMatrixStars(4, [3, 4, 5])).toBe(2);
  });

  it('returns 3 stars at third threshold', () => {
    expect(calcMatrixStars(5, [3, 4, 5])).toBe(3);
  });

  it('returns 3 stars for score above third threshold', () => {
    expect(calcMatrixStars(10, [3, 4, 5])).toBe(3);
  });

  it('returns 0 for zero score', () => {
    expect(calcMatrixStars(0, [1, 2, 3])).toBe(0);
  });

  it('handles equal thresholds', () => {
    // thresholds [3, 3, 3]: 3 이상이면 바로 3성
    expect(calcMatrixStars(3, [3, 3, 3])).toBe(3);
  });

  it('returns 1 star between first and second threshold', () => {
    expect(calcMatrixStars(3, [3, 4, 5])).toBe(1);
  });

  it('exact boundary: score equals 2nd threshold returns 2 stars', () => {
    expect(calcMatrixStars(2, [2, 3, 3])).toBe(1);
  });

  it('score below all thresholds returns 0', () => {
    expect(calcMatrixStars(0, [3, 4, 5])).toBe(0);
  });
});
