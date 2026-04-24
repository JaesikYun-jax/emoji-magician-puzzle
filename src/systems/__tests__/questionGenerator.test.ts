import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateQuestion,
  generateQuestionByRule,
  generateNextQuestion,
  clearQuestionCache,
  seededRandom,
  type NewMathQuestion,
  type MathQuestion,
} from '../math/questionGenerator';
import { createDefaultStatus, type UserMathStatus } from '../math/UserMathStatus';
import type { DifficultyParams } from '../math/difficultyEngine';

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

function makeParams(overrides?: Partial<DifficultyParams>): DifficultyParams {
  return {
    ruleWeights: [{ ruleId: 'g1s1-add-single-no-carry', weight: 1.0 }],
    operandScaleFactor: 1.0,
    distractorMode: 'normal',
    timeLimitMs: null,
    streakMultiplier: 1.0,
    ...overrides,
  };
}

// ── generateQuestion (하위 호환 deprecated API) ───────────────────────────────

describe('generateQuestion (deprecated fallback)', () => {
  it('UserMathStatus를 받아 MathQuestion 객체를 반환한다', () => {
    const status = createDefaultStatus();
    const q: MathQuestion = generateQuestion(status);
    expect(q).toBeDefined();
    expect(typeof q.operandA).toBe('number');
    expect(typeof q.operandB).toBe('number');
    expect(typeof q.answer).toBe('number');
  });

  it('choiceCount가 choices 배열 길이와 일치한다', () => {
    const status = createDefaultStatus();
    const q = generateQuestion(status);
    expect(q.choices.length).toBe(q.choiceCount);
  });

  it('choices에 정답(answer)이 포함된다', () => {
    const status = createDefaultStatus();
    const q = generateQuestion(status);
    expect(q.choices).toContain(q.answer);
  });

  it('choices 내 중복이 없다', () => {
    const status = createDefaultStatus();
    const q = generateQuestion(status);
    const unique = new Set(q.choices);
    expect(unique.size).toBe(q.choices.length);
  });

  it('operation이 add이면 operandA + operandB === answer', () => {
    const status = createDefaultStatus();
    const q = generateQuestion(status);
    if (q.operation === 'add') {
      expect(q.operandA + q.operandB).toBe(q.answer);
    }
  });
});

// ── seededRandom ──────────────────────────────────────────────────────────────

