import { appRouter } from '../../router/AppRouter';
import { userMathStatusService } from '../../services/SaveService';
import { computeDifficultyParams } from '../../systems/math/difficultyEngine';
import { generateNextQuestion, clearQuestionCache } from '../../systems/math/questionGenerator';
import { recordAnswer, getTodayDate } from '../../systems/math/UserMathStatus';
import { getNextRule } from '../../game-data/mathCurriculum';
import type { NewMathQuestion } from '../../systems/math/questionGenerator';
import { confirmExit } from '../../utils/confirmExit';

export class MathQuizGame {
  private el: HTMLElement;
  private hudEl!: HTMLElement;
  private cardEl!: HTMLElement;
  private timerTrackEl!: HTMLElement;
  private timerFillEl!: HTMLElement;
  private choicesEl!: HTMLElement;
  private currentQuestion: NewMathQuestion | null = null;
  private isAnswering = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining = 0;
  private totalTimerMs = 0;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'math-quiz-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #0369A1, #0EA5E9);
      flex-direction: column;
      overflow: hidden;
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
    // HUD — 플렉스 흐름 안에 배치 (position: fixed 제거)
    this.hudEl = document.createElement('div');
    this.hudEl.className = 'quiz-hud';
    this.hudEl.style.cssText = `
      flex-shrink: 0;
      padding: calc(env(safe-area-inset-top, 0px) + 44px) 16px 12px;
      background: rgba(0,0,0,0.20);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: space-between;
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
    homeBtn.addEventListener('click', () => {
      confirmExit(() => this.exitToMenu());
    });
    this.hudEl.appendChild(homeBtn);

    const pillsContainer = document.createElement('div');
    pillsContainer.className = 'hud-pills';
    pillsContainer.style.cssText = 'display: flex; gap: 8px;';
    this.hudEl.appendChild(pillsContainer);

    this.el.appendChild(this.hudEl);

    // 타이머 진행바 (타이머 있을 때만 display: '' 로 표시)
    this.timerTrackEl = document.createElement('div');
    this.timerTrackEl.style.cssText = `
      flex-shrink: 0;
      height: 4px;
      background: rgba(255,255,255,0.15);
      position: relative;
      display: none;
    `;
    this.timerFillEl = document.createElement('div');
    this.timerFillEl.style.cssText = `
      position: absolute; inset: 0 auto 0 0;
      width: 100%;
      background: #FDE68A;
      transition: background 300ms;
    `;
    this.timerTrackEl.appendChild(this.timerFillEl);
    this.el.appendChild(this.timerTrackEl);

    // 문제 카드 — 문제 텍스트만 (선택지 제외)
    this.cardEl = document.createElement('div');
    this.cardEl.className = 'quiz-card';
    this.cardEl.style.cssText = `
      flex-shrink: 0;
      background: rgba(255,255,255,0.18);
      backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(3,105,161,0.45);
      padding: 32px 24px;
      margin: 12px 20px;
    `;
    this.el.appendChild(this.cardEl);

    // 선택지 영역 — 2×2 그리드
    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 4px 20px calc(env(safe-area-inset-bottom, 0px) + 16px);
      align-content: start;
    `;
    this.el.appendChild(this.choicesEl);
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
    appRouter.back();
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
    this.choicesEl.innerHTML = '';

    const qText = document.createElement('div');
    qText.className = 'quiz-question';
    qText.textContent = q.displayText;
    qText.style.cssText = `
      font-size: 2.8rem;
      font-weight: 900;
      color: #ffffff;
      text-align: center;
      animation: question-enter 250ms ease-out;
    `;
    this.cardEl.appendChild(qText);

    // 타이머가 없으면 진행바 숨김
    if (!timeLimitMs) {
      this.timerTrackEl.style.display = 'none';
    }

    q.choices.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.textContent = String(choice);
      btn.className = 'quiz-choice-btn';
      btn.dataset['index'] = String(idx);
      btn.style.cssText = `
        display: block;
        width: 100%;
        height: 60px;
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
      this.choicesEl.appendChild(btn);
    });
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

    const buttons = Array.from(this.choicesEl.querySelectorAll('.quiz-choice-btn')) as HTMLButtonElement[];
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
      top: 30%;
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
    this.totalTimerMs = ms;
    this.timeRemaining = ms;
    this.timerTrackEl.style.display = '';
    this.timerFillEl.style.width = '100%';
    this.timerFillEl.style.background = '#FDE68A';

    this.timerId = setInterval(() => {
      this.timeRemaining -= 100;
      const ratio = Math.max(0, this.timeRemaining / this.totalTimerMs);
      this.timerFillEl.style.width = `${ratio * 100}%`;
      this.timerFillEl.style.background = ratio > 0.4 ? '#FDE68A' : '#EF4444';

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        if (!this.isAnswering) {
          // 시간 초과 → 오답 처리
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
    this.timerTrackEl.style.display = 'none';
  }
}
