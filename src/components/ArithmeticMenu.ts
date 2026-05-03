import { ARITHMETIC_LEVELS } from '../game-data/arithmeticLevels';
import { arithmeticSaveService } from '../services/ArithmeticSaveService';
import { DifficultySheet } from './DifficultySheet';
import type { AppRouter } from '../router/AppRouter';
import { t } from '../i18n';
import { fadeOutAndRemove } from '../utils/fadeOutAndRemove';

const BACK_SVG = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function starDisplay(count: number): string {
  if (count === 0) return '';
  return '⭐'.repeat(count) + '☆'.repeat(3 - count);
}

export class ArithmeticMenu {
  private el: HTMLElement | null = null;
  private sheet: DifficultySheet;

  constructor(private container: HTMLElement, private router: AppRouter) {
    this.sheet = new DifficultySheet();
  }

  show(): void {
    this.hide();

    const el = document.createElement('div');
    el.classList.add('screen-root');
    el.className = 'arith-menu screen-root';

    el.innerHTML = `
      <div class="arith-menu__header">
        <button class="back-btn" type="button" style="
          width:40px; height:40px; border-radius:50%;
          background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3);
          color:#fff; display:grid; place-items:center; cursor:pointer; flex-shrink:0;
        " aria-label="뒤로가기">${BACK_SVG}</button>
        <h1>${t('arithmetic.menu.title' as never)}</h1>
        <div style="width:40px"></div>
      </div>
      <p style="text-align:center;color:rgba(255,255,255,0.75);margin:0 16px 8px;font-size:0.85rem">
        ${t('arithmetic.menu.subtitle' as never)}
      </p>
      <div class="arith-grid" id="arith-grid"></div>
    `;

    el.querySelector('.back-btn')!.addEventListener('click', () => this.router.back());

    this.container.appendChild(el);
    this.el = el;

    this.renderGrid();
  }

  hide(): void {
    if (this.el) { fadeOutAndRemove(this.el); this.el = null; }
  }

  private renderGrid(): void {
    const grid = this.el?.querySelector('#arith-grid');
    if (!grid) return;

    grid.innerHTML = '';

    ARITHMETIC_LEVELS.forEach((level, idx) => {
      const unlocked = arithmeticSaveService.isUnlocked(level.id);
      const bestStars = arithmeticSaveService.getBestStars(level.id);
      const maxStars = Math.max(bestStars.easy, bestStars.normal, bestStars.hard);
      const emoji = level.items[0]!;
      const labelName = t(level.labelKey as never);

      const card = document.createElement('div');
      card.className = `arith-card${unlocked ? '' : ' arith-card--locked'}${maxStars >= 3 ? ' arith-card--cleared' : ''}`;
      card.style.animationDelay = `${idx * 40}ms`;

      if (unlocked) {
        card.innerHTML = `
          <span class="arith-card__emoji">${emoji}</span>
          <span class="arith-card__level">Level ${level.id}</span>
          <span class="arith-card__name">${labelName}</span>
          <div class="arith-card__stars">${maxStars > 0 ? starDisplay(maxStars) : '☆☆☆'}</div>
        `;
        card.addEventListener('pointerdown', () => {
          this.openDifficultySheet(level.id);
        });
      } else {
        card.innerHTML = `
          <span class="arith-card__emoji" style="filter:grayscale(1);opacity:0.5">🔒</span>
          <span class="arith-card__level" style="opacity:0.5">Level ${level.id}</span>
          <span class="arith-card__name" style="opacity:0.4">${labelName}</span>
          <div class="arith-card__stars" style="opacity:0.3">☆☆☆</div>
        `;
        card.addEventListener('pointerdown', () => {
          card.style.animation = 'lock-shake 0.4s ease-out';
          setTimeout(() => { card.style.animation = ''; }, 400);
        });
      }

      grid.appendChild(card);
    });
  }

  private openDifficultySheet(levelId: number): void {
    const level = ARITHMETIC_LEVELS.find(l => l.id === levelId)!;
    const bestStars = arithmeticSaveService.getBestStars(levelId);
    this.sheet.open(level, bestStars, (diff) => {
      this.sheet.close();
      this.router.navigate({
        to: 'level-intro',
        levelId: `arithmetic-${levelId}`,
        difficulty: diff.id,
      });
    });
  }
}
