import { describe, it, expect } from 'vitest';
import { generateEmojiProblem } from '../logic/matrixReasoningEmojiGenerator';
import { makeLcg } from '../logic/matrixReasoningRandom';
import type { EmojiCell, EmojiPatternKind, MatrixLevelConfig } from '../logic/matrixReasoningTypes';

function baseCfg(overrides: Partial<MatrixLevelConfig> = {}): MatrixLevelConfig {
  return {
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
    emojiOpts: {
      patterns: ['category-cycle'],
      categories: ['fruit', 'animal'],
    },
    ...overrides,
  };
}

const PATTERNS: EmojiPatternKind[] = ['category-cycle', 'sequence-shift', 'count-progression', 'odd-completion'];

describe('generateEmojiProblem — basics', () => {
  for (const pat of PATTERNS) {
    it(`pattern=${pat}: cells length matches gridSize²`, () => {
      const cfg = baseCfg({ gridSize: 3, choiceCount: 4, emojiOpts: { patterns: [pat], categories: ['fruit', 'animal', 'celestial'] } });
      const p = generateEmojiProblem(cfg, makeLcg(42));
      expect(p.cells).toHaveLength(9);
    });

    it(`pattern=${pat}: last cell is null`, () => {
      const cfg = baseCfg({ gridSize: 3, choiceCount: 4, emojiOpts: { patterns: [pat], categories: ['fruit', 'animal', 'celestial'] } });
      const p = generateEmojiProblem(cfg, makeLcg(42));
      expect(p.cells[8]).toBeNull();
    });

    it(`pattern=${pat}: choices length matches choiceCount`, () => {
      const cfg = baseCfg({ gridSize: 3, choiceCount: 4, emojiOpts: { patterns: [pat], categories: ['fruit', 'animal', 'celestial'] } });
      const p = generateEmojiProblem(cfg, makeLcg(42));
      expect(p.choices).toHaveLength(4);
    });

    it(`pattern=${pat}: all choices are emoji cells`, () => {
      const cfg = baseCfg({ gridSize: 3, choiceCount: 4, emojiOpts: { patterns: [pat], categories: ['fruit', 'animal', 'celestial'] } });
      const p = generateEmojiProblem(cfg, makeLcg(42));
      for (const c of p.choices) expect(c.kind).toBe('emoji');
    });

    it(`pattern=${pat}: all non-null cells are emoji cells`, () => {
      const cfg = baseCfg({ gridSize: 3, choiceCount: 4, emojiOpts: { patterns: [pat], categories: ['fruit', 'animal', 'celestial'] } });
      const p = generateEmojiProblem(cfg, makeLcg(42));
      for (const c of p.cells) {
        if (c !== null) expect(c.kind).toBe('emoji');
      }
    });

    it(`pattern=${pat}: correct answer is in choices`, () => {
      const cfg = baseCfg({ gridSize: 3, choiceCount: 4, emojiOpts: { patterns: [pat], categories: ['fruit', 'animal', 'celestial'] } });
      const p = generateEmojiProblem(cfg, makeLcg(42));
      expect(p.correctIndex).toBeGreaterThanOrEqual(0);
      expect(p.correctIndex).toBeLessThan(p.choices.length);
    });

    it(`pattern=${pat}: choices have no duplicates`, () => {
      const cfg = baseCfg({ gridSize: 3, choiceCount: 4, emojiOpts: { patterns: [pat], categories: ['fruit', 'animal', 'celestial'] } });
      const p = generateEmojiProblem(cfg, makeLcg(42));
      const keys = p.choices.map(c => JSON.stringify(c));
      expect(new Set(keys).size).toBe(p.choices.length);
    });
  }

  it('cellKind is emoji', () => {
    const p = generateEmojiProblem(baseCfg(), makeLcg(1));
    expect(p.cellKind).toBe('emoji');
  });

  it('patternMeta.kind matches one of allowed patterns', () => {
    const cfg = baseCfg({ emojiOpts: { patterns: ['sequence-shift'], categories: ['fruit'] } });
    const p = generateEmojiProblem(cfg, makeLcg(7));
    expect(p.patternMeta?.kind).toBe('sequence-shift');
  });

  it('throws when emojiOpts is missing', () => {
    const cfg = baseCfg();
    delete cfg.emojiOpts;
    expect(() => generateEmojiProblem(cfg, makeLcg(1))).toThrow();
  });
});

describe('generateEmojiProblem — category-cycle pattern correctness', () => {
  it('answer category matches the row category', () => {
    // 3x3에서 각 행의 카테고리가 같은지 검증
    const cfg = baseCfg({
      gridSize: 3,
      choiceCount: 4,
      emojiOpts: { patterns: ['category-cycle'], categories: ['fruit', 'animal', 'celestial'] },
    });
    const p = generateEmojiProblem(cfg, makeLcg(42));
    const answer = p.choices[p.correctIndex] as EmojiCell;
    // 마지막 행의 다른 셀과 같은 카테고리여야 함
    const lastRowCells = p.cells.slice(6, 8) as EmojiCell[];
    for (const c of lastRowCells) {
      expect(c.category).toBe(answer.category);
    }
  });
});

describe('generateEmojiProblem — count-progression pattern correctness', () => {
  it('answer count is gridSize (last row)', () => {
    const cfg = baseCfg({
      gridSize: 3,
      choiceCount: 4,
      emojiOpts: { patterns: ['count-progression'], categories: ['fruit'] },
    });
    const p = generateEmojiProblem(cfg, makeLcg(42));
    const answer = p.choices[p.correctIndex] as EmojiCell;
    expect(answer.count).toBe(3);
  });
});

describe('generateEmojiProblem — sequence-shift pattern correctness', () => {
  it('answer emoji equals shifted sequence at last position', () => {
    const cfg = baseCfg({
      gridSize: 3,
      choiceCount: 4,
      emojiOpts: { patterns: ['sequence-shift'], categories: ['fruit'] },
    });
    const p = generateEmojiProblem(cfg, makeLcg(42));
    const answer = p.choices[p.correctIndex] as EmojiCell;
    // 마지막 셀의 카테고리는 1행 셀들과 같아야 함
    const firstRowCell = p.cells[0] as EmojiCell;
    expect(answer.category).toBe(firstRowCell.category);
  });
});

describe('generateEmojiProblem — determinism', () => {
  it('same seed produces same problem', () => {
    const cfg = baseCfg({ gridSize: 3, choiceCount: 4, emojiOpts: { patterns: ['category-cycle'], categories: ['fruit', 'animal', 'celestial'] } });
    const p1 = generateEmojiProblem(cfg, makeLcg(99));
    const p2 = generateEmojiProblem(cfg, makeLcg(99));
    expect(p1.correctIndex).toBe(p2.correctIndex);
    expect(JSON.stringify(p1.cells)).toBe(JSON.stringify(p2.cells));
    expect(JSON.stringify(p1.choices)).toBe(JSON.stringify(p2.choices));
  });
});
