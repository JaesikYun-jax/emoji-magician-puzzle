import type { AppRouter } from '../router/AppRouter';
import type { SaveService } from '../services/SaveService';
import { t } from '../i18n';

// ── 스타일 ────────────────────────────────────────────────────────────────────

const HOME_B_STYLE = `
#home-b {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(165deg, #2E1065 0%, #4C1D95 45%, #6D28D9 100%);
  z-index: 20;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* 배경 소프트 글로우 */
#home-b .hb-glow-1 {
  position: fixed;
  top: -180px;
  left: -180px;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle, rgba(217,249,157,0.10) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
#home-b .hb-glow-2 {
  position: fixed;
  bottom: -120px;
  right: -120px;
  width: 440px;
  height: 440px;
  background: radial-gradient(circle, rgba(251,113,133,0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* 스크롤 영역 */
#home-b .hb-scroll {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 16px 32px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* ── 헤더 ── */
#home-b .hb-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 52px 4px 0;
}
#home-b .hb-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}
#home-b .hb-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FDE68A, #FB7185);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--f-display, 'Fraunces', serif);
  font-size: 1.3rem;
  font-weight: 900;
  color: #2E1065;
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(253,230,138,0.35);
  border: 2px solid rgba(255,255,255,0.30);
}
#home-b .hb-greeting {
  font-family: var(--f-display, 'Fraunces', serif);
  font-size: 1.2rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
#home-b .hb-greeting-sub {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.55);
  margin-top: 2px;
}
#home-b .hb-settings-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  transition: background 150ms, transform 100ms;
  touch-action: manipulation;
  flex-shrink: 0;
}
#home-b .hb-settings-btn:active {
  transform: scale(0.90);
  background: rgba(255,255,255,0.20);
}

/* ── 섹션 타이틀 ── */
#home-b .hb-section-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: rgba(255,255,255,0.50);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: -12px;
}

/* ── 종목 카드 그리드 ── */
#home-b .hb-subject-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
#home-b .hb-subject-card {
  border-radius: 20px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 100ms, box-shadow 150ms;
  touch-action: manipulation;
  user-select: none;
  border: 1px solid rgba(255,255,255,0.12);
}
#home-b .hb-subject-card:active {
  transform: scale(0.94);
}
#home-b .hb-subject-card.math {
  background: linear-gradient(145deg, #0369A1 0%, #0EA5E9 100%);
  box-shadow: 0 8px 32px rgba(3,105,161,0.45);
}
#home-b .hb-subject-card.english {
  background: linear-gradient(145deg, #065F46 0%, #10B981 100%);
  box-shadow: 0 8px 32px rgba(6,95,70,0.45);
}
#home-b .hb-subject-card.logic {
  background: linear-gradient(145deg, #4338CA 0%, #6366F1 100%);
  box-shadow: 0 8px 32px rgba(67,56,202,0.45);
}
#home-b .hb-subject-card.creativity {
  background: linear-gradient(145deg, #C2410C 0%, #F97316 100%);
  box-shadow: 0 8px 32px rgba(194,65,12,0.45);
}
#home-b .hb-subject-card.reasoning {
  background: linear-gradient(145deg, #115E59 0%, #14B8A6 100%);
  box-shadow: 0 8px 32px rgba(20,184,166,0.45);
}
#home-b .hb-subject-card.korean {
  background: linear-gradient(145deg, #9F1239 0%, #F43F5E 100%);
  box-shadow: 0 8px 32px rgba(159,18,57,0.40);
  opacity: 0.75;
}

/* 카드 내 빛 효과 */
#home-b .hb-subject-card::after {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255,255,255,0.10);
  pointer-events: none;
}

#home-b .hb-card-emoji {
  font-size: 2.2rem;
  line-height: 1;
}
#home-b .hb-card-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}
#home-b .hb-card-progress {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.70);
  font-weight: 600;
}
#home-b .hb-card-action {
  font-size: 0.72rem;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  letter-spacing: 0.03em;
}
#home-b .hb-card-coming {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.12);
  border-radius: 999px;
  padding: 2px 8px;
  display: inline-block;
}

/* ── 오늘의 미션 ── */
#home-b .hb-mission-card {
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.22);
  border-left: 3px solid #D9F99D;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
}
#home-b .hb-mission-icon {
  font-size: 1.8rem;
  flex-shrink: 0;
}
#home-b .hb-mission-texts {}
#home-b .hb-mission-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #D9F99D;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
#home-b .hb-mission-text {
  font-size: 0.92rem;
  color: rgba(255,255,255,0.85);
  margin-top: 3px;
  font-weight: 600;
}

/* ── 토스트 ── */
#home-b-toast {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 32px);
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: rgba(46,16,101,0.92);
  border: 1px solid rgba(255,255,255,0.20);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 999px;
  padding: 10px 22px;
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  z-index: 9999;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 8px 32px rgba(109,40,217,0.45);
  animation: toast-in 0.25s ease forwards;
}
@keyframes toast-in {
  from { opacity: 0; transform: translateX(-50%) translateY(12px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}
`;

