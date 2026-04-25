/**
 * CreativityGame.ts
 * DOM 기반 한붓그리기 게임 컴포넌트.
 *
 * 화면 구조:
 *   [HUD] 홈 버튼 | 진행도 (visited/total) | 타이머
 *   [격자] CSS Grid 기반, 칸 탭/드래그로 경로 그리기
 *   [결과 오버레이] 클리어 수 + 뱃지 + 칭찬 메시지 (별 없음)
 */

import { appRouter } from '../../router/AppRouter';
import {
  createPathState,
  tryMove,
  cellId,
} from '../../systems/creativity/hamiltonianPath';
import type { PathState } from '../../systems/creativity/hamiltonianPath';
import type { CreativityLevelConfig } from '../../game-data/creativityLevels';
import { selectWallPuzzle } from '../../systems/creativity/wallPuzzleSelector';
import { saveService } from '../../services/SaveService';
import { t } from '../../i18n';

const CREATIVITY_GAME_STYLES = `
@keyframes cg-result-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes cg-badge-pop {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  70%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes cg-count-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes cg-levelup-in {
  0%   { opacity: 0; transform: scale(0.7) translateY(20px); }
  70%  { transform: scale(1.05) translateY(-4px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
`;

/** 칭찬 메시지 선택 */
function getPraiseMessage(totalClears: number, streak: number): string {
  if (streak >= 10) return '전설이 탄생했습니다! 🌟';
  if (streak >= 7)  return '멈출 수가 없네요! 🔥';
  if (streak >= 5)  return '천재적이에요! ⚡';
  if (streak >= 3)  return '이 기세 멈추지 마요! 💪';
  if (totalClears === 1) return '첫 마법을 완성했어요! 🌱';
  if (totalClears <= 4)  return '완벽해요! 🎉';
  if (totalClears <= 9)  return '대단해요! 🎊';
  if (totalClears <= 19) return '역시 마법사예요! 🔮';
  if (totalClears <= 29) return '경이로운 실력이에요! 🏅';
  if (totalClears <= 49) return '달인의 경지네요! 🏆';
  return '이모지 마법사 인증! 🧙';
}

export class CreativityGame {
  private el: HTMLElement;
  private levelConfig: CreativityLevelConfig | null = null;
  private pathState: PathState | null = null;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining = 0;
  private timeUsed = 0;
  private isDragging = false;
  private _lastMovedCellId: string | null = null;

