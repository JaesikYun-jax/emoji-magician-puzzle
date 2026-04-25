import { ARITHMETIC_LEVELS } from '../../game-data/arithmeticLevels';
import {
  generateArithmeticQuestion,
  DIFFICULTY_CONFIGS,
  calcStars,
  QUESTIONS_PER_SET,
  type ArithmeticQuestion,
  type DifficultyConfig,
} from '../../systems/math/arithmeticQuiz';
import { arithmeticSaveService } from '../../services/ArithmeticSaveService';
import { gameBus } from '../../game-bus';

const BACK_SVG = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class ArithmeticGame {
  private el: HTMLElement;
  private levelId!: number;
  private diff!: DifficultyConfig;
  private questions!: ArithmeticQuestion[];
  private currentIdx: number = 0;
  private correctCount: number = 0;
  private timeRemaining: number = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isAnswering: boolean = false;
  private onBackFn: (() => void) | null = null;

  constructor(private container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'arith-game';
    this.el.style.display = 'none';
    this.container.appendChild(this.el);
  }

  /** Called by main.ts when navigating to game-arithmetic */
  setBackHandler(fn: () => void): void {
    this.onBackFn = fn;
  }

  startLevel(levelId: number, difficulty: 'easy' | 'normal' | 'hard'): void {
    this.levelId = levelId;
    this.diff = DIFFICULTY_CONFIGS[difficulty];
    const level = ARITHMETIC_LEVELS.find(l => l.id === levelId) ?? ARITHMETIC_LEVELS[0]!;
    this.questions = Array.from({ length: QUESTIONS_PER_SET }, () =>
      generateArithmeticQuestion(level, this.diff),
    );
    this.currentIdx = 0;
    this.correctCount = 0;
    this.isAnswering = false;
    this.el.style.display = 'flex';
    this.render();
    this.showQuestion();
  }

  private render(): void {
    this.el.innerHTML = `
      <div class="arith-hud">
        <button class="arith-hud__back" type="button" style="
          width:36px; height:36px; border-radius:50%;
          background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3);
          color:#fff; display:grid; place-items:center; cursor:pointer; flex-shrink:0;
        " aria-label="뒤로가기">${BACK_SVG}</button>
        <div class="arith-hud__progress" id="arith-progress">문제 1/${QUESTIONS_PER_SET}</div>
        <div style="width:36px"></div>
      </div>
      <div class="arith-timer-track">
        <div class="arith-timer-bar" id="arith-timer-bar" style="width:100%"></div>
      </div>
      <div class="arith-question-card" id="arith-question-area"></div>
      <div class="arith-choices" id="arith-choices"></div>
    `;

    this.el.querySelector('.arith-hud__back')!.addEventListener('click', () => {
      this.stopTimer();
      if (this.onBackFn) this.onBackFn();
    });
  }

  private showQuestion(): void {
    this.isAnswering = false;
    const q = this.questions[this.currentIdx]!;
    this.renderQuestion(q);
    this.startTimer();
  }

  private renderQuestion(q: ArithmeticQuestion): void {
    const progress = this.el.querySelector('#arith-progress');
    if (progress) {
      progress.textContent = `문제 ${this.currentIdx + 1}/${QUESTIONS_PER_SET}`;
    }

    const area = this.el.querySelector('#arith-question-area') as HTMLElement | null;
    if (!area) return;

    area.innerHTML = `
      <div class="arith-formula">${q.displayString}</div>
      <div id="arith-visual-container" style="display:flex;flex-direction:column;align-items:center;gap:8px;width:100%;flex:1;justify-content:center"></div>
    `;
    area.style.animation = 'question-enter 300ms ease-out';

    this.renderVisuals(q);
    this.renderChoices(q);
  }

  private renderVisuals(q: ArithmeticQuestion): void {
    const container = this.el.querySelector('#arith-visual-container');
    if (!container) return;

    const total = q.operandA + q.operandB;
    const fontSize = total <= 5 ? '3rem' : total <= 10 ? '2.5rem' : total <= 20 ? '2rem' : '1.5rem';

    if (q.operation === 'add') {
      const groupA = q.visualA.map(e =>
        `<span class="arith-visual__item" style="font-size:${fontSize}">${e}</span>`,
      ).join('');
      const groupB = q.visualB.map(e =>
        `<span class="arith-visual__item" style="font-size:${fontSize}">${e}</span>`,
      ).join('');
      container.innerHTML = `
        <div class="arith-visual">${groupA}</div>
        <div class="arith-visual__op">${q.operationSymbol}</div>
        <div class="arith-visual">${groupB}</div>
      `;
    } else if (q.operation === 'sub') {
      const strikeFrom = q.operandA - q.operandB;
      const items = q.visualA.map((e, i) => {
        const strike = i >= strikeFrom;
        return `<span class="arith-visual__item${strike ? ' arith-visual__item--strike' : ''}" style="font-size:${fontSize}">${e}</span>`;
      }).join('');
      container.innerHTML = `<div class="arith-visual">${items}</div>`;
    } else if (q.operation === 'mul') {
      const mulFontSize = q.operandA * q.operandB <= 20 ? '1.8rem' : '1.4rem';
      let rows = '';
      for (let r = 0; r < q.operandA; r++) {
        const cols = Array(q.operandB).fill(q.displayEmoji)
          .map((e: string) => `<span style="font-size:${mulFontSize}">${e}</span>`)
          .join('');
        rows += `<div class="arith-visual-row">${cols}</div>`;
      }
      container.innerHTML = `<div style="display:flex;flex-direction:column;gap:4px;align-items:center">${rows}</div>`;
    } else {
      // div
      const divFontSize = q.operandA <= 20 ? '1.8rem' : '1.4rem';
      const all = Array(q.operandA).fill(q.displayEmoji)
        .map((e: string) => `<span style="font-size:${divFontSize}">${e}</span>`)
        .join('');
      container.innerHTML = `<div class="arith-visual">${all}</div>`;
    }
  }

  private renderChoices(q: ArithmeticQuestion): void {
    const choicesEl = this.el.querySelector('#arith-choices');
    if (!choicesEl) return;
    choicesEl.innerHTML = '';
    q.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'arith-choice';
      btn.type = 'button';
      btn.textContent = String(choice);
      btn.addEventListener('pointerdown', () => this.onChoiceSelect(choice, btn, q));
      choicesEl.appendChild(btn);
    });
  }

  private startTimer(): void {
    this.timeRemaining = this.diff.timePerQuestion;
    this.updateTimerBar();
    this.timerId = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerBar();
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.onTimeout();
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private updateTimerBar(): void {
    const bar = this.el.querySelector('#arith-timer-bar') as HTMLElement | null;
    if (!bar) return;
    const pct = Math.max(0, (this.timeRemaining / this.diff.timePerQuestion) * 100);
    bar.style.width = `${pct}%`;
    bar.classList.remove('arith-timer-bar--warn', 'arith-timer-bar--danger');
    if (pct < 30) {
      bar.classList.add('arith-timer-bar--danger');
    } else if (pct < 50) {
      bar.classList.add('arith-timer-bar--warn');
    }
  }

  private onChoiceSelect(chosen: number, btn: HTMLButtonElement, q: ArithmeticQuestion): void {
    if (this.isAnswering) return;
    this.isAnswering = true;
    this.stopTimer();

    if (chosen === q.answer) {
      this.correctCount++;
      btn.classList.add('arith-choice--correct');
      setTimeout(() => this.nextQuestion(), 800);
    } else {
      btn.classList.add('arith-choice--wrong');
      const all = this.el.querySelectorAll<HTMLButtonElement>('.arith-choice');
      all.forEach(b => {
        if (Number(b.textContent) === q.answer) b.classList.add('arith-choice--highlight');
      });
      setTimeout(() => this.nextQuestion(), 1000);
    }
  }

  private onTimeout(): void {
    if (this.isAnswering) return;
    this.isAnswering = true;
    const q = this.questions[this.currentIdx]!;
    const all = this.el.querySelectorAll<HTMLButtonElement>('.arith-choice');
    all.forEach(b => {
      if (Number(b.textContent) === q.answer) b.classList.add('arith-choice--highlight');
    });
    setTimeout(() => this.nextQuestion(), 1200);
  }

  private nextQuestion(): void {
    this.currentIdx++;
    if (this.currentIdx >= QUESTIONS_PER_SET) {
      this.endGame();
      return;
    }
    const area = this.el.querySelector('#arith-question-area') as HTMLElement | null;
    if (area) {
      area.style.animation = 'question-exit 200ms ease-in forwards';
      setTimeout(() => {
        area.style.animation = '';
        this.showQuestion();
      }, 200);
    } else {
      this.showQuestion();
    }
  }

  private endGame(): void {
    this.stopTimer();
    const stars = calcStars(this.correctCount);
    arithmeticSaveService.saveResult(this.levelId, this.diff.id, stars);
    gameBus.emit('arithmetic:levelClear', {
      stars,
      correctCount: this.correctCount,
      totalCount: QUESTIONS_PER_SET,
    });
  }

  show(): void {
    this.el.style.display = 'flex';
  }

  hide(): void {
    this.stopTimer();
    this.el.style.display = 'none';
  }
}
