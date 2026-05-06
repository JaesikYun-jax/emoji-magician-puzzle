import { describe, it, expect } from 'vitest';
import { generateNumberProblem } from '../logic/matrixReasoningNumberGenerator';
import { makeLcg } from '../logic/matrixReasoningRandom';
import type { NumberCell, NumberPatternKind, MatrixLevelConfig } from '../logic/matrixReasoningTypes';

function baseCfg(overrides: Partial<MatrixLevelConfig> = {}): MatrixLevelConfig {
  return {
    id: 'test-num',
    subject: 'logic',
    gameType: 'matrix-reasoning',
    difficultyLevel: 2,
    cellKind: 'number',
    gridSize: 3,
    totalRounds: 5,
    timeLimit: 120,
    choiceCount: 4,
    starThresholds: [3, 4, 5],
    numberOpts: {
      patterns: ['arith-row'],
      valueRange: [1, 30],
    },
    ...overrides,
  };
}

const PATTERNS: NumberPatternKind[] = [
  'arith-row',
  'arith-col',
  'arith-both',
  'multiplication',
  'sum-corner',
  'geometric',
];

describe('generateNumberProblem — basics', () => {
  for (const pat of PATTERNS) {
    it(`pattern=${pat}: cells length 9`, () => {
      const cfg = baseCfg({ numberOpts: { patterns: [pat], valueRange: [1, 99] } });
      const p = generateNumberProblem(cfg, makeLcg(42));
      expect(p.cells).toHaveLength(9);
    });

    it(`pattern=${pat}: last cell null`, () => {
      const cfg = baseCfg({ numberOpts: { patterns: [pat], valueRange: [1, 99] } });
      const p = generateNumberProblem(cfg, makeLcg(42));
      expect(p.cells[8]).toBeNull();
    });

    it(`pattern=${pat}: choices length matches choiceCount`, () => {
      const cfg = baseCfg({ choiceCount: 4, numberOpts: { patterns: [pat], valueRange: [1, 99] } });
      const p = generateNumberProblem(cfg, makeLcg(42));
      expect(p.choices).toHaveLength(4);
    });

    it(`pattern=${pat}: all cells are number cells`, () => {
      const cfg = baseCfg({ numberOpts: { patterns: [pat], valueRange: [1, 99] } });
      const p = generateNumberProblem(cfg, makeLcg(42));
      for (const c of p.cells) {
        if (c !== null) expect(c.kind).toBe('number');
      }
      for (const c of p.choices) expect(c.kind).toBe('number');
    });

    it(`pattern=${pat}: all values are positive integers`, () => {
      const cfg = baseCfg({ numberOpts: { patterns: [pat], valueRange: [1, 99] } });
      const p = generateNumberProblem(cfg, makeLcg(42));
      for (const c of p.cells) {
        if (c !== null) {
          const nc = c as NumberCell;
          expect(Number.isInteger(nc.value)).toBe(true);
          expect(nc.value).toBeGreaterThanOrEqual(0);
        }
      }
      for (const c of p.choices) {
        const nc = c as NumberCell;
        expect(Number.isInteger(nc.value)).toBe(true);
        expect(nc.value).toBeGreaterThanOrEqual(0);
      }
    });

    it(`pattern=${pat}: correctIndex valid`, () => {
      const cfg = baseCfg({ numberOpts: { patterns: [pat], valueRange: [1, 99] } });
      const p = generateNumberProblem(cfg, makeLcg(42));
      expect(p.correctIndex).toBeGreaterThanOrEqual(0);
      expect(p.correctIndex).toBeLessThan(p.choices.length);
    });

    it(`pattern=${pat}: choices have no duplicate values`, () => {
      const cfg = baseCfg({ numberOpts: { patterns: [pat], valueRange: [1, 99] } });
      const p = generateNumberProblem(cfg, makeLcg(42));
      const values = p.choices.map(c => (c as NumberCell).value);
      expect(new Set(values).size).toBe(values.length);
    });
  }

  it('cellKind is number', () => {
    const p = generateNumberProblem(baseCfg(), makeLcg(1));
    expect(p.cellKind).toBe('number');
  });

  it('throws when numberOpts missing', () => {
    const cfg = baseCfg();
    delete cfg.numberOpts;
    expect(() => generateNumberProblem(cfg, makeLcg(1))).toThrow();
  });

  it('throws when gridSize !== 3', () => {
    const cfg = baseCfg({ gridSize: 2 });
    expect(() => generateNumberProblem(cfg, makeLcg(1))).toThrow();
  });
});

