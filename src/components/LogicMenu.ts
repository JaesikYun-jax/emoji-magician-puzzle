/**
 * LogicMenu.ts
 * 논리 종목 레벨 선택 메뉴 — 인디고 그라디언트 배경
 */

import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
import { LOGIC_LEVELS } from '../game-data/logicLevels';
import { t } from '../i18n';

const LOGIC_MENU_STYLE = `
#logic-menu {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 80% 50% at 0% 0%, rgba(129,140,248,0.18), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(99,102,241,0.15), transparent 60%),
    linear-gradient(165deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%);
  z-index: 20;
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
  overflow: hidden;
}
#logic-menu::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
  opacity: 0.2;
  pointer-events: none;
  z-index: 0;
}
#logic-menu > * { position: relative; z-index: 1; }

#logic-menu .lm-decor {
  position: absolute;
  color: rgba(255,255,255,0.05);
  pointer-events: none;
  user-select: none;
  font-size: 160px;
  font-weight: 900;
  z-index: 0;
  animation: lm-drift 16s ease-in-out infinite;
}
#logic-menu .lm-decor--1 { top: 10%; left: -20px; animation-delay: 0s; }
#logic-menu .lm-decor--2 { bottom: 8%; right: -20px; font-size: 200px; animation-delay: 4s; }
@keyframes lm-drift {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  50%      { transform: translate(10px,-14px) rotate(5deg); }
}

#logic-menu .lm-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 14px;
}
#logic-menu .lm-back-btn {
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
#logic-menu .lm-back-btn:hover { background: rgba(255,255,255,0.14); }
#logic-menu .lm-back-btn:active { transform: scale(0.92); }

#logic-menu .lm-title-wrap { display: flex; flex-direction: column; gap: 2px; }
#logic-menu .lm-eyebrow {
  color: #C7D2FE;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
#logic-menu .lm-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

#logic-menu .lm-subtitle {
  color: rgba(255,255,255,0.72);
  font-size: 0.88rem;
  padding: 0 24px 16px;
  line-height: 1.5;
}

#logic-menu .lm-grid {
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

#logic-menu .lm-level-btn {
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
  box-shadow: 0 4px 16px rgba(99,102,241,0.20);
}
#logic-menu .lm-level-btn:hover:not(.locked) {
  transform: translateY(-4px);
  border-color: rgba(129,140,248,0.50);
  box-shadow: 0 8px 28px rgba(99,102,241,0.40);
}
#logic-menu .lm-level-btn:active:not(.locked) {
  transform: scale(0.96);
}
#logic-menu .lm-level-btn.locked {
  opacity: 0.5;
  cursor: default;
}

#logic-menu .lm-level-num {
  font-size: 0.68rem;
  font-weight: 700;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
#logic-menu .lm-level-icon {
  font-size: 2rem;
  margin-bottom: 6px;
}
#logic-menu .lm-level-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255,255,255,0.90);
  line-height: 1.3;
}
#logic-menu .lm-stars {
  margin-top: 8px;
  font-size: 0.9rem;
  letter-spacing: 2px;
  color: #FBBF24;
}
`;

const LEVEL_ICONS = ['🧩','🔢','🔮','📊','🌀','🧮','⚙️','🎯','🏆','👑'];
const LEVEL_NAMES = [
  '첫 번째 패턴', '등차수열', '피보나치의 비밀', '기하급수',
  '혼합 패턴', '제곱수의 세계', '복합 수열', '교대 규칙',
  '패턴 마스터', '전설의 수열',
];

export class LogicMenu {
  private el: HTMLElement | null = null;

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService: SaveService,
  ) {}

  show(): void {
    this.hide();

    if (!document.getElementById('logic-menu-style')) {
      const style = document.createElement('style');
      style.id = 'logic-menu-style';
      style.textContent = LOGIC_MENU_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'logic-menu';

    el.innerHTML = `
      <div class="lm-decor lm-decor--1">∑</div>
      <div class="lm-decor lm-decor--2">∞</div>
    `;

    // 헤더
    const header = document.createElement('div');
    header.className = 'lm-header';
    const backBtn = document.createElement('button');
    backBtn.className = 'lm-back-btn';
    backBtn.setAttribute('aria-label', 'back');
    backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    backBtn.addEventListener('click', () => this.router.back());
    const titleWrap = document.createElement('div');
    titleWrap.className = 'lm-title-wrap';
    titleWrap.innerHTML = `
      <span class="lm-eyebrow">Logic · 논리</span>
      <span class="lm-title">${t('logic.title')}</span>
    `;
    header.appendChild(backBtn);
    header.appendChild(titleWrap);
    el.appendChild(header);

    const subtitle = document.createElement('p');
    subtitle.className = 'lm-subtitle';
    subtitle.textContent = t('logic.subtitle');
    el.appendChild(subtitle);

    // 레벨 그리드
    const grid = document.createElement('div');
    grid.className = 'lm-grid';

    LOGIC_LEVELS.forEach((level, idx) => {
      const progress = this.saveService.getLogicProgress(level.id);
      const isUnlocked = progress.isUnlocked;

      const btn = document.createElement('button');
      btn.className = `lm-level-btn${isUnlocked ? '' : ' locked'}`;

      const starsHtml = Array.from({ length: 3 }, (_, i) =>
        `<span style="color:${i < progress.stars ? '#FBBF24' : 'rgba(255,255,255,0.25)'}">${i < progress.stars ? '★' : '☆'}</span>`
      ).join('');

      btn.innerHTML = `
        <div class="lm-level-num">LEVEL ${idx + 1}</div>
        <div class="lm-level-icon">${isUnlocked ? (LEVEL_ICONS[idx] ?? '🧩') : '🔒'}</div>
        <div class="lm-level-name">${LEVEL_NAMES[idx] ?? level.id}</div>
        <div class="lm-stars">${starsHtml}</div>
      `;

      if (isUnlocked) {
        btn.addEventListener('click', () => {
          this.router.navigate({
            to: 'game-logic',
            subject: 'logic',
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
