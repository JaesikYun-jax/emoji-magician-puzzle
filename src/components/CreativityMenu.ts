/**
 * CreativityMenu.ts
 * 창의 종목 레벨 선택 메뉴 — 오렌지 그라디언트 배경
 */

import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
import { CREATIVITY_LEVELS } from '../game-data/creativityLevels';
import { t } from '../i18n';

const CREATIVITY_MENU_STYLE = `
#creativity-menu {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 80% 50% at 0% 0%, rgba(251,146,60,0.18), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(249,115,22,0.15), transparent 60%),
    linear-gradient(165deg, #431407 0%, #7C2D12 50%, #C2410C 100%);
  z-index: 20;
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
  overflow: hidden;
}
#creativity-menu::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
  opacity: 0.2;
  pointer-events: none;
  z-index: 0;
}
#creativity-menu > * { position: relative; z-index: 1; }

#creativity-menu .cm-decor {
  position: absolute;
  color: rgba(255,255,255,0.05);
  pointer-events: none;
  user-select: none;
  font-size: 160px;
  font-weight: 900;
  z-index: 0;
  animation: cm-drift 16s ease-in-out infinite;
}
#creativity-menu .cm-decor--1 { top: 10%; left: -20px; animation-delay: 0s; }
#creativity-menu .cm-decor--2 { bottom: 8%; right: -20px; font-size: 200px; animation-delay: 4s; }
@keyframes cm-drift {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  50%      { transform: translate(10px,-14px) rotate(-4deg); }
}

#creativity-menu .cm-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 14px;
}
#creativity-menu .cm-back-btn {
  width: 42px; height: 42px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  cursor: pointer;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 150ms, background 150ms;
}
#creativity-menu .cm-back-btn:hover { background: rgba(255,255,255,0.14); }
#creativity-menu .cm-back-btn:active { transform: scale(0.92); }

#creativity-menu .cm-title-wrap { display: flex; flex-direction: column; gap: 2px; }
#creativity-menu .cm-eyebrow {
  color: #FED7AA;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
#creativity-menu .cm-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

#creativity-menu .cm-subtitle {
  color: rgba(255,255,255,0.72);
  font-size: 0.88rem;
  padding: 0 24px 16px;
  line-height: 1.5;
}

#creativity-menu .cm-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  padding: 8px 20px 40px;
  overflow-y: auto;
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

#creativity-menu .cm-level-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #fff;
  cursor: pointer;
  text-align: center;
  transition: transform 200ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 200ms, border-color 200ms;
  min-height: 110px;
  box-shadow: 0 4px 16px rgba(249,115,22,0.20);
}
#creativity-menu .cm-level-btn:hover:not(.locked) {
  transform: translateY(-4px);
  border-color: rgba(251,146,60,0.50);
  box-shadow: 0 8px 28px rgba(249,115,22,0.40);
}
#creativity-menu .cm-level-btn:active:not(.locked) {
  transform: scale(0.96);
}
#creativity-menu .cm-level-btn.locked {
  opacity: 0.5;
  cursor: default;
}

#creativity-menu .cm-level-num {
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
#creativity-menu .cm-level-icon {
  font-size: 2rem;
  margin-bottom: 6px;
}
#creativity-menu .cm-level-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.90);
  line-height: 1.3;
}
#creativity-menu .cm-grid-info {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.55);
  margin-top: 4px;
}
#creativity-menu .cm-stars {
  margin-top: 8px;
  font-size: 0.9rem;
  letter-spacing: 2px;
}
`;

const LEVEL_ICONS = ['✏️','🎨','🖊️','🌈','🎭','🖌️','🎪','🏄','🌟','👑'];
const LEVEL_NAMES = [
  '첫 획', '구멍 피하기', '직사각형', '빈 칸 돌기',
  '4×4 도전', '두 구멍', '넓어진 판', '가장자리 함정',
  '5×5 미로', '달인의 경로',
];

export class CreativityMenu {
  private el: HTMLElement | null = null;

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService: SaveService,
  ) {}

  show(): void {
    this.hide();

    if (!document.getElementById('creativity-menu-style')) {
      const style = document.createElement('style');
      style.id = 'creativity-menu-style';
      style.textContent = CREATIVITY_MENU_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'creativity-menu';

    el.innerHTML = `
      <div class="cm-decor cm-decor--1">⌒</div>
      <div class="cm-decor cm-decor--2">~</div>
    `;

    // 헤더
    const header = document.createElement('div');
    header.className = 'cm-header';
    const backBtn = document.createElement('button');
    backBtn.className = 'cm-back-btn';
    backBtn.setAttribute('aria-label', 'back');
    backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    backBtn.addEventListener('click', () => this.router.back());
    const titleWrap = document.createElement('div');
    titleWrap.className = 'cm-title-wrap';
    titleWrap.innerHTML = `
      <span class="cm-eyebrow">Creativity · 창의</span>
      <span class="cm-title">${t('creativity.title')}</span>
    `;
    header.appendChild(backBtn);
    header.appendChild(titleWrap);
    el.appendChild(header);

    const subtitle = document.createElement('p');
    subtitle.className = 'cm-subtitle';
    subtitle.textContent = t('creativity.subtitle');
    el.appendChild(subtitle);

    // 레벨 그리드
    const grid = document.createElement('div');
    grid.className = 'cm-grid';

    CREATIVITY_LEVELS.forEach((level, idx) => {
      const progress = this.saveService.getCreativityProgress(level.id);
      const isUnlocked = progress.isUnlocked;

      const btn = document.createElement('button');
      btn.className = `cm-level-btn${isUnlocked ? '' : ' locked'}`;

      const starsHtml = Array.from({ length: 3 }, (_, i) =>
        `<span style="color:${i < progress.stars ? '#FBBF24' : 'rgba(255,255,255,0.25)'}">${i < progress.stars ? '★' : '☆'}</span>`
      ).join('');

      btn.innerHTML = `
        <div class="cm-level-num">LEVEL ${idx + 1}</div>
        <div class="cm-level-icon">${isUnlocked ? (LEVEL_ICONS[idx] ?? '✏️') : '🔒'}</div>
        <div class="cm-level-name">${LEVEL_NAMES[idx] ?? level.id}</div>
        <div class="cm-grid-info">${level.cols}×${level.rows}</div>
        <div class="cm-stars">${starsHtml}</div>
      `;

      if (isUnlocked) {
        btn.addEventListener('click', () => {
          this.router.navigate({
            to: 'game-creativity',
            subject: 'creativity',
            levelId: level.id,
          });
        });
      }

      grid.appendChild(btn);
    });

    el.appendChild(grid);
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
