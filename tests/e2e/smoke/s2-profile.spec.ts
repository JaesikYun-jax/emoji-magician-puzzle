/**
 * S2 — 프로필 첫 진입
 * 빈 save → 앱 시작 → CTA 탭 → profile-setup 노출 + 닉네임 input focus 가능
 */
import { test, expect } from '@playwright/test';
import { clearSave } from '../fixtures/saveSeed';
import { gotoApp } from '../fixtures/navigation';

test('S2: 빈 save → 프로필 설정 화면 노출', async ({ page }) => {
  await clearSave(page);
  await gotoApp(page);

  // brand-home 시작 CTA 탭 (언어 칩 등 보조 버튼이 아닌 진짜 시작 버튼)
  const cta = page.locator('.bh-cta-start').first();
  await expect(cta).toBeVisible();
  await cta.tap();

  // profile-setup 화면 노출
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'profile-setup', {
    timeout: 8_000,
  });

  // 닉네임 입력 필드 존재 + 상호작용 가능
  const nicknameInput = page
    .locator('input[type="text"], input[placeholder*="이름"], input[placeholder*="닉네임"]')
    .first();
  await expect(nicknameInput).toBeVisible({ timeout: 5_000 });
  await expect(nicknameInput).toBeEnabled();

  // 입력 가능 확인
  await nicknameInput.fill('테스트');
  await expect(nicknameInput).toHaveValue('테스트');
});
