import { describe, it, expect } from 'vitest';
import {
  generateSetCardProblem,
  isValidSetCardLine,
  _internals,
} from '../logic/matrixReasoningSetCardGenerator';
import { makeLcg } from '../logic/matrixReasoningRandom';
import type { SetCardCell, MatrixLevelConfig } from '../logic/matrixReasoningTypes';

function baseCfg(activeAttributeCount: 1 | 2 | 3, overrides: Partial<MatrixLevelConfig> = {}): MatrixLevelConfig {
  return {
    id: 'test-set',
    subject: 'logic',
    gameType: 'matrix-reasoning',
    difficultyLevel: 3,
    cellKind: 'setcard',
    gridSize: 3,
    totalRounds: 5,
    timeLimit: 150,
    choiceCount: 4,
    starThresholds: [3, 4, 5],
    setcardOpts: { activeAttributeCount },
    ...overrides,
  };
}

const ACTIVE_COUNTS: (1 | 2 | 3)[] = [1, 2, 3];

describe('isValidSetCardLine', () => {
  it('all-same colorRule: same color passes, different fails', () => {
    const reds = [
      { kind: 'setcard', color: 'red', shape: 'circle', count: 1 },
      { kind: 'setcard', color: 'red', shape: 'square', count: 2 },
      { kind: 'setcard', color: 'red', shape: 'triangle', count: 3 },
    ] as SetCardCell[];
    const rules = { colorRule: 'all-same' as const, shapeRule: 'all-diff' as const, countRule: 'all-diff' as const };
    expect(isValidSetCardLine(reds, rules)).toBe(true);
    const mixed = [...reds];
    mixed[0] = { ...reds[0], color: 'green' };
    expect(isValidSetCardLine(mixed, rules)).toBe(false);
  });

  it('all-diff: 3 different values pass, 2-same fails', () => {
    const cells: SetCardCell[] = [
      { kind: 'setcard', color: 'red', shape: 'circle', count: 1 },
      { kind: 'setcard', color: 'green', shape: 'circle', count: 1 },
      { kind: 'setcard', color: 'blue', shape: 'circle', count: 1 },
    ];
    const rules = { colorRule: 'all-diff' as const, shapeRule: 'all-same' as const, countRule: 'all-same' as const };
    expect(isValidSetCardLine(cells, rules)).toBe(true);
    cells[2] = { ...cells[2], color: 'red' };
    expect(isValidSetCardLine(cells, rules)).toBe(false);
  });

  it('rejects line of length != 3', () => {
    const rules = { colorRule: 'all-same' as const, shapeRule: 'all-same' as const, countRule: 'all-same' as const };
    expect(isValidSetCardLine([], rules)).toBe(false);
    expect(isValidSetCardLine([{ kind: 'setcard', color: 'red', shape: 'circle', count: 1 }], rules)).toBe(false);
  });
});

