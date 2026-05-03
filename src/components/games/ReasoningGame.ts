/**
 * ReasoningGame.ts
 * 추리 종목 게임 — 5문제 랜덤 출제 (공통점/다른 하나)
 * 난이도 파라미터: router state의 difficulty (easy | normal | hard)
 */
import type { AppRouter } from '../../router/AppRouter';
import type { SaveService } from '../../services/SaveService';
import { pickRound } from '../../game-data/banks/reasoningBank';
import type { ReasoningQuestion, ReasoningDifficulty } from '../../game-data/banks/reasoningBank';

export interface ReasoningGameConfig {
  onComplete?: (correctCount: number) => void;
  onBack?: () => void;
}

export class ReasoningGame {
  private el: HTMLElement | null = null;
  private currentIdx = 0;
  private correctCount = 0;
  private questions: ReasoningQuestion[] = [];
  private difficulty: ReasoningDifficulty | undefined;

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService: SaveService,
  ) {}

  show(_cfg?: ReasoningGameConfig): void {
    this.hide();

    // 라우터 state에서 난이도 읽기 (없으면 전체 풀)
    const state = this.router.getState();
    this.difficulty = state.difficulty as ReasoningDifficulty | undefined;

    this.questions = pickRound(this.difficulty);
    this.currentIdx = 0;
    this.correctCount = 0;

    const wrapper = document.createElement('div');
    wrapper.id = 'reasoning-game-root';
    wrapper.style.cssText = `
      position: fixed; inset: 0;
      min-height: 100dvh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(165deg, #134E4A 0%, #115E59 50%, #14B8A6 100%);
      padding: 24px 16px;
      font-family: 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
      z-index: 30;
    `;
    this.container.appendChild(wrapper);
    this.el = wrapper;
    this._renderQuestion();
  }

  hide(): void {
    if (this.el) { this.el.remove(); this.el = null; }
  }

  private _difficultyLabel(): string {
    if (this.difficulty === 'easy')   return '쉬움';
    if (this.difficulty === 'normal') return '보통';
    if (this.difficulty === 'hard')   return '어려움';
    if (this.difficulty === 'expert') return '최상급';
    return '';
  }

  private _renderQuestion(): void {
    if (!this.el) return;
    const q = this.questions[this.currentIdx];
    if (!q) { this._renderResult(); return; }
    const total = this.questions.length;
    const kindLabel = q.kind === 'commonality' ? '공통점은?' : '다른 하나는?';
    const diffLabel = this._difficultyLabel();

    this.el.innerHTML = `
      <div style="
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 20px;
        padding: 32px 24px;
        max-width: 400px; width: 100%;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        color: #fff;
      ">
        <div style="text-align:center; margin-bottom:24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <button id="rg-exit" style="
              background:rgba(255,255,255,0.15);
              border:1px solid rgba(255,255,255,0.25);
              border-radius:8px;
              color:#fff;
              font-size:14px;
              padding:4px 10px;
              cursor:pointer;
              font-family:inherit;
              line-height:1;
            ">✕</button>
            <span style="font-size:11px;opacity:0.65;letter-spacing:1px;text-transform:uppercase;">
              추리 퀴즈${diffLabel ? ` · ${diffLabel}` : ''}
            </span>
            <span style="font-size:11px;opacity:0.65;">${this.currentIdx + 1} / ${total}</span>
          </div>
          <div style="height:6px;background:rgba(255,255,255,0.2);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${(this.currentIdx / total) * 100}%;background:#CCFBF1;border-radius:3px;transition:width 0.3s;"></div>
          </div>
          <div style="margin-top:10px;">
            <span style="
              display:inline-block;
              background:rgba(204,251,241,0.2);
              border:1px solid rgba(204,251,241,0.4);
              border-radius:999px;
              padding:4px 12px;
              font-size:12px;font-weight:700;
              color:#CCFBF1;
            ">${kindLabel}</span>
          </div>
        </div>

        <div style="font-size:17px;font-weight:700;text-align:center;margin-bottom:24px;line-height:1.5;">
          ${q.prompt}
        </div>

        <div style="display:flex;flex-direction:column;gap:10px;">
          ${q.choices.map((choice, i) => `
            <button class="rg-choice" data-index="${i}" ${import.meta.env.DEV && i === q.correctIndex ? 'data-correct="true"' : ''} style="
              background: rgba(255,255,255,0.15);
              border: 1.5px solid rgba(255,255,255,0.3);
              border-radius: 12px;
              color: #fff;
              font-size: 15px; font-weight: 600;
              padding: 14px 16px;
              cursor: pointer; text-align: left;
              transition: background 0.15s, transform 0.1s;
              font-family: inherit;
            ">
              <span style="opacity:0.6;margin-right:10px;">${String.fromCharCode(65 + i)}.</span>${choice}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.el.querySelectorAll('.rg-choice').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        const chosen = parseInt((e.currentTarget as HTMLElement).dataset['index'] ?? '0', 10);
        this._onChoose(chosen);
      });
    });

    this.el.querySelector('#rg-exit')?.addEventListener('pointerdown', () => {
      if (confirm('퀴즈를 종료하고 메뉴로 돌아갈까요?')) {
        this.hide();
        const originSubject = this.router.getState().subject;
        if (originSubject === 'creativity') {
          this.router.navigate({ to: 'creativity-menu', subject: 'creativity', replace: true });
        } else {
          this.router.navigate({ to: 'reasoning-menu', subject: 'reasoning', replace: true });
        }
      }
    });
  }

  private _onChoose(chosenIndex: number): void {
    const q = this.questions[this.currentIdx];
    if (!q) return;
    const isCorrect = chosenIndex === q.correctIndex;
    if (isCorrect) this.correctCount++;

    const choices = this.el?.querySelectorAll('.rg-choice');
    choices?.forEach((btn, i) => {
      const el = btn as HTMLButtonElement;
      if (i === q.correctIndex) {
        el.style.background = 'rgba(52,211,153,0.5)';
        el.style.borderColor = '#34D399';
      } else if (i === chosenIndex && !isCorrect) {
        el.style.background = 'rgba(239,68,68,0.4)';
        el.style.borderColor = '#EF4444';
      }
      el.disabled = true;
    });

    setTimeout(() => {
      this.currentIdx++;
      if (this.currentIdx < this.questions.length) {
        this._renderQuestion();
      } else {
        this._renderResult();
      }
    }, 800);
  }

  private _renderResult(): void {
    if (!this.el) return;
    const total = this.questions.length;
    const correct = this.correctCount;
    const pct = Math.round((correct / total) * 100);

    // 별점: 5=⭐⭐⭐, 3~4=⭐⭐, 0~2=⭐
    const stars = correct >= 5 ? '⭐⭐⭐' : correct >= 3 ? '⭐⭐' : '⭐';
    const starCount = correct >= 5 ? 3 : correct >= 3 ? 2 : 1;

    // XP 적립
    const xpGained = starCount * 10;
    this.saveService.recordSubjectClear('reasoning', xpGained, correct >= 3);

    this.el.innerHTML = `
      <div style="
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 20px;
        padding: 40px 24px;
        max-width: 400px; width: 100%;
        text-align: center; color: #fff;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      ">
        <div style="font-size:52px;margin-bottom:16px;">${stars}</div>
        <div style="font-size:22px;font-weight:800;margin-bottom:8px;">
          ${correct >= 5 ? '완벽해요!' : correct >= 3 ? '잘했어요!' : '다시 도전해봐요!'}
        </div>
        <div style="font-size:15px;opacity:0.8;margin-bottom:24px;">
          ${total}문제 중 <strong>${correct}개</strong> 정답 (${pct}%)
        </div>
        <div style="
          background: rgba(255,255,255,0.1);
          border-radius: 12px; padding: 14px; margin-bottom:28px;
          font-size:13px; opacity:0.85; line-height:1.5;
        ">
          ${pct >= 100 ? '5문제 전부 맞혔어요! 추리 천재!' :
            pct >= 60  ? '꽤 날카로운 추리력이에요' :
                         '공통점과 차이점을 잘 살펴봐요!'}
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <button id="rg-retry" style="
            background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.3);
            border-radius: 14px; padding: 14px 24px; color: #fff;
            font-size:15px; font-weight:700; cursor:pointer;
            font-family: inherit;
          ">다시 도전하기</button>
          <button id="rg-menu" style="
            background: #CCFBF1; border: none;
            border-radius: 14px; padding: 14px 24px; color: #134E4A;
            font-size:16px; font-weight:800; cursor:pointer;
            font-family: inherit;
          ">메뉴로</button>
        </div>
      </div>
    `;

    this.el.querySelector('#rg-retry')?.addEventListener('pointerdown', () => {
      this.questions = pickRound(this.difficulty);
      this.currentIdx = 0;
      this.correctCount = 0;
      this._renderQuestion();
    });

    this.el.querySelector('#rg-menu')?.addEventListener('pointerdown', () => {
      this.hide();
      const originSubject = this.router.getState().subject;
      if (originSubject === 'creativity') {
        this.router.navigate({ to: 'creativity-menu', subject: 'creativity', replace: true });
      } else {
        this.router.navigate({ to: 'reasoning-menu', subject: 'reasoning', replace: true });
      }
    });
  }
}
