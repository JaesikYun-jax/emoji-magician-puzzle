import type { MathOperation } from './UserMathStatus';

export type { MathOperation };

// 학년/학기별 가능한 연산 목록
export const AVAILABLE_OPERATIONS: Record<string, readonly MathOperation[]> = {
  'G1_S1': ['add', 'sub'],
  'G1_S2': ['add', 'sub'],
  'G2_S1': ['add', 'sub'],
  'G2_S2': ['add', 'sub', 'mul'],
  'G3_S1': ['add', 'sub', 'div'],
  'G3_S2': ['mul', 'div'],
};

export interface CurriculumRule {
  aRange: [number, number];
  bRange: [number, number];
  resultMin: number;
  resultMax: number;
  constraint?: (a: number, b: number, result: number) => boolean;
  quotientRange?: [number, number];
  divisorRange?: [number, number];
  hasRemainder?: boolean;
}

export type DistractorStrategy = 'uniform' | 'nearMiss' | 'placeValue';

export interface DistractorRule {
  offsetRange: [number, number];
  distMin: number;
  strategy: DistractorStrategy;
}

export const DISTRACTOR_RULES: Record<string, DistractorRule> = {
  'G1_S1': { offsetRange: [1, 5],  distMin: 0, strategy: 'uniform' },
  'G1_S2': { offsetRange: [1, 9],  distMin: 0, strategy: 'uniform' },
  'G2_S1': { offsetRange: [2, 15], distMin: 1, strategy: 'nearMiss' },
  'G2_S2': { offsetRange: [2, 20], distMin: 1, strategy: 'nearMiss' },
  'G3_S1': { offsetRange: [5, 50], distMin: 1, strategy: 'placeValue' },
  'G3_S2': { offsetRange: [5, 30], distMin: 1, strategy: 'placeValue' },
};

export function resolveChoiceCount(grade: 1|2|3, semester: 1|2, difficultyScore: number): 2|3|4 {
  if (grade === 1 && semester === 1) return 2;
  if (grade === 1 && semester === 2) return difficultyScore >= 60 ? 3 : 2;
  if (grade === 2 && semester === 1) return difficultyScore >= 50 ? 3 : 2;
  if (grade === 2 && semester === 2) return difficultyScore >= 60 ? 4 : 3;
  // G3
  return 4;
}

function randIntSimple(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateDistractors(answer: number, count: number, rule: DistractorRule): number[] {
  const distractors: number[] = [];
  const used = new Set<number>([answer]);
  const [offsetMin, offsetMax] = rule.offsetRange;

  let attempts = 0;
  while (distractors.length < count && attempts < 200) {
    attempts++;
    let candidate: number;

    if (rule.strategy === 'uniform') {
      const offset = randIntSimple(offsetMin, offsetMax);
      candidate = Math.random() < 0.5 ? answer + offset : answer - offset;
    } else if (rule.strategy === 'nearMiss') {
      const offset = randIntSimple(offsetMin, Math.min(offsetMax, 10));
      candidate = Math.random() < 0.5 ? answer + offset : answer - offset;
    } else {
      // placeValue: flip a digit
      const offset = randIntSimple(offsetMin, offsetMax);
      candidate = Math.random() < 0.5 ? answer + offset : answer - offset;
    }

    if (candidate < rule.distMin) continue;
    if (used.has(candidate)) continue;
    used.add(candidate);
    distractors.push(candidate);
  }

  // fallback if not enough
  let fallback = answer + 1;
  while (distractors.length < count) {
    if (!used.has(fallback) && fallback >= rule.distMin) {
      used.add(fallback);
      distractors.push(fallback);
    }
    fallback++;
  }

  return distractors;
}

export function getCurriculumRule(
  grade: 1|2|3,
  semester: 1|2,
  operation: MathOperation,
  difficultyScore: number
): CurriculumRule {
  const key = `G${grade}_S${semester}_${operation}`;

  switch (key) {
    // G1_S1
    case 'G1_S1_add':
      return { aRange: [1, 9], bRange: [1, 9], resultMin: 2, resultMax: 18 };
    case 'G1_S1_sub':
      return {
        aRange: [1, 9], bRange: [1, 9], resultMin: 0, resultMax: 8,
        constraint: (a, b) => a >= b,
      };

    // G1_S2
    case 'G1_S2_add':
      return { aRange: [10, 19], bRange: [1, 9], resultMin: 11, resultMax: 28 };
    case 'G1_S2_sub':
      return {
        aRange: [10, 28], bRange: [1, 9], resultMin: 0, resultMax: 27,
        constraint: (a, b) => a >= b,
      };

    // G2_S1
    case 'G2_S1_add':
      return {
        aRange: [10, 99], bRange: [10, 99], resultMin: 20, resultMax: 99,
        // 받아올림 없음: 각 자릿수 합 ≤ 9
        constraint: (a, b) => {
          const a1 = a % 10, b1 = b % 10;
          const a10 = Math.floor(a / 10), b10 = Math.floor(b / 10);
          return a1 + b1 <= 9 && a10 + b10 <= 9;
        },
      };
    case 'G2_S1_sub':
      return {
        aRange: [20, 99], bRange: [10, 79], resultMin: 1, resultMax: 89,
        // 받아내림 없음
        constraint: (a, b) => {
          const a1 = a % 10, b1 = b % 10;
          const a10 = Math.floor(a / 10), b10 = Math.floor(b / 10);
          return a >= b && a1 >= b1 && a10 >= b10;
        },
      };

    // G2_S2
    case 'G2_S2_add':
      return { aRange: [10, 99], bRange: [10, 99], resultMin: 20, resultMax: 198 };
    case 'G2_S2_sub':
      return {
        aRange: [20, 99], bRange: [10, 98], resultMin: 1, resultMax: 89,
        constraint: (a, b) => a > b,
      };
    case 'G2_S2_mul': {
      const aMax = difficultyScore < 40 ? 5 : 9;
      return { aRange: [2, aMax], bRange: [1, 9], resultMin: 2, resultMax: 81 };
    }

    // G3_S1
    case 'G3_S1_add':
      return { aRange: [100, 999], bRange: [100, 999], resultMin: 200, resultMax: 1998 };
    case 'G3_S1_sub':
      return {
        aRange: [200, 999], bRange: [100, 899], resultMin: 1, resultMax: 899,
        constraint: (a, b) => a > b,
      };
    case 'G3_S1_div':
      // 나누어 떨어짐, divisor∈[2,9], quotient∈[1,9]
      return {
        aRange: [2, 81], bRange: [2, 9], resultMin: 1, resultMax: 9,
        quotientRange: [1, 9],
        divisorRange: [2, 9],
        hasRemainder: false,
        constraint: (a, b) => a % b === 0,
      };

    // G3_S2
    case 'G3_S2_mul': {
      if (difficultyScore < 50) {
        return { aRange: [10, 99], bRange: [2, 9], resultMin: 20, resultMax: 891 };
      }
      return { aRange: [10, 29], bRange: [10, 29], resultMin: 100, resultMax: 841 };
    }
    case 'G3_S2_div':
      // 나머지 있는 나눗셈
      return {
        aRange: [10, 99], bRange: [2, 9], resultMin: 1, resultMax: 49,
        quotientRange: [1, 9],
        divisorRange: [2, 9],
        hasRemainder: true,
      };

    default:
      // 기본 fallback: G1_S1 add
      return { aRange: [1, 9], bRange: [1, 9], resultMin: 2, resultMax: 18 };
  }
}
