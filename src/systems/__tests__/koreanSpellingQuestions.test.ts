import { describe, it, expect } from 'vitest';
import {
  SPELLING_QUESTIONS,
  getQuestionsByDifficulty,
} from '../../game-data/korean/spellingQuestions';
import type { SpellingDifficulty } from '../../game-data/korean/spellingQuestions';

describe('spellingQuestions — 데이터 정합성', () => {
  it('총 100문제 이상 존재', () => {
    expect(SPELLING_QUESTIONS.length).toBeGreaterThanOrEqual(100);
  });

  it('ID 유일성', () => {
    const ids = SPELLING_QUESTIONS.map(q => q.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('각 난이도별 25문제 이상', () => {
    const difficulties: SpellingDifficulty[] = ['beginner', 'elementary', 'intermediate', 'advanced'];
    for (const diff of difficulties) {
      const qs = getQuestionsByDifficulty(diff);
      expect(qs.length, `${diff} 난이도 문제 수`).toBeGreaterThanOrEqual(25);
    }
  });

  it('correct ≠ wrong (각 문제)', () => {
    for (const q of SPELLING_QUESTIONS) {
      expect(q.correct, `id=${q.id} correct === wrong`).not.toBe(q.wrong);
    }
  });

  it('explanation 비어있지 않음', () => {
    for (const q of SPELLING_QUESTIONS) {
      expect(q.explanation.trim().length, `id=${q.id} explanation 비어있음`).toBeGreaterThan(0);
    }
  });

  it('sentence에 ___ 정확히 1회 포함', () => {
    for (const q of SPELLING_QUESTIONS) {
      const count = (q.sentence.match(/___/g) ?? []).length;
      expect(count, `id=${q.id} sentence="${q.sentence}"`).toBe(1);
    }
  });

  it('id 형식: sp-{xx}-{nnn}', () => {
    const pattern = /^sp-(be|el|in|ad)-\d{3}$/;
    for (const q of SPELLING_QUESTIONS) {
      expect(q.id, `잘못된 id 형식: ${q.id}`).toMatch(pattern);
    }
  });

  it('difficulty 필드가 유효한 값', () => {
    const valid = new Set(['beginner', 'elementary', 'intermediate', 'advanced']);
    for (const q of SPELLING_QUESTIONS) {
      expect(valid.has(q.difficulty), `id=${q.id} 잘못된 difficulty`).toBe(true);
    }
  });

  it('category 필드가 유효한 값', () => {
    const valid = new Set(['phoneme', 'common-word', 'spacing', 'grammar', 'sai-siot']);
    for (const q of SPELLING_QUESTIONS) {
      expect(valid.has(q.category), `id=${q.id} 잘못된 category`).toBe(true);
    }
  });
});
