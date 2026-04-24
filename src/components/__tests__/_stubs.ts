import { vi } from 'vitest';
import type { AppRouter } from '../../router/AppRouter';
import type { GameBus } from '../../game-bus';

export function createRouterStub(): AppRouter & { _nav: ReturnType<typeof vi.fn>; _back: ReturnType<typeof vi.fn> } {
  const navigate = vi.fn();
  const back = vi.fn();
  return { navigate, back, _nav: navigate, _back: back } as unknown as AppRouter & {
    _nav: ReturnType<typeof vi.fn>;
    _back: ReturnType<typeof vi.fn>;
  };
}

export function createBusStub(): GameBus & { _emit: ReturnType<typeof vi.fn> } {
  const emit = vi.fn();
  const on = vi.fn();
  const off = vi.fn();
  return { emit, on, off, _emit: emit } as unknown as GameBus & { _emit: ReturnType<typeof vi.fn> };
}

export function mountContainer(): HTMLElement {
  const el = document.createElement('div');
  document.body.appendChild(el);
  return el;
}

export function cleanup(container: HTMLElement): void {
  container.remove();
  // clear lazy-cached style tags so each test starts fresh
  document.querySelectorAll(
    '#brand-home-style, #subject-select-style, #result-style, #level-intro-style',
  ).forEach(s => s.remove());
}
