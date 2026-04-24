/**
 * equationFillLevels.ts
 * 등식 완성 게임 15개 레벨 정의.
 *
 * 난이도 곡선:
 *   Lv  1~ 3  : 덧셈/뺄셈, 1자리, 빈칸=오른쪽 (쉬움, 역산 입문)
 *   Lv  4~ 6  : 덧셈/뺄셈, 1자리, 빈칸=왼쪽도 포함
 *   Lv  7~ 9  : 덧셈/뺄셈, 2자리 포함, 빈칸 양쪽
 *   Lv 10~12  : 곱셈 추가, 구구단 범위
 *   Lv 13~15  : 나눗셈 포함, 혼합 연산, 더 빡빡한 distractorSpread
 */

import type { EqFillGenParams } from '../systems/math/equationFillGenerator';

export interface EqFillLevelConfig {
  /** 고유 식별자. 'eq-fill-1' ~ 'eq-fill-15' */
  id: string;
  /** 화면에 표시되는 레벨 번호 (1~15) */
  levelIndex: number;
  /** 문제 총 개수 */
  totalQuestions: number;
  /** 제한 시간 (초) */
  timeLimit: number;
  /** 문제 생성 파라미터 */
  genParams: EqFillGenParams;
  /**
   * 별점 기준 (정답 수 기준)
   * [1별 최소, 2별 최소, 3별 최소]
   */
  starThresholds: [number, number, number];
  /** 이전 레벨을 클리어해야 잠금 해제 */
  requiresPrev: boolean;
}

