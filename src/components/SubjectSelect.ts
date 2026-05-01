import type { AppRouter } from '../router/AppRouter';
import { t } from '../i18n';

const SUBJECT_SELECT_STYLE = `
#subject-select {
  position: fixed; inset: 0;
  display: flex; flex-direction: column;
  background:
    radial-gradient(ellipse 70% 50% at 0% 0%, rgba(217,249,157,0.10), transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(251,113,133,0.15), transparent 60%),
    linear-gradient(165deg, #2E1065 0%, #4C1D95 50%, #6D28D9 100%);
  z-index: 20;
  font-family: var(--f-kr);
  color: #fff;
  overflow: hidden;
}
#subject-select::before {
  content: ''; position: absolute; inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.3 0'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>");
  mix-blend-mode: overlay; opacity: 0.22; pointer-events: none; z-index: 0;
}
#subject-select > * { position: relative; z-index: 1; }

#subject-select .ss-header {
  display: flex; align-items: center; gap: 12px;
  padding: calc(env(safe-area-inset-top, 0px) + 32px) 22px 18px;
}
#subject-select .ss-back {
  width: 40px; height: 40px; border-radius: 14px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  color: #fff;
  display: grid; place-items: center; cursor: pointer;
  transition: transform 150ms, background 150ms;
}
#subject-select .ss-back:hover { background: rgba(255,255,255,0.14); }
#subject-select .ss-back:active { transform: scale(0.92); }

#subject-select .ss-title-wrap { display: flex; flex-direction: column; gap: 2px; }
#subject-select .ss-title-wrap .sb-eyebrow { color: #D9F99D; }
#subject-select .ss-title {
  font-size: 22px; margin-top: 2px; color: #fff;
}

#subject-select .ss-cards {
  flex: 1;
  display: flex; flex-direction: column; gap: 12px;
  padding: 4px 22px 40px;
  overflow-y: auto;
  max-width: 520px; margin: 0 auto; width: 100%;
}

#subject-select .ss-card {
  display: flex; align-items: center; gap: 14px;
  text-align: left; padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  color: #fff; cursor: pointer;
  position: relative; overflow: hidden;
  transition: transform 200ms, border-color 200ms;
}
#subject-select .ss-card:hover { border-color: rgba(255,255,255,0.28); transform: translateY(-2px); }
#subject-select .ss-card:active { transform: scale(0.98); }

#subject-select .ss-card__glow {
  position: absolute; top: -30px; right: -30px;
  width: 130px; height: 130px; border-radius: 50%;
  filter: blur(30px); opacity: 0.35; pointer-events: none;
}
#subject-select .ss-card[data-subject="math"]       .ss-card__glow { background: #0EA5E9; }
#subject-select .ss-card[data-subject="english"]    .ss-card__glow { background: #10B981; }
#subject-select .ss-card[data-subject="korean"]     .ss-card__glow { background: #F43F5E; }
#subject-select .ss-card[data-subject="logic"]      .ss-card__glow { background: #6366F1; }
#subject-select .ss-card[data-subject="creativity"] .ss-card__glow { background: #F97316; }
#subject-select .ss-card[data-subject="reasoning"]  .ss-card__glow { background: #14B8A6; }

#subject-select .ss-card__icon {
  width: 58px; height: 58px; border-radius: 18px; background: #fff;
  display: grid; place-items: center;
  font-size: 28px; flex-shrink: 0;
  box-shadow: 0 8px 18px rgba(0,0,0,0.25);
  position: relative; z-index: 1;
}

#subject-select .ss-card__info { flex: 1; position: relative; z-index: 1; }
#subject-select .ss-card__namerow { display: flex; align-items: center; gap: 8px; }
#subject-select .ss-card__name {
  font-family: var(--f-display); font-size: 18px; font-weight: 800; letter-spacing: -0.02em;
}
#subject-select .ss-card__badge {
  background: rgba(253,230,138,0.22); color: #FDE68A;
  padding: 3px 8px; font-size: 9px;
}
#subject-select .ss-card__sub {
  font-size: 12px; color: rgba(255,255,255,0.65); margin-top: 4px;
}
#subject-select .ss-card__meta {
  display: flex; gap: 10px; margin-top: 8px;
  font-family: var(--f-sans); font-size: 10px; font-weight: 700;
  color: rgba(255,255,255,0.5); letter-spacing: 0.1em; text-transform: uppercase;
}
#subject-select .ss-card__arrow {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(217,249,157,0.14);
  border: 1px solid rgba(217,249,157,0.30);
  display: grid; place-items: center;
  color: #D9F99D;
  position: relative; z-index: 1;
  flex-shrink: 0;
  transition: transform 200ms, background 200ms;
}
#subject-select .ss-card:hover .ss-card__arrow { transform: translateX(3px); background: rgba(217,249,157,0.22); }

#subject-select .ss-toast {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 40px);
  left: 50%; transform: translateX(-50%);
  background: rgba(15,5,41,0.92);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff; padding: 14px 24px; border-radius: 999px;
  font-size: 14px; font-weight: 500;
  z-index: 30; opacity: 0; pointer-events: none;
  transition: opacity 250ms;
}
#subject-select .ss-toast.show { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  #subject-select .ss-card { transition: none; }
}
`;

