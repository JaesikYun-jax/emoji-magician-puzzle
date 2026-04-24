import { describe, it, expect } from 'vitest';
import {
  MATH_THEMES,
  getMathTheme,
  getMathLesson,
  getAllLessonIds,
  findLessonByLegacyId,
} from '../../../src/game-data/mathThemes';
import { MATH_LEVELS } from '../../../src/game-data/mathLevels';
import { EQ_FILL_LEVELS } from '../../../src/game-data/equationFillLevels';
import { PATTERN_FINDER_LEVELS } from '../../../src/game-data/patternFinderLevels';

// 기존 레벨 ID 집합
const mathLevelIds = new Set(MATH_LEVELS.map((l) => l.id));
const eqFillIds = new Set(EQ_FILL_LEVELS.map((l) => l.id));
const patternIds = new Set(PATTERN_FINDER_LEVELS.map((l) => l.id));

describe('MATH_THEMES 구조', () => {
  it('3개의 테마가 존재한다', () => {
    expect(MATH_THEMES).toHaveLength(3);
  });

  it('테마 ID가 basic-ops, formula-logic, number-pattern 이다', () => {
    const ids = MATH_THEMES.map((t) => t.id);
    expect(ids).toContain('basic-ops');
    expect(ids).toContain('formula-logic');
    expect(ids).toContain('number-pattern');
  });

  describe('basic-ops', () => {
    const theme = MATH_THEMES.find((t) => t.id === 'basic-ops')!;

    it('3개의 유닛(덧셈·뺄셈·곱셈)이 있다', () => {
      expect(theme.units).toHaveLength(3);
    });

    it('각 유닛에 레슨이 1개 이상 있다', () => {
      for (const unit of theme.units) {
        expect(unit.lessons.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('모든 legacyId 가 mathLevels.ts 에 실제로 존재한다', () => {
      for (const unit of theme.units) {
        for (const lesson of unit.lessons) {
          for (const slot of lesson.gamePool) {
            expect(slot.type).toBe('math-tile');
            for (const id of slot.legacyIds) {
              expect(mathLevelIds.has(id), `mathLevelIds에 ${id}가 없음`).toBe(true);
            }
          }
        }
      }
    });

    it('덧셈 유닛의 레슨이 5개이다', () => {
      const addUnit = theme.units.find((u) => u.id === 'basic-ops.addition')!;
      expect(addUnit.lessons).toHaveLength(5);
    });

    it('뺄셈 유닛의 레슨이 5개이다', () => {
      const subUnit = theme.units.find((u) => u.id === 'basic-ops.subtraction')!;
      expect(subUnit.lessons).toHaveLength(5);
    });

    it('곱셈 유닛의 레슨이 5개이다', () => {
      const mulUnit = theme.units.find((u) => u.id === 'basic-ops.multiplication')!;
      expect(mulUnit.lessons).toHaveLength(5);
    });
  });

  describe('formula-logic', () => {
    const theme = MATH_THEMES.find((t) => t.id === 'formula-logic')!;

    it('3개의 유닛이 있다', () => {
      expect(theme.units).toHaveLength(3);
    });

    it('각 유닛의 레슨이 5개이다 (3×5=15)', () => {
      for (const unit of theme.units) {
        expect(unit.lessons).toHaveLength(5);
      }
    });

    it('모든 legacyId 가 equationFillLevels.ts 에 실제로 존재한다', () => {
      for (const unit of theme.units) {
        for (const lesson of unit.lessons) {
          for (const slot of lesson.gamePool) {
            expect(slot.type).toBe('eq-fill');
            for (const id of slot.legacyIds) {
              expect(eqFillIds.has(id), `eqFillIds에 ${id}가 없음`).toBe(true);
            }
          }
        }
      }
    });

    it('eq-fill-1 ~ eq-fill-15 가 모두 매핑되어 있다', () => {
      const mappedIds = new Set<string>();
      for (const unit of theme.units) {
        for (const lesson of unit.lessons) {
          for (const slot of lesson.gamePool) {
            slot.legacyIds.forEach((id) => mappedIds.add(id));
          }
        }
      }
      for (const level of EQ_FILL_LEVELS) {
        expect(mappedIds.has(level.id), `${level.id}가 formula-logic에 매핑되지 않음`).toBe(true);
      }
    });
  });

  describe('number-pattern', () => {
    const theme = MATH_THEMES.find((t) => t.id === 'number-pattern')!;

    it('2개의 유닛이 있다', () => {
      expect(theme.units).toHaveLength(2);
    });

    it('각 유닛의 레슨이 4개이다 (2×4=8)', () => {
      for (const unit of theme.units) {
        expect(unit.lessons).toHaveLength(4);
      }
    });

    it('모든 legacyId 가 patternFinderLevels.ts 에 실제로 존재한다', () => {
      for (const unit of theme.units) {
        for (const lesson of unit.lessons) {
          for (const slot of lesson.gamePool) {
            expect(slot.type).toBe('pat-find');
            for (const id of slot.legacyIds) {
              expect(patternIds.has(id), `patternIds에 ${id}가 없음`).toBe(true);
            }
          }
        }
      }
    });

    it('pat-find-1 ~ pat-find-15 가 모두 매핑되어 있다', () => {
      const mappedIds = new Set<string>();
      for (const unit of theme.units) {
        for (const lesson of unit.lessons) {
          for (const slot of lesson.gamePool) {
            slot.legacyIds.forEach((id) => mappedIds.add(id));
          }
        }
      }
      for (const level of PATTERN_FINDER_LEVELS) {
        expect(mappedIds.has(level.id), `${level.id}가 number-pattern에 매핑되지 않음`).toBe(true);
      }
    });
  });

  describe('레슨 ID 유일성', () => {
    it('모든 레슨 ID 가 고유하다', () => {
      const allIds = getAllLessonIds();
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });
  });

  describe('레슨 xpReward', () => {
    it('모든 레슨의 xpReward 가 양수이다', () => {
      for (const theme of MATH_THEMES) {
        for (const unit of theme.units) {
          for (const lesson of unit.lessons) {
            expect(lesson.xpReward, `${lesson.id} xpReward`).toBeGreaterThan(0);
          }
        }
      }
    });
  });
});

describe('getMathTheme', () => {
  it('존재하는 테마 ID 로 조회하면 테마를 반환한다', () => {
    const theme = getMathTheme('basic-ops');
    expect(theme).toBeDefined();
    expect(theme!.id).toBe('basic-ops');
  });

  it('존재하지 않는 ID 로 조회하면 undefined 를 반환한다', () => {
    expect(getMathTheme('not-exist')).toBeUndefined();
  });
});

describe('getMathLesson', () => {
  it('존재하는 레슨 ID 로 조회하면 레슨을 반환한다', () => {
    const lesson = getMathLesson('basic-ops.addition.lesson-1');
    expect(lesson).toBeDefined();
    expect(lesson!.id).toBe('basic-ops.addition.lesson-1');
  });

  it('존재하지 않는 ID 로 조회하면 undefined 를 반환한다', () => {
    expect(getMathLesson('non-exist.lesson-99')).toBeUndefined();
  });
});

describe('findLessonByLegacyId', () => {
  it('math-add-single-1 로 basic-ops.addition.lesson-1 을 찾는다', () => {
    const lesson = findLessonByLegacyId('math-add-single-1');
    expect(lesson).toBeDefined();
    expect(lesson!.id).toBe('basic-ops.addition.lesson-1');
  });

  it('eq-fill-15 로 formula-logic 의 마스터 레슨을 찾는다', () => {
    const lesson = findLessonByLegacyId('eq-fill-15');
    expect(lesson).toBeDefined();
    expect(lesson!.id).toBe('formula-logic.mul-div-inverse.lesson-5');
  });

  it('pat-find-14 로 number-pattern 심화 레슨을 찾는다', () => {
    const lesson = findLessonByLegacyId('pat-find-14');
    expect(lesson).toBeDefined();
    expect(lesson!.id).toBe('number-pattern.advanced-sequence.lesson-4');
  });

  it('존재하지 않는 ID 면 undefined 를 반환한다', () => {
    expect(findLessonByLegacyId('ghost-level-99')).toBeUndefined();
  });
});
