import { describe, it, expect } from 'vitest';
import {
  getAnswerWords,
  buildCardPool,
  validateAnswer,
  computeStars,
  shuffleArray,
} from '../english/sentenceOrderingEngine';
import {
  SENTENCE_ORDERING_QUESTIONS,
  type SentenceOrderingQuestion,
} from '../../game-data/sentenceOrderingLevels';

// ── 테스트용 픽스처 ──────────────────────────────────────────────────────────

/** 고정 슬롯 없는 문제: Birds fly. */
const Q_NO_FIXED: SentenceOrderingQuestion = {
  id: 'test-no-fixed',
  slots: [
    { word: 'Birds', fixed: false },
    { word: 'fly', fixed: false },
  ],
  distractors: ['Cats', 'swim'],
  form: 'SV',
};

/** 고정 슬롯 있는 문제: The sky is blue. (The 고정) */
const Q_WITH_FIXED: SentenceOrderingQuestion = {
  id: 'test-with-fixed',
  slots: [
    { word: 'The', fixed: true },
    { word: 'sky', fixed: false },
    { word: 'is', fixed: false },
    { word: 'blue', fixed: false },
  ],
  distractors: ['red', 'moon', 'are'],
  form: 'SVC',
};

/** 모든 슬롯이 고정인 문제 (엣지케이스) */
const Q_ALL_FIXED: SentenceOrderingQuestion = {
  id: 'test-all-fixed',
  slots: [
    { word: 'Hello', fixed: true },
    { word: 'world', fixed: true },
  ],
  distractors: ['foo', 'bar'],
  form: 'SV',
};

// ── getAnswerWords ───────────────────────────────────────────────────────────

describe('getAnswerWords', () => {
  it('고정 슬롯 없을 때 모든 단어 반환', () => {
    const result = getAnswerWords(Q_NO_FIXED);
    expect(result).toEqual(['Birds', 'fly']);
  });

  it('고정 슬롯(fixed: true) 제외하고 정답 단어만 반환', () => {
    const result = getAnswerWords(Q_WITH_FIXED);
    expect(result).toEqual(['sky', 'is', 'blue']);
    expect(result).not.toContain('The');
  });

  it('모든 슬롯이 고정이면 빈 배열 반환', () => {
    const result = getAnswerWords(Q_ALL_FIXED);
    expect(result).toEqual([]);
  });

  it('반환 순서가 slots 순서와 동일 (fixed 제외 후)', () => {
    const q: SentenceOrderingQuestion = {
      id: 'test-order',
      slots: [
        { word: 'I', fixed: false },
        { word: 'see', fixed: false },
        { word: 'a', fixed: true },
        { word: 'star', fixed: false },
      ],
      distractors: [],
      form: 'SVO',
    };
    expect(getAnswerWords(q)).toEqual(['I', 'see', 'star']);
  });
});

// ── buildCardPool ────────────────────────────────────────────────────────────

