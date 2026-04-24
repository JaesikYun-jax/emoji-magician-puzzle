/**
 * mathThemes.ts
 * 듀오링고식 수리 섹션 테마/유닛/레슨 구조 정의.
 *
 * ※ 이 파일은 기존 레벨 데이터 파일을 legacy-id 참조 방식으로만 사용하며,
 *   mathLevels.ts / equationFillLevels.ts / patternFinderLevels.ts 는 절대 수정하지 않는다.
 *
 * 테마 구성:
 *   basic-ops      : 덧셈/뺄셈/곱셈 타일 매칭 (mathLevels.ts IDs)
 *   formula-logic  : 등식 완성 (equationFillLevels.ts IDs) — 3유닛×5레슨
 *   number-pattern : 수열 패턴 찾기 (patternFinderLevels.ts IDs) — 2유닛×4레슨
 */

// ── 타입 정의 ────────────────────────────────────────────────────────────────

/** 레슨에서 사용하는 게임 종류 */
export type GameSlotType = 'math-tile' | 'eq-fill' | 'pat-find';

/**
 * 레슨의 게임 슬롯 — 기존 레벨 데이터의 ID를 참조(legacy-id ref).
 * legacyIds 배열 중 하나를 선택해 플레이한다.
 */
export interface LessonGameSlot {
  type: GameSlotType;
  /** 기존 레벨 데이터 파일의 ID 목록 (mathLevels / equationFillLevels / patternFinderLevels) */
  legacyIds: string[];
}

/** 한 레슨 = 학습 단위 */
export interface MathLesson {
  /** '{themeId}.{unitId}.lesson-{n}' 형식 */
  id: string;
  titleKo: string;
  /** 레슨 클리어 시 획득 XP */
  xpReward: number;
  /** 이 레슨에서 플레이할 게임 풀 */
  gamePool: LessonGameSlot[];
}

/** 한 유닛 = 레슨의 묶음 */
export interface MathUnit {
  /** '{themeId}.{unitKey}' 형식 */
  id: string;
  titleKo: string;
  lessons: MathLesson[];
}

/** 한 테마 = 유닛의 묶음 */
export interface MathTheme {
  id: string;
  titleKo: string;
  titleEn: string;
  units: MathUnit[];
}

// ── MATH_THEMES 상수 ──────────────────────────────────────────────────────────

