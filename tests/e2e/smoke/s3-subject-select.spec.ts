/**
 * S3 — 종목 선택 도달
 * 프로필 시드 → home-b CTA → subject-select 5개 카드 가시화
 */
import { test, expect } from '@playwright/test';
import { seedSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';

test('S3: 종목 선택 화면에 5개 카드 노출', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // __appRouter 로 subject-select 직행
  await navigateTo(page, 'subject-select');

  // subject-select 화면 가시화
  await expect(page.locator('#subject-select')).toBeVisible();

  // 5개 종목 카드 모두 가시화
  const subjects = ['math', 'english', 'logic', 'creativity', 'reasoning'];
  for (const subject of subjects) {
    await expect(page.locator(`[data-subject="${subject}"]`)).toBeVisible({
      timeout: 5_000,
    });
  }
});
