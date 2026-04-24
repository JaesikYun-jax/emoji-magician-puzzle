/**
 * gamification/types.ts
 * streak · 일일 XP · 레슨 진행 등 게이미피케이션 공유 타입 정의.
 * streak.ts / dailyXp.ts / SaveService 가 이 타입을 공통으로 참조한다.
 */

export interface GamificationState {
  /** dayKey(YYYY-MM-DD) → 해당 날에 획득한 XP */
  xpByDay: Record<string, number>;

  /** 오늘 기준 연속 달성 일수 */
  currentStreak: number;

  /** 역대 최장 연속 달성 일수 */
  longestStreak: number;

  /** 마지막으로 XP 를 획득한 dayKey (없으면 null) */
  lastActiveDay: string | null;

  /** 일일 목표 XP (기본값 50) */
  dailyGoalXp: number;

  /**
   * lessonId → 진행 상태
   * 'started' : 한 번 이상 플레이
   * 'cleared' : 클리어(별점 ≥ 2 등 조건 충족)
   */
  lessonProgress: Record<string, 'cleared' | 'started'>;
}

export const DEFAULT_DAILY_GOAL_XP = 50;

export function createDefaultGamificationState(): GamificationState {
  return {
    xpByDay: {},
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDay: null,
    dailyGoalXp: DEFAULT_DAILY_GOAL_XP,
    lessonProgress: {},
  };
}
