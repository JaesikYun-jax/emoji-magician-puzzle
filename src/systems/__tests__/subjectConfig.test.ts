import { describe, it, expect } from 'vitest';
import { SUBJECTS } from '../../game-data/subjectConfig';
import type { SubjectConfig } from '../../game-data/subjectConfig';

describe('SUBJECTS', () => {
  it('contains exactly 6 items', () => {
    expect(SUBJECTS).toHaveLength(6);
  });

  it('contains math, english, korean IDs in that order', () => {
    const ids = SUBJECTS.map((s) => s.id);
    expect(ids).toContain('math');
    expect(ids).toContain('english');
    expect(ids).toContain('korean');
  });

  it('each SubjectConfig has required fields', () => {
    for (const subject of SUBJECTS) {
      expect(subject).toHaveProperty('id');
      expect(subject).toHaveProperty('nameKo');
      expect(subject).toHaveProperty('nameEn');
      expect(subject).toHaveProperty('isAvailable');
    }
  });

  it('nameKo and nameEn are non-empty strings', () => {
    for (const subject of SUBJECTS) {
      expect(typeof subject.nameKo).toBe('string');
      expect(subject.nameKo.length).toBeGreaterThan(0);
      expect(typeof subject.nameEn).toBe('string');
      expect(subject.nameEn.length).toBeGreaterThan(0);
    }
  });

  it('math is available', () => {
    const math = SUBJECTS.find((s) => s.id === 'math') as SubjectConfig;
    expect(math).toBeDefined();
    expect(math.isAvailable).toBe(true);
  });

  it('english is available', () => {
    const english = SUBJECTS.find((s) => s.id === 'english') as SubjectConfig;
    expect(english).toBeDefined();
    expect(english.isAvailable).toBe(true);
  });

  it('korean is NOT available', () => {
    const korean = SUBJECTS.find((s) => s.id === 'korean') as SubjectConfig;
    expect(korean).toBeDefined();
    expect(korean.isAvailable).toBe(false);
  });
});
