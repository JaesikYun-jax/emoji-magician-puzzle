/**
 * mathQuizAdapter.ts
 * MathQuizGame(무한 객관식 퀴즈) 어댑터.
 *
 * MathQuizGame은 자연적인 종료 상태가 없으므로 SESSION_QUESTION_LIMIT 문제 후 세션을 종료한다.
 *
 * gameBus 이벤트:
 *   'math:quiz:correct' — 정답 카운트 증가
 *   'math:quiz:wrong'   — 오답 카운트 증가
 *
 * 정확도 → 별점:
 *   ≥ 90%  → ★★★
 *   ≥ 70%  → ★★
 *   ≥ 50%  → ★
 *   < 50%  → ☆ (cleared: false)
 */

import { gameBus } from '../../../game-bus';
import { registerAdapter } from '../gameSelector';
import type { MathGameAdapter, LessonRunCtx, LessonRunResult, Slot } from '../gameSelector';
import type { GameEvents } from '../../../game-bus';

/** 한 세션당 최대 문제 수 */
export const SESSION_QUESTION_LIMIT = 10;

class MathQuizAdapter implements MathGameAdapter {
  readonly id = 'math-quiz';

  private correctHandler: ((d: GameEvents['math:quiz:correct']) => void) | null = null;
  private wrongHandler: ((d: GameEvents['math:quiz:wrong']) => void) | null = null;
  private gameInstance: { show(): void; hide(): void } | null = null;

  mount(host: HTMLElement, _slot: Slot, _ctx: LessonRunCtx): Promise<LessonRunResult> {
    return new Promise((resolve) => {
      let totalAnswered = 0;
      let correctCount = 0;

      import('../../../components/games/MathQuizGame').then(({ MathQuizGame }) => {
        const game = new MathQuizGame(host);
        this.gameInstance = game;
        game.show();

        const cleanup = () => {
          if (this.correctHandler) gameBus.off('math:quiz:correct', this.correctHandler);
          if (this.wrongHandler) gameBus.off('math:quiz:wrong', this.wrongHandler);
          this.correctHandler = null;
          this.wrongHandler = null;
        };

        const tryResolve = () => {
          if (totalAnswered < SESSION_QUESTION_LIMIT) return;
          cleanup();
          const accuracy = correctCount / SESSION_QUESTION_LIMIT;
          const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.7 ? 2 : accuracy >= 0.5 ? 1 : 0;
          resolve({
            cleared: stars >= 1,
            stars,
            score: correctCount * 100,
          });
        };

        this.correctHandler = () => {
          correctCount++;
          totalAnswered++;
          tryResolve();
        };

        this.wrongHandler = () => {
          totalAnswered++;
          tryResolve();
        };

        gameBus.on('math:quiz:correct', this.correctHandler);
        gameBus.on('math:quiz:wrong', this.wrongHandler);
      });
    });
  }

  unmount(): void {
    if (this.correctHandler) gameBus.off('math:quiz:correct', this.correctHandler);
    if (this.wrongHandler) gameBus.off('math:quiz:wrong', this.wrongHandler);
    this.correctHandler = null;
    this.wrongHandler = null;
    this.gameInstance?.hide();
    this.gameInstance = null;
  }
}

export const mathQuizAdapter = new MathQuizAdapter();
registerAdapter(mathQuizAdapter);
