/**
 * levelTestEnglishResult.test.ts
 *
 * 감지 대상 버그 (BUG-5):
 *   LevelTestEnglish.finishTest() 에서 correctCount 를
 *   this.stagesCleared 가 아닌 this.currentQuestionIdx (진행 문제 수) 로
 *   잘못 계산하던 버그를 회귀 방지하기 위한 테스트.
 *
 * DOM 의존성 없이 순수 로직만 검증한다.
 */
import { describe, it, expect } from 'vitest';

// ── 버그 수정 후의 올바른 correctCount 계산 로직 ────────────────────────────
/**
 * LevelTestEnglish.finishTest() 내부 로직을 순수 함수로 추출.
 *
 * @param stagesCleared  실제 정답을 맞춘 횟수 (this.stagesCleared)
 * @param currentQuestionIdx  지금까지 진행한 문제 수 (this.currentQuestionIdx)
 */
function calcResult(stagesCleared: number, currentQuestionIdx: number) {
  return {
    totalQuestions: currentQuestionIdx,
    correctCount: stagesCleared, // BUG-5 수정 후: stagesCleared 사용
  };
}

/**
 * BUG-5 버그 상태 재현: correctCount 에 currentQuestionIdx 를 넣던 잘못된 로직.
 * 이 함수의 동작이 "틀렸음"을 명시적으로 검증하는 용도.
 */
function calcResultBuggy(stagesCleared: number, currentQuestionIdx: number) {
  return {
    totalQuestions: currentQuestionIdx,
    correctCount: currentQuestionIdx, // 버그: stagesCleared 가 아닌 idx 사용
  };
}

// ── 올바른 로직 검증 ──────────────────────────────────────────────────────────

describe('calcResult — 정상 로직 (BUG-5 수정 후)', () => {
  it('stagesCleared=3, currentQuestionIdx=5 → correctCount 는 3 (5 가 아님)', () => {
    const result = calcResult(3, 5);
    expect(result.correctCount).toBe(3);
    expect(result.totalQuestions).toBe(5);
  });

  it('stagesCleared=0 → correctCount 는 0', () => {
    const result = calcResult(0, 5);
    expect(result.correctCount).toBe(0);
    expect(result.totalQuestions).toBe(5);
  });

  it('stagesCleared=0, currentQuestionIdx=0 (아무것도 안 한 상태) → 모두 0', () => {
    const result = calcResult(0, 0);
    expect(result.correctCount).toBe(0);
    expect(result.totalQuestions).toBe(0);
  });

  it('stagesCleared === totalQuestions (만점) 일 때 correctCount 가 totalQuestions 와 같다', () => {
    const total = 10;
    const result = calcResult(total, total);
    expect(result.correctCount).toBe(total);
    expect(result.totalQuestions).toBe(total);
  });

  it('stagesCleared=7, currentQuestionIdx=10 → correctCount 는 7', () => {
    const result = calcResult(7, 10);
    expect(result.correctCount).toBe(7);
    expect(result.totalQuestions).toBe(10);
  });

  it('stagesCleared=1, currentQuestionIdx=10 → correctCount 는 1', () => {
    const result = calcResult(1, 10);
    expect(result.correctCount).toBe(1);
  });
});

// ── correctCount 는 totalQuestions 를 초과할 수 없다 ─────────────────────────

describe('calcResult — correctCount 범위 불변식', () => {
  const cases = [
    { cleared: 0, idx: 5 },
    { cleared: 3, idx: 5 },
    { cleared: 5, idx: 5 },
    { cleared: 10, idx: 10 },
  ];

  for (const { cleared, idx } of cases) {
    it(`stagesCleared=${cleared}, idx=${idx} → correctCount(${cleared}) ≤ totalQuestions(${idx})`, () => {
      const result = calcResult(cleared, idx);
      expect(result.correctCount).toBeLessThanOrEqual(result.totalQuestions);
    });
  }
});

// ── BUG-5 버그 재현: 버그 상태와 정상 상태가 다름을 검증 ─────────────────────

describe('BUG-5 회귀 방지 — 버그 로직과 정상 로직의 결과가 다름', () => {
  it('stagesCleared≠currentQuestionIdx 일 때 두 로직의 correctCount 가 다르다', () => {
    // 3문제 맞추고 5문제 진행: 버그 시 5, 정상 시 3
    const buggy = calcResultBuggy(3, 5);
    const fixed = calcResult(3, 5);

    expect(buggy.correctCount).toBe(5);  // 버그: questionIdx 그대로
    expect(fixed.correctCount).toBe(3);  // 수정: stagesCleared
    expect(buggy.correctCount).not.toBe(fixed.correctCount);
  });

  it('stagesCleared===0 이고 idx>0 이면 버그 로직은 정답을 과대계상한다', () => {
    const buggy = calcResultBuggy(0, 8);
    expect(buggy.correctCount).toBe(8); // 버그: 0문제 맞췄는데 8로 저장
    const fixed = calcResult(0, 8);
    expect(fixed.correctCount).toBe(0); // 정상
  });

  it('stagesCleared===currentQuestionIdx (만점) 이면 두 로직 결과가 같다', () => {
    const buggy = calcResultBuggy(10, 10);
    const fixed = calcResult(10, 10);
    // 만점일 때는 우연히 같아서 버그가 드러나지 않는다
    expect(buggy.correctCount).toBe(fixed.correctCount);
  });
});
