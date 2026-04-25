/**
 * CreativityMenu.ts
 * 창의 종목 홈 화면 — 통계 + 시작 버튼 (레벨 선택 없음)
 */

import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
import { getCreativityRank } from '../game-data/creativityLevels';
import { selectWallPuzzle, getTierForClears } from '../systems/creativity/wallPuzzleSelector';
import { t } from '../i18n';

const CREATIVITY_HOME_STYLE = `
#creativity-home {
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
  overflow-y: auto;
  overflow-x: hidden;
}
#creativity-home::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
  opacity: 0.2;
  pointer-events: none;
  z-index: 0;
}
#creativity-home > * { position: relative; z-index: 1; }

#creativity-home .ch-decor {
  position: absolute;
  color: rgba(255,255,255,0.05);
  pointer-events: none;
  user-select: none;
  font-size: 160px;
  font-weight: 900;
  z-index: 0;
  animation: ch-drift 16s ease-in-out infinite;
}
#creativity-home .ch-decor--1 { top: 10%; left: -20px; animation-delay: 0s; }
#creativity-home .ch-decor--2 { bottom: 8%; right: -20px; font-size: 200px; animation-delay: 4s; }
@keyframes ch-drift {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  50%      { transform: translate(10px,-14px) rotate(-4deg); }
}
@keyframes ch-float {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-8px); }
}

#creativity-home .ch-header {
  display: flex;
  align-items: center;
  padding: 20px 24px 12px;
  gap: 14px;
}
#creativity-home .ch-back-btn {
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
  flex-shrink: 0;
}
#creativity-home .ch-back-btn:hover { background: rgba(255,255,255,0.14); }
#creativity-home .ch-back-btn:active { transform: scale(0.92); }

#creativity-home .ch-title-wrap { display: flex; flex-direction: column; gap: 2px; }
#creativity-home .ch-eyebrow {
  color: #FED7AA;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
#creativity-home .ch-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

#creativity-home .ch-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 24px 12px;
  gap: 10px;
}
#creativity-home .ch-wizard-icon {
  font-size: 4.5rem;
  filter: drop-shadow(0 4px 16px rgba(234,88,12,0.6));
  animation: ch-float 3s ease-in-out infinite;
  line-height: 1;
}
#creativity-home .ch-rank-badge {
  background: rgba(255,255,255,0.12);
  border: 1.5px solid rgba(255,255,255,0.22);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 8px 20px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(234,88,12,0.35);
}
#creativity-home .ch-rank-progress {
  width: 200px; height: 6px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  overflow: hidden;
}
#creativity-home .ch-rank-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #FB923C, #FCD34D);
  border-radius: 3px;
  transition: width 600ms ease;
}

#creativity-home .ch-stats {
  display: flex;
  gap: 12px;
  padding: 4px 20px 4px;
  justify-content: center;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}
#creativity-home .ch-stat-card {
  flex: 1;
  background: rgba(255,255,255,0.10);
  border: 1.5px solid rgba(255,255,255,0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 14px 8px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(234,88,12,0.15);
}
#creativity-home .ch-stat-icon { font-size: 1.3rem; line-height: 1; margin-bottom: 4px; }
#creativity-home .ch-stat-value {
  font-size: 1.8rem; font-weight: 900; color: #fff; line-height: 1;
}
#creativity-home .ch-stat-label {
  font-size: 0.68rem; font-weight: 700;
  color: rgba(255,255,255,0.65);
  margin-top: 3px;
}

#creativity-home .ch-badges {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
  padding: 4px 20px 8px;
  min-height: 36px;
}
#creativity-home .ch-badge-item {
  font-size: 1.6rem;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
}

#creativity-home .ch-start-btn {
  display: block;
  width: calc(100% - 40px);
  max-width: 360px;
  margin: 8px auto 0;
  padding: 18px;
  background: linear-gradient(135deg, #FB923C, #EA580C);
  border: none;
  border-radius: 20px;
  color: #fff;
  font-size: 1.2rem;
  font-weight: 900;
  box-shadow: 0 8px 32px rgba(234,88,12,0.55);
  cursor: pointer;
  touch-action: manipulation;
  transition: transform 150ms, box-shadow 150ms;
}
#creativity-home .ch-start-btn:active {
  transform: scale(0.95);
  box-shadow: 0 4px 16px rgba(234,88,12,0.45);
}

#creativity-home .ch-difficulty-hint {
  text-align: center;
  color: rgba(255,255,255,0.55);
  font-size: 0.78rem;
  margin: 10px 0 40px;
}
`;

