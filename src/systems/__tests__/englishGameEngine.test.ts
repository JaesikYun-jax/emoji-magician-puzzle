import { describe, it, expect } from 'vitest';
import { buildQuizSession, buildQuestion, pickWrongOptions } from '../english/englishGameEngine';
import { ENGLISH_WORDS } from '../../game-data/englishWords';
import type { WordEntry } from '../../game-data/english/index';

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

// ── buildQuestion ──────────────────────────────────────────────────────────
describe('buildQuestion', () => {
  it('en-to-ko: choices가 한국어 뜻 배열이고 correctIdx가 word.korean을 가리킨다', () => {
    const words = makeWords(10);
    const q = buildQuestion(words[0], 'en-to-ko', words);
    expect(q.questionType).toBe('en-to-ko');
    expect(q.choices[q.correctIdx]).toBe(words[0].korean);
  });

  it('ko-to-en: choices가 영어 단어 배열이고 correctIdx가 word.english를 가리킨다', () => {
    const words = makeWords(10);
    const q = buildQuestion(words[0], 'ko-to-en', words);
    expect(q.questionType).toBe('ko-to-en');
    expect(q.choices[q.correctIdx]).toBe(words[0].english);
  });

  it('correctIdx가 choices 범위 내', () => {
    const words = makeWords(10);
    const q1 = buildQuestion(words[0], 'en-to-ko', words);
    const q2 = buildQuestion(words[0], 'ko-to-en', words);
    expect(q1.correctIdx).toBeGreaterThanOrEqual(0);
    expect(q1.correctIdx).toBeLessThan(q1.choices.length);
    expect(q2.correctIdx).toBeGreaterThanOrEqual(0);
    expect(q2.correctIdx).toBeLessThan(q2.choices.length);
  });
});

// ── buildQuizSession ───────────────────────────────────────────────────────
describe('buildQuizSession', () => {
  it('count개 문제를 반환한다', () => {
    const words = makeWords(15);
    const session = buildQuizSession(words, 10);
    expect(session.questions.length).toBe(10);
    expect(session.totalCount).toBe(10);
  });

  it('count=5 세션도 5문제 반환', () => {
    const words = makeWords(10);
    const session = buildQuizSession(words, 5);
    expect(session.questions.length).toBe(5);
    expect(session.totalCount).toBe(5);
  });

  it('모든 문제에 questionType 필드가 존재한다', () => {
    const words = makeWords(15);
    const session = buildQuizSession(words, 10);
    for (const q of session.questions) {
      expect(q.questionType === 'en-to-ko' || q.questionType === 'ko-to-en').toBe(true);
    }
  });

  it('en-to-ko 문제: choices[correctIdx] === word.korean', () => {
    const words = makeWords(15);
    const session = buildQuizSession(words, 10);
    for (const q of session.questions) {
      if (q.questionType === 'en-to-ko') {
        expect(q.choices[q.correctIdx]).toBe(q.word.korean);
      }
    }
  });

  it('ko-to-en 문제: choices[correctIdx] === word.english', () => {
    const words = makeWords(15);
    const session = buildQuizSession(words, 10);
    for (const q of session.questions) {
      if (q.questionType === 'ko-to-en') {
        expect(q.choices[q.correctIdx]).toBe(q.word.english);
      }
    }
  });

  it('correctIdx가 choices 배열 범위 내', () => {
    const words = makeWords(15);
    const session = buildQuizSession(words, 10);
    for (const q of session.questions) {
      expect(q.correctIdx).toBeGreaterThanOrEqual(0);
      expect(q.correctIdx).toBeLessThan(q.choices.length);
    }
  });

  it('페어: 10문제에서 같은 word.id가 en-to-ko와 ko-to-en 양방향으로 존재한다', () => {
    const words = makeWords(15);
    const session = buildQuizSession(words, 10);
    const wordIds = session.questions.map(q => q.word.id);
    const duplicateId = wordIds.find(id => wordIds.indexOf(id) !== wordIds.lastIndexOf(id));
    expect(duplicateId).toBeDefined();
    if (duplicateId) {
      const pair = session.questions.filter(q => q.word.id === duplicateId);
      const types = pair.map(q => q.questionType);
      expect(types).toContain('en-to-ko');
      expect(types).toContain('ko-to-en');
    }
  });

  it('words가 4개 미만이어도 에러 없이 동작한다', () => {
    const words = makeWords(3);
    expect(() => buildQuizSession(words, 2)).not.toThrow();
    const session = buildQuizSession(words, 2);
    expect(session.questions.length).toBeGreaterThanOrEqual(1);
  });

  it('count가 words.length보다 크면 words 기반으로 생성하고 에러 없음', () => {
    const words = makeWords(5);
    expect(() => buildQuizSession(words, 20)).not.toThrow();
    const session = buildQuizSession(words, 20);
    // 페어 포함이면 words.length + 1까지 허용
    expect(session.questions.length).toBeLessThanOrEqual(words.length + 1);
    expect(session.questions.length).toBeGreaterThan(0);
  });
});

// ── pickWrongOptions ───────────────────────────────────────────────────────
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

// ── 실제 ENGLISH_WORDS 통합 테스트 ────────────────────────────────────────
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

  it('양방향 문제가 모두 포함된다 (en-to-ko와 ko-to-en)', () => {
    // 여러 번 실행하여 양방향이 나오는지 확인
    let hasEnToKo = false;
    let hasKoToEn = false;
    for (let i = 0; i < 5; i++) {
      const session = buildQuizSession(ENGLISH_WORDS, 10);
      for (const q of session.questions) {
        if (q.questionType === 'en-to-ko') hasEnToKo = true;
        if (q.questionType === 'ko-to-en') hasKoToEn = true;
      }
    }
    expect(hasEnToKo).toBe(true);
    expect(hasKoToEn).toBe(true);
  });
});
