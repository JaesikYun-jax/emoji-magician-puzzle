import type { AppRouter } from '../router/AppRouter';
import { t } from '../i18n';

const KOREAN_MENU_STYLE = `
#korean-menu {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #F8FAFC;
  z-index: 20;
}
#korean-menu .km-header {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #FB7185, #F43F5E);
}
#korean-menu .km-back-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  font-size: 1.4rem;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 12px;
  margin-right: 12px;
  line-height: 1;
}
#korean-menu .km-title {
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
}
#korean-menu .km-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 24px;
  text-align: center;
}
#korean-menu .km-icon {
  font-size: 4rem;
  line-height: 1;
}
#korean-menu .km-coming-title {
  font-size: 1.6rem;
  font-weight: bold;
  color: #1E293B;
}
#korean-menu .km-coming-sub {
  font-size: 1rem;
  color: #64748B;
  line-height: 1.6;
}
#korean-menu .km-badge {
  display: inline-block;
  background: #F43F5E;
  color: #fff;
  font-size: 0.85rem;
  font-weight: bold;
  padding: 6px 16px;
  border-radius: 999px;
}
`;

export class KoreanMenu {
  private el: HTMLElement | null = null;

  constructor(private container: HTMLElement, private router: AppRouter) {}

  show(): void {
    this.hide();

    if (!document.getElementById('korean-menu-style')) {
      const style = document.createElement('style');
      style.id = 'korean-menu-style';
      style.textContent = KOREAN_MENU_STYLE;
      document.head.appendChild(style);
    }

    const el = document.createElement('div');
    el.id = 'korean-menu';
    el.innerHTML = `
      <div class="km-header">
        <button class="km-back-btn">&#8592;</button>
        <span class="km-title">${t('subject.korean')}</span>
      </div>
      <div class="km-body">
        <div class="km-icon">가</div>
        <div class="km-coming-title">${t('subject.comingSoonMsg')}</div>
        <p class="km-coming-sub">
          ${t('subject.korean.detail')}
        </p>
        <span class="km-badge">Coming Soon</span>
      </div>
    `;

    el.querySelector('.km-back-btn')!.addEventListener('click', () => {
      this.router.back();
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
