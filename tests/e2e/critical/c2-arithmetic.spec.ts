/**
 * C2 — ArithmeticGame 전체 사이클
 * arithmetic-menu → game-arithmetic easy → 5문 정답 sweep → stars≥1 result
 */
import { test, expect } from '@playwright/test';
import { seedSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';
import { playUntilResult } from '../fixtures/assertions';

test('C2: ArithmeticGame easy — 5문 정답 → stars≥1 result', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // game-arithmetic 으로 직접 이동 (easy, level 1)
  await page.evaluate(() => {
    (window as any).__appRouter?.navigate({
      to: 'game-arithmetic',
      subject: 'math',
      levelId: 'arithmetic-1',
      difficulty: 'easy',
    });
  });

  // 게임 화면 노출 대기
  await expect(page.locator('.arith-game')).toBeVisible({ timeout: 8_000 });

  // result 가 뜰 때까지 정답 sweep (실제 라운드 수에 무관)
  await playUntilResult(page, { maxTaps: 12 });

  // result 화면 노출 (cleared = true, stars ≥ 1)
  const result = page.locator('#result-screen, [data-game-result="true"]').first();
  await expect(result).toBeVisible({ timeout: 10_000 });
  const starsAttr = await result.getAttribute('data-stars');
  expect(parseInt(starsAttr ?? '0')).toBeGreaterThanOrEqual(1);
  expect(await result.getAttribute('data-cleared')).toBe('true');
});
