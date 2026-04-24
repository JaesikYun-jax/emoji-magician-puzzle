import type { GameBus } from '@/game-bus';
import { t } from '@/i18n';

export class MainMenu {
  private el: HTMLElement | null = null;

  constructor(private container: HTMLElement, private bus: GameBus) {}

  show(unlockedLevels: number[]): void {
    this.hide();

    const el = document.createElement('div');
    el.id = 'main-menu';
    el.innerHTML = `
      <div class="menu-box">
        <h1 class="menu-title">${t('game.title')}</h1>
        <p class="menu-subtitle">${t('game.subtitle')}</p>
        <div class="level-buttons">
          ${[1, 2, 3].map((n) => {
            const unlocked = unlockedLevels.includes(n);
            return `
              <button
                class="level-btn ${unlocked ? 'unlocked' : 'locked'}"
                data-level="${n}"
                ${unlocked ? '' : 'disabled'}
              >
                <span class="level-num">Level ${n}</span>
                <span class="level-name">${t(`level${n}.name` as Parameters<typeof t>[0])}</span>
                ${unlocked ? '' : `<span class="lock-icon">${t('menu.locked')}</span>`}
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #main-menu {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(232, 245, 233, 0.95);
        z-index: 100;
      }
      .menu-box {
        text-align: center;
        padding: 32px 24px;
        background: #fff;
        border-radius: 24px;
        box-shadow: 0 8px 32px rgba(76,175,80,0.2);
        min-width: 280px;
      }
      .menu-title {
        font-size: 2.2rem;
        color: #2e7d32;
        margin-bottom: 8px;
      }
      .menu-subtitle {
        font-size: 1rem;
        color: #555;
        margin-bottom: 24px;
      }
      .level-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .level-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 14px 24px;
        border-radius: 16px;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        transition: transform 0.1s, box-shadow 0.1s;
      }
      .level-btn.unlocked {
        background: linear-gradient(135deg, #4caf50, #66bb6a);
        color: #fff;
        box-shadow: 0 4px 12px rgba(76,175,80,0.4);
      }
      .level-btn.unlocked:active {
        transform: scale(0.96);
        box-shadow: 0 2px 6px rgba(76,175,80,0.3);
      }
      .level-btn.locked {
        background: #e0e0e0;
        color: #aaa;
        cursor: not-allowed;
      }
      .level-num {
        font-weight: bold;
        font-size: 0.85rem;
        opacity: 0.85;
      }
      .level-name {
        font-size: 1.1rem;
        font-weight: bold;
        margin-top: 2px;
      }
      .lock-icon {
        font-size: 0.9rem;
        margin-top: 4px;
      }
    `;

    el.appendChild(style);
    this.container.appendChild(el);
    this.el = el;

    el.querySelectorAll('.level-btn.unlocked').forEach((btn) => {
      btn.addEventListener('click', () => {
        const levelId = (btn as HTMLElement).dataset['level'] ?? '1';
        this.bus.emit('game:start', { levelId });
      });
    });
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
