/**
 * CreativityMenu.ts
 * 창의 종목 메뉴 — EnglishMenu 방식으로 재작성
 */

import type { AppRouter, ScreenId } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
import { getCreativityRank } from '../game-data/creativityLevels';
import { t } from '../i18n';
import { getGamesBySubject, getGameById } from '../game-data/gamesCatalog';
import { buildSubjectProgress } from '../systems/progression/xpEngine';

const CREATIVITY_HOME_STYLE = `
#creativity-home {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 80% 50% at 0% 0%, rgba(254,215,170,0.12), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(249,115,22,0.15), transparent 60%),
    linear-gradient(165deg, #431407 0%, #7C2D12 50%, #C2410C 100%);
  z-index: 20;
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
  overflow: hidden;
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
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 800;
  color: rgba(255,255,255,0.06);
  pointer-events: none;
  user-select: none;
  z-index: 0;
  animation: ch-drift 14s ease-in-out infinite;
}
#creativity-home .ch-decor--1 { top: 18%; left: -10px; font-size: 180px; animation-delay: 0s; }
#creativity-home .ch-decor--2 { bottom: 10%; right: -20px; font-size: 220px; animation-delay: 3s; animation-duration: 18s; }

@keyframes ch-drift {
  0%, 100% { transform: translate(0,0) rotate(0); }
  50%       { transform: translate(8px,-16px) rotate(-4deg); }
}

#creativity-home .mm-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 14px;
}
#creativity-home .mm-back-btn {
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
#creativity-home .mm-back-btn:hover { background: rgba(255,255,255,0.14); }
#creativity-home .mm-back-btn:active { transform: scale(0.92); }

#creativity-home .mm-title-wrap { display: flex; flex-direction: column; gap: 2px; }
#creativity-home .mm-eyebrow {
  color: #FED7AA;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
#creativity-home .mm-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  font-variation-settings: 'opsz' 72, 'SOFT' 60;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

#creativity-home .sm-xp-row {
  padding: 0 24px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

#creativity-home .ch-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 24px 24px;
  gap: 16px;
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
  overflow-y: auto;
}

#creativity-home .ch-info-card {
  position: relative;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 28px;
  padding: 28px 24px;
  text-align: center;
  width: 100%;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow: hidden;
  transition: transform 300ms, border-color 300ms;
}
#creativity-home .ch-info-card::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 180px; height: 180px;
  border-radius: 50%;
  background: #C2410C;
  filter: blur(50px);
  opacity: 0.35;
  pointer-events: none;
}
#creativity-home .ch-info-card:hover {
  transform: translateY(-4px);
  border-color: rgba(254,215,170,0.4);
}

#creativity-home .ch-info-mark {
  width: 72px; height: 72px;
  margin: 0 auto 16px;
  border-radius: 22px;
  background: linear-gradient(135deg, #FED7AA, #C2410C);
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
  box-shadow: 0 12px 32px rgba(194,65,12,0.35);
  position: relative;
  z-index: 1;
}

#creativity-home .ch-info-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  font-variation-settings: 'opsz' 144, 'SOFT' 60;
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
  display: block;
  letter-spacing: -0.03em;
  position: relative;
  z-index: 1;
}
#creativity-home .ch-info-title em {
  font-style: italic;
  font-weight: 300;
  color: #FED7AA;
}

#creativity-home .ch-info-sub {
  font-size: 0.88rem;
  color: rgba(255,255,255,0.70);
  line-height: 1.5;
  position: relative;
  z-index: 1;
}

#creativity-home .ch-info-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed rgba(255,255,255,0.18);
  position: relative;
  z-index: 1;
}
#creativity-home .ch-info-stat { text-align: center; }
#creativity-home .ch-info-stat-num {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 700;
  font-size: 1.4rem;
  color: #FED7AA;
  display: block;
  letter-spacing: -0.02em;
}
#creativity-home .ch-info-stat-label {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 2px;
  display: block;
}

#creativity-home .sm-tabs {
  display: flex;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  flex-wrap: nowrap;
}
#creativity-home .sm-tabs::-webkit-scrollbar { display: none; }
#creativity-home .sm-tab {
  padding: 10px 16px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(10px);
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
#creativity-home .sm-tab:hover { color: #fff; border-color: rgba(255,255,255,0.28); }
#creativity-home .sm-tab.active {
  color: #431407;
  background: #FED7AA;
  border-color: #FED7AA;
  box-shadow: 0 6px 20px rgba(254,215,170,0.35);
}

#creativity-home .sm-tab-detail { width: 100%; }

#creativity-home .ch-start-btn {
  width: 100%;
  padding: 20px 24px;
  border-radius: 999px;
  border: none;
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  background: #FAF7F2;
  color: #431407;
  cursor: pointer;
  box-shadow:
    0 2px 0 rgba(0,0,0,0.05),
    0 12px 36px rgba(254,215,170,0.4),
    inset 0 -2px 0 rgba(0,0,0,0.08);
  transition: transform 150ms, box-shadow 150ms;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
#creativity-home .ch-start-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 0 rgba(0,0,0,0.05),
    0 16px 48px rgba(254,215,170,0.55),
    inset 0 -2px 0 rgba(0,0,0,0.08);
}
#creativity-home .ch-start-btn:active { transform: scale(0.96) translateY(0); }
#creativity-home .ch-start-btn__arrow {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #431407;
  color: #FED7AA;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 200ms;
}
#creativity-home .ch-start-btn:hover .ch-start-btn__arrow { transform: translateX(3px); }

@media (prefers-reduced-motion: reduce) {
  #creativity-home .ch-info-card, #creativity-home .ch-start-btn, #creativity-home .ch-decor { transition: none; animation: none; }
}
`;