interface SubjectCard {
  id: 'math' | 'english' | 'korean' | 'logic' | 'creativity' | 'reasoning';
  nameKey: string;
  subKey: string;
  glyph: string;
  color: string;
  levels: number;
  badge?: string;
  disabled?: boolean;
}

const SUBJECT_CARDS: SubjectCard[] = [
  { id: 'math',       nameKey: 'subject.math',       subKey: 'subject.math.sub',       glyph: '🔢', color: '#0EA5E9', levels: 42 },
  { id: 'english',    nameKey: 'subject.english',    subKey: 'subject.english.sub',    glyph: '🔤', color: '#10B981', levels: 38 },
  { id: 'korean',     nameKey: 'subject.korean',     subKey: 'subject.korean.sub',     glyph: '📚', color: '#F43F5E', levels: 28, badge: 'NEW', disabled: true },
  { id: 'logic',      nameKey: 'subject.logic',      subKey: 'subject.logic.sub',      glyph: '🧩', color: '#6366F1', levels: 32 },
  { id: 'creativity', nameKey: 'subject.creativity', subKey: 'subject.creativity.sub', glyph: '🎨', color: '#F97316', levels: 24, badge: 'NEW' },
  { id: 'reasoning', nameKey: 'subject.reasoning', subKey: 'subject.reasoning.sub', glyph: '🔍', color: '#14B8A6', levels: 30 },
];

const ARROW_SVG = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`;
const BACK_SVG = `<svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M12 4L6 10l6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export class SubjectSelect {
  private el: HTMLElement | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private container: HTMLElement, private router: AppRouter) {}

  show(): void {
    this.hide();

    if (!document.getElementById('subject-select-style')) {
      const style = document.createElement('style');
      style.id = 'subject-select-style';
      style.textContent = SUBJECT_SELECT_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'subject-select';
    el.innerHTML = `
      <div class="ss-header">
        <button class="ss-back" aria-label="back" type="button">${BACK_SVG}</button>
        <div class="ss-title-wrap">
          <span class="sb-eyebrow">Choose one</span>
          <span class="sb-display ss-title">오늘 배울 <em style="color:#FDE68A">과목</em></span>
        </div>
      </div>
      <div class="ss-cards">
        ${SUBJECT_CARDS.map(s => `
          <button class="ss-card" data-subject="${s.id}" type="button">
            <div class="ss-card__glow"></div>
            <div class="ss-card__icon" style="color:${s.color};">${s.glyph}</div>
            <div class="ss-card__info">
              <div class="ss-card__namerow">
                <div class="ss-card__name">${t(s.nameKey as never)}</div>
                ${s.badge ? `<span class="sb-chip ss-card__badge">${s.badge}</span>` : ''}
              </div>
              <div class="ss-card__sub">${t(s.subKey as never)}</div>
              <div class="ss-card__meta"><span>레벨 ${s.levels}</span><span>·</span><span>★ 24</span></div>
            </div>
            <span class="ss-card__arrow" aria-hidden="true">${ARROW_SVG}</span>
          </button>
        `).join('')}
      </div>
      <div class="ss-toast" id="ss-toast-msg"></div>
    `;

    el.querySelector('.ss-back')!.addEventListener('click', () => this.router.back());

    el.querySelectorAll<HTMLButtonElement>('.ss-card').forEach(card => {
      card.addEventListener('click', () => {
        const subject = card.dataset['subject'];
        if (subject === 'korean') {
          this.showToast(t('subject.comingSoonMsg' as never));
          return;
        }
        if (subject === 'math')           this.router.navigate({ to: 'math-menu', subject: 'math' });
        else if (subject === 'english')   this.router.navigate({ to: 'english-menu', subject: 'english' });
        else if (subject === 'logic')     this.router.navigate({ to: 'logic-menu', subject: 'logic' });
        else if (subject === 'creativity')this.router.navigate({ to: 'creativity-menu', subject: 'creativity' });
        else if (subject === 'reasoning') this.router.navigate({ to: 'reasoning-menu', subject: 'reasoning' });
      });
    });

    this.container.appendChild(el);
    this.el = el;
  }

  hide(): void {
    if (this.toastTimer !== null) { clearTimeout(this.toastTimer); this.toastTimer = null; }
    if (this.el) { this.el.remove(); this.el = null; }
  }

  private showToast(message: string): void {
    const toast = this.el?.querySelector('#ss-toast-msg') as HTMLElement | null;
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (this.toastTimer !== null) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      this.toastTimer = null;
    }, 2000);
  }
}