describe('buildCardPool', () => {
  it('정답 단어 + distractors 모두 포함', () => {
    const pool = buildCardPool(Q_NO_FIXED, 42);
    expect(pool).toContain('Birds');
    expect(pool).toContain('fly');
    expect(pool).toContain('Cats');
    expect(pool).toContain('swim');
    expect(pool.length).toBe(4);
  });

  it('고정 슬롯 단어는 카드풀에 포함되지 않음', () => {
    const pool = buildCardPool(Q_WITH_FIXED, 42);
    // 'The' 는 fixed:true → 카드풀에서 제외
    expect(pool).not.toContain('The');
    // 나머지 빈 슬롯 단어 포함
    expect(pool).toContain('sky');
    expect(pool).toContain('is');
    expect(pool).toContain('blue');
    // distractors 포함
    expect(pool).toContain('red');
    expect(pool).toContain('moon');
    expect(pool).toContain('are');
    expect(pool.length).toBe(6);
  });

  it('seed 동일 시 항상 같은 결과 (결정론적 셔플)', () => {
    const pool1 = buildCardPool(Q_NO_FIXED, 100);
    const pool2 = buildCardPool(Q_NO_FIXED, 100);
    expect(pool1).toEqual(pool2);
  });

  it('seed가 다르면 다른 순서가 나올 수 있음', () => {
    // 배열이 충분히 길면 다른 seed에서 다른 결과가 나와야 함
    const q: SentenceOrderingQuestion = {
      id: 'test-shuffle',
      slots: [
        { word: 'A', fixed: false },
        { word: 'B', fixed: false },
        { word: 'C', fixed: false },
        { word: 'D', fixed: false },
      ],
      distractors: ['E', 'F', 'G', 'H'],
      form: 'SVO',
    };
    const results = new Set<string>();
    for (let seed = 0; seed < 20; seed++) {
      results.add(buildCardPool(q, seed).join(','));
    }
    // 20가지 seed 중 최소 2가지 이상의 다른 순서가 나와야 함
    expect(results.size).toBeGreaterThan(1);
  });

  it('원본 distractors 배열 변경 없음 (순수 함수)', () => {
    const original = [...Q_NO_FIXED.distractors];
    buildCardPool(Q_NO_FIXED, 42);
    expect(Q_NO_FIXED.distractors).toEqual(original);
  });
});

// ── validateAnswer ───────────────────────────────────────────────────────────

describe('validateAnswer', () => {
  it('정확히 올바른 순서로 선택 시 true', () => {
    expect(validateAnswer(['Birds', 'fly'], Q_NO_FIXED)).toBe(true);
  });

  it('순서가 틀릴 때 false', () => {
    expect(validateAnswer(['fly', 'Birds'], Q_NO_FIXED)).toBe(false);
  });

  it('길이가 짧으면 false', () => {
    expect(validateAnswer(['Birds'], Q_NO_FIXED)).toBe(false);
  });

  it('길이가 길면 false', () => {
    expect(validateAnswer(['Birds', 'fly', 'fast'], Q_NO_FIXED)).toBe(false);
  });

  it('빈 배열 선택 시 false', () => {
    expect(validateAnswer([], Q_NO_FIXED)).toBe(false);
  });

  it('고정 슬롯 있는 문제에서 빈 슬롯 단어만 올바르게 선택 시 true', () => {
    // Q_WITH_FIXED: The(fixed) sky is blue → 빈 슬롯: sky, is, blue
    expect(validateAnswer(['sky', 'is', 'blue'], Q_WITH_FIXED)).toBe(true);
  });

  it('고정 슬롯 있는 문제에서 fixed 단어까지 포함하면 false (길이 초과)', () => {
    expect(validateAnswer(['The', 'sky', 'is', 'blue'], Q_WITH_FIXED)).toBe(false);
  });

  it('고정 슬롯 있는 문제에서 순서 틀리면 false', () => {
    expect(validateAnswer(['blue', 'sky', 'is'], Q_WITH_FIXED)).toBe(false);
  });

  it('모든 슬롯이 고정인 문제에서 빈 배열 선택 시 true', () => {
    expect(validateAnswer([], Q_ALL_FIXED)).toBe(true);
  });

  it('정답 단어 하나가 틀릴 때 false', () => {
    expect(validateAnswer(['Birds', 'swim'], Q_NO_FIXED)).toBe(false);
  });
});

// ── computeStars ─────────────────────────────────────────────────────────────

describe('computeStars', () => {
  it('0회 실수 → 3별', () => {
    expect(computeStars(0)).toBe(3);
  });

  it('1회 실수 → 3별', () => {
    expect(computeStars(1)).toBe(3);
  });

  it('2회 실수 → 2별', () => {
    expect(computeStars(2)).toBe(2);
  });

  it('3회 실수 → 2별', () => {
    expect(computeStars(3)).toBe(2);
  });

  it('4회 실수 → 1별', () => {
    expect(computeStars(4)).toBe(1);
  });

  it('10회 실수 → 1별', () => {
    expect(computeStars(10)).toBe(1);
  });

  it('경계: totalMistakes=1 이하 → 3별', () => {
    expect(computeStars(-1)).toBe(3); // 음수도 <=1 이므로 3별
  });
});

