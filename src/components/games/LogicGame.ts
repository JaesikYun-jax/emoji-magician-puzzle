/**
 * LogicGame.ts
 * DOM 기반 논리 패턴 이어가기 게임 컴포넌트.
 *
 * 화면 구조:
 *   [HUD pill bar] 뒤로 | 시계 + 시간 | 진행바 | 라운드
 *   [카드] 9열 그리드 SVG 도형 수열 (? 칸 황금 dashed)
 *   [선택지] 3개 가로 배열, 정사각형 버튼 + 라벨 + SVG 도형
 *   [하단] 힌트 버튼 | 답 선택 버튼
 *   [결과 오버레이] 별 + 정답 수 + 다시하기/메뉴
 */

import { appRouter } from '../../router/AppRouter';
import { generateLogicSequence, calcLogicStars } from '../../systems/logic/patternJudge';
import type { LogicSequence } from '../../systems/logic/patternJudge';
import type { LogicLevelConfig } from '../../systems/logic/patternJudge';
import { saveService } from '../../services/SaveService';
import { confirmExit } from '../../utils/confirmExit';

// 패턴 생성기가 반환하는 숫자를 도형 키로 매핑 (모듈로 처리로 범위 초과 허용)
const SHAPE_KEYS = ['tri', 'cir', 'sqr', 'dia'];

function toShapeKey(n: number): string {
  return SHAPE_KEYS[((n - 1) % SHAPE_KEYS.length + SHAPE_KEYS.length) % SHAPE_KEYS.length];
}

