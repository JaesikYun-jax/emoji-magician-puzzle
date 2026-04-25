/**
 * englishQuestion.test.ts
 *
 * 대상: src/systems/english/questionGenerator.ts — generateQuestion()
 *
 * 감지 대상 버그:
 *   - choices 배열에 정답이 누락되는 경우
 *   - correctIdx 가 범위를 벗어나는 경우
 *   - choices 배열에 중복 항목이 들어오는 경우
 *   - 특정 난이도 풀이 비어 있어 에러가 발생하는 경우
 */
import { describe, it, expect } from 'vitest';
import { generateQuestion } from '../english/questionGenerator';
import type { EnglishDifficultyKey } from '../english/questionGenerator';

// 테스트 대상 난이도 목록 (사용자 요청 기준 3종)
const TARGET_DIFFICULTIES: EnglishDifficultyKey[] = [
  'beginner',
  'intermediate',
  'advanced',
];

// ── 단일 호출 기본 구조 검증 ──────────────────────────────────────────────────

describe('generateQuestion — word 객체 필드 존재', () => {
  for (const diff of TARGET_DIFFICULTIES) {
    it(`generateQuestion("${diff}") 반환값에 word.english 와 word.korean 필드가 있다`, () => {
      const q = generateQuestion(diff);
      expect(q.word).toBeDefined();
      expect(typeof q.word.english).toBe('string');
      expect(q.word.english.length).toBeGreaterThan(0);
      expect(typeof q.word.korean).toBe('string');
      expect(q.word.korean.length).toBeGreaterThan(0);
    });
  }
});

describe('generateQuestion — choices 배열 크기', () => {
  for (const diff of TARGET_DIFFICULTIES) {
    it(`generateQuestion("${diff}") 의 choices 는 정확히 4개`, () => {
      const q = generateQuestion(diff);
      expect(q.choices).toHaveLength(4);
    });
  }
});

describe('generateQuestion — correctIdx 범위', () => {
  for (const diff of TARGET_DIFFICULTIES) {
    it(`generateQuestion("${diff}") 의 correctIdx 는 0 이상 3 이하`, () => {
      const q = generateQuestion(diff);
      expect(q.correctIdx).toBeGreaterThanOrEqual(0);
      expect(q.correctIdx).toBeLessThanOrEqual(3);
      // 정수인지 확인
      expect(Number.isInteger(q.correctIdx)).toBe(true);
    });
  }
});

describe('generateQuestion — correctIdx 가 실제 정답 위치를 가리킴', () => {
  for (const diff of TARGET_DIFFICULTIES) {
    it(`generateQuestion("${diff}") 의 choices[correctIdx] === word.korean`, () => {
      const q = generateQuestion(diff);
      expect(q.choices[q.correctIdx]).toBe(q.word.korean);
    });

    it(`generateQuestion("${diff}") 의 choices 에 word.korean 이 포함됨`, () => {
      const q = generateQuestion(diff);
      expect(q.choices).toContain(q.word.korean);
    });
  }
});

describe('generateQuestion — choices 중복 없음', () => {
  for (const diff of TARGET_DIFFICULTIES) {
    it(`generateQuestion("${diff}") — choices 에 중복 항목이 없다`, () => {
      const q = generateQuestion(diff);
      expect(new Set(q.choices).size).toBe(q.choices.length);
    });
  }
});

// ── 10회 반복 안정성 테스트 ──────────────────────────────────────────────────

describe('generateQuestion — 10회 반복 안정성', () => {
  for (const diff of TARGET_DIFFICULTIES) {
    it(`generateQuestion("${diff}") 를 10회 호출해도 항상 규격을 만족한다`, () => {
      for (let i = 0; i < 10; i++) {
        const q = generateQuestion(diff);

        // word 필드
        expect(typeof q.word.english).toBe('string');
        expect(q.word.english.length).toBeGreaterThan(0);
        expect(typeof q.word.korean).toBe('string');
        expect(q.word.korean.length).toBeGreaterThan(0);

        // choices 개수
        expect(q.choices).toHaveLength(4);

        // correctIdx 범위
        expect(q.correctIdx).toBeGreaterThanOrEqual(0);
        expect(q.correctIdx).toBeLessThanOrEqual(3);
        expect(Number.isInteger(q.correctIdx)).toBe(true);

        // 정답 일치
        expect(q.choices[q.correctIdx]).toBe(q.word.korean);
        expect(q.choices).toContain(q.word.korean);

        // 중복 없음
        expect(new Set(q.choices).size).toBe(q.choices.length);
      }
    });
  }
});

// ── 엣지 케이스 ───────────────────────────────────────────────────────────────

describe('generateQuestion — 엣지 케이스', () => {
  it('choices 의 모든 항목이 비어있지 않은 문자열이다', () => {
    for (let i = 0; i < 5; i++) {
      const q = generateQuestion('beginner');
      for (const choice of q.choices) {
        expect(typeof choice).toBe('string');
        expect(choice.length).toBeGreaterThan(0);
      }
    }
  });

  it('intermediate — word.english 가 영문자로 구성된 문자열이다', () => {
    const q = generateQuestion('intermediate');
    // 영단어임을 간략 확인 (공백·하이픈 허용)
    expect(q.word.english).toMatch(/^[a-zA-Z\s'-]+$/);
  });

  it('advanced — word.korean 이 정답 위치 이외 choices 에도 중복 없이 존재한다', () => {
    for (let i = 0; i < 10; i++) {
      const q = generateQuestion('advanced');
      const occurrences = q.choices.filter(c => c === q.word.korean).length;
      expect(occurrences).toBe(1);
    }
  });
});
