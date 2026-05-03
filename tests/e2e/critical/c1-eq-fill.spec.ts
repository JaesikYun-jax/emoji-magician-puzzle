/**
 * C1 — EquationFillGame 전체 사이클
 * math-menu → game-eq-fill → 정답 선택 → result cleared:true → math-menu 복귀
 */
import { test, expect } from '@playwright/test';
import { seedSave, readSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';
import { expectResultScreen, playUntilResult } from '../fixtures/assertions';

test('C1: EquationFillGame — 정답 입력 → result cleared', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // eq-fill 게임으로 직접 이동
  await navigateTo(page, 'game-eq-fill', { subject: 'math', levelId: 'eq-fill-1' });

  // 게임 화면 노출
  await expect(page.locator('#eq-fill-game')).toBeVisible({ timeout: 8_000 });

  // 정답 버튼을 result 가 뜰 때까지 반복 탭 (eq-fill-1 은 8문)
  await playUntilResult(page, { maxTaps: 12 });

  // result 화면 노출 (cleared = true)
  await expectResultScreen(page, { cleared: true });

  // 메뉴 복귀 버튼 클릭 (EqFill 자체 overlay 의 "메뉴로" 버튼)
  const menuBtn = page
    .locator('[data-game-result="true"] button, #result-screen button')
    .filter({ hasText: /메뉴|menu/i })
    .first();
  await expect(menuBtn).toBeVisible({ timeout: 5_000 });
  await menuBtn.tap();

  // 메뉴 화면 복귀 확인 (back() 으로 이전 화면 복귀)
  await page.waitForFunction(
    () => {
      const screen = document.body.dataset['screen'];
      return screen !== 'game-eq-fill' && screen !== undefined;
    },
    undefined,
    { timeout: 8_000 },
  );
});
