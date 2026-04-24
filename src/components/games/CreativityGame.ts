/**
 * CreativityGame.ts
 * DOM 기반 한붓그리기 게임 컴포넌트.
 *
 * 화면 구조:
 *   [HUD] 홈 버튼 | 진행도 (visited/total) | 타이머
 *   [격자] CSS Grid 기반, 칸 탭/드래그로 경로 그리기
 *   [결과 오버레이] 별 + 완성/실패 + 다시하기/메뉴
 */

import { appRouter } from '../../router/AppRouter';
import {
  createPathState,
  tryMove,
  cellId,
  calcCreativityStars,
} from '../../systems/creativity/hamiltonianPath';
import type { PathState } from '../../systems/creativity/hamiltonianPath';
import type { CreativityLevelConfig } from '../../game-data/creativityLevels';
import { saveService } from '../../services/SaveService';

const CREATIVITY_GAME_STYLES = `
@keyframes cg-result-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes cg-star-pop {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  70%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes cg-complete-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.6); }
  70%  { box-shadow: 0 0 0 12px rgba(16,185,129,0); }
  100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
}
`;

export class CreativityGame {
  private el: HTMLElement;
  private levelConfig: CreativityLevelConfig | null = null;
  private pathState: PathState | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining = 0;
  private timeUsed = 0;
  private isDragging = false;

  private progressEl!: HTMLElement;
  private timerEl!: HTMLElement;
  private gridEl!: HTMLElement;
  private cellEls: Map<string, HTMLElement> = new Map();

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'cg-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: linear-gradient(160deg, #431407 0%, #9A3412 55%, #EA580C 100%);
      flex-direction: column;
      align-items: center;
      z-index: 20;
      overflow: hidden;
      user-select: none;
    `;
    container.appendChild(this.el);
    this._injectStyles();
    this._buildUI();
  }

  show(levelConfig: CreativityLevelConfig): void {
    this.levelConfig = levelConfig;
    this.el.style.display = 'flex';
    this._reset(levelConfig);
  }

  hide(): void {
    this.el.style.display = 'none';
    this._stopTimer();
  }

  private _injectStyles(): void {
    if (document.getElementById('cg-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'cg-game-styles';
    style.textContent = CREATIVITY_GAME_STYLES;
    document.head.appendChild(style);
  }

  private _buildUI(): void {
    // HUD
    const hud = document.createElement('div');
    hud.style.cssText = `
      position: sticky; top: 0;
      width: 100%; max-width: 480px;
      height: 64px;
      padding: 0 16px;
      background: rgba(0,0,0,0.25);
      backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: space-between;
      z-index: 10; flex-shrink: 0; box-sizing: border-box;
    `;

    const homeBtn = document.createElement('button');
    homeBtn.textContent = '🏠';
    homeBtn.style.cssText = `
      background: rgba(255,255,255,0.15);
      border: 1.5px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      width: 40px; height: 40px;
      color: #fff; font-size: 1.2rem; cursor: pointer; flex-shrink: 0;
    `;
    homeBtn.addEventListener('click', () => this._exitToMenu());
    hud.appendChild(homeBtn);

    this.progressEl = document.createElement('div');
    this.progressEl.style.cssText = `color: #fff; font-size: 0.9rem; font-weight: 700;`;
    hud.appendChild(this.progressEl);

    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText = `
      background: rgba(255,255,255,0.15);
      border: 1.5px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      padding: 4px 12px;
      color: #fff; font-size: 0.9rem; font-weight: 700; flex-shrink: 0;
    `;
    hud.appendChild(this.timerEl);
    this.el.appendChild(hud);

    // 힌트
    const hint = document.createElement('div');
    hint.textContent = '칸을 눌러 경로를 그려요';
    hint.style.cssText = `
      color: rgba(255,255,255,0.70);
      font-size: 0.85rem;
      margin-top: 16px;
      margin-bottom: 8px;
    `;
    this.el.appendChild(hint);

    // 격자 컨테이너
    this.gridEl = document.createElement('div');
    this.el.appendChild(this.gridEl);

