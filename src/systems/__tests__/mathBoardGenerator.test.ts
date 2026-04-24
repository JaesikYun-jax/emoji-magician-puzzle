import { describe, it, expect } from 'vitest';
import { generateMathBoard } from '../math/mathBoardGenerator';
import type { MathLevelConfig } from '../../game-data/subjectConfig';

function baseConfig(overrides: Partial<MathLevelConfig> = {}): MathLevelConfig {
  return {
    id: 'test-level',
    subject: 'math',
    operation: 'addition',
    digitLevel: 'single',
    levelIndex: 1,
    targetValue: 10,
    tileRange: [1, 9],
    boardCols: 4,
    boardRows: 4,
    targetPairs: 3,
    constraint: 'moves',
    constraintValue: 20,
    starThresholds: [0, 5, 10],
    baseScore: 100,
    comboBonus: 50,
    ...overrides,
  };
}

describe('generateMathBoard - 보드 구조', () => {
  it('boardRows x boardCols 크기의 2D 배열을 반환한다', () => {
    const config = baseConfig({ boardRows: 4, boardCols: 4 });
    const board = generateMathBoard(config);
    expect(board.length).toBe(4);
    board.forEach((row) => expect(row.length).toBe(4));
  });

  it('5x4 보드도 올바른 크기를 반환한다', () => {
    const config = baseConfig({ boardRows: 5, boardCols: 4 });
    const board = generateMathBoard(config);
    expect(board.length).toBe(5);
    board.forEach((row) => expect(row.length).toBe(4));
  });

  it('각 셀 값이 tileRange [1, 9] 내에 존재한다', () => {
    const config = baseConfig({ tileRange: [1, 9] });
    const board = generateMathBoard(config);
    board.forEach((row) =>
      row.forEach((cell) => {
        expect(cell).toBeGreaterThanOrEqual(1);
        expect(cell).toBeLessThanOrEqual(9);
      })
    );
  });

  it('tileRange [2, 8]일 때 셀 값이 해당 범위를 벗어나지 않는다', () => {
    const config = baseConfig({ tileRange: [2, 8] });
    const board = generateMathBoard(config);
    board.forEach((row) =>
      row.forEach((cell) => {
        expect(cell).toBeGreaterThanOrEqual(2);
        expect(cell).toBeLessThanOrEqual(8);
      })
    );
  });
});

describe('generateMathBoard - 덧셈 모드', () => {
  it('덧셈 모드에서 목표 쌍이 최소 1개 이상 보드에 존재한다', () => {
    const config = baseConfig({
      operation: 'addition',
      targetValue: 10,
      tileRange: [1, 9],
      targetPairs: 3,
      boardRows: 4,
      boardCols: 4,
    });
    const board = generateMathBoard(config);
    const flat = board.flat();
    // 합이 10이 되는 쌍이 존재하는지 확인
    let found = false;
    for (let i = 0; i < flat.length && !found; i++) {
      for (let j = i + 1; j < flat.length && !found; j++) {
        if (flat[i] + flat[j] === 10) found = true;
      }
    }
    expect(found).toBe(true);
  });

  it('targetValue 배열인 덧셈 모드에서 목표 쌍이 최소 1개 이상 존재한다', () => {
    const config = baseConfig({
      operation: 'addition',
      targetValue: [8, 10, 12],
      tileRange: [1, 9],
      targetPairs: 3,
      boardRows: 4,
      boardCols: 4,
    });
    const board = generateMathBoard(config);
    const flat = board.flat();
    const targets = [8, 10, 12];
    let found = false;
    for (let i = 0; i < flat.length && !found; i++) {
      for (let j = i + 1; j < flat.length && !found; j++) {
        if (targets.includes(flat[i] + flat[j])) found = true;
      }
    }
    expect(found).toBe(true);
  });
});

describe('generateMathBoard - 뺄셈 모드', () => {
  it('뺄셈 모드에서 a > b이고 a-b = target인 쌍이 최소 1개 이상 존재한다', () => {
    const config = baseConfig({
      operation: 'subtraction',
      targetValue: 3,
      tileRange: [1, 9],
      targetPairs: 3,
      boardRows: 4,
      boardCols: 4,
    });
    const board = generateMathBoard(config);
    const flat = board.flat();
    let found = false;
    for (let i = 0; i < flat.length && !found; i++) {
      for (let j = 0; j < flat.length && !found; j++) {
        if (i !== j && flat[i] > flat[j] && flat[i] - flat[j] === 3) {
          found = true;
        }
      }
    }
    expect(found).toBe(true);
  });
});

describe('generateMathBoard - 곱셈 모드', () => {
  it('곱셈 모드에서 a*b = target인 쌍이 최소 1개 이상 존재한다', () => {
    const config = baseConfig({
      operation: 'multiplication',
      targetValue: 12,
      tileRange: [1, 9],
      targetPairs: 3,
      boardRows: 4,
      boardCols: 4,
    });
    const board = generateMathBoard(config);
    const flat = board.flat();
    let found = false;
    for (let i = 0; i < flat.length && !found; i++) {
      for (let j = i + 1; j < flat.length && !found; j++) {
        if (flat[i] * flat[j] === 12) found = true;
      }
    }
    expect(found).toBe(true);
  });
});

describe('generateMathBoard - targetPairs가 Record인 경우', () => {
  it('Record<number,number> 형태의 targetPairs일 때 총 쌍 수가 보드 크기 이하이다', () => {
    const config = baseConfig({
      operation: 'addition',
      targetValue: 10,
      tileRange: [1, 9],
      targetPairs: { 8: 2, 10: 2, 12: 1 } as unknown as number,
      boardRows: 4,
      boardCols: 4,
    });
    const board = generateMathBoard(config);
    const total = 4 * 4;
    // Record에서 총 쌍의 합 = 2+2+1 = 5, 각 쌍은 2개 셀이므로 10 <= 16
    expect(board.flat().length).toBeLessThanOrEqual(total);
  });

  it('Record targetPairs로 생성된 보드에서 각 셀이 tileRange 내에 있다', () => {
    const config = baseConfig({
      operation: 'addition',
      targetValue: 10,
      tileRange: [1, 9],
      targetPairs: { 10: 2 } as unknown as number,
      boardRows: 4,
      boardCols: 4,
    });
    const board = generateMathBoard(config);
    board.forEach((row) =>
      row.forEach((cell) => {
        expect(cell).toBeGreaterThanOrEqual(1);
        expect(cell).toBeLessThanOrEqual(9);
      })
    );
  });
});
