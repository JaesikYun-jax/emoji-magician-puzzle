/**
 * C3 — EnglishGame beginner 전체 사이클
 * english-menu → game-english beginner → 5문 정답 → english:levelClear emit → result 노출
 */
import { test, expect } from '@playwright/test';
import { seedSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';
import { playUntilResult, expectResultScreen } from '../fixtures/assertions';

test('C3: EnglishGame beginner — 정답 5회 → result 노출', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // game-english 직접 이동
  await navigateTo(page, 'game-english', { subject: 'english', levelId: 'beginner' });

  // 영어 게임 화면 노출
  await expect(page.locator('.english-game')).toBeVisible({ timeout: 8_000 });

  // result 가 뜰 때까지 정답 sweep (10문 등 실제 라운드 수에 무관)
  await playUntilResult(page, { maxTaps: 15 });

  // 결과 화면 노출 확인 (English 게임은 자체 overlay 사용)
  await expectResultScreen(page, { cleared: true });
});
