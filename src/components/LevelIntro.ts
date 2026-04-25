import type { GameBus } from '@/game-bus';
import { t } from '@/i18n';
import { G1_LEVELS } from '@/game-data/g1Levels';
import { appRouter } from '@/router/AppRouter';

const LEVEL_INTRO_STYLE = `
#level-intro {
  position: fixed; inset: 0; z-index: 200;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 0 30px;
  background: linear-gradient(165deg, #0369A1 0%, #0EA5E9 100%);
  color: #fff;
  font-family: var(--f-kr);
  animation: li-fade-in 250ms ease;
  overflow: hidden;
}
@keyframes li-fade-in { from { opacity: 0 } to { opacity: 1 } }

#level-intro .li-rings {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
#level-intro .li-ring {
  position: absolute; top: 50%; left: 50%;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  transform: translate(-50%, -50%);
}

#level-intro .li-content {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}
#level-intro .li-eyebrow { color: #FDE68A; }

#level-intro .li-count-wrap {
  margin-top: 18px; width: 200px; height: 200px;
  border-radius: 50%;
  background: rgba(255,255,255,0.14);
  border: 2px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  display: grid; place-items: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.35);
}
#level-intro .li-count {
  font-family: var(--f-display);
  font-size: 140px; line-height: 1; color: #FDE68A;
  font-weight: 800; letter-spacing: 0;
  font-variation-settings: 'opsz' 144, 'SOFT' 60;
  font-feature-settings: 'tnum' 1;
  display: block; text-align: center; width: 100%;
  transition: transform 200ms, opacity 200ms;
}
#level-intro .li-count--go { color: #D9F99D; }

#level-intro .li-title {
  font-size: 30px; margin-top: 32px; text-align: center;
}
#level-intro .li-meta {
  display: flex; gap: 16px; margin-top: 24px;
  font-family: var(--f-sans); font-size: 12px;
  letter-spacing: 0.12em; text-transform: uppercase;
  opacity: 0.8; font-weight: 700;
}
`;

export class LevelIntro {
  private el: HTMLElement | null = null;
  private _pendingTimers: number[] = [];

  constructor(private container: HTMLElement, private bus: GameBus) {}

  show(levelId: number): void {
    this.hide();

    const level = G1_LEVELS.find(l => l.levelId === levelId) ?? G1_LEVELS[0]!;

    if (!document.getElementById('level-intro-style')) {
      const style = document.createElement('style');
      style.id = 'level-intro-style';
      style.textContent = LEVEL_INTRO_STYLE;
      document.head.appendChild(style);
    }

    const rings = [260, 360, 460, 560]
      .map(s => `<div class="li-ring" style="width:${s}px;height:${s}px;"></div>`)
      .join('');

    const timeSec = level.timeLimit ?? 60;
    const timeLabel = timeSec >= 60
      ? `${Math.floor(timeSec / 60)}분`
      : `${timeSec}초`;
    const pairsLabel = `✦ ${level.targetPairs}쌍`;

    const el = document.createElement('div');
    el.id = 'level-intro';
    el.innerHTML = `
      <div class="li-rings">${rings}</div>
      <div class="li-content">
        <span class="sb-eyebrow li-eyebrow">Lv.${level.levelId} · ${level.name}</span>
        <div class="li-count-wrap">
          <span class="li-count sb-display" id="intro-count">3</span>
        </div>
        <h2 class="sb-display li-title">${t('intro.goal')}</h2>
        <div class="li-meta">
          <span>⏱ ${timeLabel}</span><span>·</span><span>${pairsLabel}</span>
        </div>
      </div>
    `;

    // 뒤로가기 버튼 (카운트다운 취소용)
    const backBtn = document.createElement('button');
    backBtn.setAttribute('aria-label', '뒤로가기');
    backBtn.style.cssText = `
      position: absolute;
      top: 16px; left: 16px;
      width: 40px; height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #fff;
      display: grid; place-items: center;
      cursor: pointer;
      touch-action: manipulation;
      z-index: 10;
    `;
    backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
    backBtn.addEventListener('click', () => {
      this.hide();
      appRouter.back();
    });
    el.appendChild(backBtn);

    this.container.appendChild(el);
    this.el = el;

    this.runCountdown(levelId);
  }

  private runCountdown(levelId: number): void {
    const countEl = document.getElementById('intro-count');
    if (!countEl) return;

    let count = 3;
    const tick = (): void => {
      if (!this.el) return; // hide()로 취소된 경우
      if (count > 0) {
        countEl.textContent = String(count);
        countEl.style.transform = 'scale(1.15)';
        countEl.style.opacity = '1';
        this._pendingTimers.push(window.setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 200));
        count--;
        this._pendingTimers.push(window.setTimeout(tick, 1000));
      } else {
        countEl.textContent = t('intro.go');
        countEl.classList.add('li-count--go');
        countEl.style.transform = 'scale(1.25)';
        this._pendingTimers.push(window.setTimeout(() => {
          this.hide();
          this.bus.emit('game:start', { levelId: String(levelId) });
        }, 700));
      }
    };
    this._pendingTimers.push(window.setTimeout(tick, 300));
  }

  hide(): void {
    this._pendingTimers.forEach(id => clearTimeout(id));
    this._pendingTimers = [];
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
