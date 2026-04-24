import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createDefaultStatus,
  recordAnswer,
  initFromLevelTest,
  getRecentAccuracy,
  getConsecutiveWrong,
  getTodayDate,
  type UserMathStatus,
  type RecentAnswer,
} from '../math/UserMathStatus';

const RULE_ID = 'g1s1-add-single-no-carry';

function makeStatus(overrides: Partial<UserMathStatus> = {}): UserMathStatus {
  return { ...createDefaultStatus(), ...overrides };
}

describe('createDefaultStatus()', () => {
  it('grade 1, semester 1 로 초기화된다', () => {
    const s = createDefaultStatus();
    expect(s.grade).toBe(1);
    expect(s.semester).toBe(1);
  });

  it('activeRuleId 가 첫 번째 룰로 설정된다', () => {
    const s = createDefaultStatus();
    expect(s.activeRuleId).toBe('g1s1-add-single-no-carry');
  });

  it('todayAnswered, todayCorrect, currentStreak, bestStreak 이 0이다', () => {
    const s = createDefaultStatus();
    expect(s.todayAnswered).toBe(0);
    expect(s.todayCorrect).toBe(0);
    expect(s.currentStreak).toBe(0);
    expect(s.bestStreak).toBe(0);
  });

  it('areaHistory 와 recentAnswers 가 비어있다', () => {
    const s = createDefaultStatus();
    expect(s.areaHistory).toEqual({});
    expect(s.recentAnswers).toEqual([]);
  });

  it('levelTestCompletedAt, levelTestRuleId 가 null 이다', () => {
    const s = createDefaultStatus();
    expect(s.levelTestCompletedAt).toBeNull();
    expect(s.levelTestRuleId).toBeNull();
  });

  it('todayDate 가 오늘 날짜(YYYY-MM-DD) 형식이다', () => {
    const s = createDefaultStatus();
    expect(s.todayDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('recordAnswer() - 정답', () => {
  it('todayAnswered 가 1 증가한다', () => {
    const s = makeStatus();
    const next = recordAnswer(s, RULE_ID, true, 1000);
    expect(next.todayAnswered).toBe(1);
  });

  it('todayCorrect 가 1 증가한다', () => {
    const s = makeStatus();
    const next = recordAnswer(s, RULE_ID, true, 1000);
    expect(next.todayCorrect).toBe(1);
  });

  it('currentStreak 이 1 증가한다', () => {
    const s = makeStatus({ currentStreak: 3 });
    const next = recordAnswer(s, RULE_ID, true, 1000);
    expect(next.currentStreak).toBe(4);
  });

  it('areaHistory 에 ruleId 가 기록된다', () => {
    const s = makeStatus();
    const next = recordAnswer(s, RULE_ID, true, 1000);
    expect(next.areaHistory[RULE_ID]).toBeDefined();
    expect(next.areaHistory[RULE_ID].totalAnswered).toBe(1);
    expect(next.areaHistory[RULE_ID].totalCorrect).toBe(1);
  });

  it('accuracyRate 가 1.0 이다 (첫 정답)', () => {
    const s = makeStatus();
    const next = recordAnswer(s, RULE_ID, true, 1000);
    expect(next.areaHistory[RULE_ID].accuracyRate).toBeCloseTo(1.0);
  });

  it('recentAnswers 의 첫 번째 항목이 최신 답변이다', () => {
    const s = makeStatus();
    const next = recordAnswer(s, RULE_ID, true, 1500);
    expect(next.recentAnswers[0].isCorrect).toBe(true);
    expect(next.recentAnswers[0].ruleId).toBe(RULE_ID);
    expect(next.recentAnswers[0].timeTakenMs).toBe(1500);
  });

  it('recentAnswers 는 최대 20개로 제한된다', () => {
    let s = makeStatus();
    for (let i = 0; i < 25; i++) {
      s = recordAnswer(s, RULE_ID, true, 1000);
    }
    expect(s.recentAnswers.length).toBe(20);
  });
});

describe('recordAnswer() - 오답', () => {
  it('currentStreak 이 0으로 리셋된다', () => {
    const s = makeStatus({ currentStreak: 7 });
    const next = recordAnswer(s, RULE_ID, false, 1000);
    expect(next.currentStreak).toBe(0);
  });

  it('todayAnswered 는 증가하고 todayCorrect 는 증가하지 않는다', () => {
    const s = makeStatus({ todayAnswered: 3, todayCorrect: 3 });
    const next = recordAnswer(s, RULE_ID, false, 1000);
    expect(next.todayAnswered).toBe(4);
    expect(next.todayCorrect).toBe(3);
  });

  it('areaHistory.totalCorrect 는 증가하지 않는다', () => {
    const s = makeStatus();
    const next = recordAnswer(s, RULE_ID, false, 1000);
    expect(next.areaHistory[RULE_ID].totalCorrect).toBe(0);
    expect(next.areaHistory[RULE_ID].totalAnswered).toBe(1);
  });

  it('accuracyRate 가 0.0 이다 (첫 오답)', () => {
    const s = makeStatus();
    const next = recordAnswer(s, RULE_ID, false, 1000);
    expect(next.areaHistory[RULE_ID].accuracyRate).toBeCloseTo(0.0);
  });
});

describe('bestStreak 추적', () => {
  it('currentStreak 이 bestStreak 보다 높아지면 bestStreak 갱신된다', () => {
    let s = makeStatus({ bestStreak: 3 });
    // streak 을 4까지 올림
    s = recordAnswer(s, RULE_ID, true, 1000);
    s = recordAnswer(s, RULE_ID, true, 1000);
    s = recordAnswer(s, RULE_ID, true, 1000);
    s = recordAnswer(s, RULE_ID, true, 1000);
    expect(s.bestStreak).toBe(4);
  });

  it('streak 이 리셋돼도 bestStreak 은 유지된다', () => {
    let s = makeStatus({ currentStreak: 5, bestStreak: 5 });
    s = recordAnswer(s, RULE_ID, false, 1000);
    expect(s.currentStreak).toBe(0);
    expect(s.bestStreak).toBe(5);
  });
});

describe('날짜 변경 시 todayAnswered 리셋', () => {
  it('todayDate 가 다르면 todayAnswered 가 1로 리셋된다', () => {
    const yesterday = '2026-01-01';
    const s = makeStatus({ todayDate: yesterday, todayAnswered: 10, todayCorrect: 8 });

    // getTodayDate() 는 실제 오늘 날짜를 반환하므로 어제와 다르면 리셋
    const today = getTodayDate();
    if (today !== yesterday) {
      const next = recordAnswer(s, RULE_ID, true, 1000);
      expect(next.todayAnswered).toBe(1);
      expect(next.todayCorrect).toBe(1);
      expect(next.todayDate).toBe(today);
    }
    // 같은 날 테스트 환경이라면 스킵
  });

  it('todayDate 가 같으면 todayAnswered 가 누적된다', () => {
    const today = getTodayDate();
    const s = makeStatus({ todayDate: today, todayAnswered: 5, todayCorrect: 4 });
    const next = recordAnswer(s, RULE_ID, true, 1000);
    expect(next.todayAnswered).toBe(6);
    expect(next.todayCorrect).toBe(5);
  });
});

describe('getRecentAccuracy()', () => {
  it('recentAnswers 가 없으면 0.5를 반환한다', () => {
    const s = makeStatus();
    expect(getRecentAccuracy(s, 10)).toBe(0.5);
  });

  it('모두 정답이면 1.0을 반환한다', () => {
    let s = makeStatus();
    for (let i = 0; i < 5; i++) {
      s = recordAnswer(s, RULE_ID, true, 1000);
    }
    expect(getRecentAccuracy(s, 5)).toBeCloseTo(1.0);
  });

  it('모두 오답이면 0.0을 반환한다', () => {
    let s = makeStatus();
    for (let i = 0; i < 5; i++) {
      s = recordAnswer(s, RULE_ID, false, 1000);
    }
    expect(getRecentAccuracy(s, 5)).toBeCloseTo(0.0);
  });

  it('정답 6개, 오답 4개이면 약 0.6을 반환한다', () => {
    let s = makeStatus();
    for (let i = 0; i < 6; i++) s = recordAnswer(s, RULE_ID, true, 1000);
    for (let i = 0; i < 4; i++) s = recordAnswer(s, RULE_ID, false, 1000);
    // recentAnswers 는 최신순이므로 slice(0, 10)하면 오답4+정답6
    expect(getRecentAccuracy(s, 10)).toBeCloseTo(0.6);
  });

  it('n 보다 적은 답변이 있을 때는 있는 것만으로 계산한다', () => {
    let s = makeStatus();
    s = recordAnswer(s, RULE_ID, true, 1000);
    s = recordAnswer(s, RULE_ID, false, 1000);
    // 2개 중 1개 정답 = 0.5
    expect(getRecentAccuracy(s, 10)).toBeCloseTo(0.5);
  });
});

describe('getConsecutiveWrong()', () => {
  it('오답이 없으면 0을 반환한다', () => {
    const s = makeStatus();
    expect(getConsecutiveWrong(s)).toBe(0);
  });

  it('연속 오답 3개이면 3을 반환한다', () => {
    let s = makeStatus();
    s = recordAnswer(s, RULE_ID, false, 1000);
    s = recordAnswer(s, RULE_ID, false, 1000);
    s = recordAnswer(s, RULE_ID, false, 1000);
    expect(getConsecutiveWrong(s)).toBe(3);
  });

  it('정답 후 오답이면 연속 오답은 초기화된다', () => {
    let s = makeStatus();
    s = recordAnswer(s, RULE_ID, false, 1000);
    s = recordAnswer(s, RULE_ID, false, 1000);
    s = recordAnswer(s, RULE_ID, true, 1000);  // 정답
    s = recordAnswer(s, RULE_ID, false, 1000);
    // recentAnswers: [틀림, 맞음, 틀림, 틀림] (최신순)
    // getConsecutiveWrong은 첫 요소부터 틀림 연속 카운트
    expect(getConsecutiveWrong(s)).toBe(1);
  });

  it('모두 오답이면 전체 수를 반환한다', () => {
    let s = makeStatus();
    for (let i = 0; i < 5; i++) {
      s = recordAnswer(s, RULE_ID, false, 1000);
    }
    expect(getConsecutiveWrong(s)).toBe(5);
  });
});

describe('initFromLevelTest()', () => {
  it('grade, semester, activeRuleId 가 올바르게 설정된다', () => {
    const result = initFromLevelTest('g2s1-add-2d2d-no-carry', 2, 1);
    expect(result.grade).toBe(2);
    expect(result.semester).toBe(1);
    expect(result.activeRuleId).toBe('g2s1-add-2d2d-no-carry');
  });

  it('levelTestCompletedAt 이 현재 시각(양수)으로 설정된다', () => {
    const before = Date.now();
    const result = initFromLevelTest('g2s1-add-2d2d-no-carry', 2, 1);
    const after = Date.now();
    expect(result.levelTestCompletedAt).not.toBeNull();
    expect(result.levelTestCompletedAt!).toBeGreaterThanOrEqual(before);
    expect(result.levelTestCompletedAt!).toBeLessThanOrEqual(after);
  });

  it('levelTestRuleId 가 ruleId 와 같다', () => {
    const result = initFromLevelTest('g3s1-div-basic', 3, 1);
    expect(result.levelTestRuleId).toBe('g3s1-div-basic');
  });

  it('streak 및 today 카운터는 초기값(0)으로 리셋된다', () => {
    const result = initFromLevelTest('g1s1-add-single-no-carry', 1, 1);
    expect(result.currentStreak).toBe(0);
    expect(result.bestStreak).toBe(0);
    expect(result.todayAnswered).toBe(0);
    expect(result.todayCorrect).toBe(0);
  });

  it('areaHistory 와 recentAnswers 가 비어있다', () => {
    const result = initFromLevelTest('g1s1-add-single-no-carry', 1, 1);
    expect(result.areaHistory).toEqual({});
    expect(result.recentAnswers).toEqual([]);
  });
});
