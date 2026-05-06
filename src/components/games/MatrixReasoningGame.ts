/**
 * MatrixReasoningGame.ts
 * 행렬 추론 게임 — CSS/DOM 구현 (canvas 절대 금지)
 * 셀 종류별 렌더: emoji / number / setcard
 */

import { appRouter } from '../../router/AppRouter';
import { t } from '../../i18n';
import type {
  MatrixLevelConfig,
  MatrixProblem,
  MatrixCell,
  EmojiCell,
  NumberCell,
  SetCardCell,
  CellKind,
} from '../../systems/logic/matrixReasoningTypes';
import { generateMatrixProblem, calcMatrixStars } from '../../systems/logic/matrixReasoningGenerator';
import { saveService } from '../../services/SaveService';
import { confirmExit } from '../../utils/confirmExit';

// ── SetCard 색상 (식별성 검증된 명도 차이) ────────────────────────
const SETCARD_COLOR: Record<string, string> = {
  red:   '#DC2626',
  green: '#16A34A',
  blue:  '#2563EB',
};

// ── 셀 렌더링 — 종류별 분기 ──────────────────────────────────────

function renderEmojiCell(cell: EmojiCell, sizePx: number): string {
  const fontSize = Math.round(sizePx * 0.55);
  const count = cell.count ?? 1;
  if (count === 1) {
    return `<div class="mr-cell-emoji" style="font-size:${fontSize}px;">${cell.emoji}</div>`;
  }
  const items = Array.from({ length: count }, () => cell.emoji).join('');
  const smallFont = Math.round(sizePx * 0.32);
  return `<div class="mr-cell-emoji" style="font-size:${smallFont}px;display:flex;gap:4px;flex-wrap:wrap;justify-content:center;align-items:center;">${items}</div>`;
}

function renderNumberCell(cell: NumberCell, sizePx: number): string {
  const fontSize = Math.round(sizePx * 0.5);
  return `<div class="mr-cell-number" style="font-size:${fontSize}px;">${cell.value}</div>`;
}

function renderSetCardCell(cell: SetCardCell, sizePx: number): string {
  const color = SETCARD_COLOR[cell.color];
  const shapeSize = Math.max(14, Math.round(sizePx * 0.22));
  const shapeStyle = (() => {
    switch (cell.shape) {
      case 'circle':   return `background:${color};border-radius:50%;`;
      case 'square':   return `background:${color};border-radius:3px;`;
      case 'triangle': return `background:${color};clip-path:polygon(50% 0%, 0% 100%, 100% 100%);`;
    }
  })();
  const items = Array.from({ length: cell.count }, () =>
    `<div style="width:${shapeSize}px;height:${shapeSize}px;${shapeStyle}flex-shrink:0;"></div>`
  ).join('');
  return `<div class="mr-cell-setcard">${items}</div>`;
}

function renderCell(cell: MatrixCell, sizePx: number): string {
  switch (cell.kind) {
    case 'emoji':   return renderEmojiCell(cell, sizePx);
    case 'number':  return renderNumberCell(cell, sizePx);
    case 'setcard': return renderSetCardCell(cell, sizePx);
  }
}

function getCellSize(cellKind: CellKind, gridSize: 2 | 3): number {
  if (gridSize === 2) return 120;
  if (cellKind === 'setcard') return 96;
  if (cellKind === 'number')  return 88;
  return 80;
}