describe('generateSetCardProblem — basics', () => {
  for (const ac of ACTIVE_COUNTS) {
    it(`activeCount=${ac}: cells length 9`, () => {
      const p = generateSetCardProblem(baseCfg(ac), makeLcg(42));
      expect(p.cells).toHaveLength(9);
    });

    it(`activeCount=${ac}: last cell null`, () => {
      const p = generateSetCardProblem(baseCfg(ac), makeLcg(42));
      expect(p.cells[8]).toBeNull();
    });

    it(`activeCount=${ac}: choices length matches`, () => {
      const p = generateSetCardProblem(baseCfg(ac, { choiceCount: 4 }), makeLcg(42));
      expect(p.choices).toHaveLength(4);
    });

    it(`activeCount=${ac}: cellKind setcard`, () => {
      const p = generateSetCardProblem(baseCfg(ac), makeLcg(42));
      expect(p.cellKind).toBe('setcard');
      for (const c of p.cells) {
        if (c !== null) expect(c.kind).toBe('setcard');
      }
      for (const c of p.choices) expect(c.kind).toBe('setcard');
    });

    it(`activeCount=${ac}: choices are unique`, () => {
      const p = generateSetCardProblem(baseCfg(ac), makeLcg(42));
      const keys = p.choices.map(c => JSON.stringify(c));
      expect(new Set(keys).size).toBe(keys.length);
    });

    it(`activeCount=${ac}: correctIndex valid`, () => {
      const p = generateSetCardProblem(baseCfg(ac), makeLcg(42));
      expect(p.correctIndex).toBeGreaterThanOrEqual(0);
      expect(p.correctIndex).toBeLessThan(p.choices.length);
    });
  }

  it('throws when setcardOpts missing', () => {
    const cfg = baseCfg(1);
    delete cfg.setcardOpts;
    expect(() => generateSetCardProblem(cfg, makeLcg(1))).toThrow();
  });

  it('throws when gridSize !== 3', () => {
    const cfg = baseCfg(1, { gridSize: 2 });
    expect(() => generateSetCardProblem(cfg, makeLcg(1))).toThrow();
  });
});

describe('generateSetCardProblem — pattern correctness', () => {
  for (const ac of ACTIVE_COUNTS) {
    it(`activeCount=${ac}: answer satisfies last row + last col rules`, () => {
      // 우리는 problem에서 patternMeta.description으로 룰을 알 수 있고,
      // 정답을 채워 넣은 마지막 행과 마지막 열이 모두 룰을 만족해야 함
      const p = generateSetCardProblem(baseCfg(ac), makeLcg(42));
      const answer = p.choices[p.correctIndex] as SetCardCell;
      const desc = p.patternMeta?.description ?? '';
      const colorRule = desc.includes('color:all-diff') ? 'all-diff' : 'all-same';
      const shapeRule = desc.includes('shape:all-diff') ? 'all-diff' : 'all-same';
      const countRule = desc.includes('count:all-diff') ? 'all-diff' : 'all-same';
      const rules = { colorRule, shapeRule, countRule } as const;

      const filled = p.cells.map(c => (c === null ? answer : (c as SetCardCell)));
      const lastRow = filled.slice(6, 9) as SetCardCell[];
      const lastCol = [filled[2], filled[5], filled[8]] as SetCardCell[];
      expect(isValidSetCardLine(lastRow, rules)).toBe(true);
      expect(isValidSetCardLine(lastCol, rules)).toBe(true);
    });

    it(`activeCount=${ac}: answer is unique among all 27 cards`, () => {
      const p = generateSetCardProblem(baseCfg(ac), makeLcg(42));
      const desc = p.patternMeta?.description ?? '';
      const colorRule = desc.includes('color:all-diff') ? 'all-diff' : 'all-same';
      const shapeRule = desc.includes('shape:all-diff') ? 'all-diff' : 'all-same';
      const countRule = desc.includes('count:all-diff') ? 'all-diff' : 'all-same';
      const rules = { colorRule, shapeRule, countRule } as const;
      const knownCells = p.cells.slice(0, 8) as SetCardCell[];
      const allValid = _internals.findValidAnswers(knownCells, rules);
      // 우리 알고리즘은 deterministic Latin Square 라서 정답이 정확히 1개여야 함 (단, all-same 모두인 경우 27개 후보 중 1개만 살아남음)
      expect(allValid.length).toBe(1);
    });
  }
});

describe('generateSetCardProblem — determinism', () => {
  it('same seed produces same problem', () => {
    const cfg = baseCfg(2);
    const p1 = generateSetCardProblem(cfg, makeLcg(99));
    const p2 = generateSetCardProblem(cfg, makeLcg(99));
    expect(p1.correctIndex).toBe(p2.correctIndex);
    expect(JSON.stringify(p1.cells)).toBe(JSON.stringify(p2.cells));
    expect(JSON.stringify(p1.choices)).toBe(JSON.stringify(p2.choices));
  });
});
