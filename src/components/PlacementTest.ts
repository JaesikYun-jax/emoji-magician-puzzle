import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
import type { SubjectId } from '../game-data/subjectConfig';

export type { SubjectId } from '../game-data/subjectConfig';

export interface PlacementQuestion {
  id: string;
  questionText: string;
  choices: string[];
  correctIndex: number;
  emoji?: string;
}

export interface PlacementConfig {
  subjectId: SubjectId;
  subjectLabelKo: string;
  subjectLabelEn: string;
  questions: PlacementQuestion[];
  gradientCss: string;
  onComplete: (correctCount: number) => void;
  onBack: () => void;
}

export class PlacementTest {
  private container: HTMLElement;
  private _router: AppRouter;
  private saveService: SaveService;
  private config!: PlacementConfig;
  private currentIdx = 0;
  private correctCount = 0;
  private el: HTMLElement | null = null;

  constructor(container: HTMLElement, router: AppRouter, saveService: SaveService) {
    this.container = container;
    this._router = router;
    this.saveService = saveService;
  }

  show(config: PlacementConfig): void {
    this.config = config;
    this.currentIdx = 0;
    this.correctCount = 0;
    this.container.innerHTML = '';
    this.el = document.createElement('div');
    this.el.className = 'placement-test';
    this.el.style.cssText = `
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${config.gradientCss};
      padding: 24px 16px;
      font-family: inherit;
    `;
    this.container.appendChild(this.el);
    this._renderQuestion();
  }

  private _renderQuestion(): void {
    if (!this.el) return;
    const q = this.config.questions[this.currentIdx];
    const total = this.config.questions.length;

    this.el.innerHTML = `
      <div class="pt-card" style="
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 20px;
        padding: 32px 24px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
        color: #fff;
      ">
        <div class="pt-header" style="text-align:center;margin-bottom:24px;">
          <div style="font-size:13px;opacity:0.75;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
            ${this.config.subjectLabelKo} 진단
          </div>
          <div class="pt-progress-bar" style="height:6px;background:rgba(255,255,255,0.2);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${(this.currentIdx / total) * 100}%;background:#fff;border-radius:3px;transition:width 0.3s;"></div>
          </div>
          <div style="font-size:12px;opacity:0.6;margin-top:6px;">${this.currentIdx + 1} / ${total}</div>
        </div>

        ${q.emoji ? `<div style="text-align:center;font-size:48px;margin-bottom:16px;">${q.emoji}</div>` : ''}

        <div class="pt-question" style="
          font-size:18px;font-weight:700;text-align:center;
          margin-bottom:24px;line-height:1.4;
        ">${q.questionText}</div>

        <div class="pt-choices" style="display:flex;flex-direction:column;gap:10px;">
          ${q.choices.map((choice, i) => `
            <button class="pt-choice" data-index="${i}" style="
              background: rgba(255,255,255,0.15);
              border: 1.5px solid rgba(255,255,255,0.3);
              border-radius: 12px;
              color: #fff;
              font-size: 16px;
              font-weight: 600;
              padding: 14px 16px;
              cursor: pointer;
              text-align: left;
              transition: background 0.15s, transform 0.1s;
            ">
              <span style="opacity:0.6;margin-right:10px;">${String.fromCharCode(65 + i)}.</span>${choice}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.el.querySelectorAll('.pt-choice').forEach((btn) => {
      btn.addEventListener('pointerdown', (e) => {
        const target = e.currentTarget as HTMLElement;
        const chosen = parseInt(target.dataset['index'] ?? '0', 10);
        this._onChoose(chosen);
      });
    });
  }

  private _onChoose(chosenIndex: number): void {
    const q = this.config.questions[this.currentIdx];
    const isCorrect = chosenIndex === q.correctIndex;
    if (isCorrect) this.correctCount++;

    const choices = this.el?.querySelectorAll('.pt-choice');
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
      if (this.currentIdx < this.config.questions.length) {
        this._renderQuestion();
      } else {
        this._renderResult();
      }
    }, 800);
  }

  private _renderResult(): void {
    if (!this.el) return;
    const total = this.config.questions.length;
    const pct = Math.round((this.correctCount / total) * 100);

    // placementDone이 아닌 subjectId만 (math/english/logic/creativity)
    const sid = this.config.subjectId;
    if (sid === 'math' || sid === 'english' || sid === 'logic' || sid === 'creativity') {
      this.saveService.recordPlacementDone(sid, this.correctCount, total);
    }

    const stars = this.correctCount >= 4 ? '⭐⭐⭐' : this.correctCount >= 2 ? '⭐⭐' : '⭐';

    this.el.innerHTML = `
      <div class="pt-result-card" style="
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.25);
        border-radius: 20px;
        padding: 40px 24px;
        max-width: 400px;
        width: 100%;
        text-align: center;
        color: #fff;
        box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      ">
        <div style="font-size:48px;margin-bottom:16px;">${stars}</div>
        <div style="font-size:22px;font-weight:800;margin-bottom:8px;">진단 완료!</div>
        <div style="font-size:15px;opacity:0.8;margin-bottom:24px;">
          ${total}문제 중 <strong>${this.correctCount}개</strong> 정답 (${pct}%)
        </div>
        <div style="
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px;
          margin-bottom:28px;
          font-size:14px;opacity:0.85;
        ">
          ${pct >= 80 ? '목표 훌륭해요! 높은 난이도로 시작합니다.' :
            pct >= 40 ? '잘 했어요! 기본 레벨로 시작합니다.' :
                        '처음부터 차근차근 시작해요!'}
        </div>
        <button class="pt-cta" style="
          background: #FAF7F2;
          color: #1a1a1a;
          border: none;
          border-radius: 14px;
          padding: 16px 32px;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          width: 100%;
          letter-spacing: 0.3px;
        ">학습 시작하기 →</button>
      </div>
    `;

    this.el.querySelector('.pt-cta')?.addEventListener('pointerdown', () => {
      this.config.onComplete(this.correctCount);
    });
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