export const EQ_FILL_LEVELS: EqFillLevelConfig[] = [
  // ── Lv 1: 1자리 덧셈, blank=right ─────────────────────────────────────────
  {
    id: 'eq-fill-1', levelIndex: 1,
    totalQuestions: 8, timeLimit: 60,
    genParams: {
      ops: ['add'],
      blankPositions: ['right'],
      operandRange: [1, 7],
      distractorSpread: 4,
    },
    starThresholds: [5, 7, 8],
    requiresPrev: false,
  },
  // ── Lv 2: 1자리 뺄셈, blank=right ─────────────────────────────────────────
  {
    id: 'eq-fill-2', levelIndex: 2,
    totalQuestions: 8, timeLimit: 60,
    genParams: {
      ops: ['sub'],
      blankPositions: ['right'],
      operandRange: [1, 8],
      distractorSpread: 4,
    },
    starThresholds: [5, 7, 8],
    requiresPrev: true,
  },
  // ── Lv 3: 덧셈/뺄셈 혼합, blank=right ────────────────────────────────────
  {
    id: 'eq-fill-3', levelIndex: 3,
    totalQuestions: 10, timeLimit: 70,
    genParams: {
      ops: ['add', 'sub'],
      blankPositions: ['right'],
      operandRange: [1, 9],
      distractorSpread: 4,
    },
    starThresholds: [6, 8, 10],
    requiresPrev: true,
  },
  // ── Lv 4: 덧셈, blank=left ────────────────────────────────────────────────
  {
    id: 'eq-fill-4', levelIndex: 4,
    totalQuestions: 8, timeLimit: 60,
    genParams: {
      ops: ['add'],
      blankPositions: ['left'],
      operandRange: [1, 8],
      distractorSpread: 4,
    },
    starThresholds: [5, 7, 8],
    requiresPrev: true,
  },
  // ── Lv 5: 뺄셈, blank=left ────────────────────────────────────────────────
  {
    id: 'eq-fill-5', levelIndex: 5,
    totalQuestions: 8, timeLimit: 65,
    genParams: {
      ops: ['sub'],
      blankPositions: ['left'],
      operandRange: [1, 9],
      distractorSpread: 4,
    },
    starThresholds: [5, 7, 8],
    requiresPrev: true,
  },
  // ── Lv 6: 덧셈/뺄셈 혼합, blank=both ────────────────────────────────────
  {
    id: 'eq-fill-6', levelIndex: 6,
    totalQuestions: 10, timeLimit: 70,
    genParams: {
      ops: ['add', 'sub'],
      blankPositions: ['left', 'right'],
      operandRange: [1, 9],
      distractorSpread: 3,
    },
    starThresholds: [6, 8, 10],
    requiresPrev: true,
  },
  // ── Lv 7: 2자리 덧셈, blank=right ───────────────────────────────────────
  {
    id: 'eq-fill-7', levelIndex: 7,
    totalQuestions: 8, timeLimit: 75,
    genParams: {
      ops: ['add'],
      blankPositions: ['right'],
      operandRange: [10, 40],
      distractorSpread: 8,
    },
    starThresholds: [5, 7, 8],
    requiresPrev: true,
  },
  // ── Lv 8: 2자리 뺄셈, blank=right ───────────────────────────────────────
  {
    id: 'eq-fill-8', levelIndex: 8,
    totalQuestions: 8, timeLimit: 75,
    genParams: {
      ops: ['sub'],
      blankPositions: ['right'],
      operandRange: [10, 40],
      distractorSpread: 8,
    },
    starThresholds: [5, 7, 8],
    requiresPrev: true,
  },
  // ── Lv 9: 2자리 덧셈/뺄셈, blank=both ──────────────────────────────────
  {
    id: 'eq-fill-9', levelIndex: 9,
    totalQuestions: 10, timeLimit: 80,
    genParams: {
      ops: ['add', 'sub'],
      blankPositions: ['left', 'right'],
      operandRange: [10, 50],
      distractorSpread: 6,
    },
    starThresholds: [6, 8, 10],
    requiresPrev: true,
  },
  // ── Lv 10: 곱셈, blank=right (구구단 2~5단) ──────────────────────────────
  {
    id: 'eq-fill-10', levelIndex: 10,
    totalQuestions: 8, timeLimit: 70,
    genParams: {
      ops: ['mul'],
      blankPositions: ['right'],
      operandRange: [2, 5],
      distractorSpread: 3,
    },
    starThresholds: [5, 7, 8],
    requiresPrev: true,
  },
  // ── Lv 11: 곱셈, blank=both (구구단 2~9단) ──────────────────────────────
  {
    id: 'eq-fill-11', levelIndex: 11,
    totalQuestions: 10, timeLimit: 75,
    genParams: {
      ops: ['mul'],
      blankPositions: ['left', 'right'],
      operandRange: [2, 9],
      distractorSpread: 3,
    },
    starThresholds: [6, 8, 10],
    requiresPrev: true,
  },
  // ── Lv 12: 나눗셈, blank=right ──────────────────────────────────────────
  {
    id: 'eq-fill-12', levelIndex: 12,
    totalQuestions: 8, timeLimit: 75,
    genParams: {
      ops: ['div'],
      blankPositions: ['right'],
      operandRange: [2, 9],
      distractorSpread: 3,
    },
    starThresholds: [5, 7, 8],
    requiresPrev: true,
  },
  // ── Lv 13: 곱셈/나눗셈 혼합, blank=both ────────────────────────────────
  {
    id: 'eq-fill-13', levelIndex: 13,
    totalQuestions: 10, timeLimit: 80,
    genParams: {
      ops: ['mul', 'div'],
      blankPositions: ['left', 'right'],
      operandRange: [2, 9],
      distractorSpread: 2,
    },
    starThresholds: [6, 8, 10],
    requiresPrev: true,
  },
  // ── Lv 14: 사칙연산 혼합, blank=both ────────────────────────────────────
  {
    id: 'eq-fill-14', levelIndex: 14,
    totalQuestions: 12, timeLimit: 90,
    genParams: {
      ops: ['add', 'sub', 'mul', 'div'],
      blankPositions: ['left', 'right'],
      operandRange: [2, 20],
      distractorSpread: 2,
    },
    starThresholds: [8, 10, 12],
    requiresPrev: true,
  },
  // ── Lv 15: 마스터 챌린지 ──────────────────────────────────────────────────
  {
    id: 'eq-fill-15', levelIndex: 15,
    totalQuestions: 15, timeLimit: 100,
    genParams: {
      ops: ['add', 'sub', 'mul', 'div'],
      blankPositions: ['left', 'right'],
      operandRange: [2, 30],
      distractorSpread: 2,
    },
    starThresholds: [10, 13, 15],
    requiresPrev: true,
  },
];

/** id로 레벨 조회 */
export function getEqFillLevel(id: string): EqFillLevelConfig | undefined {
  return EQ_FILL_LEVELS.find((l) => l.id === id);
}
