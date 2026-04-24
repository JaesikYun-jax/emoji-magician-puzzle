import { describe, it, expect } from 'vitest';
import { applyXp, isGoalReached } from '../../systems/gamification/dailyXp';
import { createDefaultGamificationState } from '../../systems/gamification/types';

const TODAY = '2026-04-23';

describe('isGoalReached', () => {
  it('xp 가 0 일 때 false 를 반환한다', () => {
    const state = createDefaultGamificationState();
    expect(isGoalReached(state, TODAY)).toBe(false);
  });

  it('xp 가 dailyGoalXp 미만이면 false 를 반환한다', () => {
    const state = { ...createDefaultGamificationState(), xpByDay: { [TODAY]: 49 } };
    expect(isGoalReached(state, TODAY)).toBe(false);
  });

  it('xp 가 dailyGoalXp 이상이면 true 를 반환한다', () => {
    const state = { ...createDefaultGamificationState(), xpByDay: { [TODAY]: 50 } };
    expect(isGoalReached(state, TODAY)).toBe(true);
  });

  it('xp 가 dailyGoalXp 초과해도 true 를 반환한다', () => {
    const state = { ...createDefaultGamificationState(), xpByDay: { [TODAY]: 100 } };
    expect(isGoalReached(state, TODAY)).toBe(true);
  });
});

describe('applyXp', () => {
  it('xpByDay 에 해당 날짜 XP 가 추가된다', () => {
    const state = createDefaultGamificationState();
    const next = applyXp(state, TODAY, 20);
    expect(next.xpByDay[TODAY]).toBe(20);
  });

  it('같은 날 여러 번 적립하면 누적된다', () => {
    let state = createDefaultGamificationState();
    state = applyXp(state, TODAY, 20);
    state = applyXp(state, TODAY, 30);
    expect(state.xpByDay[TODAY]).toBe(50);
  });

  it('goal 달성 후 lastActiveDay 가 갱신된다', () => {
    const state = createDefaultGamificationState();
    const next = applyXp(state, TODAY, 50);
    expect(next.lastActiveDay).toBe(TODAY);
  });

  it('streak 이 올바르게 계산된다 (어제·오늘 달성 → streak=2)', () => {
    const YESTERDAY = '2026-04-22';
    let state = createDefaultGamificationState();
    state = applyXp(state, YESTERDAY, 50);
    state = applyXp(state, TODAY, 50);
    // computeStreak 기준: today 부터 역산, 2일 연속
    expect(state.currentStreak).toBe(2);
  });

  it('longestStreak 이 currentStreak 의 최대값을 유지한다', () => {
    let state = createDefaultGamificationState();
    // 3일 연속
    state = applyXp(state, '2026-04-21', 50);
    state = applyXp(state, '2026-04-22', 50);
    state = applyXp(state, TODAY, 50);
    const longestAfter3 = state.longestStreak; // should be 3

    // 새로운 날(하루 공백)
    state = applyXp(state, '2026-04-25', 50); // 04-24 빠짐 → streak 1
    expect(state.longestStreak).toBe(longestAfter3);
    expect(state.currentStreak).toBe(1);
  });

  it('원본 state 를 변경하지 않는다 (불변)', () => {
    const state = createDefaultGamificationState();
    const _ = applyXp(state, TODAY, 30);
    expect(state.xpByDay[TODAY]).toBeUndefined();
  });

  it('14일 롤링 윈도우 — 15일 이상 지난 항목은 제거된다', () => {
    const oldDay = '2026-04-08'; // TODAY 에서 15일 전
    let state = createDefaultGamificationState();
    // 오래된 날에 XP 넣기
    state = { ...state, xpByDay: { [oldDay]: 50 } };
    // 오늘 XP 적립 → 정리 트리거
    state = applyXp(state, TODAY, 10);
    expect(state.xpByDay[oldDay]).toBeUndefined();
  });

  it('13일 이내 항목은 롤링 윈도우에서 유지된다', () => {
    const recentDay = '2026-04-10'; // TODAY 에서 13일 전
    let state = createDefaultGamificationState();
    state = { ...state, xpByDay: { [recentDay]: 50 } };
    state = applyXp(state, TODAY, 10);
    expect(state.xpByDay[recentDay]).toBe(50);
  });
});