describe('generateNumberProblem — arith-row pattern correctness', () => {
  it('answer = first cell of last row + 2*d', () => {
    const cfg = baseCfg({ numberOpts: { patterns: ['arith-row'], valueRange: [1, 99] } });
    const p = generateNumberProblem(cfg, makeLcg(42));
    const answer = p.choices[p.correctIndex] as NumberCell;
    const lastRowFirst = p.cells[6] as NumberCell;
    const lastRowSecond = p.cells[7] as NumberCell;
    const d = lastRowSecond.value - lastRowFirst.value;
    expect(answer.value).toBe(lastRowFirst.value + 2 * d);
  });
});

describe('generateNumberProblem — multiplication pattern correctness', () => {
  it('answer = (last cell of last row prev col / colFactor) * colFactor pattern', () => {
    const cfg = baseCfg({ numberOpts: { patterns: ['multiplication'], valueRange: [1, 99] } });
    const p = generateNumberProblem(cfg, makeLcg(123));
    const answer = p.choices[p.correctIndex] as NumberCell;
    // c[2,2] = rowF[2] * colF[2], c[2,1] = rowF[2] * colF[1], c[2,0] = rowF[2] * colF[0]
    // c[1,2] = rowF[1] * colF[2]
    const c20 = (p.cells[6] as NumberCell).value;
    const c21 = (p.cells[7] as NumberCell).value;
    const c02 = (p.cells[2] as NumberCell).value;
    const c12 = (p.cells[5] as NumberCell).value;
    // rowF[2]/rowF[0] = c20/c00, c00 != 0; check ratio invariant
    // 가장 단순한 검증: c20 * c02 / c00 === answer (행 2 × 열 2 = c20*c02/c00)
    const c00 = (p.cells[0] as NumberCell).value;
    if (c00 !== 0) {
      // rowFactor[2] = c20 / colFactor[0] = c20 * (rowFactor[0]/c00) = ...
      // 단순히 answer가 c20과 c02 비율로 일관되는지: answer/c20 == c02/c00
      expect(answer.value * c00).toBe(c20 * c02);
    }
    // 보조: answer/c21 = c12/c11
    const c11 = (p.cells[4] as NumberCell).value;
    if (c11 !== 0) {
      expect(answer.value * c11).toBe(c21 * c12);
    }
  });
});

describe('generateNumberProblem — sum-corner pattern correctness', () => {
  it('answer = c[2,1] + c[1,2] - c[1,1] (additive consistency)', () => {
    const cfg = baseCfg({ numberOpts: { patterns: ['sum-corner'], valueRange: [1, 40] } });
    const p = generateNumberProblem(cfg, makeLcg(42));
    const answer = p.choices[p.correctIndex] as NumberCell;
    // c[r,c] = rowVal[r] + colVal[c] => answer = c[2,1] + c[1,2] - c[1,1]
    const c21 = (p.cells[7] as NumberCell).value;
    const c12 = (p.cells[5] as NumberCell).value;
    const c11 = (p.cells[4] as NumberCell).value;
    expect(answer.value).toBe(c21 + c12 - c11);
  });
});

describe('generateNumberProblem — geometric pattern correctness', () => {
  it('answer = c[2,1] * (c[2,1] / c[2,0]) for geometric row', () => {
    const cfg = baseCfg({ numberOpts: { patterns: ['geometric'], valueRange: [2, 99] } });
    const p = generateNumberProblem(cfg, makeLcg(42));
    const answer = p.choices[p.correctIndex] as NumberCell;
    const c20 = (p.cells[6] as NumberCell).value;
    const c21 = (p.cells[7] as NumberCell).value;
    if (c20 > 0) {
      const ratio = c21 / c20;
      expect(answer.value).toBe(c21 * ratio);
    }
  });
});

describe('generateNumberProblem — determinism', () => {
  it('same seed produces same problem', () => {
    const cfg = baseCfg({ numberOpts: { patterns: ['arith-row'], valueRange: [1, 99] } });
    const p1 = generateNumberProblem(cfg, makeLcg(99));
    const p2 = generateNumberProblem(cfg, makeLcg(99));
    expect(p1.correctIndex).toBe(p2.correctIndex);
    expect(JSON.stringify(p1.cells)).toBe(JSON.stringify(p2.cells));
    expect(JSON.stringify(p1.choices)).toBe(JSON.stringify(p2.choices));
  });
});
