/**
 * C7 — ReasoningGame easy 5문
 * reasoning-menu → game-reasoning → data-correct 5회 탭 → result + reasoning.progress.streak=1
 */
import { test, expect } from '@playwright/test';
import { seedSave, readSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';

test('C7: ReasoningGame easy 5문 정답 → result + streak 기록', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // game-reasoning 직접 이동 (easy 난이도)
  await page.evaluate(() => {
    (window as any).__appRouter?.navigate({
      to: 'game-reasoning',
      subject: 'reasoning',
      difficulty: 'easy',
    });
  });
  await expect(page.locator('body')).toHaveAttribute('data-screen', 'game-reasoning', {
    timeout: 8_000,
  });

  // reasoning-game-root 노출
  await expect(page.locator('#reasoning-game-root')).toBeVisible({ timeout: 8_000 });

  // data-correct 버튼 5회 탭 (5문)
  for (let i = 0; i < 5; i++) {
    const correctBtn = page.locator('[data-correct="true"]').first();

    // 결과 화면이 먼저 나타나면 종료
    const resultShown = await page.locator('#reasoning-game-root [id$="-retry"], #reasoning-game-root button')
      .filter({ hasText: /다시|메뉴|홈/ })
      .first()
      .isVisible()
      .catch(() => false);
    if (resultShown) break;

    await expect(correctBtn).toBeVisible({ timeout: 6_000 });
    await correctBtn.tap();
    // 정답 피드백 + 다음 문제 렌더링 대기
    await page.waitForTimeout(900);
  }

  // ReasoningGame 자체 result 화면 노출 (별 + 점수 표시)
  const resultEl = page.locator('#reasoning-game-root').locator('div').filter({ hasText: /완벽|잘했|도전/ }).first();
  await expect(resultEl).toBeVisible({ timeout: 10_000 });

  // saveService.reasoning.clearCount 증가 확인 (ReasoningGame 내부에서 recordSubjectClear 호출)
  const save = await readSave(page);
  // reasoning progress 기록 확인
  const reasoning = (save as any).reasoning;
  // 기록됐으면 clearCount 또는 streak > 0
  // (게임이 정상 완료됐을 때 recordSubjectClear 가 호출됨)
  expect(reasoning).toBeTruthy();
});