export const MATH_THEMES: MathTheme[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // 테마 1: basic-ops — 덧셈/뺄셈/곱셈 타일 매칭
  //   mathLevels.ts 의 IDs 를 legacy-id ref 로 참조
  //   3 유닛(덧셈·뺄셈·곱셈) × 각 5 레슨
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'basic-ops',
    titleKo: '기본 사칙연산',
    titleEn: 'Basic Operations',
    units: [
      // ── 유닛 1: 덧셈 ────────────────────────────────────────────────────
      {
        id: 'basic-ops.addition',
        titleKo: '덧셈',
        lessons: [
          {
            id: 'basic-ops.addition.lesson-1',
            titleKo: '한 자리 덧셈 기초',
            xpReward: 10,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-add-single-1', 'math-add-single-2', 'math-add-single-3'] },
            ],
          },
          {
            id: 'basic-ops.addition.lesson-2',
            titleKo: '한 자리 덧셈 심화',
            xpReward: 10,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-add-single-4', 'math-add-single-5', 'math-add-single-6', 'math-add-single-7'] },
            ],
          },
          {
            id: 'basic-ops.addition.lesson-3',
            titleKo: '두 자리 덧셈 기초',
            xpReward: 15,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-add-double-8', 'math-add-double-9', 'math-add-double-10', 'math-add-double-11'] },
            ],
          },
          {
            id: 'basic-ops.addition.lesson-4',
            titleKo: '두 자리 덧셈 심화',
            xpReward: 15,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-add-double-12', 'math-add-double-13', 'math-add-double-14'] },
            ],
          },
          {
            id: 'basic-ops.addition.lesson-5',
            titleKo: '세 자리 덧셈',
            xpReward: 20,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-add-triple-15', 'math-add-triple-16', 'math-add-triple-17', 'math-add-triple-18', 'math-add-triple-19', 'math-add-triple-20'] },
            ],
          },
        ],
      },

      // ── 유닛 2: 뺄셈 ────────────────────────────────────────────────────
      {
        id: 'basic-ops.subtraction',
        titleKo: '뺄셈',
        lessons: [
          {
            id: 'basic-ops.subtraction.lesson-1',
            titleKo: '한 자리 뺄셈 기초',
            xpReward: 10,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-sub-single-1', 'math-sub-single-2', 'math-sub-single-3'] },
            ],
          },
          {
            id: 'basic-ops.subtraction.lesson-2',
            titleKo: '한 자리 뺄셈 심화',
            xpReward: 10,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-sub-single-4', 'math-sub-single-5', 'math-sub-single-6', 'math-sub-single-7'] },
            ],
          },
          {
            id: 'basic-ops.subtraction.lesson-3',
            titleKo: '두 자리 뺄셈 기초',
            xpReward: 15,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-sub-double-8', 'math-sub-double-9', 'math-sub-double-10', 'math-sub-double-11'] },
            ],
          },
          {
            id: 'basic-ops.subtraction.lesson-4',
            titleKo: '두 자리 뺄셈 심화',
            xpReward: 15,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-sub-double-12', 'math-sub-double-13', 'math-sub-double-14'] },
            ],
          },
          {
            id: 'basic-ops.subtraction.lesson-5',
            titleKo: '세 자리 뺄셈',
            xpReward: 20,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-sub-triple-15', 'math-sub-triple-16', 'math-sub-triple-17', 'math-sub-triple-18', 'math-sub-triple-19', 'math-sub-triple-20'] },
            ],
          },
        ],
      },

      // ── 유닛 3: 곱셈 ────────────────────────────────────────────────────
      {
        id: 'basic-ops.multiplication',
        titleKo: '곱셈',
        lessons: [
          {
            id: 'basic-ops.multiplication.lesson-1',
            titleKo: '구구단 2~5단 기초',
            xpReward: 10,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-mul-1', 'math-mul-2', 'math-mul-3', 'math-mul-4'] },
            ],
          },
          {
            id: 'basic-ops.multiplication.lesson-2',
            titleKo: '구구단 2~5단 심화',
            xpReward: 15,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-mul-5', 'math-mul-6', 'math-mul-7', 'math-mul-8'] },
            ],
          },
          {
            id: 'basic-ops.multiplication.lesson-3',
            titleKo: '구구단 6~9단 기초',
            xpReward: 15,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-mul-9', 'math-mul-10', 'math-mul-11', 'math-mul-12'] },
            ],
          },
          {
            id: 'basic-ops.multiplication.lesson-4',
            titleKo: '구구단 6~9단 심화',
            xpReward: 20,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-mul-13', 'math-mul-14', 'math-mul-15', 'math-mul-16'] },
            ],
          },
          {
            id: 'basic-ops.multiplication.lesson-5',
            titleKo: '두 자리 곱셈',
            xpReward: 20,
            gamePool: [
              { type: 'math-tile', legacyIds: ['math-mul-17', 'math-mul-18', 'math-mul-19', 'math-mul-20', 'math-mul-21', 'math-mul-22'] },
            ],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 테마 2: formula-logic — 등식 완성
  //   equationFillLevels.ts 의 IDs 참조 (eq-fill-1 ~ eq-fill-15)
  //   3 유닛 × 5 레슨 = 15 레슨 (레슨 1개 = 레벨 1개)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'formula-logic',
    titleKo: '등식 논리',
    titleEn: 'Formula Logic',
    units: [
      // ── 유닛 1: 역산 기초 (Lv 1~5) ─────────────────────────────────────
      {
        id: 'formula-logic.basic-inverse',
        titleKo: '역산 기초',
        lessons: [
          {
            id: 'formula-logic.basic-inverse.lesson-1',
            titleKo: '덧셈 역산 입문',
            xpReward: 10,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-1'] }],
          },
          {
            id: 'formula-logic.basic-inverse.lesson-2',
            titleKo: '뺄셈 역산 입문',
            xpReward: 10,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-2'] }],
          },
          {
            id: 'formula-logic.basic-inverse.lesson-3',
            titleKo: '덧셈·뺄셈 혼합',
            xpReward: 10,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-3'] }],
          },
          {
            id: 'formula-logic.basic-inverse.lesson-4',
            titleKo: '덧셈 빈칸=왼쪽',
            xpReward: 10,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-4'] }],
          },
          {
            id: 'formula-logic.basic-inverse.lesson-5',
            titleKo: '뺄셈 빈칸=왼쪽',
            xpReward: 10,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-5'] }],
          },
        ],
      },

      // ── 유닛 2: 두 자리 역산 (Lv 6~10) ─────────────────────────────────
      {
        id: 'formula-logic.double-inverse',
        titleKo: '두 자리 역산',
        lessons: [
          {
            id: 'formula-logic.double-inverse.lesson-1',
            titleKo: '혼합 빈칸(양쪽)',
            xpReward: 12,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-6'] }],
          },
          {
            id: 'formula-logic.double-inverse.lesson-2',
            titleKo: '두 자리 덧셈 역산',
            xpReward: 12,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-7'] }],
          },
          {
            id: 'formula-logic.double-inverse.lesson-3',
            titleKo: '두 자리 뺄셈 역산',
            xpReward: 12,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-8'] }],
          },
          {
            id: 'formula-logic.double-inverse.lesson-4',
            titleKo: '두 자리 혼합 빈칸',
            xpReward: 12,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-9'] }],
          },
          {
            id: 'formula-logic.double-inverse.lesson-5',
            titleKo: '곱셈 역산 입문',
            xpReward: 15,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-10'] }],
          },
        ],
      },

      // ── 유닛 3: 곱셈·나눗셈 역산 (Lv 11~15) ────────────────────────────
      {
        id: 'formula-logic.mul-div-inverse',
        titleKo: '곱셈·나눗셈 역산',
        lessons: [
          {
            id: 'formula-logic.mul-div-inverse.lesson-1',
            titleKo: '곱셈 빈칸(양쪽)',
            xpReward: 15,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-11'] }],
          },
          {
            id: 'formula-logic.mul-div-inverse.lesson-2',
            titleKo: '나눗셈 역산',
            xpReward: 15,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-12'] }],
          },
          {
            id: 'formula-logic.mul-div-inverse.lesson-3',
            titleKo: '곱셈·나눗셈 혼합',
            xpReward: 18,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-13'] }],
          },
          {
            id: 'formula-logic.mul-div-inverse.lesson-4',
            titleKo: '사칙연산 혼합',
            xpReward: 20,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-14'] }],
          },
          {
            id: 'formula-logic.mul-div-inverse.lesson-5',
            titleKo: '마스터 챌린지',
            xpReward: 25,
            gamePool: [{ type: 'eq-fill', legacyIds: ['eq-fill-15'] }],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 테마 3: number-pattern — 수열 패턴 찾기
  //   patternFinderLevels.ts 의 IDs 참조 (pat-find-1 ~ pat-find-15)
  //   2 유닛 × 4 레슨
  //   각 레슨의 gamePool 에 여러 패턴 레벨 ID 를 묶어 레벨 풀로 활용
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'number-pattern',
    titleKo: '수열 패턴',
    titleEn: 'Number Pattern',
    units: [
      // ── 유닛 1: 수열 기초 (pat-find-1 ~ 8) ─────────────────────────────
      {
        id: 'number-pattern.basic-sequence',
        titleKo: '수열 기초',
        lessons: [
          {
            id: 'number-pattern.basic-sequence.lesson-1',
            titleKo: '등차수열 입문',
            xpReward: 10,
            gamePool: [
              { type: 'pat-find', legacyIds: ['pat-find-1', 'pat-find-2'] },
            ],
          },
          {
            id: 'number-pattern.basic-sequence.lesson-2',
            titleKo: '등차수열 심화',
            xpReward: 12,
            gamePool: [
              { type: 'pat-find', legacyIds: ['pat-find-3', 'pat-find-4'] },
            ],
          },
          {
            id: 'number-pattern.basic-sequence.lesson-3',
            titleKo: '제곱수·혼합 패턴',
            xpReward: 15,
            gamePool: [
              { type: 'pat-find', legacyIds: ['pat-find-5', 'pat-find-6'] },
            ],
          },
          {
            id: 'number-pattern.basic-sequence.lesson-4',
            titleKo: '등비수열',
            xpReward: 15,
            gamePool: [
              { type: 'pat-find', legacyIds: ['pat-find-7', 'pat-find-8'] },
            ],
          },
        ],
      },

      // ── 유닛 2: 수열 심화 (pat-find-9 ~ 15) ─────────────────────────────
      {
        id: 'number-pattern.advanced-sequence',
        titleKo: '수열 심화',
        lessons: [
          {
            id: 'number-pattern.advanced-sequence.lesson-1',
            titleKo: '등비·제곱수 혼합',
            xpReward: 15,
            gamePool: [
              { type: 'pat-find', legacyIds: ['pat-find-9', 'pat-find-10'] },
            ],
          },
          {
            id: 'number-pattern.advanced-sequence.lesson-2',
            titleKo: '피보나치·혼합',
            xpReward: 18,
            gamePool: [
              { type: 'pat-find', legacyIds: ['pat-find-11', 'pat-find-12'] },
            ],
          },
          {
            id: 'number-pattern.advanced-sequence.lesson-3',
            titleKo: '교대수열',
            xpReward: 20,
            gamePool: [
              { type: 'pat-find', legacyIds: ['pat-find-13'] },
            ],
          },
          {
            id: 'number-pattern.advanced-sequence.lesson-4',
            titleKo: '마스터 챌린지',
            xpReward: 25,
            gamePool: [
              { type: 'pat-find', legacyIds: ['pat-find-14', 'pat-find-15'] },
            ],
          },
        ],
      },
    ],
  },
];

// ── 헬퍼 함수 ────────────────────────────────────────────────────────────────

/** 테마 ID로 테마를 조회한다. */
export function getMathTheme(themeId: string): MathTheme | undefined {
  return MATH_THEMES.find((t) => t.id === themeId);
}

/** 레슨 ID로 레슨을 조회한다. */
export function getMathLesson(lessonId: string): MathLesson | undefined {
  for (const theme of MATH_THEMES) {
    for (const unit of theme.units) {
      const lesson = unit.lessons.find((l) => l.id === lessonId);
      if (lesson) return lesson;
    }
  }
  return undefined;
}

/** 모든 레슨 ID 목록을 반환한다. */
export function getAllLessonIds(): string[] {
  return MATH_THEMES.flatMap((t) =>
    t.units.flatMap((u) => u.lessons.map((l) => l.id)),
  );
}

/** 특정 legacy level ID 가 어느 레슨에 속하는지 반환한다. */
export function findLessonByLegacyId(legacyId: string): MathLesson | undefined {
  for (const theme of MATH_THEMES) {
    for (const unit of theme.units) {
      for (const lesson of unit.lessons) {
        if (lesson.gamePool.some((slot) => slot.legacyIds.includes(legacyId))) {
          return lesson;
        }
      }
    }
  }
  return undefined;
}
