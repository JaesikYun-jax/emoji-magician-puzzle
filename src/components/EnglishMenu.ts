import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
import { t } from '../i18n';
import { ENGLISH_WORDS } from '../game-data/englishWords';

const ENGLISH_MENU_STYLE = `
#english-menu {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(ellipse 80% 50% at 0% 0%, rgba(217,249,157,0.14), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(253,230,138,0.10), transparent 60%),
    linear-gradient(165deg, #064E3B 0%, #065F46 50%, #10B981 100%);
  z-index: 20;
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', 'Apple SD Gothic Neo', sans-serif;
  overflow: hidden;
}
#english-menu::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay;
  opacity: 0.2;
  pointer-events: none;
  z-index: 0;
}
#english-menu > * { position: relative; z-index: 1; }

/* Decorative floating letter */
#english-menu .em-decor {
  position: absolute;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 800;
  color: rgba(255,255,255,0.06);
  pointer-events: none;
  user-select: none;
  z-index: 0;
  animation: em-drift 14s ease-in-out infinite;
}
#english-menu .em-decor--1 { top: 18%; left: -10px; font-size: 180px; animation-delay: 0s; }
#english-menu .em-decor--2 { bottom: 10%; right: -20px; font-size: 220px; animation-delay: 3s; animation-duration: 18s; }

@keyframes em-drift {
  0%, 100% { transform: translate(0,0) rotate(0); }
  50%      { transform: translate(8px,-16px) rotate(4deg); }
}

#english-menu .mm-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  gap: 14px;
}
#english-menu .mm-back-btn {
  width: 42px;
  height: 42px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  cursor: pointer;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 150ms, background 150ms;
}
#english-menu .mm-back-btn:hover { background: rgba(255,255,255,0.14); }
#english-menu .mm-back-btn:active { transform: scale(0.92); }

#english-menu .mm-title-wrap { display: flex; flex-direction: column; gap: 2px; }
#english-menu .mm-eyebrow {
  color: #D9F99D;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}
#english-menu .mm-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  font-variation-settings: 'opsz' 72, 'SOFT' 60;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

#english-menu .lt-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 8px 16px 0;
  padding: 16px 20px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(253,230,138,0.18), rgba(251,113,133,0.18));
  border: 1px solid rgba(253,230,138,0.35);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  cursor: pointer;
  text-align: left;
  width: calc(100% - 32px);
  max-width: 528px;
  margin-inline: auto;
  transition: transform 250ms, border-color 250ms, box-shadow 250ms;
}
#english-menu .lt-banner:hover {
  transform: translateY(-2px);
  border-color: rgba(253,230,138,0.6);
  box-shadow: 0 12px 36px rgba(253,230,138,0.25);
}
#english-menu .lt-banner:active { transform: scale(0.98); }
#english-menu .lt-banner-icon {
  width: 44px; height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #FDE68A, #FB7185);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(251,113,133,0.4);
}
#english-menu .lt-banner-text { flex: 1; }
#english-menu .lt-banner-title {
  display: block;
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  font-variation-settings: 'opsz' 72;
  font-size: 1rem; font-weight: 700; color: #fff;
  letter-spacing: -0.02em;
}
#english-menu .lt-banner-sub {
  display: block; font-size: 0.78rem;
  color: rgba(255,255,255,0.75); margin-top: 3px;
}
#english-menu .lt-banner-arrow {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
  transition: transform 200ms, background 200ms;
}
#english-menu .lt-banner:hover .lt-banner-arrow {
  transform: translateX(3px);
  background: rgba(217,249,157,0.25);
  color: #D9F99D;
}

#english-menu .em-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  gap: 24px;
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
}

#english-menu .em-info-card {
  position: relative;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.16);
  border-radius: 28px;
  padding: 36px 28px;
  text-align: center;
  width: 100%;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  overflow: hidden;
  transition: transform 300ms, border-color 300ms;
}
#english-menu .em-info-card::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 180px; height: 180px;
  border-radius: 50%;
  background: #10B981;
  filter: blur(50px);
  opacity: 0.35;
  pointer-events: none;
}
#english-menu .em-info-card:hover {
  transform: translateY(-4px);
  border-color: rgba(217,249,157,0.4);
}

#english-menu .em-info-mark {
  width: 72px; height: 72px;
  margin: 0 auto 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, #FDE68A, #FB7185);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 12px 32px rgba(251,113,133,0.35);
  position: relative;
  z-index: 1;
}

#english-menu .em-info-title {
  font-family: 'Fraunces', 'Pretendard Variable', serif;
  font-variation-settings: 'opsz' 144, 'SOFT' 60;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  display: block;
  letter-spacing: -0.03em;
  position: relative;
  z-index: 1;
}
#english-menu .em-info-title em {
  font-style: italic;
  font-weight: 300;
  color: #D9F99D;
}

#english-menu .em-info-sub {
  font-size: 0.92rem;
  color: rgba(255,255,255,0.75);
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

#english-menu .em-info-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px dashed rgba(255,255,255,0.18);
  position: relative;
  z-index: 1;
}
#english-menu .em-info-stat {
  text-align: center;
}
#english-menu .em-info-stat-num {
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-weight: 700;
  font-size: 1.5rem;
  color: #D9F99D;
  display: block;
  letter-spacing: -0.02em;
}
#english-menu .em-info-stat-label {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 2px;
  display: block;
}

#english-menu .em-start-btn {
  width: 100%;
  padding: 20px 24px;
  border-radius: 999px;
  border: none;
  font-family: 'Plus Jakarta Sans', 'Pretendard Variable', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  background: #FAF7F2;
  color: #064E3B;
  cursor: pointer;
  box-shadow:
    0 2px 0 rgba(0,0,0,0.05),
    0 12px 36px rgba(217,249,157,0.4),
    inset 0 -2px 0 rgba(0,0,0,0.08);
  transition: transform 150ms, box-shadow 150ms;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
#english-menu .em-start-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 0 rgba(0,0,0,0.05),
    0 16px 48px rgba(217,249,157,0.55),
    inset 0 -2px 0 rgba(0,0,0,0.08);
}
#english-menu .em-start-btn:active { transform: scale(0.96) translateY(0); }
#english-menu .em-start-btn__arrow {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #064E3B;
  color: #D9F99D;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 200ms;
}
#english-menu .em-start-btn:hover .em-start-btn__arrow { transform: translateX(3px); }

@media (prefers-reduced-motion: reduce) {
  #english-menu .em-info-card, #english-menu .em-start-btn, #english-menu .em-decor { transition: none; animation: none; }
}
`;

