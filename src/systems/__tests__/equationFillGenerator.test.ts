/**
 * equationFillGenerator.test.ts
 * 등식 완성 문제 생성기 단위 테스트
 */

import { describe, it, expect } from 'vitest';
import {
  generateEqFillQuestion,
  generateEqFillLevel,
  calcEqFillStars,
} from '../math/equationFillGenerator';
import type { EqFillGenParams } from '../math/equationFillGenerator';

// ─── 공통 파라미터 헬퍼 ──────────────────────────────────────────────────────

function makeParams(overrides?: Partial<EqFillGenParams>): EqFillGenParams {
  return {
    ops: ['add'],
    blankPositions: ['right'],
    operandRange: [1, 9],
    distractorSpread: 4,
    ...overrides,
  };
}

// ─── generateEqFillQuestion ──────────────────────────────────────────────────

describe('generateEqFillQuestion', () => {
  it('정답이 양수여야 한다', () => {
    const params = makeParams({ ops: ['add', 'sub', 'mul', 'div'], blankPositions: ['left', 'right'] });
    for (let i = 0; i < 50; i++) {
      const q = generateEqFillQuestion(params);
      expect(q.answer).toBeGreaterThan(0);
    }
  });

  it('choices 는 정확히 4개여야 한다', () => {
    const params = makeParams();
    for (let i = 0; i < 20; i++) {
      const q = generateEqFillQuestion(params);
      expect(q.choices).toHaveLength(4);
    }
  });

  it('choices 에 중복이 없어야 한다', () => {
    const params = makeParams();
    for (let i = 0; i < 30; i++) {
      const q = generateEqFillQuestion(params);
      const unique = new Set(q.choices);
      expect(unique.size).toBe(4);
    }
  });

  it('correctIndex 위치의 choice 가 answer 와 일치해야 한다', () => {
    const params = makeParams({ ops: ['add', 'sub'], blankPositions: ['left', 'right'] });
    for (let i = 0; i < 40; i++) {
      const q = generateEqFillQuestion(params);
      expect(q.choices[q.correctIndex]).toBe(q.answer);
    }
  });

  it('displayText 에 □ 가 정확히 1개 포함되어야 한다', () => {
    const params = makeParams({ ops: ['add', 'sub', 'mul', 'div'], blankPositions: ['left', 'right'] });
    for (let i = 0; i < 50; i++) {
      const q = generateEqFillQuestion(params);
      const count = (q.displayText.match(/□/g) ?? []).length;
      expect(count).toBe(1);
    }
  });

  // ── 덧셈 ─────────────────────────────────────────────────────────────────

  describe('덧셈 역산 검증', () => {
    it('blank=right: known + answer = result 성립', () => {
      const params = makeParams({ ops: ['add'], blankPositions: ['right'] });
      for (let i = 0; i < 30; i++) {
        const q = generateEqFillQuestion(params);
        // "known + □ = result"
        const match = q.displayText.match(/^(\d+)\s*\+\s*□\s*=\s*(\d+)$/);
        expect(match, `displayText: ${q.displayText}`).not.toBeNull();
        if (match) {
          const known = parseInt(match[1]!, 10);
          const result = parseInt(match[2]!, 10);
          expect(known + q.answer).toBe(result);
        }
      }
    });

    it('blank=left: answer + known = result 성립', () => {
      const params = makeParams({ ops: ['add'], blankPositions: ['left'] });
      for (let i = 0; i < 30; i++) {
        const q = generateEqFillQuestion(params);
        // "□ + known = result"
        const match = q.displayText.match(/^□\s*\+\s*(\d+)\s*=\s*(\d+)$/);
        expect(match, `displayText: ${q.displayText}`).not.toBeNull();
        if (match) {
          const known = parseInt(match[1]!, 10);
          const result = parseInt(match[2]!, 10);
          expect(q.answer + known).toBe(result);
        }
      }
    });
  });

  // ── 뺄셈 ─────────────────────────────────────────────────────────────────

  describe('뺄셈 역산 검증', () => {
    it('blank=right: known − answer = result 성립 (result > 0)', () => {
      const params = makeParams({ ops: ['sub'], blankPositions: ['right'] });
      for (let i = 0; i < 30; i++) {
        const q = generateEqFillQuestion(params);
        const match = q.displayText.match(/^(\d+)\s*[−-]\s*□\s*=\s*(\d+)$/);
        expect(match, `displayText: ${q.displayText}`).not.toBeNull();
        if (match) {
          const known = parseInt(match[1]!, 10);
          const result = parseInt(match[2]!, 10);
          expect(known - q.answer).toBe(result);
          expect(result).toBeGreaterThan(0);
        }
      }
    });

    it('blank=left: answer − known = result 성립 (answer > known)', () => {
      const params = makeParams({ ops: ['sub'], blankPositions: ['left'] });
      for (let i = 0; i < 30; i++) {
        const q = generateEqFillQuestion(params);
        const match = q.displayText.match(/^□\s*[−-]\s*(\d+)\s*=\s*(\d+)$/);
        expect(match, `displayText: ${q.displayText}`).not.toBeNull();
        if (match) {
          const known = parseInt(match[1]!, 10);
          const result = parseInt(match[2]!, 10);
          expect(q.answer - known).toBe(result);
          expect(q.answer).toBeGreaterThan(known);
        }
      }
    });
  });

  // ── 곱셈 ─────────────────────────────────────────────────────────────────

  describe('곱셈 역산 검증', () => {
    it('blank=right: known × answer = result 성립', () => {
      const params = makeParams({ ops: ['mul'], blankPositions: ['right'], operandRange: [2, 9] });
      for (let i = 0; i < 30; i++) {
        const q = generateEqFillQuestion(params);
        const match = q.displayText.match(/^(\d+)\s*×\s*□\s*=\s*(\d+)$/);
        expect(match, `displayText: ${q.displayText}`).not.toBeNull();
        if (match) {
          const known = parseInt(match[1]!, 10);
          const result = parseInt(match[2]!, 10);
          expect(known * q.answer).toBe(result);
        }
      }
    });
  });

  // ── 나눗셈 ────────────────────────────────────────────────────────────────

  describe('나눗셈 역산 검증', () => {
    it('blank=right: known ÷ answer = result (나머지 없음)', () => {
      const params = makeParams({ ops: ['div'], blankPositions: ['right'], operandRange: [2, 9] });
      for (let i = 0; i < 30; i++) {
        const q = generateEqFillQuestion(params);
        const match = q.displayText.match(/^(\d+)\s*÷\s*□\s*=\s*(\d+)$/);
        expect(match, `displayText: ${q.displayText}`).not.toBeNull();
        if (match) {
          const known = parseInt(match[1]!, 10);
          const result = parseInt(match[2]!, 10);
          expect(known % q.answer).toBe(0);
          expect(known / q.answer).toBe(result);
        }
      }
    });

    it('blank=left: answer ÷ known = result (나머지 없음)', () => {
      const params = makeParams({ ops: ['div'], blankPositions: ['left'], operandRange: [2, 9] });
      for (let i = 0; i < 30; i++) {
        const q = generateEqFillQuestion(params);
        const match = q.displayText.match(/^□\s*÷\s*(\d+)\s*=\s*(\d+)$/);
        expect(match, `displayText: ${q.displayText}`).not.toBeNull();
        if (match) {
          const known = parseInt(match[1]!, 10);
          const result = parseInt(match[2]!, 10);
          expect(q.answer % known).toBe(0);
          expect(q.answer / known).toBe(result);
        }
      }
    });
  });
});

