import { appRouter } from '../../router/AppRouter';
import {
  buildSpellingSession,
  type SpellingDifficulty,
  type SpellingQuizSession,
  type SpellingQuizQuestion,
} from '../../systems/korean/spellingEngine';
import { SPELLING_QUESTIONS } from '../../game-data/korean/spellingQuestions';

const STYLE_ID = 'ksg-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes ksg-correct-flash {
      0%   { background: rgba(16,185,129,0.60); transform: scale(1.04); }
      100% { background: rgba(255,255,255,0.15); transform: scale(1); }
    }
    @keyframes ksg-shake {
      0%,100% { transform: translateX(0); }
      25%     { transform: translateX(-8px); }
      75%     { transform: translateX(8px); }
    }
    @keyframes ksg-enter {
      from { opacity: 0; transform: translateY(-12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes ksg-score-pop {
      0%   { transform: scale(0.7); opacity: 0; }
      70%  { transform: scale(1.15); }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes ksg-toast-in {
      0%   { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .ksg-choice-btn:active { transform: scale(0.95); transition: transform 100ms; }
  `;
  document.head.appendChild(style);
}

const CATEGORY_LABELS: Record<string, string> = {
  'phoneme':     '자모/받침',
  'common-word': '헷갈리는 단어',
  'spacing':     '띄어쓰기',
  'grammar':     '어법',
  'sai-siot':    '사이시옷',
};

export class KoreanSpellingGame {
  private el: HTMLElement;
  private session: SpellingQuizSession | null = null;
  private currentIdx = 0;
  private correctCount = 0;
  private isProcessing = false;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private _currentDifficulty: SpellingDifficulty = 'beginner';
  private _correctHistory: boolean[] = [];
  private _wrongQuestions: SpellingQuizQuestion[] = [];

  // DOM refs
  private progressFill: HTMLElement | null = null;
  private progressLabel: HTMLElement | null = null;
  private chipEl: HTMLElement | null = null;
  private sentenceEl: HTMLElement | null = null;
  private hintEl: HTMLElement | null = null;
  private choicesEl: HTMLElement | null = null;
  private dotEls: HTMLElement[] = [];
  private scoreLabelEl: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'ksg-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      flex-direction: column;
      background: linear-gradient(160deg, #9F1239 0%, #BE123C 50%, #F43F5E 100%);
      z-index: 10;
      overflow: hidden;
      font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
    `;
    container.appendChild(this.el);
    injectStyles();
  }

  show(difficulty?: SpellingDifficulty): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this._currentDifficulty = difficulty ?? this._currentDifficulty;
    this.session = buildSpellingSession(SPELLING_QUESTIONS, 10, this._currentDifficulty);
    this.currentIdx = 0;
    this.correctCount = 0;
    this.isProcessing = false;
    this._correctHistory = [];
    this._wrongQuestions = [];

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
    this.progressFill = null;
    this.progressLabel = null;
    this.chipEl = null;
    this.sentenceEl = null;
    this.hintEl = null;
    this.choicesEl = null;
    this.dotEls = [];
    this.scoreLabelEl = null;
    this.session = null;
  }

  private buildLayout(): void {
    this.el.innerHTML = '';

    // ── HUD ───────────────────────────────────────────────────────────────────
    const hudEl = document.createElement('div');
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
    backBtn.style.cssText = `
      background: none; border: none; color: #fff; cursor: pointer;
      padding: 4px 6px; display: flex; align-items: center;
    `;
    backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10l6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    backBtn.addEventListener('pointerdown', () => appRouter.back());
    pill.appendChild(backBtn);

    const progressTrack = document.createElement('div');
    progressTrack.style.cssText = `
      flex: 1; height: 6px;
      background: rgba(255,255,255,0.15);
      border-radius: 999px; overflow: hidden;
    `;
    this.progressFill = document.createElement('div');
    this.progressFill.style.cssText = `
      height: 100%;
      background: #FECDD3;
      border-radius: 999px;
      transition: width 350ms ease;
      width: 0%;
    `;
    progressTrack.appendChild(this.progressFill);
    pill.appendChild(progressTrack);

    this.progressLabel = document.createElement('div');
    this.progressLabel.style.cssText = `
      font-weight: 800; font-size: 14px;
      color: #FECDD3; flex-shrink: 0;
    `;
    this.progressLabel.textContent = '0/10';
    pill.appendChild(this.progressLabel);

    hudEl.appendChild(pill);
    this.el.appendChild(hudEl);

    // ── 문제 카드 ──────────────────────────────────────────────────────────────
    const card = document.createElement('div');
    card.style.cssText = `
      margin: 12px 20px;
      padding: 24px 20px 20px;
      border-radius: 24px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(159,18,57,0.45);
      flex-shrink: 0;
      display: flex; flex-direction: column; align-items: center;
      gap: 14px;
    `;

    // 카테고리 칩
    this.chipEl = document.createElement('span');
    this.chipEl.style.cssText = `
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 12px; font-weight: 700; color: #fff;
      align-self: flex-start;
    `;
    card.appendChild(this.chipEl);

    // 문장 (빈칸 포함)
    this.sentenceEl = document.createElement('div');
    this.sentenceEl.style.cssText = `
      font-size: 1.4rem;
      font-weight: 800;
      color: #fff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.25);
      text-align: center;
      line-height: 1.6;
      width: 100%;
    `;
    card.appendChild(this.sentenceEl);

    // 힌트
    this.hintEl = document.createElement('div');
    this.hintEl.style.cssText = `
      font-size: 0.82rem;
      color: rgba(255,255,255,0.70);
      text-align: center;
      min-height: 18px;
    `;
    card.appendChild(this.hintEl);

    this.el.appendChild(card);

    // ── 선택지 2개 ─────────────────────────────────────────────────────────────
    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 0 20px;
      flex-shrink: 0;
    `;
    this.el.appendChild(this.choicesEl);

    // ── 진행 도트 ──────────────────────────────────────────────────────────────
    const dotRowEl = document.createElement('div');
    dotRowEl.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 12px 20px 24px;
      margin-top: auto;
      flex-shrink: 0;
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
    if (!this.session || !this.sentenceEl || !this.choicesEl) return;
    const total = this.session.totalCount;

    if (this.currentIdx >= total) {
      this.showScore();
      return;
    }

    const q = this.session.questions[this.currentIdx];
    this.isProcessing = false;

    // 진행 표시
    if (this.progressLabel) this.progressLabel.textContent = `${this.currentIdx + 1}/${total}`;
    if (this.progressFill) this.progressFill.style.width = `${(this.currentIdx / total) * 100}%`;

    // 카테고리 칩
    if (this.chipEl) {
      this.chipEl.textContent = CATEGORY_LABELS[q.question.category] ?? q.question.category;
    }

    // 문장 — ___ 를 강조 표시 빈칸으로 대체
    this.sentenceEl.innerHTML = q.question.sentence.replace(
      '___',
      `<span style="
        display: inline-block;
        background: rgba(255,255,255,0.30);
        border: 2px dashed rgba(255,255,255,0.55);
        border-radius: 8px;
        padding: 2px 16px;
        min-width: 60px;
        font-style: italic;
        letter-spacing: 2px;
      ">?</span>`,
    );

    // 입장 애니메이션
    this.sentenceEl.style.animation = 'none';
    void this.sentenceEl.offsetWidth;
    this.sentenceEl.style.animation = 'ksg-enter 250ms ease-out';

    // 힌트
    if (this.hintEl) {
      this.hintEl.textContent = q.question.hint ? `💡 ${q.question.hint}` : '';
    }

    // 진행 도트
    this.dotEls.forEach((dot, i) => {
      if (i < this.currentIdx) {
        dot.style.background = this._correctHistory[i] ? '#FECDD3' : 'rgba(239,68,68,0.5)';
      } else {
        dot.style.background = 'rgba(255,255,255,0.2)';
      }
    });

    if (this.scoreLabelEl) this.scoreLabelEl.textContent = `${this.correctCount} / ${total}`;

    // 선택지 렌더
    this.choicesEl.innerHTML = '';
    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.className = 'ksg-choice-btn';
      btn.textContent = choice;
      btn.dataset['idx'] = String(idx);
      if (import.meta.env.DEV && idx === q.correctIdx) {
        btn.dataset['correct'] = 'true';
      }
      btn.style.cssText = `
        padding: 22px 12px;
        border-radius: 18px;
        border: 2px solid rgba(255,255,255,0.28);
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(8px);
        font-size: 1.2rem;
        font-weight: 800;
        color: #fff;
        cursor: pointer;
        text-align: center;
        transition: background 150ms ease;
        touch-action: manipulation;
        font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
      `;
      btn.addEventListener('pointerdown', () => this.onChoice(idx, q));
      this.choicesEl!.appendChild(btn);
    });
  }

  private onChoice(selectedIdx: number, q: SpellingQuizQuestion): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const isCorrect = selectedIdx === q.correctIdx;
    const buttons = Array.from(this.choicesEl!.querySelectorAll('.ksg-choice-btn')) as HTMLButtonElement[];
    buttons.forEach(b => (b.style.pointerEvents = 'none'));

    const correctBtn = buttons[q.correctIdx];
    this._correctHistory[this.currentIdx] = isCorrect;

    if (!isCorrect) {
      this._wrongQuestions.push(q);
    }

    if (isCorrect) {
      correctBtn.style.background = 'rgba(16,185,129,0.60)';
      correctBtn.style.borderColor = '#10B981';
      correctBtn.style.boxShadow = '0 0 20px rgba(16,185,129,0.55)';
      correctBtn.style.animation = 'ksg-correct-flash 300ms ease';
      this.correctCount++;

      // 짧은 풀이 토스트
      this.showToast(q.question.explanation, true);
      this.pendingTimer = setTimeout(() => {
        this.currentIdx++;
        this.renderQuestion();
      }, 900);
    } else {
      const selectedBtn = buttons[selectedIdx];
      if (selectedBtn) {
        selectedBtn.style.background = 'rgba(239,68,68,0.50)';
        selectedBtn.style.borderColor = '#EF4444';
        selectedBtn.style.animation = 'ksg-shake 350ms ease';
      }
      correctBtn.style.background = 'rgba(16,185,129,0.55)';
      correctBtn.style.borderColor = '#10B981';

      this.showToast(q.question.explanation, false);
      this.pendingTimer = setTimeout(() => {
        this.currentIdx++;
        this.renderQuestion();
      }, 2000);
    }
  }

  private showToast(text: string, isCorrect: boolean): void {
    const existing = this.el.querySelector('.ksg-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'ksg-toast';
    toast.style.cssText = `
      position: absolute;
      bottom: 100px;
      left: 20px;
      right: 20px;
      background: ${isCorrect ? 'rgba(16,185,129,0.90)' : 'rgba(30,30,30,0.90)'};
      border: 1px solid ${isCorrect ? '#10B981' : 'rgba(255,255,255,0.15)'};
      border-radius: 14px;
      padding: 12px 16px;
      color: #fff;
      font-size: 0.85rem;
      font-weight: 600;
      line-height: 1.5;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      animation: ksg-toast-in 200ms ease;
      z-index: 99;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    toast.textContent = (isCorrect ? '✅ ' : '📖 ') + text;
    this.el.appendChild(toast);
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
    overlay.dataset['gameResult'] = 'true';
    overlay.dataset['cleared'] = pct >= 50 ? 'true' : 'false';
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
      box-shadow: 0 8px 32px rgba(159,18,57,0.45);
      animation: ksg-score-pop 500ms cubic-bezier(0.34,1.56,0.64,1) both;
      box-sizing: border-box;
    `;
    badge.innerHTML = `
      <div style="font-size:0.85rem;font-weight:700;color:rgba(255,255,255,0.75);letter-spacing:2px;margin-bottom:6px;text-transform:uppercase;">맞춤법 결과</div>
      <div style="font-size:3.2rem;font-weight:900;color:#FECDD3;line-height:1;text-shadow:0 4px 16px rgba(0,0,0,0.25);">${this.correctCount} / ${total}</div>
      <div style="font-size:1rem;font-weight:700;color:#fff;margin-top:8px;">${pct}% 정답 — ${msg}</div>
    `;
    overlay.appendChild(badge);

    // 틀린 문제 복습
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
      `;
      summaryTitle.innerHTML = `❌ 틀린 문제 복습 (${this._wrongQuestions.length}개)`;
      summaryCard.appendChild(summaryTitle);

      this._wrongQuestions.forEach((item, i) => {
        const row = document.createElement('div');
        row.style.cssText = `
          padding: 12px 14px;
          background: rgba(255,255,255,0.10);
          border-radius: 14px;
          margin-bottom: ${i < this._wrongQuestions.length - 1 ? '8px' : '0'};
        `;

        const sentenceDiv = document.createElement('div');
        sentenceDiv.style.cssText = 'color: rgba(255,255,255,0.85); font-size: 0.9rem; font-weight: 700; margin-bottom: 4px;';
        sentenceDiv.textContent = item.question.sentence.replace('___', `[${item.question.correct}]`);
        row.appendChild(sentenceDiv);

        const answerDiv = document.createElement('div');
        answerDiv.style.cssText = 'color: #FECDD3; font-size: 0.8rem; font-weight: 600;';
        answerDiv.textContent = `✓ ${item.question.correct}  ✗ ${item.question.wrong}`;
        row.appendChild(answerDiv);

        const explDiv = document.createElement('div');
        explDiv.style.cssText = 'color: rgba(255,255,255,0.60); font-size: 0.78rem; margin-top: 4px; line-height: 1.5;';
        explDiv.textContent = item.question.explanation;
        row.appendChild(explDiv);

        summaryCard.appendChild(row);
      });

      overlay.appendChild(summaryCard);
    }

    // 버튼
    const homeBtn = document.createElement('button');
    homeBtn.textContent = '국어 메뉴로 돌아가기';
    homeBtn.className = 'result-btn result-btn--primary';
    homeBtn.addEventListener('pointerdown', () => {
      appRouter.navigate({ to: 'korean-menu', subject: 'korean', replace: true });
    });

    const retryBtn = document.createElement('button');
    retryBtn.textContent = '다시 도전하기';
    retryBtn.className = 'result-btn result-btn--ghost';
    retryBtn.addEventListener('pointerdown', () => this.show(this._currentDifficulty));

    overlay.appendChild(homeBtn);
    overlay.appendChild(retryBtn);
    this.el.appendChild(overlay);
  }
}
