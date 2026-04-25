import { appRouter } from '../../router/AppRouter';
import { ENGLISH_WORDS, getWordsByDifficulty } from '../../game-data/englishWords';
import { buildQuizSession } from '../../systems/english/englishGameEngine';
import type { EnglishQuizSession, EnglishQuizQuestion, QuestionType } from '../../systems/english/englishGameEngine';
import type { WordEntry } from '../../game-data/englishWords';

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
    @keyframes eg-wrong-slide {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .eng-choice-btn:active { transform: scale(0.95); transition: transform 100ms; }

    /* 이모지 플립 카드 */
    .eg-emoji-flipcard {
      width: 72px; height: 72px;
      perspective: 600px;
      cursor: pointer;
      margin: 0 auto 10px;
      flex-shrink: 0;
    }
    .eg-emoji-inner {
      width: 100%; height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 420ms cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 18px;
    }
    .eg-emoji-flipcard.flipped .eg-emoji-inner {
      transform: rotateY(180deg);
    }
    .eg-emoji-front, .eg-emoji-back {
      position: absolute; inset: 0;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
    }
    .eg-emoji-front {
      background: rgba(255,255,255,0.18);
      border: 2px solid rgba(255,255,255,0.32);
      font-size: 1.4rem; color: rgba(255,255,255,0.9);
      flex-direction: column; gap: 2px;
    }
    .eg-emoji-front-label {
      font-size: 9px; font-weight: 800;
      letter-spacing: 0.08em; color: rgba(255,255,255,0.65);
      text-transform: uppercase;
    }
    .eg-emoji-back {
      background: rgba(255,255,255,0.12);
      border: 2px solid rgba(255,255,255,0.28);
      font-size: 3rem;
      transform: rotateY(180deg);
    }
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
  private _currentDifficulty: string = 'beginner';

  private wordEl: HTMLElement | null = null;
  private choicesEl: HTMLElement | null = null;
  private progressFill: HTMLElement | null = null;
  private progressLabel: HTMLElement | null = null;
  private emojiFlipcard: HTMLElement | null = null;
  private combo = 0;
  private dotEls: HTMLElement[] = [];
  private scoreLabelEl: HTMLElement | null = null;
  private _correctHistory: boolean[] = [];
  private _wrongQuestions: Array<{ word: WordEntry; questionType: QuestionType }> = [];
  private chipEl: HTMLElement | null = null;
  private replayBtnEl: HTMLButtonElement | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
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
    this._currentDifficulty = difficulty ?? this._currentDifficulty ?? 'beginner';
    const diff = this._currentDifficulty as 'beginner' | 'elementary' | 'intermediate' | 'advanced';
    let words = getWordsByDifficulty(diff);
    if (words.length < 4) {
      words = ENGLISH_WORDS;
    }
    this.session = buildQuizSession(words, 10);
    this.currentIdx = 0;
    this.correctCount = 0;
    this.isProcessing = false;
    this._correctHistory = [];
    this._wrongQuestions = [];
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
    this.emojiFlipcard = null;
    this.chipEl = null;
    this.replayBtnEl = null;
    this.dotEls = [];
    this.scoreLabelEl = null;
    this.combo = 0;
    this._correctHistory = [];
    this._wrongQuestions = [];
    this.session = null;
  }

  private buildLayout(): void {
    this.el.innerHTML = '';

    // ── HUD ─────────────────────────────────────────────────────────────────
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

    // ── 단어 카드 ────────────────────────────────────────────────────────────
    const card = document.createElement('div');
    card.className = 'eng-card';
    card.style.cssText = `
      margin: 12px 20px;
      padding: 20px 20px 18px;
      border-radius: 24px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(6,95,70,0.45);
      text-align: center;
      flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center;
    `;

    // chip (방향 표시)
    this.chipEl = document.createElement('span');
    this.chipEl.style.cssText = `
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 12px; font-weight: 700; color: #fff;
      margin-bottom: 12px;
    `;
    card.appendChild(this.chipEl);

    // 이모지 플립 카드
    this.emojiFlipcard = document.createElement('div');
    this.emojiFlipcard.className = 'eg-emoji-flipcard';
    const inner = document.createElement('div');
    inner.className = 'eg-emoji-inner';
    const front = document.createElement('div');
    front.className = 'eg-emoji-front';
    front.innerHTML = `<span>🎴</span><span class="eg-emoji-front-label">HINT</span>`;
    const back = document.createElement('div');
    back.className = 'eg-emoji-back eg-emoji-back-content';
    inner.appendChild(front);
    inner.appendChild(back);
    this.emojiFlipcard.appendChild(inner);
    this.emojiFlipcard.addEventListener('pointerdown', () => {
      this.emojiFlipcard?.classList.toggle('flipped');
    });
    card.appendChild(this.emojiFlipcard);

    // 메인 단어
    this.wordEl = document.createElement('div');
    this.wordEl.style.cssText = `
      font-size: 2.2rem;
      font-weight: 900;
      color: #fff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.25);
      letter-spacing: 2px;
      margin: 8px 0 10px;
      line-height: 1.2;
    `;
    card.appendChild(this.wordEl);

    // TTS 버튼 (영→한 문제일 때만 표시)
    this.replayBtnEl = document.createElement('button');
    this.replayBtnEl.className = 'eng-replay-btn';
    this.replayBtnEl.innerHTML = '🔊 듣기';
    this.replayBtnEl.style.cssText = `
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 6px 16px;
      color: #fff; font-size: 13px; font-weight: 700;
      cursor: pointer; touch-action: manipulation;
      display: inline-flex; align-items: center; gap: 6px;
    `;
    this.replayBtnEl.addEventListener('pointerdown', () => {
      if (!this.session) return;
      const q = this.session.questions[this.currentIdx];
      if (!q || q.questionType !== 'en-to-ko') return;
      const word = q.word.english;
      if (word && 'speechSynthesis' in window) {
        const utt = new SpeechSynthesisUtterance(word);
        utt.lang = 'en-US';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
      }
    });
    card.appendChild(this.replayBtnEl);
    this.el.appendChild(card);

    // ── 보기 2×2 그리드 ──────────────────────────────────────────────────────
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

    // ── 진행 도트 행 ─────────────────────────────────────────────────────────
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

    // 진행 표시
    if (this.progressLabel) {
      this.progressLabel.textContent = `${this.currentIdx + 1}/${total}`;
    }
    if (this.progressFill) {
      this.progressFill.style.width = `${(this.currentIdx / total) * 100}%`;
    }

    // 이모지 플립 카드 리셋 (문제마다 가려진 상태로)
    if (this.emojiFlipcard) {
      this.emojiFlipcard.classList.remove('flipped');
      const backEl = this.emojiFlipcard.querySelector('.eg-emoji-back-content') as HTMLElement | null;
      if (backEl) backEl.textContent = q.word.emoji ?? '';
    }

    // 칩 방향 표시 + 단어 표시
    if (q.questionType === 'en-to-ko') {
      if (this.chipEl) this.chipEl.textContent = '영어 → 한글';
      this.wordEl.textContent = q.word.english;
      this.wordEl.style.letterSpacing = '2px';
      if (this.replayBtnEl) this.replayBtnEl.style.display = 'inline-flex';
    } else {
      if (this.chipEl) this.chipEl.textContent = '한글 → 영어';
      this.wordEl.textContent = q.word.korean;
      this.wordEl.style.letterSpacing = '0px';
      if (this.replayBtnEl) this.replayBtnEl.style.display = 'none';
    }

    // 입장 애니메이션
    this.wordEl.style.animation = 'none';
    void this.wordEl.offsetWidth;
    this.wordEl.style.animation = 'eg-word-enter 250ms ease-out';

    // 진행 도트
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

    // 선택지 렌더
    this.choicesEl.innerHTML = '';
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
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

    this._correctHistory[this.currentIdx] = isCorrect;

    if (!isCorrect) {
      this._wrongQuestions.push({ word: q.word, questionType: q.questionType });
    }

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
    const msg = pct >= 80 ? '훌륭해요! 🎉' : pct >= 50 ? '잘 했어요! 👍' : '더 연습해봐요! 💪';

    this.el.innerHTML = '';
    this.el.style.alignItems = 'center';
    this.el.style.justifyContent = 'flex-start';
    this.el.style.overflowY = 'auto';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      padding: calc(env(safe-area-inset-top, 0px) + 32px) 24px calc(env(safe-area-inset-bottom, 0px) + 24px);
      gap: 16px;
      box-sizing: border-box;
      min-height: 100%;
    `;

    // 점수 뱃지
    const badge = document.createElement('div');
    badge.style.cssText = `
      background: rgba(255,255,255,0.18);
      border: 2px solid rgba(255,255,255,0.30);
      backdrop-filter: blur(12px);
      border-radius: 32px;
      padding: 32px 40px;
      text-align: center;
      width: 100%;
      box-shadow: 0 8px 32px rgba(6,95,70,0.45);
      animation: eg-score-pop 500ms cubic-bezier(0.34,1.56,0.64,1) both;
      box-sizing: border-box;
    `;
    badge.innerHTML = `
      <div style="font-size:0.85rem;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:2px;margin-bottom:6px;text-transform:uppercase;">최종 점수</div>
      <div style="font-size:3.2rem;font-weight:900;color:#FDE68A;line-height:1;text-shadow:0 4px 16px rgba(0,0,0,0.25);">${this.correctCount} / ${total}</div>
      <div style="font-size:1rem;font-weight:700;color:#fff;margin-top:8px;">${pct}% 정답 — ${msg}</div>
    `;
    overlay.appendChild(badge);

    // 틀린 문제 요약 섹션
    if (this._wrongQuestions.length > 0) {
      const summaryCard = document.createElement('div');
      summaryCard.style.cssText = `
        background: rgba(239,68,68,0.12);
        border: 1.5px solid rgba(239,68,68,0.30);
        backdrop-filter: blur(12px);
        border-radius: 24px;
        padding: 20px;
        width: 100%;
        box-sizing: border-box;
      `;

      const summaryTitle = document.createElement('div');
      summaryTitle.style.cssText = `
        font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.75);
        letter-spacing: 0.12em; text-transform: uppercase;
        margin-bottom: 14px;
        display: flex; align-items: center; gap: 6px;
      `;
      summaryTitle.innerHTML = `<span>❌</span> 틀린 문제 복습 (${this._wrongQuestions.length}개)`;
      summaryCard.appendChild(summaryTitle);

      this._wrongQuestions.forEach((item, i) => {
        const row = document.createElement('div');
        row.style.cssText = `
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px;
          background: rgba(255,255,255,0.10);
          border-radius: 14px;
          margin-bottom: ${i < this._wrongQuestions.length - 1 ? '8px' : '0'};
          animation: eg-wrong-slide 300ms ${i * 60}ms ease both;
        `;

        const emojiSpan = document.createElement('span');
        emojiSpan.style.cssText = 'font-size: 1.8rem; flex-shrink: 0; line-height: 1;';
        emojiSpan.textContent = item.word.emoji ?? '❓';
        row.appendChild(emojiSpan);

        const info = document.createElement('div');
        info.style.cssText = 'flex: 1; min-width: 0;';

        const dirLabel = document.createElement('div');
        dirLabel.style.cssText = `
          font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.55);
          letter-spacing: 0.08em; margin-bottom: 2px;
        `;
        dirLabel.textContent = item.questionType === 'en-to-ko' ? '영어 → 한글' : '한글 → 영어';
        info.appendChild(dirLabel);

        const wordLine = document.createElement('div');
        wordLine.style.cssText = `
          font-size: 1rem; font-weight: 800; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        `;
        wordLine.textContent = `${item.word.english} = ${item.word.korean}`;
        info.appendChild(wordLine);

        row.appendChild(info);
        summaryCard.appendChild(row);
      });

      overlay.appendChild(summaryCard);
    }

    // 버튼
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
      box-sizing: border-box;
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
      box-sizing: border-box;
    `;
    retryBtn.addEventListener('pointerdown', () => this.show(this._currentDifficulty));

    overlay.appendChild(homeBtn);
    overlay.appendChild(retryBtn);
    this.el.appendChild(overlay);
  }
}
