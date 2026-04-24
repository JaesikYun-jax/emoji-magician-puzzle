/**
 * @deprecated 타일 매칭 방식 수학 게임은 deprecated되었습니다.
 * 새로운 객관식 퀴즈 시스템은 src/systems/math/ 및 src/components/games/MathQuizGame.ts를 사용하세요.
 * 이 파일은 기존 G1(수박) 게임 호환성을 위해 유지됩니다.
 */
import { generateMathBoard } from '@/systems/math/mathBoardGenerator';
import { judgeOperation } from '@/systems/math/operationJudge';
import { getMathLevelById } from '@/game-data/mathLevels';
import { gameBus } from '@/game-bus';
import { appRouter } from '@/router/AppRouter';
import type { MathLevelConfig } from '@/game-data/subjectConfig';
import { t } from '@/i18n';

export class MathGame {
  private el: HTMLElement;
  private board: number[][] = [];
  private selectedCell: { row: number; col: number } | null = null;
  private timerInterval: number | null = null;
  private config: MathLevelConfig | null = null;

  private score = 0;
  private combo = 0;
  private pairsCompleted = 0;
  private movesUsed = 0;
  private timeRemaining = 0;
  private gameActive = false;
  private judging = false;

  constructor(container: HTMLElement) {
    this.el = container;
  }

  show(): void {
    this.el.hidden = false;
  }

  hide(): void {
    this.el.hidden = true;
    this.stopTimer();
    this.gameActive = false;
  }

  startLevel(levelId: string): void {
    const cfg = getMathLevelById(levelId);
    if (!cfg) return;
    this.config = cfg;
    this.board = generateMathBoard(cfg);
    this.selectedCell = null;
    this.score = 0;
    this.combo = 0;
    this.pairsCompleted = 0;
    this.movesUsed = 0;
    this.gameActive = true;
    this.judging = false;

    if (cfg.constraint === 'time') {
      this.timeRemaining = cfg.constraintValue;
    } else {
      this.timeRemaining = 0;
    }

    this.render();

    if (cfg.constraint === 'time') {
      this.startTimer();
    }

    gameBus.emit('math:pairCorrect', {
      score: 0,
      combo: 0,
      pairsLeft: this.totalPairs(),
    });
  }

  private totalPairs(): number {
    if (!this.config) return 0;
    const tp = this.config.targetPairs;
    if (typeof tp === 'number') return tp;
    return Object.values(tp).reduce((s, v) => s + v, 0);
  }

  private render(): void {
    if (!this.config) return;
    const { boardRows, boardCols } = this.config;

    this.el.innerHTML = `
      <div id="math-hud" style="
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 56px;
        padding: 0 16px;
        background: rgba(0,0,0,0.25);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        z-index: 100;
      ">
        <button id="math-home-btn" style="
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          width: 40px; height: 40px;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        ">🏠</button>
      </div>
      <div id="math-board" style="
        display: grid;
        grid-template-columns: repeat(${boardCols}, 1fr);
        gap: 6px;
        padding: 16px;
        padding-top: 72px;
        flex: 1;
        align-content: center;
      "></div>
    `;

    const homeBtn = this.el.querySelector('#math-home-btn') as HTMLButtonElement;
    homeBtn.addEventListener('click', () => {
      this.hide();
      appRouter.navigate({ to: 'math-menu', subject: 'math', skipHistory: true });
    });

    const grid = this.el.querySelector('#math-board') as HTMLElement;

    for (let r = 0; r < boardRows; r++) {
      for (let c = 0; c < boardCols; c++) {
        const val = this.board[r][c];
        const btn = document.createElement('button');
        btn.className = 'tile tile--math';
        btn.dataset['row'] = String(r);
        btn.dataset['col'] = String(c);
        btn.textContent = String(val);
        btn.style.animation = `fall-in 400ms ease calc(${r * boardCols + c} * 25ms) both`;
        btn.style.aspectRatio = '1';
        btn.style.fontSize = val > 99 ? '1rem' : '1.3rem';
        btn.addEventListener('click', () => this.handleTileTap(r, c));
        grid.appendChild(btn);
      }
    }
  }

  private handleTileTap(row: number, col: number): void {
    if (!this.gameActive || this.judging) return;
    if (this.board[row][col] === -1) return;

    if (!this.selectedCell) {
      this.selectedCell = { row, col };
      this.getTileEl(row, col)?.classList.add('tile--selected');
    } else {
      const first = this.selectedCell;
      if (first.row === row && first.col === col) {
        this.getTileEl(row, col)?.classList.remove('tile--selected');
        this.selectedCell = null;
        return;
      }

      this.judging = true;
      const a = this.board[first.row][first.col];
      const b = this.board[row][col];
      const result = judgeOperation(a, b, this.config!.operation, this.config!.targetValue);

      if (result === 'correct') {
        this.handleCorrect(first, { row, col });
      } else if (result === 'order-error') {
        this.showOrderError(first, { row, col });
        this.handleWrong(first, { row, col });
      } else {
        this.handleWrong(first, { row, col });
      }
    }
  }

