import type { AppRouter } from '../router/AppRouter';
import type { AgeGroup, ChildProfile } from '../game-data/subjectConfig';
import type { SaveService } from '../services/SaveService';
import { t } from '../i18n';
import { fadeOutAndRemove } from '../utils/fadeOutAndRemove';

// ── 스타일 ────────────────────────────────────────────────────────────────────

const PROFILE_SETUP_STYLE = `
#profile-setup {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: linear-gradient(165deg, #2E1065 0%, #4C1D95 45%, #6D28D9 100%);
  z-index: 50;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

/* 배경 소프트 글로우 */
#profile-setup::before {
  content: '';
  position: fixed;
  top: -200px;
  left: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(217,249,157,0.10) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}
#profile-setup::after {
  content: '';
  position: fixed;
  bottom: -150px;
  right: -150px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(251,113,133,0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

#profile-setup .ps-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 48px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  box-sizing: border-box;
}

/* 헤더 */
#profile-setup .ps-header {
  text-align: center;
}
#profile-setup .ps-mascot {
  font-size: 4rem;
  line-height: 1;
  margin-bottom: 12px;
  display: block;
  filter: drop-shadow(0 4px 16px rgba(253,230,138,0.5));
  animation: ps-bounce 2s ease-in-out infinite;
}
@keyframes ps-bounce {
  0%,100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
#profile-setup .ps-title {
  font-family: var(--f-display, 'Fraunces', serif);
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.02em;
}
#profile-setup .ps-subtitle {
  font-size: 0.95rem;
  color: rgba(255,255,255,0.65);
  margin-top: 6px;
}

/* 카드 */
#profile-setup .ps-card {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 라벨 */
#profile-setup .ps-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #D9F99D;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* 닉네임 입력 */
#profile-setup .ps-input {
  width: 100%;
  background: rgba(255,255,255,0.12);
  border: 2px solid rgba(255,255,255,0.25);
  border-radius: 14px;
  padding: 14px 18px;
  font-size: 1.15rem;
  font-weight: 700;
  color: #fff;
  outline: none;
  box-sizing: border-box;
  transition: border-color 200ms, box-shadow 200ms;
  caret-color: #D9F99D;
}
#profile-setup .ps-input::placeholder {
  color: rgba(255,255,255,0.35);
  font-weight: 400;
}
#profile-setup .ps-input:focus {
  border-color: rgba(255,255,255,0.60);
  box-shadow: 0 0 0 3px rgba(217,249,157,0.20);
}
#profile-setup .ps-input.ps-error {
  border-color: #FB7185;
  box-shadow: 0 0 0 3px rgba(251,113,133,0.20);
}

/* 에러 텍스트 */
#profile-setup .ps-error-msg {
  font-size: 0.8rem;
  color: #FB7185;
  min-height: 1.2em;
}

/* 학년 칩 그리드 */
#profile-setup .ps-grade-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
#profile-setup .ps-chip {
  background: rgba(255,255,255,0.10);
  border: 2px solid rgba(255,255,255,0.18);
  border-radius: 14px;
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: border-color 150ms, background 150ms, transform 100ms, box-shadow 150ms;
  touch-action: manipulation;
  user-select: none;
  color: rgba(255,255,255,0.80);
  font-size: 0.78rem;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
}
#profile-setup .ps-chip .ps-chip-emoji {
  font-size: 1.4rem;
  line-height: 1;
}
#profile-setup .ps-chip:active {
  transform: scale(0.92);
}
#profile-setup .ps-chip.selected {
  background: rgba(217,249,157,0.20);
  border-color: #D9F99D;
  color: #fff;
  box-shadow: 0 0 16px rgba(217,249,157,0.30);
}

/* 시작 버튼 — BrandHome CTA 톤 일치 */
#profile-setup .ps-start-btn {
  width: 100%;
  padding: 18px 24px;
  background: #FAF7F2;
  border: none;
  border-radius: 999px;
  font-family: var(--f-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 1.1rem;
  font-weight: 800;
  color: #2E1065;
  cursor: pointer;
  box-shadow: 0 12px 36px rgba(217,249,157,0.25), inset 0 -2px 0 rgba(0,0,0,0.06);
  letter-spacing: 0.02em;
  transition: transform 150ms, box-shadow 150ms;
  touch-action: manipulation;
}
#profile-setup .ps-start-btn:active {
  transform: scale(0.97);
  box-shadow: 0 6px 18px rgba(217,249,157,0.20);
}
#profile-setup .ps-start-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
`;

// ── 학년 데이터 ─────────────────────────────────────────────────────────────

interface GradeOption {
  value: AgeGroup;
  emoji: string;
  labelKey: 'onboarding.age.daycare' | 'onboarding.age.kindergarten'
    | 'onboarding.age.g1' | 'onboarding.age.g2' | 'onboarding.age.g3'
    | 'onboarding.age.g4' | 'onboarding.age.g5' | 'onboarding.age.g6';
}

