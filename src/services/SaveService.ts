import type { SaveData, LevelProgress, LevelTestResult } from '../game-data/subjectConfig';
import { MATH_LEVELS } from '../game-data/mathLevels';
import { type UserMathStatus, DEFAULT_STATUS, createDefaultStatus } from '../systems/math/UserMathStatus';
import {
  type GamificationState,
  createDefaultGamificationState,
} from '../systems/gamification/types';
import { runMigrations } from './saveMigrations';

// ── UserMathStatusService (룰 기반 퀴즈 시스템 전용) ─────────────────────────

const QUIZ_STATUS_KEY = 'imoji-user-math-status-v1';

export class UserMathStatusService {
  private status: UserMathStatus;

  constructor() {
    this.status = this.load();
  }

  get(): UserMathStatus {
    return this.status;
  }

  update(next: UserMathStatus): void {
    this.status = next;
    this.save();
  }

  reset(): void {
    this.status = createDefaultStatus();
    this.save();
  }

  hasCompletedLevelTest(): boolean {
    return this.status.levelTestCompletedAt !== null;
  }

  private load(): UserMathStatus {
    try {
      const raw = localStorage.getItem(QUIZ_STATUS_KEY);
      if (!raw) return createDefaultStatus();
      const parsed = JSON.parse(raw) as UserMathStatus;
      return { ...createDefaultStatus(), ...parsed };
    } catch {
      return createDefaultStatus();
    }
  }

  private save(): void {
    try {
      localStorage.setItem(QUIZ_STATUS_KEY, JSON.stringify(this.status));
    } catch {
      // localStorage 실패 시 무시
    }
  }
}

export const userMathStatusService = new UserMathStatusService();

// ── SaveService ───────────────────────────────────────────────────────────────

const SAVE_KEY = 'sabakgam-save-v1';
/**
 * 현재 저장 데이터 버전.
 * v1 → v2 : gamification 필드 추가 (자동 마이그레이션)
 * v2 → v3 : logic, creativity 필드 추가 (자동 마이그레이션)
 */
const SAVE_VERSION = 3;

function getDefaultUnlockedMathIds(): string[] {
  const ops = ['addition', 'subtraction', 'multiplication'] as const;
  return ops
    .map((op) => MATH_LEVELS.find((l) => l.operation === op)?.id)
    .filter((id): id is string => !!id);
}

function createDefaultSaveData(): SaveData {
  const mathProgress: Record<string, LevelProgress> = {};
  for (const id of getDefaultUnlockedMathIds()) {
    mathProgress[id] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
  }
  const logicProgress: Record<string, LevelProgress> = {
    'logic-1': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
  };
  const creativityProgress: Record<string, LevelProgress> = {
    'creativity-1': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
  };
  return {
    version: SAVE_VERSION,
    math: { levelProgress: mathProgress },
    english: { levelProgress: {} },
    settings: { language: 'ko', soundEnabled: true, musicEnabled: true },
    gamification: createDefaultGamificationState(),
    logic: { levelProgress: logicProgress },
    creativity: { levelProgress: creativityProgress },
  };
}

export class SaveService {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return createDefaultSaveData();

      let parsed = JSON.parse(raw) as SaveData;

      // 버전이 다르면 마이그레이션 시도
      if (parsed.version !== SAVE_VERSION) {
        // 완전히 알 수 없는 버전이거나 미래 버전이면 기본값 사용
        if (typeof parsed.version !== 'number' || parsed.version > SAVE_VERSION) {
          return createDefaultSaveData();
        }
        parsed = runMigrations(parsed, SAVE_VERSION);
        // 마이그레이션 후 바로 저장
        try {
          localStorage.setItem(SAVE_KEY, JSON.stringify(parsed));
        } catch {
          // ignore
        }
      }

      // 기본 레벨 해금 보장
      for (const id of getDefaultUnlockedMathIds()) {
        if (!parsed.math.levelProgress[id]) {
          parsed.math.levelProgress[id] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
        }
      }

      // gamification 필드 보장 (v2 이상이지만 필드가 없는 엣지 케이스)
      if (!parsed.gamification) {
        parsed.gamification = createDefaultGamificationState();
      }

      // logic/creativity 필드 보장
      if (!parsed.logic) parsed.logic = { levelProgress: {} };
      if (!parsed.creativity) parsed.creativity = { levelProgress: {} };
      // logic level-1 default unlock
      if (!parsed.logic.levelProgress['logic-1']) {
        parsed.logic.levelProgress['logic-1'] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
      }
      // creativity level-1 default unlock
      if (!parsed.creativity.levelProgress['creativity-1']) {
        parsed.creativity.levelProgress['creativity-1'] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
      }

