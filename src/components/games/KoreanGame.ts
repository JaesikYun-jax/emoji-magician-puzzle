import { appRouter } from '../../router/AppRouter';
import { buildKoreanSession } from '../../game-data/koreanSyllables';
import type { SyllableQuestion } from '../../game-data/koreanSyllables';

const STYLE_ID = 'korean-game-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes kr-correct-pop {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.12); }
      100% { transform: scale(1); }
    }
    @keyframes kr-shake {
      0%, 100% { transform: translateX(0); }
      25%       { transform: translateX(-8px); }
      75%       { transform: translateX(8px); }
    }
    @keyframes kr-blank-fill {
      from { transform: scale(0) rotate(-15deg); opacity: 0; }
      70%  { transform: scale(1.1) rotate(3deg); opacity: 1; }
      to   { transform: scale(1) rotate(0); opacity: 1; }
    }
    @keyframes kr-result-in {
      from { opacity: 0; transform: scale(0.85); }
      to   { opacity: 1; transform: scale(1); }
    }
    .kr-choice-btn:active { transform: scale(0.94) !important; transition: transform 80ms !important; }
  `;
  document.head.appendChild(style);
}

export class KoreanGame {
  private el: HTMLElement;
  private session: SyllableQuestion[] = [];
  private currentIdx = 0;
  private correctCount = 0;
  private isProcessing = false;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  private progressFillEl: HTMLElement | null = null;
  private progressLabelEl: HTMLElement | null = null;
  private blankCardEl: HTMLElement | null = null;
  private resultCardEl: HTMLElement | null = null;
  private hintTextEl: HTMLElement | null = null;
  private choicesEl: HTMLElement | null = null;
  private exWordRowEl: HTMLElement | null = null;
  private listenBtnEl: HTMLButtonElement | null = null;
  private givenCardEl: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'korean-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: linear-gradient(165deg, #9F1239 0%, #F43F5E 55%, #FB7185 100%);
      flex-direction: column;
      align-items: center;
      z-index: 20;
      overflow: hidden;
      overflow-y: auto;
    `;
    container.appendChild(this.el);
    injectStyles();
  }

  show(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this.session = buildKoreanSession(10);
    this.currentIdx = 0;
    this.correctCount = 0;
    this.isProcessing = false;
    this._buildUI();
    this.el.style.display = 'flex';
    this._renderQuestion();
  }

  hide(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this.el.style.display = 'none';
    this.el.innerHTML = '';
    this.progressFillEl = null;
    this.progressLabelEl = null;
    this.blankCardEl = null;
    this.resultCardEl = null;
    this.hintTextEl = null;
    this.choicesEl = null;
    this.exWordRowEl = null;
    this.listenBtnEl = null;
    this.givenCardEl = null;
    this.session = [];
  }

  private _buildUI(): void {
    this.el.innerHTML = '';

    // HUD pill bar
    const hudWrap = document.createElement('div');
    hudWrap.style.cssText = `
      flex-shrink: 0;
      width: 100%;
      max-width: 480px;
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
    backBtn.className = 'game-exit-btn';
    backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10l6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    backBtn.addEventListener('pointerdown', () => appRouter.back());
    pill.appendChild(backBtn);

    const progressTrack = document.createElement('div');
    progressTrack.style.cssText = `
      flex: 1; height: 6px;
      background: rgba(255,255,255,0.15);
      border-radius: 999px; overflow: hidden;
    `;
    this.progressFillEl = document.createElement('div');
    this.progressFillEl.style.cssText = `
      height: 100%; background: #FDE68A;
      border-radius: 999px;
      transition: width 350ms ease; width: 0%;
    `;
    progressTrack.appendChild(this.progressFillEl);
    pill.appendChild(progressTrack);

    this.progressLabelEl = document.createElement('div');
    this.progressLabelEl.style.cssText = `
      font-weight: 800; font-size: 14px;
      color: #FDE68A; flex-shrink: 0;
    `;
    pill.appendChild(this.progressLabelEl);

    hudWrap.appendChild(pill);
    this.el.appendChild(hudWrap);

    // 문제 카드
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.15);
      border: 1.5px solid rgba(255,255,255,0.28);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-radius: 26px;
      padding: 24px 20px;
      width: calc(100vw - 44px); max-width: 420px;
      box-sizing: border-box;
      flex-shrink: 0;
      box-shadow: 0 10px 30px rgba(159,18,57,0.40);
      text-align: center;
    `;

    const chip = document.createElement('span');
    chip.textContent = '소리를 만들어 봐';
    chip.style.cssText = `
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 12px; font-weight: 700; color: #fff;
      margin-bottom: 12px;
    `;
    card.appendChild(chip);

    this.hintTextEl = document.createElement('div');
    this.hintTextEl.style.cssText = `
      font-size: 13px; font-weight: 700;
      color: rgba(255,255,255,0.80);
      margin-bottom: 18px;
    `;
    card.appendChild(this.hintTextEl);

    // 조합 행: [given] + [blank?] = [result]
    const comboRow = document.createElement('div');
    comboRow.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    `;

    this.givenCardEl = document.createElement('div');
    this.givenCardEl.style.cssText = `
      width: 82px; height: 82px;
      border-radius: 22px;
      background: #FFE4E6;
      display: grid; place-items: center;
      font-size: 2.6rem; font-weight: 900;
      color: #9F1239;
      box-shadow: 0 6px 16px rgba(0,0,0,0.15);
      flex-shrink: 0;
    `;
    comboRow.appendChild(this.givenCardEl);

    const plusEl = document.createElement('span');
    plusEl.textContent = '+';
    plusEl.style.cssText = `font-size: 1.6rem; font-weight: 900; color: rgba(255,255,255,0.65); flex-shrink: 0;`;
    comboRow.appendChild(plusEl);

    this.blankCardEl = document.createElement('div');
    this.blankCardEl.style.cssText = `
      width: 82px; height: 82px;
      border-radius: 22px;
      background: transparent;
      border: 2.5px dashed rgba(253,230,138,0.85);
      display: grid; place-items: center;
      font-size: 2.4rem; font-weight: 900;
      color: #FDE68A;
      flex-shrink: 0;
    `;
    this.blankCardEl.textContent = '?';
    comboRow.appendChild(this.blankCardEl);

    const eqEl = document.createElement('span');
    eqEl.textContent = '=';
    eqEl.style.cssText = `font-size: 1.6rem; font-weight: 900; color: rgba(255,255,255,0.65); flex-shrink: 0;`;
    comboRow.appendChild(eqEl);

    this.resultCardEl = document.createElement('div');
    this.resultCardEl.style.cssText = `
      width: 82px; height: 82px;
      border-radius: 22px;
      background: rgba(253,230,138,0.20);
      border: 1.5px solid rgba(253,230,138,0.50);
      display: grid; place-items: center;
      font-size: 2.6rem; font-weight: 900;
      color: rgba(253,230,138,0.80);
      flex-shrink: 0;
      transition: background 300ms, box-shadow 300ms;
    `;
    comboRow.appendChild(this.resultCardEl);

    card.appendChild(comboRow);

    this.listenBtnEl = document.createElement('button');
    this.listenBtnEl.innerHTML = '🔊 듣기';
    this.listenBtnEl.style.cssText = `
      margin-top: 16px;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 8px 18px;
      color: #fff; font-size: 13px; font-weight: 700;
      cursor: pointer; touch-action: manipulation;
      display: inline-flex; align-items: center; gap: 6px;
    `;
    this.listenBtnEl.addEventListener('pointerdown', () => this._speak());
    card.appendChild(this.listenBtnEl);

    this.el.appendChild(card);

    // 선택지 1x4 그리드
    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      width: calc(100vw - 44px); max-width: 420px;
      margin-top: 14px;
      flex-shrink: 0;
      box-sizing: border-box;
    `;
    this.el.appendChild(this.choicesEl);

    // 예시 단어 chips
    this.exWordRowEl = document.createElement('div');
    this.exWordRowEl.style.cssText = `
      display: flex; gap: 8px; flex-wrap: wrap;
      justify-content: center;
      margin-top: 12px;
      width: calc(100vw - 44px); max-width: 420px;
      flex-shrink: 0;
    `;
    this.el.appendChild(this.exWordRowEl);
  }

  private _renderQuestion(): void {
    const total = this.session.length;

    if (this.currentIdx >= total) {
      this._showScore();
      return;
    }

    const q = this.session[this.currentIdx];
    this.isProcessing = false;

    if (this.progressFillEl) {
      this.progressFillEl.style.width = `${(this.currentIdx / total) * 100}%`;
    }
    if (this.progressLabelEl) {
      this.progressLabelEl.textContent = `${this.currentIdx + 1}/${total}`;
    }

    if (this.hintTextEl) this.hintTextEl.textContent = q.hint;

    if (this.givenCardEl) this.givenCardEl.textContent = q.given;

    if (this.blankCardEl) {
      this.blankCardEl.textContent = '?';
      this.blankCardEl.style.background = 'transparent';
      this.blankCardEl.style.border = '2.5px dashed rgba(253,230,138,0.85)';
      this.blankCardEl.style.color = '#FDE68A';
      this.blankCardEl.style.animation = '';
    }

    if (this.resultCardEl) {
      this.resultCardEl.textContent = q.result;
      this.resultCardEl.style.background = 'rgba(253,230,138,0.20)';
      this.resultCardEl.style.boxShadow = 'none';
      this.resultCardEl.style.color = 'rgba(253,230,138,0.80)';
    }

    if (this.choicesEl) {
      this.choicesEl.innerHTML = '';
      const choices = this._shuffle([q.blank, ...q.distractors]);
      choices.forEach(jamo => {
        const btn = document.createElement('button');
        btn.className = 'kr-choice-btn';
        btn.textContent = jamo;
        btn.style.cssText = `
          aspect-ratio: 1/1;
          min-height: 72px;
          background: rgba(255,255,255,0.18);
          border: 2px solid rgba(255,255,255,0.30);
          border-radius: 22px;
          display: grid; place-items: center;
          font-size: 1.8rem; font-weight: 900;
          color: #fff;
          cursor: pointer;
          touch-action: manipulation;
          transition: background 120ms, border-color 120ms;
          backdrop-filter: blur(8px);
        `;
        btn.addEventListener('pointerdown', () => this._onChoice(jamo, q));
        this.choicesEl!.appendChild(btn);
      });
    }

    if (this.exWordRowEl) {
      this.exWordRowEl.innerHTML = '';
      q.exampleWords.slice(0, 4).forEach(word => {
        const chip = document.createElement('span');
        chip.textContent = word;
        chip.style.cssText = `
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 13px; font-weight: 700; color: #fff;
          flex-shrink: 0;
        `;
        this.exWordRowEl!.appendChild(chip);
      });
    }
  }

  private _onChoice(selected: string, q: SyllableQuestion): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const isCorrect = selected === q.blank;
    const buttons = Array.from(this.choicesEl!.querySelectorAll('.kr-choice-btn')) as HTMLButtonElement[];
    buttons.forEach(b => { b.style.pointerEvents = 'none'; });

    if (isCorrect) {
      const correctBtn = buttons.find(b => b.textContent === q.blank);
      if (correctBtn) {
        correctBtn.style.background = '#FDE68A';
        correctBtn.style.borderColor = '#F59E0B';
        correctBtn.style.color = '#9F1239';
        correctBtn.style.boxShadow = '0 0 20px rgba(253,230,138,0.55)';
        correctBtn.style.animation = 'kr-correct-pop 300ms ease';
      }
      if (this.blankCardEl) {
        this.blankCardEl.textContent = q.blank;
        this.blankCardEl.style.background = '#FDE68A';
        this.blankCardEl.style.border = '2px solid #F59E0B';
        this.blankCardEl.style.color = '#9F1239';
        this.blankCardEl.style.animation = 'kr-blank-fill 300ms ease';
      }
      if (this.resultCardEl) {
        this.resultCardEl.style.background = 'rgba(253,230,138,0.35)';
        this.resultCardEl.style.color = '#FDE68A';
        this.resultCardEl.style.boxShadow = '0 0 24px rgba(253,230,138,0.65)';
      }
      this.correctCount++;
      this._speak();
      this.pendingTimer = setTimeout(() => {
        this.currentIdx++;
        this._renderQuestion();
      }, 700);
    } else {
      const wrongBtn = buttons.find(b => b.textContent === selected);
      if (wrongBtn) {
        wrongBtn.style.background = 'rgba(239,68,68,0.50)';
        wrongBtn.style.borderColor = '#EF4444';
        wrongBtn.style.animation = 'kr-shake 350ms ease';
      }
      const correctBtn = buttons.find(b => b.textContent === q.blank);
      if (correctBtn) {
        correctBtn.style.background = 'rgba(16,185,129,0.55)';
        correctBtn.style.borderColor = '#10B981';
      }
      this.pendingTimer = setTimeout(() => {
        this.currentIdx++;
        this._renderQuestion();
      }, 1200);
    }
  }

  private _speak(): void {
    if (!('speechSynthesis' in window)) return;
    const q = this.session[this.currentIdx];
    if (!q) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(q.result);
    utt.lang = 'ko-KR';
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  }

  private _showScore(): void {
    const total = this.session.length;
    const pct = Math.round((this.correctCount / total) * 100);
    const msg = pct >= 80 ? '훌륭해요! 🎉' : pct >= 50 ? '잘 했어요! 👍' : '더 연습해봐요! 💪';

    this.el.innerHTML = '';
    this.el.style.alignItems = 'center';
    this.el.style.justifyContent = 'center';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      display: flex; flex-direction: column; align-items: center;
      width: 100%; padding: 32px 24px; gap: 16px;
      animation: kr-result-in 400ms cubic-bezier(0.34,1.56,0.64,1);
    `;

    const badge = document.createElement('div');
    badge.style.cssText = `
      background: rgba(255,255,255,0.16);
      border: 1.5px solid rgba(255,255,255,0.28);
      backdrop-filter: blur(14px);
      border-radius: 28px;
      padding: 36px 44px;
      text-align: center; width: 100%;
      box-shadow: 0 8px 32px rgba(159,18,57,0.40);
    `;
    badge.innerHTML = `
      <div style="font-size:1rem;font-weight:700;color:rgba(255,255,255,0.8);letter-spacing:2px;margin-bottom:8px;">국어 결과</div>
      <div style="font-size:3.5rem;font-weight:900;color:#FDE68A;line-height:1;">${this.correctCount}<span style="font-size:1.4rem;opacity:0.7"> / ${total}</span></div>
      <div style="font-size:1.1rem;font-weight:700;color:#fff;margin-top:10px;">${pct}% 정답 — ${msg}</div>
    `;
    overlay.appendChild(badge);

    const retryBtn = document.createElement('button');
    retryBtn.textContent = '다시 하기';
    retryBtn.className = 'result-btn result-btn--primary';
    retryBtn.addEventListener('pointerdown', () => {
      this.show();
    });
    overlay.appendChild(retryBtn);

    const backBtn = document.createElement('button');
    backBtn.textContent = '국어 메뉴로';
    backBtn.className = 'result-btn result-btn--ghost';
    backBtn.addEventListener('pointerdown', () => appRouter.back());
    overlay.appendChild(backBtn);

    this.el.appendChild(overlay);
  }

  private _shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
