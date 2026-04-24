import { describe, it, expect } from 'vitest';
import { migrateV1toV2, runMigrations } from '../../../src/services/saveMigrations';
import type { SaveData } from '../../../src/game-data/subjectConfig';

// v1 SaveData 팩토리 헬퍼
function makeV1(levelProgress: Record<string, { stars: number; bestScore: number; playCount: number; isUnlocked: boolean }>): SaveData {
  return {
    version: 1,
    math: { levelProgress },
    english: { levelProgress: {} },
    settings: { language: 'ko', soundEnabled: true, musicEnabled: true },
  };
}

describe('migrateV1toV2', () => {
  it('버전이 2로 올라간다', () => {
    const v1 = makeV1({});
    const v2 = migrateV1toV2(v1);
    expect(v2.version).toBe(2);
  });

  it('gamification 필드가 생성된다', () => {
    const v1 = makeV1({});
    const v2 = migrateV1toV2(v1);
    expect(v2.gamification).toBeDefined();
    expect(v2.gamification!.xpByDay).toEqual({});
    expect(v2.gamification!.currentStreak).toBe(0);
  });

  it('별점 ≥ 2 인 레벨이 속한 레슨을 cleared 로 표시한다', () => {
    // math-add-single-1 ~ 3 은 basic-ops.addition.lesson-1 에 속함
    const v1 = makeV1({
      'math-add-single-1': { stars: 2, bestScore: 500, playCount: 1, isUnlocked: true },
    });
    const v2 = migrateV1toV2(v1);
    expect(v2.gamification!.lessonProgress['basic-ops.addition.lesson-1']).toBe('cleared');
  });

  it('별점 1 인 레벨은 cleared 로 표시하지 않는다', () => {
    const v1 = makeV1({
      'math-add-single-1': { stars: 1, bestScore: 100, playCount: 1, isUnlocked: true },
    });
    const v2 = migrateV1toV2(v1);
    expect(v2.gamification!.lessonProgress['basic-ops.addition.lesson-1']).toBeUndefined();
  });

  it('별점 0 인 레벨도 cleared 로 표시하지 않는다', () => {
    const v1 = makeV1({
      'math-add-single-1': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
    });
    const v2 = migrateV1toV2(v1);
    expect(v2.gamification!.lessonProgress['basic-ops.addition.lesson-1']).toBeUndefined();
  });

  it('별점 3 인 레벨도 cleared 로 표시한다', () => {
    const v1 = makeV1({
      'math-add-single-2': { stars: 3, bestScore: 9999, playCount: 5, isUnlocked: true },
    });
    const v2 = migrateV1toV2(v1);
    // math-add-single-2 도 basic-ops.addition.lesson-1 에 속함
    expect(v2.gamification!.lessonProgress['basic-ops.addition.lesson-1']).toBe('cleared');
  });

  it('eq-fill 레벨의 별점 ≥ 2 시 formula-logic 레슨이 cleared 된다', () => {
    const v1 = makeV1({
      'eq-fill-1': { stars: 2, bestScore: 700, playCount: 1, isUnlocked: true },
    });
    const v2 = migrateV1toV2(v1);
    expect(v2.gamification!.lessonProgress['formula-logic.basic-inverse.lesson-1']).toBe('cleared');
  });

  it('pat-find 레벨의 별점 ≥ 2 시 number-pattern 레슨이 cleared 된다', () => {
    const v1 = makeV1({
      'pat-find-1': { stars: 2, bestScore: 800, playCount: 1, isUnlocked: true },
    });
    const v2 = migrateV1toV2(v1);
    expect(v2.gamification!.lessonProgress['number-pattern.basic-sequence.lesson-1']).toBe('cleared');
  });

  it('기존 math/english/settings 데이터가 보존된다', () => {
    const v1 = makeV1({
      'math-add-single-1': { stars: 2, bestScore: 500, playCount: 3, isUnlocked: true },
    });
    const v2 = migrateV1toV2(v1);
    expect(v2.math.levelProgress['math-add-single-1'].stars).toBe(2);
    expect(v2.settings.language).toBe('ko');
  });
});

describe('runMigrations', () => {
  it('v1 데이터를 target=2로 변환하면 version=2가 된다', () => {
    const v1 = makeV1({});
    const result = runMigrations(v1, 2);
    expect(result.version).toBe(2);
    expect(result.gamification).toBeDefined();
  });

  it('이미 v2 이면 변경 없이 그대로 반환한다', () => {
    const v2: SaveData = {
      ...makeV1({}),
      version: 2,
      gamification: {
        xpByDay: { '2026-04-23': 100 },
        currentStreak: 1,
        longestStreak: 5,
        lastActiveDay: '2026-04-23',
        dailyGoalXp: 50,
        lessonProgress: {},
      },
    };
    const result = runMigrations(v2, 2);
    expect(result.gamification!.xpByDay['2026-04-23']).toBe(100);
    expect(result.gamification!.longestStreak).toBe(5);
  });
});
