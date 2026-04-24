import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResultScreen } from '../ResultScreen';
import { createBusStub, mountContainer, cleanup } from './_stubs';

describe('ResultScreen — Sabak celebration layout', () => {
  let container: HTMLElement;
  let bus: ReturnType<typeof createBusStub>;
  let screen: ResultScreen;

  beforeEach(() => {
    container = mountContainer();
    bus = createBusStub();
    screen = new ResultScreen(container, bus);
  });

  afterEach(() => {
    screen.hide();
    cleanup(container);
  });

  it('renders 3 stars — N filled and (3-N) empty', () => {
    screen.show({ cleared: true, score: 1240, stars: 2, levelId: 3, maxLevelId: 10 });
    const all = container.querySelectorAll('.rs-star');
    const empty = container.querySelectorAll('.rs-star.rs-star--empty');
    expect(all).toHaveLength(3);
    expect(empty).toHaveLength(1);
  });

  it('renders all 3 empty stars when stars=0', () => {
    screen.show({ cleared: false, score: 0, stars: 0, levelId: 1, maxLevelId: 10, pairsCompleted: 0 });
    expect(container.querySelectorAll('.rs-star.rs-star--empty')).toHaveLength(3);
  });

  it('renders 0 empty stars when stars=3', () => {
    screen.show({ cleared: true, score: 9999, stars: 3, levelId: 1, maxLevelId: 10 });
    expect(container.querySelectorAll('.rs-star.rs-star--empty')).toHaveLength(0);
  });

  it('formats score with locale commas', () => {
    screen.show({ cleared: true, score: 1240, stars: 3, levelId: 2, maxLevelId: 10 });
    const scoreEl = container.querySelector('.rs-stat__val')!;
    expect(scoreEl.textContent).toBe('1,240');
  });

  it('shows next-level button when cleared + more levels remain', () => {
    screen.show({ cleared: true, score: 500, stars: 2, levelId: 3, maxLevelId: 10 });
    expect(container.querySelector('.rs-next')).toBeTruthy();
  });

  it('hides next-level button on final level', () => {
    screen.show({ cleared: true, score: 500, stars: 2, levelId: 10, maxLevelId: 10 });
    expect(container.querySelector('.rs-next')).toBeNull();
  });

  it('hides next-level button when not cleared', () => {
    screen.show({ cleared: false, score: 100, stars: 0, levelId: 3, maxLevelId: 10, pairsCompleted: 2 });
    expect(container.querySelector('.rs-next')).toBeNull();
  });

  it('retry button emits ui:retry and hides overlay', () => {
    screen.show({ cleared: true, score: 500, stars: 2, levelId: 3, maxLevelId: 10 });
    container.querySelector<HTMLButtonElement>('.rs-retry')!.click();
    expect(bus._emit).toHaveBeenCalledWith('ui:retry', {});
    expect(container.querySelector('#result-screen')).toBeNull();
  });

  it('next button emits ui:nextLevel with incremented levelId', () => {
    screen.show({ cleared: true, score: 500, stars: 2, levelId: 3, maxLevelId: 10 });
    container.querySelector<HTMLButtonElement>('.rs-next')!.click();
    expect(bus._emit).toHaveBeenCalledWith('ui:nextLevel', { levelId: '4' });
  });

  it('menu button emits ui:mainMenu', () => {
    screen.show({ cleared: true, score: 500, stars: 2, levelId: 3, maxLevelId: 10 });
    container.querySelector<HTMLButtonElement>('.rs-menu')!.click();
    expect(bus._emit).toHaveBeenCalledWith('ui:mainMenu', {});
  });

  it('confetti SVG renders 12 dots', () => {
    screen.show({ cleared: true, score: 500, stars: 2, levelId: 3, maxLevelId: 10 });
    const dots = container.querySelectorAll('.rs-confetti circle');
    expect(dots).toHaveLength(12);
  });
});
