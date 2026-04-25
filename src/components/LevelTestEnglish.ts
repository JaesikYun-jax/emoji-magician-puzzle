import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
import { ENGLISH_WORDS } from '../game-data/englishWords';
import type { LevelTestResult } from '../game-data/subjectConfig';
import type { EnglishDifficulty } from '../game-data/english/categories';

const ENGLISH_STAGES: Array<{
  categories: string[];
  label: string;
  difficulty: EnglishDifficulty;
  recommendedLevelIndex: number;
}> = [
  { categories: ['colors', 'numbers'],                  label: '입문', difficulty: 'beginner',     recommendedLevelIndex: 1  },
  { categories: ['animals', 'food'],                    label: '기초', difficulty: 'elementary',   recommendedLevelIndex: 4  },
  { categories: ['body', 'family', 'school', 'nature'], label: '중급', difficulty: 'intermediate', recommendedLevelIndex: 7  },
  { categories: ['actions', 'emotions'],                label: '고급', difficulty: 'advanced',     recommendedLevelIndex: 10 },
];

const LEVEL_TEST_ENGLISH_STYLE = `
#level-test-english {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #065F46 0%, #10B981 60%, #34D399 100%);
  z-index: 30;
}
#level-test-english .lt-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: rgba(0,0,0,0.15);
}
#level-test-english .lt-close-btn {
  background: rgba(255,255,255,0.20);
  border: none;
  color: #fff;
  font-size: 1.1rem;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
  margin-right: 12px;
  line-height: 1;
}
#level-test-english .lt-close-btn:active { transform: scale(0.92); }
#level-test-english .lt-header-title {
  flex: 1;
  text-align: center;
  color: #fff;
  font-size: 1.1rem;
  font-weight: 800;
}
#level-test-english .lt-progress-area {
  padding: 12px 24px 0;
}
#level-test-english .lt-progress-label {
  color: rgba(255,255,255,0.85);
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 6px;
  display: block;
}
#level-test-english .lt-progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.20);
  border-radius: 999px;
  overflow: hidden;
}
#level-test-english .lt-progress-fill {
  height: 100%;
  background: #fff;
  border-radius: 999px;
  transition: width 400ms ease;
}
#level-test-english .lt-question-card {
  margin: 20px 20px 12px;
  padding: 24px 20px;
  border-radius: 24px;
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.28);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  text-align: center;
  flex-shrink: 0;
}
#level-test-english .lt-english-word {
  font-size: 2.2rem;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0,0,0,0.20);
}
#level-test-english .lt-choices {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 20px 20px;
  margin-top: auto;
}
#level-test-english .lt-choice-btn {
  padding: 18px 12px;
  border-radius: 18px;
  border: 2px solid rgba(255,255,255,0.30);
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(8px);
  font-size: 1.1rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  text-align: center;
  transition: transform 120ms ease, background 120ms ease;
}
#level-test-english .lt-choice-btn:active { transform: scale(0.95); }
#level-test-english .lt-choice-btn.wrong {
  background: rgba(244,63,94,0.50) !important;
  border-color: #F43F5E !important;
}
#level-test-english .lt-result-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: linear-gradient(160deg, #065F46 0%, #10B981 60%, #34D399 100%);
  z-index: 5;
}
#level-test-english .lt-result-badge {
  background: rgba(255,255,255,0.20);
  border: 2px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(12px);
  border-radius: 32px;
  padding: 32px 40px;
  text-align: center;
  width: 100%;
  box-shadow: 0 12px 48px rgba(0,0,0,0.20);
  margin-bottom: 24px;
}
#level-test-english .lt-result-lv-label {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: rgba(255,255,255,0.80);
  letter-spacing: 2px;
  margin-bottom: 4px;
}
#level-test-english .lt-result-lv-text {
  display: block;
  font-size: 3rem;
  font-weight: 900;
  color: #FDE68A;
  line-height: 1;
  text-shadow: 0 4px 16px rgba(0,0,0,0.25);
  animation: lt-lv-pop 500ms cubic-bezier(0.34,1.56,0.64,1) both;
}
#level-test-english .lt-result-message {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin-top: 8px;
}
#level-test-english .lt-result-stage-bar {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  justify-content: center;
}
#level-test-english .lt-stage-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255,255,255,0.30);
}
#level-test-english .lt-stage-dot.filled {
  background: #FDE68A;
  box-shadow: 0 0 8px rgba(253,230,138,0.70);
  animation: lt-dot-pop 300ms ease both;
}
#level-test-english .lt-stage-dot.filled:nth-child(1) { animation-delay: 0ms; }
#level-test-english .lt-stage-dot.filled:nth-child(2) { animation-delay: 200ms; }
#level-test-english .lt-stage-dot.filled:nth-child(3) { animation-delay: 400ms; }
#level-test-english .lt-stage-dot.filled:nth-child(4) { animation-delay: 600ms; }
#level-test-english .lt-result-cta {
  width: 100%;
  padding: 18px;
  border-radius: 18px;
  border: none;
  font-size: 1.1rem;
  font-weight: 800;
  cursor: pointer;
  transition: transform 100ms ease;
  margin-bottom: 12px;
}
#level-test-english .lt-result-cta.primary {
  background: #fff;
  color: #065F46;
  box-shadow: 0 6px 24px rgba(255,255,255,0.35);
}
#level-test-english .lt-result-cta.primary:active { transform: scale(0.96); }
#level-test-english .lt-result-cta.secondary {
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1.5px solid rgba(255,255,255,0.30);
}
#level-test-english .lt-result-cta.secondary:active { transform: scale(0.96); }
.lt-question-card.lt-correct {
  animation: lt-correct-flash 400ms ease forwards;
}
.lt-question-card.lt-wrong {
  animation: lt-wrong-shake 350ms ease;
  background: rgba(244,63,94,0.35) !important;
}
`;

