/**
 * patternFinderAdapter.ts
 * PatternFinderGame(수 패턴 찾기) 어댑터.
 *
 * PatternFinderGame도 gameBus 이벤트를 발생시키지 않는다.
 * eqFillAdapter와 동일한 MutationObserver 전략을 사용한다.
 *
 * 결과 오버레이 특징 (PatternFinderGame):
 *   - position: fixed; inset: 0
 *   - ★/☆ span 3개
 *
 * 게임 컴포넌트를 절대 수정하지 않는다.
 */

import { registerAdapter } from '../gameSelector';
import type { MathGameAdapter, LessonRunCtx, LessonRunResult, Slot } from '../gameSelector';

/** PatternFinderGame 결과 오버레이 식별 */
function isResultOverlay(el: Element): boolean {
  const style = (el as HTMLElement).style;
  return (
    style.position === 'fixed' &&
    style.inset === '0px'
  );
}

/** 오버레이 div에서 ★ 개수 추출 */
function countFilledStars(overlay: Element): number {
  let count = 0;
  overlay.querySelectorAll('span').forEach((span) => {
    if (span.textContent === '★') count++;
  });
  return count;
}

class PatternFinderAdapter implements MathGameAdapter {
  readonly id = 'pattern-finder';

  private gameInstance: { show(cfg: unknown): void; hide(): void } | null = null;
  private observer: MutationObserver | null = null;

  mount(host: HTMLElement, _slot: Slot, ctx: LessonRunCtx): Promise<LessonRunResult> {
    return new Promise((resolve) => {
      Promise.all([
        import('../../../components/games/PatternFinderGame'),
        import('../../../game-data/patternFinderLevels'),
      ]).then(([{ PatternFinderGame }, { PATTERN_FINDER_LEVELS }]) => {
        const levelConfig =
          PATTERN_FINDER_LEVELS.find((l) => l.id === ctx.levelId) ?? PATTERN_FINDER_LEVELS[0];

        const game = new PatternFinderGame(host);
        this.gameInstance = game;
        game.show(levelConfig);

        this.observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType !== Node.ELEMENT_NODE) return;
              const el = node as Element;

              if (isResultOverlay(el)) {
                const stars = countFilledStars(el);
                this.observer?.disconnect();
                this.observer = null;
                resolve({ cleared: stars >= 1, stars, score: stars * 100 });
                return;
              }

              el.querySelectorAll('div').forEach((child) => {
                if (isResultOverlay(child)) {
                  const stars = countFilledStars(child);
                  this.observer?.disconnect();
                  this.observer = null;
                  resolve({ cleared: stars >= 1, stars, score: stars * 100 });
                }
              });
            });
          }
        });

        this.observer.observe(host, { childList: true, subtree: true });
      });
    });
  }

  unmount(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.gameInstance?.hide();
    this.gameInstance = null;
  }
}

export const patternFinderAdapter = new PatternFinderAdapter();
registerAdapter(patternFinderAdapter);
