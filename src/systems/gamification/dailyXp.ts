/**
 * dailyXp.ts
 * 일일 XP 적용 및 목표 달성 확인 순수 함수.
 * GamificationState 를 직접 변경하지 않고 새 상태를 반환한다(불변).
 */

import type { GamificationState } from './types';
import { computeStreak } from './streak';
import { daysDiff } from './dateBoundary';

/**
 * xpByDay 를 최근 windowDays 일 이내 항목만 남기도록 정리한다.
 * today 기준으로 daysDiff >= windowDays 인 항목을 제거한다.
 */
function pruneOldDays(
  xpByDay: Record<string, number>,
  today: string,
  windowDays: number,
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, xp] of Object.entries(xpByDay)) {
    if (daysDiff(today, key) < windowDays) {
      result[key] = xp;
    }
  }
  return result;
}

/**
 * dayKey 날에 xpDelta 만큼 XP 를 적립하고 새 GamificationState 를 반환한다.
 * - xpByDay 는 최근 14일 롤링 윈도우로 관리된다.
 * - currentStreak / longestStreak 를 재계산한다.
 *
 * @param state     현재 상태 (불변 — 직접 수정 금지)
 * @param dayKey    적립할 날짜 (YYYY-MM-DD)
 * @param xpDelta   적립할 XP 양 (양수)
 */
export function applyXp(
  state: GamificationState,
  day: string,
  xpDelta: number,
): GamificationState {
  const updated: Record<string, number> = { ...state.xpByDay };
  updated[day] = (updated[day] ?? 0) + xpDelta;

  // 14일 롤링 윈도우 유지
  const pruned = pruneOldDays(updated, day, 14);

  const newStreak = computeStreak(pruned, state.dailyGoalXp, day);

  return {
    ...state,
    xpByDay: pruned,
    currentStreak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastActiveDay: day,
  };
}

/**
 * 해당 dayKey 에 일일 목표 XP 를 달성했는지 확인한다.
 */
export function isGoalReached(state: GamificationState, day: string): boolean {
  return (state.xpByDay[day] ?? 0) >= state.dailyGoalXp;
}
