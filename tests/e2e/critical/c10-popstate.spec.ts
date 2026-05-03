/**
 * C10 — 게임 중 popstate (Android 뒤로가기)
 * game-eq-fill 진입 → window.dispatchEvent(new PopStateEvent) 시뮬레이션
 * → confirmExit 모달 노출 → 확인 → 메뉴 복귀 + save 변화 없음
 */
import { test, expect } from '@playwright/test';
import { seedSave, readSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';

test('C10: Android 뒤로가기 — confirmExit 모달 노출 → 확인 → 메뉴 복귀', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // 실제 사용자 흐름: math-menu 거쳐서 게임 진입 (back stack 사실적으로)
  await navigateTo(page, 'math-menu', { subject: 'math' });
  await navigateTo(page, 'game-eq-fill', { subject: 'math', levelId: 'eq-fill-1' });
  await expect(page.locator('#eq-fill-game')).toBeVisible({ timeout: 8_000 });

  // 게임 시작 전 save 데이터 스냅샷
  const saveBefore = await readSave(page);

  // popstate 이벤트 시뮬레이션 (Android 뒤로가기 = pushState + popstate)
  await page.evaluate(() => {
    // main.ts 의 popstate 핸들러가 등록되어 있음
    // history.pushState 후 popstate dispatch
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  });

  // confirmExit 오버레이 노출 확인
  await page.waitForSelector('#confirm-exit-overlay', { timeout: 5_000 });
  await expect(page.locator('#confirm-exit-overlay')).toBeVisible();

  // "확인" 버튼 탭 (종료 확인)
  const confirmBtn = page
    .locator('#confirm-exit-overlay button')
    .filter({ hasText: /확인|나가기|종료|yes/i })
    .first();
  await expect(confirmBtn).toBeVisible({ timeout: 3_000 });
  await confirmBtn.tap();

  // 메뉴 화면으로 복귀 확인 (math-menu 또는 home-b)
  await page.waitForSelector(
    'body[data-screen="math-menu"], body[data-screen="home-b"], body[data-screen="arithmetic-menu"]',
    { timeout: 8_000 }
  );

  // save 데이터 변화 없음 확인 (게임 중 뒤로가기 → 저장 안 됨)
  const saveAfter = await readSave(page);
  expect((saveAfter as any).version).toBe((saveBefore as any).version);
});