interface EnglishQuestion {
  word: { english: string; korean: string };
  choices: string[];
  correctIdx: number;
  stage: number;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export class LevelTestEnglish {
  private el: HTMLElement | null = null;
  private currentStage = 0;
  private stageCorrect = 0;
  private currentQuestionIdx = 0;
  private stagesCleared = 0;
  private totalCorrect = 0;
  private isProcessing = false;
  private resultLevelIndex = 1;
  private resultLabel = '입문';

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService: SaveService,
  ) {}

  show(): void {
    this.hide();
    this.reset();

    if (!document.getElementById('level-test-english-style')) {
      const style = document.createElement('style');
      style.id = 'level-test-english-style';
      style.textContent = LEVEL_TEST_ENGLISH_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'level-test-english';
    el.style.position = 'relative';
    el.innerHTML = `
      <div class="lt-header">
        <button class="lt-close-btn">✕</button>
        <span class="lt-header-title">🧪 레벨 테스트</span>
      </div>
      <div class="lt-progress-area">
        <span class="lt-progress-label" id="lt-e-progress-label">문제 1 / 7</span>
        <div class="lt-progress-bar">
          <div class="lt-progress-fill" id="lt-e-progress-fill" style="width:0%"></div>
        </div>
      </div>
      <div class="lt-question-card" id="lt-e-question-card">
        <div class="lt-english-word" id="lt-e-word">...</div>
      </div>
      <div class="lt-choices" id="lt-e-choices"></div>
    `;

    el.querySelector('.lt-close-btn')!.addEventListener('click', () => {
      this.router.navigate({ to: 'english-menu', subject: 'english' });
    });

    this.container.appendChild(el);
    this.el = el;
    this.renderQuestion();
  }

  private reset(): void {
    this.currentStage = 0;
    this.stageCorrect = 0;
    this.currentQuestionIdx = 0;
    this.stagesCleared = 0;
    this.totalCorrect = 0;
    this.isProcessing = false;
    this.resultLevelIndex = ENGLISH_STAGES[0].recommendedLevelIndex;
    this.resultLabel = ENGLISH_STAGES[0].label;
  }

  private generateQuestion(stage: number): EnglishQuestion {
    const stageDef = ENGLISH_STAGES[stage];
    let pool = ENGLISH_WORDS.filter(w => stageDef.categories.includes(w.category));
    if (pool.length < 4) {
      const diffMap: Record<number, EnglishDifficulty> = {
      0: 'beginner',
      1: 'elementary',
      2: 'intermediate',
      3: 'advanced',
    };
      pool = ENGLISH_WORDS.filter(w => w.difficulty === diffMap[stage] || w.difficulty === 'beginner');
    }
    if (pool.length < 4) pool = ENGLISH_WORDS.slice(0, 10);

    const word = pool[Math.floor(Math.random() * pool.length)];
    const wrongPool = ENGLISH_WORDS.filter(w => w.korean !== word.korean);
    const wrongs = shuffle(wrongPool).slice(0, 3).map(w => w.korean);
    const choices = shuffle([word.korean, ...wrongs]);
    return {
      word,
      choices,
      correctIdx: choices.indexOf(word.korean),
      stage,
    };
  }

  private renderQuestion(): void {
    if (!this.el) return;
    const q = this.generateQuestion(this.currentStage);

    (this.el.querySelector('#lt-e-word') as HTMLElement).textContent = q.word.english;

    const choicesEl = this.el.querySelector('#lt-e-choices') as HTMLElement;
    choicesEl.innerHTML = q.choices
      .map((c, i) => `<button class="lt-choice-btn" data-idx="${i}">${c}</button>`)
      .join('');

    choicesEl.querySelectorAll('.lt-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.isProcessing) return;
        const idx = parseInt((btn as HTMLElement).dataset['idx']!, 10);
        this.handleChoice(idx, q);
      });
    });

    this.updateProgress();
  }

  private handleChoice(idx: number, q: EnglishQuestion): void {
    this.isProcessing = true;
    const card = this.el?.querySelector('#lt-e-question-card') as HTMLElement;

    if (idx === q.correctIdx) {
      card.classList.add('lt-correct');
      this.stageCorrect++;
      this.totalCorrect++;
      this.currentQuestionIdx++;

      setTimeout(() => {
        card.classList.remove('lt-correct');
        this.isProcessing = false;

        if (this.stageCorrect >= 2) {
          this.stagesCleared++;
          this.stageCorrect = 0;
          this.currentStage++;

          if (this.currentStage >= ENGLISH_STAGES.length) {
            this.resultLevelIndex = ENGLISH_STAGES[ENGLISH_STAGES.length - 1].recommendedLevelIndex;
            this.resultLabel = '고급';
            this.finishTest();
            return;
          }
          this.resultLevelIndex = ENGLISH_STAGES[this.currentStage].recommendedLevelIndex;
          this.resultLabel = ENGLISH_STAGES[this.currentStage].label;
        }

        if (this.currentQuestionIdx >= 7) {
          this.finishTest();
          return;
        }
        this.renderQuestion();
      }, 450);
    } else {
      const wrongBtn = this.el?.querySelector(`[data-idx="${idx}"]`) as HTMLElement;
      if (wrongBtn) wrongBtn.classList.add('wrong');
      card.classList.add('lt-wrong');

      setTimeout(() => {
        card.classList.remove('lt-wrong');
        this.isProcessing = false;
        this.finishTest();
      }, 700);
    }
  }

  private updateProgress(): void {
    if (!this.el) return;
    const total = 7;
    const current = this.currentQuestionIdx + 1;
    (this.el.querySelector('#lt-e-progress-label') as HTMLElement).textContent =
      `문제 ${current} / ${total}`;
    (this.el.querySelector('#lt-e-progress-fill') as HTMLElement).style.width =
      `${((current - 1) / total) * 100}%`;
  }

  private finishTest(): void {
    const result: LevelTestResult = {
      testedAt: Date.now(),
      recommendedLevelId: `english-${this.resultLabel}`,
      recommendedLevelIndex: this.resultLevelIndex,
      stagesCleared: this.stagesCleared,
      totalQuestions: this.currentQuestionIdx,
      correctCount: this.totalCorrect,
    };
    this.saveService.recordEnglishLevelTest(result);
    this.showResult(result);
  }

  private showResult(result: LevelTestResult): void {
    if (!this.el) return;
    const overlay = document.createElement('div');
    overlay.className = 'lt-result-overlay';

    const levelLabels = ['입문', '기초', '중급', '고급'];
    const currentLabel = levelLabels[result.stagesCleared] ?? '고급';

    const dots = [0, 1, 2, 3]
      .map(i => `<div class="lt-stage-dot ${i < result.stagesCleared ? 'filled' : ''}"></div>`)
      .join('');

    overlay.innerHTML = `
      <div class="lt-result-badge">
        <span class="lt-result-lv-label">추천 단계</span>
        <span class="lt-result-lv-text">${currentLabel}</span>
        <span class="lt-result-message">실력에 딱 맞는 단계야! 🎉</span>
        <div class="lt-result-stage-bar">${dots}</div>
      </div>
      <button class="lt-result-cta primary" id="lt-e-goto">이 단계로 시작하기 ▶</button>
      <button class="lt-result-cta secondary" id="lt-e-retry">다시 테스트하기</button>
    `;

    overlay.querySelector('#lt-e-goto')!.addEventListener('click', () => {
      const stageIdx = Math.min(result.stagesCleared, ENGLISH_STAGES.length - 1);
      const difficulty = ENGLISH_STAGES[stageIdx].difficulty;
      this.router.navigate({ to: 'game-english', subject: 'english', levelId: difficulty });
    });

    overlay.querySelector('#lt-e-retry')!.addEventListener('click', () => {
      this.reset();
      overlay.remove();
      this.renderQuestion();
    });

    this.el.appendChild(overlay);
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
