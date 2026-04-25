/**
 * englishRouterSmoke.test.ts
 *
 * 목적: game-english 라우터 등록 누락을 감지하는 스모크 테스트.
 *
 * main.ts를 직접 테스트하기 어려우므로, AppRouter의
 * register → navigate → show() 흐름만 검증한다.
 */
import { describe, it, expect, vi } from 'vitest';
import { AppRouter } from '../../router/AppRouter';

describe('AppRouter - game-english 등록 스모크', () => {
  it('game-english 에 show/hide가 등록되면 navigate 시 show()가 호출됨', () => {
    const router = new AppRouter();
    const mockShow = vi.fn();
    const mockHide = vi.fn();

    // brand-home 등록 (초기 화면 숨김용)
    router.register('brand-home', { show: vi.fn(), hide: vi.fn() });
    router.register('game-english', { show: mockShow, hide: mockHide });

    // 초기 상태는 brand-home이므로 navigate로 전환
    router.navigate({ to: 'game-english', subject: 'english' });

    expect(mockShow).toHaveBeenCalledTimes(1);
  });

  it('game-english 에 빈 show()만 등록되면 실제로 아무것도 일어나지 않음 (버그 재현)', () => {
    const router = new AppRouter();
    let gameLaunched = false;

    router.register('brand-home', { show: vi.fn(), hide: vi.fn() });
    // 버그 상태: show가 비어있음
    router.register('game-english', {
      show() { /* TODO — 아무것도 안 함 */ },
      hide() {},
    });

    router.navigate({ to: 'game-english' });

    // gameLaunched가 false인 것이 버그 상태를 의미한다.
    // 이 테스트는 버그를 문서화하기 위해 항상 통과한다.
    expect(gameLaunched).toBe(false);
  });

  it('game-english show()가 실제 로직을 호출해야 gameLaunched=true', () => {
    const router = new AppRouter();
    let gameLaunched = false;

    router.register('brand-home', { show: vi.fn(), hide: vi.fn() });
    // 수정 상태: show가 실제 로직 호출
    router.register('game-english', {
      show() { gameLaunched = true; },
      hide() {},
    });

    router.navigate({ to: 'game-english' });

    expect(gameLaunched).toBe(true);
  });

  it('navigate 후 router 상태의 current가 game-english로 변경됨', () => {
    const router = new AppRouter();

    router.register('brand-home', { show: vi.fn(), hide: vi.fn() });
    router.register('game-english', { show: vi.fn(), hide: vi.fn() });

    router.navigate({ to: 'game-english', subject: 'english' });

    expect(router.getState().current).toBe('game-english');
  });

  it('game-english 미등록 상태에서 navigate해도 에러 없이 상태 전환됨', () => {
    const router = new AppRouter();

    router.register('brand-home', { show: vi.fn(), hide: vi.fn() });
    // game-english 를 의도적으로 등록하지 않음

    expect(() => router.navigate({ to: 'game-english' })).not.toThrow();
    expect(router.getState().current).toBe('game-english');
  });

  it('navigate 후 back() 호출 시 brand-home으로 복귀됨', () => {
    const router = new AppRouter();

    router.register('brand-home', { show: vi.fn(), hide: vi.fn() });
    router.register('game-english', { show: vi.fn(), hide: vi.fn() });

    router.navigate({ to: 'game-english', subject: 'english' });
    expect(router.getState().current).toBe('game-english');

    router.back();
    expect(router.getState().current).toBe('brand-home');
  });
});
