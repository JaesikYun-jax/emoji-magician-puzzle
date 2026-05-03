import { describe, it, expect } from 'vitest';
import { REASONING_QUESTIONS, pickRound } from '../../game-data/reasoningQuestions';

describe('REASONING_QUESTIONS pool integrity', () => {
  it('should have at least 30 questions', () => {
    expect(REASONING_QUESTIONS.length).toBeGreaterThanOrEqual(30);
  });

  it('each question should have exactly 4 choices', () => {
    for (const q of REASONING_QUESTIONS) {
      expect(q.choices).toHaveLength(4);
    }
  });

  it('correctIndex should be 0, 1, 2 or 3 for all questions', () => {
    for (const q of REASONING_QUESTIONS) {
      expect([0, 1, 2, 3]).toContain(q.correctIndex);
    }
  });

  it('all IDs should be unique', () => {
    const ids = REASONING_QUESTIONS.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have at least 15 commonality questions', () => {
    const count = REASONING_QUESTIONS.filter(q => q.kind === 'commonality').length;
    expect(count).toBeGreaterThanOrEqual(15);
  });

  it('should have at least 15 oddOneOut questions', () => {
    const count = REASONING_QUESTIONS.filter(q => q.kind === 'oddOneOut').length;
    expect(count).toBeGreaterThanOrEqual(15);
  });

  it('each question should have a non-empty prompt', () => {
    for (const q of REASONING_QUESTIONS) {
      expect(q.prompt.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('pickRound', () => {
  it('should return exactly 5 questions', () => {
    const round = pickRound();
    expect(round).toHaveLength(5);
  });

  it('should return mixed kinds (commonality and oddOneOut)', () => {
    const round = pickRound();
    const hasCommonality = round.some(q => q.kind === 'commonality');
    const hasOddOneOut = round.some(q => q.kind === 'oddOneOut');
    expect(hasCommonality).toBe(true);
    expect(hasOddOneOut).toBe(true);
  });

  it('should not return duplicate IDs in one round', () => {
    const round = pickRound();
    const ids = round.map(q => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(5);
  });
});
