import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Guard that the Sabak design tokens handoff.md promised actually live in style.css.
 * Catches future edits that accidentally drop one.
 */
const css = readFileSync(resolve(__dirname, '../../style.css'), 'utf8');

describe('Sabak design tokens in style.css', () => {
  const requiredTokens: Record<string, string> = {
    '--ink': '#1A0B3E',
    '--ivory': '#FAF7F2',
    '--brand-900': '#2E1065',
    '--brand-700': '#4C1D95',
    '--brand-600': '#6D28D9',
    '--math-500': '#0EA5E9',
    '--english-500': '#10B981',
    '--korean-500': '#F43F5E',
    '--logic-500': '#6366F1',
    '--creative-500': '#F97316',
    '--gold': '#FBBF24',
    '--lime': '#D9F99D',
    '--cream': '#FDE68A',
    '--coral': '#FB7185',
  };

  for (const [name, value] of Object.entries(requiredTokens)) {
    it(`${name} is declared as ${value}`, () => {
      const re = new RegExp(`${name.replace(/-/g, '\\-')}\\s*:\\s*${value.replace('#', '#')}`, 'i');
      expect(css).toMatch(re);
    });
  }

  it('declares Fraunces + Pretendard font stacks', () => {
    expect(css).toMatch(/--f-display:\s*'Fraunces'/);
    expect(css).toMatch(/Pretendard Variable/);
  });

  it('applies em non-italic bolded override globally', () => {
    expect(css).toMatch(/em\s*\{[^}]*font-style:\s*normal/);
    expect(css).toMatch(/em\s*\{[^}]*font-weight:\s*900/);
  });

  it('exposes sb-* utility classes', () => {
    expect(css).toMatch(/\.sb-eyebrow\s*\{/);
    expect(css).toMatch(/\.sb-display\s*\{/);
    expect(css).toMatch(/\.sb-chip\s*\{/);
    expect(css).toMatch(/\.sb-btn\s*\{/);
  });
});
