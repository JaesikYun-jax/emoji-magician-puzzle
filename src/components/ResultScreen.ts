import type { GameBus } from '@/game-bus';
import { t } from '@/i18n';

interface ResultData {
  cleared: boolean;
  score: number;
  stars: number;
  levelId: number;
  pairsCompleted?: number;
  maxLevelId: number;
  accuracy?: number;   // 0~100 정수
  timeUsed?: number;   // 초 단위
  titleKey?: string;   // 결과 화면 제목 i18n 키 (없으면 기본값)
  subjectGrad?: string; // 종목별 그라디언트 CSS 값 (없으면 보라 기본값)
  statLabels?: { a?: string; b?: string; c?: string }; // 통계 라벨 커스터마이즈
  nextFn?: () => void; // 다음 레벨 버튼 (있을 때만 표시)
}

const RESULT_STYLE = `
#result-screen {
  position: fixed; inset: 0;
  z-index: 300;
  animation: rs-fade-in 300ms ease;
  color: #fff;
  font-family: var(--f-kr);
  background:
    radial-gradient(ellipse 60% 40% at 50% 0%, rgba(253,230,138,0.18), transparent 60%),
    linear-gradient(165deg, #4C1D95 0%, #6D28D9 50%, #7C3AED 100%);
  overflow: hidden;
  display: flex; flex-direction: column;
}
@keyframes rs-fade-in { from { opacity: 0 } to { opacity: 1 } }

#result-screen .rs-confetti {
  position: absolute; inset: 0; pointer-events: none;
}

#result-screen .rs-content {
  position: relative; z-index: 1;
  padding: calc(env(safe-area-inset-top, 0px) + 54px) 26px 36px;
  height: 100%;
  display: flex; flex-direction: column; align-items: center;
  max-width: 520px; margin: 0 auto; width: 100%;
  overflow-y: auto;
}

#result-screen .rs-eyebrow { color: #D9F99D; }

#result-screen .rs-title {
  font-size: 44px; margin-top: 14px; text-align: center;
}

#result-screen .rs-stars {
  display: flex; gap: 14px; margin-top: 28px; align-items: flex-end;
}
#result-screen .rs-star {
  opacity: 0;
  filter: drop-shadow(0 8px 16px rgba(251,191,36,0.55));
  animation: rs-star-pop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
#result-screen .rs-star[data-n="1"] { animation-delay: 100ms }
#result-screen .rs-star[data-n="2"] { animation-delay: 300ms }
#result-screen .rs-star[data-n="3"] { animation-delay: 500ms }
#result-screen .rs-star.rs-star--empty { filter: grayscale(100%) opacity(0.3); }
@keyframes rs-star-pop {
  0%   { transform: scale(0) rotate(-20deg); opacity: 0 }
  60%  { transform: scale(1.30) rotate(5deg); opacity: 1 }
  80%  { transform: scale(0.90) rotate(-2deg); opacity: 1 }
  100% { transform: scale(1) rotate(0); opacity: 1 }
}

#result-screen .rs-stat-card {
  margin-top: 36px; width: 100%;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 26px;
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  padding: 22px 26px;
}
#result-screen .rs-stat-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;
}
#result-screen .rs-stat {
  text-align: center;
}
#result-screen .rs-stat__label {
  font-family: var(--f-sans); font-size: 10px;
  letter-spacing: 0.16em; text-transform: uppercase;
  opacity: 0.65; font-weight: 700;
}
#result-screen .rs-stat__val {
  font-size: 26px; margin-top: 4px; color: #FDE68A;
}

#result-screen .rs-actions {
  margin-top: auto; padding-top: 24px;
  display: flex; flex-direction: column; gap: 10px; width: 100%;
}
#result-screen .rs-btn {
  width: 100%; justify-content: center;
  font-family: var(--f-sans); font-size: 15px; font-weight: 800;
  border: none; border-radius: 999px; padding: 16px;
  cursor: pointer; transition: transform 150ms;
  display: flex; align-items: center; gap: 8px;
}
#result-screen .rs-btn:active { transform: scale(0.97); }
#result-screen .rs-btn--next {
  background: #D9F99D; color: #2E1065;
  box-shadow: 0 10px 30px rgba(217,249,157,0.35);
}
#result-screen .rs-btn-row { display: flex; gap: 10px; }
#result-screen .rs-btn--ghost {
  flex: 1;
  background: rgba(255,255,255,0.14);
  border: 1px solid rgba(255,255,255,0.28);
  color: #fff; font-size: 14px; font-weight: 700;
}
`;

const CONFETTI_DOTS: Array<[number, number, string, number]> = [
  [60, 120, '#FDE68A', 8], [320, 180, '#FB7185', 6], [90, 260, '#D9F99D', 10], [290, 320, '#A78BFA', 7],
  [40, 380, '#FDE68A', 5], [340, 420, '#D9F99D', 9], [150, 90, '#FB7185', 7], [220, 150, '#FDE68A', 6],
  [180, 260, '#D9F99D', 6], [300, 500, '#FB7185', 8], [50, 530, '#FDE68A', 7], [340, 120, '#A78BFA', 5],
];

