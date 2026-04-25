import type { AppRouter } from '../router/AppRouter';
import type { MathOperation } from '../game-data/subjectConfig';
import { MATH_LEVELS } from '../game-data/mathLevels';
import { EQ_FILL_LEVELS } from '../game-data/equationFillLevels';
import { PATTERN_FINDER_LEVELS } from '../game-data/patternFinderLevels';
import type { SaveService } from '../services/SaveService';
import { t } from '../i18n';

const MATH_MENU_STYLE = `
#math-menu {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 80% 50% at 0% 0%, rgba(217,249,157,0.12), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(253,230,138,0.10), transparent 60%),
    linear-gradient(165deg, #0C4A6E 0%, #0369A1 55%, #0EA5E9 100%);
  z-index: 20;
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
  overflow: hidden;
}
#math-menu::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
  opacity: 0.2;
  pointer-events: none;
  z-index: 0;
}
#math-menu > * { position: relative; z-index: 1; }

#math-menu .mm-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 14px;
}
#math-menu .mm-back-btn {
  width: 42px;
  height: 42px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  cursor: pointer;
  border-radius: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 150ms, background 150ms;
}
#math-menu .mm-back-btn:hover { background: rgba(255,255,255,0.14); }
#math-menu .mm-back-btn:active { transform: scale(0.92); }

#math-menu .mm-title-wrap { display: flex; flex-direction: column; gap: 2px; }
#math-menu .mm-eyebrow {
  color: #D9F99D;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
#math-menu .mm-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  font-variation-settings: 'opsz' 72, 'SOFT' 60;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

#math-menu .mm-tabs {
  display: flex;
  gap: 6px;
  padding: 0 16px 8px;
  overflow-x: auto;
  flex-wrap: nowrap;
  scrollbar-width: none;
}
#math-menu .mm-tabs::-webkit-scrollbar { display: none; }
#math-menu .mm-tab {
  padding: 10px 16px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.70);
  cursor: pointer;
  border-radius: 999px;
  transition: all 200ms;
  white-space: nowrap;
  flex-shrink: 0;
}
#math-menu .mm-tab:hover { color: #fff; border-color: rgba(255,255,255,0.28); }
#math-menu .mm-tab.active {
  color: #0C4A6E;
  background: #D9F99D;
  border-color: #D9F99D;
  box-shadow: 0 6px 20px rgba(217, 249, 157, 0.35);
}

#math-menu .mm-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 20px 16px 32px;
  overflow-y: auto;
  align-content: start;
  max-width: 560px;
  margin: 0 auto;
  width: 100%;
}

#math-menu .mm-cell {
  aspect-ratio: 1;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  transition: transform 250ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 250ms, border-color 250ms;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}
#math-menu .mm-cell:active { transform: scale(0.94); }

#math-menu .mm-cell.unlocked {
  background: rgba(255,255,255,0.08);
  color: #fff;
  box-shadow: 0 4px 18px rgba(3, 105, 161, 0.35);
}
#math-menu .mm-cell.unlocked:hover {
  transform: translateY(-3px);
  border-color: rgba(217, 249, 157, 0.45);
  background: rgba(255,255,255,0.12);
  box-shadow: 0 8px 28px rgba(217, 249, 157, 0.25);
}
#math-menu .mm-cell.locked {
  background: rgba(0,0,0,0.2);
  color: rgba(255,255,255,0.25);
  cursor: default;
  border-color: rgba(255,255,255,0.06);
}
#math-menu .mm-cell .mm-lv {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: 0.78rem;
  margin-bottom: 4px;
  opacity: 0.72;
  letter-spacing: -0.01em;
}
#math-menu .mm-cell .mm-stars {
  font-size: 0.9rem;
  letter-spacing: 2px;
  color: #FDE68A;
  text-shadow: 0 0 8px rgba(253, 230, 138, 0.35);
}
#math-menu .mm-cell .mm-lock { font-size: 1.1rem; opacity: 0.6; }

#math-menu .lt-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 8px 16px;
  padding: 16px 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(253, 230, 138, 0.18), rgba(251, 113, 133, 0.18));
  border: 1px solid rgba(253, 230, 138, 0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  text-align: left;
  width: calc(100% - 32px);
  max-width: 528px;
  margin-inline: auto;
  transition: transform 250ms, border-color 250ms, box-shadow 250ms;
  position: relative;
  overflow: hidden;
}
#math-menu .lt-banner:hover {
  transform: translateY(-2px);
  border-color: rgba(253, 230, 138, 0.6);
  box-shadow: 0 12px 36px rgba(253, 230, 138, 0.25);
}
#math-menu .lt-banner:active { transform: scale(0.98); }
#math-menu .lt-banner-icon {
  width: 44px; height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #FDE68A, #FB7185);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(251, 113, 133, 0.4);
}
#math-menu .lt-banner-text { flex: 1; }
#math-menu .lt-banner-title {
  display: block;
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  font-variation-settings: 'opsz' 72;
  font-size: 1rem; font-weight: 700; color: #fff;
  line-height: 1.2;
  letter-spacing: -0.02em;
}
#math-menu .lt-banner-sub {
  display: block; font-size: 0.78rem;
  color: rgba(255,255,255,0.75); margin-top: 3px;
}
#math-menu .lt-banner-arrow {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  transition: transform 200ms, background 200ms;
}
#math-menu .lt-banner:hover .lt-banner-arrow {
  transform: translateX(3px);
  background: rgba(217, 249, 157, 0.25);
  color: #D9F99D;
}

@keyframes mm-cell-pulse {
  0%, 100% { box-shadow: 0 4px 18px rgba(3,105,161,0.35); }
  50% { box-shadow: 0 4px 32px rgba(253,230,138,0.8), 0 0 0 4px rgba(253,230,138,0.4); }
}
#math-menu .mm-cell-highlight { animation: mm-cell-pulse 800ms ease-in-out 3; }

@media (prefers-reduced-motion: reduce) {
  #math-menu .mm-cell, #math-menu .lt-banner { transition: none; }
}
`;

