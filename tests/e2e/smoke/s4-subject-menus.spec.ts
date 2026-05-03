/**
 * S4 — 5종목 메뉴 진입 (parameterized)
 * 각 종목 카드 탭 → 해당 종목 메뉴 화면 가시화
 */
import { test, expect } from '@playwright/test';
import { seedSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';

const SUBJECTS = [
  { id: 'math', screen: 'math-menu' },
  { id: 'english', screen: 'english-menu' },
  { id: 'logic', screen: 'logic-menu' },
  { id: 'creativity', screen: 'creativity-menu' },
  { id: 'reasoning', screen: 'reasoning-menu' },
] as const;

for (const { id, screen } of SUBJECTS) {
  test(`S4: ${id} 종목 메뉴 진입`, async ({ page }) => {
    await seedSave(page);
    await gotoApp(page);

    // subject-select 로 이동
    await navigateTo(page, 'subject-select');

    // 종목 카드 탭
    const card = page.locator(`[data-subject="${id}"]`);
    await expect(card).toBeVisible();
    await card.tap();

    // 해당 종목 메뉴 화면 가시화
    await expect(page.locator('body')).toHaveAttribute('data-screen', screen, {
      timeout: 8_000,
    });
  });
}