function renderShape(kind: string, size: number, color: string): string {
  switch (kind) {
    case 'tri':
      return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M20 6 L35 32 L5 32 Z" fill="${color}"/></svg>`;
    case 'cir':
      return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><circle cx="20" cy="20" r="14" fill="${color}"/></svg>`;
    case 'sqr':
      return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><rect x="6" y="6" width="28" height="28" rx="4" fill="${color}"/></svg>`;
    case 'dia':
      return `<svg viewBox="0 0 40 40" width="${size}" height="${size}"><path d="M20 4 L36 20 L20 36 L4 20 Z" fill="${color}"/></svg>`;
    default:
      return `<span style="font-size:${size * 0.6}px;color:${color};font-weight:800;">${kind}</span>`;
  }
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D'];

const LOGIC_GAME_STYLES = `
@keyframes lg-fall-in {
  from { transform: translateY(-60px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
@keyframes lg-blank-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(253,230,138,0); }
  50%       { box-shadow: 0 0 0 6px rgba(253,230,138,0.30); }
}
@keyframes lg-correct-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.10); }
  100% { transform: scale(1); }
}
@keyframes lg-shake {
  0%,100% { transform: translateX(0); }
  25%     { transform: translateX(-10px); }
  75%     { transform: translateX(10px); }
}
@keyframes lg-result-in {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes lg-star-pop {
  0%   { transform: scale(0) rotate(-30deg); opacity: 0; }
  70%  { transform: scale(1.25) rotate(5deg); opacity: 1; }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}
@keyframes lg-toast-in {
  0%   { opacity: 0; transform: translateX(-50%) translateY(10px); }
  20%  { opacity: 1; transform: translateX(-50%) translateY(0); }
  80%  { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(0); }
}
.lg-choice-btn:active { transform: scale(0.95) !important; transition: transform 80ms !important; }
`;

export class LogicGame {
  private el: HTMLElement;
  private levelConfig: LogicLevelConfig | null = null;
  private currentRound = 0;
  private correctCount = 0;
  private isAnswering = false;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private timeRemaining = 0;
  private timeUsed = 0;
  private currentSeq: LogicSequence | null = null;
  private selectedChoiceIndex = -1;

  private timerTextEl!: HTMLElement;
  private timerBarInnerEl!: HTMLElement;
  private scoreEl!: HTMLElement;
  private tilesEl!: HTMLElement;
  private choicesEl!: HTMLElement;
  private confirmBtnEl!: HTMLButtonElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.id = 'lg-game';
    this.el.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      background: linear-gradient(165deg, #312E81 0%, #4338CA 55%, #6366F1 100%);
      flex-direction: column;
      align-items: center;
      z-index: 20;
      overflow-y: auto;
      overflow-x: hidden;
    `;
    container.appendChild(this.el);
    this._injectStyles();
    this._buildUI();
  }

  show(levelConfig: LogicLevelConfig): void {
    this.levelConfig = levelConfig;
    this.el.style.display = 'flex';
    this._reset(levelConfig);
    this._startLevel();
  }

  hide(): void {
    this.el.style.display = 'none';
    this._stopTimer();
  }

  private _injectStyles(): void {
    if (document.getElementById('lg-game-styles')) return;
    const style = document.createElement('style');
    style.id = 'lg-game-styles';
    style.textContent = LOGIC_GAME_STYLES;
    document.head.appendChild(style);
  }

  private _buildUI(): void {
    // ── HUD pill bar ──────────────────────────────────────────────
    const hudWrap = document.createElement('div');
    hudWrap.style.cssText = `
      position: sticky; top: 0;
      width: 100%; max-width: 480px;
      padding: 52px 18px 12px;
      box-sizing: border-box;
      z-index: 20;
      flex-shrink: 0;
    `;

    const hudPill = document.createElement('div');
    hudPill.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(0,0,0,0.28);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 8px 12px;
      color: #fff;
    `;

    // 뒤로 버튼
    const backBtn = document.createElement('button');
    backBtn.style.cssText = `
      width: 30px; height: 30px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
      border: none;
      color: #fff;
      display: grid; place-items: center;
      cursor: pointer; flex-shrink: 0;
      touch-action: manipulation;
    `;
    backBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    backBtn.addEventListener('click', () => {
      confirmExit(
        () => this._exitToMenu(),
        () => this._resumeTimer(),
      );
      this._stopTimer();
    });
    hudPill.appendChild(backBtn);

    // 시계 + 시간
    const timerGroup = document.createElement('div');
    timerGroup.style.cssText = `
      display: flex; align-items: center; gap: 6px;
      font-weight: 800; font-size: 12px; flex-shrink: 0;
    `;
    timerGroup.innerHTML = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#FDE68A" stroke-width="1.8"/><path d="M10 6v4l3 2" stroke="#FDE68A" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    this.timerTextEl = document.createElement('span');
    this.timerTextEl.textContent = '0:00';
    timerGroup.appendChild(this.timerTextEl);
    hudPill.appendChild(timerGroup);

    // 진행 바
    const progressBarOuter = document.createElement('div');
    progressBarOuter.style.cssText = `
      flex: 1; height: 6px;
      background: rgba(255,255,255,0.15);
      border-radius: 999px;
      overflow: hidden;
    `;
    this.timerBarInnerEl = document.createElement('div');
    this.timerBarInnerEl.style.cssText = `
      width: 100%; height: 100%;
      background: #FDE68A;
      border-radius: 999px;
      transition: width 100ms linear;
    `;
    progressBarOuter.appendChild(this.timerBarInnerEl);
    hudPill.appendChild(progressBarOuter);

    // 라운드 수
    this.scoreEl = document.createElement('div');
    this.scoreEl.style.cssText = `
      font-weight: 800; font-size: 14px;
      color: #FDE68A; flex-shrink: 0;
      letter-spacing: -0.02em;
    `;
    hudPill.appendChild(this.scoreEl);

    hudWrap.appendChild(hudPill);
    this.el.appendChild(hudWrap);

    // ── 패턴 카드 ─────────────────────────────────────────────────
    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.14);
      backdrop-filter: blur(16px);
      border: 1.5px solid rgba(255,255,255,0.28);
      border-radius: 26px;
      padding: 20px 18px;
      width: calc(100vw - 44px);
      max-width: 420px;
      box-sizing: border-box;
      margin-top: 12px;
      flex-shrink: 0;
    `;

    // 카드 헤더
    const cardHeader = document.createElement('div');
    cardHeader.style.cssText = `
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 16px;
    `;
    const chipEl = document.createElement('span');
    chipEl.textContent = '다음에 올 모양은?';
    chipEl.style.cssText = `
      background: rgba(255,255,255,0.18); color: #fff;
      border-radius: 999px; padding: 4px 12px;
      font-size: 12px; font-weight: 700;
    `;
    const diffEl = document.createElement('span');
    diffEl.textContent = '규칙찾기';
    diffEl.style.cssText = `font-size: 11px; font-weight: 700; opacity: 0.75; color: #fff;`;
    cardHeader.appendChild(chipEl);
    cardHeader.appendChild(diffEl);
    card.appendChild(cardHeader);

    // 9열 그리드 수열
    this.tilesEl = document.createElement('div');
    this.tilesEl.style.cssText = `
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      gap: 6px;
    `;
    card.appendChild(this.tilesEl);

    // 힌트 텍스트
    const hintTextEl = document.createElement('div');
    hintTextEl.style.cssText = `
      margin-top: 14px; font-size: 12px;
      color: rgba(255,255,255,0.7); text-align: center;
    `;
    hintTextEl.innerHTML = `반복되는 <b style="color:#FDE68A;">규칙</b>을 찾아봐요`;
    card.appendChild(hintTextEl);

    this.el.appendChild(card);

    // ── 선택지 3개 가로 배열 ──────────────────────────────────────
    const choicesWrap = document.createElement('div');
    choicesWrap.style.cssText = `
      width: calc(100vw - 44px); max-width: 420px;
      margin-top: 10px; flex-shrink: 0;
    `;
    this.choicesEl = document.createElement('div');
    this.choicesEl.style.cssText = `
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    `;
    choicesWrap.appendChild(this.choicesEl);
    this.el.appendChild(choicesWrap);

    // ── 하단 버튼 행 ──────────────────────────────────────────────
    const bottomRow = document.createElement('div');
    bottomRow.style.cssText = `
      display: flex; gap: 10px;
      width: calc(100vw - 44px); max-width: 420px;
      margin-top: 14px; margin-bottom: 30px; flex-shrink: 0;
    `;

    const hintBtn = document.createElement('button');
    hintBtn.innerHTML = '💡 힌트';
    hintBtn.style.cssText = `
      flex: 1;
      background: rgba(255,255,255,0.14);
      border: 1px solid rgba(255,255,255,0.30);
      border-radius: 18px; color: #fff;
      padding: 14px; font-size: 0.9rem; font-weight: 700;
      cursor: pointer; touch-action: manipulation;
    `;
    hintBtn.addEventListener('click', () => this._showHint());
    bottomRow.appendChild(hintBtn);

    this.confirmBtnEl = document.createElement('button');
    this.confirmBtnEl.style.cssText = `
      flex: 1.6;
      background: rgba(255,255,255,0.18);
      border: 1.5px solid rgba(255,255,255,0.30);
      border-radius: 18px; color: rgba(255,255,255,0.55);
      padding: 14px; font-size: 0.9rem; font-weight: 800;
      cursor: pointer; touch-action: manipulation;
      transition: background 150ms, color 150ms, border-color 150ms;
    `;
    this.confirmBtnEl.textContent = '답 선택';
    this.confirmBtnEl.addEventListener('click', () => this._onConfirm());
    bottomRow.appendChild(this.confirmBtnEl);

    this.el.appendChild(bottomRow);
  }

  private _reset(cfg: LogicLevelConfig): void {
    this.currentRound = 0;
    this.correctCount = 0;
    this.isAnswering = false;
    this.timeRemaining = cfg.timeLimit;
    this.timeUsed = 0;
    this.currentSeq = null;
    this.selectedChoiceIndex = -1;
  }

  private _startLevel(): void {
    this._startTimer();
    this._renderRound();
  }

  private _renderRound(): void {
    if (!this.levelConfig) return;

    if (this.currentRound >= this.levelConfig.totalRounds) {
      this._stopTimer();
      this._showResult();
      return;
    }

    const seq = generateLogicSequence(this.levelConfig.genParams);
    this.currentSeq = seq;
    this.isAnswering = false;
    this.selectedChoiceIndex = -1;

    this._renderTiles(seq);
    this._renderChoices(seq);
    this._updateHUD();
    this._updateConfirmBtn();
  }

  private _renderTiles(seq: LogicSequence): void {
    this.tilesEl.innerHTML = '';
    const len = seq.tiles.length;

    seq.tiles.forEach((value, i) => {
      const cell = document.createElement('div');
      const isBlank = value === null;

      if (isBlank) {
        cell.style.cssText = `
          aspect-ratio: 1/1;
          background: rgba(253,230,138,0.14);
          border: 1.5px dashed #FDE68A;
          border-radius: 10px;
          display: grid; place-items: center;
          animation: lg-fall-in 300ms ease calc(${i} * 80ms) both,
                     lg-blank-pulse 1.4s ease-in-out ${len * 80}ms infinite;
        `;
        cell.innerHTML = `<span style="font-size:1.1rem;font-weight:900;color:#FDE68A;">?</span>`;
      } else {
        const shapeKey = toShapeKey(value);
        cell.style.cssText = `
          aspect-ratio: 1/1;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          display: grid; place-items: center;
          animation: lg-fall-in 300ms ease calc(${i} * 80ms) both;
        `;
        cell.innerHTML = renderShape(shapeKey, 22, '#fff');
      }

      this.tilesEl.appendChild(cell);
    });
  }

  private _renderChoices(seq: LogicSequence): void {
    this.choicesEl.innerHTML = '';
    // 디자인 기준 3개 표시
    const displayCount = Math.min(seq.choices.length, 3);

    for (let idx = 0; idx < displayCount; idx++) {
      const choice = seq.choices[idx] as number;
      const label = CHOICE_LABELS[idx];
      const shapeKey = toShapeKey(choice);

      const btn = document.createElement('button');
      btn.className = 'lg-choice-btn';
      btn.dataset.idx = String(idx);
      btn.style.cssText = `
        aspect-ratio: 1/1;
        background: rgba(255,255,255,0.12);
        border: 1.5px solid rgba(255,255,255,0.30);
        backdrop-filter: blur(10px);
        border-radius: 22px;
        display: grid; place-items: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        position: relative;
        cursor: pointer;
        touch-action: manipulation;
        transition: background 120ms, border-color 120ms, box-shadow 120ms, transform 120ms;
      `;

      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      labelEl.style.cssText = `
        position: absolute; top: 8px; left: 10px;
        font-weight: 800; font-size: 11px;
        color: rgba(255,255,255,0.7);
        letter-spacing: 0.1em;
        pointer-events: none;
      `;
      btn.appendChild(labelEl);

      const shapeWrap = document.createElement('div');
      shapeWrap.innerHTML = renderShape(shapeKey, 56, '#fff');
      shapeWrap.style.cssText = `pointer-events: none; display: grid; place-items: center;`;
      btn.appendChild(shapeWrap);

      btn.addEventListener('pointerdown', () => this._onSelectChoice(idx));
      this.choicesEl.appendChild(btn);
    }
  }

  private _onSelectChoice(choiceIndex: number): void {
    if (this.isAnswering) return;
    this.selectedChoiceIndex = choiceIndex;
    this._highlightSelectedChoice(choiceIndex);
    this._updateConfirmBtn();
  }

  private _highlightSelectedChoice(selectedIdx: number): void {
    if (!this.currentSeq) return;
    const buttons = Array.from(
      this.choicesEl.querySelectorAll('.lg-choice-btn'),
    ) as HTMLButtonElement[];

    buttons.forEach((btn, idx) => {
      const shapeWrap = btn.querySelector('div') as HTMLElement | null;
      const labelEl = btn.querySelector('span') as HTMLElement | null;
      const isSelected = idx === selectedIdx;
      const choice = this.currentSeq!.choices[idx] as number;

      if (isSelected) {
        btn.style.background = 'linear-gradient(135deg,#FDE68A,#F59E0B)';
        btn.style.border = 'none';
        btn.style.boxShadow = '0 0 0 3px #fff, 0 8px 18px rgba(251,191,36,0.55)';
        btn.style.transform = 'scale(1.04)';
        if (labelEl) labelEl.style.color = '#4338CA';
        if (shapeWrap) shapeWrap.innerHTML = renderShape(toShapeKey(choice), 56, '#4338CA');
      } else {
        btn.style.background = 'rgba(255,255,255,0.12)';
        btn.style.border = '1.5px solid rgba(255,255,255,0.30)';
        btn.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
        btn.style.transform = 'none';
        if (labelEl) labelEl.style.color = 'rgba(255,255,255,0.7)';
        if (shapeWrap) shapeWrap.innerHTML = renderShape(toShapeKey(choice), 56, '#fff');
      }
    });
  }

  private _updateConfirmBtn(): void {
    const hasSelection = this.selectedChoiceIndex >= 0;
    if (hasSelection) {
      this.confirmBtnEl.style.background = '#FDE68A';
      this.confirmBtnEl.style.border = 'none';
      this.confirmBtnEl.style.color = '#312E81';
      this.confirmBtnEl.style.boxShadow = '0 4px 20px rgba(253,230,138,0.40)';
      this.confirmBtnEl.textContent = `답 선택 · ${CHOICE_LABELS[this.selectedChoiceIndex]}`;
    } else {
      this.confirmBtnEl.style.background = 'rgba(255,255,255,0.18)';
      this.confirmBtnEl.style.border = '1.5px solid rgba(255,255,255,0.30)';
      this.confirmBtnEl.style.color = 'rgba(255,255,255,0.55)';
      this.confirmBtnEl.style.boxShadow = 'none';
      this.confirmBtnEl.textContent = '답 선택';
    }
  }

  private _onConfirm(): void {
    if (this.isAnswering) return;
    if (this.selectedChoiceIndex < 0) return;
    const seq = this.currentSeq;
    if (!seq) return;
    this.isAnswering = true;

    const choiceIndex = this.selectedChoiceIndex;
    const isCorrect = choiceIndex === seq.correctIndex;
    if (isCorrect) this.correctCount++;

    const buttons = Array.from(
      this.choicesEl.querySelectorAll('.lg-choice-btn'),
    ) as HTMLButtonElement[];

    buttons.forEach((btn, idx) => {
      btn.style.pointerEvents = 'none';
      if (idx === seq.correctIndex) {
        btn.style.background = 'rgba(16,185,129,0.50)';
        btn.style.border = '1.5px solid #10B981';
        btn.style.boxShadow = '0 0 20px rgba(16,185,129,0.55)';
        btn.style.transform = 'none';
        btn.style.animation = 'lg-correct-pop 300ms ease';
      } else if (idx === choiceIndex && !isCorrect) {
        btn.style.background = 'rgba(239,68,68,0.45)';
        btn.style.border = '1.5px solid #EF4444';
        btn.style.animation = 'lg-shake 280ms ease';
      }
    });

    this.currentRound++;
    this._updateHUD();
    this.selectedChoiceIndex = -1;
    this._updateConfirmBtn();

    setTimeout(() => this._renderRound(), isCorrect ? 480 : 700);
  }

  private _showHint(): void {
    if (!this.currentSeq) return;
    const hints: Record<string, string> = {
      arithmetic: '각 도형이 일정하게 반복돼요. 차이를 세어봐요!',
      geometric:  '도형이 배수로 늘어나요. 비율을 찾아봐요!',
      fibonacci:  '앞 두 항의 합이 다음 항이에요.',
      square:     '1, 4, 9, 16... 제곱수 패턴이에요.',
      alternating:'짝수 번째와 홀수 번째 자리를 따로 봐요!',
    };
    this._showToast(hints[this.currentSeq.patternType] ?? '패턴을 자세히 살펴봐요!');
  }

  private _showToast(msg: string): void {
    const existing = this.el.querySelector('.lg-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'lg-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed; bottom: 110px; left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.75); backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.15); border-radius: 12px;
      padding: 10px 18px; color: #fff; font-size: 0.85rem; font-weight: 600;
      z-index: 100; white-space: nowrap;
      animation: lg-toast-in 2.4s ease forwards;
      pointer-events: none;
    `;
    this.el.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
  }

  private _updateHUD(): void {
    if (!this.levelConfig) return;
    const n = this.currentRound;
    const total = this.levelConfig.totalRounds;
    this.scoreEl.textContent = `${n}/${total}`;
    this._renderTimer();
  }

  private _renderTimer(): void {
    if (!this.levelConfig) return;
    const secs = Math.ceil(this.timeRemaining);
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    this.timerTextEl.textContent = `${mins}:${String(s).padStart(2, '0')}`;
    this.timerTextEl.style.color = secs <= 10 ? '#FCA5A5' : '#fff';
    const ratio = Math.max(0, this.timeRemaining / this.levelConfig.timeLimit);
    this.timerBarInnerEl.style.width = `${ratio * 100}%`;
    this.timerBarInnerEl.style.background = secs <= 10 ? '#FCA5A5' : '#FDE68A';
  }

  private _startTimer(): void {
    this._stopTimer();
    this.timerId = setInterval(() => {
      this.timeRemaining -= 0.1;
      this.timeUsed += 0.1;
      this._renderTimer();
      if (this.timeRemaining <= 0) {
        this._stopTimer();
        this.timeRemaining = 0;
        this._renderTimer();
        if (!this.isAnswering) {
          this.currentRound = this.levelConfig?.totalRounds ?? this.currentRound;
          this._showResult();
        }
      }
    }, 100);
  }

  private _stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private _resumeTimer(): void {
    if (this.timeRemaining > 0) {
      this._startTimer();
    }
  }

  private _showResult(): void {
    if (!this.levelConfig) return;
    const cfg = this.levelConfig;
    const correct = this.correctCount;
    const total = cfg.totalRounds;
    const stars = calcLogicStars(correct, cfg.starThresholds);

    // 클리어 여부 판단: 절반 이상 정답이면 클리어
    const isCleared = correct >= Math.ceil(total / 2);

    if (isCleared) {
      saveService.recordLogicClear(cfg.id, stars, correct);
    } else {
      saveService.recordLogicFail();
    }

    const clearCount = saveService.getLogicClearCount();
    const streak = saveService.getLogicStreak();

    // 총 클리어 횟수 기반 칭찬 메시지
    const praiseText = isCleared
      ? (clearCount === 1 ? '첫 번째 클리어! 🎉'
        : clearCount >= 10 ? '한붓 그리기 마스터! 🏆'
        : clearCount >= 5  ? '실력자네요! 🔥'
        : '잘했어요! 👍')
      : '😅 다시 도전!';

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(30,27,75,0.92);
      backdrop-filter: blur(6px);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      z-index: 50;
      animation: lg-result-in 350ms ease-out;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      background: rgba(255,255,255,0.14);
      border: 1.5px solid rgba(255,255,255,0.26);
      border-radius: 28px;
      padding: 36px 32px;
      width: calc(100vw - 48px);
      max-width: 360px;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.30);
    `;

    // 칭찬 메시지
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `font-size: 1.6rem; font-weight: 900; color: #fff; margin-bottom: 8px;`;
    titleEl.textContent = praiseText;
    card.appendChild(titleEl);

    // 별 3개
    const starsEl = document.createElement('div');
    starsEl.style.cssText = `font-size: 2.6rem; margin: 12px 0; letter-spacing: 8px; min-height: 3rem;`;
    starsEl.innerHTML = Array.from({ length: 3 }, (_, i) => {
      const filled = i < stars;
      return `<span style="display:inline-block;color:${filled ? '#FBBF24' : 'rgba(255,255,255,0.30)'};animation:${filled ? `lg-star-pop 400ms ${i * 150}ms both ease` : 'none'};">${filled ? '★' : '☆'}</span>`;
    }).join('');
    card.appendChild(starsEl);

    // 정답 수
    const scoreEl = document.createElement('div');
    scoreEl.style.cssText = `font-size: 1.1rem; color: rgba(255,255,255,0.9); font-weight: 700; margin-bottom: 16px;`;
    scoreEl.textContent = `${correct} / ${total} 정답`;
    card.appendChild(scoreEl);

    // 통계 영역
    const statsEl = document.createElement('div');
    statsEl.style.cssText = `
      display: flex; flex-direction: column; gap: 8px;
      background: rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 24px;
    `;

    const clearCountEl = document.createElement('div');
    clearCountEl.style.cssText = `font-size: 0.95rem; color: rgba(255,255,255,0.85); font-weight: 600;`;
    clearCountEl.textContent = `누적 클리어: ${clearCount}회`;
    statsEl.appendChild(clearCountEl);

    if (streak > 0) {
      const streakEl = document.createElement('div');
      streakEl.style.cssText = `font-size: 0.95rem; color: #FCA5A5; font-weight: 700;`;
      streakEl.textContent = `연속 성공: ${streak}회 🔥`;
      statsEl.appendChild(streakEl);
    }

    card.appendChild(statsEl);

    // 다시 하기 버튼
    const retryBtn = document.createElement('button');
    retryBtn.textContent = '🔄 다시 하기';
    retryBtn.style.cssText = `
      display: block; width: 100%;
      padding: 14px;
      background: rgba(255,255,255,0.16);
      border: 1.5px solid rgba(255,255,255,0.30);
      border-radius: 16px;
      color: #fff; font-size: 1rem; font-weight: 700;
      cursor: pointer; margin-bottom: 10px;
      touch-action: manipulation;
    `;
    retryBtn.addEventListener('click', () => {
      overlay.remove();
      this._reset(cfg);
      this._startLevel();
    });
    card.appendChild(retryBtn);

    // 다음 단계 버튼 (클리어한 경우에만)
    if (isCleared) {
      const match = cfg.id.match(/^logic-(\d+)$/);
      const currentNum = match ? parseInt(match[1], 10) : 0;
      const nextId = currentNum > 0 && currentNum < 10 ? `logic-${currentNum + 1}` : null;

      if (nextId) {
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '▶ 다음 단계';
        nextBtn.style.cssText = `
          display: block; width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, rgba(16,185,129,0.85), rgba(5,150,105,0.85));
          border: none;
          border-radius: 16px;
          color: #fff; font-size: 1rem; font-weight: 900;
          cursor: pointer; margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(16,185,129,0.40);
          touch-action: manipulation;
        `;
        nextBtn.addEventListener('click', () => {
          overlay.remove();
          this.hide();
          appRouter.navigate({ to: 'game-logic', subject: 'logic', levelId: nextId });
        });
        card.appendChild(nextBtn);
      } else {
        // 마지막 레벨 클리어 시 처음부터 버튼
        const restartBtn = document.createElement('button');
        restartBtn.textContent = '🔁 처음부터';
        restartBtn.style.cssText = `
          display: block; width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, rgba(251,191,36,0.85), rgba(245,158,11,0.85));
          border: none;
          border-radius: 16px;
          color: #fff; font-size: 1rem; font-weight: 900;
          cursor: pointer; margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(251,191,36,0.40);
          touch-action: manipulation;
        `;
        restartBtn.addEventListener('click', () => {
          overlay.remove();
          this.hide();
          appRouter.navigate({ to: 'game-logic', subject: 'logic', levelId: 'logic-1' });
        });
        card.appendChild(restartBtn);
      }
    }

    // 메뉴로 버튼
    const menuBtn = document.createElement('button');
    menuBtn.textContent = '🏠 메뉴로';
    menuBtn.style.cssText = `
      display: block; width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, rgba(167,139,250,0.85), rgba(99,102,241,0.85));
      border: none;
      border-radius: 16px;
      color: #fff; font-size: 1rem; font-weight: 900;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(99,102,241,0.45);
      touch-action: manipulation;
    `;
    menuBtn.addEventListener('click', () => this._exitToMenu());
    card.appendChild(menuBtn);

    overlay.appendChild(card);
    this.el.appendChild(overlay);
  }

  private _exitToMenu(): void {
    this._stopTimer();
    this.hide();
    appRouter.back();
  }
}
