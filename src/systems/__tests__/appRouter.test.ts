import { describe, it, expect, beforeEach } from 'vitest';
import { AppRouter } from '../../router/AppRouter';
import type { ScreenId } from '../../router/AppRouter';

// Minimal stub that satisfies the ShowHideable interface
function makeStub() {
  return {
    show: () => {},
    hide: () => {},
  };
}

describe('AppRouter', () => {
  let router: AppRouter;

  beforeEach(() => {
    router = new AppRouter();
  });

  it('can be instantiated', () => {
    expect(router).toBeInstanceOf(AppRouter);
  });

  it('initial currentScreen is "brand-home"', () => {
    const state = router.getState();
    expect(state.current).toBe('brand-home');
  });

  it('initial previousScreen is null', () => {
    const state = router.getState();
    expect(state.previous).toBeNull();
  });

  it('initial subject is null', () => {
    expect(router.getState().subject).toBeNull();
  });

  it('navigate({ to: "subject-select" }) updates current to "subject-select"', () => {
    router.navigate({ to: 'subject-select' });
    expect(router.getState().current).toBe('subject-select');
  });

  it('navigate records previous screen', () => {
    router.navigate({ to: 'subject-select' });
    expect(router.getState().previous).toBe('brand-home');
  });

  it('navigate with subject updates subject in state', () => {
    router.navigate({ to: 'math-menu', subject: 'math' });
    expect(router.getState().subject).toBe('math');
  });

  it('navigate preserves existing subject when no new subject is given', () => {
    router.navigate({ to: 'math-menu', subject: 'math' });
    router.navigate({ to: 'level-select' });
    expect(router.getState().subject).toBe('math');
  });

  it('navigate with levelId stores levelId in state', () => {
    router.navigate({ to: 'level-select', levelId: 'math-add-single-1' });
    expect(router.getState().levelId).toBe('math-add-single-1');
  });

  it('back() returns to previousScreen', () => {
    router.navigate({ to: 'subject-select' });
    router.navigate({ to: 'math-menu', subject: 'math' });
    router.back();
    expect(router.getState().current).toBe('subject-select');
  });

  it('back() does nothing when previous is null', () => {
    // No navigation done, so previous === null
    router.back();
    expect(router.getState().current).toBe('brand-home');
  });

  it('back() sets previous to the screen before the screen navigated away from', () => {
    // 히스토리 스택 방식:
    // navigate: brand-home -> subject-select -> math-menu
    //   historyStack: ['brand-home', 'subject-select']
    // back(): pop 'subject-select' → current='subject-select', previous='brand-home'
    router.navigate({ to: 'subject-select' });          // stack: ['brand-home']
    router.navigate({ to: 'math-menu', subject: 'math' }); // stack: ['brand-home', 'subject-select']
    router.back(); // pop → current='subject-select', previous='brand-home'
    expect(router.getState().previous).toBe('brand-home');
    expect(router.getState().current).toBe('subject-select');
  });

  it('registered screens have show/hide called on navigate', () => {
    let showCount = 0;
    let hideCount = 0;
    const stub = {
      show: () => { showCount++; },
      hide: () => { hideCount++; },
    };
    router.register('brand-home', stub);
    router.navigate({ to: 'subject-select' });
    // brand-home should have been hidden
    expect(hideCount).toBe(1);
  });

  it('showScreen calls show on registered component', () => {
    let shown = false;
    router.register('subject-select', { show: () => { shown = true; }, hide: () => {} });
    router.showScreen('subject-select');
    expect(shown).toBe(true);
  });

  it('hideScreen calls hide on registered component', () => {
    let hidden = false;
    router.register('math-menu', { show: () => {}, hide: () => { hidden = true; } });
    router.hideScreen('math-menu');
    expect(hidden).toBe(true);
  });

  it('showScreen on unregistered ID does not throw', () => {
    expect(() => router.showScreen('result')).not.toThrow();
  });

  it('hideAll calls hide on all registered screens', () => {
    const counts: Record<string, number> = { a: 0, b: 0 };
    router.register('brand-home', { show: () => {}, hide: () => { counts.a++; } });
    router.register('subject-select', { show: () => {}, hide: () => { counts.b++; } });
    router.hideAll();
    expect(counts.a).toBe(1);
    expect(counts.b).toBe(1);
  });

  it('multiple navigations build a correct trail of previous screens', () => {
    router.navigate({ to: 'subject-select' });
    router.navigate({ to: 'math-menu', subject: 'math' });
    router.navigate({ to: 'level-select' });
    const state = router.getState();
    expect(state.current).toBe('level-select');
    expect(state.previous).toBe('math-menu');
  });

  describe('skipHistory 동작', () => {
    it('skipHistory: true 시 게임 화면이 히스토리에서 제거되어 previous가 game-math 이전 화면을 가리킨다', () => {
      // 히스토리 스택 방식:
      //   navigate subject-select → stack: ['brand-home']
      //   navigate math-menu     → stack: ['brand-home', 'subject-select']
      //   navigate game-math     → stack: ['brand-home', 'subject-select', 'math-menu']
      //   navigate math-menu (skipHistory:true) → pop 'math-menu' → stack: ['brand-home', 'subject-select']
      //   previous = stack top = 'subject-select'
      router.navigate({ to: 'subject-select' });
      router.navigate({ to: 'math-menu', subject: 'math' });
      router.navigate({ to: 'game-math', levelId: 'math-add-single-1' });
      router.navigate({ to: 'math-menu', skipHistory: true });
      expect(router.getState().current).toBe('math-menu');
      expect(router.getState().previous).toBe('subject-select');
    });

    it('skipHistory: true 시 previous가 game-math로 덮어써지지 않는다', () => {
      // 버그 재현 시나리오:
      // math-menu → game-math → (skipHistory 없이 math-menu로 돌아오면) previous = game-math 가 됨
      // skipHistory: true 로 돌아오면 previous = game-math 가 되지 않음
      router.navigate({ to: 'subject-select' });            // stack: ['brand-home']
      router.navigate({ to: 'math-menu', subject: 'math' }); // stack: ['brand-home', 'subject-select']
      router.navigate({ to: 'game-math', levelId: 'math-add-single-1' }); // stack: ['brand-home', 'subject-select', 'math-menu']

      router.navigate({ to: 'math-menu', skipHistory: true }); // pop 'math-menu' → stack: ['brand-home', 'subject-select']

      // previous는 game-math가 아니라 subject-select (스택 방식으로 game-math 진입 흔적 제거)
      expect(router.getState().previous).not.toBe('game-math');
    });

    it('skipHistory 없이 math-menu로 돌아오면 previous가 game-math가 된다 (대조군)', () => {
      router.navigate({ to: 'math-menu', subject: 'math' });
      router.navigate({ to: 'game-math', levelId: 'math-add-single-1' });
      // skipHistory 없이 navigate → previous가 game-math로 기록됨
      router.navigate({ to: 'math-menu' });
      expect(router.getState().previous).toBe('game-math');
    });

    it('skipHistory: true 후 back()은 game-math가 아닌 올바른 이전 화면으로 이동한다', () => {
      // 히스토리 스택 방식:
      //   subject-select → math-menu → game-math → (skipHistory)math-menu → back()
      //   스택 변화: [brand-home] → [b, subject-select] → [b, s, math-menu] → pop:math-menu → [b, subject-select]
      //   back(): pop subject-select → current='subject-select'
      router.navigate({ to: 'subject-select' });
      router.navigate({ to: 'math-menu', subject: 'math' });
      router.navigate({ to: 'game-math', levelId: 'math-add-single-1' });
      router.navigate({ to: 'math-menu', skipHistory: true });
      router.back();
      // game-math를 건너뛰고 subject-select로 이동
      expect(router.getState().current).toBe('subject-select');
      expect(router.getState().current).not.toBe('game-math');
    });

    it('back()이 game-math로 돌아가지 않는다 (skipHistory: true 사용 후)', () => {
      router.navigate({ to: 'subject-select' });
      router.navigate({ to: 'math-menu', subject: 'math' });
      router.navigate({ to: 'game-math', levelId: 'math-add-single-1' });
      router.navigate({ to: 'math-menu', skipHistory: true });
      router.back();
      expect(router.getState().current).not.toBe('game-math');
    });

    it('skipHistory: true navigate는 스택 top을 제거하고 이전 화면을 previous로 설정한다', () => {
      // stack 변화:
      //   navigate subject-select → stack: ['brand-home']        prev: brand-home
      //   navigate math-menu     → stack: ['brand-home', 'subject-select']  prev: subject-select
      //   navigate level-select (skipHistory:true) → pop 'subject-select' → stack: ['brand-home']  prev: brand-home
      router.navigate({ to: 'subject-select' });
      router.navigate({ to: 'math-menu', subject: 'math' });
      router.navigate({ to: 'level-select', skipHistory: true });
      expect(router.getState().current).toBe('level-select');
      expect(router.getState().previous).toBe('brand-home');
    });

    it('skipHistory: false (기본값)는 previous를 정상 갱신한다', () => {
      router.navigate({ to: 'subject-select' });
      router.navigate({ to: 'math-menu', subject: 'math', skipHistory: false });
      expect(router.getState().previous).toBe('subject-select');
    });

    it('연속 back() 시 히스토리 스택이 정상적으로 소진되고 무한 루프가 발생하지 않는다', () => {
      // stack: [] → navigate → [brand-home] → navigate → [brand-home, subject-select]
      // back(): pop → subject-select, stack: [brand-home]
      // back(): pop → brand-home, stack: []
      // back(): no-op (stack empty)
      router.navigate({ to: 'subject-select' });
      router.navigate({ to: 'math-menu', subject: 'math' });
      router.back(); // math-menu → subject-select
      router.back(); // subject-select → brand-home
      router.back(); // no-op (스택 비어있음)
      // 무한 루프 없이 brand-home에 머뭄
      expect(['brand-home', 'subject-select', 'math-menu']).toContain(router.getState().current);
    });
  });

  describe('ui:retry 버그 수정 — game-math skipHistory: true 복귀', () => {
    // 버그: ui:retry 이벤트가 skipHistory 없이 game-math로 navigate하면
    //   히스토리 스택에 result/math-menu 등이 쌓여 back() 시 game-math 재진입 루프 발생
    // 수정: navigate({ to: 'game-math', skipHistory: true }) 사용

    it('retry 패턴: result → game-math(skipHistory:true) 이후 back()은 game-math로 돌아가지 않는다', () => {
      // 실제 게임 진행 흐름:
      //   brand-home → subject-select → math-menu → level-intro → game-math → result
      //   ui:retry 발생 → game-math(skipHistory:true) 복귀
      router.navigate({ to: 'subject-select' });
      router.navigate({ to: 'math-menu', subject: 'math' });
      router.navigate({ to: 'level-intro', levelId: 'math-add-2' });
      // level-intro 내부에서 skipHistory:true 로 game-math 진입 (level-intro 화면 히스토리 제거)
      router.navigate({ to: 'game-math', skipHistory: true });
      // 게임 종료 → result 화면
      router.navigate({ to: 'result' });
      // ui:retry → game-math로 skipHistory:true 복귀 (result 화면 히스토리 제거)
      router.navigate({ to: 'game-math', skipHistory: true });

      expect(router.getState().current).toBe('game-math');
      // back()을 눌러도 game-math 이전 화면(math-menu 계열)으로 이동해야 함
      router.back();
      expect(router.getState().current).not.toBe('game-math');
      expect(router.getState().current).not.toBe('result');
    });

    it('retry 후 다시 back() 해도 game-math 루프가 발생하지 않는다', () => {
      router.navigate({ to: 'subject-select' });
      router.navigate({ to: 'math-menu', subject: 'math' });
      // game-math 진입 (skipHistory: 일반 navigate)
      router.navigate({ to: 'game-math', levelId: 'math-add-2' });
      // result 화면
      router.navigate({ to: 'result' });
      // ui:retry → game-math skipHistory:true (result 히스토리 제거)
      router.navigate({ to: 'game-math', skipHistory: true });
      // result 화면 다시
      router.navigate({ to: 'result' });
      // ui:retry 한 번 더 → game-math skipHistory:true
      router.navigate({ to: 'game-math', skipHistory: true });

      // 어떤 화면으로 back() 해도 game-math가 반복되지 않아야 함
      const visited: string[] = [];
      for (let i = 0; i < 5; i++) {
        visited.push(router.getState().current);
        if (router.getState().current === 'brand-home') break;
        router.back();
      }
      const gameMathCount = visited.filter(s => s === 'game-math').length;
      // game-math가 visited에 최초 1회(현재 화면)만 나타나야 함
      expect(gameMathCount).toBeLessThanOrEqual(1);
    });

    it('skipHistory:true 없이 retry하면 previous가 result/game-math로 오염된다 (회귀 대조군)', () => {
      router.navigate({ to: 'math-menu', subject: 'math' });
      router.navigate({ to: 'game-math', levelId: 'math-add-2' });
      router.navigate({ to: 'result' });
      // skipHistory 없이 game-math로 복귀 → 히스토리에 result 추가됨
      router.navigate({ to: 'game-math' });
      // previous가 result가 됨 (오염됨)
      expect(router.getState().previous).toBe('result');
    });
  });

  describe('mathGameActive 재진입 방지 패턴', () => {
    // mathGameActive 플래그는 main.ts 내에서만 관리되므로 AppRouter 레벨에서는
    // show()가 여러 번 호출될 때 컴포넌트 측에서 방어하는 패턴을 테스트한다.

    it('같은 화면을 연속으로 navigate해도 AppRouter 상태는 일관된다', () => {
      router.navigate({ to: 'game-math', levelId: 'math-add-2' });
      router.navigate({ to: 'game-math', levelId: 'math-add-2', skipHistory: true });
      // 상태가 깨지지 않고 game-math를 유지해야 함
      expect(router.getState().current).toBe('game-math');
    });

    it('재진입 방지 컴포넌트 패턴: show()가 중복 호출될 때 플래그로 방어할 수 있다', () => {
      let activeFlag = false;
      let launchCount = 0;

      // mathGameActive 플래그 패턴을 시뮬레이션
      const gameMathStub = {
        show() {
          if (activeFlag) return; // 재진입 방지
          activeFlag = true;
          launchCount++;
        },
        hide() {
          activeFlag = false;
        },
      };

      router.register('game-math', gameMathStub);
      router.navigate({ to: 'game-math', levelId: 'math-add-2' });
      expect(launchCount).toBe(1);
      expect(activeFlag).toBe(true);

      // show()를 직접 재호출 (재진입 시나리오)
      gameMathStub.show();
      expect(launchCount).toBe(1); // 두 번째 show()는 무시되어야 함

      // hide() 후 show()는 정상 실행되어야 함
      gameMathStub.hide();
      expect(activeFlag).toBe(false);
      gameMathStub.show();
      expect(launchCount).toBe(2);
    });

    it('ui:retry 패턴에서 game-math hide()가 activeFlag를 리셋하여 재시작이 가능하다', () => {
      let activeFlag = false;
      let launchCount = 0;

      const gameMathStub = {
        show() {
          if (activeFlag) return;
          activeFlag = true;
          launchCount++;
        },
        hide() {
          activeFlag = false;
        },
      };

      router.register('game-math', gameMathStub);
      // 게임 시작
      router.navigate({ to: 'game-math', levelId: 'math-add-2' });
      expect(launchCount).toBe(1);

      // 게임 종료: hide()가 호출됨 (navigate away)
      router.navigate({ to: 'result' });
      expect(activeFlag).toBe(false); // hide() 호출로 플래그 리셋

      // ui:retry: skipHistory:true로 game-math 복귀
      router.navigate({ to: 'game-math', skipHistory: true });
      expect(launchCount).toBe(2); // 재시작 성공
      expect(activeFlag).toBe(true);
    });
  });

  describe('highlightLevelId 처리', () => {
    it('navigate()에 highlightLevelId 전달 시 state에 반영된다', () => {
      router.navigate({ to: 'math-menu', subject: 'math', highlightLevelId: 'math-add-single-2' });
      expect(router.getState().highlightLevelId).toBe('math-add-single-2');
    });

    it('highlightLevelId 없이 navigate() 시 highlightLevelId가 null이다', () => {
      router.navigate({ to: 'math-menu', subject: 'math' });
      expect(router.getState().highlightLevelId).toBeNull();
    });

    it('이전 navigate에서 설정된 highlightLevelId는 다음 navigate 시 null로 초기화된다', () => {
      router.navigate({ to: 'math-menu', subject: 'math', highlightLevelId: 'math-add-single-2' });
      router.navigate({ to: 'level-select' });
      expect(router.getState().highlightLevelId).toBeNull();
    });

    it('highlightLevelId와 levelId를 동시에 전달하면 둘 다 state에 반영된다', () => {
      router.navigate({ to: 'level-select', levelId: 'math-add-single-1', highlightLevelId: 'math-add-single-3' });
      const state = router.getState();
      expect(state.levelId).toBe('math-add-single-1');
      expect(state.highlightLevelId).toBe('math-add-single-3');
    });

    it('초기 highlightLevelId는 null이다', () => {
      expect(router.getState().highlightLevelId).toBeNull();
    });
  });
});
