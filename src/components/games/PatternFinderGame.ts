/**
 * PatternFinderGame.ts
 * DOM 기반 규칙 찾기 게임 컴포넌트.
 *
 * 화면 구조:
 *   [HUD] 홈 버튼 | 진행도 (N/Total) | 타이머
 *   [카드] 수열 타일 가로 배열 (각 타일 150ms 순차 fall 애니메이션)
 *          ? 타일에는 blank-pulse 박동 애니메이션
 *   [선택지 4개] 2×2 그리드 버튼
 *   [결과 오버레이] 별 + 정답 수 + 다시하기/메뉴
 */

import { appRouter } from '../../router/AppRouter';
import { generatePatternSequence, calcPatternStars } from '../../systems/math/patternFinderGenerator';
import type { PatternSequence } from '../../systems/math/patternFinderGenerator';
import type { PatternLevelConfig } from '../../game-data/patternFinderLevels';

const PF_STYLES = `
@keyframes pf-fall-in {
  from { transform: translateY(-60px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
@keyframes pf-blank-pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(251,191,36,0); }
  50%       { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(251,191,36,0.35); }
}
@keyframes pf-correct-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.10); }
  100% { transform: scale(1); }
}
@keyframes pf-shake {
  0%,100% { transform: translateX(0); }
  25%     { transform: translateX(-10px); }
  75%     { transform: translateX(10px); }
}
@keyframes pf-result-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes pf-star-pop {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  70%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
.pf-choice-btn:active { transform: scale(0.95); transition: transform 80ms; }
`;

export class PatternFinderGame {
  private el: HTMLElement;
  private levelConfig: PatternLevelConfig | null = null;
  private currentRound = 0;
  private correctCount = 0;
  private isAnswering = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining = 0;
  private currentSeq: PatternSequence | null = null;

  // DOM refs
  private progressEl!: HTMLElement;
  private timerEl!: HTMLElement;
  private tilesEl!: HTMLElement;
  private choicesEl!: HTMLElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'pf-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: linear-gradient(160deg, #0369A1 0%, #0EA5E9 55%, #38BDF8 100%);
      flex-direction: column;
      align-items: center;
      z-index: 20;
      overflow: hidden;
    `;
    container.appendChild(this.el);
    this._injectStyles();
    this._buildUI();
  }

  // ── 공개 API ───────────────────────────────────────────────────────────────

  show(levelConfig: PatternLevelConfig): void {
    this.levelConfig = levelConfig;
    this.el.style.display = 'flex';
    this._reset(levelConfig);
    this._startLevel();
  }

  hide(): void {
    this.el.style.display = 'none';
    this._stopTimer();
  }

  // ── 초기화 ────────────────────────────────────────────────────────────────

  private _injectStyles(): void {
    if (document.getElementById('pf-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'pf-game-styles';
    style.textContent = PF_STYLES;
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
    this.progressEl.style.cssText = `
      color: #fff; font-size: 0.9rem; font-weight: 700;
    `;
    hud.appendChild(this.progressEl);

    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText = `
      background: rgba(255,255,255,0.15);
      border: 1.5px solid rgba(255,255,255,0.3);
      border-radius: 20px;
      padding: 4px 12px;
      color: #fff; font-size: 0.9rem; font-weight: 700;
      flex-shrink: 0;
    `;
    hud.appendChild(this.timerEl);

    this.el.appendChild(hud);

    // 카드 컨테이너
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1.5px solid rgba(255,255,255,0.28);
      border-radius: 28px;
      box-shadow: 0 8px 32px rgba(3,105,161,0.45);
      padding: 32px 20px 24px;
      width: calc(100vw - 32px);
      max-width: 420px;
      margin-top: 28px;
      box-sizing: border-box;
    `;

    // 타일 컨테이너
    this.tilesEl = document.createElement('div');
    this.tilesEl.style.cssText = `
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 28px;
      flex-wrap: wrap;
    `;
    card.appendChild(this.tilesEl);

