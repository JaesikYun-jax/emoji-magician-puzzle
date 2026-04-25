/**
 * LogicMenu.ts
 * 논리 종목 시작 화면 — 레벨 그리드 없이 단순 시작 버튼 하나
 */

import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
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
  align-items: center;
  justify-content: center;
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

#logic-menu .lm-back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
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
  z-index: 2;
}
#logic-menu .lm-back-btn:hover { background: rgba(255,255,255,0.14); }
#logic-menu .lm-back-btn:active { transform: scale(0.92); }

#logic-menu .lm-card {
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1.5px solid rgba(255,255,255,0.20);
  border-radius: 28px;
  padding: 40px 32px;
  width: calc(100vw - 48px);
  max-width: 360px;
  text-align: center;
  box-shadow: 0 8px 40px rgba(99,102,241,0.35);
}

#logic-menu .lm-eyebrow {
  color: #C7D2FE;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
#logic-menu .lm-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  color: #fff;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
#logic-menu .lm-subtitle {
  color: rgba(255,255,255,0.65);
  font-size: 0.88rem;
  line-height: 1.5;
  margin-bottom: 28px;
}

#logic-menu .lm-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 28px;
}
#logic-menu .lm-stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255,255,255,0.85);
  font-weight: 600;
}
#logic-menu .lm-stat-value {
  font-weight: 800;
  color: #fff;
}
#logic-menu .lm-stat-streak {
  color: #FCA5A5;
}

#logic-menu .lm-start-btn {
  display: block; width: 100%;
  padding: 18px;
  background: linear-gradient(135deg, #818CF8, #6366F1);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(99,102,241,0.50);
  transition: transform 150ms, box-shadow 150ms;
  touch-action: manipulation;
  letter-spacing: 0.03em;
}
#logic-menu .lm-start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(99,102,241,0.60);
}
#logic-menu .lm-start-btn:active { transform: scale(0.97); }
`;

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

    // 뒤로 가기 버튼
    const backBtn = document.createElement('button');
    backBtn.className = 'lm-back-btn';
    backBtn.setAttribute('aria-label', 'back');
    backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    backBtn.addEventListener('click', () => this.router.back());
    el.appendChild(backBtn);

    // 메인 카드
    const card = document.createElement('div');
    card.className = 'lm-card';

    // 제목
    card.innerHTML = `
      <div class="lm-eyebrow">Logic · 논리</div>
      <div class="lm-title">${t('logic.title')}</div>
      <div class="lm-subtitle">${t('logic.subtitle')}</div>
    `;

    // 진행 통계
    const clearCount = this.saveService.getLogicClearCount();
    const streak = this.saveService.getLogicStreak();
    const currentLevelId = this.saveService.getCurrentLogicLevelId();
    const levelMatch = currentLevelId.match(/^logic-(\d+)$/);
    const levelNum = levelMatch ? parseInt(levelMatch[1], 10) : 1;

    const statsEl = document.createElement('div');
    statsEl.className = 'lm-stats';

    const levelRow = document.createElement('div');
    levelRow.className = 'lm-stat-row';
    levelRow.innerHTML = `<span>현재 레벨</span><span class="lm-stat-value">Level ${levelNum}</span>`;
    statsEl.appendChild(levelRow);

    const clearRow = document.createElement('div');
    clearRow.className = 'lm-stat-row';
    clearRow.innerHTML = `<span>클리어</span><span class="lm-stat-value">${clearCount}회</span>`;
    statsEl.appendChild(clearRow);

    if (streak > 0) {
      const streakRow = document.createElement('div');
      streakRow.className = 'lm-stat-row lm-stat-streak';
      streakRow.innerHTML = `<span>연속 성공</span><span class="lm-stat-value lm-stat-streak">${streak}회 🔥</span>`;
      statsEl.appendChild(streakRow);
    }

    card.appendChild(statsEl);

    // 시작 버튼
    const startBtn = document.createElement('button');
    startBtn.className = 'lm-start-btn';
    startBtn.textContent = '▶ 시작';
    startBtn.addEventListener('click', () => {
      const levelId = this.saveService.getCurrentLogicLevelId();
      this.router.navigate({
        to: 'game-logic',
        subject: 'logic',
        levelId,
      });
    });
    card.appendChild(startBtn);

    el.appendChild(card);
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
