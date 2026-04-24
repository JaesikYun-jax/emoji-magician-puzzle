import type { MathOperation } from '../../game-data/subjectConfig';

export type JudgeResult = 'correct' | 'wrong' | 'order-error';

/**
 * 두 타일 값 a(먼저 탭), b(나중 탭)에 대해 연산 판정을 수행한다.
 * targetValue가 number[] 이면 배열 내 임의 값에 일치하면 correct.
 * 뺄셈은 a > b AND a - b = targetValue → correct
 *        a < b AND b - a = targetValue → order-error
 *        그 외 → wrong
 */
export function judgeOperation(
  a: number,
  b: number,
  operation: MathOperation,
  targetValue: number | number[]
): JudgeResult {
  const targets = Array.isArray(targetValue) ? targetValue : [targetValue];

  switch (operation) {
    case 'addition':
      return targets.some((t) => a + b === t) ? 'correct' : 'wrong';

    case 'subtraction': {
      if (a < b && targets.some((t) => b - a === t)) return 'order-error';
      return targets.some((t) => a - b === t) ? 'correct' : 'wrong';
    }

    case 'multiplication':
      return targets.some((t) => a * b === t) ? 'correct' : 'wrong';

    default:
      return 'wrong';
  }
}
