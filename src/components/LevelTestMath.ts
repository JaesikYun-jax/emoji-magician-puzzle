import { appRouter } from '../router/AppRouter';
import { userMathStatusService } from '../services/SaveService';
import { type UserMathStatus, createDefaultStatus, initFromLevelTest } from '../systems/math/UserMathStatus';
import { MATH_CURRICULUM } from '../game-data/mathCurriculum';

// ── 진단 테스트용 문제 정의 ─────────────────────────────────────────────────
interface DiagQuestion {
  a: number;
  b: number;
  answer: number;
  label: string;
}

const DIAG_QUESTIONS: DiagQuestion[] = [
  { a: 3,   b: 4,   answer: 7,   label: 'G1_S1 덧셈' },
  { a: 12,  b: 6,   answer: 18,  label: 'G1_S2 덧셈' },
  { a: 23,  b: 14,  answer: 37,  label: 'G2_S1 덧셈' },
  { a: 47,  b: 36,  answer: 83,  label: 'G2_S2 덧셈' },
  { a: 234, b: 153, answer: 387, label: 'G3_S1 덧셈' },
];

function scoreToStatus(score: number): UserMathStatus {
  const map: Array<{ grade: 1|2|3; semester: 1|2 }> = [
    { grade: 1, semester: 1 }, // 0
    { grade: 1, semester: 1 }, // 1
    { grade: 1, semester: 2 }, // 2
    { grade: 2, semester: 1 }, // 3
    { grade: 2, semester: 2 }, // 4
    { grade: 3, semester: 1 }, // 5
  ];
  const { grade, semester } = map[Math.min(score, 5)];
  // 해당 학년/학기의 첫 번째 커리큘럼 룰 ID 찾기
  const rule = MATH_CURRICULUM.find(r => r.grade === grade && r.semester === semester);
  const ruleId = rule?.id ?? 'g1s1-add-single-no-carry';
  return initFromLevelTest(ruleId, grade, semester);
}

