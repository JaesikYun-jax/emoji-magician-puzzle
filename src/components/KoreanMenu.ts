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
#korean-menu .km-start-btn {
  background: #F43F5E;
  color: #fff;
  border: none;
  padding: 14px 32px;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(244,63,94,0.40);
  touch-action: manipulation;
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
        <div class="km-icon">가나다</div>
        <div class="km-coming-title">국어 자모 조합</div>
        <p class="km-coming-sub">자음과 모음을 조합해 글자를 완성해요</p>
        <button class="km-start-btn">자모 조합 게임 시작 →</button>
      </div>
    `;

    el.querySelector('.km-back-btn')!.addEventListener('click', () => {
      this.router.back();
    });

    el.querySelector('.km-start-btn')!.addEventListener('click', () => {
      this.router.navigate({ to: 'game-korean', subject: 'korean' });
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
