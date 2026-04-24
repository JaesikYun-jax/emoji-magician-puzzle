/**
 * streak.ts
 * 연속 학습 일수(streak) 계산 순수 함수.
 */

import { subtractDays } from './dateBoundary';

/**
 * today 기준으로 연속 달성 일수를 계산한다.
 *
 * 규칙:
 * - xpByDay[day] >= goalXp 인 날을 "달성일"로 간주한다.
 * - 오늘 이미 달성했으면 오늘부터 역산한다.
 * - 오늘 미달성이면 어제부터 역산한다(아직 오늘 플레이 전이어도 streak 유지).
 * - 어제도 미달성이면 streak = 0 을 반환한다.
 *
 * @param xpByDay  dayKey → XP 맵
 * @param goalXp   하루 목표 XP (이 값 이상이어야 달성)
 * @param today    기준 dayKey (YYYY-MM-DD)
 * @returns        연속 달성 일수 (0 이상의 정수)
 */
export function computeStreak(
  xpByDay: Record<string, number>,
  goalXp: number,
  today: string,
): number {
  const todayXp = xpByDay[today] ?? 0;
  // 오늘 달성했으면 오늘부터, 아직 안 했으면 어제부터 역산 시작
  const startDay = todayXp >= goalXp ? today : subtractDays(today, 1);

  // 시작일도 미달성이면 streak 없음
  if ((xpByDay[startDay] ?? 0) < goalXp) return 0;

  let streak = 0;
  let day = startDay;
  while ((xpByDay[day] ?? 0) >= goalXp) {
    streak++;
    day = subtractDays(day, 1);
  }
  return streak;
}
