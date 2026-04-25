import { appRouter } from '../../router/AppRouter';
import { ENGLISH_WORDS, getWordsByDifficulty } from '../../game-data/englishWords';
import { buildQuizSession } from '../../systems/english/englishGameEngine';
import type { EnglishQuizSession, EnglishQuizQuestion } from '../../systems/english/englishGameEngine';

const STYLE_ID = 'english-game-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes eg-correct-flash {
      0%   { background: rgba(16,185,129,0.55); transform: scale(1.04); }
      100% { background: rgba(255,255,255,0.15); transform: scale(1); }
    }
    @keyframes eg-shake {
      0%,100% { transform: translateX(0); }
      25%     { transform: translateX(-8px); }
      75%     { transform: translateX(8px); }
    }
    @keyframes eg-word-enter {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes eg-score-pop {
      0%   { transform: scale(0.7); opacity: 0; }
      70%  { transform: scale(1.15); }
      100% { transform: scale(1); opacity: 1; }
    }
    .eng-choice-btn:active { transform: scale(0.95); transition: transform 100ms; }
  `;
  document.head.appendChild(style);
}

export class EnglishGame {
  private el: HTMLElement;
  private session: EnglishQuizSession | null = null;
  private currentIdx = 0;
  private correctCount = 0;
  private isProcessing = false;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  private wordEl: HTMLElement | null = null;
  private choicesEl: HTMLElement | null = null;
  private progressFill: HTMLElement | null = null;
  private progressLabel: HTMLElement | null = null;
  private emojiEl: HTMLElement | null = null;
  private combo = 0;
  private dotEls: HTMLElement[] = [];
  private scoreLabelEl: HTMLElement | null = null;
  private _correctHistory: boolean[] = [];

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    // .english-game 클래스 유지 (DOM 테스트 호환)
    this.el.className = 'english-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      flex-direction: column;
      background: linear-gradient(160deg, #064E3B 0%, #065F46 50%, #10B981 100%);
      z-index: 10;
      overflow: hidden;
    `;
    container.appendChild(this.el);
    injectStyles();
  }

  show(difficulty?: string): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    const diff = (difficulty ?? 'beginner') as 'beginner' | 'elementary' | 'intermediate' | 'advanced';
    let words = getWordsByDifficulty(diff);
    if (words.length < 4) {
      words = ENGLISH_WORDS;
    }
    this.session = buildQuizSession(words, 10);
    this.currentIdx = 0;
    this.correctCount = 0;
    this.isProcessing = false;
    this._correctHistory = [];
    this.combo = 0;

    this.el.style.alignItems = '';
    this.el.style.justifyContent = '';
    this.buildLayout();
    this.el.style.display = 'flex';
    this.renderQuestion();
  }

  hide(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this.el.style.display = 'none';
    this.el.innerHTML = '';
    this.wordEl = null;
    this.choicesEl = null;
    this.progressFill = null;
    this.progressLabel = null;
    this.emojiEl = null;
    this.dotEls = [];
    this.scoreLabelEl = null;
    this.combo = 0;
    this._correctHistory = [];
    this.session = null;
  }

  private buildLayout(): void {
    this.el.innerHTML = '';

    // ── HUD (.eng-hud — 테스트 호환용 클래스명 유지) ─────────────────────────
    const hudEl = document.createElement('div');
    hudEl.className = 'eng-hud';
    hudEl.style.cssText = `
      flex-shrink: 0;
      width: 100%;
      padding: calc(env(safe-area-inset-top, 0px) + 44px) 18px 12px;
      box-sizing: border-box;
    `;

    const pill = document.createElement('div');
    pill.style.cssText = `
      display: flex; align-items: center; gap: 10px;
      background: rgba(0,0,0,0.28);
      backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 8px 12px;
      color: #fff;
    `;

    const backBtn = document.createElement('button');
    backBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    backBtn.style.cssText = `
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(255,255,255,0.12); border: none;
      color: #fff; display: grid; place-items: center;
      cursor: pointer; flex-shrink: 0; touch-action: manipulation;
    `;
    backBtn.addEventListener('pointerdown', () => appRouter.back());
    pill.appendChild(backBtn);

    const progressTrackEl = document.createElement('div');
    progressTrackEl.style.cssText = `
      flex: 1; height: 6px;
      background: rgba(255,255,255,0.15);
      border-radius: 999px; overflow: hidden;
    `;
    this.progressFill = document.createElement('div');
    this.progressFill.style.cssText = `
      height: 100%;
      background: #FDE68A;
      border-radius: 999px;
      transition: width 350ms ease;
      width: 0%;
    `;
    progressTrackEl.appendChild(this.progressFill);
    pill.appendChild(progressTrackEl);

    this.progressLabel = document.createElement('div');
    this.progressLabel.style.cssText = `
      font-family: var(--f-display, sans-serif);
      font-weight: 800; font-size: 14px;
      color: #FDE68A; flex-shrink: 0;
    `;
    this.progressLabel.textContent = '0/10';
    pill.appendChild(this.progressLabel);

    hudEl.appendChild(pill);
    this.el.appendChild(hudEl);

    // ── 단어 카드 (.eng-card — 테스트 호환용 클래스명 유지) ───────────────────
    const card = document.createElement('div');
    card.className = 'eng-card';
    card.style.cssText = `
      margin: 12px 20px;
      padding: 24px 20px;
      border-radius: 24px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(6,95,70,0.45);
      text-align: center;
      flex-shrink: 0;
    `;

    // chip
    const chip = document.createElement('span');
    chip.textContent = '뜻을 맞춰봐';
    chip.style.cssText = `
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 12px; font-weight: 700; color: #fff;
      margin-bottom: 14px;
    `;
    card.appendChild(chip);

    // 이모지
    this.emojiEl = document.createElement('div');
    this.emojiEl.style.cssText = `
      font-size: 4rem;
      line-height: 1;
      margin-bottom: 8px;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
    `;
    card.appendChild(this.emojiEl);

    // 영어 단어
    this.wordEl = document.createElement('div');
    this.wordEl.style.cssText = `
      font-size: 2.2rem;
      font-weight: 900;
      color: #fff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.25);
      letter-spacing: 2px;
      margin-bottom: 12px;
    `;
    card.appendChild(this.wordEl);

    // "다시 듣기" 버튼
    const replayBtn = document.createElement('button');
    replayBtn.className = 'eng-replay-btn';
    replayBtn.innerHTML = '🔊 다시 듣기';
    replayBtn.style.cssText = `
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 8px 18px;
      color: #fff; font-size: 13px; font-weight: 700;
      cursor: pointer; touch-action: manipulation;
      display: inline-flex; align-items: center; gap: 6px;
    `;
    replayBtn.addEventListener('pointerdown', () => {
      const word = (this.wordEl as HTMLElement).textContent ?? '';
      if (word && 'speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(word);
        utt.lang = 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
      }
    });
    card.appendChild(replayBtn);
    this.el.appendChild(card);

    // ── 보기 2×2 그리드 ────────────────────────────────────────────────────────
    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 0 20px;
      flex: 1;
      align-content: start;
    `;
    this.el.appendChild(this.choicesEl);

    // ── 진행 도트 행 ───────────────────────────────────────────────────────────
    const dotRowEl = document.createElement('div');
    dotRowEl.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 12px 20px 24px;
      flex-shrink: 0;
      margin-top: auto;
    `;

    this.scoreLabelEl = document.createElement('span');
    this.scoreLabelEl.style.cssText = `
      color: rgba(255,255,255,0.85);
      font-size: 11px; font-weight: 800;
      margin-right: 8px; flex-shrink: 0;
    `;
    this.scoreLabelEl.textContent = '0 / 10';
    dotRowEl.appendChild(this.scoreLabelEl);

    const dotsWrap = document.createElement('div');
    dotsWrap.style.cssText = 'display: flex; gap: 5px;';
    this.dotEls = [];
    for (let i = 0; i < 10; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 10px; height: 10px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        transition: background 200ms;
        flex-shrink: 0;
      `;
      this.dotEls.push(dot);
      dotsWrap.appendChild(dot);
    }
    dotRowEl.appendChild(dotsWrap);
    this.el.appendChild(dotRowEl);
  }

  private renderQuestion(): void {
    if (!this.session || !this.wordEl || !this.choicesEl) return;
    const total = this.session.totalCount;

    if (this.currentIdx >= total) {
      this.showScore();
      return;
    }

    const q = this.session.questions[this.currentIdx];
    this.isProcessing = false;

    if (this.progressLabel) {
      this.progressLabel.textContent = `${this.currentIdx + 1}/${total}`;
    }
    if (this.progressFill) {
      this.progressFill.style.width = `${(this.currentIdx / total) * 100}%`;
    }

    this.wordEl.textContent = q.word.english;
    this.wordEl.style.animation = 'none';
    void this.wordEl.offsetWidth;
    this.wordEl.style.animation = 'eg-word-enter 250ms ease-out';

    if (this.emojiEl) {
      this.emojiEl.textContent = q.word.emoji ?? '';
    }

    // 진행 도트 업데이트
    this.dotEls.forEach((dot, i) => {
      if (i < this.currentIdx) {
        dot.style.background = this._correctHistory[i]
          ? '#FDE68A'
          : 'rgba(239,68,68,0.5)';
      } else {
        dot.style.background = 'rgba(255,255,255,0.2)';
      }
    });

    if (this.scoreLabelEl) {
      this.scoreLabelEl.textContent = `${this.correctCount} / ${total}`;
    }

    this.choicesEl.innerHTML = '';
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      // .eng-choice-btn 클래스명 유지 (테스트 호환)
      btn.className = 'eng-choice-btn';
      btn.textContent = choice;
      btn.dataset['idx'] = String(idx);
      btn.style.cssText = `
        padding: 18px 12px;
        border-radius: 18px;
        border: 2px solid rgba(255,255,255,0.28);
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(8px);
        font-size: 1.05rem;
        font-weight: 700;
        color: #fff;
        cursor: pointer;
        text-align: center;
        transition: background 150ms ease;
        touch-action: manipulation;
      `;
      btn.addEventListener('pointerdown', () => this.onChoice(idx, q));
      this.choicesEl!.appendChild(btn);
    });
  }

  private onChoice(selectedIdx: number, q: EnglishQuizQuestion): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const isCorrect = selectedIdx === q.correctIdx;
    const buttons = Array.from(this.choicesEl!.querySelectorAll('.eng-choice-btn')) as HTMLButtonElement[];
    buttons.forEach(b => (b.style.pointerEvents = 'none'));

    const correctBtn = buttons[q.correctIdx];

    // 정답 여부 기록
    this._correctHistory[this.currentIdx] = isCorrect;

    if (isCorrect) {
      correctBtn.style.background = 'rgba(16,185,129,0.55)';
      correctBtn.style.borderColor = '#10B981';
      correctBtn.style.boxShadow = '0 0 20px rgba(16,185,129,0.55)';
      correctBtn.style.animation = 'eg-correct-flash 300ms ease';
      this.correctCount++;
      this.pendingTimer = setTimeout(() => {
        this.currentIdx++;
        this.renderQuestion();
      }, 400);
    } else {
      const selectedBtn = buttons[selectedIdx];
      if (selectedBtn) {
        selectedBtn.style.background = 'rgba(239,68,68,0.50)';
        selectedBtn.style.borderColor = '#EF4444';
        selectedBtn.style.animation = 'eg-shake 350ms ease';
      }
      correctBtn.style.background = 'rgba(16,185,129,0.55)';
      correctBtn.style.borderColor = '#10B981';
      this.pendingTimer = setTimeout(() => {
        this.currentIdx++;
        this.renderQuestion();
      }, 1000);
    }
  }

  private showScore(): void {
    const total = this.session?.totalCount ?? 10;
    const pct = Math.round((this.correctCount / total) * 100);
    const msg = pct >= 80 ? '훌륭해요!' : pct >= 50 ? '잘 했어요!' : '더 연습해봐요!';

    this.el.innerHTML = '';
    this.el.style.alignItems = 'center';
    this.el.style.justifyContent = 'center';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: 32px 24px;
      gap: 16px;
    `;

    const badge = document.createElement('div');
    badge.style.cssText = `
      background: rgba(255,255,255,0.18);
      border: 2px solid rgba(255,255,255,0.30);
      backdrop-filter: blur(12px);
      border-radius: 32px;
      padding: 40px 48px;
      text-align: center;
      width: 100%;
      box-shadow: 0 8px 32px rgba(6,95,70,0.45);
      animation: eg-score-pop 500ms cubic-bezier(0.34,1.56,0.64,1) both;
    `;
    badge.innerHTML = `
      <div style="font-size:1rem;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:2px;margin-bottom:8px;">최종 점수</div>
      <div style="font-size:3.5rem;font-weight:900;color:#FDE68A;line-height:1;text-shadow:0 4px 16px rgba(0,0,0,0.25);">${this.correctCount} / ${total}</div>
      <div style="font-size:1.1rem;font-weight:700;color:#fff;margin-top:10px;">${pct}% 정답 — ${msg}</div>
    `;

    const homeBtn = document.createElement('button');
    homeBtn.textContent = '영어 메뉴로 돌아가기';
    homeBtn.style.cssText = `
      width: 100%;
      padding: 18px;
      border-radius: 18px;
      border: none;
      font-size: 1.1rem;
      font-weight: 800;
      background: #fff;
      color: #065F46;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(255,255,255,0.30);
      transition: transform 100ms ease;
      touch-action: manipulation;
    `;
    homeBtn.addEventListener('pointerdown', () => {
      appRouter.navigate({ to: 'english-menu', subject: 'english', replace: true });
    });

    const retryBtn = document.createElement('button');
    retryBtn.textContent = '다시 도전하기';
    retryBtn.style.cssText = `
      width: 100%;
      padding: 18px;
      border-radius: 18px;
      border: 1.5px solid rgba(255,255,255,0.30);
      font-size: 1.1rem;
      font-weight: 800;
      background: rgba(255,255,255,0.15);
      color: #fff;
      cursor: pointer;
      transition: transform 100ms ease;
      touch-action: manipulation;
    `;
    retryBtn.addEventListener('pointerdown', () => this.show());

    overlay.appendChild(badge);
    overlay.appendChild(homeBtn);
    overlay.appendChild(retryBtn);
    this.el.appendChild(overlay);
  }
}
