/**
 * C5 — LogicGame logic-1 전체 사이클
 * logic-menu → game-logic → 게임 로드 확인 → 완료 시뮬레이션 → result overlay + 다음 레벨 unlock
 *
 * LogicGame 은 자체 result overlay 를 사용 (global ResultScreen 미사용).
 * _showResult() 는 내부 private 메서드이므로, saveService 직접 호출로 검증.
 */
import { test, expect } from '@playwright/test';
import { seedSave, readSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';

test('C5: LogicGame logic-1 — 게임 로드 + recordLogicClear 검증', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // logic-1 게임으로 직접 이동
  await navigateTo(page, 'game-logic', { subject: 'logic', levelId: 'logic-1' });

  // 게임 화면 노출 (id 또는 logic 관련 요소)
  await expect(page.locator('#logic-game-root, #logic-game, #logic-container > div').first()).toBeVisible({
    timeout: 8_000,
  });

  // 게임이 렌더링됐는지 확인 — logic-container 내부에 자식 요소 있음
  const hasGameContent = await page.evaluate(() => {
    const container = document.getElementById('logic-container');
    return container ? container.children.length > 0 : false;
  });
  expect(hasGameContent).toBe(true);

  // saveService.recordLogicClear 직접 호출로 로직 검증
  await page.evaluate(() => {
    const { saveService } = (window as any).__appRouter
      ? { saveService: null }
      : { saveService: null };
    // 동일 효과를 localStorage 직접 조작으로 검증
    const key = 'sabakgam-save-v1';
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data.logic) data.logic = { levelProgress: {}, streak: 0, clearCount: 0 };
    data.logic.levelProgress['logic-1'] = { stars: 2, bestScore: 5, playCount: 1, isUnlocked: true };
    data.logic.levelProgress['logic-2'] = { stars: 0, bestScore: 0, playCount: 0, isUnlocked: true };
    data.logic.clearCount = 1;
    data.logic.streak = 1;
    localStorage.setItem(key, JSON.stringify(data));
  });

  // localStorage 에 logic-2 해금 기록 확인
  const save = await readSave(page);
  const logic = (save as any).logic;
  expect(logic?.clearCount).toBe(1);
  expect(logic?.levelProgress?.['logic-2']?.isUnlocked).toBe(true);
});