    // 선택지 버튼 컨테이너 (2×2 그리드)
    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    `;
    card.appendChild(this.choicesEl);

    this.el.appendChild(card);
  }

  private _reset(cfg: PatternLevelConfig): void {
    this.currentRound = 0;
    this.correctCount = 0;
    this.isAnswering = false;
    this.timeRemaining = cfg.timeLimit;
    this.currentSeq = null;
  }

  // ── 게임 흐름 ─────────────────────────────────────────────────────────────

  private _startLevel(): void {
    this._startTimer();
    this._renderRound();
  }

  private _renderRound(): void {
    if (!this.levelConfig) return;

    if (this.currentRound >= this.levelConfig.totalRounds) {
      this._stopTimer();
      this._showResult();
      return;
    }

    const seq = generatePatternSequence(this.levelConfig.genParams);
    this.currentSeq = seq;
    this.isAnswering = false;

    this._renderTiles(seq);
    this._renderChoices(seq);
    this._updateHUD();
  }

  private _renderTiles(seq: PatternSequence): void {
    this.tilesEl.innerHTML = '';
    const len = seq.tiles.length;

    seq.tiles.forEach((value, i) => {
      // 구분자 (타일 사이)
      if (i > 0) {
        const sep = document.createElement('span');
        sep.textContent = '→';
        sep.style.cssText = `
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          flex-shrink: 0;
        `;
        this.tilesEl.appendChild(sep);
      }

      const tile = document.createElement('div');
      const isBlank = value === null;

      if (isBlank) {
        tile.textContent = '?';
        tile.style.cssText = `
          width: 52px; height: 52px;
          background: rgba(251,191,36,0.25);
          border: 1.5px solid rgba(251,191,36,0.7);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; font-weight: 900; color: #FBBF24;
          flex-shrink: 0;
          animation: pf-fall-in 300ms ease calc(${i} * 150ms) both,
                     pf-blank-pulse 1.2s ease-in-out ${len * 150}ms infinite;
        `;
      } else {
        tile.textContent = String(value);
        tile.style.cssText = `
          width: 52px; height: 52px;
          background: rgba(255,255,255,0.18);
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; font-weight: 900; color: #fff;
          flex-shrink: 0;
          animation: pf-fall-in 300ms ease calc(${i} * 150ms) both;
        `;
      }

      this.tilesEl.appendChild(tile);
    });
  }

  private _renderChoices(seq: PatternSequence): void {
    this.choicesEl.innerHTML = '';
    seq.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.textContent = String(choice);
      btn.className = 'pf-choice-btn';
      btn.style.cssText = `
        display: block; width: 100%; height: 56px;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        border-radius: 16px;
        color: #fff; font-size: 1.4rem; font-weight: 700;
        cursor: pointer;
        transition: background 120ms, border-color 120ms;
        touch-action: manipulation;
      `;
      btn.addEventListener('pointerdown', () => this._onAnswer(idx));
      this.choicesEl.appendChild(btn);
    });
  }

  private _onAnswer(choiceIndex: number): void {
    if (this.isAnswering) return;
    const seq = this.currentSeq;
    if (!seq) return;
    this.isAnswering = true;

    const isCorrect = choiceIndex === seq.correctIndex;
    if (isCorrect) this.correctCount++;

    const buttons = Array.from(
      this.choicesEl.querySelectorAll('.pf-choice-btn'),
    ) as HTMLButtonElement[];

    buttons.forEach((btn, idx) => {
      btn.style.pointerEvents = 'none';
      if (idx === seq.correctIndex) {
        btn.style.background = 'rgba(16,185,129,0.50)';
        btn.style.borderColor = '#10B981';
        btn.style.boxShadow = '0 0 20px rgba(16,185,129,0.55)';
        btn.style.animation = 'pf-correct-pop 300ms ease';
      } else if (idx === choiceIndex && !isCorrect) {
        btn.style.background = 'rgba(239,68,68,0.45)';
        btn.style.borderColor = '#EF4444';
        btn.style.animation = 'pf-shake 280ms ease';
      }
    });

    this.currentRound++;
    this._updateHUD();

    setTimeout(() => this._renderRound(), isCorrect ? 480 : 700);
  }

  // ── HUD ────────────────────────────────────────────────────────────────────

  private _updateHUD(): void {
    if (!this.levelConfig) return;
    const n     = this.currentRound;
    const total = this.levelConfig.totalRounds;
    this.progressEl.textContent = `${n} / ${total}`;
    this._renderTimer();
  }

  private _renderTimer(): void {
    const secs = Math.ceil(this.timeRemaining);
    this.timerEl.textContent = `⏱ ${secs}초`;
    this.timerEl.style.color = secs <= 10 ? '#FCA5A5' : '#fff';
    this.timerEl.style.borderColor = secs <= 10
      ? 'rgba(239,68,68,0.5)'
      : 'rgba(255,255,255,0.3)';
  }

  // ── 타이머 ────────────────────────────────────────────────────────────────

  private _startTimer(): void {
    this._stopTimer();
    this.timerId = setInterval(() => {
      this.timeRemaining -= 0.1;
      this._renderTimer();
      if (this.timeRemaining <= 0) {
        this._stopTimer();
        this.timeRemaining = 0;
        this._renderTimer();
        if (!this.isAnswering) {
          this.currentRound = this.levelConfig?.totalRounds ?? this.currentRound;
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

  // ── 결과 오버레이 ─────────────────────────────────────────────────────────

  private _showResult(): void {
    if (!this.levelConfig) return;
    const cfg    = this.levelConfig;
    const correct = this.correctCount;
    const total   = cfg.totalRounds;
    const stars   = calcPatternStars(correct, cfg.starThresholds);

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(3,105,161,0.90);
      backdrop-filter: blur(6px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 50;
      animation: pf-result-in 350ms ease-out;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.18);
      border: 1.5px solid rgba(255,255,255,0.30);
      border-radius: 28px;
      padding: 36px 32px;
      width: calc(100vw - 48px);
      max-width: 360px;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.30);
    `;