describe('seededRandom', () => {
  it('동일 seed로 생성된 연속 값은 항상 동일하다', () => {
    const rng1 = seededRandom(42);
    const rng2 = seededRandom(42);
    for (let i = 0; i < 20; i++) {
      expect(rng1()).toBeCloseTo(rng2(), 10);
    }
  });

  it('서로 다른 seed는 서로 다른 첫 번째 값을 생성한다', () => {
    const rng1 = seededRandom(1);
    const rng2 = seededRandom(2);
    expect(rng1()).not.toBe(rng2());
  });

  it('반환 값은 [0, 1) 범위에 있다', () => {
    const rng = seededRandom(12345);
    for (let i = 0; i < 100; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

// ── generateQuestionByRule ────────────────────────────────────────────────────

describe('generateQuestionByRule', () => {
  beforeEach(() => {
    clearQuestionCache();
  });

  it('알 수 없는 ruleId를 넘기면 Error를 던진다', () => {
    const params = makeParams();
    expect(() => generateQuestionByRule('no-such-rule', params)).toThrow(/Unknown ruleId/);
  });

  it('NewMathQuestion 구조를 반환한다', () => {
    const params = makeParams({ ruleWeights: [{ ruleId: 'g1s1-add-single-no-carry', weight: 1 }] });
    const q = generateQuestionByRule('g1s1-add-single-no-carry', params);
    expect(q.ruleId).toBe('g1s1-add-single-no-carry');
    expect(typeof q.operandA).toBe('number');
    expect(typeof q.operandB).toBe('number');
    expect(typeof q.correctAnswer).toBe('number');
    expect(Array.isArray(q.choices)).toBe(true);
    expect(typeof q.correctIndex).toBe('number');
    expect(typeof q.displayText).toBe('string');
  });

  it('choices는 정확히 4개이다', () => {
    const params = makeParams();
    const q = generateQuestionByRule('g1s1-add-single-no-carry', params);
    expect(q.choices.length).toBe(4);
  });

  it('choices에 correctAnswer가 포함된다', () => {
    const params = makeParams();
    const q = generateQuestionByRule('g1s1-add-single-no-carry', params);
    expect(q.choices).toContain(q.correctAnswer);
  });

  it('choices 내 중복이 없다', () => {
    const params = makeParams();
    const q = generateQuestionByRule('g1s1-add-single-no-carry', params);
    const unique = new Set(q.choices);
    expect(unique.size).toBe(q.choices.length);
  });

  it('correctIndex는 choices 배열 안 correctAnswer의 실제 인덱스와 일치한다', () => {
    const params = makeParams();
    const q = generateQuestionByRule('g1s1-add-single-no-carry', params);
    expect(q.choices[q.correctIndex]).toBe(q.correctAnswer);
  });

  // ── 연산 정확성 ─────────────────────────────────────────────────────────────

  it('[add] operandA + operandB === correctAnswer', () => {
    const params = makeParams();
    for (let i = 0; i < 10; i++) {
      clearQuestionCache();
      const q = generateQuestionByRule('g1s1-add-single-no-carry', params);
      expect(q.operandA + q.operandB).toBe(q.correctAnswer);
    }
  });

  it('[sub] operandA - operandB === correctAnswer', () => {
    const params = makeParams({ operandScaleFactor: 1.0 });
    for (let i = 0; i < 10; i++) {
      clearQuestionCache();
      const q = generateQuestionByRule('g1s1-sub-single', params);
      expect(q.operandA - q.operandB).toBe(q.correctAnswer);
    }
  });

  it('[mul] operandA * operandB === correctAnswer', () => {
    const params = makeParams({ operandScaleFactor: 1.0 });
    for (let i = 0; i < 10; i++) {
      clearQuestionCache();
      const q = generateQuestionByRule('g2s1-mul-2-5', params);
      expect(q.operandA * q.operandB).toBe(q.correctAnswer);
    }
  });

  // ── 1학년 1학기 덧셈: result ≤ 9 ────────────────────────────────────────────

  it('[g1s1-add-single-no-carry] correctAnswer는 resultRange [2,9] 안에 있다', () => {
    const params = makeParams();
    for (let i = 0; i < 15; i++) {
      clearQuestionCache();
      const q = generateQuestionByRule('g1s1-add-single-no-carry', params);
      expect(q.correctAnswer).toBeGreaterThanOrEqual(2);
      expect(q.correctAnswer).toBeLessThanOrEqual(9);
    }
  });

  // ── 1학년 1학기 뺄셈: result ≥ 1 ────────────────────────────────────────────

  it('[g1s1-sub-single] correctAnswer는 resultRange [1,8] 안에 있다 — 음수 없음', () => {
    const params = makeParams();
    for (let i = 0; i < 15; i++) {
      clearQuestionCache();
      const q = generateQuestionByRule('g1s1-sub-single', params);
      expect(q.correctAnswer).toBeGreaterThanOrEqual(1);
    }
  });

  // ── 2학년 1학기 덧셈: 받아올림 없음 ──────────────────────────────────────────

  it('[g2s1-add-2d2d-no-carry] 각 자릿수 합이 9를 넘지 않는다 (받아올림 없음)', () => {
    const params = makeParams({ operandScaleFactor: 1.0 });
    for (let i = 0; i < 15; i++) {
      clearQuestionCache();
      const q = generateQuestionByRule('g2s1-add-2d2d-no-carry', params);
      const a1 = q.operandA % 10;
      const b1 = q.operandB % 10;
      const a10 = Math.floor(q.operandA / 10);
      const b10 = Math.floor(q.operandB / 10);
      expect(a1 + b1).toBeLessThanOrEqual(9);
      expect(a10 + b10).toBeLessThanOrEqual(9);
    }
  });

  // ── 나눗셈 remainder 필드 ─────────────────────────────────────────────────────

  it('[g3s1-div-remainder] remainder 필드가 존재하며 undefined가 아니다', () => {
    const params = makeParams({ operandScaleFactor: 1.0 });
    clearQuestionCache();
    const q = generateQuestionByRule('g3s1-div-remainder', params);
    expect(q.remainder).toBeDefined();
    expect(typeof q.remainder).toBe('number');
  });

  it('[g3s1-div-remainder] remainder === operandA % operandB', () => {
    const params = makeParams({ operandScaleFactor: 1.0 });
    for (let i = 0; i < 10; i++) {
      clearQuestionCache();
      const q = generateQuestionByRule('g3s1-div-remainder', params);
      expect(q.remainder).toBe(q.operandA % q.operandB);
    }
  });

  it('[나머지 없는 나눗셈] div-basic에서 remainder는 0이거나 undefined이다', () => {
    const params = makeParams({ operandScaleFactor: 1.0 });
    for (let i = 0; i < 10; i++) {
      clearQuestionCache();
      const q = generateQuestionByRule('g3s1-div-basic', params);
      // remainder 필드 자체가 없거나(undefined) 있으면 0이어야 함
      if (q.remainder !== undefined) {
        expect(q.remainder).toBe(0);
      }
    }
  });

  // ── displayText 형식 ──────────────────────────────────────────────────────────

  it('displayText는 "A op B = ?" 형식을 포함한다', () => {
    const params = makeParams();
    const q = generateQuestionByRule('g1s1-add-single-no-carry', params);
    expect(q.displayText).toMatch(/\d+\s[+\-×÷]\s\d+\s=\s\?/);
  });

  // ── op 필드 ───────────────────────────────────────────────────────────────────

  it('op 필드는 해당 룰의 연산 타입과 일치한다', () => {
    const params = makeParams();
    const addQ = generateQuestionByRule('g1s1-add-single-no-carry', params);
    expect(addQ.op).toBe('add');
    clearQuestionCache();
    const subQ = generateQuestionByRule('g1s1-sub-single', params);
    expect(subQ.op).toBe('sub');
  });
});

// ── generateNextQuestion ──────────────────────────────────────────────────────

describe('generateNextQuestion', () => {
  beforeEach(() => {
    clearQuestionCache();
  });

  it('단일 weight에서 항상 해당 ruleId의 문제를 생성한다', () => {
    const params = makeParams({
      ruleWeights: [{ ruleId: 'g1s1-add-single-no-carry', weight: 1.0 }],
    });
    for (let i = 0; i < 5; i++) {
      clearQuestionCache();
      const q = generateNextQuestion(params);
      expect(q.ruleId).toBe('g1s1-add-single-no-carry');
    }
  });

  it('NewMathQuestion 구조를 반환한다', () => {
    const params = makeParams();
    const q = generateNextQuestion(params);
    expect(q).toHaveProperty('id');
    expect(q).toHaveProperty('ruleId');
    expect(q).toHaveProperty('correctAnswer');
    expect(q).toHaveProperty('choices');
    expect(q).toHaveProperty('correctIndex');
  });
});

// ── clearQuestionCache ────────────────────────────────────────────────────────

describe('clearQuestionCache', () => {
  it('캐시 초기화 후에도 문제 생성이 정상 동작한다', () => {
    const params = makeParams();
    // 10개 채우기
    for (let i = 0; i < 10; i++) {
      clearQuestionCache();
      generateQuestionByRule('g1s1-add-single-no-carry', params);
    }
    clearQuestionCache();
    // 초기화 후에도 예외 없이 동작
    expect(() => generateQuestionByRule('g1s1-add-single-no-carry', params)).not.toThrow();
  });
});
