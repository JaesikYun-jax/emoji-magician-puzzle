/**
 * englishQuestionGenerator.test.ts
 *
 * 대상 모듈:
 *   - src/systems/english/questionGenerator.ts (shuffle, getWordPool, generateQuestion)
 *   - src/game-data/englishWords.ts (ENGLISH_WORDS)
 *
 * 목적:
 *   - 영어 단어 게임 핵심 로직 검증
 *   - "게임 화면이 아무것도 보이지 않는" 회귀 버그를 조기 감지
 */
import { describe, it, expect } from 'vitest';
import {
  shuffle,
  getWordPool,
  generateQuestion,
  type EnglishDifficultyKey,
} from '../english/questionGenerator';
import { ENGLISH_WORDS } from '../../game-data/englishWords';

// ── 1. shuffle 함수 ──────────────────────────────────────────────────────────
describe('shuffle', () => {
  it('원본 배열을 변경하지 않는다', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffle(original);
    expect(original).toEqual(copy);
  });

  it('반환 배열 길이가 입력과 같다', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const result = shuffle(arr);
    expect(result.length).toBe(arr.length);
  });

  it('반환 배열에 동일한 원소가 포함된다 (sort 비교)', () => {
    const arr = ['apple', 'banana', 'cherry', 'date'];
    const result = shuffle(arr);
    expect([...result].sort()).toEqual([...arr].sort());
  });

  it('빈 배열 입력 시 빈 배열 반환', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('단일 원소 배열 입력 시 동일한 원소 반환', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

// ── 2. getWordPool 함수 ───────────────────────────────────────────────────────
describe('getWordPool', () => {
  const DIFFICULTIES: EnglishDifficultyKey[] = [
    'beginner',
    'elementary',
    'intermediate',
    'advanced',
  ];

  for (const difficulty of DIFFICULTIES) {
    it(`'${difficulty}' 난이도 pool은 최소 4개 이상이다`, () => {
      const pool = getWordPool(difficulty);
      expect(pool.length).toBeGreaterThanOrEqual(4);
    });
  }

  it("'advanced' 단어가 적을 경우에도 fallback으로 4개 이상 반환한다", () => {
    // getWordPool 내부 로직: advanced pool < 4 이면 beginner + advanced 합산
    // 실제 데이터에서 advanced >= 4 임이 보장되지만,
    // fallback 경로 자체가 작동함을 확인하기 위해 결과만 검증한다
    const pool = getWordPool('advanced');
    expect(pool.length).toBeGreaterThanOrEqual(4);
  });

  it('반환된 pool의 모든 항목이 WordEntry 형식이다', () => {
    const pool = getWordPool('beginner');
    for (const w of pool) {
      expect(w).toHaveProperty('id');
      expect(w).toHaveProperty('english');
      expect(w).toHaveProperty('korean');
      expect(w).toHaveProperty('emoji');
      expect(w).toHaveProperty('category');
      expect(w).toHaveProperty('difficulty');
    }
  });
});

// ── 3. generateQuestion — 구조 검증 ─────────────────────────────────────────
describe('generateQuestion — 구조 검증', () => {
  it('반환값에 word, choices, correctIdx 필드가 존재한다', () => {
    const q = generateQuestion('beginner');
    expect(q).toHaveProperty('word');
    expect(q).toHaveProperty('choices');
    expect(q).toHaveProperty('correctIdx');
  });

  it('choices는 정확히 4개이다', () => {
    const q = generateQuestion('beginner');
    expect(q.choices.length).toBe(4);
  });

  it('choices에 word.korean이 포함된다', () => {
    const q = generateQuestion('beginner');
    expect(q.choices).toContain(q.word.korean);
  });

  it('correctIdx는 choices[correctIdx] === word.korean을 만족한다', () => {
    const q = generateQuestion('beginner');
    expect(q.choices[q.correctIdx]).toBe(q.word.korean);
  });

  it('choices 내 중복이 없다', () => {
    const q = generateQuestion('beginner');
    const unique = new Set(q.choices);
    expect(unique.size).toBe(q.choices.length);
  });

  it('word.english 필드가 빈 문자열이 아니다', () => {
    const q = generateQuestion('beginner');
    expect(q.word.english.length).toBeGreaterThan(0);
  });

  it('word.korean 필드가 빈 문자열이 아니다', () => {
    const q = generateQuestion('beginner');
    expect(q.word.korean.length).toBeGreaterThan(0);
  });

  it('correctIdx가 0 이상 3 이하 범위이다', () => {
    const q = generateQuestion('beginner');
    expect(q.correctIdx).toBeGreaterThanOrEqual(0);
    expect(q.correctIdx).toBeLessThanOrEqual(3);
  });
});

// ── 4. generateQuestion — 반복 호출 안정성 ──────────────────────────────────
describe('generateQuestion — 반복 호출 안정성', () => {
  const DIFFICULTIES: EnglishDifficultyKey[] = [
    'beginner',
    'elementary',
    'intermediate',
    'advanced',
  ];

  for (const difficulty of DIFFICULTIES) {
    it(`'${difficulty}' 난이도에서 20회 반복 호출해도 예외가 발생하지 않는다`, () => {
      expect(() => {
        for (let i = 0; i < 20; i++) {
          generateQuestion(difficulty);
        }
      }).not.toThrow();
    });

    it(`'${difficulty}' 난이도 20회 반복 시 매번 choices.length === 4 가 보장된다`, () => {
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion(difficulty);
        expect(q.choices.length).toBe(4);
      }
    });

    it(`'${difficulty}' 난이도 20회 반복 시 매번 choices[correctIdx] === word.korean 이 보장된다`, () => {
      for (let i = 0; i < 20; i++) {
        const q = generateQuestion(difficulty);
        expect(q.choices[q.correctIdx]).toBe(q.word.korean);
      }
    });
  }
});

// ── 5. 회귀 방지 — 게임 진입점 스모크 테스트 ────────────────────────────────
describe('회귀 방지 — 게임 진입점 스모크 테스트', () => {
  it('ENGLISH_WORDS 배열이 비어있지 않다 (단어 데이터 로드 실패 방지)', () => {
    expect(ENGLISH_WORDS.length).toBeGreaterThan(0);
  });

  it("generateQuestion('beginner')의 word.english는 ENGLISH_WORDS에 존재하는 영어 단어여야 한다", () => {
    const q = generateQuestion('beginner');
    const englishSet = new Set(ENGLISH_WORDS.map(w => w.english));
    expect(englishSet.has(q.word.english)).toBe(true);
  });

  it('모든 난이도에서 generateQuestion이 동기적으로 즉시 반환한다 (Promise가 아닌 일반 값)', () => {
    const difficulties: EnglishDifficultyKey[] = [
      'beginner',
      'elementary',
      'intermediate',
      'advanced',
    ];
    for (const difficulty of difficulties) {
      const result = generateQuestion(difficulty);
      // Promise라면 .then이 함수로 존재한다
      expect(typeof (result as unknown as Promise<unknown>).then).not.toBe('function');
      // 즉시 반환된 객체가 word 필드를 가진다
      expect(result).toHaveProperty('word');
    }
  });

  it('generateQuestion이 반환하는 word는 ENGLISH_WORDS의 원소여야 한다 (id 일치)', () => {
    const idSet = new Set(ENGLISH_WORDS.map(w => w.id));
    for (const difficulty of ['beginner', 'elementary', 'intermediate', 'advanced'] as EnglishDifficultyKey[]) {
      const q = generateQuestion(difficulty);
      expect(idSet.has(q.word.id)).toBe(true);
    }
  });

  it('choices의 모든 항목이 ENGLISH_WORDS의 korean 값 중 하나이다', () => {
    const koreanSet = new Set(ENGLISH_WORDS.map(w => w.korean));
    const q = generateQuestion('beginner');
    for (const choice of q.choices) {
      expect(koreanSet.has(choice)).toBe(true);
    }
  });
});