// ── 종목 카드 정의 ────────────────────────────────────────────────────────────

interface SubjectCardDef {
  id: 'math' | 'english' | 'logic' | 'creativity' | 'reasoning' | 'korean';
  emoji: string;
  nameKo: string;
  nameEn: string;
  targetScreen: 'math-menu' | 'english-menu' | 'logic-menu' | 'creativity-menu' | 'reasoning-menu' | null;
  available: boolean;
}

const SUBJECT_CARDS: SubjectCardDef[] = [
  { id: 'math',       emoji: '🔢', nameKo: '수리 수학', nameEn: 'Math',       targetScreen: 'math-menu',       available: true  },
  { id: 'english',    emoji: '🔤', nameKo: '영어',      nameEn: 'English',    targetScreen: 'english-menu',    available: true  },
  { id: 'logic',      emoji: '🧩', nameKo: '논리',      nameEn: 'Logic',      targetScreen: 'logic-menu',      available: true  },
  { id: 'creativity', emoji: '🎨', nameKo: '창의',      nameEn: 'Creativity', targetScreen: 'creativity-menu', available: true  },
  { id: 'reasoning',  emoji: '🔍', nameKo: '추리',      nameEn: 'Reasoning',  targetScreen: 'reasoning-menu',  available: true  },
  { id: 'korean',     emoji: '가나', nameKo: '국어',    nameEn: 'Korean',     targetScreen: null,              available: false },
];

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

