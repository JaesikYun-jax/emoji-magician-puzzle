import { describe, it, expect } from 'vitest';
import { migrateV1toV2, migrateV5toV6, runMigrations } from '../../../src/services/saveMigrations';
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

// ── v5 SaveData 팩토리 헬퍼 ─────────────────────────────────────────────────

function makeV5(overrides: Partial<SaveData> = {}): SaveData {
  return {
    version: 5,
    math: { levelProgress: {} },
    english: { levelProgress: {} },
    settings: { language: 'ko', soundEnabled: true, musicEnabled: true },
    gamification: {
      lessonProgress: {},
      xpByDay: {},
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDay: null,
      dailyGoalXp: 50,
    },
    logic: { levelProgress: {}, streak: 0, clearCount: 0 },
    creativity: {
      levelProgress: {},
      playerLevel: 1,
      totalClears: 0,
      streak: 0,
      meta: {
        totalClears: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastPlayedAt: new Date().toISOString(),
        earnedBadgeThresholds: [],
        recentPuzzleIds: [],
        rankScore: 0,
        maxDifficultyTier: 0,
      },
    },
    profile: null,
    ...overrides,
  };
}

describe('migrateV5toV6', () => {
  it('버전이 6으로 올라간다', () => {
    const v5 = makeV5();
    const v6 = migrateV5toV6(v5);
    expect(v6.version).toBe(6);
  });

  it('v5 데이터(math에 levelProgress 있음, progress 없음) -> v6 마이그레이션 후 math.progress가 생성됨', () => {
    const v5 = makeV5({
      math: {
        levelProgress: {
          'math-add-single-1': { stars: 2, bestScore: 500, playCount: 3, isUnlocked: true },
        },
      },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.math.progress).toBeDefined();
    expect(v6.math.progress!.placementDone).toBe(false);
    expect(v6.math.progress!.streak).toBe(0);
  });

  it('math에 별점 있으면 xp가 0보다 크게 마이그레이션됨', () => {
    const v5 = makeV5({
      math: {
        levelProgress: {
          'math-add-single-1': { stars: 3, bestScore: 1000, playCount: 2, isUnlocked: true },
          'math-add-single-2': { stars: 2, bestScore: 600, playCount: 1, isUnlocked: true },
        },
      },
    });
    const v6 = migrateV5toV6(v5);
    // xp = round((3 + 2) * 5) = 25
    expect(v6.math.progress!.xp).toBe(25);
    expect(v6.math.progress!.xp).toBeGreaterThan(0);
  });

  it('math.levelProgress에서 totalClears(playCount 합산)가 정확히 마이그레이션됨', () => {
    const v5 = makeV5({
      math: {
        levelProgress: {
          'math-add-single-1': { stars: 1, bestScore: 100, playCount: 4, isUnlocked: true },
          'math-add-single-2': { stars: 0, bestScore: 0, playCount: 2, isUnlocked: true },
        },
      },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.math.progress!.totalClears).toBe(6);
  });

  it('english에 levelTestResult 있으면 placementDone: true로 마이그레이션됨', () => {
    const v5 = makeV5({
      english: {
        levelProgress: {},
        levelTestResult: {
          testedAt: Date.now(),
          recommendedLevelId: 'english-beginner-1',
          recommendedLevelIndex: 1,
          stagesCleared: 3,
          totalQuestions: 5,
          correctCount: 3,
        },
      },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.english.progress).toBeDefined();
    expect(v6.english.progress!.placementDone).toBe(true);
  });

  it('english에 levelTestResult 없으면 placementDone: false', () => {
    const v5 = makeV5({ english: { levelProgress: {} } });
    const v6 = migrateV5toV6(v5);
    expect(v6.english.progress!.placementDone).toBe(false);
  });

  it('english에 별점 있으면 xp가 0보다 크게 마이그레이션됨', () => {
    const v5 = makeV5({
      english: {
        levelProgress: {
          'english-beginner-1': { stars: 2, bestScore: 400, playCount: 1, isUnlocked: true },
        },
      },
    });
    const v6 = migrateV5toV6(v5);
    // xp = round(2 * 5) = 10
    expect(v6.english.progress!.xp).toBe(10);
    expect(v6.english.progress!.xp).toBeGreaterThan(0);
  });

  it('logic에 clearCount=5면 totalClears=5로 마이그레이션됨', () => {
    const v5 = makeV5({
      logic: { levelProgress: {}, streak: 2, clearCount: 5 },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.logic!.progress).toBeDefined();
    expect(v6.logic!.progress!.totalClears).toBe(5);
  });

  it('logic에 clearCount>0이면 placementDone: true로 마이그레이션됨', () => {
    const v5 = makeV5({
      logic: { levelProgress: {}, streak: 1, clearCount: 3 },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.logic!.progress!.placementDone).toBe(true);
  });

  it('logic에 clearCount=0이면 placementDone: false', () => {
    const v5 = makeV5({
      logic: { levelProgress: {}, streak: 0, clearCount: 0 },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.logic!.progress!.placementDone).toBe(false);
  });

  it('logic streak이 progress에 반영됨', () => {
    const v5 = makeV5({
      logic: { levelProgress: {}, streak: 4, clearCount: 10 },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.logic!.progress!.streak).toBe(4);
    expect(v6.logic!.progress!.bestStreak).toBe(4);
  });

  it('logic에 clearCount가 있으면 xp가 0보다 크게 마이그레이션됨', () => {
    const v5 = makeV5({
      logic: { levelProgress: {}, streak: 0, clearCount: 5 },
    });
    const v6 = migrateV5toV6(v5);
    // xp = round(5 * 10) = 50
    expect(v6.logic!.progress!.xp).toBe(50);
    expect(v6.logic!.progress!.xp).toBeGreaterThan(0);
  });

  it('creativity에 totalClears>0이면 placementDone: true로 마이그레이션됨', () => {
    const v5 = makeV5({
      creativity: {
        levelProgress: {},
        playerLevel: 3,
        totalClears: 5,
        streak: 1,
        meta: {
          totalClears: 5,
          currentStreak: 1,
          bestStreak: 3,
          lastPlayedAt: new Date().toISOString(),
          earnedBadgeThresholds: [],
          recentPuzzleIds: [],
          rankScore: 0,
          maxDifficultyTier: 0,
        },
      },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.creativity!.progress!.placementDone).toBe(true);
    expect(v6.creativity!.progress!.totalClears).toBe(5);
  });

  it('이미 progress 필드가 있으면 덮어쓰지 않음', () => {
    const existingProgress = { xp: 999, level: 10, totalClears: 99, streak: 5, bestStreak: 10, placementDone: true };
    const v5 = makeV5({
      math: {
        levelProgress: {},
        progress: existingProgress,
      },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.math.progress).toEqual(existingProgress);
  });

  it('기존 math/english/settings/gamification 데이터가 보존됨', () => {
    const v5 = makeV5({
      math: {
        levelProgress: {
          'math-add-single-1': { stars: 2, bestScore: 500, playCount: 1, isUnlocked: true },
        },
      },
    });
    const v6 = migrateV5toV6(v5);
    expect(v6.math.levelProgress['math-add-single-1'].stars).toBe(2);
    expect(v6.settings.language).toBe('ko');
    expect(v6.profile).toBeNull();
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
