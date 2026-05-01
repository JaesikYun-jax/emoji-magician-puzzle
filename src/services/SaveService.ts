import type { SaveData, LevelProgress, LevelTestResult, CreativityMeta, ChildProfile, SubjectProgressData } from '../game-data/subjectConfig';
import { MATH_LEVELS } from '../game-data/mathLevels';
import { CREATIVITY_BADGES, getCreativityRank, computeDifficultyPoints, computeDifficultyTier } from '../game-data/creativityLevels';
import { type UserMathStatus, DEFAULT_STATUS, createDefaultStatus } from '../systems/math/UserMathStatus';
import {
  type GamificationState,
  createDefaultGamificationState,
} from '../systems/gamification/types';
import { computeLevel } from '../systems/progression/xpEngine';
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
 * v3 → v4 : creativity 자동 진행 방식 (totalClears, consecutiveClears, currentLevelIdx)
 * v4 → v5 : 아이 프로필 (nickname + ageGroup) 추가
 * v5 → v6 : 각 분야에 SubjectProgressData (XP/레벨/진단) 추가
 * v6 → v7 : 추리(reasoning) 종목 필드 추가
 */
const SAVE_VERSION = 7;

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
    logic: { levelProgress: logicProgress, streak: 0, clearCount: 0 },
    creativity: { levelProgress: creativityProgress, playerLevel: 1, totalClears: 0, streak: 0 },
    profile: null,
    reasoning: { levelProgress: { 'reasoning-1': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true } }, streak: 0, clearCount: 0 },
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
      // logic 신규 통계 필드 fallback
      if (parsed.logic.streak == null) parsed.logic.streak = 0;
      if (parsed.logic.clearCount == null) parsed.logic.clearCount = 0;
      // creativity level-1 default unlock
      if (!parsed.creativity.levelProgress['creativity-1']) {
        parsed.creativity.levelProgress['creativity-1'] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
      }
      if (parsed.creativity.playerLevel === undefined) parsed.creativity.playerLevel = 1;
      if (parsed.creativity.totalClears === undefined) parsed.creativity.totalClears = 0;
      if (parsed.creativity.streak === undefined) parsed.creativity.streak = 0;
      if (parsed.creativity.meta && parsed.creativity.meta.rankScore == null) {
        parsed.creativity.meta.rankScore = 0;
      }
      if (parsed.creativity.meta && parsed.creativity.meta.maxDifficultyTier == null) {
        parsed.creativity.meta.maxDifficultyTier = 0;
      }

      // reasoning 필드 보장
      if (!parsed.reasoning) parsed.reasoning = { levelProgress: {}, streak: 0, clearCount: 0 };
      if (!parsed.reasoning.levelProgress['reasoning-1']) {
        parsed.reasoning.levelProgress['reasoning-1'] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
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
    if (!this.data.logic) this.data.logic = { levelProgress: {}, streak: 0, clearCount: 0 };
    const existing = this.getLogicProgress(levelId);
    this.data.logic.levelProgress[levelId] = {
      stars: Math.max(existing.stars, stars),
      bestScore: Math.max(existing.bestScore, score),
      playCount: existing.playCount + 1,
      isUnlocked: true,
    };
    // streak 및 clearCount 업데이트
    this.data.logic.streak = (this.data.logic.streak ?? 0) + 1;
    this.data.logic.clearCount = (this.data.logic.clearCount ?? 0) + 1;
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

  recordLogicFail(): void {
    if (!this.data.logic) this.data.logic = { levelProgress: {}, streak: 0, clearCount: 0 };
    this.data.logic.streak = 0;
    this.save();
  }

  getLogicStreak(): number {
    return this.data.logic?.streak ?? 0;
  }

  getLogicClearCount(): number {
    return this.data.logic?.clearCount ?? 0;
  }

  getCurrentLogicLevelId(): string {
    const progress = this.data.logic?.levelProgress ?? {};
    const clearedNums = Object.keys(progress)
      .filter(id => {
        const p = progress[id];
        return p.stars > 0 || p.bestScore > 0;
      })
      .map(id => {
        const m = id.match(/^logic-(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(n => n > 0);

    if (clearedNums.length === 0) return 'logic-1';
    const maxCleared = Math.max(...clearedNums);
    const nextNum = maxCleared + 1;
    return nextNum <= 10 ? `logic-${nextNum}` : 'logic-10';
  }

  // ── Creativity ─────────────────────────────────────────────────────────────

  getCreativityProgress(levelId: string): LevelProgress {
    return this.data.creativity?.levelProgress[levelId] ?? {
      stars: 0, bestScore: 0, playCount: 0, isUnlocked: false,
    };
  }

  recordCreativityClear(levelId: string, timeUsed: number): void {
    if (!this.data.creativity) this.data.creativity = { levelProgress: {} };
    const existing = this.getCreativityProgress(levelId);
    this.data.creativity.levelProgress[levelId] = {
      stars: 0,
      bestScore: existing.bestScore === 0 ? timeUsed : Math.min(existing.bestScore, timeUsed),
      playCount: existing.playCount + 1,
      isUnlocked: true,
    };
    // 진행 레벨 증가
    const prev = this.data.creativity.playerLevel ?? 1;
    this.data.creativity.playerLevel = prev + 1;
    // 누적 클리어
    this.data.creativity.totalClears = (this.data.creativity.totalClears ?? 0) + 1;
    // 연속 성공
    this.data.creativity.streak = (this.data.creativity.streak ?? 0) + 1;
    this.save();
  }

  recordCreativityFail(): void {
    if (!this.data.creativity) this.data.creativity = { levelProgress: {} };
    this.data.creativity.streak = 0;
    this.save();
  }

  getCreativityStats(): { playerLevel: number; totalClears: number; streak: number } {
    const c = this.data.creativity;
    return {
      playerLevel: c?.playerLevel ?? 1,
      totalClears: c?.totalClears ?? 0,
      streak: c?.streak ?? 0,
    };
  }

  /**
   * 창의 종목의 현재 플레이어 레벨 번호 반환 (1-based).
   * playerLevel 필드를 우선 사용하고, 없으면 클리어 이력에서 계산.
   */
  getCreativityPlayerLevel(): number {
    return this.data.creativity?.playerLevel ?? 1;
  }

  /** 창의 종목 총 클리어 횟수 */
  getCreativityTotalClears(): number {
    return this.data.creativity?.totalClears ?? 0;
  }

  /** 창의 종목 메타 조회 (자동 진행 방식 v4). meta가 없으면 기본값 반환. */
  getCreativityMeta(): CreativityMeta {
    return this.data.creativity?.meta ?? this._createDefaultCreativityMeta();
  }

  /**
   * 창의 종목 클리어/실패 기록 (자동 진행 방식 v4).
   * 성공 시 totalClears/currentStreak 증가, 실패 시 streak 리셋.
   * 뱃지/랭크 변화도 함께 계산해서 반환.
   */
  recordCreativityClearV2(cleared: boolean, cols = 3, rows = 3): {
    meta: CreativityMeta;
    newBadge: { threshold: number; emoji: string; name: string } | null;
    leveledUp: boolean;
    newLevel: number;
  } {
    if (!this.data.creativity) {
      this.data.creativity = { levelProgress: {} };
    }
    const meta: CreativityMeta = this.data.creativity.meta ?? this._createDefaultCreativityMeta();
    if (!meta.recentPuzzleIds) meta.recentPuzzleIds = [];  // 하위 호환
    if (meta.rankScore == null) meta.rankScore = 0;
    if (meta.maxDifficultyTier == null) meta.maxDifficultyTier = 0;
    const prevLevel = getCreativityRank(meta.rankScore, meta.maxDifficultyTier).level;

    let newBadge: { threshold: number; emoji: string; name: string } | null = null;
    if (cleared) {
      meta.totalClears += 1;
      const diffPts = computeDifficultyPoints(cols, rows);
      meta.rankScore = (meta.rankScore ?? 0) + diffPts;
      const tier = computeDifficultyTier(cols, rows);
      meta.maxDifficultyTier = Math.max(meta.maxDifficultyTier ?? 0, tier);
      meta.currentStreak += 1;
      if (meta.currentStreak > meta.bestStreak) meta.bestStreak = meta.currentStreak;

      for (const b of CREATIVITY_BADGES) {
        if (meta.totalClears >= b.threshold && !meta.earnedBadgeThresholds.includes(b.threshold)) {
          meta.earnedBadgeThresholds.push(b.threshold);
          if (!newBadge) newBadge = { threshold: b.threshold, emoji: b.emoji, name: b.name };
        }
      }
    } else {
      meta.currentStreak = 0;
    }
    meta.lastPlayedAt = new Date().toISOString();
    this.data.creativity.meta = meta;
    this.save();

    const newLevel = getCreativityRank(meta.rankScore, meta.maxDifficultyTier).level;
    return {
      meta: { ...meta, earnedBadgeThresholds: [...meta.earnedBadgeThresholds] },
      newBadge,
      leveledUp: newLevel > prevLevel,
      newLevel,
    };
  }

  /**
   * 최근 플레이한 퍼즐 id 기록 (최대 20개 FIFO).
   * 퍼즐 시작 또는 완료 시 호출.
   */
  addRecentCreativityPuzzleId(puzzleId: string): void {
    if (!this.data.creativity) {
      this.data.creativity = { levelProgress: {} };
    }
    const meta = this.data.creativity.meta ?? this._createDefaultCreativityMeta();
    if (!meta.recentPuzzleIds) meta.recentPuzzleIds = [];
    // 중복 제거 후 맨 뒤 추가
    meta.recentPuzzleIds = meta.recentPuzzleIds.filter(id => id !== puzzleId);
    meta.recentPuzzleIds.push(puzzleId);
    if (meta.recentPuzzleIds.length > 20) {
      meta.recentPuzzleIds = meta.recentPuzzleIds.slice(-20);
    }
    this.data.creativity.meta = meta;
    this.save();
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  hasProfile(): boolean {
    return this.data.profile != null;
  }

  getProfile(): ChildProfile | null {
    return this.data.profile ?? null;
  }

  setProfile(profile: ChildProfile): void {
    this.data.profile = profile;
    this.save();
  }

  private _createDefaultCreativityMeta(): CreativityMeta {
    return {
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

  // ── SubjectProgress (v6) ───────────────────────────────────────────────────

  private _defaultProgress(): SubjectProgressData {
    return { xp: 0, level: 1, totalClears: 0, streak: 0, bestStreak: 0, placementDone: false };
  }

  /** 분야의 SubjectProgressData를 가져옴. 없으면 기본값 반환 */
  getSubjectProgress(subjectId: 'math' | 'english' | 'logic' | 'creativity' | 'reasoning'): SubjectProgressData {
    const data = this.data;
    if (subjectId === 'logic') return data.logic?.progress ?? this._defaultProgress();
    if (subjectId === 'creativity') return data.creativity?.progress ?? this._defaultProgress();
    if (subjectId === 'reasoning') return data.reasoning?.progress ?? this._defaultProgress();
    return data[subjectId].progress ?? this._defaultProgress();
  }

  /** 분야의 SubjectProgressData를 업데이트 */
  updateSubjectProgress(
    subjectId: 'math' | 'english' | 'logic' | 'creativity' | 'reasoning',
    updater: (prev: SubjectProgressData) => SubjectProgressData,
  ): void {
    const prev = this.getSubjectProgress(subjectId);
    const next = updater(prev);
    if (subjectId === 'math') {
      this.data.math.progress = next;
    } else if (subjectId === 'english') {
      this.data.english.progress = next;
    } else if (subjectId === 'logic') {
      if (!this.data.logic) this.data.logic = { levelProgress: {} };
      this.data.logic.progress = next;
    } else if (subjectId === 'creativity') {
      if (!this.data.creativity) this.data.creativity = { levelProgress: {} };
      this.data.creativity.progress = next;
    } else if (subjectId === 'reasoning') {
      if (!this.data.reasoning) this.data.reasoning = { levelProgress: {} };
      this.data.reasoning.progress = next;
    }
    this.save();
  }

  /** XP 획득 + 클리어 기록 (게임 종료 시 호출) */
  recordSubjectClear(
    subjectId: 'math' | 'english' | 'logic' | 'creativity' | 'reasoning',
    xpGained: number,
    isCorrect: boolean,
  ): SubjectProgressData {
    let result: SubjectProgressData = this._defaultProgress();
    this.updateSubjectProgress(subjectId, (prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newXp = isCorrect ? prev.xp + xpGained : prev.xp;
      const newTotalClears = prev.totalClears + 1;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      const level = computeLevel(newXp);
      result = { ...prev, xp: newXp, level, totalClears: newTotalClears, streak: newStreak, bestStreak: newBestStreak };
      return result;
    });
    return result;
  }

  /** 진단(Placement) 완료 기록 */
  recordPlacementDone(
    subjectId: 'math' | 'english' | 'logic' | 'creativity' | 'reasoning',
    correctCount: number,
    totalQuestions: number,
  ): void {
    this.updateSubjectProgress(subjectId, (prev) => ({
      ...prev,
      placementDone: true,
      placementScore: correctCount,
      xp: Math.round((correctCount / totalQuestions) * 50),
      level: Math.round((correctCount / totalQuestions) * 3) + 1,
    }));
  }

  /** 진단 완료 여부 */
  isPlacementDone(subjectId: 'math' | 'english' | 'logic' | 'creativity' | 'reasoning'): boolean {
    return this.getSubjectProgress(subjectId).placementDone;
  }
}

export const saveService = new SaveService();
