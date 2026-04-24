/**
 * eqFillAdapter.ts
 * EquationFillGame(등식 완성) 어댑터.
 *
 * EquationFillGame은 gameBus 이벤트를 발생시키지 않는다.
 * 결과 감지 전략: 게임이 결과 오버레이를 this.el(container의 자식)에 append할 때
 * MutationObserver로 감지하여 ★ 개수를 DOM에서 직접 읽는다.
 *
 * 결과 오버레이 특징:
 *   - position: fixed; inset: 0 (전체 화면 덮개)
 *   - 내부에 ★/☆ span 3개
 *   - ★ 개수 = 별점
 *
 * 게임 컴포넌트를 절대 수정하지 않는다.
 */

import { registerAdapter } from '../gameSelector';
import type { MathGameAdapter, LessonRunCtx, LessonRunResult, Slot } from '../gameSelector';

/** EquationFillGame 결과 오버레이를 식별하는 휴리스틱 */
function isResultOverlay(el: Element): boolean {
  const style = (el as HTMLElement).style;
  return (
    style.position === 'fixed' &&
    style.inset === '0px'
  );
}

/** 오버레이 div에서 ★ 개수를 추출한다 */
function countFilledStars(overlay: Element): number {
  let count = 0;
  overlay.querySelectorAll('span').forEach((span) => {
    if (span.textContent === '★') count++;
  });
  return count;
}

class EqFillAdapter implements MathGameAdapter {
  readonly id = 'eq-fill';

  private gameInstance: { show(cfg: unknown): void; hide(): void } | null = null;
  private observer: MutationObserver | null = null;

  mount(host: HTMLElement, _slot: Slot, ctx: LessonRunCtx): Promise<LessonRunResult> {
    return new Promise((resolve) => {
      Promise.all([
        import('../../../components/games/EquationFillGame'),
        import('../../../game-data/equationFillLevels'),
      ]).then(([{ EquationFillGame }, { EQ_FILL_LEVELS }]) => {
        const levelConfig =
          EQ_FILL_LEVELS.find((l) => l.id === ctx.levelId) ?? EQ_FILL_LEVELS[0];

        const game = new EquationFillGame(host);
        this.gameInstance = game;
        game.show(levelConfig);

        // 결과 오버레이 감지: host의 서브트리에서 새 자식이 추가될 때 검사
        this.observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType !== Node.ELEMENT_NODE) return;
              const el = node as Element;

              // 직접 추가된 노드가 오버레이인지 확인
              if (isResultOverlay(el)) {
                const stars = countFilledStars(el);
                this.observer?.disconnect();
                this.observer = null;
                resolve({ cleared: stars >= 1, stars, score: stars * 100 });
                return;
              }

              // 한 단계 아래 자식도 확인 (게임 el → overlay 구조)
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

export const eqFillAdapter = new EqFillAdapter();
registerAdapter(eqFillAdapter);
