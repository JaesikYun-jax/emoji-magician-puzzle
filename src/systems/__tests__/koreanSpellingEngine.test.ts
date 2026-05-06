import { describe, it, expect } from 'vitest';
import {
  buildSpellingSession,
} from '../korean/spellingEngine';
import {
  SPELLING_QUESTIONS,
  getQuestionsByDifficulty,
} from '../../game-data/korean/spellingQuestions';

describe('spellingEngine — buildSpellingSession', () => {
  it('count 개수만큼 반환', () => {
    const session = buildSpellingSession(SPELLING_QUESTIONS, 10);
    expect(session.questions.length).toBe(10);
    expect(session.totalCount).toBe(10);
  });

  it('풀이 충분할 때 중복 없음', () => {
    const session = buildSpellingSession(SPELLING_QUESTIONS, 20);
    const ids = session.questions.map(q => q.question.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(20);
  });

  it('difficulty 필터 적용', () => {
    const session = buildSpellingSession(SPELLING_QUESTIONS, 10, 'beginner');
    for (const q of session.questions) {
      expect(q.question.difficulty).toBe('beginner');
    }
  });

  it('correctIdx 위치의 choice가 question.correct와 일치', () => {
    const session = buildSpellingSession(SPELLING_QUESTIONS, 25);
    for (const q of session.questions) {
      expect(q.choices[q.correctIdx]).toBe(q.question.correct);
    }
  });

  it('wrong 위치의 choice가 question.wrong과 일치', () => {
    const session = buildSpellingSession(SPELLING_QUESTIONS, 25);
    for (const q of session.questions) {
      const wrongIdx: 0 | 1 = q.correctIdx === 0 ? 1 : 0;
      expect(q.choices[wrongIdx]).toBe(q.question.wrong);
    }
  });

  it('풀 크기 부족 시 가능한 만큼만 반환', () => {
    const tiny = SPELLING_QUESTIONS.slice(0, 5);
    const session = buildSpellingSession(tiny, 10);
    expect(session.questions.length).toBeLessThanOrEqual(5);
  });

  it('count=0 시 빈 세션 반환', () => {
    const session = buildSpellingSession(SPELLING_QUESTIONS, 0);
    expect(session.questions.length).toBe(0);
    expect(session.totalCount).toBe(0);
  });

  it('각 문제의 choices 길이는 2', () => {
    const session = buildSpellingSession(SPELLING_QUESTIONS, 10);
    for (const q of session.questions) {
      expect(q.choices.length).toBe(2);
    }
  });

  it('난이도별 풀 크기 확인', () => {
    for (const diff of ['beginner', 'elementary', 'intermediate', 'advanced'] as const) {
      const pool = getQuestionsByDifficulty(diff);
      expect(pool.length).toBeGreaterThanOrEqual(25);
    }
  });
});
