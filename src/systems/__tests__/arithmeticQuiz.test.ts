import { describe, it, expect } from 'vitest';
import { generateArithmeticQuestion, generateChoices, calcStars, DIFFICULTY_CONFIGS, QUESTIONS_PER_SET } from '../../systems/math/arithmeticQuiz';
import { ARITHMETIC_LEVELS } from '../../game-data/arithmeticLevels';

describe('calcStars', () => {
  it('5개 정답 → 별 3개', () => expect(calcStars(5)).toBe(3));
  it('4개 정답 → 별 2개', () => expect(calcStars(4)).toBe(2));
  it('3개 정답 → 별 1개', () => expect(calcStars(3)).toBe(1));
  it('2개 정답 → 별 0개', () => expect(calcStars(2)).toBe(0));
  it('0개 정답 → 별 0개', () => expect(calcStars(0)).toBe(0));
});

describe('generateChoices', () => {
  it('4개 선택지 반환', () => expect(generateChoices(5, 3)).toHaveLength(4));
  it('정답 포함', () => expect(generateChoices(5, 3)).toContain(5));
  it('중복 없음', () => {
    const choices = generateChoices(7, 2);
    expect(new Set(choices).size).toBe(4);
  });
  it('음수 없음', () => {
    for (let i = 0; i < 20; i++) {
      expect(generateChoices(3, 1).every(c => c >= 0)).toBe(true);
    }
  });
  it('오름차순 정렬', () => {
    for (let i = 0; i < 20; i++) {
      const choices = generateChoices(8, 4);
      for (let j = 1; j < choices.length; j++) {
        expect(choices[j]).toBeGreaterThan(choices[j - 1]!);
      }
    }
  });
  it('오답 보기는 spread 이내 거리에 있다 (최대 offset = spread)', () => {
    const spread = 4;
    const answer = 10;
    for (let trial = 0; trial < 30; trial++) {
      const choices = generateChoices(answer, spread);
      const wrongs = choices.filter(c => c !== answer);
      wrongs.forEach(w => {
        expect(Math.abs(w - answer)).toBeLessThanOrEqual(spread);
      });
    }
  });
});

describe('generateArithmeticQuestion - Level 1 (add only)', () => {
  const level = ARITHMETIC_LEVELS[0]; // id: 1
  const diff = DIFFICULTY_CONFIGS.easy;

  it('덧셈 문제 정답 검증', () => {
    for (let i = 0; i < 10; i++) {
      const q = generateArithmeticQuestion(level!, diff);
      expect(q.operandA + q.operandB).toBe(q.answer);
    }
  });
  it('choices에 정답 포함', () => {
    const q = generateArithmeticQuestion(level!, diff);
    expect(q.choices).toContain(q.answer);
  });
  it('displayEmoji가 level.items에 포함', () => {
    const q = generateArithmeticQuestion(level!, diff);
    expect(level!.items).toContain(q.displayEmoji);
  });
});

describe('generateArithmeticQuestion - Level 4 (add+sub)', () => {
  const level = ARITHMETIC_LEVELS[3]; // id: 4
  const diff = DIFFICULTY_CONFIGS.normal;

  it('뺄셈 answer는 항상 0 이상', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateArithmeticQuestion(level!, diff);
      expect(q.answer).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('generateArithmeticQuestion - Level 10 (div)', () => {
  const level = ARITHMETIC_LEVELS[9]; // id: 10
  const diff = DIFFICULTY_CONFIGS.hard;

  it('나눗셈 나머지 0 보장', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateArithmeticQuestion(level!, diff);
      if (q.operation === 'div') {
        expect(q.operandA % q.operandB).toBe(0);
        expect(q.operandA / q.operandB).toBe(q.answer);
      }
    }
  });
});

describe('QUESTIONS_PER_SET', () => {
  it('5개', () => expect(QUESTIONS_PER_SET).toBe(5));
});
