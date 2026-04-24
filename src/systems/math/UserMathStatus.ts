// getNextRule re-export for convenience
export { getNextRule } from '../../game-data/mathCurriculum';

/** @deprecated 하위 호환용. 새 코드는 userMathStatus.ts 의 UserMathStatus 인터페이스를 사용하세요. */
export type MathOperation = 'add' | 'sub' | 'mul' | 'div';

// ── 새 인터페이스 (룰 기반 시스템) ────────────────────────────────────────────

export interface AreaHistory {
  ruleId: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracyRate: number;
  lastPlayedAt: number;
}

export interface RecentAnswer {
  ruleId: string;
  isCorrect: boolean;
  answeredAt: number;
  timeTakenMs: number;
}

export interface UserMathStatus {
  grade: 1 | 2 | 3;
  semester: 1 | 2;
  activeRuleId: string;
  areaHistory: Record<string, AreaHistory>;
  recentAnswers: RecentAnswer[];  // 최대 20개, 앞 = 최신
  levelTestCompletedAt: number | null;
  levelTestRuleId: string | null;
  todayDate: string;  // 'YYYY-MM-DD'
  todayAnswered: number;
  todayCorrect: number;
  currentStreak: number;
  bestStreak: number;
}

export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function createDefaultStatus(): UserMathStatus {
  return {
    grade: 1,
    semester: 1,
    activeRuleId: 'g1s1-add-single-no-carry',
    areaHistory: {},
    recentAnswers: [],
    levelTestCompletedAt: null,
    levelTestRuleId: null,
    todayDate: getTodayDate(),
    todayAnswered: 0,
    todayCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
  };
}

/** @deprecated SaveService 하위 호환용 */
export const DEFAULT_STATUS: UserMathStatus = createDefaultStatus();

/** 정답/오답 기록 후 새 상태 반환 (immutable update) */
export function recordAnswer(
  status: UserMathStatus,
  ruleId: string,
  isCorrect: boolean,
  timeTakenMs: number,
): UserMathStatus {
  const now = Date.now();
  const today = getTodayDate();

  const todayAnswered = status.todayDate === today ? status.todayAnswered + 1 : 1;
  const todayCorrect = status.todayDate === today
    ? status.todayCorrect + (isCorrect ? 1 : 0)
    : (isCorrect ? 1 : 0);

  const currentStreak = isCorrect ? status.currentStreak + 1 : 0;
  const bestStreak = Math.max(status.bestStreak, currentStreak);

  const prev = status.areaHistory[ruleId] ?? {
    ruleId, totalAnswered: 0, totalCorrect: 0, accuracyRate: 0, lastPlayedAt: 0,
  };
  const totalAnswered = prev.totalAnswered + 1;
  const totalCorrect = prev.totalCorrect + (isCorrect ? 1 : 0);
  const areaHistory: Record<string, AreaHistory> = {
    ...status.areaHistory,
    [ruleId]: {
      ruleId,
      totalAnswered,
      totalCorrect,
      accuracyRate: totalCorrect / totalAnswered,
      lastPlayedAt: now,
    },
  };

  const newAnswer: RecentAnswer = { ruleId, isCorrect, answeredAt: now, timeTakenMs };
  const recentAnswers = [newAnswer, ...status.recentAnswers].slice(0, 20);

  return {
    ...status,
    todayDate: today,
    todayAnswered,
    todayCorrect,
    currentStreak,
    bestStreak,
    areaHistory,
    recentAnswers,
  };
}

/** 레벨테스트 결과로 UserMathStatus 초기화 */
export function initFromLevelTest(
  ruleId: string,
  grade: 1 | 2 | 3,
  semester: 1 | 2,
): UserMathStatus {
  return {
    ...createDefaultStatus(),
    grade,
    semester,
    activeRuleId: ruleId,
    levelTestCompletedAt: Date.now(),
    levelTestRuleId: ruleId,
  };
}

/** 최근 N개 정답률 */
export function getRecentAccuracy(status: UserMathStatus, n: number = 10): number {
  const recent = status.recentAnswers.slice(0, n);
  if (recent.length === 0) return 0.5;
  return recent.filter(a => a.isCorrect).length / recent.length;
}

/** 연속 오답 수 */
export function getConsecutiveWrong(status: UserMathStatus): number {
  let count = 0;
  for (const a of status.recentAnswers) {
    if (a.isCorrect) break;
    count++;
  }
  return count;
}
