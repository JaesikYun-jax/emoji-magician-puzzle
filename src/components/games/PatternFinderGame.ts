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
@keyframes pf-num-badge-in {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}
.pf-choice-btn:hover {
  background: rgba(255,255,255,0.22) !important;
  border-color: rgba(255,255,255,0.45) !important;
}
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
  private _sortedMap: number[] = [];

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
    // A. 워터마크 레이어
    const watermark = document.createElement('div');
    watermark.style.cssText = `
      position: absolute; inset: 0;
      pointer-events: none; z-index: 0; overflow: hidden;
    `;
    const wmSymbols = ['÷','×','+','−','=','∑','∫','√','∞','π','%','≥','≤','²','³','∝','Δ','∇','∈','∀'];
    const wmPositions = [
      {top:'5%',left:'3%'},{top:'8%',left:'78%'},{top:'18%',left:'45%'},
      {top:'28%',left:'15%'},{top:'32%',left:'88%'},{top:'42%',left:'60%'},
      {top:'48%',left:'25%'},{top:'55%',left:'80%'},{top:'62%',left:'5%'},
      {top:'68%',left:'50%'},{top:'72%',left:'92%'},{top:'78%',left:'30%'},
      {top:'85%',left:'68%'},{top:'90%',left:'12%'},{top:'92%',left:'85%'},
      {top:'15%',left:'62%'},{top:'38%',left:'38%'},{top:'58%',left:'12%'},
      {top:'75%',left:'55%'},{top:'22%',left:'90%'},
    ];
    const wmSizes = [
      '3.5rem','5rem','4rem','6rem','3rem','7rem','4.5rem','5.5rem',
      '3rem','6rem','4rem','3.5rem','5rem','4rem','6.5rem','3rem','5rem','4.5rem','3.5rem','6rem',
    ];
    wmSymbols.forEach((sym, i) => {
      const span = document.createElement('span');
      span.textContent = sym;
      span.style.cssText = `
        position: absolute;
        top: ${wmPositions[i].top}; left: ${wmPositions[i].left};
        font-size: ${wmSizes[i]};
        color: rgba(255,255,255,0.05);
        font-weight: 900;
        user-select: none;
        pointer-events: none;
      `;
      watermark.appendChild(span);
    });
    this.el.appendChild(watermark);

    // B. HUD 바
    const hud = document.createElement('div');
    hud.style.cssText = `
      position: relative; z-index: 10;
      width: 100%; max-width: 480px;
      padding: 10px 16px 0;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0; box-sizing: border-box;
    `;

    const homeBtn = document.createElement('button');
    homeBtn.textContent = '🏠';
    homeBtn.style.cssText = `
      background: rgba(255,255,255,0.15);
      border: 1.5px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      width: 38px; height: 38px;
      color: #fff; font-size: 1.1rem; cursor: pointer; flex-shrink: 0;
    `;
    homeBtn.addEventListener('click', () => this._exitToMenu());
    hud.appendChild(homeBtn);

    this.progressEl = document.createElement('div');
    this.progressEl.style.cssText = `
      background: rgba(0,0,0,0.20);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 5px 14px;
      color: #fff; font-size: 0.85rem; font-weight: 700;
      backdrop-filter: blur(6px);
    `;
    hud.appendChild(this.progressEl);

    this.timerEl = document.createElement('div');
    this.timerEl.style.cssText = `
      background: rgba(0,0,0,0.20);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      padding: 5px 14px;
      color: #fff; font-size: 0.85rem; font-weight: 700;
      backdrop-filter: blur(6px);
      flex-shrink: 0;
    `;
    hud.appendChild(this.timerEl);

    this.el.appendChild(hud);

    // C. 문제 영역 wrapper
    const questionWrapper = document.createElement('div');
    questionWrapper.style.cssText = `
      position: relative; z-index: 5;
      flex: 1 1 0; width: 100%; max-width: 480px;
      display: flex; align-items: center; justify-content: center;
      padding: 12px 16px 8px; box-sizing: border-box;
    `;

    const questionCard = document.createElement('div');
    questionCard.style.cssText = `
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1.5px solid rgba(255,255,255,0.30);
      border-radius: 28px;
      box-shadow: 0 8px 32px rgba(3,105,161,0.40);
      padding: 28px 20px 24px;
      width: 100%; box-sizing: border-box;
    `;

    const label = document.createElement('div');
    label.textContent = '? 에 들어갈 수를 고르세요';
    label.style.cssText = `
      color: rgba(255,255,255,0.7);
      font-size: 0.78rem; font-weight: 600;
      text-align: center; margin-bottom: 14px;
      letter-spacing: 0.02em;
    `;
    questionCard.appendChild(label);

    // 타일 컨테이너
    this.tilesEl = document.createElement('div');
    this.tilesEl.style.cssText = `
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    `;
    questionCard.appendChild(this.tilesEl);

    questionWrapper.appendChild(questionCard);
    this.el.appendChild(questionWrapper);

    // D. 선택지 영역 wrapper
    const choicesWrapper = document.createElement('div');
    choicesWrapper.style.cssText = `
      position: relative; z-index: 5;
      flex: 0 0 auto; width: 100%; max-width: 480px;
      padding: 0 16px 20px; box-sizing: border-box;
    `;

    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    `;
    choicesWrapper.appendChild(this.choicesEl);

    this.el.appendChild(choicesWrapper);
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
          font-size: 1rem;
          color: rgba(255,255,255,0.6);
          flex-shrink: 0;
        `;
        this.tilesEl.appendChild(sep);
      }

      const tile = document.createElement('div');
      const isBlank = value === null;

      if (isBlank) {
        tile.textContent = '?';
        tile.style.cssText = `
          width: 62px; height: 62px;
          background: rgba(251,191,36,0.25);
          border: 1.5px solid rgba(251,191,36,0.7);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem; font-weight: 900; color: #FBBF24;
          flex-shrink: 0;
          animation: pf-fall-in 300ms ease calc(${i} * 150ms) both,
                     pf-blank-pulse 1.2s ease-in-out ${len * 150}ms infinite;
        `;
      } else {
        tile.textContent = String(value);
        tile.style.cssText = `
          width: 62px; height: 62px;
          background: rgba(255,255,255,0.18);
          border: 1.5px solid rgba(255,255,255,0.3);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.6rem; font-weight: 900; color: #fff;
          flex-shrink: 0;
          animation: pf-fall-in 300ms ease calc(${i} * 150ms) both;
        `;
      }

      this.tilesEl.appendChild(tile);
    });
  }

  private _renderChoices(seq: PatternSequence): void {
    this.choicesEl.innerHTML = '';

    // 원본 인덱스를 유지하며 오름차순 정렬
    const sortedEntries = seq.choices
      .map((val, origIdx) => ({ val, origIdx }))
      .sort((a, b) => a.val - b.val);

    // DOM 위치 → 원본 인덱스 맵 저장
    this._sortedMap = sortedEntries.map(e => e.origIdx);

    sortedEntries.forEach(({ val, origIdx }, domPos) => {
      const btn = document.createElement('button');
      btn.className = 'pf-choice-btn';
      btn.style.cssText = `
        position: relative;
        display: flex; align-items: center; justify-content: center;
        width: 100%; height: 72px;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        border-radius: 20px;
        color: #fff; font-size: 1.6rem; font-weight: 800;
        cursor: pointer;
        transition: background 120ms, border-color 120ms;
        touch-action: manipulation;
        box-sizing: border-box;
      `;

      // 번호 배지 (좌상단, 1-based)
      const badge = document.createElement('span');
      badge.textContent = String(domPos + 1);
      badge.style.cssText = `
        position: absolute; top: 7px; left: 10px;
        font-size: 0.68rem; font-weight: 700;
        color: rgba(255,255,255,0.45);
        line-height: 1;
        animation: pf-num-badge-in 200ms ${domPos * 80}ms both ease;
      `;
      btn.appendChild(badge);

      // 숫자 텍스트
      const labelSpan = document.createElement('span');
      labelSpan.textContent = String(val);
      btn.appendChild(labelSpan);

      // 클릭 시 원본 인덱스 전달
      btn.addEventListener('pointerdown', () => this._onAnswer(origIdx));
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

    buttons.forEach((btn, domIdx) => {
      btn.style.pointerEvents = 'none';
      const origIdx = this._sortedMap[domIdx] ?? domIdx;
      if (origIdx === seq.correctIndex) {
        btn.style.background = 'rgba(16,185,129,0.50)';
        btn.style.borderColor = '#10B981';
        btn.style.boxShadow = '0 0 20px rgba(16,185,129,0.55)';
        btn.style.animation = 'pf-correct-pop 300ms ease';
      } else if (origIdx === choiceIndex && !isCorrect) {
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
    // back()으로 스택의 'math-menu'를 pop해 정상 복귀.
    // skipHistory: true로 navigate하면 스택에 'math-menu'가 잔류해
    // math-menu → back() → math-menu 루프 버그가 발생한다.
    appRouter.back();
  }
}
