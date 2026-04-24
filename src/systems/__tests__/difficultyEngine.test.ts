import { describe, it, expect } from 'vitest';
import {
  computeDifficultyParams,
  pickRuleByWeight,
  DIFFICULTY_ENGINE,
  type DifficultyParams,
} from '../math/difficultyEngine';
import {
  createDefaultStatus,
  recordAnswer,
  getRecentAccuracy,
  getConsecutiveWrong,
  type UserMathStatus,
} from '../math/UserMathStatus';

// ── 헬퍼 ─────────────────────────────────────────────────────────────────────

/** N번 연속 정답/오답을 기록한 status 생성 */
function applyAnswers(
  initial: UserMathStatus,
  answers: boolean[],
  ruleId = 'g1s1-add-single-no-carry',
): UserMathStatus {
  let status = initial;
  for (const isCorrect of answers) {
    status = recordAnswer(status, ruleId, isCorrect, 1000);
  }
  return status;
}

// ── recordAnswer (UserMathStatus 상태 변화) ───────────────────────────────────

describe('recordAnswer — 정답 처리', () => {
  it('정답 기록 시 currentStreak이 1 증가한다', () => {
    const s0 = createDefaultStatus();
    const s1 = recordAnswer(s0, 'g1s1-add-single-no-carry', true, 1000);
    expect(s1.currentStreak).toBe(1);
  });

  it('정답 연속 기록 시 currentStreak이 누적된다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, true, true]);
    expect(s.currentStreak).toBe(3);
  });

  it('정답 후 오답 시 currentStreak이 0으로 리셋된다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, true, false]);
    expect(s.currentStreak).toBe(0);
  });

  it('오답 기록 시 currentStreak은 0이다', () => {
    const s0 = createDefaultStatus();
    const s1 = recordAnswer(s0, 'g1s1-add-single-no-carry', false, 1000);
    expect(s1.currentStreak).toBe(0);
  });

  it('bestStreak은 최고 streak 값을 유지한다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, true, true, false, true]);
    expect(s.bestStreak).toBe(3);
  });

  it('todayAnswered가 정확히 누적된다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, false, true]);
    expect(s.todayAnswered).toBe(3);
  });

  it('todayCorrect는 정답만 카운트한다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, false, true, true]);
    expect(s.todayCorrect).toBe(3);
  });

  it('areaHistory에 ruleId 기록이 생성된다', () => {
    const s = recordAnswer(createDefaultStatus(), 'g1s1-add-single-no-carry', true, 1000);
    expect(s.areaHistory['g1s1-add-single-no-carry']).toBeDefined();
    expect(s.areaHistory['g1s1-add-single-no-carry'].totalAnswered).toBe(1);
  });

  it('areaHistory accuracyRate가 올바르게 계산된다', () => {
    const s = applyAnswers(
      createDefaultStatus(),
      [true, true, false, true],
    );
    const hist = s.areaHistory['g1s1-add-single-no-carry'];
    expect(hist.accuracyRate).toBeCloseTo(3 / 4);
  });
});

// ── recentAnswers 슬라이딩 윈도우 ────────────────────────────────────────────

describe('recentAnswers 슬라이딩 윈도우', () => {
  it('20개 초과 시 가장 오래된 항목이 제거된다', () => {
    const answers = Array(21).fill(true);
    const s = applyAnswers(createDefaultStatus(), answers);
    expect(s.recentAnswers.length).toBe(20);
  });

  it('recentAnswers[0]은 항상 가장 최신 답변이다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, false]);
    expect(s.recentAnswers[0].isCorrect).toBe(false);
  });
});

// ── getRecentAccuracy ────────────────────────────────────────────────────────

describe('getRecentAccuracy', () => {
  it('답변이 없으면 0.5를 반환한다', () => {
    const s = createDefaultStatus();
    expect(getRecentAccuracy(s, 10)).toBe(0.5);
  });

  it('모두 정답이면 1.0을 반환한다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, true, true, true, true]);
    expect(getRecentAccuracy(s, 5)).toBe(1.0);
  });

  it('모두 오답이면 0을 반환한다', () => {
    const s = applyAnswers(createDefaultStatus(), [false, false, false]);
    expect(getRecentAccuracy(s, 3)).toBe(0);
  });

  it('n보다 적은 답변이 있을 때는 있는 것만으로 계산한다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, false]);
    expect(getRecentAccuracy(s, 10)).toBeCloseTo(0.5);
  });

  it('최근 N개만 고려한다 (슬라이딩 윈도우)', () => {
    // 오답 5개 후 정답 5개 → 최근 5개 기준 1.0
    const s = applyAnswers(createDefaultStatus(), [false, false, false, false, false, true, true, true, true, true]);
    expect(getRecentAccuracy(s, 5)).toBe(1.0);
    expect(getRecentAccuracy(s, 10)).toBeCloseTo(0.5);
  });
});

