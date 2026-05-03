import type { Page } from '@playwright/test';

/**
 * localStorage 키 — SaveService.ts 의 SAVE_KEY 와 동일
 */
export const SAVE_KEY = 'sabakgam-save-v1';
export const SAVE_VERSION = 7;

/**
 * 프로필 기본값
 */
export interface SeedProfile {
  nickname: string;
  ageGroup: '5-6' | '7-9' | '10-12';
}

/**
 * 기본 v7 SaveData 스키마.
 * SaveService.ts 의 createDefaultSaveData() 와 동기화 필수.
 */
function createDefaultSave(profile?: SeedProfile): object {
  return {
    version: SAVE_VERSION,
    profile: profile ?? { nickname: 'TestKid', ageGroup: '7-9' },
    math: {
      levelProgress: {
        'add-1-easy': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
        'sub-1-easy': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
        'mul-1-easy': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
      },
    },
    english: { levelProgress: {} },
    settings: { language: 'ko', soundEnabled: true, musicEnabled: true },
    gamification: {
      xp: 0,
      level: 1,
      totalPlays: 0,
      streakDays: 0,
      lastPlayDate: null,
      badges: [],
    },
    logic: {
      levelProgress: {
        'logic-1': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
      },
      streak: 0,
      clearCount: 0,
    },
    creativity: {
      levelProgress: {
        'creativity-1': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
      },
      playerLevel: 1,
      totalClears: 0,
      streak: 0,
    },
    reasoning: {
      levelProgress: {
        'reasoning-1': { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true },
      },
      streak: 0,
      clearCount: 0,
    },
  };
}

/**
 * seedSave — page 로드 전에 addInitScript 로 localStorage 에 시드 주입.
 * 반드시 page.goto() 호출 전에 실행해야 한다.
 */
export async function seedSave(
  page: Page,
  overrides: Record<string, unknown> = {},
  profile?: SeedProfile,
): Promise<void> {
  const base = createDefaultSave(profile);
  const merged = { ...base, ...overrides };
  await page.addInitScript(
    ({ key, data }: { key: string; data: object }) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: SAVE_KEY, data: merged },
  );
}

/**
 * clearSave — localStorage 를 비워서 "첫 진입" 상태를 만든다.
 * page.goto() 전에 addInitScript 로 실행.
 */
export async function clearSave(page: Page): Promise<void> {
  await page.addInitScript((key: string) => {
    localStorage.removeItem(key);
    localStorage.removeItem('imoji-user-math-status-v1');
  }, SAVE_KEY);
}

/**
 * 현재 브라우저 localStorage 에서 save 데이터를 읽어온다.
 * page.goto() 이후에만 사용 가능.
 */
export async function readSave(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate((key: string) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  }, SAVE_KEY);
}