  private handleCorrect(
    c1: { row: number; col: number },
    c2: { row: number; col: number }
  ): void {
    const el1 = this.getTileEl(c1.row, c1.col);
    const el2 = this.getTileEl(c2.row, c2.col);

    el1?.classList.remove('tile--selected');
    el1?.classList.add('tile--correct');
    el2?.classList.add('tile--correct');

    this.combo++;
    const bonus = this.combo >= 4 ? 150 : this.combo === 3 ? 100 : this.combo === 2 ? 50 : 0;
    const gained = this.config!.baseScore + bonus;
    this.score += gained;
    this.pairsCompleted++;

    if (this.config!.constraint === 'moves') this.movesUsed++;

    const pairsLeft = this.totalPairs() - this.pairsCompleted;

    gameBus.emit('math:pairCorrect', {
      score: this.score,
      combo: this.combo,
      pairsLeft,
    });

    setTimeout(() => {
      this.board[c1.row][c1.col] = -1;
      this.board[c2.row][c2.col] = -1;
      el1?.classList.add('tile--removed');
      el2?.classList.add('tile--removed');

      if (pairsLeft <= 0) {
        this.triggerClear();
      } else {
        this.checkMovesLimit();
      }
    }, 500);

    this.selectedCell = null;
  }

  private handleWrong(
    c1: { row: number; col: number },
    c2: { row: number; col: number }
  ): void {
    const el1 = this.getTileEl(c1.row, c1.col);
    const el2 = this.getTileEl(c2.row, c2.col);

    el1?.classList.remove('tile--selected');
    el1?.classList.add('tile--wrong');
    el2?.classList.add('tile--wrong');

    this.combo = 0;

    if (this.config!.constraint === 'moves') this.movesUsed++;

    gameBus.emit('math:pairWrong', {});

    setTimeout(() => {
      el1?.classList.remove('tile--wrong');
      el2?.classList.remove('tile--wrong');
      this.selectedCell = null;
      this.judging = false;
      this.checkMovesLimit();
    }, 350);
  }

  private showOrderError(
    c1: { row: number; col: number },
    c2: { row: number; col: number }
  ): void {
    const el1 = this.getTileEl(c1.row, c1.col);
    const popup = document.createElement('div');
    popup.textContent = t('math.orderError');
    popup.style.cssText = `
      position: absolute;
      background: #EF4444;
      color: #fff;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: bold;
      pointer-events: none;
      z-index: 200;
      white-space: nowrap;
    `;

    if (el1) {
      const rect = el1.getBoundingClientRect();
      const containerRect = this.el.getBoundingClientRect();
      popup.style.left = `${rect.left - containerRect.left}px`;
      popup.style.top = `${rect.top - containerRect.top - 32}px`;
      this.el.style.position = 'relative';
      this.el.appendChild(popup);
      setTimeout(() => popup.remove(), 800);
    }

    gameBus.emit('math:orderError', {});
  }

  private checkMovesLimit(): void {
    if (!this.config) return;
    if (this.config.constraint === 'moves' && this.movesUsed >= this.config.constraintValue) {
      setTimeout(() => this.triggerFail(), 200);
    } else {
      this.judging = false;
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = window.setInterval(() => {
      if (!this.gameActive) return;
      this.timeRemaining--;
      gameBus.emit('timer:tick', { remaining: this.timeRemaining });
      if (this.timeRemaining <= 0) {
        this.triggerFail();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private triggerClear(): void {
    this.gameActive = false;
    this.stopTimer();
    this.judging = false;

    const remaining = this.config!.constraint === 'moves'
      ? this.config!.constraintValue - this.movesUsed
      : this.timeRemaining;
    const bonus = Math.max(0, remaining) * 10;
    const finalScore = this.score + bonus;

    const thresholds = this.config!.starThresholds;
    let stars = 1;
    if (remaining >= thresholds[2]) stars = 3;
    else if (remaining >= thresholds[1]) stars = 2;

    setTimeout(() => {
      gameBus.emit('math:levelClear', {
        levelId: this.config!.id,
        score: finalScore,
        stars,
      });
    }, 600);
  }

  private triggerFail(): void {
    this.gameActive = false;
    this.stopTimer();
    this.judging = false;

    setTimeout(() => {
      gameBus.emit('math:levelFail', {
        levelId: this.config!.id,
        score: this.score,
        pairsCompleted: this.pairsCompleted,
      });
    }, 400);
  }

  private getTileEl(row: number, col: number): HTMLButtonElement | null {
    return this.el.querySelector<HTMLButtonElement>(
      `[data-row="${row}"][data-col="${col}"]`
    );
  }
}
