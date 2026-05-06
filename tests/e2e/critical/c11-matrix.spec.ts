/**
 * C11 — MatrixReasoningGame 전체 사이클 (3개 cellKind)
 * logic-menu → game-matrix-reasoning → data-correct 보기 탭 → result overlay 노출
 *
 * 입문(matrix-1, emoji), 중급(matrix-11, number), 고급(matrix-21, setcard) 각 검증.
 */
import { test, expect, type Page } from '@playwright/test';
import { seedSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';

async function playUntilResult(page: Page) {
  let resultShown = false;
  for (let round = 0; round < 12; round++) {
    resultShown = await page.locator('.mr-result-overlay').isVisible().catch(() => false);
    if (resultShown) break;

    const correctBtn = page.locator('[data-correct="true"]').first();
    const isVisible = await correctBtn.isVisible().catch(() => false);
    if (!isVisible) {
      await page.waitForSelector('.mr-result-overlay', { timeout: 5_000 }).catch(() => {});
      resultShown = await page.locator('.mr-result-overlay').isVisible().catch(() => false);
      break;
    }
    await correctBtn.tap();
    await page.waitForTimeout(900);
  }
  await expect(page.locator('.mr-result-overlay')).toBeVisible({ timeout: 10_000 });
}

test('C11a: MatrixReasoningGame matrix-1 (emoji) — 정답 보기 탭 → result overlay', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);
  await navigateTo(page, 'game-matrix-reasoning', { subject: 'logic', levelId: 'matrix-1' });
  await expect(page.locator('#matrix-reasoning-game')).toBeVisible({ timeout: 8_000 });
  await playUntilResult(page);
});

test('C11b: MatrixReasoningGame matrix-11 (number) — 정답 보기 탭 → result overlay', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);
  await navigateTo(page, 'game-matrix-reasoning', { subject: 'logic', levelId: 'matrix-11' });
  await expect(page.locator('#matrix-reasoning-game')).toBeVisible({ timeout: 8_000 });
  await playUntilResult(page);
});

test('C11c: MatrixReasoningGame matrix-21 (setcard) — 정답 보기 탭 → result overlay', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);
  await navigateTo(page, 'game-matrix-reasoning', { subject: 'logic', levelId: 'matrix-21' });
  await expect(page.locator('#matrix-reasoning-game')).toBeVisible({ timeout: 8_000 });
  await playUntilResult(page);
});
