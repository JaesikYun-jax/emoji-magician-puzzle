/**
 * mathTilesAdapter.ts
 * MathGame(타일 매칭 deprecated) 어댑터.
 *
 * gameBus 이벤트:
 *   'math:levelClear' → LessonRunResult{ cleared: true,  stars, score }
 *   'math:levelFail'  → LessonRunResult{ cleared: false, stars: 0, score }
 *
 * 게임 컴포넌트를 절대 수정하지 않고 slot.ref / gameBus만 사용한다.
 */

import { gameBus } from '../../../game-bus';
import { registerAdapter } from '../gameSelector';
import type { MathGameAdapter, LessonRunCtx, LessonRunResult, Slot } from '../gameSelector';
import type { GameEvents } from '../../../game-bus';

class MathTilesAdapter implements MathGameAdapter {
  readonly id = 'math-tiles';

  // 마운트 중에만 살아있는 핸들러 참조 (unmount 시 정리)
  private clearHandler: ((d: GameEvents['math:levelClear']) => void) | null = null;
  private failHandler: ((d: GameEvents['math:levelFail']) => void) | null = null;
  private gameInstance: { show(): void; startLevel(id: string): void; hide(): void } | null = null;

  mount(host: HTMLElement, _slot: Slot, ctx: LessonRunCtx): Promise<LessonRunResult> {
    return new Promise((resolve) => {
      // 게임 컴포넌트를 동적으로 import해 DOM 코드가 레지스트리 로드 시 실행되지 않도록 한다.
      import('../../../components/games/MathGame').then(({ MathGame }) => {
        const game = new MathGame(host);
        this.gameInstance = game;
        game.show();
        game.startLevel(ctx.levelId);

        const cleanup = () => {
          if (this.clearHandler) gameBus.off('math:levelClear', this.clearHandler);
          if (this.failHandler) gameBus.off('math:levelFail', this.failHandler);
          this.clearHandler = null;
          this.failHandler = null;
        };

        this.clearHandler = (data) => {
          cleanup();
          resolve({ cleared: true, stars: data.stars, score: data.score });
        };

        this.failHandler = (data) => {
          cleanup();
          resolve({ cleared: false, stars: 0, score: data.score });
        };

        gameBus.on('math:levelClear', this.clearHandler);
        gameBus.on('math:levelFail', this.failHandler);
      });
    });
  }

  unmount(): void {
    if (this.clearHandler) gameBus.off('math:levelClear', this.clearHandler);
    if (this.failHandler) gameBus.off('math:levelFail', this.failHandler);
    this.clearHandler = null;
    this.failHandler = null;
    this.gameInstance?.hide();
    this.gameInstance = null;
  }
}

export const mathTilesAdapter = new MathTilesAdapter();
registerAdapter(mathTilesAdapter);
