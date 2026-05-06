import { describe, it, expect } from 'vitest';
import { generateMatrixProblem, calcMatrixStars } from '../logic/matrixReasoningGenerator';
import type { MatrixLevelConfig } from '../logic/matrixReasoningTypes';

const emojiCfg: MatrixLevelConfig = {
  id: 'test-emoji',
  subject: 'logic',
  gameType: 'matrix-reasoning',
  difficultyLevel: 1,
  cellKind: 'emoji',
  gridSize: 2,
  totalRounds: 5,
  timeLimit: 90,
  choiceCount: 3,
  starThresholds: [3, 4, 5],
  emojiOpts: { patterns: ['category-cycle'], categories: ['fruit', 'animal'] },
};

const numberCfg: MatrixLevelConfig = {
  id: 'test-number',
  subject: 'logic',
  gameType: 'matrix-reasoning',
  difficultyLevel: 2,
  cellKind: 'number',
  gridSize: 3,
  totalRounds: 5,
  timeLimit: 120,
  choiceCount: 4,
  starThresholds: [3, 4, 5],
  numberOpts: { patterns: ['arith-row'], valueRange: [1, 30] },
};

const setcardCfg: MatrixLevelConfig = {
  id: 'test-setcard',
  subject: 'logic',
  gameType: 'matrix-reasoning',
  difficultyLevel: 3,
  cellKind: 'setcard',
  gridSize: 3,
  totalRounds: 5,
  timeLimit: 150,
  choiceCount: 4,
  starThresholds: [3, 4, 5],
  setcardOpts: { activeAttributeCount: 2 },
};

describe('generateMatrixProblem dispatcher', () => {
  it('dispatches emoji cellKind', () => {
    const p = generateMatrixProblem(emojiCfg, 42);
    expect(p.cellKind).toBe('emoji');
    for (const c of p.cells) if (c !== null) expect(c.kind).toBe('emoji');
  });

  it('dispatches number cellKind', () => {
    const p = generateMatrixProblem(numberCfg, 42);
    expect(p.cellKind).toBe('number');
    for (const c of p.cells) if (c !== null) expect(c.kind).toBe('number');
  });

  it('dispatches setcard cellKind', () => {
    const p = generateMatrixProblem(setcardCfg, 42);
    expect(p.cellKind).toBe('setcard');
    for (const c of p.cells) if (c !== null) expect(c.kind).toBe('setcard');
  });

  it('seed-based determinism for emoji', () => {
    const p1 = generateMatrixProblem(emojiCfg, 99);
    const p2 = generateMatrixProblem(emojiCfg, 99);
    expect(p1.correctIndex).toBe(p2.correctIndex);
    expect(JSON.stringify(p1.cells)).toBe(JSON.stringify(p2.cells));
  });

  it('seed-based determinism for number', () => {
    const p1 = generateMatrixProblem(numberCfg, 99);
    const p2 = generateMatrixProblem(numberCfg, 99);
    expect(p1.correctIndex).toBe(p2.correctIndex);
    expect(JSON.stringify(p1.cells)).toBe(JSON.stringify(p2.cells));
  });

  it('seed-based determinism for setcard', () => {
    const p1 = generateMatrixProblem(setcardCfg, 99);
    const p2 = generateMatrixProblem(setcardCfg, 99);
    expect(p1.correctIndex).toBe(p2.correctIndex);
    expect(JSON.stringify(p1.cells)).toBe(JSON.stringify(p2.cells));
  });

  it('produces problems without seed (random)', () => {
    const p = generateMatrixProblem(emojiCfg);
    expect(p.cells).toHaveLength(4);
    expect(p.choices).toHaveLength(3);
  });

  it('difficultyLevel propagates from config to problem', () => {
    expect(generateMatrixProblem(emojiCfg, 1).difficultyLevel).toBe(1);
    expect(generateMatrixProblem(numberCfg, 1).difficultyLevel).toBe(2);
    expect(generateMatrixProblem(setcardCfg, 1).difficultyLevel).toBe(3);
  });
});

describe('calcMatrixStars', () => {
  it('returns 0 below first threshold', () => {
    expect(calcMatrixStars(1, [3, 4, 5])).toBe(0);
  });

  it('returns 1 at first threshold', () => {
    expect(calcMatrixStars(3, [3, 4, 5])).toBe(1);
  });

  it('returns 2 at second threshold', () => {
    expect(calcMatrixStars(4, [3, 4, 5])).toBe(2);
  });

  it('returns 3 at third threshold', () => {
    expect(calcMatrixStars(5, [3, 4, 5])).toBe(3);
  });

  it('returns 3 above third threshold', () => {
    expect(calcMatrixStars(10, [3, 4, 5])).toBe(3);
  });

  it('zero score returns 0', () => {
    expect(calcMatrixStars(0, [1, 2, 3])).toBe(0);
  });

  it('handles equal thresholds', () => {
    expect(calcMatrixStars(3, [3, 3, 3])).toBe(3);
  });

  it('returns 1 between first and second threshold', () => {
    expect(calcMatrixStars(3, [3, 4, 5])).toBe(1);
  });
});
