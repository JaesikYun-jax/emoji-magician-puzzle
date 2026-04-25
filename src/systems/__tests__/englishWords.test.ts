import { describe, it, expect } from 'vitest';
import { ENGLISH_WORDS, getWordsByCategory, getWordsByDifficulty } from '../../game-data/englishWords';
import { ENGLISH_CATEGORIES, ENGLISH_DIFFICULTIES } from '../../game-data/english/categories';

describe('ENGLISH_WORDS 데이터 게이트', () => {
  // ── 총 개수 ──────────────────────────────────────────────────────────
  it('총 단어 수가 200개 이상', () => {
    expect(ENGLISH_WORDS.length).toBeGreaterThanOrEqual(200);
  });

  // ── 난이도별 최소 개수 ────────────────────────────────────────────────
  it('beginner ≥ 40', () => {
    expect(getWordsByDifficulty('beginner').length).toBeGreaterThanOrEqual(40);
  });

  it('elementary ≥ 70', () => {
    expect(getWordsByDifficulty('elementary').length).toBeGreaterThanOrEqual(70);
  });

  it('intermediate ≥ 50', () => {
    expect(getWordsByDifficulty('intermediate').length).toBeGreaterThanOrEqual(50);
  });

  it('advanced ≥ 20', () => {
    expect(getWordsByDifficulty('advanced').length).toBeGreaterThanOrEqual(20);
  });

  // ── 필드 존재·비어있지 않음 ───────────────────────────────────────────
  it('모든 항목에 필수 필드 존재', () => {
    for (const w of ENGLISH_WORDS) {
      expect(w).toHaveProperty('id');
      expect(w).toHaveProperty('english');
      expect(w).toHaveProperty('korean');
      expect(w).toHaveProperty('emoji');
      expect(w).toHaveProperty('category');
      expect(w).toHaveProperty('difficulty');
    }
  });

  it('모든 항목에 emoji 필드가 비어있지 않음', () => {
    for (const w of ENGLISH_WORDS) {
      expect(typeof w.emoji).toBe('string');
      expect(w.emoji.length).toBeGreaterThan(0);
    }
  });

  it('english 필드가 빈 문자열이 아님', () => {
    for (const w of ENGLISH_WORDS) {
      expect(w.english.length).toBeGreaterThan(0);
    }
  });

  it('korean 필드가 빈 문자열이 아님', () => {
    for (const w of ENGLISH_WORDS) {
      expect(w.korean.length).toBeGreaterThan(0);
    }
  });

  // ── 유일성 ────────────────────────────────────────────────────────────
  it('id 전역 유일', () => {
    const ids = ENGLISH_WORDS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('english 전역 유일 (중복 단어 없음)', () => {
    const englishWords = ENGLISH_WORDS.map((w) => w.english.toLowerCase());
    const dupes = englishWords.filter((w, i) => englishWords.indexOf(w) !== i);
    expect(dupes).toEqual([]);
  });

  // ── enum 검증 ──────────────────────────────────────────────────────────
  it('category 가 ENGLISH_CATEGORIES 에 포함', () => {
    const validCats = new Set<string>(ENGLISH_CATEGORIES);
    for (const w of ENGLISH_WORDS) {
      expect(validCats.has(w.category), `invalid category "${w.category}" in id="${w.id}"`).toBe(true);
    }
  });

  it('difficulty 가 ENGLISH_DIFFICULTIES 에 포함', () => {
    const validDiffs = new Set<string>(ENGLISH_DIFFICULTIES);
    for (const w of ENGLISH_WORDS) {
      expect(validDiffs.has(w.difficulty), `invalid difficulty "${w.difficulty}" in id="${w.id}"`).toBe(true);
    }
  });

  // ── advanced 과거형 금칙어 스모크 테스트 ─────────────────────────────
  it('advanced 단어에 과거형 금칙어(ran/ate/went/was/had) 없음', () => {
    const BANNED = new Set(['ran', 'ate', 'went', 'was', 'had', 'got', 'saw', 'came', 'took', 'made']);
    const advancedWords = getWordsByDifficulty('advanced');
    const violations = advancedWords.filter(w => BANNED.has(w.english.toLowerCase()));
    expect(violations.map(w => w.english)).toEqual([]);
  });

  // ── getWordsByCategory 헬퍼 ────────────────────────────────────────────
  it('getWordsByCategory("colors") 가 모두 category===colors', () => {
    const words = getWordsByCategory('colors');
    expect(words.length).toBeGreaterThan(0);
    expect(words.every(w => w.category === 'colors')).toBe(true);
  });

  it('getWordsByCategory("food") 가 daily-apple, daily-cake 포함', () => {
    const words = getWordsByCategory('food');
    const ids = words.map(w => w.id);
    expect(ids).toContain('daily-apple');
    expect(ids).toContain('daily-cake');
  });
});

// ── questionGenerator 통합 테스트 ─────────────────────────────────────────────
import { getWordPool, generateQuestion } from '../english/questionGenerator';
import type { EnglishDifficultyKey } from '../english/questionGenerator';

describe('getWordPool — 난이도별 비어있지 않음', () => {
  const difficulties: EnglishDifficultyKey[] = ['beginner', 'elementary', 'intermediate', 'advanced'];

  for (const diff of difficulties) {
    it(`getWordPool("${diff}") 가 빈 배열을 반환하지 않는다`, () => {
      const pool = getWordPool(diff);
      expect(pool.length).toBeGreaterThan(0);
    });
  }
});

describe('generateQuestion — 완전한 객체 반환', () => {
  const difficulties: EnglishDifficultyKey[] = ['beginner', 'elementary', 'intermediate', 'advanced'];

  for (const diff of difficulties) {
    it(`generateQuestion("${diff}") 가 { word, choices, correctIdx } 형태를 반환한다`, () => {
      const q = generateQuestion(diff);
      expect(q).toHaveProperty('word');
      expect(q).toHaveProperty('choices');
      expect(q).toHaveProperty('correctIdx');
    });

    it(`generateQuestion("${diff}") — choices 가 정확히 4개`, () => {
      const q = generateQuestion(diff);
      expect(q.choices).toHaveLength(4);
    });

    it(`generateQuestion("${diff}") — 정답(word.korean)이 choices에 포함된다`, () => {
      const q = generateQuestion(diff);
      expect(q.choices).toContain(q.word.korean);
    });

    it(`generateQuestion("${diff}") — correctIdx 가 choices 안에서 올바른 인덱스를 가리킨다`, () => {
      const q = generateQuestion(diff);
      expect(q.choices[q.correctIdx]).toBe(q.word.korean);
    });

    it(`generateQuestion("${diff}") — word.korean(meaning)이 undefined/null/빈 문자열이 아니다`, () => {
      const q = generateQuestion(diff);
      expect(q.word.korean).toBeTruthy();
      expect(q.word.korean.length).toBeGreaterThan(0);
    });
  }

  it('generateQuestion — choices 에 중복 항목이 없다', () => {
    for (let i = 0; i < 10; i++) {
      const q = generateQuestion('beginner');
      expect(new Set(q.choices).size).toBe(q.choices.length);
    }
  });
});
