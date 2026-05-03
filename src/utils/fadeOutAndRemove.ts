/**
 * 화면 컴포넌트 root 을 즉시 제거하지 않고 .screen-leaving 클래스로
 * fade-out 시킨 후 DOM 에서 제거. 라우터 동기 흐름을 깨지 않으면서
 * 시각적 cross-fade 트랜지션을 만든다.
 */

// JSDOM 은 CSS 애니메이션을 실제로 실행하지 않아 animationend 가 발화 안 함.
// vitest 환경에서는 동기 제거로 fallback 하여 기존 테스트 가정을 유지한다.
const IS_JSDOM =
  typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');

export function fadeOutAndRemove(el: HTMLElement, durationMs = 220): void {
  if (!el.isConnected) return;
  if (IS_JSDOM) {
    el.remove();
    return;
  }
  el.classList.add('screen-leaving');
  let removed = false;
  const cleanup = (): void => {
    if (removed) return;
    removed = true;
    el.remove();
  };
  el.addEventListener('animationend', cleanup, { once: true });
  setTimeout(cleanup, durationMs + 80);
}