export class HomeB {
  private el: HTMLElement | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService: SaveService,
  ) {}

  show(): void {
    this.hide();

    // 스타일 주입
    if (!document.getElementById('home-b-style')) {
      const style = document.createElement('style');
      style.id = 'home-b-style';
      style.textContent = HOME_B_STYLE;
      document.head.appendChild(style);
    }

    const profile = this.saveService.getProfile();
    const nickname = profile?.nickname ?? '친구';
    const initial  = nickname.charAt(0).toUpperCase();

    const el = document.createElement('div');
    el.id = 'home-b';
    el.innerHTML = `
      <div class="hb-glow-1"></div>
      <div class="hb-glow-2"></div>

      <div class="hb-scroll">
        <!-- 헤더 -->
        <div class="hb-header">
          <div class="hb-profile">
            <div class="hb-avatar">${initial}</div>
            <div>
              <div class="hb-greeting">${t('home.greeting', { name: nickname })}</div>
              <div class="hb-greeting-sub">${this._gradeLabel(profile?.ageGroup)}</div>
            </div>
          </div>
          <button class="hb-settings-btn" id="hb-settings-btn" type="button" aria-label="설정">⚙️</button>
        </div>

        <!-- 오늘의 미션 -->
        <div class="hb-mission-card">
          <div class="hb-mission-icon">🎯</div>
          <div class="hb-mission-texts">
            <div class="hb-mission-label">${t('home.todayMission')}</div>
            <div class="hb-mission-text">${t('home.todayMission.placeholder')}</div>
          </div>
        </div>

        <!-- 종목 카드 -->
        <div class="hb-section-title">종목 선택</div>
        <div class="hb-subject-grid" id="hb-subject-grid">
          ${this._renderCards()}
        </div>
      </div>
    `;

    // 종목 카드 클릭
    el.querySelector('#hb-subject-grid')?.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-subject]');
      if (!card) return;
      const subjectId = card.dataset.subject as SubjectCardDef['id'];
      this._handleSubjectTap(subjectId);
    });

    // 설정 버튼 (placeholder)
    el.querySelector('#hb-settings-btn')?.addEventListener('click', () => {
      this._showToast('설정 화면은 곧 준비될 거예요!');
    });

    this.container.appendChild(el);
    this.el = el;
  }

  hide(): void {
    if (this.el) {
      this.el.remove();
      this.el = null;
    }
    if (this.toastTimer !== null) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
  }

  // ── 프라이빗 ────────────────────────────────────────────────────────────────

  private _gradeLabel(ageGroup?: string): string {
    if (!ageGroup) return '';
    const map: Record<string, string> = {
      daycare: t('onboarding.age.daycare'),
      kindergarten: t('onboarding.age.kindergarten'),
      g1: t('onboarding.age.g1'),
      g2: t('onboarding.age.g2'),
      g3: t('onboarding.age.g3'),
      g4: t('onboarding.age.g4'),
      g5: t('onboarding.age.g5'),
      g6: t('onboarding.age.g6'),
    };
    return map[ageGroup] ?? '';
  }

  private _renderCards(): string {
    return SUBJECT_CARDS.map(card => {
      // 진행 상태 조회
      const progress = this._getProgress(card.id);
      const progressText = t('home.subjectProgress', {
        lv: String(progress.level),
        stars: String(progress.stars),
      });

      if (!card.available) {
        return `
          <div class="hb-subject-card ${card.id}" data-subject="${card.id}">
            <div class="hb-card-emoji">${card.emoji}</div>
            <div class="hb-card-name">${card.nameKo}</div>
            <div class="hb-card-coming">${t('home.comingSoon')}</div>
          </div>
        `;
      }

      return `
        <div class="hb-subject-card ${card.id}" data-subject="${card.id}">
          <div class="hb-card-emoji">${card.emoji}</div>
          <div class="hb-card-name">${card.nameKo}</div>
          <div class="hb-card-progress">${progressText}</div>
          <div class="hb-card-action">${t('home.subjectStart')}</div>
        </div>
      `;
    }).join('');
  }

  private _getProgress(subjectId: SubjectCardDef['id']): { level: number; stars: number } {
    switch (subjectId) {
      case 'math': {
        const ids = this.saveService.getUnlockedMathIds();
        const cleared = ids.filter(id => {
          const p = this.saveService.getMathProgress(id);
          return p.stars > 0;
        });
        return { level: Math.max(1, cleared.length), stars: cleared.reduce((s, id) => s + this.saveService.getMathProgress(id).stars, 0) };
      }
      case 'logic': {
        const cnt = this.saveService.getLogicClearCount();
        return { level: Math.max(1, cnt), stars: cnt * 1 };
      }
      case 'creativity': {
        const stats = this.saveService.getCreativityStats();
        return { level: stats.playerLevel, stars: stats.totalClears };
      }
      case 'reasoning': {
        const p = this.saveService.getSubjectProgress('reasoning');
        return { level: Math.max(1, p.level), stars: p.totalClears };
      }
      default:
        return { level: 1, stars: 0 };
    }
  }

  private _handleSubjectTap(subjectId: SubjectCardDef['id']): void {
    const card = SUBJECT_CARDS.find(c => c.id === subjectId);
    if (!card) return;

    if (!card.available || !card.targetScreen) {
      this._showToast(`${card.nameKo}은(는) ${t('home.comingSoon')}`);
      return;
    }

    this.router.navigate({
      to: card.targetScreen,
      subject: card.id === 'math' ? 'math'
             : card.id === 'english' ? 'english'
             : card.id === 'logic' ? 'logic'
             : card.id === 'creativity' ? 'creativity'
             : card.id === 'reasoning' ? 'reasoning'
             : 'korean',
    });
  }

  private _showToast(message: string): void {
    // 기존 토스트 제거
    document.getElementById('home-b-toast')?.remove();
    if (this.toastTimer !== null) clearTimeout(this.toastTimer);

    const toast = document.createElement('div');
    toast.id = 'home-b-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    this.toastTimer = setTimeout(() => {
      toast.remove();
      this.toastTimer = null;
    }, 2400);
  }
}
