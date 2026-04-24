import { describe, expect, it } from 'vitest';
import {
  calcPatternStars,
  generatePatternSequence,
  type PatternGenParams,
  type PatternType,
} from '../math/patternFinderGenerator';

const allTypes: PatternType[] = ['arithmetic', 'geometric', 'fibonacci', 'square', 'alternating'];

function baseParams(overrides: Partial<PatternGenParams> = {}): PatternGenParams {
  return {
    patternTypes: ['arithmetic'],
    length: 5,
    blankPosition: 'end',
    difficultyRange: [10, 5],
    distractorSpread: 3,
    ...overrides,
  };
}

function valueAt(tiles: (number | null)[], i: number, answer: number): number {
  const v = tiles[i];
  return v === null ? answer : v;
}

describe('generatePatternSequence — 공통 계약', () => {
  it('tiles 길이가 params.length와 일치한다', () => {
    for (const type of allTypes) {
      const seq = generatePatternSequence(baseParams({ patternTypes: [type] }));
      expect(seq.tiles.length).toBe(5);
    }
  });

  it('blankIndex 위치에만 null이 존재한다', () => {
    for (const type of allTypes) {
      const seq = generatePatternSequence(baseParams({ patternTypes: [type] }));
      expect(seq.tiles[seq.blankIndex]).toBeNull();
      const nullCount = seq.tiles.filter((t) => t === null).length;
      expect(nullCount).toBe(1);
    }
  });

  it('choices는 4개이며 중복이 없다', () => {
    for (const type of allTypes) {
      const seq = generatePatternSequence(baseParams({ patternTypes: [type] }));
      expect(seq.choices.length).toBe(4);
      expect(new Set(seq.choices).size).toBe(4);
    }
  });

  it('correctIndex가 choices에서 answer를 가리킨다', () => {
    for (const type of allTypes) {
      const seq = generatePatternSequence(baseParams({ patternTypes: [type] }));
      expect(seq.choices[seq.correctIndex]).toBe(seq.answer);
    }
  });

  it('모든 choices는 양수다', () => {
    for (const type of allTypes) {
      for (let i = 0; i < 10; i++) {
        const seq = generatePatternSequence(baseParams({ patternTypes: [type] }));
        for (const c of seq.choices) expect(c).toBeGreaterThan(0);
      }
    }
  });
});

describe('blankPosition 옵션', () => {
  it("'end'일 때 blankIndex는 마지막", () => {
    for (let i = 0; i < 5; i++) {
      const seq = generatePatternSequence(baseParams({ blankPosition: 'end' }));
      expect(seq.blankIndex).toBe(4);
    }
  });

  it("'any'일 때 blankIndex는 범위 안", () => {
    for (let i = 0; i < 20; i++) {
      const seq = generatePatternSequence(baseParams({ length: 5, blankPosition: 'any' }));
      expect(seq.blankIndex).toBeGreaterThanOrEqual(0);
      expect(seq.blankIndex).toBeLessThanOrEqual(4);
    }
  });
});

describe('등차수열 — 수학적 정합성', () => {
  it('인접 항의 차가 일정하다', () => {
    for (let i = 0; i < 20; i++) {
      const seq = generatePatternSequence(
        baseParams({ patternTypes: ['arithmetic'], blankPosition: 'end' }),
      );
      const vals = seq.tiles.map((t, idx) => valueAt(seq.tiles, idx, seq.answer));
      const diff = vals[1]! - vals[0]!;
      for (let k = 1; k < vals.length; k++) {
        expect(vals[k]! - vals[k - 1]!).toBe(diff);
      }
    }
  });
});

describe('등비수열 — 수학적 정합성', () => {
  it('인접 항의 비가 일정하다', () => {
    for (let i = 0; i < 20; i++) {
      const seq = generatePatternSequence(
        baseParams({
          patternTypes: ['geometric'],
          length: 4,
          blankPosition: 'end',
          difficultyRange: [5, 3],
        }),
      );
      const vals = seq.tiles.map((_, idx) => valueAt(seq.tiles, idx, seq.answer));
      const ratio = vals[1]! / vals[0]!;
      for (let k = 1; k < vals.length; k++) {
        expect(vals[k]! / vals[k - 1]!).toBeCloseTo(ratio, 5);
      }
    }
  });
});

describe('피보나치 — 수학적 정합성', () => {
  it('a(n) = a(n-1) + a(n-2)', () => {
    for (let i = 0; i < 20; i++) {
      const seq = generatePatternSequence(
        baseParams({ patternTypes: ['fibonacci'], blankPosition: 'end' }),
      );
      const vals = seq.tiles.map((_, idx) => valueAt(seq.tiles, idx, seq.answer));
      for (let k = 2; k < vals.length; k++) {
        expect(vals[k]).toBe(vals[k - 1]! + vals[k - 2]!);
      }
    }
  });
});

describe('제곱수 — 수학적 정합성', () => {
  it('각 항은 완전제곱수이며 sqrt가 1씩 증가한다', () => {
    for (let i = 0; i < 10; i++) {
      const seq = generatePatternSequence(
        baseParams({ patternTypes: ['square'], blankPosition: 'end' }),
      );
      const vals = seq.tiles.map((_, idx) => valueAt(seq.tiles, idx, seq.answer));
      const roots = vals.map((v) => Math.sqrt(v));
      for (const r of roots) expect(r).toBe(Math.round(r));
      for (let k = 1; k < roots.length; k++) {
        expect(roots[k]! - roots[k - 1]!).toBe(1);
      }
    }
  });
});

describe('calcPatternStars', () => {
  const thresholds: [number, number, number] = [3, 6, 9];

  it('3 미만 = 0 별', () => {
    expect(calcPatternStars(0, thresholds)).toBe(0);
    expect(calcPatternStars(2, thresholds)).toBe(0);
  });

  it('3~5 정답 = 1 별', () => {
    expect(calcPatternStars(3, thresholds)).toBe(1);
    expect(calcPatternStars(5, thresholds)).toBe(1);
  });

  it('6~8 정답 = 2 별', () => {
    expect(calcPatternStars(6, thresholds)).toBe(2);
    expect(calcPatternStars(8, thresholds)).toBe(2);
  });

  it('9 이상 = 3 별', () => {
    expect(calcPatternStars(9, thresholds)).toBe(3);
    expect(calcPatternStars(15, thresholds)).toBe(3);
  });
});

describe('다중 패턴 혼합', () => {
  it('patternTypes 중 하나를 항상 선택한다', () => {
    const types: PatternType[] = ['arithmetic', 'geometric'];
    for (let i = 0; i < 30; i++) {
      const seq = generatePatternSequence(baseParams({ patternTypes: types }));
      expect(types).toContain(seq.patternType);
    }
  });
});
