import type { ArithmeticLevel } from '../game-data/arithmeticLevels';
import { DIFFICULTY_CONFIGS, type DifficultyConfig } from '../systems/math/arithmeticQuiz';
import type { LevelBestStars } from '../services/ArithmeticSaveService';
import { t } from '../i18n';

function starDisplay(count: number): string {
  return '⭐'.repeat(count) + '☆'.repeat(3 - count);
}

export class DifficultySheet {
  private overlay: HTMLElement | null = null;

  open(
    level: ArithmeticLevel,
    bestStars: LevelBestStars,
    onSelect: (diff: DifficultyConfig) => void,
  ): void {
    this.close();

    const overlay = document.createElement('div');
    overlay.className = 'arith-sheet__overlay';

    const levelName = t(level.labelKey as never);

    const panel = document.createElement('div');
    panel.className = 'arith-sheet';
    panel.style.animation = 'sheet-slide-up 300ms ease-out';

    const diffs: Array<{ key: 'easy' | 'normal' | 'hard'; labelKey: string; descKey: string }> = [
      { key: 'easy',   labelKey: 'arithmetic.diff.easy',   descKey: 'arithmetic.diff.easy.desc'   },
      { key: 'normal', labelKey: 'arithmetic.diff.normal', descKey: 'arithmetic.diff.normal.desc' },
      { key: 'hard',   labelKey: 'arithmetic.diff.hard',   descKey: 'arithmetic.diff.hard.desc'   },
    ];

    panel.innerHTML = `
      <div class="arith-sheet__handle"></div>
      <h2>Level ${level.id} · ${levelName}</h2>
      ${diffs.map(d => `
        <button class="arith-diff-btn arith-diff-btn--${d.key}" data-diff="${d.key}" type="button">
          <span>${t(d.labelKey as never)}</span>
          <span style="font-size:0.8rem;opacity:0.85">${t(d.descKey as never)}</span>
          <span style="font-size:0.85rem">${starDisplay(bestStars[d.key])}</span>
        </button>
      `).join('')}
      <button class="arith-diff-cancel" type="button">${t('arithmetic.diff.cancel' as never)}</button>
    `;

    overlay.appendChild(panel);

    panel.querySelectorAll<HTMLButtonElement>('.arith-diff-btn').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        const diffKey = btn.dataset['diff'] as 'easy' | 'normal' | 'hard';
        onSelect(DIFFICULTY_CONFIGS[diffKey]);
      });
    });

    panel.querySelector('.arith-diff-cancel')!.addEventListener('pointerdown', () => {
      this.close();
    });

    overlay.addEventListener('pointerdown', (e) => {
      if (e.target === overlay) this.close();
    });

    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  close(): void {
    if (!this.overlay) return;
    const panel = this.overlay.querySelector('.arith-sheet') as HTMLElement | null;
    if (panel) {
      panel.style.animation = 'sheet-slide-down 300ms ease-in';
      const overlayRef = this.overlay;
      this.overlay = null;
      setTimeout(() => overlayRef.remove(), 300);
    } else {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
