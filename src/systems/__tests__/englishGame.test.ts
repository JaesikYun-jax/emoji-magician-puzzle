/**
 * EnglishGame DOM 렌더링 테스트
 *
 * 버그 배경: main.ts 의 game-english 라우트가 show() 빈 콜백으로 방치되어
 * 영어 게임 화면으로 이동해도 아무것도 표시되지 않았음.
 * 이 테스트는 EnglishGame 자체의 show/hide 동작이 올바른지 검증한다.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// EnglishGame 내부에서 appRouter.back() / appRouter.navigate()를 직접 호출하므로
// 모듈 전체를 vi.mock으로 대체한다.
vi.mock('../../router/AppRouter', () => ({
  appRouter: {
    navigate: vi.fn(),
    back: vi.fn(),
    register: vi.fn(),
    getState: vi.fn(() => ({ current: 'game-english', previous: null, subject: 'english', levelId: 'beginner', highlightLevelId: null })),
  },
}));

import { EnglishGame } from '../../components/games/EnglishGame';

// ── 헬퍼 ──────────────────────────────────────────────────────────────────────
function mountContainer(): HTMLElement {
  const el = document.createElement('div');
  el.id = 'english-test-container';
  document.body.appendChild(el);
  return el;
}

function cleanup(container: HTMLElement): void {
  container.remove();
  document.getElementById('english-game-styles')?.remove();
}

// ── 테스트 ─────────────────────────────────────────────────────────────────────
describe('EnglishGame — DOM 렌더링', () => {
  let container: HTMLElement;
  let game: EnglishGame;

  beforeEach(() => {
    container = mountContainer();
    game = new EnglishGame(container);
  });

  afterEach(() => {
    cleanup(container);
    vi.clearAllMocks();
  });

  it('생성자 호출 후 container 안에 DOM 요소가 추가된다', () => {
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('생성자 호출 후 .english-game 요소가 container 안에 존재한다', () => {
    const el = container.querySelector('.english-game');
    expect(el).not.toBeNull();
  });

  it('show("beginner") 호출 시 .english-game 요소가 display:flex 로 표시된다', () => {
    game.show('beginner');
    const el = container.querySelector('.english-game') as HTMLElement;
    expect(el.style.display).toBe('flex');
  });

  it('show("beginner") 호출 후 container 내부에 실제 자식 요소가 1개 이상 존재한다', () => {
    game.show('beginner');
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('show() 후 hide() 호출 시 .english-game 요소가 display:none 으로 숨겨진다', () => {
    game.show('beginner');
    game.hide();
    const el = container.querySelector('.english-game') as HTMLElement;
    expect(el.style.display).toBe('none');
  });

  it('difficulty 없이 show() 호출해도 크래시 없이 beginner로 폴백된다', () => {
    expect(() => game.show()).not.toThrow();
    const el = container.querySelector('.english-game') as HTMLElement;
    // 폴백 후 화면이 표시되어야 한다
    expect(el.style.display).toBe('flex');
  });

  it('show("intermediate") 호출 시에도 크래시 없이 화면이 표시된다', () => {
    expect(() => game.show('intermediate')).not.toThrow();
    const el = container.querySelector('.english-game') as HTMLElement;
    expect(el.style.display).toBe('flex');
  });

  it('show("advanced") 호출 시에도 크래시 없이 화면이 표시된다', () => {
    expect(() => game.show('advanced')).not.toThrow();
    const el = container.querySelector('.english-game') as HTMLElement;
    expect(el.style.display).toBe('flex');
  });

  it('show() 후 HUD(.eng-hud) 요소가 렌더링된다', () => {
    game.show('beginner');
    const hud = container.querySelector('.eng-hud');
    expect(hud).not.toBeNull();
  });

  it('show() 후 문제 카드(.eng-card) 요소가 렌더링된다', () => {
    game.show('beginner');
    const card = container.querySelector('.eng-card');
    expect(card).not.toBeNull();
  });

  it('show() 후 선택지 버튼(.eng-choice-btn)이 4개 렌더링된다', () => {
    game.show('beginner');
    const buttons = container.querySelectorAll('.eng-choice-btn');
    expect(buttons.length).toBe(4);
  });
});
