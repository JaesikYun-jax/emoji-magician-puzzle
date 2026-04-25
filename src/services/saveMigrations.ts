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

  return data;
}