type MathTab = MathOperation | 'eq-fill' | 'pat-find';

const TAB_LABELS: Record<MathTab, () => string> = {
  addition:       () => t('math.operation.addition'),
  subtraction:    () => t('math.operation.subtraction'),
  multiplication: () => t('math.operation.multiplication'),
  'eq-fill':      () => t('math.eqFill.tabLabel'),
  'pat-find':     () => t('patFind.tabLabel'),
};

const TABS: MathTab[] = ['addition', 'subtraction', 'multiplication', 'eq-fill', 'pat-find'];

export class MathMenu {
  private el: HTMLElement | null = null;
  private activeTab: MathTab = 'addition';
  private unlockedIds: Set<string> = new Set(['math-add-single-1']);

  constructor(private container: HTMLElement, private router: AppRouter, private saveService?: SaveService) {}

  setUnlocked(ids: string[]): void {
    this.unlockedIds = new Set(ids);
  }

  show(): void {
    this.hide();
    if (this.saveService) {
      this.unlockedIds = new Set(this.saveService.getUnlockedMathIds());
    }

    if (!document.getElementById('math-menu-style')) {
      const style = document.createElement('style');
      style.id = 'math-menu-style';
      style.textContent = MATH_MENU_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'math-menu';
    el.innerHTML = `
      <div class="mm-header">
        <button class="mm-back-btn" aria-label="back">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="mm-title-wrap">
          <span class="mm-eyebrow">Math · 수학</span>
          <span class="mm-title">${t('subject.math')}</span>
        </div>
      </div>
      <div class="mm-tabs">
        ${TABS.map((tab) => `
          <button class="mm-tab ${tab === this.activeTab ? 'active' : ''}" data-tab="${tab}">
            ${TAB_LABELS[tab]()}
          </button>
        `).join('')}
      </div>
      <button class="lt-banner" id="mm-arith-banner">
        <span class="lt-banner-icon">🍉</span>
        <div class="lt-banner-text">
          <span class="lt-banner-title">과일 셈하기</span>
          <span class="lt-banner-sub">이미지로 익히는 직관적 수연산</span>
        </div>
        <span class="lt-banner-arrow">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>
      <button class="lt-banner" id="mm-lt-banner">
        <span class="lt-banner-icon">🧪</span>
        <div class="lt-banner-text">
          <span class="lt-banner-title">내 레벨 찾기</span>
          <span class="lt-banner-sub">5문제로 딱 맞는 레벨을 찾아줄게요</span>
        </div>
        <span class="lt-banner-arrow">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>
      <div class="mm-grid" id="mm-grid"></div>
    `;

    el.querySelector('.mm-back-btn')!.addEventListener('click', () => {
      this.router.back();
    });

    el.querySelector('#mm-lt-banner')!.addEventListener('click', () => {
      this.router.navigate({ to: 'level-test-math', subject: 'math' });
    });

    el.querySelector('#mm-arith-banner')!.addEventListener('click', () => {
      this.router.navigate({ to: 'arithmetic-menu', subject: 'math' });
    });

    el.querySelectorAll('.mm-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        this.activeTab = (tab as HTMLElement).dataset['tab'] as MathTab;
        el.querySelectorAll('.mm-tab').forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        this.renderGrid(el.querySelector('#mm-grid') as HTMLElement);
      });
    });

    this.container.appendChild(el);
    this.el = el;

    this.renderGrid(el.querySelector('#mm-grid') as HTMLElement);

    const state = this.router.getState();
    if (state.highlightLevelId) {
      const highlightId = state.highlightLevelId;
      setTimeout(() => {
        const cell = el.querySelector(`[data-levelid="${highlightId}"]`);
        if (cell) cell.classList.add('mm-cell-highlight');
      }, 100);
    }
  }

  private renderGrid(grid: HTMLElement): void {
    // ── 규칙 찾기 탭 ──────────────────────────────────────────────────────────
    if (this.activeTab === 'pat-find') {
      const unlockedPatIds = this._computePatFindUnlocked();
      grid.innerHTML = PATTERN_FINDER_LEVELS.map((lv) => {
        const unlocked = unlockedPatIds.has(lv.id);
        const progress = this.saveService?.getMathProgress(lv.id);
        const stars    = progress?.stars ?? 0;
        const starStr  = unlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
        return `
          <button
            class="mm-cell ${unlocked ? 'unlocked' : 'locked'}"
            data-levelid="${lv.id}"
            ${unlocked ? '' : 'disabled'}
          >
            <span class="mm-lv">Lv ${lv.levelIndex}</span>
            ${unlocked
              ? `<span class="mm-stars">${starStr}</span>`
              : `<span class="mm-lock">&#128274;</span>`
            }
          </button>
        `;
      }).join('');

      grid.querySelectorAll('.mm-cell.unlocked').forEach((cell) => {
        cell.addEventListener('click', () => {
          const levelId = (cell as HTMLElement).dataset['levelid']!;
          this.router.navigate({ to: 'game-pattern-finder', subject: 'math', levelId });
        });
      });
      return;
    }

    // ── 심화(등식 완성) 탭 ─────────────────────────────────────────────────
    if (this.activeTab === 'eq-fill') {
      // 첫 레벨은 항상 잠금 해제, 이후는 이전 레벨 클리어 시 해제
      // (저장 데이터 없으면 eq-fill-1 만 해제)
      const unlockedEqIds = this._computeEqFillUnlocked();
      grid.innerHTML = EQ_FILL_LEVELS.map((lv) => {
        const unlocked = unlockedEqIds.has(lv.id);
        const progress = this.saveService?.getMathProgress(lv.id);
        const stars    = progress?.stars ?? 0;
        const starStr  = unlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
        return `
          <button
            class="mm-cell ${unlocked ? 'unlocked' : 'locked'}"
            data-levelid="${lv.id}"
            ${unlocked ? '' : 'disabled'}
          >
            <span class="mm-lv">Lv ${lv.levelIndex}</span>
            ${unlocked
              ? `<span class="mm-stars">${starStr}</span>`
              : `<span class="mm-lock">&#128274;</span>`
            }
          </button>
        `;
      }).join('');

      grid.querySelectorAll('.mm-cell.unlocked').forEach((cell) => {
        cell.addEventListener('click', () => {
          const levelId = (cell as HTMLElement).dataset['levelid']!;
          this.router.navigate({ to: 'game-eq-fill', subject: 'math', levelId });
        });
      });
      return;
    }

    // ── 일반 수학 탭 (덧셈/뺄셈/곱셈) ────────────────────────────────────
    const levels = MATH_LEVELS.filter((l) => l.operation === this.activeTab);
    grid.innerHTML = levels
      .map((lv) => {
        const unlocked = this.unlockedIds.has(lv.id);
        const progress = this.saveService?.getMathProgress(lv.id);
        const stars = progress?.stars ?? 0;
        const starStr = unlocked ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '';
        return `
          <button
            class="mm-cell ${unlocked ? 'unlocked' : 'locked'}"
            data-levelid="${lv.id}"
            ${unlocked ? '' : 'disabled'}
          >
            <span class="mm-lv">Lv ${lv.levelIndex}</span>
            ${unlocked
              ? `<span class="mm-stars">${starStr}</span>`
              : `<span class="mm-lock">&#128274;</span>`
            }
          </button>
        `;
      })
      .join('');

    grid.querySelectorAll('.mm-cell.unlocked').forEach((cell) => {
      cell.addEventListener('click', () => {
        const levelId = (cell as HTMLElement).dataset['levelid']!;
        this.router.navigate({ to: 'level-intro', subject: 'math', levelId });
      });
    });
  }

  /** eq-fill 잠금 해제 레벨 계산: Lv1 + 이전 레벨 클리어된 것들 */
  private _computeEqFillUnlocked(): Set<string> {
    const unlocked = new Set<string>(['eq-fill-1']);
    for (let i = 1; i < EQ_FILL_LEVELS.length; i++) {
      const prevId = EQ_FILL_LEVELS[i - 1]!.id;
      const prevProgress = this.saveService?.getMathProgress(prevId);
      if (prevProgress && prevProgress.stars >= 1) {
        unlocked.add(EQ_FILL_LEVELS[i]!.id);
      }
    }
    return unlocked;
  }

  private _computePatFindUnlocked(): Set<string> {
    const unlocked = new Set<string>(['pat-find-1']);
    for (let i = 1; i < PATTERN_FINDER_LEVELS.length; i++) {
      const prevId = PATTERN_FINDER_LEVELS[i - 1]!.id;
      const prevProgress = this.saveService?.getMathProgress(prevId);
      if (prevProgress && prevProgress.stars >= 1) {
        unlocked.add(PATTERN_FINDER_LEVELS[i]!.id);
      }
    }
    return unlocked;
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