export class CreativityMenu {
  private el: HTMLElement | null = null;
  private activeGameTab: string | null = null;
  private _forcedOverrides: Map<string, string> = new Map();
  private _settingsOpen: boolean = false;

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
    const rank = getCreativityRank(meta.rankScore ?? 0, meta.maxDifficultyTier ?? 0);

    const rawProgress = this.saveService.getSubjectProgress('creativity');
    const progress = buildSubjectProgress({
      subjectId: 'creativity',
      xp: rawProgress.xp,
      totalClears: rawProgress.totalClears,
      streak: rawProgress.streak,
      bestStreak: rawProgress.bestStreak,
    });

    const accentColor = '#FED7AA';
    const pct = progress.levelProgressPercent;

    const el = document.createElement('div');
    el.id = 'creativity-home';
    el.innerHTML = `
      <span class="ch-decor ch-decor--1" aria-hidden="true">⌒</span>
      <span class="ch-decor ch-decor--2" aria-hidden="true">~</span>

      <div class="mm-header">
        <button class="mm-back-btn" aria-label="back">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="mm-title-wrap">
          <span class="mm-eyebrow">Creativity · 창의</span>
          <span class="mm-title">${t('creativity.title')}</span>
        </div>
      </div>

      <div class="sm-xp-row">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:12px;font-weight:700;color:${accentColor};letter-spacing:0.1em;text-transform:uppercase;">
            Lv.${progress.level} · ${progress.rank}
          </span>
          <span style="font-size:11px;color:rgba(255,255,255,0.55);">
            ${progress.xpToNextLevel > 0 ? `+${progress.xpToNextLevel} XP to next` : 'MAX LEVEL'}
          </span>
        </div>
        <div style="height:5px;background:rgba(255,255,255,0.15);border-radius:99px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${accentColor};border-radius:99px;transition:width 0.8s cubic-bezier(0.22,0.61,0.36,1);"></div>
        </div>
      </div>

      <div class="ch-content">
        <div class="ch-info-card">
          <div class="ch-info-mark" aria-hidden="true">💡</div>
          <span class="ch-info-title">창의 <em>퀴즈</em></span>
          <span class="ch-info-sub">벽퍼즐로 단어를 묶고, 추리로 공통점을 찾아요<br/>창의력과 어휘력을 함께 키워요</span>
          <div class="ch-info-stats">
            <div class="ch-info-stat">
              <span class="ch-info-stat-num">${meta.totalClears}회</span>
              <span class="ch-info-stat-label">클리어</span>
            </div>
            <div class="ch-info-stat">
              <span class="ch-info-stat-num">${rank.title}</span>
              <span class="ch-info-stat-label">랭크</span>
            </div>
          </div>
        </div>

        <div class="sm-tabs"></div>
        <div class="sm-tab-detail"></div>

        <button class="ch-start-btn" id="ch-start-btn">
          <span>오늘의 학습 시작하기</span>
          <span class="ch-start-btn__arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </button>
      </div>
    `;

    el.querySelector('.mm-back-btn')!.addEventListener('pointerdown', () => {
      this.router.back();
    });

    el.querySelector('#ch-start-btn')!.addEventListener('pointerdown', () => {
      this.router.navigate({ to: 'game-creativity', subject: 'creativity' });
    });

    this.container.appendChild(el);
    this.el = el;

