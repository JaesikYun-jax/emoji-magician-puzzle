/**
 * C4 — KoreanGame 한글 텍스트 렌더링 검증
 * Pretendard 로드 완료 후 한글 텍스트의 box width가 0이 아닌지 확인
 * (Canvas 기반 렌더링 없음 — CSS/DOM 방식이므로 width > 0 = 정상 렌더링)
 */
import { test, expect } from '@playwright/test';
import { seedSave } from '../fixtures/saveSeed';
import { gotoApp, navigateTo } from '../fixtures/navigation';

test('C4: KoreanGame 한글 텍스트 깨짐 없음', async ({ page }) => {
  await seedSave(page);
  await gotoApp(page);

  // game-korean 직접 이동
  await navigateTo(page, 'game-korean', { subject: 'korean' });

  // 폰트 완전 로드 대기
  await page.waitForFunction(() => document.fonts.ready, undefined, { timeout: 10_000 });

  // 한글 텍스트 요소들이 렌더링됐는지 확인 (width > 0)
  const koreanTextWidth = await page.evaluate(() => {
    // 페이지 전체에서 한글 텍스트를 포함한 요소 찾기
    const allElements = Array.from(document.querySelectorAll('*'));
    const koreanElements = allElements.filter(el => {
      const text = (el as HTMLElement).innerText ?? '';
      return /[\uAC00-\uD7A3]/.test(text) && (el as HTMLElement).offsetWidth > 0;
    });
    return koreanElements.length;
  });

  // 한글 텍스트를 가진 요소가 1개 이상 존재해야 함
  expect(koreanTextWidth).toBeGreaterThan(0);

  // 한글 텍스트의 실제 너비가 0이 아닌지 확인
  const hasProperWidth = await page.evaluate(() => {
    const allElements = Array.from(document.querySelectorAll('div, span, p, h1, h2, h3, button'));
    for (const el of allElements) {
      const text = (el as HTMLElement).innerText?.trim() ?? '';
      if (/[\uAC00-\uD7A3]/.test(text) && text.length > 0) {
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return true;
        }
      }
    }
    return false;
  });

  expect(hasProperWidth).toBe(true);
});
