import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SubjectSelect } from '../SubjectSelect';
import { createRouterStub, mountContainer, cleanup } from './_stubs';

describe('SubjectSelect — Sabak card grid', () => {
  let container: HTMLElement;
  let router: ReturnType<typeof createRouterStub>;
  let select: SubjectSelect;

  beforeEach(() => {
    vi.useFakeTimers();
    container = mountContainer();
    router = createRouterStub();
    select = new SubjectSelect(container, router);
    select.show();
  });

  afterEach(() => {
    select.hide();
    cleanup(container);
    vi.useRealTimers();
  });

  it('renders 6 subject cards in canonical order', () => {
    const cards = container.querySelectorAll<HTMLElement>('.ss-card');
    expect(cards).toHaveLength(6);
    const ids = Array.from(cards).map(c => c.dataset['subject']);
    expect(ids).toEqual(['math', 'english', 'korean', 'logic', 'creativity', 'reasoning']);
  });

  it('each card has icon + info + arrow', () => {
    const cards = container.querySelectorAll<HTMLElement>('.ss-card');
    cards.forEach(card => {
      expect(card.querySelector('.ss-card__icon')).toBeTruthy();
      expect(card.querySelector('.ss-card__name')).toBeTruthy();
      expect(card.querySelector('.ss-card__arrow')).toBeTruthy();
    });
  });

  it('Korean card carries a NEW badge', () => {
    const korean = container.querySelector<HTMLElement>('.ss-card[data-subject="korean"]')!;
    expect(korean.querySelector('.ss-card__badge')?.textContent).toBe('NEW');
  });

  it('Creativity card carries a NEW badge', () => {
    const creative = container.querySelector<HTMLElement>('.ss-card[data-subject="creativity"]')!;
    expect(creative.querySelector('.ss-card__badge')?.textContent).toBe('NEW');
  });

  it('clicking math navigates to math-menu', () => {
    container.querySelector<HTMLButtonElement>('.ss-card[data-subject="math"]')!.click();
    expect(router._nav).toHaveBeenCalledWith({ to: 'math-menu', subject: 'math' });
  });

  it('clicking english navigates to english-menu', () => {
    container.querySelector<HTMLButtonElement>('.ss-card[data-subject="english"]')!.click();
    expect(router._nav).toHaveBeenCalledWith({ to: 'english-menu', subject: 'english' });
  });

  it('clicking logic navigates to logic-menu', () => {
    container.querySelector<HTMLButtonElement>('.ss-card[data-subject="logic"]')!.click();
    expect(router._nav).toHaveBeenCalledWith({ to: 'logic-menu', subject: 'logic' });
  });

  it('clicking creativity navigates to creativity-menu', () => {
    container.querySelector<HTMLButtonElement>('.ss-card[data-subject="creativity"]')!.click();
    expect(router._nav).toHaveBeenCalledWith({ to: 'creativity-menu', subject: 'creativity' });
  });

  it('clicking korean shows toast and does NOT navigate', () => {
    container.querySelector<HTMLButtonElement>('.ss-card[data-subject="korean"]')!.click();
    const toast = container.querySelector<HTMLElement>('.ss-toast')!;
    expect(toast.classList.contains('show')).toBe(true);
    expect(toast.textContent).toBeTruthy();
    expect(router._nav).not.toHaveBeenCalled();
  });

  it('toast auto-hides after 2s', () => {
    container.querySelector<HTMLButtonElement>('.ss-card[data-subject="korean"]')!.click();
    const toast = container.querySelector<HTMLElement>('.ss-toast')!;
    expect(toast.classList.contains('show')).toBe(true);
    vi.advanceTimersByTime(2100);
    expect(toast.classList.contains('show')).toBe(false);
  });

  it('back button calls router.back()', () => {
    container.querySelector<HTMLButtonElement>('.ss-back')!.click();
    expect(router._back).toHaveBeenCalled();
  });

  it('hide removes root element', () => {
    select.hide();
    expect(container.querySelector('#subject-select')).toBeNull();
  });
});