    // 리셋 버튼
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '↩ 처음부터';
    resetBtn.style.cssText = `
      margin-top: 20px;
      padding: 10px 24px;
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      color: #fff; font-size: 0.9rem; font-weight: 700;
      cursor: pointer;
      touch-action: manipulation;
    `;
    resetBtn.addEventListener('click', () => {
      if (this.levelConfig) this._reset(this.levelConfig);
    });
    this.el.appendChild(resetBtn);
  }

  private _reset(cfg: CreativityLevelConfig): void {
    this.pathState = createPathState(cfg.cols, cfg.rows, cfg.blocked);
    this.timeRemaining = cfg.timeLimit;
    this.timeUsed = 0;
    this.isDragging = false;
    this.cellEls.clear();
    this._buildGrid(cfg);
    this._updateHUD();
    this._stopTimer();
    this._startTimer();
  }

  private _buildGrid(cfg: CreativityLevelConfig): void {
    this.gridEl.innerHTML = '';
    this.cellEls.clear();

    // 격자 크기 계산 — 화면 너비 기준
    const vw = Math.min(window.innerWidth, 480);
    const padding = 32;
    const gapCount = cfg.cols - 1;
    const gap = 6;
    const cellSize = Math.floor((vw - padding * 2 - gapCount * gap) / cfg.cols);
    const clampedCell = Math.max(40, Math.min(cellSize, 72));

    this.gridEl.style.cssText = `
      display: grid;
      grid-template-columns: repeat(${cfg.cols}, ${clampedCell}px);
      grid-template-rows: repeat(${cfg.rows}, ${clampedCell}px);
      gap: ${gap}px;
      padding: ${padding / 2}px;
      touch-action: none;
    `;

    for (let y = 0; y < cfg.rows; y++) {
      for (let x = 0; x < cfg.cols; x++) {
        const id = cellId(x, y);
        const isBlocked = cfg.blocked.some(b => b.x === x && b.y === y);

        const cell = document.createElement('div');
        cell.dataset['cellId'] = id;
        cell.style.cssText = `
          width: ${clampedCell}px; height: ${clampedCell}px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 700;
          cursor: ${isBlocked ? 'default' : 'pointer'};
          transition: background 150ms, border-color 150ms;
          box-sizing: border-box;
          ${isBlocked
            ? 'background: rgba(0,0,0,0.35); border: 1.5px solid rgba(0,0,0,0.2);'
            : 'background: rgba(255,255,255,0.10); border: 1.5px solid rgba(255,255,255,0.20);'}
          touch-action: none;
        `;

        if (isBlocked) {
          cell.textContent = '✕';
          cell.style.color = 'rgba(255,255,255,0.25)';
        }

        if (!isBlocked) {
          cell.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            this.isDragging = true;
            this._handleCellTouch(x, y);
          });
          cell.addEventListener('pointerenter', (e) => {
            e.preventDefault();
            if (this.isDragging) this._handleCellTouch(x, y);
          });
        }

        this.gridEl.appendChild(cell);
        this.cellEls.set(id, cell);
      }
    }

    // 드래그 종료 감지
    this.el.addEventListener('pointerup', () => { this.isDragging = false; });
    this.el.addEventListener('pointercancel', () => { this.isDragging = false; });
  }

  private _handleCellTouch(x: number, y: number): void {
    if (!this.pathState) return;
    const state = this.pathState;
    const id = cellId(x, y);

    // 이미 방문한 칸 탭: 마지막 칸이면 되돌리기
    if (state.visitedSet.has(id)) {
      const lastId = state.visited[state.visited.length - 1];
      if (lastId === id && state.visited.length > 1) {
        // undo: 마지막 칸 취소
        const newVisited = state.visited.slice(0, -1);
        const newSet = new Set(newVisited);
        this.pathState = { ...state, visited: newVisited, visitedSet: newSet };
        this._refreshGrid();
      }
      return;
    }

    const result = tryMove(state, { x, y });
    if (result.status === 'invalid') {
      // 약한 피드백
      const cellEl = this.cellEls.get(id);
      if (cellEl) {
        cellEl.style.borderColor = 'rgba(239,68,68,0.6)';
        setTimeout(() => {
          if (cellEl) cellEl.style.borderColor = 'rgba(255,255,255,0.20)';
        }, 300);
      }
      return;
    }

    this.pathState = result.state;
    this._refreshGrid();
    this._updateHUD();

    if (result.status === 'complete') {
      this._stopTimer();
      setTimeout(() => this._showResult(true), 400);
    }
  }

  private _refreshGrid(): void {
    if (!this.pathState || !this.levelConfig) return;
    const state = this.pathState;
    const cfg = this.levelConfig;

    this.cellEls.forEach((el, id) => {
      const isBlocked = cfg.blocked.some(b => cellId(b.x, b.y) === id);
      if (isBlocked) return;

      const visitIdx = state.visited.indexOf(id);
      const isVisited = visitIdx !== -1;
      const isLast = state.visited[state.visited.length - 1] === id;

      if (isLast) {
        el.style.background = 'rgba(251,146,60,0.85)';
        el.style.borderColor = '#F97316';
        el.style.boxShadow = '0 0 16px rgba(249,115,22,0.6)';
        el.textContent = String(visitIdx + 1);
        el.style.color = '#fff';
      } else if (isVisited) {
        el.style.background = 'rgba(251,146,60,0.35)';
        el.style.borderColor = 'rgba(249,115,22,0.5)';
        el.style.boxShadow = '';
        el.textContent = String(visitIdx + 1);
        el.style.color = 'rgba(255,255,255,0.85)';
      } else {
        el.style.background = 'rgba(255,255,255,0.10)';
        el.style.borderColor = 'rgba(255,255,255,0.20)';
        el.style.boxShadow = '';
        el.textContent = '';
      }
    });
  }

  private _updateHUD(): void {
    if (!this.pathState || !this.levelConfig) return;
    const visited = this.pathState.visited.length;
    const total = this.pathState.totalCells;
    this.progressEl.textContent = `${visited} / ${total} 칸`;
    this._renderTimer();
  }

  private _renderTimer(): void {
    const secs = Math.ceil(this.timeRemaining);
    this.timerEl.textContent = `⏱ ${secs}초`;
    this.timerEl.style.color = secs <= 15 ? '#FCA5A5' : '#fff';
    this.timerEl.style.borderColor = secs <= 15
      ? 'rgba(239,68,68,0.5)'
      : 'rgba(255,255,255,0.3)';
  }

  private _startTimer(): void {
    this._stopTimer();
    this.timerId = setInterval(() => {
      this.timeRemaining -= 0.1;
      this.timeUsed += 0.1;
      this._renderTimer();
      if (this.timeRemaining <= 0) {
        this._stopTimer();
        this.timeRemaining = 0;
        this._renderTimer();
        this._showResult(false);
      }
    }, 100);
  }

  private _stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private _showResult(cleared: boolean): void {
    if (!this.levelConfig) return;
    const cfg = this.levelConfig;
    const stars = cleared ? calcCreativityStars(this.timeUsed, cfg.timeLimit) : 0;

    if (cleared) {
      saveService.recordCreativityClear(cfg.id, stars, Math.round(this.timeUsed));
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(67,20,7,0.92);
      backdrop-filter: blur(6px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 50;
      animation: cg-result-in 350ms ease-out;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.22);
      border-radius: 28px;
      padding: 36px 32px;
      width: calc(100vw - 48px);
      max-width: 360px;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.30);
    `;

    const titleEl = document.createElement('div');
    titleEl.style.cssText = `font-size: 1.8rem; font-weight: 900; color: #fff; margin-bottom: 8px;`;
    titleEl.textContent = cleared
      ? (stars >= 3 ? '🎊 완벽해요!' : stars >= 2 ? '⭐ 잘했어요!' : '👍 했어요!')
      : '😅 다시 도전!';
    card.appendChild(titleEl);

    if (cleared) {
      const starsEl = document.createElement('div');
      starsEl.style.cssText = `font-size: 2.6rem; margin: 16px 0; letter-spacing: 8px; min-height: 3rem;`;
      starsEl.innerHTML = Array.from({ length: 3 }, (_, i) => {
        const filled = i < stars;
        return `<span style="
          display: inline-block;
          color: ${filled ? '#FBBF24' : 'rgba(255,255,255,0.30)'};
          animation: ${filled ? `cg-star-pop 400ms ${i * 150}ms both ease` : 'none'};
        ">${filled ? '★' : '☆'}</span>`;
      }).join('');
      card.appendChild(starsEl);

      const timeEl = document.createElement('div');
      timeEl.style.cssText = `font-size: 1rem; color: rgba(255,255,255,0.80); margin-bottom: 24px;`;
      timeEl.textContent = `완성 시간: ${Math.round(this.timeUsed)}초`;
      card.appendChild(timeEl);
    } else {
      const failEl = document.createElement('div');
      failEl.style.cssText = `font-size: 1rem; color: rgba(255,255,255,0.80); margin: 16px 0 24px;`;
      failEl.textContent = '⏰ 시간 초과!';
      card.appendChild(failEl);
    }

    const retryBtn = document.createElement('button');
    retryBtn.textContent = '🔄 다시 하기';
    retryBtn.style.cssText = `
      display: block; width: 100%;
      padding: 14px;
      background: rgba(255,255,255,0.14);
      border: 1.5px solid rgba(255,255,255,0.28);
      border-radius: 16px;
      color: #fff; font-size: 1rem; font-weight: 700;
      cursor: pointer; margin-bottom: 12px;
      touch-action: manipulation;
    `;
    retryBtn.addEventListener('click', () => {
      overlay.remove();
      this._reset(cfg);
    });
    card.appendChild(retryBtn);

    const menuBtn = document.createElement('button');
    menuBtn.textContent = '🏠 메뉴로';
    menuBtn.style.cssText = `
      display: block; width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, rgba(251,146,60,0.85), rgba(234,88,12,0.85));
      border: none;
      border-radius: 16px;
      color: #fff; font-size: 1rem; font-weight: 900;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(234,88,12,0.45);
      touch-action: manipulation;
    `;
    menuBtn.addEventListener('click', () => this._exitToMenu());
    card.appendChild(menuBtn);

    overlay.appendChild(card);
    this.el.appendChild(overlay);
  }

  private _exitToMenu(): void {
    this._stopTimer();
    this.hide();
    appRouter.navigate({ to: 'creativity-menu', subject: 'creativity', skipHistory: true });
  }
}
