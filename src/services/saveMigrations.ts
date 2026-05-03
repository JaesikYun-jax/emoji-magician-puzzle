/**
 * saveMigrations.ts
 * SaveData 버전 간 마이그레이션 함수 모음.
 *
 * v1 → v2 :
 *   - gamification 필드를 기본값으로 초기화
 *   - math.levelProgress 에서 별점 ≥ 2 인 레벨을 신규 MATH_THEMES 레슨에 매핑하여
 *     lessonProgress 를 'cleared' 로 반영
 */

import type { SaveData } from '../game-data/subjectConfig';
import { MATH_THEMES } from '../game-data/mathThemes';
import { createDefaultGamificationState } from '../systems/gamification/types';
import { computeLevel } from '../systems/progression/xpEngine';

/**
 * v1 SaveData 를 v2 로 마이그레이션한다.
 *
 * 규칙:
 * - gamification 필드를 기본값으로 생성한다.
 * - math.levelProgress 에 저장된 각 레벨의 별점(stars)이 ≥ 2 이면,
 *   해당 레벨이 속한 MATH_THEMES 레슨의 lessonProgress 를 'cleared' 로 표시한다.
 * - 레슨 내 gamePool 의 어떤 slot 의 legacyIds 에라도 별점 ≥ 2 인 레벨이
 *   하나 이상 포함되어 있으면 해당 레슨을 cleared 로 간주한다.
 */
export function migrateV1toV2(raw: SaveData): SaveData {
  const gamification = createDefaultGamificationState();
  const mathProgress = raw.math?.levelProgress ?? {};

  for (const theme of MATH_THEMES) {
    for (const unit of theme.units) {
      for (const lesson of unit.lessons) {
        const isCleared = lesson.gamePool.some((slot) =>
          slot.legacyIds.some((id) => (mathProgress[id]?.stars ?? 0) >= 2),
        );
        if (isCleared) {
          gamification.lessonProgress[lesson.id] = 'cleared';
        }
      }
    }
  }

  return {
    ...raw,
    version: 2,
    gamification,
  };
}

/** v2 → v3: logic, creativity 필드를 빈 맵으로 초기화 */
export function migrateV2toV3(raw: SaveData): SaveData {
  return {
    ...raw,
    version: 3,
    logic: raw.logic ?? { levelProgress: {}, streak: 0, clearCount: 0 },
    creativity: raw.creativity ?? {
      levelProgress: {},
      totalClears: 0,
      consecutiveClears: 0,
      currentLevelIdx: 0,
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
  };
}

/** v3 → v4: creativity.meta 필드 추가 */
export function migrateV3toV4(raw: SaveData): SaveData {
  const creativity = raw.creativity ?? { levelProgress: {} };
  if (!creativity.meta) {
    creativity.meta = {
      totalClears: 0,
      currentStreak: 0,
      bestStreak: 0,
      lastPlayedAt: new Date().toISOString(),
      earnedBadgeThresholds: [],
      recentPuzzleIds: [],
      rankScore: 0,
      maxDifficultyTier: 0,
    };
  }
  // recentPuzzleIds 하위 호환: meta가 존재하지만 필드가 없을 경우
  if (!creativity.meta.recentPuzzleIds) {
    creativity.meta.recentPuzzleIds = [];
  }
  return {
    ...raw,
    version: 4,
    creativity,
  };
}

/** v4 → v5: 아이 프로필 필드 추가 (기존 유저는 profile: null) */
export function migrateV4toV5(raw: SaveData): SaveData {
  return {
    ...raw,
    version: 5,
    profile: raw.profile ?? null,
  };
}

/** v5 → v6: 각 분야에 SubjectProgressData 초기화 (기존 levelProgress 데이터에서 XP 추정) */
export function migrateV5toV6(raw: SaveData): SaveData {
  const data = { ...raw };

  // math
  if (!data.math.progress) {
    const mathStars = Object.values(data.math?.levelProgress ?? {}).reduce((s, lp) => s + (lp.stars ?? 0), 0);
    const mathXp = Math.round(mathStars * 5);
    data.math = {
      ...data.math,
      progress: {
        xp: mathXp,
        level: computeLevel(mathXp),
        totalClears: Object.values(data.math?.levelProgress ?? {}).reduce((s, lp) => s + (lp.playCount ?? 0), 0),
        streak: 0,
        bestStreak: 0,
        placementDone: false,
      },
    };
  }

  // english: 레벨 테스트 결과가 있으면 placementDone = true
  if (!data.english.progress) {
    const englishStars = Object.values(data.english?.levelProgress ?? {}).reduce((s, lp) => s + (lp.stars ?? 0), 0);
    const englishXp = Math.round(englishStars * 5);
    data.english = {
      ...data.english,
      progress: {
        xp: englishXp,
        level: computeLevel(englishXp),
        totalClears: Object.values(data.english?.levelProgress ?? {}).reduce((s, lp) => s + (lp.playCount ?? 0), 0),
        streak: 0,
        bestStreak: 0,
        placementDone: !!data.english?.levelTestResult,
      },
    };
  }

  // logic
  if (data.logic && !data.logic.progress) {
    const logicXp = Math.round((data.logic.clearCount ?? 0) * 10);
    data.logic = {
      ...data.logic,
      progress: {
        xp: logicXp,
        level: computeLevel(logicXp),
        totalClears: data.logic.clearCount ?? 0,
        streak: data.logic.streak ?? 0,
        bestStreak: data.logic.streak ?? 0,
        placementDone: (data.logic.clearCount ?? 0) > 0,
      },
    };
  }

  // creativity
  if (data.creativity && !data.creativity.progress) {
    const creativityTotalClears = data.creativity.meta?.totalClears ?? data.creativity.totalClears ?? 0;
    const creativityXp = Math.round(creativityTotalClears * 10);
    data.creativity = {
      ...data.creativity,
      progress: {
        xp: creativityXp,
        level: computeLevel(creativityXp),
        totalClears: creativityTotalClears,
        streak: data.creativity.meta?.currentStreak ?? data.creativity.streak ?? 0,
        bestStreak: data.creativity.meta?.bestStreak ?? 0,
        placementDone: creativityTotalClears > 0,
      },
    };
  }

  return { ...data, version: 6 };
}

/** v6 → v7: 추리(reasoning) 종목 필드 추가 */
export function migrateV6toV7(raw: SaveData): SaveData {
  return {
    ...raw,
    version: 7,
    reasoning: raw.reasoning ?? {
      levelProgress: { 'reasoning-1': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true } },
      streak: 0,
      clearCount: 0,
    },
  };
}

/**
 * 저장 데이터를 최신 버전으로 단계적으로 마이그레이션한다.
 * 알 수 없는 버전이거나 이미 최신이면 그대로 반환한다.
 */
export function runMigrations(raw: SaveData, targetVersion: number): SaveData {
  let data = raw;

  if (data.version < 2 && targetVersion >= 2) {
    data = migrateV1toV2(data);
  }

  if (data.version < 3 && targetVersion >= 3) {
    data = migrateV2toV3(data);
  }

  if (data.version < 4 && targetVersion >= 4) {
    data = migrateV3toV4(data);
  }

  if (data.version < 5 && targetVersion >= 5) {
    data = migrateV4toV5(data);
  }

  if (data.version < 6 && targetVersion >= 6) {
    data = migrateV5toV6(data);
  }

  if (data.version < 7 && targetVersion >= 7) {
    data = migrateV6toV7(data);
  }

  return data;
}
