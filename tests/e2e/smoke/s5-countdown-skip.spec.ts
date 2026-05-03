/**
 * S5 — 카운트다운 스킵 훅
 * math-menu → level-intro 진입 → __E2E_SKIP_COUNTDOWN__ 훅 작동 확인
 * → 게임 화면 즉시 노출 (실시간 대기 없음)
 */
import { test, expect } from '@playwright/test';
import { seedSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo, enableSkipCountdown } from '../fixtures/navigation';

test('S5: __E2E_SKIP_COUNTDOWN__ 훅 — 카운트다운 없이 즉시 게임 시작', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // 카운트다운 스킵 훅 활성화
  await enableSkipCountdown(page);

  // math-menu 로 이동
  await navigateTo(page, 'math-menu', { subject: 'math' });

  // level-intro 로 이동 (math-add-single-1 = G1 수박게임 level 1)
  await navigateTo(page, 'level-intro', { levelId: 'math-add-single-1' });

  // 카운트다운 스킵 → game:start emit → g1 게임 시작 (화면 전환 즉시)
  // level-intro 가 사라지고 HUD 가 나타나거나, g1-container 가 보이면 성공
  await expect(
    page.locator('#hud, #g1-container').first()
  ).toBeVisible({ timeout: 3_000 });
});