// ── 스타일 ────────────────────────────────────────────────────────
const MR_STYLES = `
#matrix-reasoning-game {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  background: linear-gradient(150deg, #2E1065 0%, #4C1D95 45%, #6D28D9 100%);
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', sans-serif;
  z-index: 20; overflow: hidden;
}
#matrix-reasoning-game .mr-header {
  display: flex; align-items: center; padding: 48px 20px 16px; gap: 12px;
}
#matrix-reasoning-game .mr-back-btn {
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  touch-action: manipulation;
}
#matrix-reasoning-game .mr-back-btn:active { transform: scale(0.92); }
#matrix-reasoning-game .mr-progress {
  flex: 1; text-align: right; color: rgba(255,255,255,0.7);
  font-size: 14px; font-weight: 600;
}
#matrix-reasoning-game .mr-timer { color: #A78BFA; font-size: 14px; font-weight: 700; }

#matrix-reasoning-game .mr-title-area {
  padding: 0 20px 12px; text-align: center;
}
#matrix-reasoning-game .mr-title { font-size: 20px; font-weight: 700; color: #fff; }
#matrix-reasoning-game .mr-subtitle {
  font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px;
}

#matrix-reasoning-game .mr-grid-wrap {
  flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 24px;
}
#matrix-reasoning-game .mr-grid-card {
  background: rgba(255,255,255,0.10); backdrop-filter: blur(16px);
  border: 1.5px solid rgba(255,255,255,0.20); border-radius: 24px;
  box-shadow: 0 8px 32px rgba(109,40,217,0.45); padding: 20px;
}
#matrix-reasoning-game .mr-grid { display: grid; gap: 10px; }
#matrix-reasoning-game .mr-cell {
  background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);
  border-radius: 14px; display: flex; align-items: center; justify-content: center;
  animation: mr-cell-in 240ms ease calc(var(--ci, 0) * 60ms) both;
  overflow: hidden;
}
#matrix-reasoning-game .mr-cell--blank {
  background: rgba(167,139,250,0.22); border: 1.5px solid rgba(167,139,250,0.60);
  animation: mr-cell-in 240ms ease calc(8 * 60ms) both,
             mr-blank-pulse 1.4s ease-in-out 600ms infinite;
}
#matrix-reasoning-game .mr-cell--complete {
  animation: mr-complete-flash 600ms ease forwards;
}

#matrix-reasoning-game .mr-cell-emoji {
  font-family: 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif;
  line-height: 1;
}
#matrix-reasoning-game .mr-cell-number {
  font-family: var(--f-display);
  font-weight: 800; color: #FFF;
  text-shadow: 0 2px 8px rgba(167,139,250,0.4);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
#matrix-reasoning-game .mr-cell-setcard {
  background: #FFF; border-radius: 10px; padding: 6px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 4px;
  width: 80%; height: 80%;
}

#matrix-reasoning-game .mr-choices {
  padding: 12px 20px 20px; display: grid;
  grid-template-columns: 1fr 1fr; gap: 10px;
}
#matrix-reasoning-game .mr-choice-btn {
  background: rgba(255,255,255,0.10); border: 1.5px solid rgba(255,255,255,0.20);
  border-radius: 18px; min-height: 88px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; cursor: pointer; transition: all 150ms; touch-action: manipulation;
  padding: 8px;
}
#matrix-reasoning-game .mr-choice-btn:active { transform: scale(0.94); }
#matrix-reasoning-game .mr-choice-btn.correct {
  background: rgba(16,185,129,0.40); border-color: #10B981;
  box-shadow: 0 0 24px rgba(16,185,129,0.55);
}
#matrix-reasoning-game .mr-choice-btn.wrong {
  background: rgba(239,68,68,0.35); border-color: #EF4444;
  animation: mr-shake 280ms ease;
}
#matrix-reasoning-game .mr-choice-label {
  font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.55);
}

#matrix-reasoning-game .mr-result-overlay {
  position: absolute; inset: 0;
  background: rgba(46,16,101,0.85); backdrop-filter: blur(8px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; z-index: 10; animation: mr-result-in 400ms ease;
}
#matrix-reasoning-game .mr-result-stars { display: flex; gap: 12px; font-size: 40px; }
#matrix-reasoning-game .mr-result-title { font-size: 22px; font-weight: 700; color: #fff; }
#matrix-reasoning-game .mr-result-score { font-size: 15px; color: rgba(255,255,255,0.75); }
#matrix-reasoning-game .mr-result-btns {
  display: flex; flex-direction: column; gap: 10px; width: 240px; margin-top: 8px;
}
#matrix-reasoning-game .mr-result-btn {
  padding: 14px 24px; border-radius: 999px; border: none;
  font-size: 15px; font-weight: 700; cursor: pointer; touch-action: manipulation;
}
#matrix-reasoning-game .mr-result-btn--retry { background: #FAF7F2; color: #2E1065; }
#matrix-reasoning-game .mr-result-btn--menu {
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: #fff;
}

@keyframes mr-cell-in {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes mr-blank-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(167,139,250,0); }
  50%       { box-shadow: 0 0 0 8px rgba(167,139,250,0.40); transform: scale(1.04); }
}
@keyframes mr-complete-flash {
  0%   { background: rgba(167,139,250,0.22); }
  40%  { background: rgba(16,185,129,0.50); border-color: #10B981; }
  100% { background: rgba(255,255,255,0.10); }
}
@keyframes mr-shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-8px); }
  75%       { transform: translateX(8px); }
}
@keyframes mr-result-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes mr-star-pop {
  0%   { transform: scale(0) rotate(-30deg); }
  70%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}
`;

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

// ── 게임 컴포넌트 ─────────────────────────────────────────────────
export class MatrixReasoningGame {
  private el: HTMLElement | null = null;
  private levelConfig: MatrixLevelConfig | null = null;
  private currentRound = 0;
  private correctCount = 0;
  private isAnswering = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining = 0;
  private currentProblem: MatrixProblem | null = null;

