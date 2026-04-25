import { t } from '../i18n';

const QUIT_CONFIRM_STYLES_ID = 'quit-confirm-styles';

function injectStyles(): void {
  if (document.getElementById(QUIT_CONFIRM_STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = QUIT_CONFIRM_STYLES_ID;
  style.textContent = `
@keyframes quit-modal-in {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
  `;
  document.head.appendChild(style);
}

export function showQuitConfirm(onConfirm: () => void, onCancel: () => void): void {
  injectStyles();

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;

  const card = document.createElement('div');
  card.style.cssText = `
    background: rgba(255,255,255,0.95);
    border-radius: 20px;
    padding: 28px 24px;
    width: calc(100vw - 48px);
    max-width: 320px;
    text-align: center;
    box-shadow: 0 8px 40px rgba(0,0,0,0.30);
    animation: quit-modal-in 200ms ease-out;
    box-sizing: border-box;
  `;

  const titleEl = document.createElement('div');
  titleEl.textContent = t('game.quitTitle');
  titleEl.style.cssText = `
    font-size: 1.25rem;
    font-weight: 900;
    color: #111827;
    margin-bottom: 10px;
  `;
  card.appendChild(titleEl);

  const msgEl = document.createElement('div');
  msgEl.textContent = t('game.quitMessage');
  msgEl.style.cssText = `
    font-size: 0.9rem;
    color: #6B7280;
    font-weight: 500;
    margin-bottom: 24px;
    line-height: 1.5;
  `;
  card.appendChild(msgEl);

  const leaveBtn = document.createElement('button');
  leaveBtn.textContent = t('game.quitConfirm');
  leaveBtn.style.cssText = `
    display: block;
    width: 100%;
    padding: 14px;
    background: #EF4444;
    border: none;
    border-radius: 14px;
    color: #fff;
    font-size: 1rem;
    font-weight: 800;
    cursor: pointer;
    margin-bottom: 10px;
    touch-action: manipulation;
  `;
  leaveBtn.addEventListener('click', () => {
    overlay.remove();
    onConfirm();
  });
  card.appendChild(leaveBtn);

  const keepBtn = document.createElement('button');
  keepBtn.textContent = t('game.quitCancel');
  keepBtn.style.cssText = `
    display: block;
    width: 100%;
    padding: 14px;
    background: rgba(255,255,255,0.2);
    border: 1.5px solid #D1D5DB;
    border-radius: 14px;
    color: #374151;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    touch-action: manipulation;
  `;
  keepBtn.addEventListener('click', () => {
    overlay.remove();
    onCancel();
  });
  card.appendChild(keepBtn);

  overlay.appendChild(card);
  document.body.appendChild(overlay);
}
