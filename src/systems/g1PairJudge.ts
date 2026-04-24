export function isSumTen(a: number, b: number): boolean {
  return a + b === 10;
}

export function judgePair(a: number, b: number): 'correct' | 'wrong' {
  return isSumTen(a, b) ? 'correct' : 'wrong';
}