      return parsed;
    } catch {
      return createDefaultSaveData();
    }
  }

  private save(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch {
      // ignore storage errors
    }
  }

  getMathProgress(levelId: string): LevelProgress {
    return this.data.math.levelProgress[levelId] ?? {
      stars: 0, bestScore: 0, playCount: 0, isUnlocked: false,
    };
  }

  getUnlockedMathIds(): string[] {
    return Object.entries(this.data.math.levelProgress)
      .filter(([, p]) => p.isUnlocked)
      .map(([id]) => id);
  }

  /**
   * 레벨 클리어 기록을 저장하고 다음 레벨을 해금한다.
   * @returns 해금된 다음 레벨 ID (없으면 null)
   */
  recordMathClear(levelId: string, stars: number, score: number): string | null {
    const existing = this.getMathProgress(levelId);
    this.data.math.levelProgress[levelId] = {
      stars: Math.max(existing.stars, stars),
      bestScore: Math.max(existing.bestScore, score),
      playCount: existing.playCount + 1,
      isUnlocked: true,
    };

    const levelList = MATH_LEVELS;
    const currentIndex = levelList.findIndex((l) => l.id === levelId);
    if (currentIndex !== -1 && currentIndex + 1 < levelList.length) {
      const current = levelList[currentIndex];
      const next = levelList[currentIndex + 1];
      if (next.operation === current.operation) {
        if (!this.data.math.levelProgress[next.id]) {
          this.data.math.levelProgress[next.id] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
        } else {
          this.data.math.levelProgress[next.id].isUnlocked = true;
        }
        this.save();
        return next.id;
      }
    }

    this.save();
    return null;
  }

  recordMathPlay(levelId: string): void {
    const existing = this.getMathProgress(levelId);
    this.data.math.levelProgress[levelId] = {
      ...existing,
      playCount: existing.playCount + 1,
    };
    this.save();
  }

  getMathLevelTestResult(): LevelTestResult | null {
    return this.data.math.levelTestResult ?? null;
  }

  recordMathLevelTest(result: LevelTestResult): void {
    this.data.math.levelTestResult = result;
    const recIdx = MATH_LEVELS.findIndex(l => l.id === result.recommendedLevelId);
    if (recIdx >= 0) {
      const op = MATH_LEVELS[recIdx].operation;
      for (const lv of MATH_LEVELS) {
        if (lv.operation === op && lv.levelIndex <= result.recommendedLevelIndex) {
          if (!this.data.math.levelProgress[lv.id]) {
            this.data.math.levelProgress[lv.id] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
          } else {
            this.data.math.levelProgress[lv.id].isUnlocked = true;
          }
        }
      }
    }
    this.save();
  }

  getEnglishLevelTestResult(): LevelTestResult | null {
    return this.data.english.levelTestResult ?? null;
  }

  recordEnglishLevelTest(result: LevelTestResult): void {
    this.data.english.levelTestResult = result;
    this.save();
  }

  saveUserMathStatus(status: UserMathStatus): void {
    (this.data.math as { levelProgress: Record<string, LevelProgress>; levelTestResult?: LevelTestResult; userStatus?: UserMathStatus }).userStatus = status;
    this.save();
  }

  loadUserMathStatus(): UserMathStatus {
    const stored = (this.data.math as { levelProgress: Record<string, LevelProgress>; levelTestResult?: LevelTestResult; userStatus?: UserMathStatus }).userStatus;
    return stored ?? { ...DEFAULT_STATUS };
  }

  clearUserMathStatus(): void {
    delete (this.data.math as { levelProgress: Record<string, LevelProgress>; levelTestResult?: LevelTestResult; userStatus?: UserMathStatus }).userStatus;
    this.save();
  }

  // ── Gamification ───────────────────────────────────────────────────────────

  getGamificationState(): GamificationState {
    return this.data.gamification ?? createDefaultGamificationState();
  }

  saveGamificationState(state: GamificationState): void {
    this.data.gamification = state;
    this.save();
  }

  // ── Logic ──────────────────────────────────────────────────────────────────

  getLogicProgress(levelId: string): LevelProgress {
    return this.data.logic?.levelProgress[levelId] ?? {
      stars: 0, bestScore: 0, playCount: 0, isUnlocked: false,
    };
  }

  recordLogicClear(levelId: string, stars: number, score: number): void {
    if (!this.data.logic) this.data.logic = { levelProgress: {} };
    const existing = this.getLogicProgress(levelId);
    this.data.logic.levelProgress[levelId] = {
      stars: Math.max(existing.stars, stars),
      bestScore: Math.max(existing.bestScore, score),
      playCount: existing.playCount + 1,
      isUnlocked: true,
    };
    // 다음 레벨 해금 — 번호 증가 방식 (logic-1, logic-2, ...)
    const match = levelId.match(/^logic-(\d+)$/);
    if (match) {
      const next = `logic-${parseInt(match[1], 10) + 1}`;
      if (!this.data.logic.levelProgress[next]) {
        this.data.logic.levelProgress[next] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
      }
    }
    this.save();
  }

  // ── Creativity ─────────────────────────────────────────────────────────────

  getCreativityProgress(levelId: string): LevelProgress {
    return this.data.creativity?.levelProgress[levelId] ?? {
      stars: 0, bestScore: 0, playCount: 0, isUnlocked: false,
    };
  }

  recordCreativityClear(levelId: string, stars: number, score: number): void {
    if (!this.data.creativity) this.data.creativity = { levelProgress: {} };
    const existing = this.getCreativityProgress(levelId);
    this.data.creativity.levelProgress[levelId] = {
      stars: Math.max(existing.stars, stars),
      bestScore: Math.max(existing.bestScore, score),
      playCount: existing.playCount + 1,
      isUnlocked: true,
    };
    const match = levelId.match(/^creativity-(\d+)$/);
    if (match) {
      const next = `creativity-${parseInt(match[1], 10) + 1}`;
      if (!this.data.creativity.levelProgress[next]) {
        this.data.creativity.levelProgress[next] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
      }
    }
    this.save();
  }
}

export const saveService = new SaveService();