// ── 스타일 ──────────────────────────────────────────────────────────────────
const LTM_STYLE = `
#level-test-math {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  background: linear-gradient(160deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%);
  z-index: 30;
}
#level-test-math .ltm-header {
  display: flex; align-items: center;
  padding: 16px 20px;
  background: rgba(0,0,0,0.15);
}
#level-test-math .ltm-close-btn {
  background: rgba(255,255,255,0.20); border: none;
  color: #fff; font-size: 1.1rem;
  padding: 8px 14px; border-radius: 10px;
  cursor: pointer; margin-right: 12px; line-height: 1;
}
#level-test-math .ltm-close-btn:active { transform: scale(0.92); }
#level-test-math .ltm-header-title {
  flex: 1; text-align: center;
  color: #fff; font-size: 1.1rem; font-weight: 800;
}
#level-test-math .ltm-body {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 24px 20px; gap: 20px;
}
#level-test-math .ltm-question-label {
  color: rgba(255,255,255,0.90);
  font-size: 1.3rem; font-weight: 900;
  text-align: center;
}
#level-test-math .ltm-btn-group {
  display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px;
}
#level-test-math .ltm-btn {
  padding: 18px; border-radius: 18px; border: 1.5px solid rgba(255,255,255,0.30);
  background: rgba(255,255,255,0.20); color: #fff;
  font-size: 1.1rem; font-weight: 800;
  cursor: pointer; text-align: center;
  transition: transform 100ms ease, background 100ms ease;
}
#level-test-math .ltm-btn:active { transform: scale(0.96); background: rgba(255,255,255,0.35); }
#level-test-math .ltm-btn.primary {
  background: #fff; color: #0369A1;
  box-shadow: 0 6px 24px rgba(255,255,255,0.35);
}
#level-test-math .ltm-btn.primary:active { transform: scale(0.96); }
#level-test-math .ltm-progress-bar {
  width: 100%; max-width: 320px;
  height: 6px; background: rgba(255,255,255,0.20);
  border-radius: 999px; overflow: hidden;
}
#level-test-math .ltm-progress-fill {
  height: 100%; background: #FDE68A;
  border-radius: 999px; transition: width 400ms ease;
}
#level-test-math .ltm-question-card {
  width: 100%; max-width: 340px;
  background: rgba(255,255,255,0.18);
  border: 1.5px solid rgba(255,255,255,0.28);
  border-radius: 24px; backdrop-filter: blur(12px);
  padding: 28px 20px; text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  transition: background 300ms ease;
}
#level-test-math .ltm-expr {
  font-size: 2.4rem; font-weight: 900;
  color: #fff; letter-spacing: 4px;
  text-shadow: 0 2px 8px rgba(0,0,0,0.20);
}
#level-test-math .ltm-input-display {
  margin-top: 12px; font-size: 1.8rem; font-weight: 700;
  color: #FDE68A; min-height: 2.2rem;
  letter-spacing: 2px;
}
#level-test-math .ltm-numpad {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 10px; padding: 0 20px 20px;
  width: 100%; max-width: 380px; margin: 0 auto;
}
#level-test-math .ltm-numpad-btn {
  aspect-ratio: 1; border-radius: 16px;
  border: 1.5px solid rgba(255,255,255,0.30);
  font-size: 1.6rem; font-weight: 800;
  color: #fff; background: rgba(255,255,255,0.20);
  cursor: pointer; transition: transform 100ms ease, background 100ms ease;
}
#level-test-math .ltm-numpad-btn:active { transform: scale(0.92); background: rgba(255,255,255,0.35); }
#level-test-math .ltm-numpad-del { background: rgba(255,255,255,0.10); font-size: 1.2rem; }
.ltm-card-correct { animation: ltm-correct-flash 400ms ease forwards; }
.ltm-card-wrong   { animation: ltm-wrong-shake 350ms ease; background: rgba(244,63,94,0.35) !important; }
@keyframes ltm-correct-flash {
  0%{background:rgba(255,255,255,0.18)} 30%{background:rgba(52,211,153,0.55)} 100%{background:rgba(255,255,255,0.18)}
}
@keyframes ltm-wrong-shake {
  0%{transform:translateX(0)} 20%{transform:translateX(-10px)}
  40%{transform:translateX(10px)} 60%{transform:translateX(-8px)}
  80%{transform:translateX(8px)} 100%{transform:translateX(0)}
}
#level-test-math .ltm-result-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 24px;
  background: linear-gradient(160deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%);
  z-index: 5;
}
#level-test-math .ltm-result-badge {
  background: rgba(255,255,255,0.20); border: 2px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(12px); border-radius: 32px;
  padding: 32px 40px; text-align: center; width: 100%;
  max-width: 340px; box-shadow: 0 12px 48px rgba(0,0,0,0.20);
  margin-bottom: 24px;
}
#level-test-math .ltm-result-label {
  display: block; font-size: 1rem; font-weight: 700;
  color: rgba(255,255,255,0.80); letter-spacing: 2px; margin-bottom: 4px;
}
#level-test-math .ltm-result-grade {
  display: block; font-size: 3.5rem; font-weight: 900;
  color: #FDE68A; line-height: 1;
  text-shadow: 0 4px 16px rgba(0,0,0,0.25);
  animation: ltm-lv-pop 500ms cubic-bezier(0.34,1.56,0.64,1) both;
}
@keyframes ltm-lv-pop {
  0%{transform:scale(0) rotate(-15deg);opacity:0}
  70%{transform:scale(1.15) rotate(3deg)}
  100%{transform:scale(1) rotate(0deg);opacity:1}
}
#level-test-math .ltm-result-message {
  display: block; font-size: 1.1rem; font-weight: 700;
  color: #fff; margin-top: 8px;
}
`;

type Phase = 'menu' | 'grade-select' | 'semester-select' | 'diagnosis' | 'result';

export class LevelTestMath {
  private el: HTMLElement | null = null;
  private phase: Phase = 'menu';
  private selectedGrade: 1|2|3 = 1;
  private diagScore = 0;
  private diagIdx = 0;
  private inputBuffer = '';
  private isProcessing = false;
  private finalStatus: UserMathStatus | null = null;

  constructor(private container: HTMLElement) {}