// ─── generateEqFillLevel ─────────────────────────────────────────────────────

describe('generateEqFillLevel', () => {
  it('요청한 count 만큼 문제를 반환해야 한다', () => {
    const params = makeParams({ ops: ['add', 'sub'], blankPositions: ['left', 'right'] });
    const questions = generateEqFillLevel(params, 10);
    expect(questions).toHaveLength(10);
  });

  it('연속 중복 displayText 가 없어야 한다', () => {
    const params = makeParams({ ops: ['add', 'sub', 'mul'], blankPositions: ['left', 'right'] });
    const questions = generateEqFillLevel(params, 15);
    for (let i = 1; i < questions.length; i++) {
      expect(questions[i]!.displayText).not.toBe(questions[i - 1]!.displayText);
    }
  });

  it('모든 문제의 answer 가 양수여야 한다', () => {
    const params = makeParams({ ops: ['add', 'sub', 'mul', 'div'], blankPositions: ['left', 'right'] });
    const questions = generateEqFillLevel(params, 20);
    questions.forEach((q) => expect(q.answer).toBeGreaterThan(0));
  });
});

// ─── calcEqFillStars ──────────────────────────────────────────────────────────

describe('calcEqFillStars', () => {
  const thresholds: [number, number, number] = [6, 8, 10];

  it('정답 10개 → 3별', () => {
    expect(calcEqFillStars(10, thresholds)).toBe(3);
  });

  it('정답 8개 → 2별', () => {
    expect(calcEqFillStars(8, thresholds)).toBe(2);
  });

  it('정답 6개 → 1별', () => {
    expect(calcEqFillStars(6, thresholds)).toBe(1);
  });

  it('정답 5개 → 0별', () => {
    expect(calcEqFillStars(5, thresholds)).toBe(0);
  });

  it('정답 9개 → 2별 (3별 미달)', () => {
    expect(calcEqFillStars(9, thresholds)).toBe(2);
  });

  it('정답 0개 → 0별', () => {
    expect(calcEqFillStars(0, thresholds)).toBe(0);
  });
});
