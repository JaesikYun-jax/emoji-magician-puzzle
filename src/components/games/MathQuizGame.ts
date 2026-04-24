import { appRouter } from '../../router/AppRouter';
import { userMathStatusService } from '../../services/SaveService';
import { computeDifficultyParams } from '../../systems/math/difficultyEngine';
import { generateNextQuestion, clearQuestionCache } from '../../systems/math/questionGenerator';
import { recordAnswer, getTodayDate } from '../../systems/math/UserMathStatus';
import { getNextRule } from '../../game-data/mathCurriculum';
import type { NewMathQuestion } from '../../systems/math/questionGenerator';

export class MathQuizGame {
  private el: HTMLElement;
  private hudEl!: HTMLElement;
  private cardEl!: HTMLElement;
  private currentQuestion: NewMathQuestion | null = null;
  private isAnswering = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining = 0;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'math-quiz-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #0369A1, #0EA5E9);
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
    `;
    container.appendChild(this.el);
    this.buildUI();
    this.injectStyles();
  }

  private injectStyles(): void {
    if (document.getElementById('math-quiz-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'math-quiz-game-styles';
    style.textContent = `
      @keyframes correct-pop {
        0%{transform:scale(1)} 50%{transform:scale(1.08)} 100%{transform:scale(1)}
      }
      @keyframes shake {
        0%,100%{transform:translateX(0)}
        25%{transform:translateX(-8px)}
        75%{transform:translateX(8px)}
      }
      @keyframes question-enter {
        from{opacity:0;transform:translateY(-12px)}
        to{opacity:1;transform:translateY(0)}
      }
      .quiz-choice-btn:active { transform: scale(0.95); }
    `;
    document.head.appendChild(style);
  }

  private buildUI(): void {
    // HUD
    this.hudEl = document.createElement('div');
    this.hudEl.className = 'quiz-hud';
    this.hudEl.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 64px;
      padding: 0 16px;
      background: rgba(0,0,0,0.25);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 100;
    `;

    const homeBtn = document.createElement('button');
    homeBtn.textContent = '🏠';
    homeBtn.style.cssText = `
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      width: 40px; height: 40px;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
    `;
    homeBtn.addEventListener('click', () => this.exitToMenu());
    this.hudEl.appendChild(homeBtn);

    const pillsContainer = document.createElement('div');
    pillsContainer.className = 'hud-pills';
    pillsContainer.style.cssText = 'display: flex; gap: 8px;';
    this.hudEl.appendChild(pillsContainer);

    this.el.appendChild(this.hudEl);