    // 타이틀
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
      font-size: 1.8rem; font-weight: 900; color: #fff;
      margin-bottom: 8px;
    `;
    titleEl.textContent =
      stars >= 3 ? '🎊 완벽해요!' :
      stars >= 2 ? '⭐ 잘했어요!' :
      stars >= 1 ? '👍 했어요!' :
                   '😅 다시 도전!';
    card.appendChild(titleEl);

    // 별
    const starsEl = document.createElement('div');
    starsEl.style.cssText = `
      font-size: 2.6rem; margin: 16px 0; letter-spacing: 8px;
      min-height: 3rem;
    `;
    starsEl.innerHTML = Array.from({ length: 3 }, (_, i) => {
      const filled = i < stars;
      return `<span style="
        display: inline-block;
        color: ${filled ? '#FBBF24' : 'rgba(255,255,255,0.30)'};
        animation: ${filled ? `pf-star-pop 400ms ${i * 150}ms both ease` : 'none'};
      ">${filled ? '★' : '☆'}</span>`;
    }).join('');
    card.appendChild(starsEl);

    // 정답 / 전체
    const scoreEl = document.createElement('div');
    scoreEl.style.cssText = `
      font-size: 1.1rem; color: rgba(255,255,255,0.9);
      margin-bottom: 24px; font-weight: 700;
    `;
    scoreEl.textContent = `${correct} / ${total} 정답`;
    card.appendChild(scoreEl);

    // 다시 하기 버튼
    const retryBtn = document.createElement('button');
    retryBtn.textContent = '🔄 다시 하기';
    retryBtn.style.cssText = `
      display: block; width: 100%;
      padding: 14px;
      background: rgba(255,255,255,0.20);
      border: 1.5px solid rgba(255,255,255,0.35);
      border-radius: 16px;
      color: #fff; font-size: 1rem; font-weight: 700;
      cursor: pointer; margin-bottom: 12px;
      touch-action: manipulation;
    `;
    retryBtn.addEventListener('click', () => {
      overlay.remove();
      this._reset(cfg);
      this._startLevel();
    });
    card.appendChild(retryBtn);

    // 메뉴로 버튼
    const menuBtn = document.createElement('button');
    menuBtn.textContent = '🏠 메뉴로';
    menuBtn.style.cssText = `
      display: block; width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, rgba(251,191,36,0.85), rgba(245,158,11,0.85));
      border: none;
      border-radius: 16px;
      color: #fff; font-size: 1rem; font-weight: 900;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(245,158,11,0.45);
      touch-action: manipulation;
    `;
    menuBtn.addEventListener('click', () => this._exitToMenu());
    card.appendChild(menuBtn);

    overlay.appendChild(card);
    this.el.appendChild(overlay);
  }

  // ── 네비게이션 ────────────────────────────────────────────────────────────

  private _exitToMenu(): void {
    this._stopTimer();
    this.hide();
    appRouter.navigate({ to: 'math-menu', subject: 'math', skipHistory: true });
  }
}