export class EnglishMenu {
  private el: HTMLElement | null = null;

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService?: SaveService,
  ) {
    void this.saveService;
  }

  show(): void {
    this.hide();

    if (!document.getElementById('english-menu-style')) {
      const style = document.createElement('style');
      style.id = 'english-menu-style';
      style.textContent = ENGLISH_MENU_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'english-menu';
    el.innerHTML = `
      <!-- Decorative floating letters -->
      <span class="em-decor em-decor--1" aria-hidden="true">Aa</span>
      <span class="em-decor em-decor--2" aria-hidden="true">Zz</span>

      <div class="mm-header">
        <button class="mm-back-btn" aria-label="back">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="mm-title-wrap">
          <span class="mm-eyebrow">English · 영어</span>
          <span class="mm-title">${t('subject.english')}</span>
        </div>
      </div>

      <button class="lt-banner" id="em-lt-banner">
        <span class="lt-banner-icon">🧪</span>
        <div class="lt-banner-text">
          <span class="lt-banner-title">내 레벨 찾기</span>
          <span class="lt-banner-sub">5문제로 딱 맞는 단계를 찾아줄게요</span>
        </div>
        <span class="lt-banner-arrow">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </button>

      <div class="em-content">
        <div class="em-info-card">
          <div class="em-info-mark" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <text x="13" y="28" font-family="Fraunces, serif" font-size="26" font-weight="800" font-style="italic" fill="#064E3B">A</text>
              <text x="26" y="28" font-family="Fraunces, serif" font-size="18" font-weight="800" font-style="italic" fill="#064E3B">a</text>
            </svg>
          </div>
          <span class="em-info-title">영어 <em>단어 학습</em></span>
          <span class="em-info-sub">${t('subject.english.sub')}<br/>입문부터 고급까지, 단계별 플래시카드</span>
          <div class="em-info-stats">
            <div class="em-info-stat">
              <span class="em-info-stat-num">${ENGLISH_WORDS.length}+</span>
              <span class="em-info-stat-label">Words</span>
            </div>
            <div class="em-info-stat">
              <span class="em-info-stat-num">A — Z</span>
              <span class="em-info-stat-label">Levels</span>
            </div>
          </div>
        </div>
        <button class="em-start-btn" id="em-start">
          <span>게임 시작하기</span>
          <span class="em-start-btn__arrow" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
        </button>
      </div>
    `;

    el.querySelector('.mm-back-btn')!.addEventListener('click', () => {
      this.router.back();
    });

    el.querySelector('#em-lt-banner')!.addEventListener('click', () => {
      this.router.navigate({ to: 'level-test-english', subject: 'english' });
    });

    el.querySelector('#em-start')!.addEventListener('click', () => {
      const savedResult = this.saveService?.getEnglishLevelTestResult();
      const LABEL_TO_DIFFICULTY: Record<string, string> = {
        '입문': 'beginner',
        '기초': 'elementary',
        '중급': 'intermediate',
        '고급': 'advanced',
      };
      let levelId = 'beginner';
      if (savedResult?.recommendedLevelId) {
        const label = savedResult.recommendedLevelId.replace(/^english-/, '');
        levelId = LABEL_TO_DIFFICULTY[label] ?? 'beginner';
      }
      this.router.navigate({ to: 'game-english', subject: 'english', levelId });
    });

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