  constructor(private container: HTMLElement) {}

  show(cfg: MatrixLevelConfig): void {
    this.hide();
    this._injectStyles();

    this.levelConfig = cfg;
    this.currentRound = 0;
    this.correctCount = 0;
    this.isAnswering = false;
    this.timeRemaining = cfg.timeLimit;

    const el = document.createElement('div');
    el.id = 'matrix-reasoning-game';
    this.el = el;
    this.container.appendChild(el);

    this._render();
    this._startRound();
    if (cfg.timeLimit > 0) this._startTimer();
  }

  hide(): void {
    this._stopTimer();
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }

  private _injectStyles(): void {
    if (document.getElementById('mr-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'mr-game-styles';
    style.textContent = MR_STYLES;
    document.head.appendChild(style);
  }

  private _subtitleKey(): 'matrix.subtitle.emoji' | 'matrix.subtitle.number' | 'matrix.subtitle.setcard' {
    const k = this.levelConfig?.cellKind ?? 'emoji';
    if (k === 'number') return 'matrix.subtitle.number';
    if (k === 'setcard') return 'matrix.subtitle.setcard';
    return 'matrix.subtitle.emoji';
  }

  private _render(): void {
    if (!this.el || !this.levelConfig) return;
    const cfg = this.levelConfig;

    this.el.innerHTML = `
      <div class="mr-header">
        <button class="mr-back-btn game-exit-btn" aria-label="back">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10l6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="mr-progress" id="mr-progress">0 / ${cfg.totalRounds}</div>
        ${cfg.timeLimit > 0 ? `<div class="mr-timer" id="mr-timer">${this._formatTime(cfg.timeLimit)}</div>` : ''}
      </div>
      <div class="mr-title-area">
        <div class="mr-title">${t('matrix.title')}</div>
        <div class="mr-subtitle">${t(this._subtitleKey())}</div>
      </div>
      <div class="mr-grid-wrap">
        <div class="mr-grid-card">
          <div class="mr-grid" id="mr-grid"></div>
        </div>
      </div>
      <div class="mr-choices" id="mr-choices"></div>
    `;

    this.el.querySelector('.mr-back-btn')!.addEventListener('pointerdown', () => {
      this._stopTimer();
      confirmExit(
        () => {
          this.hide();
          appRouter.back();
        },
        () => {
          if (this.levelConfig && this.timeRemaining > 0) this._startTimer();
        },
      );
    });
  }

  private _startRound(): void {
    if (!this.levelConfig || !this.el) return;

    if (this.currentRound >= this.levelConfig.totalRounds) {
      this._stopTimer();
      this._showResult();
      return;
    }

    this.isAnswering = false;
    this.currentProblem = generateMatrixProblem(this.levelConfig);

    this._renderGrid(this.currentProblem);
    this._renderChoices(this.currentProblem);
    this._updateProgress();
  }

  private _renderGrid(problem: MatrixProblem): void {
    const gridEl = this.el?.querySelector('#mr-grid') as HTMLElement | null;
    if (!gridEl) return;

    const { gridSize, cells, cellKind } = problem;
    const cellSize = getCellSize(cellKind, gridSize);

    gridEl.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;

    gridEl.innerHTML = '';
    cells.forEach((cell, i) => {
      const div = document.createElement('div');
      div.style.setProperty('--ci', String(i));
      div.style.width = `${cellSize}px`;
      div.style.height = `${cellSize}px`;

      if (cell === null) {
        div.className = 'mr-cell mr-cell--blank';
        div.innerHTML = `<span style="font-size:34px;font-weight:900;color:#A78BFA;">?</span>`;
      } else {
        div.className = 'mr-cell';
        div.innerHTML = renderCell(cell, cellSize);
      }
      gridEl.appendChild(div);
    });
  }

  private _renderChoices(problem: MatrixProblem): void {
    const choicesEl = this.el?.querySelector('#mr-choices') as HTMLElement | null;
    if (!choicesEl) return;

    const count = problem.choices.length;
    choicesEl.style.gridTemplateColumns = count <= 3 ? '1fr 1fr 1fr' : '1fr 1fr';

    // 선택지 도형 크기는 셀보다 약간 작게
    const choiceSize = problem.cellKind === 'setcard' ? 80 : 64;

    choicesEl.innerHTML = '';
    problem.choices.forEach((cell, i) => {
      const btn = document.createElement('button');
      btn.className = 'mr-choice-btn';
      btn.dataset.idx = String(i);
      if (i === problem.correctIndex) btn.dataset.correct = 'true';
      btn.innerHTML = `
        ${renderCell(cell, choiceSize)}
        <span class="mr-choice-label">${CHOICE_LABELS[i]}</span>
      `;
      btn.addEventListener('pointerdown', () => this._onChoiceSelected(i, problem));
      choicesEl.appendChild(btn);
    });
  }

  private _onChoiceSelected(index: number, problem: MatrixProblem): void {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const choicesEl = this.el?.querySelector('#mr-choices') as HTMLElement | null;
    if (!choicesEl) return;

    const buttons = Array.from(choicesEl.querySelectorAll('.mr-choice-btn')) as HTMLElement[];
    const isCorrect = index === problem.correctIndex;

    buttons.forEach(btn => {
      (btn as HTMLButtonElement).disabled = true;
    });

    const blankCell = this.el?.querySelector('.mr-cell--blank') as HTMLElement | null;

    if (isCorrect) {
      buttons[index].classList.add('correct');
      if (blankCell) blankCell.classList.add('mr-cell--complete');
      this.correctCount++;
    } else {
      buttons[index].classList.add('wrong');
      buttons[problem.correctIndex].classList.add('correct');
    }

    this.currentRound++;

    setTimeout(() => {
      this._startRound();
    }, isCorrect ? 800 : 1000);
  }

  private _updateProgress(): void {
    const progEl = this.el?.querySelector('#mr-progress') as HTMLElement | null;
    if (progEl && this.levelConfig) {
      progEl.textContent = `${this.currentRound} / ${this.levelConfig.totalRounds}`;
    }
  }

  private _formatTime(secs: number): string {
    const s = Math.ceil(secs);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  }

  private _startTimer(): void {
    this._stopTimer();
    let last = Date.now();
    this.timerId = setInterval(() => {
      const now = Date.now();
      this.timeRemaining -= (now - last) / 1000;
      last = now;

      const timerEl = this.el?.querySelector('#mr-timer') as HTMLElement | null;
      if (timerEl) {
        timerEl.textContent = this._formatTime(Math.max(0, this.timeRemaining));
        timerEl.style.color = this.timeRemaining <= 10 ? '#FCA5A5' : '#A78BFA';
      }

      if (this.timeRemaining <= 0) {
        this._stopTimer();
        if (!this.isAnswering) {
          this._showResult();
        }
      }
    }, 100);
  }

  private _stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private _showResult(): void {
    if (!this.el || !this.levelConfig) return;
    const cfg = this.levelConfig;
    const correct = this.correctCount;
    const total = cfg.totalRounds;
    const stars = calcMatrixStars(correct, cfg.starThresholds);

    saveService.recordLogicClear(cfg.id, stars, correct);

    const pct = correct / total;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const titleKey: any = pct === 1
      ? 'matrix.result.perfect'
      : pct >= 0.7
      ? 'matrix.result.great'
      : pct >= 0.4
      ? 'matrix.result.good'
      : 'matrix.result.fail';

    const scoreText = t('matrix.result.score')
      .replace('{correct}', String(correct))
      .replace('{total}', String(total));

    const starsHtml = Array.from({ length: 3 }, (_, i) => {
      const filled = i < stars;
      return `<span style="
        color: ${filled ? '#FBBF24' : 'rgba(255,255,255,0.3)'};
        animation: ${filled ? `mr-star-pop 400ms ${i * 150}ms both ease` : 'none'};
        display: inline-block;
      ">${filled ? '★' : '☆'}</span>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.className = 'mr-result-overlay';
    overlay.innerHTML = `
      <div class="mr-result-stars">${starsHtml}</div>
      <div class="mr-result-title">${t(titleKey)}</div>
      <div class="mr-result-score">${scoreText}</div>
      <div class="mr-result-btns">
        <button class="result-btn result-btn--ghost mr-result-btn--retry">${t('matrix.result.retry')}</button>
        <button class="result-btn result-btn--ghost mr-result-btn--menu">${t('matrix.result.menu')}</button>
      </div>
    `;

    overlay.querySelector('.mr-result-btn--retry')!.addEventListener('pointerdown', () => {
      overlay.remove();
      this.levelConfig = cfg;
      this.currentRound = 0;
      this.correctCount = 0;
      this.isAnswering = false;
      this.timeRemaining = cfg.timeLimit;
      this._render();
      this._startRound();
      if (cfg.timeLimit > 0) this._startTimer();
    });

    overlay.querySelector('.mr-result-btn--menu')!.addEventListener('pointerdown', () => {
      this.hide();
      appRouter.navigate({ to: 'logic-menu', subject: 'logic', replace: true });
    });

    this.el.appendChild(overlay);
  }
}
