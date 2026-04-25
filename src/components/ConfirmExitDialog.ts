/**
 * 게임 중도 종료 확인 다이얼로그
 * position: fixed 오버레이로 렌더링됨
 */
export function showConfirmExitDialog(
  onConfirm: () => void,
  onCancel?: () => void
): void {
  if (document.getElementById('confirm-exit-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'confirm-exit-overlay';
  overlay.innerHTML = `
    <div class="confirm-exit-backdrop"></div>
    <div class="confirm-exit-dialog" role="dialog" aria-modal="true">
      <div class="confirm-exit-icon">🚪</div>
      <h2 class="confirm-exit-title">게임을 나가시겠어요?</h2>
      <p class="confirm-exit-desc">진행 중인 기록은 저장되지 않아요</p>
      <div class="confirm-exit-buttons">
        <button class="confirm-exit-cancel" id="confirm-exit-cancel">계속하기</button>
        <button class="confirm-exit-confirm" id="confirm-exit-ok">나가기</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.id = 'confirm-exit-style';
  style.textContent = `
    #confirm-exit-overlay {
      position: fixed; inset: 0; z-index: 9999;
      display: flex; align-items: center; justify-content: center;
    }
    .confirm-exit-backdrop {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(4px);
    }
    .confirm-exit-dialog {
      position: relative;
      background: rgba(255,255,255,0.18);
      border: 1px solid rgba(255,255,255,0.3);
      backdrop-filter: blur(16px);
      border-radius: 20px;
      padding: 32px 28px 24px;
      min-width: 280px;
      max-width: 320px;
      text-align: center;
      box-shadow: 0 8px 40px rgba(0,0,0,0.35);
      animation: confirm-exit-pop 200ms ease-out;
    }
    @keyframes confirm-exit-pop {
      from { transform: scale(0.85); opacity: 0; }
      to   { transform: scale(1);    opacity: 1; }
    }
    .confirm-exit-icon { font-size: 2.5rem; margin-bottom: 8px; }
    .confirm-exit-title {
      font-size: 1.2rem; font-weight: 700;
      color: #fff; margin: 0 0 8px;
    }
    .confirm-exit-desc {
      font-size: 0.85rem; color: rgba(255,255,255,0.75);
      margin: 0 0 24px;
    }
    .confirm-exit-buttons {
      display: flex; gap: 12px;
    }
    .confirm-exit-cancel, .confirm-exit-confirm {
      flex: 1; padding: 12px 0; border-radius: 12px;
      font-size: 0.95rem; font-weight: 600;
      border: none; cursor: pointer;
      transition: transform 100ms, opacity 100ms;
    }
    .confirm-exit-cancel:active, .confirm-exit-confirm:active {
      transform: scale(0.95);
    }
    .confirm-exit-cancel {
      background: rgba(255,255,255,0.2);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.3) !important;
    }
    .confirm-exit-confirm {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #fff;
      box-shadow: 0 4px 16px rgba(239,68,68,0.45);
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  const cleanup = () => {
    overlay.remove();
    document.getElementById('confirm-exit-style')?.remove();
  };

  document.getElementById('confirm-exit-ok')!.addEventListener('click', () => {
    cleanup();
    onConfirm();
  });

  document.getElementById('confirm-exit-cancel')!.addEventListener('click', () => {
    cleanup();
    onCancel?.();
  });

  overlay.querySelector('.confirm-exit-backdrop')!.addEventListener('click', () => {
    cleanup();
    onCancel?.();
  });
}