  show(): void {
    this.hide();
    this.phase = 'menu';
    this.selectedGrade = 1;
    this.diagScore = 0;
    this.diagIdx = 0;
    this.inputBuffer = '';
    this.isProcessing = false;
    this.finalStatus = null;

    if (!document.getElementById('ltm-style')) {
      const style = document.createElement('style');
      style.id = 'ltm-style';
      style.textContent = LTM_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'level-test-math';
    el.style.position = 'relative';
    el.innerHTML = `
      <div class="ltm-header">
        <button class="ltm-close-btn">✕</button>
        <span class="ltm-header-title">수리 수학 시작</span>
      </div>
      <div class="ltm-body" id="ltm-body"></div>
    `;

    el.querySelector('.ltm-close-btn')!.addEventListener('click', () => {
      // skipHistory: true — level-test-math를 히스토리에 남기지 않고 math-menu로 복귀
      appRouter.navigate({ to: 'math-menu', subject: 'math', skipHistory: true });
    });

    this.container.appendChild(el);
    this.el = el;
    this.renderPhase();
  }

  private renderPhase(): void {
    const body = this.el?.querySelector('#ltm-body') as HTMLElement;
    if (!body) return;
    body.innerHTML = '';

    switch (this.phase) {
      case 'menu':     this.renderMenu(body);       break;
      case 'grade-select': this.renderGradeSelect(body); break;
      case 'semester-select': this.renderSemesterSelect(body); break;
      case 'diagnosis': this.renderDiagnosis(body);  break;
      case 'result':   this.renderResult(body);      break;
    }
  }

  private renderMenu(body: HTMLElement): void {
    body.innerHTML = `
      <div class="ltm-question-label">어떻게 시작할까요?</div>
      <div class="ltm-btn-group">
        <button class="ltm-btn primary" id="ltm-quick-start">바로 시작하기</button>
        <button class="ltm-btn" id="ltm-manual-select">학년 직접 선택하기</button>
        <button class="ltm-btn" id="ltm-diag-start">레벨 테스트 (5문제)</button>
      </div>
    `;

    body.querySelector('#ltm-quick-start')!.addEventListener('click', () => {
      this.finalStatus = createDefaultStatus();
      this.phase = 'result';
      this.renderPhase();
    });

    body.querySelector('#ltm-manual-select')!.addEventListener('click', () => {
      this.phase = 'grade-select';
      this.renderPhase();
    });

    body.querySelector('#ltm-diag-start')!.addEventListener('click', () => {
      this.diagScore = 0;
      this.diagIdx = 0;
      this.inputBuffer = '';
      this.phase = 'diagnosis';
      this.renderPhase();
    });
  }

  private renderGradeSelect(body: HTMLElement): void {
    body.innerHTML = `
      <div class="ltm-question-label">어느 학년이에요?</div>
      <div class="ltm-btn-group">
        <button class="ltm-btn" data-grade="1">1학년</button>
        <button class="ltm-btn" data-grade="2">2학년</button>
        <button class="ltm-btn" data-grade="3">3학년</button>
      </div>
    `;

    body.querySelectorAll('.ltm-btn[data-grade]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedGrade = parseInt((btn as HTMLElement).dataset['grade'] ?? '1', 10) as 1|2|3;
        this.phase = 'semester-select';
        this.renderPhase();
      });
    });
  }

  private renderSemesterSelect(body: HTMLElement): void {
    body.innerHTML = `
      <div class="ltm-question-label">${this.selectedGrade}학년, 몇 학기예요?</div>
      <div class="ltm-btn-group">
        <button class="ltm-btn" data-sem="1">1학기</button>
        <button class="ltm-btn" data-sem="2">2학기</button>
      </div>
    `;

    body.querySelectorAll('.ltm-btn[data-sem]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const semester = parseInt((btn as HTMLElement).dataset['sem'] ?? '1', 10) as 1|2;
        const rule = MATH_CURRICULUM.find(r => r.grade === this.selectedGrade && r.semester === semester);
        const ruleId = rule?.id ?? 'g1s1-add-single-no-carry';
        this.finalStatus = initFromLevelTest(ruleId, this.selectedGrade, semester);
        this.phase = 'result';
        this.renderPhase();
      });
    });
  }

  private renderDiagnosis(body: HTMLElement): void {
    if (this.diagIdx >= DIAG_QUESTIONS.length) {
      this.finalStatus = scoreToStatus(this.diagScore);
      this.phase = 'result';
      this.renderPhase();
      return;
    }

    const q = DIAG_QUESTIONS[this.diagIdx];
    const total = DIAG_QUESTIONS.length;

    body.innerHTML = `
      <div class="ltm-progress-bar">
        <div class="ltm-progress-fill" style="width:${(this.diagIdx / total) * 100}%"></div>
      </div>
      <div class="ltm-question-label" style="font-size:0.9rem; color:rgba(255,255,255,0.75)">
        문제 ${this.diagIdx + 1} / ${total}
      </div>
      <div class="ltm-question-card" id="ltm-diag-card">
        <div class="ltm-expr">${q.a} + ${q.b} = ?</div>
        <div class="ltm-input-display" id="ltm-input-display">_</div>
      </div>
      <div class="ltm-numpad">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="ltm-numpad-btn" data-num="${n}">${n}</button>`).join('')}
        <button class="ltm-numpad-btn" data-num="0">0</button>
        <button class="ltm-numpad-btn ltm-numpad-del" data-action="del">⌫</button>
        <button class="ltm-numpad-btn" data-action="submit">✓</button>
      </div>
    `;

    body.querySelectorAll('.ltm-numpad-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.isProcessing) return;
        const num = (btn as HTMLElement).dataset['num'];
        const action = (btn as HTMLElement).dataset['action'];
        if (num !== undefined) {
          if (this.inputBuffer.length < 4) {
            this.inputBuffer += num;
            this.updateDiagDisplay(body);
          }
        } else if (action === 'del') {
          this.inputBuffer = this.inputBuffer.slice(0, -1);
          this.updateDiagDisplay(body);
        } else if (action === 'submit') {
          this.submitDiagAnswer(body);
        }
      });
    });
  }

  private updateDiagDisplay(body: HTMLElement): void {
    const display = body.querySelector('#ltm-input-display') as HTMLElement;
    if (display) display.textContent = this.inputBuffer || '_';
  }

  private submitDiagAnswer(body: HTMLElement): void {
    if (this.isProcessing || !this.inputBuffer) return;
    const userAnswer = parseInt(this.inputBuffer, 10);
    const q = DIAG_QUESTIONS[this.diagIdx];
    if (isNaN(userAnswer)) return;

    this.isProcessing = true;
    const card = body.querySelector('#ltm-diag-card') as HTMLElement;
    const isCorrect = userAnswer === q.answer;

    if (isCorrect) {
      this.diagScore++;
      card.classList.add('ltm-card-correct');
      setTimeout(() => {
        card.classList.remove('ltm-card-correct');
        this.isProcessing = false;
        this.inputBuffer = '';
        this.diagIdx++;
        this.renderPhase();
      }, 450);
    } else {
      card.classList.add('ltm-card-wrong');
      setTimeout(() => {
        card.classList.remove('ltm-card-wrong');
        this.isProcessing = false;
        // 오답 시 테스트 조기 종료
        this.finalStatus = scoreToStatus(this.diagScore);
        this.phase = 'result';
        this.renderPhase();
      }, 650);
    }
  }

  private renderResult(body: HTMLElement): void {
    if (!this.finalStatus) return;
    const { grade, semester } = this.finalStatus;

    body.innerHTML = `
      <div class="ltm-result-badge">
        <span class="ltm-result-label">딱 맞는 레벨</span>
        <span class="ltm-result-grade">${grade}학년 ${semester}학기</span>
        <span class="ltm-result-message">이 레벨이 딱 맞아요! 🎉</span>
      </div>
      <div class="ltm-btn-group">
        <button class="ltm-btn primary" id="ltm-confirm">이 레벨로 시작하기 ▶</button>
        <button class="ltm-btn" id="ltm-back-menu">다시 선택하기</button>
      </div>
    `;

    body.querySelector('#ltm-confirm')!.addEventListener('click', () => {
      const status = this.finalStatus!;
      userMathStatusService.update(status);
      appRouter.navigate({ to: 'game-math-quiz', subject: 'math' });
    });

    body.querySelector('#ltm-back-menu')!.addEventListener('click', () => {
      this.phase = 'menu';
      this.renderPhase();
    });
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
