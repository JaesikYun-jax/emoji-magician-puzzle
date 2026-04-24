import type { MathLevelConfig, MathOperation } from '../../game-data/subjectConfig';

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makePair(
  operation: MathOperation,
  target: number,
  tileRange: [number, number]
): [number, number] | null {
  const [min, max] = tileRange;
  const attempts = 50;

  for (let i = 0; i < attempts; i++) {
    const a = randInt(min, max);
    let b: number;

    switch (operation) {
      case 'addition':
        b = target - a;
        break;
      case 'subtraction':
        b = a - target;
        break;
      case 'multiplication':
        if (a === 0) continue;
        if (target % a !== 0) continue;
        b = target / a;
        break;
      default:
        continue;
    }

    if (b >= min && b <= max && b !== a) return [a, b];
  }
  return null;
}

/**
 * MathLevelConfig 기반으로 boardRows x boardCols 크기의 보드를 생성한다.
 * targetPairs 쌍이 보드에 포함되도록 보장한다.
 */
export function generateMathBoard(config: MathLevelConfig): number[][] {
  const { boardRows, boardCols, tileRange, targetValue, targetPairs, operation } = config;
  const total = boardRows * boardCols;
  const flat: number[] = new Array(total).fill(0);

  const pairList: [number, number][] = [];

  if (typeof targetPairs === 'number') {
    const targets = Array.isArray(targetValue) ? targetValue : [targetValue];
    let count = targetPairs;
    let ti = 0;
    while (count > 0) {
      const target = targets[ti % targets.length];
      const pair = makePair(operation, target, tileRange);
      if (pair) {
        pairList.push(pair);
        count--;
      }
      ti++;
      // 무한 루프 방지
      if (ti > targets.length * 200) break;
    }
  } else {
    for (const [targetStr, count] of Object.entries(targetPairs)) {
      const target = Number(targetStr);
      for (let i = 0; i < count; i++) {
        const pair = makePair(operation, target, tileRange);
        if (pair) pairList.push(pair);
      }
    }
  }

  let idx = 0;
  for (const [a, b] of pairList) {
    if (idx + 1 < total) {
      flat[idx++] = a;
      flat[idx++] = b;
    }
  }

  const [min, max] = tileRange;
  for (; idx < total; idx++) {
    flat[idx] = randInt(min, max);
  }

  for (let i = flat.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flat[i], flat[j]] = [flat[j], flat[i]];
  }

  const board: number[][] = [];
  for (let r = 0; r < boardRows; r++) {
    board.push(flat.slice(r * boardCols, (r + 1) * boardCols));
  }

  return board;
}
