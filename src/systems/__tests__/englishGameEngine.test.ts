/**
 * englishGameEngine.test.ts
 *
 * 대상 모듈: src/systems/english/englishGameEngine.ts (구현 예정)
 *
 * englishGameEngine.ts 가 존재하지 않으면 이 파일 전체가 import 오류로 실패한다.
 * 구현 후 `npx vitest run src/systems/__tests__/englishGameEngine.test.ts` 로 실행.
 */
import { describe, it, expect } from 'vitest';
import { buildQuizSession, pickWrongOptions } from '../english/englishGameEngine';
import { ENGLISH_WORDS } from '../../game-data/englishWords';
import type { WordEntry } from '../../game-data/english/index';

// ── 헬퍼: 최소 단어 세트 생성 ──────────────────────────────────────────────
function makeWords(n: number): WordEntry[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `test-${i}`,
    english: `word${i}`,
    korean: `뜻${i}`,
    emoji: '❓',
    category: 'colors' as const,
    difficulty: 'beginner' as const,
  }));
}

// ── buildQuizSession ────────────────────────────────────────────────────────
describe('buildQuizSession', () => {
  it('count개 문제를 반환한다', () => {
    const words = makeWords(10);
    const session = buildQuizSession(words, 5);
    expect(session.questions.length).toBe(5);
    expect(session.totalCount).toBe(5);
  });

  it('각 문제의 choices 길이가 min(4, words.length) 이상', () => {
    const words = makeWords(10);
    const session = buildQuizSession(words, 5);
    const minChoices = Math.min(4, words.length);
    for (const q of session.questions) {
      expect(q.choices.length).toBeGreaterThanOrEqual(minChoices);
    }
  });

  it('각 문제의 correctIdx가 choices 배열 범위 내', () => {
    const words = makeWords(10);
    const session = buildQuizSession(words, 5);
    for (const q of session.questions) {
      expect(q.correctIdx).toBeGreaterThanOrEqual(0);
      expect(q.correctIdx).toBeLessThan(q.choices.length);
    }
  });

  it('choices[correctIdx]가 해당 word.korean과 일치', () => {
    const words = makeWords(10);
    const session = buildQuizSession(words, 5);
    for (const q of session.questions) {
      expect(q.choices[q.correctIdx]).toBe(q.word.korean);
    }
  });

  it('words가 4개 미만이어도 에러 없이 동작한다', () => {
    const words = makeWords(3);
    expect(() => buildQuizSession(words, 2)).not.toThrow();
    const session = buildQuizSession(words, 2);
    expect(session.questions.length).toBeGreaterThanOrEqual(1);
  });

  it('count가 words.length보다 크면 words 전체를 사용하고 에러 없음', () => {
    const words = makeWords(5);
    expect(() => buildQuizSession(words, 20)).not.toThrow();
    const session = buildQuizSession(words, 20);
    // words.length(5)를 초과할 수 없다
    expect(session.questions.length).toBeLessThanOrEqual(words.length);
  });
});

// ── pickWrongOptions ────────────────────────────────────────────────────────
describe('pickWrongOptions', () => {
  it('반환 배열에 correct가 포함되지 않는다', () => {
    const correct = makeWords(1)[0];
    const pool = makeWords(10);
    const wrongs = pickWrongOptions(pool, correct, 3);
    expect(wrongs.every(w => w.id !== correct.id)).toBe(true);
    expect(wrongs.every(w => w.korean !== correct.korean)).toBe(true);
  });

  it('반환 개수가 min(n, pool.length - 1) 이하', () => {
    const pool = makeWords(6);
    const correct = pool[0];
    const wrongs = pickWrongOptions(pool, correct, 3);
    const maxExpected = Math.min(3, pool.length - 1);
    expect(wrongs.length).toBeLessThanOrEqual(maxExpected);
  });

  it('pool이 correct 하나만 있어도 에러 없이 빈 배열 반환', () => {
    const correct = makeWords(1)[0];
    expect(() => pickWrongOptions([correct], correct, 3)).not.toThrow();
    const wrongs = pickWrongOptions([correct], correct, 3);
    expect(wrongs).toEqual([]);
  });
});

// ── 실제 ENGLISH_WORDS 통합 테스트 ─────────────────────────────────────────
describe('buildQuizSession — 실제 ENGLISH_WORDS 사용', () => {
  it('ENGLISH_WORDS로 buildQuizSession(words, 10) — 10문제 생성', () => {
    const session = buildQuizSession(ENGLISH_WORDS, 10);
    expect(session.questions.length).toBe(10);
    expect(session.totalCount).toBe(10);
  });

  it('실제 ENGLISH_WORDS로 생성된 모든 choices가 비어있지 않음', () => {
    const session = buildQuizSession(ENGLISH_WORDS, 10);
    for (const q of session.questions) {
      expect(q.choices.length).toBeGreaterThan(0);
      for (const choice of q.choices) {
        expect(typeof choice).toBe('string');
        expect(choice.length).toBeGreaterThan(0);
      }
    }
  });
});
