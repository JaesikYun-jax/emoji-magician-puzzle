/**
 * S1 — 앱 부팅 Smoke
 * `/` 진입 → brand-home 화면 + 한글 타이틀 + CTA 버튼 가시화
 */
import { test, expect } from '@playwright/test';
import { clearSave } from '../fixtures/saveSeed';

test('S1: 앱 부팅 — brand-home 노출', async ({ page }) => {
  await clearSave(page);
  await page.goto('/');

  // Pretendard 폰트 로드 대기
  await page.waitForFunction(() => document.fonts.ready, undefined, { timeout: 10_000 });

  // brand-home 화면 노출 확인
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'brand-home', {
    timeout: 10_000,
  });

  // #brand-home 엘리먼트 가시화
  await expect(page.locator('#brand-home')).toBeVisible();

  // 한글 텍스트 존재 (타이틀 또는 CTA 버튼)
  const hasKoreanText = await page.evaluate(() => {
    const text = document.body.innerText;
    return /[\uAC00-\uD7A3]/.test(text);
  });
  expect(hasKoreanText).toBe(true);

  // CTA 버튼 1개 이상 존재
  const buttons = page.locator('#brand-home button');
  await expect(buttons.first()).toBeVisible();
});
