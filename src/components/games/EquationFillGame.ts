/**
 * EquationFillGame.ts
 * DOM 기반 등식 완성 게임 컴포넌트.
 *
 * 화면 구조:
 *   [HUD] 홈 버튼 | 진행도 (N/Total) | 타이머
 *   [등식 카드] 큰 폰트로 "□ + 4 = 9" 표시
 *   [선택지 4개] 세로 배열 버튼
 *   [레벨 완료 오버레이] 별 + 점수 + 홈 버튼
 */

import { appRouter } from '../../router/AppRouter';
import {
  generateEqFillQuestion,
  calcEqFillStars,
} from '../../systems/math/equationFillGenerator';
import type { EqFillQuestion } from '../../systems/math/equationFillGenerator';
import type { EqFillLevelConfig } from '../../game-data/equationFillLevels';

const EQ_FILL_STYLES = `
@keyframes eq-correct-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.10); }
  100% { transform: scale(1); }
}
@keyframes eq-shake {
  0%,100% { transform: translateX(0); }
  25%     { transform: translateX(-10px); }
  75%     { transform: translateX(10px); }
}
@keyframes eq-question-in {
  from { opacity: 0; transform: translateY(-14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes eq-result-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes eq-star-pop {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  70%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes eq-progress-fill {
  from { width: 0%; }
}
.eq-choice-btn:active { transform: scale(0.95); transition: transform 80ms; }
`;

export class EquationFillGame {
  private el: HTMLElement;
  private levelConfig: EqFillLevelConfig | null = null;
  private questions: EqFillQuestion[] = [];
  private currentIndex = 0;
  private correctCount = 0;
  private isAnswering = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining = 0;

  // DOM refs
  private progressEl!: HTMLElement;
  private timerEl!: HTMLElement;
  private equationEl!: HTMLElement;
  private choicesEl!: HTMLElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'eq-fill-game';
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

  show(levelConfig: EqFillLevelConfig): void {
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
    if (document.getElementById('eq-fill-styles')) return;
    const style = document.createElement('style');
    style.id = 'eq-fill-styles';
    style.textContent = EQ_FILL_STYLES;
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
      padding: 36px 24px 28px;
      width: calc(100vw - 32px);
      max-width: 380px;
      margin-top: 32px;
      box-sizing: border-box;
    `;

    // 등식 표시 영역
    this.equationEl = document.createElement('div');
    this.equationEl.style.cssText = `
      font-size: 2.8rem;
      font-weight: 900;
      color: #fff;
      text-align: center;
      letter-spacing: 2px;
      margin-bottom: 36px;
      min-height: 3.5rem;
      animation: eq-question-in 250ms ease-out;
    `;
    card.appendChild(this.equationEl);

    // 선택지 버튼 컨테이너
    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      display: flex; flex-direction: column; gap: 12px;
    `;
    card.appendChild(this.choicesEl);

    this.el.appendChild(card);
  }

  private _reset(cfg: EqFillLevelConfig): void {
    this.currentIndex = 0;
    this.correctCount = 0;
    this.isAnswering = false;
    this.timeRemaining = cfg.timeLimit;
    this.questions = [];
  }

  // ── 게임 흐름 ─────────────────────────────────────────────────────────────

  private _startLevel(): void {
    this._startTimer();
    this._loadNextQuestion();
  }

  private _loadNextQuestion(): void {
    if (!this.levelConfig) return;

    if (this.currentIndex >= this.levelConfig.totalQuestions) {
      this._stopTimer();
      this._showResult();
      return;
    }

    // 필요한 만큼 즉석 생성 (이전에 미리 생성 없이 하나씩 생성)
    const q = generateEqFillQuestion(this.levelConfig.genParams);
    this.questions.push(q);
    this.isAnswering = false;
    this._renderQuestion(q);
    this._updateHUD();
  }

  private _renderQuestion(q: EqFillQuestion): void {
    // 등식 표시 (□를 강조)
    const displayHtml = q.displayText.replace(
      '□',
      '<span style="color:#FBBF24;font-size:3.2rem;text-shadow:0 2px 8px rgba(251,191,36,0.6)">□</span>',
    );
    this.equationEl.innerHTML = displayHtml;
    this.equationEl.style.animation = 'none';
    // force reflow
    void this.equationEl.offsetWidth;
    this.equationEl.style.animation = 'eq-question-in 250ms ease-out';

    // 선택지 버튼
    this.choicesEl.innerHTML = '';
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.textContent = String(choice);
      btn.className = 'eq-choice-btn';
      btn.style.cssText = `
        display: block; width: 100%; height: 58px;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        border-radius: 16px;
        color: #fff; font-size: 1.5rem; font-weight: 700;
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
    const q = this.questions[this.currentIndex];
    if (!q) return;
    this.isAnswering = true;

    const isCorrect = choiceIndex === q.correctIndex;
    if (isCorrect) this.correctCount++;

    const buttons = Array.from(
      this.choicesEl.querySelectorAll('.eq-choice-btn'),
    ) as HTMLButtonElement[];

    buttons.forEach((btn, idx) => {
      btn.style.pointerEvents = 'none';
      if (idx === q.correctIndex) {
        btn.style.background = 'rgba(16,185,129,0.50)';
        btn.style.borderColor = '#10B981';
        btn.style.boxShadow = '0 0 20px rgba(16,185,129,0.55)';
        btn.style.animation = 'eq-correct-pop 300ms ease';
      } else if (idx === choiceIndex && !isCorrect) {
        btn.style.background = 'rgba(239,68,68,0.45)';
        btn.style.borderColor = '#EF4444';
        btn.style.animation = 'eq-shake 280ms ease';
      }
    });

    this.currentIndex++;
    this._updateHUD();

    setTimeout(() => this._loadNextQuestion(), isCorrect ? 480 : 700);
  }

  // ── HUD ────────────────────────────────────────────────────────────────────

  private _updateHUD(): void {
    if (!this.levelConfig) return;
    const n     = this.currentIndex;
    const total = this.levelConfig.totalQuestions;
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
        // 시간 초과 → 현재 문제 오답 처리 후 결과
        if (!this.isAnswering) {
          this.currentIndex = this.levelConfig?.totalQuestions ?? this.currentIndex;
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
    const cfg = this.levelConfig;
    const correct = this.correctCount;
    const total   = cfg.totalQuestions;
    const stars   = calcEqFillStars(correct, cfg.starThresholds);
    const pct     = Math.round((correct / total) * 100);

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(3,105,161,0.90);
      backdrop-filter: blur(6px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 50;
      animation: eq-result-in 350ms ease-out;
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
    titleEl.textContent = stars >= 3 ? '🎊 완벽해요!' : stars >= 2 ? '⭐ 잘했어요!' : stars >= 1 ? '👍 했어요!' : '😅 다시 도전!';
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
        animation: ${filled ? `eq-star-pop 400ms ${i * 150}ms both ease` : 'none'};
      ">${filled ? '★' : '☆'}</span>`;
    }).join('');
    card.appendChild(starsEl);

    // 정답 / 전체
    const scoreEl = document.createElement('div');
    scoreEl.style.cssText = `
      font-size: 1.1rem; color: rgba(255,255,255,0.9);
      margin-bottom: 24px; font-weight: 700;
    `;
    scoreEl.textContent = `${correct} / ${total}  정답  (${pct}%)`;
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
    // back()으로 스택의 'math-menu'를 pop해 정상 복귀.
    // skipHistory: true로 navigate하면 스택에 'math-menu'가 잔류해
    // math-menu → back() → math-menu 루프 버그가 발생한다.
    appRouter.back();
  }
}