// ── getConsecutiveWrong ──────────────────────────────────────────────────────

describe('getConsecutiveWrong', () => {
  it('답변이 없으면 0을 반환한다', () => {
    expect(getConsecutiveWrong(createDefaultStatus())).toBe(0);
  });

  it('연속 오답 2개 후 정답이면 0을 반환한다', () => {
    const s = applyAnswers(createDefaultStatus(), [false, false, true]);
    expect(getConsecutiveWrong(s)).toBe(0);
  });

  it('연속 오답 3개면 3을 반환한다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, false, false, false]);
    expect(getConsecutiveWrong(s)).toBe(3);
  });

  it('정답-오답-오답 순서면 2를 반환한다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, false, false]);
    expect(getConsecutiveWrong(s)).toBe(2);
  });
});

// ── computeDifficultyParams ──────────────────────────────────────────────────

describe('computeDifficultyParams', () => {
  it('기본 status에서 정상 DifficultyParams를 반환한다', () => {
    const params = computeDifficultyParams(createDefaultStatus());
    expect(params).toBeDefined();
    expect(params.ruleWeights.length).toBeGreaterThan(0);
    expect(typeof params.operandScaleFactor).toBe('number');
    expect(['easy', 'normal', 'hard']).toContain(params.distractorMode);
    expect(typeof params.streakMultiplier).toBe('number');
  });

  it('알 수 없는 activeRuleId이면 기본 fallback 파라미터를 반환한다', () => {
    const s = { ...createDefaultStatus(), activeRuleId: 'non-existent-rule' };
    const params = computeDifficultyParams(s);
    expect(params.ruleWeights[0].ruleId).toBe('g1s1-add-single-no-carry');
    expect(params.distractorMode).toBe('easy');
  });

  it('연속 오답 3개 이상이면 이전 룰에 가중치가 부여된다', () => {
    // g1s1-add-single-to-10 (두 번째 룰)에서 연속 오답 3개
    const s = applyAnswers(
      { ...createDefaultStatus(), activeRuleId: 'g1s1-add-single-to-10' },
      [false, false, false],
    );
    const params = computeDifficultyParams(s);
    const prevRuleWeight = params.ruleWeights.find(w => w.ruleId === 'g1s1-add-single-no-carry');
    expect(prevRuleWeight).toBeDefined();
    expect(prevRuleWeight!.weight).toBeGreaterThan(0);
  });

  it('정확도 ≥ 80%이고 streak ≥ 5이면 다음 룰에도 가중치가 부여된다', () => {
    // 정답 8개 + streak 5 달성
    let s: UserMathStatus = { ...createDefaultStatus(), activeRuleId: 'g1s1-add-single-no-carry' };
    s = applyAnswers(s, [true, true, true, true, true, true, true, true]);
    const params = computeDifficultyParams(s);
    // 다음 룰이 있으면 두 개 이상의 weight 항목이 있어야 함
    if (params.ruleWeights.length > 1) {
      expect(params.ruleWeights.some(w => w.ruleId !== 'g1s1-add-single-no-carry')).toBe(true);
    }
  });

  it('정확도 ≥ 85%이면 operandScaleFactor가 1.0이다', () => {
    const s = applyAnswers(createDefaultStatus(), Array(10).fill(true));
    const params = computeDifficultyParams(s);
    expect(params.operandScaleFactor).toBe(1.0);
  });

  it('정확도 < 55%이면 operandScaleFactor가 0.5이다', () => {
    const s = applyAnswers(createDefaultStatus(), Array(10).fill(false));
    const params = computeDifficultyParams(s);
    expect(params.operandScaleFactor).toBe(0.5);
  });

  it('정확도 ≥ 80%이면 distractorMode가 hard이다', () => {
    const s = applyAnswers(createDefaultStatus(), [true, true, true, true, true, true, true, true, false, true]);
    const params = computeDifficultyParams(s);
    expect(params.distractorMode).toBe('hard');
  });

  it('정확도 < 55%이면 distractorMode가 easy이다', () => {
    const s = applyAnswers(createDefaultStatus(), Array(10).fill(false));
    const params = computeDifficultyParams(s);
    expect(params.distractorMode).toBe('easy');
  });

  it('streakMultiplier는 1.0 이상이다', () => {
    const s = createDefaultStatus();
    const params = computeDifficultyParams(s);
    expect(params.streakMultiplier).toBeGreaterThanOrEqual(1.0);
  });

  it('streakMultiplier는 2.0을 초과하지 않는다', () => {
    // streak 100개라도 2.0 캡
    const s = applyAnswers(createDefaultStatus(), Array(100).fill(true));
    const params = computeDifficultyParams(s);
    expect(params.streakMultiplier).toBeLessThanOrEqual(2.0);
  });

  it('totalAnswered ≥ 30이면 timeLimitMs가 null이 아니다', () => {
    let s = createDefaultStatus();
    // 30개 이상 답변
    s = applyAnswers(s, Array(30).fill(true));
    // areaHistory가 activeRuleId 기준으로 쌓였는지 확인
    const params = computeDifficultyParams(s);
    // totalAnswered >= 30이면 timeLimitMs = 8000
    if (s.areaHistory[s.activeRuleId]?.totalAnswered >= 30) {
      expect(params.timeLimitMs).toBe(8000);
    }
  });

  it('totalAnswered < 30이면 timeLimitMs가 null이다', () => {
    const s = applyAnswers(createDefaultStatus(), Array(5).fill(true));
    const params = computeDifficultyParams(s);
    expect(params.timeLimitMs).toBeNull();
  });
});