const GRADE_OPTIONS: GradeOption[] = [
  { value: 'daycare',      emoji: '🐣', labelKey: 'onboarding.age.daycare' },
  { value: 'kindergarten', emoji: '🌱', labelKey: 'onboarding.age.kindergarten' },
  { value: 'g1',           emoji: '1️⃣', labelKey: 'onboarding.age.g1' },
  { value: 'g2',           emoji: '2️⃣', labelKey: 'onboarding.age.g2' },
  { value: 'g3',           emoji: '3️⃣', labelKey: 'onboarding.age.g3' },
  { value: 'g4',           emoji: '4️⃣', labelKey: 'onboarding.age.g4' },
  { value: 'g5',           emoji: '5️⃣', labelKey: 'onboarding.age.g5' },
  { value: 'g6',           emoji: '6️⃣', labelKey: 'onboarding.age.g6' },
];

// ── 컴포넌트 ──────────────────────────────────────────────────────────────────

export class ProfileSetup {
  private el: HTMLElement | null = null;
  private selectedGrade: AgeGroup | null = null;
  private nicknameInput: HTMLInputElement | null = null;
  private nickErrorEl: HTMLElement | null = null;
  private gradeErrorEl: HTMLElement | null = null;

  constructor(
    private container: HTMLElement,
    private router: AppRouter,
    private saveService: SaveService,
  ) {}

  show(): void {
    this.hide();

    // 스타일 주입
    if (!document.getElementById('profile-setup-style')) {
      const style = document.createElement('style');
      style.id = 'profile-setup-style';
      style.textContent = PROFILE_SETUP_STYLE;
      document.head.appendChild(style);
    }

    this.selectedGrade = null;

    const el = document.createElement('div');
    el.classList.add('screen-root');
    el.id = 'profile-setup';
    el.innerHTML = `
      <div class="ps-inner">
        <!-- 헤더 -->
        <div class="ps-header">
          <span class="ps-mascot">🧙</span>
          <div class="ps-title">${t('onboarding.title')}</div>
          <div class="ps-subtitle">사박겜에 오신 것을 환영해요!</div>
        </div>

        <!-- 닉네임 카드 -->
        <div class="ps-card" id="ps-nick-card">
          <div class="ps-label">${t('onboarding.nickname.label')}</div>
          <input
            id="ps-nick-input"
            class="ps-input"
            type="text"
            maxlength="10"
            placeholder="${t('onboarding.nickname.placeholder')}"
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
          <div class="ps-error-msg" id="ps-nick-error"></div>
        </div>

        <!-- 학년 카드 -->
        <div class="ps-card" id="ps-grade-card">
          <div class="ps-label">${t('onboarding.age.label')}</div>
          <div class="ps-grade-grid" id="ps-grade-grid">
            ${GRADE_OPTIONS.map(opt => `
              <button class="ps-chip" data-grade="${opt.value}" type="button">
                <span class="ps-chip-emoji">${opt.emoji}</span>
                <span>${t(opt.labelKey)}</span>
              </button>
            `).join('')}
          </div>
          <div class="ps-error-msg" id="ps-grade-error"></div>
        </div>

        <!-- 시작 버튼 -->
        <button class="ps-start-btn" id="ps-start-btn" type="button">
          ${t('onboarding.start')}
        </button>
      </div>
    `;

    // 닉네임 입력 참조
    this.nicknameInput = el.querySelector<HTMLInputElement>('#ps-nick-input');
    this.nickErrorEl   = el.querySelector<HTMLElement>('#ps-nick-error');
    this.gradeErrorEl  = el.querySelector<HTMLElement>('#ps-grade-error');

    // 닉네임 실시간 에러 해제
    this.nicknameInput?.addEventListener('input', () => {
      this.nicknameInput?.classList.remove('ps-error');
      if (this.nickErrorEl) this.nickErrorEl.textContent = '';
    });

    // 학년 칩 선택
    el.querySelector('#ps-grade-grid')?.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.ps-chip');
      if (!btn) return;
      const grade = btn.dataset.grade as AgeGroup;
      this.selectedGrade = grade;

      // 선택 표시 갱신
      el.querySelectorAll('.ps-chip').forEach(c => c.classList.remove('selected'));
      btn.classList.add('selected');

      // 에러 해제
      if (this.gradeErrorEl) this.gradeErrorEl.textContent = '';
    });

    // 시작 버튼
    el.querySelector('#ps-start-btn')?.addEventListener('click', () => {
      this.handleSubmit();
    });

    this.container.appendChild(el);
    this.el = el;

    // 포커스
    requestAnimationFrame(() => {
      this.nicknameInput?.focus();
    });
  }

  hide(): void {
    if (this.el) {
      fadeOutAndRemove(this.el);
      this.el = null;
    }
    this.nicknameInput = null;
    this.nickErrorEl   = null;
    this.gradeErrorEl  = null;
  }

  private handleSubmit(): void {
    const raw = this.nicknameInput?.value ?? '';
    const nickname = raw.trim();
    let valid = true;

    // 닉네임 검증
    if (nickname.length < 1 || nickname.length > 10) {
      this.nicknameInput?.classList.add('ps-error');
      if (this.nickErrorEl) this.nickErrorEl.textContent = t('onboarding.nickname.error');
      valid = false;
    }

    // 학년 검증
    if (!this.selectedGrade) {
      if (this.gradeErrorEl) this.gradeErrorEl.textContent = t('onboarding.age.error');
      valid = false;
    }

    if (!valid) return;

    const profile: ChildProfile = {
      nickname,
      ageGroup: this.selectedGrade!,
      createdAt: Date.now(),
    };

    this.saveService.setProfile(profile);
    this.router.navigate({ to: 'home-b', replace: true });
  }
}
