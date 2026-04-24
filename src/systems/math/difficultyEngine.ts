import type { UserMathStatus } from './UserMathStatus';
import { MATH_CURRICULUM, getPrevRule, getNextRule } from '../../game-data/mathCurriculum';
import { getRecentAccuracy, getConsecutiveWrong } from './UserMathStatus';

// ── 새 룰 기반 난이도 시스템 ─────────────────────────────────────────────────

export interface DifficultyParams {
  ruleWeights: Array<{ ruleId: string; weight: number }>;
  operandScaleFactor: number;  // 0.5 ~ 1.0
  distractorMode: 'easy' | 'normal' | 'hard';
  timeLimitMs: number | null;
  streakMultiplier: number;
}

export function computeDifficultyParams(status: UserMathStatus): DifficultyParams {
  const recentAccuracy = getRecentAccuracy(status, 10);
  const consecutiveWrong = getConsecutiveWrong(status);
  const streak = status.currentStreak;

  const currentRule = MATH_CURRICULUM.find(r => r.id === status.activeRuleId);
  if (!currentRule) {
    return {
      ruleWeights: [{ ruleId: 'g1s1-add-single-no-carry', weight: 1.0 }],
      operandScaleFactor: 0.75,
      distractorMode: 'easy',
      timeLimitMs: null,
      streakMultiplier: 1.0,
    };
  }

  const prevRule = getPrevRule(status.activeRuleId);
  const nextRule = getNextRule(status.activeRuleId);

  let ruleWeights: Array<{ ruleId: string; weight: number }>;
  if (consecutiveWrong >= 3 && prevRule) {
    ruleWeights = [
      { ruleId: prevRule.id, weight: 0.6 },
      { ruleId: currentRule.id, weight: 0.4 },
    ];
  } else if (recentAccuracy >= 0.8 && streak >= 5 && nextRule) {
    ruleWeights = [
      { ruleId: currentRule.id, weight: 0.5 },
      { ruleId: nextRule.id, weight: 0.5 },
    ];
  } else {
    ruleWeights = [{ ruleId: currentRule.id, weight: 1.0 }];
  }

  let operandScaleFactor: number;
  if (recentAccuracy >= 0.85) operandScaleFactor = 1.0;
  else if (recentAccuracy >= 0.6) operandScaleFactor = 0.75;
  else operandScaleFactor = 0.5;

  let distractorMode: 'easy' | 'normal' | 'hard';
  if (recentAccuracy >= 0.8) distractorMode = 'hard';
  else if (recentAccuracy >= 0.55) distractorMode = 'normal';
  else distractorMode = 'easy';

  const streakMultiplier = Math.min(1.0 + streak * 0.05, 2.0);

  const totalAnswered = status.areaHistory[currentRule.id]?.totalAnswered ?? 0;
  const timeLimitMs = totalAnswered >= 30 ? 8000 : null;

  return { ruleWeights, operandScaleFactor, distractorMode, timeLimitMs, streakMultiplier };
}

/** 가중치 배열에서 확률적으로 ruleId 선택 */
export function pickRuleByWeight(weights: Array<{ ruleId: string; weight: number }>): string {
  const total = weights.reduce((s, w) => s + w.weight, 0);
  let rand = Math.random() * total;
  for (const w of weights) {
    rand -= w.weight;
    if (rand <= 0) return w.ruleId;
  }
  return weights[weights.length - 1].ruleId;
}

// ── 참조용 상수 (하위 호환) ───────────────────────────────────────────────────

export const DIFFICULTY_ENGINE = {
  SINGLE_CORRECT_BONUS: 2,
  SINGLE_WRONG_PENALTY: -3,
  CORRECT_STREAK_3_BONUS: 5,
  WRONG_STREAK_2_PENALTY: -8,
  SCORE_MIN: 0,
  SCORE_MAX: 100,
  PROMOTION_THRESHOLD: 80,
  DEMOTION_THRESHOLD: 20,
  PROMOTION_COOLDOWN: 15,
} as const;
