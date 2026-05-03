import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * 특정 화면이 노출됐는지 검증.
 * body[data-screen] 속성으로 현재 화면 확인.
 */
export async function expectScreen(page: Page, screenId: string): Promise<void> {
  await expect(page.locator('body')).toHaveAttribute('data-screen', screenId, { timeout: 8_000 });
}

/**
 * 결과 화면 검증.
 *
 * 두 가지 패턴 지원:
 *  1. 공통 ResultScreen — `#result-screen` (id 기반, gameBus 'level:clear' 등 이벤트 수신)
 *  2. 게임 자체 overlay — `[data-game-result="true"]` (EquationFillGame, EnglishGame 등)
 *
 * @param stars - 기대 별 수 (옵션, 공통 ResultScreen 만 검증)
 * @param cleared - cleared 상태 검증 (기본 true)
 */
const RESULT_SELECTOR = '#result-screen, [data-game-result="true"]';

export async function expectResultScreen(
  page: Page,
  { stars, cleared = true }: { stars?: number; cleared?: boolean } = {},
): Promise<void> {
  const result = page.locator(RESULT_SELECTOR).first();
  await expect(result).toBeVisible({ timeout: 15_000 });
  if (stars !== undefined) {
    await expect(result).toHaveAttribute('data-stars', String(stars), { timeout: 5_000 });
  }
  if (cleared !== undefined) {
    await expect(result).toHaveAttribute('data-cleared', cleared ? 'true' : 'false', {
      timeout: 5_000,
    });
  }
}

/**
 * HUD 요소의 값 검증.
 * partial: 제공된 항목만 검증.
 */
export async function expectHUD(
  page: Page,
  partial: { score?: number; time?: number; pairs?: number },
): Promise<void> {
  if (partial.score !== undefined) {
    await expect(page.locator('[data-hud-score]')).toHaveText(String(partial.score));
  }
  if (partial.time !== undefined) {
    await expect(page.locator('[data-hud-time]')).toHaveText(String(partial.time));
  }
  if (partial.pairs !== undefined) {
    await expect(page.locator('[data-hud-pairs]')).toHaveText(String(partial.pairs));
  }
}

/**
 * 정답 버튼 탭 헬퍼 (data-correct="true" 속성 기준).
 * 랜덤 출제 게임에서 사용.
 */
export async function tapCorrect(page: Page): Promise<void> {
  const correctBtn = page.locator('[data-correct="true"]').first();
  await expect(correctBtn).toBeVisible({ timeout: 5_000 });
  await correctBtn.tap();
}

/**
 * 정답 버튼을 n회 탭. 다음 문제 렌더링 대기 포함.
 */
export async function tapCorrectTimes(page: Page, times: number, delayMs = 900): Promise<void> {
  for (let i = 0; i < times; i++) {
    await tapCorrect(page);
    if (i < times - 1) {
      // 다음 문제 로딩 대기
      await page.waitForTimeout(delayMs);
    }
  }
}

/**
 * 결과 화면이 나타날 때까지 정답 버튼을 반복 탭.
 * 게임마다 문제 수가 다르니 (eq-fill-1: 8문, english: 10문 등) 동적으로 처리.
 *
 * - 한 회 탭 → 다음 문제 로딩 대기 → 정답 버튼 보이면 다시 탭
 * - 정답 버튼이 더 이상 안 보이는데 result-screen 도 없으면 짧게 더 기다림
 * - maxTaps 안에 result-screen 이 안 뜨면 호출자가 알아서 처리 (assertion 으로 fail)
 */
export async function playUntilResult(
  page: Page,
  { maxTaps = 20, delayMs = 700 }: { maxTaps?: number; delayMs?: number } = {},
): Promise<void> {
  for (let i = 0; i < maxTaps; i++) {
    const resultVisible = await page
      .locator(RESULT_SELECTOR)
      .first()
      .isVisible()
      .catch(() => false);
    if (resultVisible) return;

    const correctBtn = page.locator('[data-correct="true"]').first();
    const btnVisible = await correctBtn.isVisible().catch(() => false);
    if (!btnVisible) {
      // 다음 문제 전환 중이거나 result 직전 — 잠깐 기다리고 재확인
      await page.waitForTimeout(delayMs);
      continue;
    }
    await correctBtn.tap();
    await page.waitForTimeout(delayMs);
  }
}
