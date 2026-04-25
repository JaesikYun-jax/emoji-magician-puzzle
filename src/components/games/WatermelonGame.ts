import { generateBoard } from '@/systems/g1BoardGenerator';
import { judgePair } from '@/systems/g1PairJudge';
import { applyPairScore, resetCombo, calcTimeBonus, calcStars } from '@/systems/g1ScoreCalculator';
import type { ScoreState } from '@/systems/g1ScoreCalculator';
import { gameBus } from '@/game-bus';
import type { G1LevelData } from '@/game-data/g1Levels';

const ROWS = 5;
const COLS = 4;

export class WatermelonGame {
  private el: HTMLElement;
  private board: number[][] = [];
  private selectedCell: { row: number; col: number } | null = null;
  private timerInterval: number | null = null;
  private _clearTimeout: number | null = null;
  private timeRemaining: number = 0;
  private scoreState: ScoreState = { total: 0, combo: 0, pairsCompleted: 0 };
  private pairsLeft: number = 0;
  private levelData: G1LevelData | null = null;
  private gameActive: boolean = false;

  constructor(container: HTMLElement) {
    this.el = container;
  }

  show(): void {
    this.el.hidden = false;
  }

  hide(): void {
    this.el.hidden = true;
    this.stopTimer();
    if (this._clearTimeout !== null) {
      clearTimeout(this._clearTimeout);
      this._clearTimeout = null;
    }
    this.gameActive = false;
  }

  /** 게임 일시정지 (중도 종료 확인 다이얼로그용) */
  pause(): void {
    this.gameActive = false;
    this.stopTimer();
  }

  /** 게임 재개 */
  resume(): void {
    this.gameActive = true;
    this.startTimer();
  }

  startLevel(levelData: G1LevelData): void {
    this.levelData = levelData;
    this.board = generateBoard(levelData);
    this.selectedCell = null;
    this.scoreState = { total: 0, combo: 0, pairsCompleted: 0 };
    this.pairsLeft = levelData.targetPairs;
    this.timeRemaining = levelData.timeLimit;
    this.gameActive = true;
    this.render();
    this.startTimer();
  }

  private render(): void {
    this.el.innerHTML = `
      <div id="wm-board" style="
        display: grid;
        grid-template-columns: repeat(${COLS}, 1fr);
        gap: 8px;
        padding: 16px;
        flex: 1;
        align-content: center;
      "></div>
    `;

    const grid = this.el.querySelector('#wm-board') as HTMLElement;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const val = this.board[r][c];
        const btn = document.createElement('button');
        btn.className = 'tile tile--g1';
        btn.dataset['row'] = String(r);
        btn.dataset['col'] = String(c);
        btn.textContent = String(val);
        btn.style.animationDelay = `calc(${r * COLS + c} * 30ms)`;
        btn.style.animation = `fall-in 400ms ease calc(${r * COLS + c} * 30ms) both`;
        btn.style.aspectRatio = '1';
        btn.style.fontSize = '1.5rem';
        btn.addEventListener('click', () => this.handleTileTap(r, c));
        grid.appendChild(btn);
      }
    }
  }

  private handleTileTap(row: number, col: number): void {
    if (!this.gameActive) return;
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

      const a = this.board[first.row][first.col];
      const b = this.board[row][col];
      const result = judgePair(a, b);

      if (result === 'correct') {
        this.handleCorrect(first, { row, col });
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

    this.scoreState = applyPairScore(this.scoreState);
    this.pairsLeft--;

    gameBus.emit('pair:correct', {
      score: this.scoreState.total,
      combo: this.scoreState.combo,
      pairsLeft: this.pairsLeft,
    });

    setTimeout(() => {
      this.board[c1.row][c1.col] = -1;
      this.board[c2.row][c2.col] = -1;
      el1?.classList.add('tile--removed');
      el2?.classList.add('tile--removed');
    }, 500);

    this.selectedCell = null;

    if (this.pairsLeft <= 0) {
      this._clearTimeout = window.setTimeout(() => {
        this._clearTimeout = null;
        this.triggerLevelClear();
      }, 600);
    }
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

    this.scoreState = resetCombo(this.scoreState);
    this.selectedCell = null;

    setTimeout(() => {
      el1?.classList.remove('tile--wrong');
      el2?.classList.remove('tile--wrong');
    }, 350);

    gameBus.emit('pair:wrong', {});
  }

  private startTimer(): void {
    this.stopTimer();
    this.timerInterval = window.setInterval(() => {
      if (!this.gameActive) return;
      this.timeRemaining--;
      gameBus.emit('timer:tick', { remaining: this.timeRemaining });
      if (this.timeRemaining <= 0) {
        this.triggerTimeOver();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private triggerLevelClear(): void {
    this.gameActive = false;
    this.stopTimer();

    const timeLeft = this.timeRemaining;
    const timeBonus = calcTimeBonus(timeLeft);
    const stars = calcStars(this.levelData!, timeLeft, true);
    const finalScore = this.scoreState.total + timeBonus;

    gameBus.emit('level:clear', { score: finalScore, stars, timeLeft });
  }

  private triggerTimeOver(): void {
    this.gameActive = false;
    this.stopTimer();

    gameBus.emit('level:timeover', {
      score: this.scoreState.total,
      pairsCompleted: this.scoreState.pairsCompleted,
    });
  }

  private getTileEl(row: number, col: number): HTMLButtonElement | null {
    return this.el.querySelector<HTMLButtonElement>(
      `[data-row="${row}"][data-col="${col}"]`
    );
  }
}
