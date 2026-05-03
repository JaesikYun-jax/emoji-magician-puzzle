/**
 * OddOneOutGame.ts
 * 다른 하나 찾기 게임 — CSS/DOM 구현 (canvas 절대 금지)
 */

import { appRouter } from '../../router/AppRouter';
import type { OddOneOutLevelConfig, OddOneOutProblem, OddShape, OddReason } from '../../systems/logic/oddOneOutTypes';
import { generateOddOneOutProblem, calcOddOneOutStars } from '../../systems/logic/oddOneOutGenerator';
import { saveService } from '../../services/SaveService';
import { confirmExit } from '../../utils/confirmExit';
import { t } from '../../i18n';

// ── 색상 맵 ──────────────────────────────────────────────────────
const COLOR_MAP: Record<string, string> = {
  violet:  '#8B5CF6',
  sky:     '#38BDF8',
  rose:    '#F43F5E',
  amber:   '#F59E0B',
  emerald: '#10B981',
};

// ── 도형 렌더링 (MatrixReasoningGame과 동일 로직, chirality 지원) ──
function renderOddShapeDiv(shape: OddShape, sizePx: number): string {
  const color = COLOR_MAP[shape.color] ?? '#8B5CF6';
  const sizeMap: Record<string, number> = { sm: sizePx * 0.45, md: sizePx * 0.6, lg: sizePx * 0.75 };
  const dim = sizeMap[shape.size] ?? sizePx * 0.6;

  const rotation = shape.rotation ?? 0;
  const scaleX = shape.chirality === 'mirrored' ? -1 : 1;
  const transform = `transform: scaleX(${scaleX}) rotate(${rotation}deg)`;

  let shapeStyle = '';
  switch (shape.shape) {
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

  const fillStyle = shape.fill === 'filled'
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
const OOO_STYLES = `
#odd-one-out-game {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  background: linear-gradient(150deg, #042F2E 0%, #065F46 45%, #059669 100%);
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', sans-serif;
  z-index: 20; overflow: hidden;
}
#odd-one-out-game .ooo-header {
  display: flex; align-items: center; padding: 48px 20px 16px; gap: 12px;
}
#odd-one-out-game .ooo-back-btn {
  width: 40px; height: 40px;
  background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  touch-action: manipulation;
}
#odd-one-out-game .ooo-back-btn:active { transform: scale(0.92); }
#odd-one-out-game .ooo-progress {
  flex: 1; text-align: right; color: rgba(255,255,255,0.7);
  font-size: 14px; font-weight: 600;
}
#odd-one-out-game .ooo-timer { color: #6EE7B7; font-size: 14px; font-weight: 700; }

#odd-one-out-game .ooo-title-area {
  padding: 0 20px 12px; text-align: center;
}
#odd-one-out-game .ooo-title { font-size: 20px; font-weight: 700; color: #fff; }
#odd-one-out-game .ooo-subtitle {
  font-size: 13px; color: rgba(255,255,255,0.65); margin-top: 4px;
}

#odd-one-out-game .ooo-content {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center; padding: 0 20px 20px;
}
#odd-one-out-game .ooo-shape-card {
  background: rgba(255,255,255,0.10); backdrop-filter: blur(16px);
  border: 1.5px solid rgba(255,255,255,0.18); border-radius: 24px;
  box-shadow: 0 8px 32px rgba(5,150,105,0.40); padding: 32px 20px;
  width: 100%; max-width: 400px; box-sizing: border-box;
}
#odd-one-out-game .ooo-shape-row {
  display: flex; flex-direction: row;
  align-items: center; justify-content: center;
  gap: 10px; flex-wrap: wrap;
}
#odd-one-out-game .ooo-shape-item {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  cursor: pointer;
  animation: ooo-shape-in 280ms ease calc(var(--si, 0) * 100ms) both;
  touch-action: manipulation;
}
#odd-one-out-game .ooo-shape-item:active { transform: scale(0.92); }
#odd-one-out-game .ooo-shape-cell {
  background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.20);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  transition: all 150ms;
}
#odd-one-out-game .ooo-shape-cell.correct {
  background: rgba(16,185,129,0.45); border-color: #10B981;
  box-shadow: 0 0 20px rgba(16,185,129,0.55);
  animation: ooo-correct-pop 350ms ease;
}
#odd-one-out-game .ooo-shape-cell.wrong {
  background: rgba(239,68,68,0.40); border-color: #EF4444;
  animation: ooo-shake 280ms ease;
}
#odd-one-out-game .ooo-shape-cell.dimmed {
  opacity: 0.35; transform: scale(0.92);
  transition: opacity 400ms, transform 400ms;
}
#odd-one-out-game .ooo-shape-badge {
  font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.55);
}

#odd-one-out-game .ooo-dots {
  display: flex; gap: 8px; justify-content: center; margin-top: 16px;
}
#odd-one-out-game .ooo-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: rgba(255,255,255,0.25); transition: background 300ms;
}
#odd-one-out-game .ooo-dot.done { background: #6EE7B7; }
#odd-one-out-game .ooo-dot.current { background: #fff; transform: scale(1.2); }

#odd-one-out-game .ooo-hint {
  text-align: center; font-size: 13px; color: rgba(255,255,255,0.65);
  padding: 12px 20px 0;
}

#odd-one-out-game .ooo-result-overlay {
  position: absolute; inset: 0;
  background: rgba(4,47,46,0.85); backdrop-filter: blur(8px);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; z-index: 10; animation: ooo-result-in 400ms ease;
}
#odd-one-out-game .ooo-result-stars { display: flex; gap: 12px; font-size: 40px; }
#odd-one-out-game .ooo-result-title { font-size: 22px; font-weight: 700; color: #fff; }
#odd-one-out-game .ooo-result-score { font-size: 15px; color: rgba(255,255,255,0.75); }
#odd-one-out-game .ooo-result-btns {
  display: flex; flex-direction: column; gap: 10px; width: 240px; margin-top: 8px;
}
#odd-one-out-game .ooo-result-btn--retry {
  background: #FAF7F2; color: #042F2E; border: none;
  padding: 14px 24px; border-radius: 999px;
  font-size: 15px; font-weight: 700; cursor: pointer; touch-action: manipulation;
}
#odd-one-out-game .ooo-result-btn--menu {
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); color: #fff;
  padding: 14px 24px; border-radius: 999px;
  font-size: 15px; font-weight: 700; cursor: pointer; touch-action: manipulation;
}

@keyframes ooo-shape-in {
  from { opacity: 0; transform: translateY(-40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ooo-correct-pop {
  0%   { transform: scale(1); }
  45%  { transform: scale(1.12); }
  100% { transform: scale(1); }
}
@keyframes ooo-shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-8px); }
  75%       { transform: translateX(8px); }
}
@keyframes ooo-result-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes ooo-star-pop {
  0%   { transform: scale(0) rotate(-30deg); }
  70%  { transform: scale(1.2); }
  100% { transform: scale(1); }
}
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HINT_KEY_MAP: Record<OddReason, any> = {
  color:     'oddone.hint.color',
  shape:     'oddone.hint.shape',
  size:      'oddone.hint.size',
  fill:      'oddone.hint.fill',
  rotation:  'oddone.hint.rotation',
  chirality: 'oddone.hint.chirality',
  compound:  'oddone.hint.compound',
};

// ── 게임 컴포넌트 ─────────────────────────────────────────────────
export class OddOneOutGame {
  private el: HTMLElement | null = null;
  private levelConfig: OddOneOutLevelConfig | null = null;
  private currentRound = 0;
  private correctCount = 0;
  private isAnswering = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining: number | null = null;
  private currentProblem: OddOneOutProblem | null = null;

  constructor(private container: HTMLElement) {}

  show(cfg: OddOneOutLevelConfig): void {
    this.hide();
    this._injectStyles();

    this.levelConfig = cfg;
    this.currentRound = 0;
    this.correctCount = 0;
    this.isAnswering = false;
    this.timeRemaining = cfg.timeLimit;

    const el = document.createElement('div');
    el.id = 'odd-one-out-game';
    this.el = el;
    this.container.appendChild(el);

    this._render();
    this._startRound();
    if (cfg.timeLimit !== null) this._startTimer();
  }

  hide(): void {
    this._stopTimer();
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }

  private _injectStyles(): void {
    if (document.getElementById('ooo-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'ooo-game-styles';
    style.textContent = OOO_STYLES;
    document.head.appendChild(style);
  }

  private _render(): void {
    if (!this.el || !this.levelConfig) return;
    const cfg = this.levelConfig;

    const timerHtml = cfg.timeLimit !== null
      ? `<div class="ooo-timer" id="ooo-timer">${this._formatTime(cfg.timeLimit)}</div>`
      : `<div class="ooo-timer" style="color:rgba(255,255,255,0.5);font-size:12px;">${t('oddone.noTimer')}</div>`;

    this.el.innerHTML = `
      <div class="ooo-header">
        <button class="ooo-back-btn game-exit-btn" aria-label="back">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10l6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="ooo-progress" id="ooo-progress">0 / ${cfg.totalRounds}</div>
        ${timerHtml}
      </div>
      <div class="ooo-title-area">
        <div class="ooo-title">${t('oddone.title')}</div>
        <div class="ooo-subtitle">${t('oddone.subtitle')}</div>
      </div>
      <div class="ooo-content">
        <div class="ooo-shape-card">
          <div class="ooo-shape-row" id="ooo-shape-row"></div>
        </div>
        <div class="ooo-dots" id="ooo-dots"></div>
        <div class="ooo-hint" id="ooo-hint"></div>
      </div>
    `;

    this.el.querySelector('.ooo-back-btn')!.addEventListener('pointerdown', () => {
      this._stopTimer();
      confirmExit(
        () => {
          this.hide();
          appRouter.back();
        },
        () => {
          if (this.levelConfig?.timeLimit !== null && (this.timeRemaining ?? 0) > 0) {
            this._startTimer();
          }
        },
      );
    });

    this._updateDots();
  }

  private _startRound(): void {
    if (!this.levelConfig || !this.el) return;

    if (this.currentRound >= this.levelConfig.totalRounds) {
      this._stopTimer();
      this._showResult();
      return;
    }

    this.isAnswering = false;
    this.currentProblem = generateOddOneOutProblem(this.levelConfig);

    this._renderShapes(this.currentProblem);
    this._updateProgress();
    this._updateDots();
    this._updateHint(this.currentProblem.oddReason);
  }

  private _renderShapes(problem: OddOneOutProblem): void {
    const rowEl = this.el?.querySelector('#ooo-shape-row') as HTMLElement | null;
    if (!rowEl) return;

    const { shapeCount } = this.levelConfig!;
    const cellSize = shapeCount === 4 ? 72 : 60;

    rowEl.innerHTML = '';
    problem.shapes.forEach((shape, i) => {
      const item = document.createElement('div');
      item.className = 'ooo-shape-item';
      item.style.setProperty('--si', String(i));

      const cell = document.createElement('div');
      cell.className = 'ooo-shape-cell';
      cell.style.width = `${cellSize}px`;
      cell.style.height = `${cellSize}px`;
      cell.innerHTML = renderOddShapeDiv(shape, cellSize);

      const badge = document.createElement('div');
      badge.className = 'ooo-shape-badge';
      badge.textContent = String.fromCharCode(65 + i); // A, B, C...

      item.appendChild(cell);
      item.appendChild(badge);
      // E2E 테스트용 DEV-only 정답 마킹
      if (import.meta.env.DEV && i === problem.oddIndex) {
        item.dataset['correct'] = 'true';
      }
      item.addEventListener('pointerdown', () => this._onShapeSelected(i, problem, cell, rowEl));
      rowEl.appendChild(item);
    });
  }

  private _onShapeSelected(
    index: number,
    problem: OddOneOutProblem,
    selectedCell: HTMLElement,
    rowEl: HTMLElement,
  ): void {
    if (this.isAnswering) return;
    this.isAnswering = true;

    const allCells = Array.from(rowEl.querySelectorAll('.ooo-shape-cell')) as HTMLElement[];
    const isCorrect = index === problem.oddIndex;

    allCells.forEach((cell, i) => {
      if (i === problem.oddIndex) {
        cell.classList.add('correct');
      } else if (i === index && !isCorrect) {
        cell.classList.add('wrong');
      } else {
        cell.classList.add('dimmed');
      }
    });

    if (isCorrect) this.correctCount++;

    this.currentRound++;

    setTimeout(() => {
      this._startRound();
    }, isCorrect ? 800 : 1000);
  }

  private _updateProgress(): void {
    const el = this.el?.querySelector('#ooo-progress') as HTMLElement | null;
    if (el && this.levelConfig) {
      el.textContent = `${this.currentRound} / ${this.levelConfig.totalRounds}`;
    }
  }

  private _updateDots(): void {
    const dotsEl = this.el?.querySelector('#ooo-dots') as HTMLElement | null;
    if (!dotsEl || !this.levelConfig) return;

    dotsEl.innerHTML = '';
    for (let i = 0; i < this.levelConfig.totalRounds; i++) {
      const dot = document.createElement('div');
      dot.className = 'ooo-dot';
      if (i < this.currentRound) dot.classList.add('done');
      else if (i === this.currentRound) dot.classList.add('current');
      dotsEl.appendChild(dot);
    }
  }

  private _updateHint(reason: OddReason): void {
    const hintEl = this.el?.querySelector('#ooo-hint') as HTMLElement | null;
    if (hintEl) {
      hintEl.textContent = t(HINT_KEY_MAP[reason]);
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
      const elapsed = (now - last) / 1000;
      last = now;

      if (this.timeRemaining !== null) {
        this.timeRemaining -= elapsed;

        const timerEl = this.el?.querySelector('#ooo-timer') as HTMLElement | null;
        if (timerEl) {
          timerEl.textContent = this._formatTime(Math.max(0, this.timeRemaining));
          timerEl.style.color = this.timeRemaining <= 10 ? '#FCA5A5' : '#6EE7B7';
        }

        if (this.timeRemaining <= 0) {
          this._stopTimer();
          if (!this.isAnswering) {
            this._showResult();
          }
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
    const stars = calcOddOneOutStars(correct, cfg.starThresholds);

    saveService.recordLogicClear(cfg.id, stars, correct);

    const pct = correct / total;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const titleKey: any = pct === 1
      ? 'oddone.result.perfect'
      : pct >= 0.7
      ? 'oddone.result.great'
      : pct >= 0.4
      ? 'oddone.result.good'
      : 'oddone.result.fail';

    const scoreText = t('oddone.result.score')
      .replace('{correct}', String(correct))
      .replace('{total}', String(total));

    const starsHtml = Array.from({ length: 3 }, (_, i) => {
      const filled = i < stars;
      return `<span style="
        color: ${filled ? '#FBBF24' : 'rgba(255,255,255,0.3)'};
        animation: ${filled ? `ooo-star-pop 400ms ${i * 150}ms both ease` : 'none'};
        display: inline-block;
      ">${filled ? '★' : '☆'}</span>`;
    }).join('');

    const overlay = document.createElement('div');
    overlay.className = 'ooo-result-overlay';
    overlay.innerHTML = `
      <div class="ooo-result-stars">${starsHtml}</div>
      <div class="ooo-result-title">${t(titleKey)}</div>
      <div class="ooo-result-score">${scoreText}</div>
      <div class="ooo-result-btns">
        <button class="result-btn result-btn--ghost ooo-result-btn--retry">${t('oddone.result.retry')}</button>
        <button class="result-btn result-btn--ghost ooo-result-btn--menu">${t('oddone.result.menu')}</button>
      </div>
    `;

    overlay.querySelector('.ooo-result-btn--retry')!.addEventListener('pointerdown', () => {
      overlay.remove();
      this.levelConfig = cfg;
      this.currentRound = 0;
      this.correctCount = 0;
      this.isAnswering = false;
      this.timeRemaining = cfg.timeLimit;
      this._render();
      this._startRound();
      if (cfg.timeLimit !== null) this._startTimer();
    });

    overlay.querySelector('.ooo-result-btn--menu')!.addEventListener('pointerdown', () => {
      this.hide();
      appRouter.navigate({ to: 'logic-menu', subject: 'logic', replace: true });
    });

    this.el.appendChild(overlay);
  }
}
