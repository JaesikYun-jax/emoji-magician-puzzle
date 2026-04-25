import { t } from '@/i18n';

export class HUD {
  private el: HTMLElement | null = null;
  private timeEl: HTMLElement | null = null;
  private scoreEl: HTMLElement | null = null;
  private pairsEl: HTMLElement | null = null;
  private comboEl: HTMLElement | null = null;
  private comboTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private container: HTMLElement) {}

  show(levelId: number, onExit?: () => void): void {
    this.hide();

    const el = document.createElement('div');
    el.id = 'hud';
    el.innerHTML = `
      <div class="hud-inner">
        ${onExit ? '<button class="hud-exit-btn" aria-label="나가기">🏠</button>' : ''}
        <div class="hud-item">
          <span class="hud-label">${t('hud.level')}</span>
          <span class="hud-value" id="hud-level">${levelId}</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">⏱ ${t('hud.timeLeft')}</span>
          <span class="hud-value" id="hud-time">60</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">★ ${t('hud.score')}</span>
          <span class="hud-value" id="hud-score">0</span>
        </div>
        <div class="hud-item">
          <span class="hud-label">🍉 ${t('hud.pairsLeft')}</span>
          <span class="hud-value" id="hud-pairs">10</span>
        </div>
      </div>
      <div id="hud-combo" class="hud-combo"></div>
    `;

    this.container.appendChild(el);
    this.el = el;
    this.timeEl = document.getElementById('hud-time');
    this.scoreEl = document.getElementById('hud-score');
    this.pairsEl = document.getElementById('hud-pairs');
    this.comboEl = document.getElementById('hud-combo');

    if (onExit) {
      el.querySelector<HTMLButtonElement>('.hud-exit-btn')!
        .addEventListener('click', onExit);
    }
  }

  update(remaining: number, score: number, pairsLeft: number, combo?: number): void {
    if (this.timeEl) {
      this.timeEl.textContent = String(Math.max(0, remaining));
      this.timeEl.classList.toggle('urgent', remaining <= 10);
    }
    if (this.scoreEl) this.scoreEl.textContent = String(score);
    if (this.pairsEl) this.pairsEl.textContent = String(Math.max(0, pairsLeft));

    if (this.comboEl && combo !== undefined) {
      if (combo >= 2) {
        const fires = combo >= 4 ? '🔥🔥🔥' : combo === 3 ? '🔥🔥' : '🔥';
        this.comboEl.textContent = `${fires} ${combo} COMBO!`;
        this.comboEl.style.opacity = '1';
        // combo-burst 재트리거를 위해 animation 리셋
        this.comboEl.style.animation = 'none';
        void this.comboEl.offsetWidth;
        this.comboEl.style.animation = 'combo-burst 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards';

        if (this.comboTimeout !== null) clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => {
          if (this.comboEl) this.comboEl.style.opacity = '0';
          this.comboTimeout = null;
        }, 1500);
      } else if (combo === 0) {
        if (this.comboTimeout !== null) {
          clearTimeout(this.comboTimeout);
          this.comboTimeout = null;
        }
        this.comboEl.style.opacity = '0';
        this.comboEl.textContent = '';
      }
    }
  }

  hide(): void {
    if (this.comboTimeout !== null) {
      clearTimeout(this.comboTimeout);
      this.comboTimeout = null;
    }
    if (this.el) {
      this.el.remove();
      this.el = null;
      this.timeEl = null;
      this.scoreEl = null;
      this.pairsEl = null;
      this.comboEl = null;
    }
  }
}