  private progressEl!: HTMLElement;
  private timerEl!: HTMLElement;
  private gridEl!: HTMLElement;
  private cellEls: Map<string, HTMLElement> = new Map();
  private visitChipEl!: HTMLElement;
  private wallRightCells: Set<string> = new Set();
  private wallBottomCells: Set<string> = new Set();

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
    if (levelConfig.id && levelConfig.id !== '__auto__') {
      saveService.addRecentCreativityPuzzleId(levelConfig.id);
    }
    this._reset(levelConfig);
  }

  hide(): void {
    this.el.style.display = 'none';
    this._stopTimer();
    this.el.querySelectorAll<HTMLElement>('[data-result-overlay]').forEach(el => el.remove());
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

    // 상단 타이틀 섹션
    const titleSection = document.createElement('div');
    titleSection.style.cssText = `
      width: 100%; max-width: 480px;
      padding: 8px 20px 4px;
      text-align: center;
      flex-shrink: 0;
    `;

    const eyebrow = document.createElement('div');
    eyebrow.textContent = 'DRAW WITHOUT LIFTING';
    eyebrow.style.cssText = `
      color: #FDE68A;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      margin-bottom: 4px;
    `;
    titleSection.appendChild(eyebrow);

    const titleEl = document.createElement('div');
    titleEl.textContent = '모든 점을 한번에';
    titleEl.style.cssText = `
      font-size: 1.4rem;
      font-weight: 900;
      color: #fff;
      margin-bottom: 6px;
    `;
    titleSection.appendChild(titleEl);

    this.visitChipEl = document.createElement('div');
    this.visitChipEl.style.cssText = `
      display: inline-block;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 13px; font-weight: 800; color: #FDE68A;
    `;
    this.visitChipEl.textContent = '0 / 0';
    titleSection.appendChild(this.visitChipEl);

    this.el.appendChild(titleSection);

    // 격자 컨테이너
    this.gridEl = document.createElement('div');
    this.el.appendChild(this.gridEl);

    // 별 조건 카드
    const starCard = document.createElement('div');
    let starCardVisible = true;
    starCard.style.cssText = `
      width: calc(100% - 40px);
      max-width: 440px;
      margin-top: 10px;
      background: rgba(0,0,0,0.25);
      border-radius: 18px;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-shrink: 0;
    `;
    const starCardText = document.createElement('div');
    starCardText.style.cssText = `color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 700;`;
    starCardText.innerHTML = `⭐ 별 3개 조건 &nbsp;|&nbsp; 최소 움직임으로 완성`;
    starCard.appendChild(starCardText);
    const starCardClose = document.createElement('button');
    starCardClose.textContent = '✕';
    starCardClose.style.cssText = `
      background: none; border: none;
      color: rgba(255,255,255,0.55); font-size: 14px;
      cursor: pointer; flex-shrink: 0; padding: 0 4px;
    `;
    starCardClose.addEventListener('pointerdown', () => {
      if (starCardVisible) {
        starCard.style.display = 'none';
        starCardVisible = false;
      }
    });
    starCard.appendChild(starCardClose);
    this.el.appendChild(starCard);

    // 드래그 종료 감지
    this.el.addEventListener('pointerup', () => {
      this.isDragging = false;
      this._lastMovedCellId = null;
    });
    this.el.addEventListener('pointercancel', () => {
      this.isDragging = false;
      this._lastMovedCellId = null;
    });

    // pointermove로 드래그 중 셀 진입 감지 (pointerenter 대체)
    // elementFromPoint를 써야 pointer capture 상태에서도 정확히 작동함
    this.gridEl.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      e.preventDefault();
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!target) return;
      const cid = target.dataset['cellId'];
      if (!cid) return;
      const [cx, cy] = cid.split(',').map(Number);
      this._handleCellTouch(cx, cy);
    });

    // 하단 버튼 2개 가로 배열
    const btnRow = document.createElement('div');
    btnRow.style.cssText = `
      display: flex;
      gap: 10px;
      margin-top: 14px;
      margin-bottom: 20px;
      width: calc(100% - 40px);
      max-width: 440px;
      flex-shrink: 0;
    `;

    const undoBtn = document.createElement('button');
    undoBtn.textContent = '↶ 한 수 무르기';
    undoBtn.style.cssText = `
      flex: 1;
      padding: 10px 0;
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      color: #fff; font-size: 0.9rem; font-weight: 700;
      cursor: pointer;
      touch-action: manipulation;
    `;
    undoBtn.addEventListener('click', () => this._undo());
    btnRow.appendChild(undoBtn);

    const resetBtn = document.createElement('button');
    resetBtn.textContent = '다시 시작';
    resetBtn.style.cssText = `
      flex: 1;
      padding: 10px 0;
      background: #FDE68A;
      border: none;
      border-radius: 20px;
      color: #431407; font-size: 0.9rem; font-weight: 900;
      cursor: pointer;
      touch-action: manipulation;
    `;
    resetBtn.addEventListener('click', () => {
      if (this.levelConfig) this._reset(this.levelConfig);
    });
    btnRow.appendChild(resetBtn);
    this.el.appendChild(btnRow);
  }

  private _reset(cfg: CreativityLevelConfig): void {
    this.el.querySelectorAll<HTMLElement>('[data-result-overlay]').forEach(el => el.remove());
    this.pathState = createPathState(cfg.cols, cfg.rows, cfg.blocked, cfg.walls);
    this.timeRemaining = cfg.timeLimit;
    this.timeUsed = 0;
    this.isDragging = false;
    this._lastMovedCellId = null;
    this.cellEls.clear();
    this._buildGrid(cfg);
    this._updateHUD();
    this._stopTimer();
    this._startTimer();
  }

  private _buildGrid(cfg: CreativityLevelConfig): void {
    this.gridEl.innerHTML = '';
    this.cellEls.clear();
    this.wallRightCells.clear();
    this.wallBottomCells.clear();
    if (cfg.walls) {
      for (const wall of cfg.walls) {
        const key = `${wall.x},${wall.y}`;
        if (wall.dir === 'r') this.wallRightCells.add(key);
        else this.wallBottomCells.add(key);
      }
    }

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
          transition: background 150ms;
          box-sizing: border-box;
          ${isBlocked
            ? 'background: rgba(180,20,20,0.50); border: 2px solid rgba(239,68,68,0.70);'
            : 'background: rgba(255,255,255,0.10); border-top: 1.5px solid rgba(255,255,255,0.20); border-left: 1.5px solid rgba(255,255,255,0.20); border-right: 1.5px solid rgba(255,255,255,0.20); border-bottom: 1.5px solid rgba(255,255,255,0.20);'}
          touch-action: none;
        `;

        if (isBlocked) {
          cell.textContent = '✕';
          cell.style.color = 'rgba(255,255,255,0.85)';
          cell.style.fontSize = '1.3rem';
          cell.style.textShadow = '0 0 8px rgba(239,68,68,0.7)';
        }

        if (!isBlocked) {
          cell.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            // pointer capture를 해제해 pointermove+elementFromPoint가 정확히 동작하도록
            (e.currentTarget as Element).releasePointerCapture(e.pointerId);
            this.isDragging = true;
            this._lastMovedCellId = null;
            this._handleCellTouch(x, y);
          });

          // 벽은 border 개별 속성으로 적용 (box-shadow spread 없음)
          const wallId = `${x},${y}`;
          this._applyWallBorders(cell, wallId);
        }

        this.gridEl.appendChild(cell);
        this.cellEls.set(id, cell);
      }
    }
  }

  private _undo(): void {
    if (!this.pathState || this.pathState.visited.length <= 1) return;
    const state = this.pathState;
    const newVisited = state.visited.slice(0, -1);
    const newSet = new Set(newVisited);
    this.pathState = { ...state, visited: newVisited, visitedSet: newSet };
    this._refreshGrid();
    this._updateHUD();
  }

  private _handleCellTouch(x: number, y: number): void {
    if (!this.pathState) return;
    const state = this.pathState;
    const id = cellId(x, y);

    // 동일 셀 재진입 무시 (pointermove 중복 발화 방지)
    if (this._lastMovedCellId === id) return;
    this._lastMovedCellId = id;

    if (state.visitedSet.has(id)) {
      const lastId = state.visited[state.visited.length - 1];
      if (lastId === id && state.visited.length > 1) {
        this._undo();
      }
      return;
    }

    const result = tryMove(state, { x, y });
    if (result.status === 'invalid') {
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

  /** 벽 border를 개별 side로 적용 (right / bottom 만 덮어쓰기) */
  private _applyWallBorders(el: HTMLElement, id: string): void {
    if (this.wallRightCells.has(id)) {
      el.style.borderRight = '4px solid rgba(255,255,255,0.85)';
    }
    if (this.wallBottomCells.has(id)) {
      el.style.borderBottom = '4px solid rgba(255,255,255,0.85)';
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
        // 기본 border 먼저 설정 후 벽 border 덮어쓰기
        el.style.borderTop = '1.5px solid #F97316';
        el.style.borderLeft = '1.5px solid #F97316';
        el.style.borderRight = '1.5px solid #F97316';
        el.style.borderBottom = '1.5px solid #F97316';
        el.style.boxShadow = '0 0 16px rgba(249,115,22,0.6)';
        this._applyWallBorders(el, id);
        el.textContent = String(visitIdx + 1);
        el.style.color = '#fff';
      } else if (isVisited) {
        el.style.background = 'rgba(251,146,60,0.35)';
        el.style.borderTop = '1.5px solid rgba(249,115,22,0.5)';
        el.style.borderLeft = '1.5px solid rgba(249,115,22,0.5)';
        el.style.borderRight = '1.5px solid rgba(249,115,22,0.5)';
        el.style.borderBottom = '1.5px solid rgba(249,115,22,0.5)';
        el.style.boxShadow = '';
        this._applyWallBorders(el, id);
        el.textContent = String(visitIdx + 1);
        el.style.color = 'rgba(255,255,255,0.85)';
      } else {
        el.style.background = 'rgba(255,255,255,0.10)';
        el.style.borderTop = '1.5px solid rgba(255,255,255,0.20)';
        el.style.borderLeft = '1.5px solid rgba(255,255,255,0.20)';
        el.style.borderRight = '1.5px solid rgba(255,255,255,0.20)';
        el.style.borderBottom = '1.5px solid rgba(255,255,255,0.20)';
        el.style.boxShadow = '';
        this._applyWallBorders(el, id);
        el.textContent = '';
      }
    });
  }

  private _updateHUD(): void {
    if (!this.pathState || !this.levelConfig) return;
    const visited = this.pathState.visited.length;
    const total = this.pathState.totalCells;
    this.progressEl.textContent = `${visited} / ${total} 칸`;
    if (this.visitChipEl) {
      this.visitChipEl.textContent = `${visited} / ${total}`;
    }
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

    // 저장 & 통계 가져오기
    const clearResult = saveService.recordCreativityClearV2(cleared);
    const { meta, newBadge, leveledUp, newLevel } = clearResult;

    const overlay = document.createElement('div');
    overlay.dataset['resultOverlay'] = '1';
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(67,20,7,0.92);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 50;
      padding: 20px;
      box-sizing: border-box;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.22);
      border-radius: 28px;
      padding: 32px 28px;
      width: 100%;
      max-width: 360px;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.30);
      animation: cg-result-in 350ms ease-out;
    `;

    if (cleared) {
      // 칭찬 메시지
      const praiseEl = document.createElement('div');
      praiseEl.style.cssText = `
        font-size: 1.8rem; font-weight: 900; color: #fff;
        letter-spacing: -0.02em;
        text-shadow: 0 2px 16px rgba(251,146,60,0.5);
        margin-bottom: 16px;
        line-height: 1.3;
      `;
      praiseEl.textContent = getPraiseMessage(meta.totalClears, meta.currentStreak);
      card.appendChild(praiseEl);

      // 신규 뱃지
      if (newBadge) {
        const badgePop = document.createElement('div');
        badgePop.style.cssText = `
          background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(234,88,12,0.15));
          border: 1.5px solid rgba(251,191,36,0.4);
          border-radius: 20px;
          padding: 12px 20px;
          margin-bottom: 14px;
          animation: cg-badge-pop 500ms ease-out;
        `;
        badgePop.innerHTML = `
          <div style="font-size:2.4rem;line-height:1;">${newBadge.emoji}</div>
          <div style="font-size:0.7rem;font-weight:700;color:#FCD34D;margin-top:4px;letter-spacing:0.06em;">NEW BADGE</div>
          <div style="font-size:0.88rem;font-weight:700;color:#fff;margin-top:2px;">${newBadge.name}</div>
        `;
        card.appendChild(badgePop);
      }

      // 클리어 수
      const countEl = document.createElement('div');
      countEl.style.cssText = `
        margin-bottom: 8px;
        animation: cg-count-up 400ms 100ms both ease;
      `;
      countEl.innerHTML = `
        <span style="font-size:3.2rem;font-weight:900;color:#fff;line-height:1;text-shadow:0 4px 24px rgba(251,146,60,0.6);">${meta.totalClears}</span>
        <span style="font-size:1rem;font-weight:700;color:rgba(255,255,255,0.75);margin-left:4px;">번 클리어</span>
      `;
      card.appendChild(countEl);

      // 연속 성공
      if (meta.currentStreak >= 2) {
        const streakEl = document.createElement('div');
        const streakColor = meta.currentStreak >= 5
          ? '#FCD34D'
          : meta.currentStreak >= 3
            ? '#FB923C'
            : '#FCA5A5';
        streakEl.style.cssText = `
          font-size: 1rem; font-weight: 700;
          color: ${streakColor};
          margin-bottom: 6px;
          ${meta.currentStreak >= 5 ? 'text-shadow: 0 0 12px rgba(252,211,77,0.5);' : ''}
        `;
        streakEl.textContent = `🔥 ${meta.currentStreak}연속 성공!`;
        card.appendChild(streakEl);
      }

      // 완성 시간
      const timeEl = document.createElement('div');
      timeEl.style.cssText = `font-size: 0.88rem; color: rgba(255,255,255,0.60); margin-bottom: 24px; margin-top: 4px;`;
      timeEl.textContent = `완성 시간: ${Math.round(this.timeUsed)}초`;
      card.appendChild(timeEl);

      // 다음 퍼즐 버튼
      const nextBtn = document.createElement('button');
      nextBtn.textContent = '다음 퍼즐 ▶';
      nextBtn.style.cssText = `
        display: block; width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #FB923C, #EA580C);
        border: none; border-radius: 16px;
        color: #fff; font-size: 1rem; font-weight: 900;
        box-shadow: 0 4px 20px rgba(234,88,12,0.50);
        cursor: pointer; margin-bottom: 10px;
        touch-action: manipulation;
        transition: transform 100ms;
      `;
      nextBtn.addEventListener('click', () => {
        overlay.remove();
        const updatedMeta = saveService.getCreativityMeta();
        const newConfig = selectWallPuzzle(updatedMeta.totalClears, updatedMeta.recentPuzzleIds ?? []);
        saveService.addRecentCreativityPuzzleId(newConfig.id);
        this.levelConfig = newConfig;
        this._reset(newConfig);
      });
      nextBtn.addEventListener('pointerdown', () => { nextBtn.style.transform = 'scale(0.95)'; });
      nextBtn.addEventListener('pointerup', () => { nextBtn.style.transform = ''; });
      card.appendChild(nextBtn);

      const menuBtn = document.createElement('button');
      menuBtn.textContent = '🏠 메뉴로';
      menuBtn.style.cssText = `
        display: block; width: 100%;
        padding: 14px;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        border-radius: 16px;
        color: #fff; font-size: 1rem; font-weight: 700;
        cursor: pointer;
        touch-action: manipulation;
        transition: transform 100ms;
      `;
      menuBtn.addEventListener('click', () => this._exitToMenu());
      menuBtn.addEventListener('pointerdown', () => { menuBtn.style.transform = 'scale(0.95)'; });
      menuBtn.addEventListener('pointerup', () => { menuBtn.style.transform = ''; });
      card.appendChild(menuBtn);

      // 레벨업 모달 (결과 카드 후 1000ms 뒤)
      if (leveledUp) {
        setTimeout(() => {
          this._showLevelUpModal(overlay, newLevel);
        }, 1000);
      }

    } else {
      // 실패 화면
      const failMsg = document.createElement('div');
      failMsg.style.cssText = `font-size: 1.8rem; font-weight: 900; color: #fff; margin-bottom: 8px;`;
      failMsg.textContent = '아쉬워요!';
      card.appendChild(failMsg);

      const failSub = document.createElement('div');
      failSub.style.cssText = `font-size: 1rem; color: rgba(255,255,255,0.75); margin-bottom: 24px;`;
      failSub.textContent = '⏰ 시간이 다 됐어요. 다시 도전해봐요!';
      card.appendChild(failSub);

      const retryBtn = document.createElement('button');
      retryBtn.textContent = '🔄 다시 하기';
      retryBtn.style.cssText = `
        display: block; width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #FB923C, #EA580C);
        border: none; border-radius: 16px;
        color: #fff; font-size: 1rem; font-weight: 900;
        box-shadow: 0 4px 20px rgba(234,88,12,0.50);
        cursor: pointer; margin-bottom: 10px;
        touch-action: manipulation;
      `;
      retryBtn.addEventListener('click', () => {
        overlay.remove();
        if (this.levelConfig) this._reset(this.levelConfig);
      });
      card.appendChild(retryBtn);

      const menuBtn = document.createElement('button');
      menuBtn.textContent = '🏠 메뉴로';
      menuBtn.style.cssText = `
        display: block; width: 100%;
        padding: 14px;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        border-radius: 16px;
        color: #fff; font-size: 1rem; font-weight: 700;
        cursor: pointer;
        touch-action: manipulation;
      `;
      menuBtn.addEventListener('click', () => this._exitToMenu());
      card.appendChild(menuBtn);
    }

    overlay.appendChild(card);
    this.el.appendChild(overlay);
  }

  private _showLevelUpModal(parentOverlay: HTMLElement, newLevel: number): void {
    const RANK_DATA = [
      { level: 1, title: '마법사 지망생', emoji: '✏️' },
      { level: 2, title: '마법사 수련생', emoji: '🪄' },
      { level: 3, title: '마법사 견습생', emoji: '🌱' },
      { level: 4, title: '마법사 입문자', emoji: '🔮' },
      { level: 5, title: '마법사 중급자', emoji: '⚡' },
      { level: 6, title: '마법사 숙련자', emoji: '🌟' },
      { level: 7, title: '마법사 고수',   emoji: '🏅' },
      { level: 8, title: '마법사 달인',   emoji: '🏆' },
      { level: 9, title: '마법 기사',     emoji: '👑' },
      { level: 10, title: '이모지 마법사', emoji: '🧙' },
    ];
    const rankInfo = RANK_DATA.find(r => r.level === newLevel) ?? RANK_DATA[0];

    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 60;
      display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      padding: 20px; box-sizing: border-box;
    `;

    const panel = document.createElement('div');
    panel.style.cssText = `
      background: linear-gradient(160deg, #1E0050, #4C1D95, #6D28D9);
      border: 1.5px solid rgba(167,139,250,0.4);
      border-radius: 28px;
      padding: 36px 28px;
      width: 100%; max-width: 300px;
      text-align: center;
      box-shadow: 0 8px 40px rgba(109,40,217,0.55);
      animation: cg-levelup-in 450ms cubic-bezier(0.22,0.61,0.36,1);
    `;

    panel.innerHTML = `
      <div style="font-size:1.4rem;margin-bottom:4px;letter-spacing:8px;">✨✨✨</div>
      <div style="font-size:0.75rem;font-weight:900;letter-spacing:0.2em;color:#C4B5FD;margin-bottom:4px;">LEVEL UP!</div>
      <div style="font-size:3.8rem;display:block;margin:10px 0;animation:cg-badge-pop 600ms ease-out;">${rankInfo.emoji}</div>
      <div style="font-size:1.3rem;font-weight:900;color:#fff;text-shadow:0 2px 12px rgba(167,139,250,0.5);">Lv.${newLevel} — ${rankInfo.title}</div>
      <div style="font-size:0.85rem;color:rgba(196,181,253,0.85);margin:8px 0 24px;">새로운 난이도가 열렸어요!</div>
    `;

    const okBtn = document.createElement('button');
    okBtn.textContent = '계속하기';
    okBtn.style.cssText = `
      width: 100%; padding: 14px;
      background: linear-gradient(135deg, #7C3AED, #6D28D9);
      border: none; border-radius: 16px;
      color: #fff; font-size: 1rem; font-weight: 900;
      box-shadow: 0 4px 20px rgba(109,40,217,0.55);
      cursor: pointer; touch-action: manipulation;
    `;
    okBtn.addEventListener('click', () => modal.remove());
    panel.appendChild(okBtn);
    modal.appendChild(panel);
    parentOverlay.appendChild(modal);
  }

  private _exitToMenu(): void {
    this._stopTimer();
    this.hide();
    appRouter.back();
  }
}
