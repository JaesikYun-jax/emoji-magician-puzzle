/**
 * C6 — OddOneOutGame 전체 사이클
 * logic-menu → game-odd-one-out → data-correct 도형 탭 → result overlay 노출
 */
import { test, expect } from '@playwright/test';
import { seedSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';

test('C6: OddOneOutGame — 정답 도형 탭 → result overlay', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // odd-one-out 게임으로 직접 이동
  await navigateTo(page, 'game-odd-one-out', { subject: 'logic' });

  // 게임 화면 노출
  await expect(page.locator('#odd-one-out-game')).toBeVisible({ timeout: 8_000 });

  // 각 라운드마다 data-correct 도형 탭 (OddOneOutLevelConfig 의 totalRounds 만큼)
  // 일반적으로 3~5 라운드. 최대 10라운드 시도
  let resultShown = false;
  for (let round = 0; round < 10; round++) {
    // result overlay 가 이미 나타났으면 종료
    resultShown = await page.locator('.ooo-result-overlay').isVisible().catch(() => false);
    if (resultShown) break;

    // data-correct 도형 아이템 찾기
    const correctItem = page.locator('[data-correct="true"]').first();
    const isVisible = await correctItem.isVisible().catch(() => false);
    if (!isVisible) {
      // result overlay 가 나타날 때까지 대기
      await page.waitForSelector('.ooo-result-overlay', { timeout: 5_000 }).catch(() => {});
      resultShown = await page.locator('.ooo-result-overlay').isVisible().catch(() => false);
      break;
    }

    await correctItem.tap();
    // 다음 라운드 전환 대기
    await page.waitForTimeout(900);
  }

  // result overlay 노출 확인
  await expect(page.locator('.ooo-result-overlay')).toBeVisible({ timeout: 10_000 });
});