function renderStar(n: number, filled: boolean): string {
  const size = n === 2 ? 80 : 64;
  const fill = filled ? `url(#rs-star-grad-${n})` : 'rgba(255,255,255,0.25)';
  return `
    <svg class="rs-star ${filled ? '' : 'rs-star--empty'}" data-n="${n}" width="${size}" height="${size}" viewBox="0 0 80 80">
      <defs>
        <linearGradient id="rs-star-grad-${n}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FDE68A"/>
          <stop offset="1" stop-color="#F59E0B"/>
        </linearGradient>
      </defs>
      <path d="M40 6 L50 32 L78 36 L58 54 L64 80 L40 66 L16 80 L22 54 L2 36 L30 32 Z" fill="${fill}" stroke="#fff" stroke-width="2"/>
    </svg>`;
}

export class ResultScreen {
  private el: HTMLElement | null = null;

  constructor(private container: HTMLElement, private bus: GameBus) {}

  show(data: ResultData): void {
    this.hide();

    const { cleared, score, stars, levelId, pairsCompleted, maxLevelId, accuracy, timeUsed, subjectGrad, statLabels, nextFn } = data;

    if (!document.getElementById('result-style')) {
      const style = document.createElement('style');
      style.id = 'result-style';
      style.textContent = RESULT_STYLE;
      document.head.appendChild(style);
    }

    const starsHtml = [1, 2, 3].map(n => renderStar(n, n <= stars)).join('');
    const titleText = cleared ? t('result.clearTitle') : t('result.timeoverTitle');
    const eyebrowText = cleared
      ? `Level Cleared · Lv.${levelId}`
      : t('result.timeoverMessage', { n: String(pairsCompleted ?? 0) });
    const hasNext = nextFn != null || (cleared && levelId > 0 && levelId < maxLevelId);

    const labelA = statLabels?.a ?? t('result.finalScore');
    const labelB = statLabels?.b ?? '정답률';
    const labelC = statLabels?.c ?? '시간';

    const confettiSvg = `
      <svg class="rs-confetti" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        ${CONFETTI_DOTS.map(([x, y, c, s]) =>
          `<circle cx="${x}" cy="${y}" r="${s}" fill="${c}" opacity="0.85"/>`
        ).join('')}
      </svg>`;

    const el = document.createElement('div');
    el.id = 'result-screen';
    el.dataset['screen'] = 'result';
    el.dataset['stars'] = String(stars);
    el.dataset['cleared'] = cleared ? 'true' : 'false';
    el.innerHTML = `
      ${confettiSvg}
      <div class="rs-content">
        <span class="sb-eyebrow rs-eyebrow">${eyebrowText}</span>
        <h1 class="sb-display rs-title">
          <em style="color:#FDE68A">${titleText}</em>
        </h1>

        <div class="rs-stars">${starsHtml}</div>

        <div class="rs-stat-card">
          <div class="rs-stat-grid">
            <div class="rs-stat">
              <div class="rs-stat__label">${labelA}</div>
              <div class="sb-display rs-stat__val">${score.toLocaleString()}</div>
            </div>
            <div class="rs-stat">
              <div class="rs-stat__label">${labelB}</div>
              <div class="sb-display rs-stat__val">${accuracy != null ? `${accuracy}%` : `${stars}/3별`}</div>
            </div>
            <div class="rs-stat">
              <div class="rs-stat__label">${labelC}</div>
              <div class="sb-display rs-stat__val">${timeUsed != null ? `${Math.floor(timeUsed / 60)}:${String(timeUsed % 60).padStart(2, '0')}` : `Lv.${levelId}`}</div>
            </div>
          </div>
        </div>

        <div class="rs-actions">
          ${hasNext ? `<button class="rs-btn rs-btn--next rs-next">${t('result.nextLevel')} →</button>` : ''}
          <div class="rs-btn-row">
            <button class="rs-btn rs-btn--ghost rs-retry">${t('result.retry')}</button>
            <button class="rs-btn rs-btn--ghost rs-menu">${t('result.mainMenu')}</button>
          </div>
        </div>
      </div>
    `;

    el.querySelector('.rs-retry')?.addEventListener('click', () => {
      this.hide();
      this.bus.emit('ui:retry', {});
    });
    el.querySelector('.rs-next')?.addEventListener('click', () => {
      this.hide();
      if (nextFn) {
        nextFn();
      } else {
        const nextId = String(levelId + 1);
        this.bus.emit('ui:nextLevel', { levelId: nextId });
      }
    });
    el.querySelector('.rs-menu')?.addEventListener('click', () => {
      this.hide();
      this.bus.emit('ui:mainMenu', {});
    });

    if (subjectGrad) {
      el.style.setProperty('--result-grad', subjectGrad);
    }

    this.container.appendChild(el);
    this.el = el;
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
