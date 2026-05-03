import type { Page } from '@playwright/test';
import { seedSave } from './saveSeed';

/**
 * 앱 진입 헬퍼.
 * - baseURL 로 이동
 * - 폰트 로드 대기 (Pretendard CDN flaky 방지)
 * - brand-home 화면 가시화 대기
 */
export async function gotoApp(page: Page): Promise<void> {
  await page.goto('/');
  // Pretendard CDN 지연 방지
  await page.waitForFunction(() => document.fonts.ready, undefined, { timeout: 10_000 });
  await page.waitForSelector('body[data-screen="brand-home"]', { timeout: 10_000 });
}

/**
 * 프로필이 있는 상태로 앱에 진입해 home-b 화면까지 이동.
 * brand-home CTA 클릭 → home-b 또는 subject-select 도달.
 */
export async function gotoHomeB(page: Page): Promise<void> {
  await seedSave(page);
  await gotoApp(page);
  // brand-home 의 메인 CTA 클릭
  await page.locator('#brand-home').getByRole('button').first().tap();
  await page.waitForSelector('body[data-screen="home-b"], body[data-screen="subject-select"]', {
    timeout: 8_000,
  });
}

/**
 * 특정 화면으로 직접 이동 (DEV 전용 __appRouter 활용).
 * 앱이 이미 로드된 상태에서만 호출 가능.
 */
export async function navigateTo(
  page: Page,
  screenId: string,
  opts?: Record<string, string | undefined>,
): Promise<void> {
  await page.evaluate(
    ({ id, extra }: { id: string; extra?: Record<string, string | undefined> }) => {
      const router = (window as any).__appRouter;
      if (!router) throw new Error('__appRouter not exposed');
      router.navigate({ to: id, ...extra });
    },
    { id: screenId, extra: opts },
  );
  await page.waitForSelector(`body[data-screen="${screenId}"]`, { timeout: 8_000 });
}

/**
 * 종목 메뉴 화면까지 이동.
 * seed → 앱 진입 → __appRouter 직접 네비게이션
 */
export async function gotoSubjectMenu(
  page: Page,
  subject: 'math' | 'english' | 'logic' | 'creativity' | 'reasoning' | 'korean',
): Promise<void> {
  await seedSave(page);
  await page.goto('/');
  await page.waitForFunction(() => document.fonts.ready, undefined, { timeout: 10_000 });
  await page.waitForSelector('body[data-screen="brand-home"]', { timeout: 10_000 });
  await navigateTo(page, `${subject}-menu`, { subject });
}

/**
 * 수학 등식완성 게임 시작.
 * 카운트다운 스킵 훅 활성화 후 level-intro → game-eq-fill 즉시 전환.
 */
export async function startEqFillGame(page: Page, levelId = 'eq-fill-1'): Promise<void> {
  // E2E 카운트다운 스킵 훅 활성화 (level-intro 는 수박게임 전용이라 eq-fill 에선 직접 이동)
  await navigateTo(page, 'game-eq-fill', { subject: 'math', levelId });
}

/**
 * 카운트다운 스킵 훅 활성화.
 * window.__E2E_SKIP_COUNTDOWN__ = 1 세팅.
 */
export async function enableSkipCountdown(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).__E2E_SKIP_COUNTDOWN__ = 1;
  });
}

/**
 * __gameBus 를 통해 이벤트 직접 emit.
 */
export async function emitBus(
  page: Page,
  event: string,
  payload: Record<string, unknown> = {},
): Promise<void> {
  await page.evaluate(
    ({ ev, data }: { ev: string; data: Record<string, unknown> }) => {
      const bus = (window as any).__gameBus;
      if (!bus) throw new Error('__gameBus not exposed');
      bus.emit(ev, data);
    },
    { ev: event, data: payload },
  );
}
