import { describe, it, expect } from 'vitest';
import { judgeOperation } from '../math/operationJudge';

describe('judgeOperation - addition', () => {
  it('a+b = 단일 목표값이면 correct를 반환한다', () => {
    expect(judgeOperation(3, 7, 'addition', 10)).toBe('correct');
  });

  it('a+b ≠ 목표값이면 wrong을 반환한다', () => {
    expect(judgeOperation(3, 6, 'addition', 10)).toBe('wrong');
  });

  it('targetValue 배열 중 하나에 일치하면 correct를 반환한다', () => {
    expect(judgeOperation(4, 6, 'addition', [5, 10, 15])).toBe('correct');
  });

  it('targetValue 배열 어느 것에도 일치하지 않으면 wrong을 반환한다', () => {
    expect(judgeOperation(2, 3, 'addition', [7, 10, 15])).toBe('wrong');
  });
});

describe('judgeOperation - subtraction', () => {
  it('a > b이고 a-b = 목표값이면 correct를 반환한다', () => {
    expect(judgeOperation(9, 4, 'subtraction', 5)).toBe('correct');
  });

  it('a < b이고 b-a = 목표값이면 order-error를 반환한다', () => {
    expect(judgeOperation(4, 9, 'subtraction', 5)).toBe('order-error');
  });

  it('a > b이지만 a-b ≠ 목표값이면 wrong을 반환한다', () => {
    expect(judgeOperation(9, 4, 'subtraction', 3)).toBe('wrong');
  });

  it('a = b이면 wrong을 반환한다 (결과가 0이고 목표값이 0이 아닌 경우)', () => {
    expect(judgeOperation(5, 5, 'subtraction', 3)).toBe('wrong');
  });
});

describe('judgeOperation - multiplication', () => {
  it('a*b = 목표값이면 correct를 반환한다', () => {
    expect(judgeOperation(3, 4, 'multiplication', 12)).toBe('correct');
  });

  it('a*b ≠ 목표값이면 wrong을 반환한다', () => {
    expect(judgeOperation(3, 4, 'multiplication', 10)).toBe('wrong');
  });

  it('targetValue 배열 중 하나에 일치하면 correct를 반환한다', () => {
    expect(judgeOperation(5, 6, 'multiplication', [20, 30, 42])).toBe('correct');
  });

  it('targetValue 배열 어느 것에도 일치하지 않으면 wrong을 반환한다', () => {
    expect(judgeOperation(5, 6, 'multiplication', [20, 25, 42])).toBe('wrong');
  });
});
