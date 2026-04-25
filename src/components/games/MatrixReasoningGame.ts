/**
 * MatrixReasoningGame.ts
 * 행렬 추론 게임 — CSS/DOM 구현 (canvas 절대 금지)
 * 기술스택: 순수 TypeScript + CSS @keyframes
 */

import { appRouter } from '../../router/AppRouter';
import { t } from '../../i18n';
import type { MatrixLevelConfig, MatrixProblem, MatrixCell } from '../../systems/logic/matrixReasoningTypes';
import { generateMatrixProblem, calcMatrixStars } from '../../systems/logic/matrixReasoningGenerator';
import { saveService } from '../../services/SaveService';
import { confirmExit } from '../../utils/confirmExit';

// ── 색상/크기 맵 ──────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  violet:  '#8B5CF6',
  sky:     '#38BDF8',
  rose:    '#F43F5E',
  amber:   '#F59E0B',
  emerald: '#10B981',
};

// ── 도형 CSS clip-path / 스타일 ────────────────────────────────────
function renderShapeDiv(cell: MatrixCell, sizePx: number): string {
  const color = COLOR_MAP[cell.color] ?? '#8B5CF6';
  const sizeMap: Record<string, number> = { sm: sizePx * 0.45, md: sizePx * 0.6, lg: sizePx * 0.75 };
  const dim = sizeMap[cell.size] ?? sizePx * 0.6;
  const rotation = cell.rotation ?? 0;
  const transform = `transform: rotate(${rotation}deg)`;

  let shapeStyle = '';
  switch (cell.shape) {
    case 'circle':
      shapeStyle = 'border-radius: 50%;';
      break;
    case 'triangle':
      shapeStyle = 'clip-path: polygon(50% 0%, 0% 100%, 100% 100%);';
      break;
    case 'square':
      shapeStyle = 'border-radius: 4px;';
      break;
    case 'diamond':
      shapeStyle = 'clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);';
      break;
    case 'pentagon':
      shapeStyle = 'clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);';
      break;
    case 'star':
      shapeStyle = 'clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);';
      break;
    default:
      shapeStyle = 'border-radius: 4px;';
  }

  const fillStyle = cell.fill === 'filled'
    ? `background: ${color};`
    : `background: transparent; box-shadow: inset 0 0 0 3px ${color};`;

  return `<div style="
    width: ${dim}px; height: ${dim}px;
    ${shapeStyle}
    ${fillStyle}
    ${transform};
    flex-shrink: 0;
  "></div>`;
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
}
#matrix-reasoning-game .mr-cell--blank {
  background: rgba(167,139,250,0.22); border: 1.5px solid rgba(167,139,250,0.60);
  animation: mr-cell-in 240ms ease calc(8 * 60ms) both,
             mr-blank-pulse 1.4s ease-in-out 600ms infinite;
}
#matrix-reasoning-game .mr-cell--complete {
  animation: mr-complete-flash 600ms ease forwards;
}

#matrix-reasoning-game .mr-choices {
  padding: 12px 20px 20px; display: grid;
  grid-template-columns: 1fr 1fr; gap: 10px;
}
#matrix-reasoning-game .mr-choice-btn {
  background: rgba(255,255,255,0.10); border: 1.5px solid rgba(255,255,255,0.20);
  border-radius: 18px; height: 80px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; cursor: pointer; transition: all 150ms; touch-action: manipulation;
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

  private _render(): void {
    if (!this.el || !this.levelConfig) return;
    const cfg = this.levelConfig;

    this.el.innerHTML = `
      <div class="mr-header">
        <button class="mr-back-btn" aria-label="back">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="mr-progress" id="mr-progress">0 / ${cfg.totalRounds}</div>
        ${cfg.timeLimit > 0 ? `<div class="mr-timer" id="mr-timer">${this._formatTime(cfg.timeLimit)}</div>` : ''}
      </div>
      <div class="mr-title-area">
        <div class="mr-title">${t('matrix.title')}</div>
        <div class="mr-subtitle">${t('matrix.subtitle')}</div>
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

    const { gridSize, cells } = problem;
    const cellSize = gridSize === 2 ? 120 : 80;

    gridEl.style.gridTemplateColumns = `repeat(${gridSize}, ${cellSize}px)`;

    gridEl.innerHTML = '';
    cells.forEach((cell, i) => {
      const div = document.createElement('div');
      div.style.setProperty('--ci', String(i));
      div.style.width = `${cellSize}px`;
      div.style.height = `${cellSize}px`;

      if (cell === null) {
        div.className = 'mr-cell mr-cell--blank';
        div.innerHTML = `<span style="font-size:22px;font-weight:900;color:#A78BFA;">?</span>`;
      } else {
        div.className = 'mr-cell';
        div.innerHTML = renderShapeDiv(cell, cellSize);
      }
      gridEl.appendChild(div);
    });
  }

  private _renderChoices(problem: MatrixProblem): void {
    const choicesEl = this.el?.querySelector('#mr-choices') as HTMLElement | null;
    if (!choicesEl) return;

    const count = problem.choices.length;
    choicesEl.style.gridTemplateColumns = count <= 3 ? '1fr 1fr 1fr' : '1fr 1fr';

    choicesEl.innerHTML = '';
    problem.choices.forEach((cell, i) => {
      const btn = document.createElement('button');
      btn.className = 'mr-choice-btn';
      btn.dataset.idx = String(i);
      btn.innerHTML = `
        ${renderShapeDiv(cell, 60)}
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

    // 정답 셀 flash
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
        <button class="mr-result-btn mr-result-btn--retry">${t('matrix.result.retry')}</button>
        <button class="mr-result-btn mr-result-btn--menu">${t('matrix.result.menu')}</button>
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