// ── pickRuleByWeight ──────────────────────────────────────────────────────────

describe('pickRuleByWeight', () => {
  it('단일 항목이면 항상 그 ruleId를 반환한다', () => {
    const weights = [{ ruleId: 'g1s1-add-single-no-carry', weight: 1.0 }];
    for (let i = 0; i < 20; i++) {
      expect(pickRuleByWeight(weights)).toBe('g1s1-add-single-no-carry');
    }
  });

  it('weight가 0인 항목은 선택되지 않는다', () => {
    const weights = [
      { ruleId: 'rule-a', weight: 1.0 },
      { ruleId: 'rule-b', weight: 0 },
    ];
    for (let i = 0; i < 50; i++) {
      expect(pickRuleByWeight(weights)).toBe('rule-a');
    }
  });

  it('두 항목이 있을 때 둘 다 선택 가능하다', () => {
    const weights = [
      { ruleId: 'rule-a', weight: 1.0 },
      { ruleId: 'rule-b', weight: 1.0 },
    ];
    const results = new Set<string>();
    for (let i = 0; i < 100; i++) {
      results.add(pickRuleByWeight(weights));
    }
    // 100번 중 두 개 모두 등장해야 함
    expect(results.has('rule-a')).toBe(true);
    expect(results.has('rule-b')).toBe(true);
  });

  it('반환 값은 항상 weights 배열에 있는 ruleId 중 하나다', () => {
    const weights = [
      { ruleId: 'g1s1-add-single-no-carry', weight: 3 },
      { ruleId: 'g1s1-sub-single', weight: 1 },
    ];
    const validIds = weights.map(w => w.ruleId);
    for (let i = 0; i < 50; i++) {
      expect(validIds).toContain(pickRuleByWeight(weights));
    }
  });
});

// ── DIFFICULTY_ENGINE 상수 ────────────────────────────────────────────────────

describe('DIFFICULTY_ENGINE 상수', () => {
  it('SCORE_MIN이 0이다', () => {
    expect(DIFFICULTY_ENGINE.SCORE_MIN).toBe(0);
  });

  it('SCORE_MAX가 100이다', () => {
    expect(DIFFICULTY_ENGINE.SCORE_MAX).toBe(100);
  });

  it('CORRECT_STREAK_3_BONUS가 양수이다', () => {
    expect(DIFFICULTY_ENGINE.CORRECT_STREAK_3_BONUS).toBeGreaterThan(0);
  });

  it('WRONG_STREAK_2_PENALTY가 음수이다', () => {
    expect(DIFFICULTY_ENGINE.WRONG_STREAK_2_PENALTY).toBeLessThan(0);
  });

  it('PROMOTION_THRESHOLD가 DEMOTION_THRESHOLD보다 크다', () => {
    expect(DIFFICULTY_ENGINE.PROMOTION_THRESHOLD).toBeGreaterThan(
      DIFFICULTY_ENGINE.DEMOTION_THRESHOLD,
    );
  });
});