    this._renderGameTabs(el, 'creativity');
  }

  private _renderGameTabs(el: HTMLElement, subjectId: string): void {
    const games = getGamesBySubject(subjectId);
    const tabsEl = el.querySelector('.sm-tabs') as HTMLElement;

    tabsEl.innerHTML = games.map(g => `
      <button class="sm-tab ${this.activeGameTab === g.id ? 'active' : ''}" data-game-id="${g.id}">
        ${g.icon} ${g.labelKo}
      </button>
    `).join('');

    tabsEl.querySelectorAll('.sm-tab').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        this.activeGameTab = (btn as HTMLElement).dataset['gameId'] ?? null;
        this._settingsOpen = false;
        this._renderGameTabs(el, subjectId);
        this._renderTabDetail(el, subjectId);
      });
    });

    this._renderTabDetail(el, subjectId);
  }

  private _renderTabDetail(el: HTMLElement, subjectId: string): void {
    const tabDetailEl = el.querySelector('.sm-tab-detail') as HTMLElement;
    if (!this.activeGameTab) {
      tabDetailEl.innerHTML = '';
      return;
    }
    const game = getGameById(this.activeGameTab);
    if (!game) return;

    const ds = game.difficultySettings;
    const forcedId = ds ? (this._forcedOverrides.get(game.id) ?? null) : null;
    const forcedOption = forcedId && ds ? ds.options.find(o => o.id === forcedId) ?? null : null;
    const settingsOpen = this._settingsOpen;

    const settingsBtnHtml = ds ? `
      <button class="sm-settings-btn" style="
        background:${settingsOpen ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.1)'};
        border:1px solid rgba(255,255,255,0.3);border-radius:8px;
        padding:5px 8px;cursor:pointer;color:#fff;font-size:15px;line-height:1;
        flex-shrink:0;transition:background 150ms;
      " title="난이도 설정">⚙️</button>
    ` : '';

    const settingsPanelHtml = (ds && settingsOpen) ? `
      <div class="sm-settings-panel" style="
        background:rgba(0,0,0,0.25);border:1px solid rgba(255,255,255,0.12);
        border-radius:12px;padding:10px 12px;
      ">
        <div style="color:rgba(255,255,255,0.6);font-size:11px;font-weight:600;
          text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
          ${ds.panelLabel}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${ds.options.map(opt => `
            <button class="sm-diff-opt" data-opt-id="${opt.id}" style="
              background:${forcedId === opt.id ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)'};
              border:1px solid ${forcedId === opt.id ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)'};
              border-radius:8px;padding:5px 10px;color:#fff;
              font-size:12px;font-weight:${forcedId === opt.id ? '700' : '400'};
              cursor:pointer;transition:all 120ms;
            ">${opt.label}</button>
          `).join('')}
        </div>
        ${forcedId ? `
          <div style="margin-top:6px;color:rgba(255,255,255,0.5);font-size:11px;">
            ✓ ${forcedOption?.label ?? ''} 으로 고정됨 &nbsp;
            <button class="sm-diff-reset" style="
              background:none;border:none;color:rgba(255,255,255,0.5);
              font-size:11px;cursor:pointer;text-decoration:underline;padding:0;
            ">초기화</button>
          </div>
        ` : ''}
      </div>
    ` : '';

    const soloLabel = forcedOption
      ? `이 게임만 하기 (${forcedOption.label}) →`
      : '이 게임만 하기 →';

    tabDetailEl.innerHTML = `
      <div style="
        background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);
        border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:10px;
      ">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:28px;">${game.icon}</span>
          <div style="flex:1;min-width:0;">
            <div style="color:#fff;font-weight:700;font-size:15px;">${game.labelKo}</div>
            <div style="color:rgba(255,255,255,0.65);font-size:13px;margin-top:2px;">${game.descriptionKo}</div>
          </div>
          ${settingsBtnHtml}
        </div>
        ${settingsPanelHtml}
        <button class="sm-solo-btn" data-route="${game.routeId}" style="
          background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);
          border-radius:12px;color:#fff;font-size:14px;font-weight:700;
          padding:10px 16px;cursor:pointer;text-align:center;
        ">${soloLabel}</button>
      </div>
    `;

    tabDetailEl.querySelector('.sm-settings-btn')?.addEventListener('pointerdown', () => {
      this._settingsOpen = !this._settingsOpen;
      this._renderTabDetail(el, subjectId);
    });

    tabDetailEl.querySelectorAll('.sm-diff-opt').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        const optId = (btn as HTMLElement).dataset['optId']!;
        if (this._forcedOverrides.get(game.id) === optId) {
          this._forcedOverrides.delete(game.id);
        } else {
          this._forcedOverrides.set(game.id, optId);
        }
        this._renderTabDetail(el, subjectId);
      });
    });

    tabDetailEl.querySelector('.sm-diff-reset')?.addEventListener('pointerdown', () => {
      this._forcedOverrides.delete(game.id);
      this._renderTabDetail(el, subjectId);
    });

    tabDetailEl.querySelector('.sm-solo-btn')?.addEventListener('pointerdown', () => {
      const forced = ds ? (this._forcedOverrides.get(game.id) ?? null) : null;
      if (forced && ds) {
        if (ds.paramKey === 'difficulty') {
          this.router.navigate({ to: game.routeId as ScreenId, subject: subjectId as 'creativity', difficulty: forced as 'easy' | 'normal' | 'hard' });
        } else {
          this.router.navigate({ to: game.routeId as ScreenId, subject: subjectId as 'creativity', levelId: forced });
        }
      } else {
        this.router.navigate({ to: game.routeId as ScreenId, subject: subjectId as 'creativity' });
      }
    });
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}
