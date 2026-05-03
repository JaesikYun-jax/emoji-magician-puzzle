/**
 * S6 — 새로고침 진행 보존
 * 임의 시드 → reload → 진행 데이터 유지 (brand-home 직진 + profile 존재)
 */
import { test, expect } from '@playwright/test';
import { seedSave, readSave } from '../fixtures/saveSeed';
import { gotoApp } from '../fixtures/navigation';

test('S6: 새로고침 후 save 데이터 보존', async ({ page }) => {
  // 특정 진행 상태 시드
  await seedSave(page, {
    reasoning: {
      levelProgress: {
        'reasoning-1': { stars: 2, bestScore: 300, playCount: 3, isUnlocked: true },
      },
      streak: 2,
      clearCount: 3,
    },
  });

  await gotoApp(page);

  // 프로필이 있으면 brand-home 화면에 있어야 함
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'brand-home', {
    timeout: 8_000,
  });

  // 새로고침
  await page.reload();
  await page.waitForFunction(() => document.fonts.ready, undefined, { timeout: 10_000 });

  // 새로고침 후에도 brand-home 화면 (save 로드 성공)
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'brand-home', {
    timeout: 10_000,
  });

  // save 데이터가 보존됐는지 확인
  const save = await readSave(page);
  expect(save).toMatchObject({
    version: 7,
    profile: expect.objectContaining({ nickname: 'TestKid' }),
  });

  const reasoning = (save as any).reasoning;
  expect(reasoning?.clearCount).toBe(3);
  expect(reasoning?.streak).toBe(2);
});
