import { appRouter } from '../../router/AppRouter';
import { buildFillInBlankSession, normalizeDifficulty } from '../../systems/english/fillInBlankEnglish';
import type { FIBDifficulty, GeneratedProblem } from '../../systems/english/fillInBlankEnglish';

const STYLE_ID = 'fib-game-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes fib-shake {
      0%,100% { transform: translateX(0); }
      20%     { transform: translateX(-8px); }
      60%     { transform: translateX(8px); }
    }
    @keyframes fib-correct {
      0%   { transform: scale(1); }
      40%  { transform: scale(1.08); filter: brightness(1.4); }
      100% { transform: scale(1); }
    }
    @keyframes fib-star-pop {
      0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
      70%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    @keyframes fib-card-in {
      from { transform: translateY(20px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    @keyframes fib-meaning-in {
      from { transform: translateY(-10px); opacity: 0; }
      to   { transform: translateY(0); opacity: 1; }
    }
    .fib-choice-btn:active { transform: scale(0.94); transition: transform 80ms; }
    .fib-blank-slot {
      display: inline-block;
      min-width: 56px;
      border-bottom: 3px dashed rgba(255,255,255,0.7);
      margin: 0 4px;
      padding: 2px 8px;
      text-align: center;
      font-weight: 700;
      transition: background 200ms, border-color 200ms;
    }
    .fib-blank-slot.active {
      border-color: #FDE68A;
      background: rgba(253,230,138,0.2);
      border-radius: 6px;
    }
    .fib-blank-slot.filled {
      border-color: rgba(255,255,255,0.4);
      background: rgba(255,255,255,0.15);
      border-radius: 6px;
    }
    .fib-blank-slot.correct {
      border-color: #6EE7B7;
      background: rgba(110,231,183,0.25);
      border-radius: 6px;
      animation: fib-correct 350ms ease;
    }
    .fib-blank-slot.wrong {
      border-color: #FCA5A5;
      background: rgba(252,165,165,0.25);
      border-radius: 6px;
      animation: fib-shake 350ms ease;
    }
    .fib-choice-btn.used {
      opacity: 0.3;
      pointer-events: none;
    }
    .fib-choice-btn.correct {
      background: rgba(110,231,183,0.35) !important;
      border-color: #6EE7B7 !important;
    }
    .fib-choice-btn.wrong {
      background: rgba(252,165,165,0.35) !important;
      border-color: #FCA5A5 !important;
    }
  `;
  document.head.appendChild(style);
}

export class FillInBlankGame {
  private el: HTMLElement;
  private difficulty: FIBDifficulty = 'beginner';
  private problems: GeneratedProblem[] = [];
  private currentIdx = 0;
  private currentBlankIdx = 0;    // 현재 채우고 있는 빈칸 (0-based)
  private answers: (string | null)[] = [];
  private mistakes = 0;
  private totalScore = 0;
  private isProcessing = false;
  private pendingTimer: ReturnType<typeof setTimeout> | null = null;
  private meaningRevealed = false;  // 한국어 의미 노출 여부 (오답 1회 후 노출)

  // DOM refs
  private meaningEl: HTMLElement | null = null;
  private sentenceEl: HTMLElement | null = null;
  private choicesEl: HTMLElement | null = null;
  private progressEl: HTMLElement | null = null;
  private dotEls: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'fib-game';
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

  show(difficultyRaw?: string): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this.difficulty = normalizeDifficulty(difficultyRaw ?? 'beginner');
    this.problems = buildFillInBlankSession(this.difficulty, 8);
    this.currentIdx = 0;
    this.currentBlankIdx = 0;
    this.answers = [];
    this.mistakes = 0;
    this.totalScore = 0;
    this.isProcessing = false;

    this.buildLayout();
    this.el.style.display = 'flex';
    this.renderProblem();
  }

  hide(): void {
    if (this.pendingTimer !== null) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
    this.el.style.display = 'none';
    this.el.innerHTML = '';
    this.meaningEl = null;
    this.sentenceEl = null;
    this.choicesEl = null;
    this.progressEl = null;
    this.dotEls = [];
  }

  // ─── 레이아웃 구축 ────────────────────────────────────────────────────────

  private buildLayout(): void {
    this.el.innerHTML = '';

    // 상단 헤더 (뒤로가기 + 진행 도트)
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px 8px;
      flex-shrink: 0;
    `;

    const backBtn = document.createElement('button');
    backBtn.textContent = '← 뒤로';
    backBtn.style.cssText = `
      background: rgba(255,255,255,0.2); border: none; border-radius: 20px;
      color: #fff; font-size: 14px; padding: 8px 16px; cursor: pointer;
    `;
    backBtn.addEventListener('click', () => {
      this.hide();
      appRouter.navigate({ to: 'english-menu', subject: 'english', replace: true });
    });

    // 진행 도트
    const dotsEl = document.createElement('div');
    dotsEl.style.cssText = 'display: flex; gap: 8px; align-items: center;';
    this.dotEls = [];
    for (let i = 0; i < this.problems.length; i++) {
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 8px; height: 8px; border-radius: 50%;
        background: rgba(255,255,255,${i === 0 ? '1' : '0.35'});
        transition: background 300ms;
      `;
      dotsEl.appendChild(dot);
      this.dotEls.push(dot);
    }

    // 진행 텍스트
    this.progressEl = document.createElement('div');
    this.progressEl.style.cssText = `
      color: rgba(255,255,255,0.85); font-size: 13px; font-weight: 600;
    `;
    this.progressEl.textContent = `1 / ${this.problems.length}`;

    header.appendChild(backBtn);
    header.appendChild(dotsEl);
    header.appendChild(this.progressEl);
    this.el.appendChild(header);

    // 게임 타이틀 칩
    const chip = document.createElement('div');
    chip.style.cssText = `
      text-align: center; padding: 4px 0 8px;
      color: rgba(255,255,255,0.75); font-size: 12px; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
    `;
    chip.textContent = '빈칸 채우기';
    this.el.appendChild(chip);

    // ── 한국어 의미 패널 ──────────────────────────────────────────────────
    const meaningPanel = document.createElement('div');
    meaningPanel.style.cssText = `
      margin: 0 16px 0;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 16px;
      padding: 16px 20px;
      flex-shrink: 0;
    `;

    const meaningLabel = document.createElement('div');
    meaningLabel.style.cssText = `
      color: rgba(255,255,255,0.65); font-size: 11px; font-weight: 600;
      margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em;
    `;
    meaningLabel.textContent = '한국어 의미';
    meaningPanel.appendChild(meaningLabel);

    this.meaningEl = document.createElement('div');
    this.meaningEl.style.cssText = `
      color: #fff; font-size: 18px; font-weight: 700; line-height: 1.5;
      animation: fib-meaning-in 300ms ease;
    `;
    meaningPanel.appendChild(this.meaningEl);
    this.el.appendChild(meaningPanel);

    // ── 영어 문장 패널 ─────────────────────────────────────────────────────
    const sentencePanel = document.createElement('div');
    sentencePanel.style.cssText = `
      margin: 12px 16px 0;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 20px;
      flex-shrink: 0;
    `;

    const sentenceLabel = document.createElement('div');
    sentenceLabel.style.cssText = `
      color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 600;
      margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.06em;
    `;
    sentenceLabel.textContent = '빈칸을 채우세요';
    sentencePanel.appendChild(sentenceLabel);

    this.sentenceEl = document.createElement('div');
    this.sentenceEl.style.cssText = `
      display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
      font-size: 22px; font-weight: 700; color: #fff; line-height: 1.8;
    `;
    sentencePanel.appendChild(this.sentenceEl);
    this.el.appendChild(sentencePanel);

    // ── 보기 그리드 (하단) ─────────────────────────────────────────────────
    const choicesPanel = document.createElement('div');
    choicesPanel.style.cssText = `
      margin: 12px 16px 0;
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 16px;
      padding: 16px;
      flex-shrink: 0;
    `;

    const choicesLabel = document.createElement('div');
    choicesLabel.style.cssText = `
      color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 600;
      margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.06em;
    `;
    choicesLabel.textContent = '보기';
    choicesPanel.appendChild(choicesLabel);

    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
    `;
    choicesPanel.appendChild(this.choicesEl);
    this.el.appendChild(choicesPanel);

    // 스페이서
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    this.el.appendChild(spacer);
  }

  // ─── 문제 렌더링 ─────────────────────────────────────────────────────────

  private renderProblem(): void {
    const prob = this.problems[this.currentIdx];
    if (!prob) return;

    // 답 배열 초기화
    this.answers = new Array(prob.blanks.length).fill(null);
    this.currentBlankIdx = 0;
    this.meaningRevealed = false;  // 매 문제마다 의미 다시 가림

    // 진행 도트 업데이트
    this.dotEls.forEach((d, i) => {
      d.style.background = i === this.currentIdx
        ? 'rgba(255,255,255,1)'
        : i < this.currentIdx
        ? 'rgba(110,231,183,0.9)'
        : 'rgba(255,255,255,0.35)';
    });

    if (this.progressEl) {
      this.progressEl.textContent = `${this.currentIdx + 1} / ${this.problems.length}`;
    }

    // 의미 가림 (한 번 틀리면 노출)
    this.applyMeaningHidden(prob);

    // 문장 토큰 렌더링
    this.renderSentence(prob);

    // 보기 렌더링 (한 번만 — 정답들의 셔플본)
    this.renderChoices(prob);
  }

  private applyMeaningHidden(prob: GeneratedProblem): void {
    if (!this.meaningEl) return;
    this.meaningEl.textContent = '🔒 한 번 틀리면 한국어 의미가 보여요';
    this.meaningEl.style.opacity = '0.55';
    this.meaningEl.style.fontStyle = 'italic';
    this.meaningEl.style.fontSize = '14px';
    this.meaningEl.style.fontWeight = '500';
    this.meaningEl.style.animation = 'none';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.meaningEl.offsetHeight;
    this.meaningEl.style.animation = 'fib-meaning-in 300ms ease';
    // 데이터 보존: 노출용 텍스트 (renderProblem 호출 시점의 prob)
    this.meaningEl.dataset.fullMeaning = prob.meaningKo;
  }

  private revealMeaning(): void {
    if (this.meaningRevealed || !this.meaningEl) return;
    this.meaningRevealed = true;
    const full = this.meaningEl.dataset.fullMeaning ?? '';
    this.meaningEl.textContent = full;
    this.meaningEl.style.opacity = '1';
    this.meaningEl.style.fontStyle = 'normal';
    this.meaningEl.style.fontSize = '18px';
    this.meaningEl.style.fontWeight = '700';
    this.meaningEl.style.animation = 'none';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.meaningEl.offsetHeight;
    this.meaningEl.style.animation = 'fib-meaning-in 300ms ease';
  }

  private renderSentence(prob: GeneratedProblem): void {
    if (!this.sentenceEl) return;
    this.sentenceEl.innerHTML = '';

    for (const tok of prob.tokens) {
      if (!tok.isBlank) {
        const span = document.createElement('span');
        span.textContent = tok.text;
        span.style.color = '#fff';
        this.sentenceEl.appendChild(span);
      } else {
        const bi = tok.blankIndex!;
        const slot = document.createElement('span');
        slot.className = `fib-blank-slot${bi === this.currentBlankIdx ? ' active' : ''}`;
        slot.dataset.blankIndex = String(bi);

        const filled = this.answers[bi];
        if (filled !== null) {
          slot.classList.add('filled');
          slot.textContent = filled;
        } else {
          slot.textContent = '___';
        }
        this.sentenceEl.appendChild(slot);
      }
    }
  }

  private renderChoices(prob: GeneratedProblem): void {
    if (!this.choicesEl) return;
    this.choicesEl.innerHTML = '';

    prob.choices.forEach((choice, i) => {
      const btn = document.createElement('button');
      btn.className = 'fib-choice-btn';
      btn.dataset.choiceIdx = String(i);
      btn.textContent = choice;
      btn.style.cssText = `
        background: rgba(255,255,255,0.18);
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 14px;
        color: #fff;
        font-size: 18px;
        font-weight: 700;
        padding: 14px 8px;
        cursor: pointer;
        transition: background 150ms, border-color 150ms, transform 80ms;
        animation: fib-card-in ${150 + i * 60}ms ease backwards;
      `;
      btn.addEventListener('click', () => {
        if (this.isProcessing) return;
        if (btn.classList.contains('used')) return;
        this.handleChoice(choice, btn);
      });
      this.choicesEl!.appendChild(btn);
    });
  }

  private handleChoice(word: string, btn: HTMLElement): void {
    if (this.isProcessing) return;
    this.isProcessing = true;

    const prob = this.problems[this.currentIdx];
    const blank = prob.blanks[this.currentBlankIdx];
    const slotEl = this.sentenceEl?.querySelector(
      `.fib-blank-slot[data-blank-index="${this.currentBlankIdx}"]`,
    ) as HTMLElement | null;

    const isCorrect = word === blank.answer;

    if (isCorrect) {
      // 정답: 빈칸에 채우고 해당 보기 비활성화, 다음 빈칸으로 이동
      this.answers[this.currentBlankIdx] = word;
      if (slotEl) {
        slotEl.textContent = word;
        slotEl.classList.remove('active');
        slotEl.classList.add('correct');
        setTimeout(() => {
          slotEl.classList.remove('correct');
          slotEl.classList.add('filled');
        }, 400);
      }
      btn.classList.add('used', 'correct');
      setTimeout(() => btn.classList.remove('correct'), 400);

      const nextBlankIdx = this.currentBlankIdx + 1;

      if (nextBlankIdx < prob.blanks.length) {
        // 다음 빈칸으로
        this.pendingTimer = setTimeout(() => {
          this.currentBlankIdx = nextBlankIdx;
          this.isProcessing = false;
          const nextSlot = this.sentenceEl?.querySelector(
            `.fib-blank-slot[data-blank-index="${nextBlankIdx}"]`,
          ) as HTMLElement | null;
          nextSlot?.classList.add('active');
        }, 350);
      } else {
        // 모든 빈칸 완성
        this.totalScore += 10;
        this.pendingTimer = setTimeout(() => {
          this.currentIdx++;
          if (this.currentIdx < this.problems.length) {
            this.currentBlankIdx = 0;
            this.isProcessing = false;
            this.renderProblem();
          } else {
            this.isProcessing = false;
            this.showResult();
          }
        }, 600);
      }
    } else {
      // 오답: 보기·빈칸 흔들기, 빈칸 비워둠 (다시 시도 가능)
      this.mistakes++;
      this.revealMeaning();
      if (slotEl) {
        slotEl.classList.add('wrong');
        setTimeout(() => slotEl.classList.remove('wrong'), 400);
      }
      btn.classList.add('wrong');
      setTimeout(() => btn.classList.remove('wrong'), 400);
      this.pendingTimer = setTimeout(() => {
        this.isProcessing = false;
      }, 420);
    }
  }

  // ─── 결과 화면 ─────────────────────────────────────────────────────────────

  private showResult(): void {
    if (!this.el) return;
    const total = this.problems.length;
    const correct = this.problems.filter((_, i) => {
      // 정답 여부는 mistakes로만 트래킹하지 않고 blanks 전체 완료로 판정
      return true; // 모든 문제를 완료했으므로 완료
    }).length;

    // 별 계산: mistakes 기준
    let stars = 1;
    if (this.mistakes === 0) stars = 3;
    else if (this.mistakes <= total) stars = 2;

    this.el.innerHTML = '';
    this.el.style.cssText = `
      display: flex;
      position: fixed;
      inset: 0;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #065F46, #10B981);
      z-index: 10;
      overflow: hidden;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 24px;
      padding: 32px 28px;
      width: min(90%, 360px);
      text-align: center;
      box-shadow: 0 8px 32px rgba(6,95,70,0.45);
    `;

    // 별
    const starsRow = document.createElement('div');
    starsRow.style.cssText = `
      display: flex; justify-content: center; gap: 12px; margin-bottom: 16px;
    `;
    for (let i = 0; i < 3; i++) {
      const star = document.createElement('span');
      star.textContent = i < stars ? '⭐' : '☆';
      star.style.cssText = `
        font-size: 40px;
        animation: ${i < stars ? `fib-star-pop 500ms ${i * 200}ms ease backwards` : 'none'};
      `;
      starsRow.appendChild(star);
    }
    card.appendChild(starsRow);

    // 메시지
    const msg = document.createElement('div');
    msg.style.cssText = 'color: #fff; font-size: 22px; font-weight: 800; margin-bottom: 8px;';
    msg.textContent = stars === 3 ? '완벽해요! 🎉' : stars === 2 ? '잘했어요! 👍' : '더 연습해봐요! 💪';
    card.appendChild(msg);

    // 실수 수
    const detail = document.createElement('div');
    detail.style.cssText = 'color: rgba(255,255,255,0.8); font-size: 15px; margin-bottom: 28px;';
    detail.textContent = `${total}문제 완료 · 실수 ${this.mistakes}번`;
    card.appendChild(detail);

    // 버튼
    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

    const retryBtn = document.createElement('button');
    retryBtn.textContent = '🔄 다시 도전하기';
    retryBtn.style.cssText = `
      background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.4);
      border-radius: 14px; color: #fff; font-size: 16px; font-weight: 700;
      padding: 14px; cursor: pointer;
    `;
    retryBtn.addEventListener('click', () => {
      this.hide();
      this.show(this.difficulty);
    });

    const homeBtn = document.createElement('button');
    homeBtn.textContent = '🏠 영어 메뉴로 돌아가기';
    homeBtn.style.cssText = `
      background: transparent; border: 2px solid rgba(255,255,255,0.3);
      border-radius: 14px; color: rgba(255,255,255,0.85); font-size: 15px;
      font-weight: 600; padding: 12px; cursor: pointer;
    `;
    homeBtn.addEventListener('click', () => {
      this.hide();
      appRouter.navigate({ to: 'english-menu', subject: 'english', replace: true });
    });

    btnRow.appendChild(retryBtn);
    btnRow.appendChild(homeBtn);
    card.appendChild(btnRow);
    this.el.appendChild(card);
  }
}
