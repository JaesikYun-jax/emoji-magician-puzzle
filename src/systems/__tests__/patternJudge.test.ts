import { describe, it, expect } from 'vitest';
import {
  generateLogicSequence,
  judgeLogicAnswer,
  calcLogicStars,
  getPatternMeta,
  type LogicGenParams,
  type ShapeKey,
  type ShapePatternType,
} from '../logic/patternJudge';

const SHAPE_KEYS: ShapeKey[] = ['tri', 'cir', 'sqr', 'dia'];
const ALL_TYPES: ShapePatternType[] = [
  'ab', 'abc', 'abcd', 'aabb', 'aaab', 'abba', 'aabbcc', 'abccba',
];

/**
 * 한 패턴이 모호하지 않게 풀리는지 검증하는 헬퍼.
 * 가시 타일들로부터 사이클(period)이 추론되면, 정답 위치의 도형이 사이클 규칙과 일치해야 함.
 */
function inferAndCheckUnambiguous(seq: ReturnType<typeof generateLogicSequence>, period: number): boolean {
  const tiles = seq.tiles.filter((t): t is ShapeKey => t !== null);
  const blankPos = seq.tiles.findIndex(t => t === null);
  // 가시 타일이 한 사이클 이상 — 즉 첫 사이클 = tiles[0..period-1] 가 정해짐
  if (tiles.length < period) return false;

  // 모든 가시 위치에서 cycle[i % period] === tiles[i] 가 성립해야 함
  const cycle = tiles.slice(0, period);
  for (let i = period; i < tiles.length; i++) {
    if (tiles[i] !== cycle[i % period]) return false;
  }
  // 정답 위치의 도형 (= choices[correctIndex]) 가 cycle 규칙대로인지
  const expectedAnswer = cycle[blankPos % period];
  return seq.choices[seq.correctIndex] === expectedAnswer;
}

describe('generateLogicSequence — 공통 불변량', () => {
  it('보기는 항상 3개이고 모두 다름 (모든 패턴 타입)', () => {
    for (const type of ALL_TYPES) {
      for (let trial = 0; trial < 30; trial++) {
        const seq = generateLogicSequence({ types: [type] });
        expect(seq.choices).toHaveLength(3);
        expect(new Set(seq.choices).size).toBe(3);
      }
    }
  });

  it('정답이 보기 안에 포함됨 + 유효한 ShapeKey', () => {
    for (const type of ALL_TYPES) {
      for (let trial = 0; trial < 20; trial++) {
        const seq = generateLogicSequence({ types: [type] });
        expect(seq.choices[seq.correctIndex]).toBeDefined();
        expect(SHAPE_KEYS).toContain(seq.choices[seq.correctIndex]);
      }
    }
  });

  it('마지막 타일은 항상 null (?)', () => {
    for (const type of ALL_TYPES) {
      const seq = generateLogicSequence({ types: [type] });
      expect(seq.tiles[seq.tiles.length - 1]).toBeNull();
      // null은 정확히 1개
      expect(seq.tiles.filter(t => t === null)).toHaveLength(1);
    }
  });

  it('hint 문자열이 비어있지 않음', () => {
    for (const type of ALL_TYPES) {
      const seq = generateLogicSequence({ types: [type] });
      expect(seq.hint.length).toBeGreaterThan(0);
    }
  });

  it('빈 types 배열이 들어와도 폴백으로 동작', () => {
    const seq = generateLogicSequence({ types: [] });
    expect(seq.tiles.length).toBeGreaterThan(0);
    expect(seq.choices).toHaveLength(3);
  });
});

describe('generateLogicSequence — 패턴별 모호성 검증 (각 30회 반복)', () => {
  for (const type of ALL_TYPES) {
    it(`${type}: 가시 타일이 사이클을 명확히 드러내고, 정답이 cycle 규칙과 일치`, () => {
      const meta = getPatternMeta(type);
      for (let trial = 0; trial < 30; trial++) {
        const seq = generateLogicSequence({ types: [type] });
        // 정답이 모호하지 않게 결정되는지 검사
        expect(inferAndCheckUnambiguous(seq, meta.period)).toBe(true);
      }
    });
  }
});

