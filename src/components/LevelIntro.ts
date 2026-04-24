import type { GameBus } from '@/game-bus';
import { t } from '@/i18n';
import { G1_LEVELS } from '@/game-data/g1Levels';

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
          <span>⏱ 60s</span><span>·</span><span>✦ ${t('intro.hint')}</span>
        </div>
      </div>
    `;

    this.container.appendChild(el);
    this.el = el;

    this.runCountdown(levelId);
  }

  private runCountdown(levelId: number): void {
    const countEl = document.getElementById('intro-count');
    if (!countEl) return;

    let count = 3;
    const tick = (): void => {
      if (count > 0) {
        countEl.textContent = String(count);
        countEl.style.transform = 'scale(1.15)';
        countEl.style.opacity = '1';
        setTimeout(() => { countEl.style.transform = 'scale(1)'; }, 200);
        count--;
        setTimeout(tick, 1000);
      } else {
        countEl.textContent = t('intro.go');
        countEl.classList.add('li-count--go');
        countEl.style.transform = 'scale(1.25)';
        setTimeout(() => {
          this.hide();
          this.bus.emit('game:start', { levelId: String(levelId) });
        }, 700);
      }
    };
    setTimeout(tick, 300);
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