    // 문제 카드
    this.cardEl = document.createElement('div');
    this.cardEl.className = 'quiz-card';
    this.cardEl.style.cssText = `
      background: rgba(255,255,255,0.18);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(3,105,161,0.45);
      padding: 32px 24px;
      width: calc(100vw - 32px);
      max-width: 380px;
      margin-top: 64px;
    `;
    this.el.appendChild(this.cardEl);
  }

  show(): void {
    this.el.style.display = 'flex';
    clearQuestionCache();
    this.nextQuestion();
  }

  hide(): void {
    this.el.style.display = 'none';
    this.stopTimer();
  }

  private exitToMenu(): void {
    this.hide();
    appRouter.navigate({ to: 'math-menu', subject: 'math', skipHistory: true });
  }

  private nextQuestion(): void {
    const status = userMathStatusService.get();
    const params = computeDifficultyParams(status);
    this.currentQuestion = generateNextQuestion(params);
    this.isAnswering = false;
    this.renderQuestion(this.currentQuestion, params.timeLimitMs);
    this.updateHUD();

    if (params.timeLimitMs) {
      this.startTimer(params.timeLimitMs);
    }
  }

  private renderQuestion(q: NewMathQuestion, timeLimitMs: number | null): void {
    this.cardEl.innerHTML = '';

    const qText = document.createElement('div');
    qText.className = 'quiz-question';
    qText.textContent = q.displayText;
    qText.style.cssText = `
      font-size: 2.8rem;
      font-weight: 900;
      color: #ffffff;
      text-align: center;
      margin-bottom: 32px;
      animation: question-enter 250ms ease-out;
    `;
    this.cardEl.appendChild(qText);

    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.textContent = String(choice);
      btn.className = 'quiz-choice-btn';
      btn.dataset['index'] = String(idx);
      btn.style.cssText = `
        display: block;
        width: 100%;
        height: 60px;
        margin-bottom: 12px;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.25);
        border-radius: 16px;
        color: #fff;
        font-size: 1.5rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 100ms, background 150ms;
        touch-action: manipulation;
      `;
      btn.addEventListener('pointerdown', () => this.onChoiceSelect(idx));
      this.cardEl.appendChild(btn);
    });

    if (timeLimitMs) {
      const timerEl = document.createElement('div');
      timerEl.id = 'quiz-timer-display';
      timerEl.style.cssText = `
        text-align: center;
        color: rgba(255,255,255,0.8);
        font-size: 1rem;
        margin-top: 8px;
      `;
      this.cardEl.appendChild(timerEl);
    }
  }

  private onChoiceSelect(choiceIndex: number): void {
    if (this.isAnswering || !this.currentQuestion) return;
    this.isAnswering = true;
    this.stopTimer();

    const q = this.currentQuestion;
    const isCorrect = choiceIndex === q.correctIndex;
    const timeTakenMs = 0;

    const currentStatus = userMathStatusService.get();
    const newStatus = recordAnswer(currentStatus, q.ruleId, isCorrect, timeTakenMs);
    userMathStatusService.update(newStatus);

    this.checkRuleProgression(newStatus);

    const buttons = Array.from(this.cardEl.querySelectorAll('.quiz-choice-btn')) as HTMLButtonElement[];
    buttons.forEach((btn, idx) => {
      btn.style.pointerEvents = 'none';
      if (idx === q.correctIndex) {
        btn.style.background = 'rgba(16,185,129,0.45)';
        btn.style.borderColor = '#10B981';
        btn.style.boxShadow = '0 0 20px rgba(16,185,129,0.6)';
        btn.style.animation = 'correct-pop 300ms ease';
      } else if (idx === choiceIndex && !isCorrect) {
        btn.style.background = 'rgba(239,68,68,0.45)';
        btn.style.borderColor = '#EF4444';
        btn.style.animation = 'shake 300ms ease';
      }
    });

    if (isCorrect) {
      this.showStreakEffect(newStatus.currentStreak);
    }

    this.updateHUD();

    const delay = isCorrect ? 500 : 700;
    setTimeout(() => this.nextQuestion(), delay);
  }

  private checkRuleProgression(status: ReturnType<typeof userMathStatusService.get>): void {
    const areaHist = status.areaHistory[status.activeRuleId];
    if (!areaHist) return;
    if (areaHist.totalAnswered >= 20 && areaHist.accuracyRate >= 0.85) {
      const nextRule = getNextRule(status.activeRuleId);
      if (nextRule) {
        userMathStatusService.update({ ...status, activeRuleId: nextRule.id });
      }
    }
  }

  private showStreakEffect(streak: number): void {
    if (streak !== 5 && streak !== 10) return;
    const notify = document.createElement('div');
    notify.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: ${streak >= 10 ? 'rgba(239,68,68,0.9)' : 'rgba(251,191,36,0.9)'};
      color: #fff;
      font-size: 1.1rem;
      font-weight: 700;
      padding: 8px 20px;
      border-radius: 999px;
      z-index: 200;
      animation: question-enter 300ms ease;
      pointer-events: none;
    `;
    notify.textContent = streak >= 10 ? `🔥 ${streak}연속 대박!` : `⚡ ${streak}연속 정답!`;
    document.body.appendChild(notify);
    setTimeout(() => notify.remove(), 1500);
  }

  private updateHUD(): void {
    const status = userMathStatusService.get();
    const pillsContainer = this.hudEl.querySelector('.hud-pills') as HTMLElement;
    if (!pillsContainer) return;

    const today = getTodayDate();
    const todayAnswered = status.todayDate === today ? status.todayAnswered : 0;
    const accuracy = status.areaHistory[status.activeRuleId]
      ? Math.round(status.areaHistory[status.activeRuleId].accuracyRate * 100)
      : 0;

    pillsContainer.innerHTML = '';

    const pills = [
      { icon: '🔥', value: `${status.currentStreak}연속`, highlight: status.currentStreak >= 5 },
      { icon: '🎯', value: `${accuracy}%`, highlight: false },
      { icon: '📝', value: `오늘 ${todayAnswered}문제`, highlight: false },
    ];

    pills.forEach(p => {
      const pill = document.createElement('div');
      pill.style.cssText = `
        background: ${p.highlight ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.15)'};
        border: 1px solid ${p.highlight ? '#FBBF24' : 'rgba(255,255,255,0.2)'};
        border-radius: 999px;
        padding: 6px 12px;
        color: #fff;
        font-size: 0.8rem;
        font-weight: 700;
        white-space: nowrap;
      `;
      pill.textContent = `${p.icon} ${p.value}`;
      pillsContainer.appendChild(pill);
    });
  }

  private startTimer(ms: number): void {
    this.timeRemaining = ms;
    this.timerId = setInterval(() => {
      this.timeRemaining -= 100;
      const display = document.getElementById('quiz-timer-display');
      if (display) {
        const secs = Math.ceil(this.timeRemaining / 1000);
        display.textContent = `⏱ ${secs}초`;
        if (secs <= 3) display.style.color = '#EF4444';
      }
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        if (!this.isAnswering) {
          // 시간 초과 → 오답 처리 (정답 인덱스가 아닌 -1 전달)
          this.onChoiceSelect(-1);
        }
      }
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