describe('generateLogicSequence — 패턴별 구조 검증', () => {
  it('ab: ABAB 짝/홀 인덱스 도형이 각각 같음', () => {
    for (let trial = 0; trial < 10; trial++) {
      const seq = generateLogicSequence({ types: ['ab'] });
      const nonNull = seq.tiles.filter((t): t is ShapeKey => t !== null);
      const even = nonNull.filter((_, i) => i % 2 === 0);
      const odd = nonNull.filter((_, i) => i % 2 !== 0);
      expect(new Set(even).size).toBe(1);
      expect(new Set(odd).size).toBe(1);
      expect(even[0]).not.toBe(odd[0]);
    }
  });

  it('abc: 첫 3개는 모두 다름, 4번째 = 첫 번째', () => {
    for (let trial = 0; trial < 10; trial++) {
      const seq = generateLogicSequence({ types: ['abc'] });
      const nn = seq.tiles.filter((t): t is ShapeKey => t !== null);
      expect(new Set([nn[0], nn[1], nn[2]]).size).toBe(3);
      expect(nn[3]).toBe(nn[0]);
    }
  });

  it('abcd: 첫 사이클 4개 모두 다름', () => {
    for (let trial = 0; trial < 10; trial++) {
      const seq = generateLogicSequence({ types: ['abcd'] });
      const nn = seq.tiles.filter((t): t is ShapeKey => t !== null);
      expect(new Set(nn.slice(0, 4)).size).toBe(4);
      expect(nn[4]).toBe(nn[0]); // 사이클 시작
    }
  });

  it('aabb: 같은 도형이 2개씩 짝지어 나옴', () => {
    for (let trial = 0; trial < 10; trial++) {
      const seq = generateLogicSequence({ types: ['aabb'] });
      const nn = seq.tiles.filter((t): t is ShapeKey => t !== null);
      expect(nn[0]).toBe(nn[1]);
      expect(nn[2]).toBe(nn[3]);
      expect(nn[0]).not.toBe(nn[2]);
    }
  });

  it('aaab: 첫 3개가 같고 4번째가 다름', () => {
    for (let trial = 0; trial < 10; trial++) {
      const seq = generateLogicSequence({ types: ['aaab'] });
      const nn = seq.tiles.filter((t): t is ShapeKey => t !== null);
      expect(nn[0]).toBe(nn[1]);
      expect(nn[1]).toBe(nn[2]);
      expect(nn[3]).not.toBe(nn[0]);
    }
  });

  it('abba: 1-2-2-1 대칭 (palindrome)', () => {
    for (let trial = 0; trial < 10; trial++) {
      const seq = generateLogicSequence({ types: ['abba'] });
      const nn = seq.tiles.filter((t): t is ShapeKey => t !== null);
      expect(nn[0]).toBe(nn[3]); // A...A
      expect(nn[1]).toBe(nn[2]); // BB
      expect(nn[0]).not.toBe(nn[1]);
    }
  });

  it('aabbcc: 3종 도형이 2개씩 차례로 (1 사이클 = 6칸)', () => {
    for (let trial = 0; trial < 10; trial++) {
      const seq = generateLogicSequence({ types: ['aabbcc'] });
      const nn = seq.tiles.filter((t): t is ShapeKey => t !== null);
      expect(nn[0]).toBe(nn[1]);
      expect(nn[2]).toBe(nn[3]);
      expect(nn[4]).toBe(nn[5]);
      expect(new Set([nn[0], nn[2], nn[4]]).size).toBe(3);
    }
  });

  it('abccba: 회문 (1-2-3-3-2-1)', () => {
    for (let trial = 0; trial < 10; trial++) {
      const seq = generateLogicSequence({ types: ['abccba'] });
      const nn = seq.tiles.filter((t): t is ShapeKey => t !== null);
      expect(nn[0]).toBe(nn[5]);
      expect(nn[1]).toBe(nn[4]);
      expect(nn[2]).toBe(nn[3]);
      expect(new Set([nn[0], nn[1], nn[2]]).size).toBe(3);
    }
  });
});

describe('judgeLogicAnswer', () => {
  it('올바른 index -> { correct: true }', () => {
    const seq = generateLogicSequence({ types: ['ab'] });
    expect(judgeLogicAnswer(seq, seq.correctIndex)).toEqual({ correct: true });
  });

  it('틀린 index -> { correct: false }', () => {
    const seq = generateLogicSequence({ types: ['ab'] });
    const wrongIndex = (seq.correctIndex + 1) % seq.choices.length;
    expect(judgeLogicAnswer(seq, wrongIndex)).toEqual({ correct: false });
  });
});

describe('calcLogicStars', () => {
  const thresholds: [number, number, number] = [3, 4, 5];

  it('correct=5 -> stars=3', () => {
    expect(calcLogicStars(5, thresholds)).toBe(3);
  });
  it('correct=4 -> stars=2', () => {
    expect(calcLogicStars(4, thresholds)).toBe(2);
  });
  it('correct=3 -> stars=1', () => {
    expect(calcLogicStars(3, thresholds)).toBe(1);
  });
  it('correct=2 -> stars=0', () => {
    expect(calcLogicStars(2, thresholds)).toBe(0);
  });
});

describe('getPatternMeta', () => {
  it('각 패턴의 period/shapeCount/visibleCount 메타가 올바름', () => {
    expect(getPatternMeta('ab')).toEqual({ period: 2, shapeCount: 2, visibleCount: 4 });
    expect(getPatternMeta('abc')).toEqual({ period: 3, shapeCount: 3, visibleCount: 6 });
    expect(getPatternMeta('abcd')).toEqual({ period: 4, shapeCount: 4, visibleCount: 6 });
    expect(getPatternMeta('aabb')).toEqual({ period: 4, shapeCount: 2, visibleCount: 6 });
    expect(getPatternMeta('aaab')).toEqual({ period: 4, shapeCount: 2, visibleCount: 6 });
    expect(getPatternMeta('abba')).toEqual({ period: 4, shapeCount: 2, visibleCount: 6 });
    expect(getPatternMeta('aabbcc')).toEqual({ period: 6, shapeCount: 3, visibleCount: 6 });
    expect(getPatternMeta('abccba')).toEqual({ period: 6, shapeCount: 3, visibleCount: 6 });
  });
});
