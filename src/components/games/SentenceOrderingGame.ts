import { appRouter } from '../../router/AppRouter';
import { t } from '../../i18n';
import { SENTENCE_ORDERING_QUESTIONS } from '../../game-data/sentenceOrderingLevels';
import type { SentenceOrderingQuestion } from '../../game-data/sentenceOrderingLevels';
import {
  buildCardPool,
  validateAnswer,
  computeStars,
} from '../../systems/english/sentenceOrderingEngine';

const STYLE_ID = 'so-game-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes so-slot-fill {
      from { transform: translateY(-14px); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }
    @keyframes so-correct {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.04); filter: brightness(1.3); }
      100% { transform: scale(1); }
    }
    @keyframes so-shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-9px); }
      60%     { transform: translateX(9px); }
    }
    @keyframes so-card-appear {
      from { transform: translateY(18px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    @keyframes star-pop {
      0%  { transform: scale(0) rotate(-30deg); opacity: 0; }
      70% { transform: scale(1.25) rotate(5deg); opacity: 1; }
      100%{ transform: scale(1) rotate(0deg);   opacity: 1; }
    }
    .so-card-btn:active { transform: scale(0.95); transition: transform 100ms; }
  `;
  document.head.appendChild(style);
}

function getFormLabel(form: string): string {
  const key = `english.order.chipLabel.${form}` as Parameters<typeof t>[0];
  return t(key) ?? form;
}

export class SentenceOrderingGame {
  private el: HTMLElement;
  private questions: SentenceOrderingQuestion[] = [];
  private currentIdx = 0;
  private totalMistakes = 0;
  private isProcessing = false;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;

  // 현재 문제 상태
  private selectedWords: string[] = [];
  private cardPool: string[] = [];
  private cardEls: HTMLButtonElement[] = [];
  private slotEls: HTMLElement[] = [];
  private slotPanelEl: HTMLElement | null = null;
  private progressLabel: HTMLElement | null = null;
  private dotEls: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'so-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      flex-direction: column;
      background: linear-gradient(135deg, #065F46, #10B981);
      z-index: 10;
      overflow: hidden;
    `;
    container.appendChild(this.el);
    injectStyles();
  }

  show(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this.questions = [...SENTENCE_ORDERING_QUESTIONS];
    this.currentIdx = 0;
    this.totalMistakes = 0;
    this.isProcessing = false;
    this.selectedWords = [];

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
    this.slotPanelEl = null;
    this.progressLabel = null;
    this.slotEls = [];
    this.cardEls = [];
    this.dotEls = [];
    this.selectedWords = [];
  }

  private buildLayout(): void {
    this.el.innerHTML = '';

    const total = this.questions.length;

    // ── HUD pill ──────────────────────────────────────────────────────────────
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
    backBtn.className = 'game-exit-btn';
    backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M13 4L7 10l6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    backBtn.addEventListener('pointerdown', () => {
      appRouter.navigate({ to: 'english-menu', subject: 'english', replace: true });
    });
    pill.appendChild(backBtn);

    // 진행 도트
    const dotsWrap = document.createElement('div');
    dotsWrap.style.cssText = 'display: flex; gap: 5px; flex: 1; justify-content: center;';
    this.dotEls = [];
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px; height: 8px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        transition: background 200ms;
        flex-shrink: 0;
      `;
      this.dotEls.push(dot);
      dotsWrap.appendChild(dot);
    }
    pill.appendChild(dotsWrap);

    this.progressLabel = document.createElement('div');
    this.progressLabel.style.cssText = `
      font-weight: 800; font-size: 14px;
      color: #FDE68A; flex-shrink: 0;
    `;
    this.progressLabel.textContent = `1/${total}`;
    pill.appendChild(this.progressLabel);

    hudEl.appendChild(pill);
    this.el.appendChild(hudEl);

    // ── 형식 칩 ────────────────────────────────────────────────────────────────
    const chipWrap = document.createElement('div');
    chipWrap.style.cssText = `
      flex-shrink: 0;
      padding: 0 20px 10px;
      text-align: center;
    `;
    const chip = document.createElement('span');
    chip.id = 'so-form-chip';
    chip.style.cssText = `
      display: inline-block;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.28);
      border-radius: 999px;
      padding: 5px 16px;
      font-size: 12px; font-weight: 700; color: #fff;
    `;
    chipWrap.appendChild(chip);
    this.el.appendChild(chipWrap);

    // ── 슬롯 패널 ──────────────────────────────────────────────────────────────
    const slotSection = document.createElement('div');
    slotSection.style.cssText = `
      flex-shrink: 0;
      margin: 0 20px;
      padding: 20px;
      border-radius: 24px;
      background: rgba(255,255,255,0.12);
      border: 1.5px solid rgba(255,255,255,0.22);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px rgba(6,95,70,0.35);
    `;

    this.slotPanelEl = document.createElement('div');
    this.slotPanelEl.id = 'so-slot-panel';
    this.slotPanelEl.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      min-height: 48px;
      align-items: center;
    `;
    slotSection.appendChild(this.slotPanelEl);

    // 힌트 텍스트
    const hintEl = document.createElement('div');
    hintEl.style.cssText = `
      margin-top: 14px;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: rgba(255,255,255,0.6);
    `;
    hintEl.textContent = t('english.order.tapHint');
    slotSection.appendChild(hintEl);

    this.el.appendChild(slotSection);

    // ── 카드 풀 영역 ────────────────────────────────────────────────────────────
    const cardSection = document.createElement('div');
    cardSection.id = 'so-card-section';
    cardSection.style.cssText = `
      flex: 1;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 20px;
      align-content: flex-start;
      justify-content: center;
      overflow-y: auto;
    `;
    this.el.appendChild(cardSection);
  }

  private renderQuestion(): void {
    const total = this.questions.length;
    if (this.currentIdx >= total) {
      this.showScore();
      return;
    }

    const q = this.questions[this.currentIdx];
    this.isProcessing = false;
    this.selectedWords = [];
    this.cardPool = buildCardPool(q);
    this.slotEls = [];
    this.cardEls = [];

    // 진행 표시 업데이트
    if (this.progressLabel) {
      this.progressLabel.textContent = `${this.currentIdx + 1}/${total}`;
    }
    this.dotEls.forEach((dot, i) => {
      if (i < this.currentIdx) {
        dot.style.background = '#FDE68A';
      } else if (i === this.currentIdx) {
        dot.style.background = 'rgba(255,255,255,0.7)';
      } else {
        dot.style.background = 'rgba(255,255,255,0.2)';
      }
    });

    // 형식 칩 업데이트
    const chipEl = document.getElementById('so-form-chip');
    if (chipEl) chipEl.textContent = getFormLabel(q.form);

    // 슬롯 렌더
    if (!this.slotPanelEl) return;
    this.slotPanelEl.innerHTML = '';

    let fillableIdx = 0; // 빈 슬롯 중 채워질 순서 인덱스
    q.slots.forEach((slot) => {
      const slotEl = document.createElement('div');
      slotEl.style.cssText = `
        min-width: 64px;
        padding: 8px 14px;
        border-radius: 10px;
        font-size: 1rem;
        font-weight: 800;
        color: #fff;
        text-align: center;
        transition: background 200ms, border-bottom-color 200ms;
      `;

      if (slot.fixed) {
        slotEl.textContent = slot.word;
        slotEl.style.background = 'rgba(255,255,255,0.12)';
        slotEl.style.border = '1.5px solid rgba(255,255,255,0.22)';
      } else {
        slotEl.textContent = '';
        slotEl.style.background = 'transparent';
        slotEl.style.borderTop = 'none';
        slotEl.style.borderLeft = 'none';
        slotEl.style.borderRight = 'none';
        slotEl.style.borderBottom = '2.5px dashed rgba(255,255,255,0.4)';
        slotEl.style.borderRadius = '0';
        slotEl.dataset['fillIdx'] = String(fillableIdx);
        this.slotEls.push(slotEl);
        fillableIdx++;
      }

      this.slotPanelEl!.appendChild(slotEl);
    });

    // 카드 렌더
    const cardSection = document.getElementById('so-card-section');
    if (!cardSection) return;
    cardSection.innerHTML = '';

    this.cardPool.forEach((word, i) => {
      const btn = document.createElement('button');
      btn.className = 'so-card-btn';
      btn.textContent = word;
      btn.dataset['word'] = word;
      btn.dataset['cardIdx'] = String(i);
      btn.style.cssText = `
        padding: 12px 20px;
        border-radius: 16px;
        border: 2px solid rgba(255,255,255,0.28);
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(8px);
        font-size: 1.05rem;
        font-weight: 800;
        color: #fff;
        cursor: pointer;
        touch-action: manipulation;
        transition: opacity 200ms;
        animation: so-card-appear 250ms ${i * 40}ms ease both;
      `;
      btn.addEventListener('pointerdown', () => this.onCardTap(i, word, btn));
      this.cardEls.push(btn);
      cardSection.appendChild(btn);
    });
  }

  private onCardTap(cardIdx: number, word: string, btn: HTMLButtonElement): void {
    if (this.isProcessing) return;
    // 이미 선택된 카드면 무시
    if (btn.style.opacity === '0.35') return;

    const nextSlotIdx = this.selectedWords.length;
    if (nextSlotIdx >= this.slotEls.length) return;

    // 슬롯 채우기
    this.selectedWords.push(word);
    const slotEl = this.slotEls[nextSlotIdx];
    slotEl.textContent = word;
    slotEl.style.background = 'rgba(16,185,129,0.25)';
    slotEl.style.borderBottom = '2.5px solid #10B981';
    slotEl.style.animation = 'so-slot-fill 200ms ease';

    // 카드 비활성화
    btn.style.opacity = '0.35';
    btn.style.pointerEvents = 'none';

    // 마지막 슬롯이 채워지면 판정
    if (this.selectedWords.length === this.slotEls.length) {
      this.isProcessing = true;
      const q = this.questions[this.currentIdx];
      const isCorrect = validateAnswer(this.selectedWords, q);

      if (isCorrect) {
        this.animateCorrect();
        this.pendingTimer = setTimeout(() => {
          this.currentIdx++;
          this.renderQuestion();
        }, 700);
      } else {
        this.totalMistakes++;
        this.animateWrong();
        this.pendingTimer = setTimeout(() => {
          this.resetSlots();
          this.isProcessing = false;
        }, 1000);
      }
    }
  }

  private animateCorrect(): void {
    if (!this.slotPanelEl) return;
    this.slotPanelEl.style.animation = 'so-correct 300ms ease';
    setTimeout(() => {
      if (this.slotPanelEl) this.slotPanelEl.style.animation = '';
    }, 300);
  }

  private animateWrong(): void {
    if (!this.slotPanelEl) return;
    this.slotPanelEl.style.animation = 'so-shake 400ms ease';
    setTimeout(() => {
      if (this.slotPanelEl) this.slotPanelEl.style.animation = '';
    }, 400);
  }

  private resetSlots(): void {
    this.selectedWords = [];
    this.slotEls.forEach(slotEl => {
      slotEl.textContent = '';
      slotEl.style.background = 'transparent';
      slotEl.style.borderBottom = '2.5px dashed rgba(255,255,255,0.4)';
      slotEl.style.animation = '';
    });
    this.cardEls.forEach(btn => {
      btn.style.opacity = '1';
      btn.style.pointerEvents = '';
    });
  }

  private showScore(): void {
    const total = this.questions.length;
    const stars = computeStars(this.totalMistakes);
    const starEmojis = ['⭐', '⭐', '⭐'];

    const msg =
      stars === 3 ? t('english.order.resultMsg.great') :
      stars === 2 ? t('english.order.resultMsg.good') :
      t('english.order.resultMsg.keep');

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
      gap: 20px;
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
      box-sizing: border-box;
    `;

    // 타이틀
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.75); letter-spacing: 2px; margin-bottom: 16px; text-transform: uppercase;`;
    titleEl.textContent = t('english.order.finalScore');
    badge.appendChild(titleEl);

    // 별 3개
    const starsRow = document.createElement('div');
    starsRow.style.cssText = `display: flex; justify-content: center; gap: 8px; margin-bottom: 16px;`;
    starEmojis.forEach((emoji, i) => {
      const starEl = document.createElement('span');
      starEl.style.cssText = `
        font-size: 2.4rem;
        opacity: ${i < stars ? '1' : '0.25'};
        animation: ${i < stars ? `star-pop 400ms ${i * 200}ms cubic-bezier(0.34,1.56,0.64,1) both` : 'none'};
      `;
      starEl.textContent = emoji;
      starsRow.appendChild(starEl);
    });
    badge.appendChild(starsRow);

    // 문제 수
    const scoreEl = document.createElement('div');
    scoreEl.style.cssText = `font-size: 2.2rem; font-weight: 900; color: #FDE68A; line-height: 1; text-shadow: 0 4px 16px rgba(0,0,0,0.25);`;
    scoreEl.textContent = t('english.order.scoreComplete', { total });
    badge.appendChild(scoreEl);

    // 메시지
    const msgEl = document.createElement('div');
    msgEl.style.cssText = `font-size: 1rem; font-weight: 700; color: #fff; margin-top: 8px;`;
    msgEl.textContent = msg;
    badge.appendChild(msgEl);

    // 실수 횟수
    const mistakeEl = document.createElement('div');
    mistakeEl.style.cssText = `font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.65); margin-top: 6px;`;
    mistakeEl.textContent = t('english.order.mistakes', { n: this.totalMistakes });
    badge.appendChild(mistakeEl);

    overlay.appendChild(badge);

    // 다시 도전 버튼
    const retryBtn = document.createElement('button');
    retryBtn.textContent = t('english.order.retryBtn');
    retryBtn.className = 'result-btn result-btn--primary';
    retryBtn.addEventListener('pointerdown', () => this.show());

    // 영어 메뉴로 버튼
    const homeBtn = document.createElement('button');
    homeBtn.textContent = t('english.order.homeBtn');
    homeBtn.className = 'result-btn result-btn--ghost';
    homeBtn.addEventListener('pointerdown', () => {
      appRouter.navigate({ to: 'english-menu', subject: 'english', replace: true });
    });

    overlay.appendChild(retryBtn);
    overlay.appendChild(homeBtn);
    this.el.appendChild(overlay);
  }
}