export class CreativityMenu {
  private el: HTMLElement | null = null;

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService: SaveService,
  ) {}

  show(): void {
    this.hide();

    if (!document.getElementById('creativity-home-style')) {
      const style = document.createElement('style');
      style.id = 'creativity-home-style';
      style.textContent = CREATIVITY_HOME_STYLE;
      document.head.appendChild(style);
    }

    const meta = this.saveService.getCreativityMeta();
    const rank = getCreativityRank(meta.totalClears);
    const nextConfig = selectWallPuzzle(meta.totalClears, meta.recentPuzzleIds ?? []);

    const el = document.createElement('div');
    el.id = 'creativity-home';

    el.innerHTML = `
      <div class="ch-decor ch-decor--1">⌒</div>
      <div class="ch-decor ch-decor--2">~</div>
    `;

    // 헤더
    const header = document.createElement('div');
    header.className = 'ch-header';
    const backBtn = document.createElement('button');
    backBtn.className = 'ch-back-btn';
    backBtn.setAttribute('aria-label', 'back');
    backBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    backBtn.addEventListener('click', () => this.router.back());
    const titleWrap = document.createElement('div');
    titleWrap.className = 'ch-title-wrap';
    titleWrap.innerHTML = `
      <span class="ch-eyebrow">Creativity · 창의</span>
      <span class="ch-title">${t('creativity.title')}</span>
    `;
    header.appendChild(backBtn);
    header.appendChild(titleWrap);
    el.appendChild(header);

    // 히어로 섹션
    const hero = document.createElement('div');
    hero.className = 'ch-hero';

    // 진행률 바 계산
    const prevThreshold = rank.minClears;
    const nextThreshold = rank.nextThreshold ?? (rank.minClears + 1);
    const progressPct = rank.nextThreshold === null
      ? 100
      : Math.round(((meta.totalClears - prevThreshold) / (nextThreshold - prevThreshold)) * 100);

    hero.innerHTML = `
      <div class="ch-wizard-icon">${rank.emoji}</div>
      <div class="ch-rank-badge">Lv.${rank.level} — ${rank.title}</div>
      <div class="ch-rank-progress">
        <div class="ch-rank-progress-bar" style="width: ${progressPct}%"></div>
      </div>
    `;
    el.appendChild(hero);

    // 통계 카드
    const stats = document.createElement('div');
    stats.className = 'ch-stats';
    stats.innerHTML = `
      <div class="ch-stat-card">
        <div class="ch-stat-icon">✨</div>
        <div class="ch-stat-value">${meta.totalClears}</div>
        <div class="ch-stat-label">총 클리어</div>
      </div>
      <div class="ch-stat-card">
        <div class="ch-stat-icon">🔥</div>
        <div class="ch-stat-value">${meta.currentStreak}</div>
        <div class="ch-stat-label">연속 성공</div>
      </div>
      <div class="ch-stat-card">
        <div class="ch-stat-icon">🏅</div>
        <div class="ch-stat-value">${meta.earnedBadgeThresholds.length}</div>
        <div class="ch-stat-label">보유 뱃지</div>
      </div>
    `;
    el.appendChild(stats);

    // 뱃지 목록
    if (meta.earnedBadgeThresholds.length > 0) {
      const BADGES = [
        { threshold: 1,  emoji: '🌱' }, { threshold: 3,  emoji: '🔥' },
        { threshold: 5,  emoji: '⚡' }, { threshold: 10, emoji: '🏅' },
        { threshold: 15, emoji: '🌟' }, { threshold: 20, emoji: '🏆' },
        { threshold: 30, emoji: '👑' }, { threshold: 50, emoji: '🧙' },
      ];
      const badgesRow = document.createElement('div');
      badgesRow.className = 'ch-badges';
      const earned = BADGES.filter(b => meta.earnedBadgeThresholds.includes(b.threshold));
      const display = earned.slice(-5); // 최근 5개만
      display.forEach(b => {
        const span = document.createElement('span');
        span.className = 'ch-badge-item';
        span.textContent = b.emoji;
        badgesRow.appendChild(span);
      });
      if (earned.length > 5) {
        const more = document.createElement('span');
        more.className = 'ch-badge-item';
        more.textContent = '...';
        more.style.color = 'rgba(255,255,255,0.6)';
        more.style.fontSize = '0.9rem';
        badgesRow.appendChild(more);
      }
      el.appendChild(badgesRow);
    }

    // 시작 버튼
    const startBtn = document.createElement('button');
    startBtn.className = 'ch-start-btn';
    startBtn.textContent = '시작하기 ▶';
    startBtn.addEventListener('click', () => {
      this.router.navigate({
        to: 'game-creativity',
        subject: 'creativity',
      });
    });
    el.appendChild(startBtn);

    // 난이도 힌트
    const hint = document.createElement('p');
    hint.className = 'ch-difficulty-hint';
    const tier = getTierForClears(meta.totalClears);
    hint.textContent = `현재 난이도: Tier ${tier} · ${nextConfig.cols}×${nextConfig.rows} 격자${nextConfig.walls && nextConfig.walls.length > 0 ? ` (벽 ${nextConfig.walls.length}개)` : ''}`;
    el.appendChild(hint);

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
