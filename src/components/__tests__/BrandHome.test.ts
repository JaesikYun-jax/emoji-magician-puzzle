import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BrandHome } from '../BrandHome';
import type { SaveService } from '../../services/SaveService';
import { createRouterStub, mountContainer, cleanup } from './_stubs';

function createSaveServiceStub(hasProfile = false): SaveService {
  return { hasProfile: vi.fn(() => hasProfile) } as unknown as SaveService;
}

describe('BrandHome — Sabak HomeA', () => {
  let container: HTMLElement;
  let router: ReturnType<typeof createRouterStub>;
  let saveService: SaveService;
  let home: BrandHome;

  beforeEach(() => {
    container = mountContainer();
    router = createRouterStub();
    saveService = createSaveServiceStub(false); // no profile by default
    home = new BrandHome(container, router, saveService);
    home.show();
  });

  afterEach(() => {
    home.hide();
    cleanup(container);
  });

  it('renders root + 4 sections', () => {
    const root = container.querySelector('#brand-home');
    expect(root).toBeTruthy();
    expect(container.querySelector('.bh-hero')).toBeTruthy();
    expect(container.querySelector('.bh-why')).toBeTruthy();
    expect(container.querySelector('.bh-subjects')).toBeTruthy();
    expect(container.querySelector('.bh-parent')).toBeTruthy();
  });

  it('renders 6 orbiting subject orbs with unique ids', () => {
    const orbs = container.querySelectorAll<HTMLElement>('.bh-orb');
    expect(orbs).toHaveLength(6);
    const ids = Array.from(orbs).map(o => o.dataset['id']);
    expect(new Set(ids)).toEqual(new Set(['math', 'english', 'korean', 'logic', 'creative', 'reasoning']));
  });

  it('renders 6 subject preview cards in horizontal scroller', () => {
    const cards = container.querySelectorAll('.bh-subject-card');
    expect(cards).toHaveLength(6);
    const ids = Array.from(cards).map(c => (c as HTMLElement).dataset['id']);
    expect(ids).toEqual(['math', 'english', 'korean', 'logic', 'creative', 'reasoning']);
  });

  it('mascot starts in frenzy level 1, not smashed', () => {
    const mascot = container.querySelector<HTMLElement>('.bh-mascot')!;
    expect(mascot.dataset['frenzy']).toBe('1');
    expect(mascot.dataset['smashed']).toBe('0');
  });

  it('frenzy escalates with rapid taps: 5→level2, 7→level3, 12→level4', () => {
    const mascot = container.querySelector<HTMLElement>('.bh-mascot')!;

    for (let i = 0; i < 4; i++) mascot.click();
    expect(mascot.dataset['frenzy']).toBe('1');

    mascot.click(); // 5th
    expect(mascot.dataset['frenzy']).toBe('2');

    mascot.click();
    mascot.click(); // 7th
    expect(mascot.dataset['frenzy']).toBe('3');

    for (let i = 0; i < 5; i++) mascot.click(); // 12th
    expect(mascot.dataset['frenzy']).toBe('4');
  });

  it('level-3+ taps inject a combo label', () => {
    const mascot = container.querySelector<HTMLElement>('.bh-mascot')!;
    for (let i = 0; i < 7; i++) mascot.click();
    expect(container.querySelector('.bh-mascot__combo')).toBeTruthy();
  });

  it('level-2+ taps inject a shockwave ring', () => {
    const mascot = container.querySelector<HTMLElement>('.bh-mascot')!;
    for (let i = 0; i < 5; i++) mascot.click();
    expect(container.querySelector('.bh-mascot__shockwave')).toBeTruthy();
  });

  it('every tap spawns particle bursts', () => {
    const mascot = container.querySelector<HTMLElement>('.bh-mascot')!;
    mascot.click();
    const bursts = container.querySelectorAll('.bh-mascot__burst');
    expect(bursts.length).toBeGreaterThanOrEqual(14); // level-1 default
  });

  it('hero CTA navigates to profile-setup when no profile exists', () => {
    const cta = container.querySelector<HTMLButtonElement>('.bh-hero__cta')!;
    cta.click();
    expect(router._nav).toHaveBeenCalledWith({ to: 'profile-setup' });
  });

  it('hero CTA navigates to home-b when profile exists', () => {
    home.hide();
    const svWithProfile = createSaveServiceStub(true);
    const home2 = new BrandHome(container, router, svWithProfile);
    home2.show();
    const cta = container.querySelector<HTMLButtonElement>('.bh-hero__cta')!;
    cta.click();
    expect(router._nav).toHaveBeenCalledWith({ to: 'home-b' });
    home2.hide();
  });

  it('final footer CTA also navigates to profile-setup when no profile', () => {
    const footerCta = container.querySelector<HTMLButtonElement>('.bh-final__cta')!;
    footerCta.click();
    expect(router._nav).toHaveBeenCalledWith({ to: 'profile-setup' });
  });

  it('orb click stops propagation (does not trigger mascot tap)', () => {
    const mascot = container.querySelector<HTMLElement>('.bh-mascot')!;
    const orb = container.querySelector<HTMLButtonElement>('.bh-orb[data-id="math"]')!;
    orb.click();
    expect(mascot.dataset['frenzy']).toBe('1');
  });

  it('renders 3 stat cards in Why section', () => {
    const why = container.querySelector('.bh-why')!;
    expect(why.querySelectorAll('.bh-stat-card')).toHaveLength(3);
  });

  it('renders 4 parent-trust rows', () => {
    const parent = container.querySelector('.bh-parent')!;
    expect(parent.querySelectorAll('.bh-parent-row')).toHaveLength(4);
  });

  it('hide() removes root and allows re-show', () => {
    home.hide();
    expect(container.querySelector('#brand-home')).toBeNull();
    home.show();
    expect(container.querySelector('#brand-home')).toBeTruthy();
  });

  it('styles are injected only once across multiple show/hide cycles', () => {
    home.hide();
    home.show();
    home.hide();
    home.show();
    const styleTags = document.querySelectorAll('#brand-home-style');
    expect(styleTags).toHaveLength(1);
  });
});
