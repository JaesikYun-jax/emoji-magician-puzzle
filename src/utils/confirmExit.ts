const STYLE_ID = 'confirm-exit-styles';

function injectStyles(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
@keyframes confirm-exit-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes confirm-exit-card-in {
  from { opacity: 0; transform: scale(0.8) translateY(12px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
#confirm-exit-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: confirm-exit-overlay-in 180ms ease-out;
}
#confirm-exit-card {
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1.5px solid rgba(255, 255, 255, 0.28);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  padding: 32px 28px 24px;
  width: calc(100vw - 48px);
  max-width: 340px;
  text-align: center;
  box-sizing: border-box;
  animation: confirm-exit-card-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
#confirm-exit-title {
  font-size: 1.35rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 10px;
}
#confirm-exit-desc {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 28px;
  line-height: 1.5;
}
.confirm-exit-btn {
  display: block;
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  transition: opacity 100ms;
}
.confirm-exit-btn:active { opacity: 0.8; }
#confirm-exit-cancel {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.85), rgba(59, 130, 246, 0.85));
  border: none;
  color: #fff;
  margin-bottom: 10px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.40);
}
#confirm-exit-confirm {
  background: rgba(255, 255, 255, 0.10);
  border: 1.5px solid rgba(239, 68, 68, 0.55);
  color: #FCA5A5;
}
`;
  document.head.appendChild(style);
}

export function confirmExit(onConfirm: () => void, onCancel?: () => void): void {
  injectStyles();

  const overlay = document.createElement('div');
  overlay.id = 'confirm-exit-overlay';

  const card = document.createElement('div');
  card.id = 'confirm-exit-card';

  const title = document.createElement('div');
  title.id = 'confirm-exit-title';
  title.textContent = '게임을 종료할까요?';

  const desc = document.createElement('div');
  desc.id = 'confirm-exit-desc';
  desc.textContent = '지금까지의 진행이 저장되지 않을 수 있어요.';

  const cancelBtn = document.createElement('button');
  cancelBtn.id = 'confirm-exit-cancel';
  cancelBtn.className = 'confirm-exit-btn';
  cancelBtn.textContent = '계속하기';

  const confirmBtn = document.createElement('button');
  confirmBtn.id = 'confirm-exit-confirm';
  confirmBtn.className = 'confirm-exit-btn';
  confirmBtn.textContent = '나가기';

  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(cancelBtn);
  card.appendChild(confirmBtn);
  overlay.appendChild(card);

  function close(): void {
    overlay.remove();
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      close();
      onCancel?.();
    }
  }

  cancelBtn.addEventListener('click', () => {
    close();
    onCancel?.();
  });

  confirmBtn.addEventListener('click', () => {
    close();
    onConfirm();
  });

  // 배경(overlay) 클릭 시 취소
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
      onCancel?.();
    }
  });

  document.addEventListener('keydown', onKeyDown);
  document.body.appendChild(overlay);
}