// ── shuffleArray ─────────────────────────────────────────────────────────────

describe('shuffleArray', () => {
  it('원본 배열을 변경하지 않음 (순수 함수)', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    shuffleArray(original, 42);
    expect(original).toEqual(copy);
  });

  it('반환 배열 길이는 원본과 동일', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr, 42).length).toBe(5);
  });

  it('반환 배열은 원본 원소를 모두 포함', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const shuffled = shuffleArray(arr, 99);
    for (const item of arr) {
      expect(shuffled).toContain(item);
    }
  });

  it('seed 동일 시 항상 같은 결과', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const r1 = shuffleArray(arr, 777);
    const r2 = shuffleArray(arr, 777);
    expect(r1).toEqual(r2);
  });

  it('seed가 다르면 다른 결과가 나올 수 있음', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const results = new Set<string>();
    for (let seed = 0; seed < 20; seed++) {
      results.add(shuffleArray(arr, seed).join(','));
    }
    expect(results.size).toBeGreaterThan(1);
  });

  it('빈 배열은 빈 배열 반환', () => {
    expect(shuffleArray([], 42)).toEqual([]);
  });

  it('원소 1개 배열은 그대로 반환', () => {
    expect(shuffleArray([42], 1)).toEqual([42]);
  });

  it('seed 없이 호출해도 에러 없음', () => {
    expect(() => shuffleArray([1, 2, 3])).not.toThrow();
    expect(shuffleArray([1, 2, 3]).length).toBe(3);
  });
});

// ── sentenceOrderingLevels.ts 데이터 검증 ────────────────────────────────────

describe('SENTENCE_ORDERING_QUESTIONS 데이터 무결성', () => {
  it('최소 1개 이상의 문제가 존재', () => {
    expect(SENTENCE_ORDERING_QUESTIONS.length).toBeGreaterThan(0);
  });

  it('모든 문제가 최소 하나의 빈 슬롯(fixed: false)을 가짐', () => {
    for (const q of SENTENCE_ORDERING_QUESTIONS) {
      const freeSlots = q.slots.filter(s => !s.fixed);
      expect(freeSlots.length).toBeGreaterThan(0);
    }
  });

  it('모든 문제가 distractors를 가짐 (비어있지 않음)', () => {
    for (const q of SENTENCE_ORDERING_QUESTIONS) {
      expect(q.distractors.length).toBeGreaterThan(0);
    }
  });

  it('ID가 중복되지 않음', () => {
    const ids = SENTENCE_ORDERING_QUESTIONS.map(q => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('모든 문제의 slots가 비어있지 않음', () => {
    for (const q of SENTENCE_ORDERING_QUESTIONS) {
      expect(q.slots.length).toBeGreaterThan(0);
    }
  });

  it('모든 문제의 form이 유효한 값', () => {
    const validForms = ['SV', 'SVC', 'SVO'];
    for (const q of SENTENCE_ORDERING_QUESTIONS) {
      expect(validForms).toContain(q.form);
    }
  });

  it('모든 slots의 word가 빈 문자열이 아님', () => {
    for (const q of SENTENCE_ORDERING_QUESTIONS) {
      for (const slot of q.slots) {
        expect(slot.word.length).toBeGreaterThan(0);
      }
    }
  });

  it('distractors가 정답 단어와 겹치지 않음', () => {
    for (const q of SENTENCE_ORDERING_QUESTIONS) {
      const answers = new Set(getAnswerWords(q));
      for (const d of q.distractors) {
        // distractor가 정답 단어와 동일한 경우 경고 (데이터 품질 체크)
        expect(answers.has(d)).toBe(false);
      }
    }
  });

  it('각 문제에서 validateAnswer로 정답 단어 순서가 true 반환', () => {
    for (const q of SENTENCE_ORDERING_QUESTIONS) {
      const answer = getAnswerWords(q);
      expect(validateAnswer(answer, q)).toBe(true);
    }
  });
});
