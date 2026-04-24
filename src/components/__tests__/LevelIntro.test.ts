import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LevelIntro } from '../LevelIntro';
import { createBusStub, mountContainer, cleanup } from './_stubs';

describe('LevelIntro — Sabak countdown', () => {
  let container: HTMLElement;
  let bus: ReturnType<typeof createBusStub>;
  let intro: LevelIntro;

  beforeEach(() => {
    vi.useFakeTimers();
    container = mountContainer();
    bus = createBusStub();
    intro = new LevelIntro(container, bus);
  });

  afterEach(() => {
    intro.hide();
    cleanup(container);
    vi.useRealTimers();
  });

  it('renders countdown ring + starts at 3', () => {
    intro.show(1);
    expect(container.querySelector('.li-count-wrap')).toBeTruthy();
    expect(container.querySelector('#intro-count')!.textContent).toBe('3');
  });

  it('renders 4 concentric rings', () => {
    intro.show(1);
    expect(container.querySelectorAll('.li-ring')).toHaveLength(4);
  });

  it('countdown ticks 3→2→1→go and emits game:start', () => {
    intro.show(5);
    const countEl = () => container.querySelector('#intro-count')!;

    expect(countEl().textContent).toBe('3');
    vi.advanceTimersByTime(300 + 1000);   // first tick fires
    expect(countEl().textContent).toBe('2');
    vi.advanceTimersByTime(1000);
    expect(countEl().textContent).toBe('1');
    vi.advanceTimersByTime(1000);
    // final tick prints "go" text
    expect(countEl().classList.contains('li-count--go')).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(bus._emit).toHaveBeenCalledWith('game:start', { levelId: '5' });
    // hide fires synchronously inside the final timeout
    expect(container.querySelector('#level-intro')).toBeNull();
  });

  it('hide() removes the overlay DOM', () => {
    intro.show(1);
    intro.hide();
    expect(container.querySelector('#level-intro')).toBeNull();
  });
});
