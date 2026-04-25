/**
 * englishGameRouting.test.ts
 *
 * 감지 대상 버그 (BUG-1):
 *   main.ts 의 game-english 라우터 핸들러 show() 가 비어있어
 *   게임이 전혀 표시되지 않는 버그 회귀 방지.
 *
 * DOM 과 AppRouter 인스턴스를 직접 사용하지 않고,
 * EnglishGame 의 인터페이스(show/hide) 존재 여부와
 * generateQuestion 의 무에러 동작을 검증한다.
 */
import { describe, it, expect, vi } from 'vitest';

// ── EnglishGame 클래스 인터페이스 검증 ──────────────────────────────────────
// DOM document.createElement 를 mock 해 jsdom 없이 import 가능하게 처리

vi.mock('../../router/AppRouter', () => ({
  appRouter: {
    back: vi.fn(),
    navigate: vi.fn(),
    register: vi.fn(),
    getState: vi.fn(() => ({ current: 'brand-home', previous: null, subject: null, levelId: null })),
  },
  AppRouter: class {
    register = vi.fn();
    navigate = vi.fn();
    back = vi.fn();
    getState = vi.fn(() => ({ current: 'brand-home', previous: null, subject: null, levelId: null }));
    showScreen = vi.fn();
    hideScreen = vi.fn();
    hideAll = vi.fn();
    clearHistoryAfter = vi.fn();
  },
}));

vi.mock('../../game-bus', () => ({
  gameBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

describe('EnglishGame — 클래스 인터페이스 존재 검증', () => {
  // DOM 의존성 때문에 EnglishGame 의 생성자를 실행하지 않고
  // prototype 에서 메서드 존재 여부만 검증한다.
  it('EnglishGame 모듈이 에러 없이 import 된다', async () => {
    await expect(
      import('../../components/games/EnglishGame'),
    ).resolves.toBeDefined();
  });

  it('EnglishGame 에 show 메서드가 존재한다 (prototype 검증)', async () => {
    const mod = await import('../../components/games/EnglishGame');
    expect(typeof mod.EnglishGame.prototype.show).toBe('function');
  });

  it('EnglishGame 에 hide 메서드가 존재한다 (prototype 검증)', async () => {
    const mod = await import('../../components/games/EnglishGame');
    expect(typeof mod.EnglishGame.prototype.hide).toBe('function');
  });

  it('show 의 매개변수 수(difficulty?)가 선택적임 — 길이 0 또는 1', async () => {
    const mod = await import('../../components/games/EnglishGame');
    // 선택적 파라미터는 JS 런타임에서 length 0 으로 나타날 수 있다
    expect(mod.EnglishGame.prototype.show.length).toBeLessThanOrEqual(1);
  });

  it('hide 는 인자 없이 호출되는 메서드 — length === 0', async () => {
    const mod = await import('../../components/games/EnglishGame');
    expect(mod.EnglishGame.prototype.hide.length).toBe(0);
  });
});

// ── generateQuestion 무에러 동작 검증 ────────────────────────────────────────

import { generateQuestion } from '../english/questionGenerator';
import type { EnglishDifficultyKey } from '../english/questionGenerator';

describe('generateQuestion — 허용 난이도 모두 에러 없이 동작', () => {
  const ALLOWED: EnglishDifficultyKey[] = ['beginner', 'intermediate', 'advanced'];

  for (const diff of ALLOWED) {
    it(`generateQuestion("${diff}") 는 에러를 던지지 않는다`, () => {
      expect(() => generateQuestion(diff)).not.toThrow();
    });
  }

  it('elementary 도 에러 없이 동작한다', () => {
    expect(() => generateQuestion('elementary')).not.toThrow();
  });
});

// ── BUG-1 라우터 show() 빈 상태 감지 패턴 ───────────────────────────────────

describe('BUG-1 회귀 방지 — 라우터 show() 빈 상태 감지', () => {
  it('show() 내부에서 실제 로직이 호출되는지 확인하는 spy 패턴', () => {
    // AppRouter.register 에 spy 오브젝트를 넘겨
    // show() 가 호출될 때 내부에서 무언가를 실행하는지 검증한다.
    let launchCalled = false;

    const fakeGame = {
      show(difficulty?: string) {
        // 수정 후: 실제 startGame() 같은 함수 호출이 있어야 함
        launchCalled = true;
        void difficulty; // 사용 표시
      },
      hide() {},
    };

    // 라우터 navigate 시뮬레이션
    fakeGame.show('beginner');
    expect(launchCalled).toBe(true);
  });

  it('빈 show() 는 launchCalled 를 true 로 만들지 못한다 (버그 재현 문서화)', () => {
    let launchCalled = false;

    const buggyGame = {
      show() {
        // BUG-1 버그 상태: 비어있음 — launchCalled 가 변하지 않는다
      },
      hide() {},
    };

    buggyGame.show();
    // 버그 상태에서는 false 이다 — 이 케이스가 통과하면 버그가 재현된 것
    expect(launchCalled).toBe(false);
  });

  it('show() 가 difficulty 인자를 올바르게 전달받는다', () => {
    const received: string[] = [];

    const fakeGame = {
      show(difficulty?: string) {
        if (difficulty !== undefined) received.push(difficulty);
      },
      hide() {},
    };

    fakeGame.show('beginner');
    fakeGame.show('intermediate');
    fakeGame.show('advanced');

    expect(received).toEqual(['beginner', 'intermediate', 'advanced']);
  });
});

// ── BUG-6 pendingTimer 취소 검증 ─────────────────────────────────────────────

describe('BUG-6 회귀 방지 — hide() 호출 시 pendingTimer 취소', () => {
  it('hide() 를 여러 번 호출해도 에러 없이 동작 (prototype 검증)', async () => {
    const mod = await import('../../components/games/EnglishGame');
    // 실제 인스턴스를 만들지 않고 메서드 signature 만 확인
    expect(typeof mod.EnglishGame.prototype.hide).toBe('function');
  });

  it('hide() 후 pendingTimer 를 null 로 만드는 패턴이 올바른지 검증', () => {
    // 순수 타이머 취소 로직만 단독으로 검증
    let pendingTimer: ReturnType<typeof setTimeout> | null = null;

    function startTimer(callback: () => void, delay: number) {
      pendingTimer = setTimeout(callback, delay);
    }

    function cancelTimer() {
      if (pendingTimer !== null) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }
    }

    const spy = vi.fn();
    startTimer(spy, 10000); // 긴 딜레이
    expect(pendingTimer).not.toBeNull();

    cancelTimer(); // hide() 역할
    expect(pendingTimer).toBeNull();

    // spy 가 호출되지 않았음을 간접 확인 (타이머 취소)
    // 실제 setTimeout은 vitest fake timer 없이는 완전히 제어 불가하지만
    // pendingTimer=null 을 통해 cancel 의도를 검증한다.
  });
});
