import type { MatrixLevelConfig, MatrixProblem } from './matrixReasoningTypes';
import { makeLcg, type Rand } from './matrixReasoningRandom';
import { generateEmojiProblem } from './matrixReasoningEmojiGenerator';
import { generateNumberProblem } from './matrixReasoningNumberGenerator';
import { generateSetCardProblem } from './matrixReasoningSetCardGenerator';

export function generateMatrixProblem(
  config: MatrixLevelConfig,
  seed?: number,
): MatrixProblem {
  const rand: Rand = seed !== undefined ? makeLcg(seed) : Math.random;
  switch (config.cellKind) {
    case 'emoji':   return generateEmojiProblem(config, rand);
    case 'number':  return generateNumberProblem(config, rand);
    case 'setcard': return generateSetCardProblem(config, rand);
  }
}

export function calcMatrixStars(
  correct: number,
  thresholds: [number, number, number],
): number {
  if (correct >= thresholds[2]) return 3;
  if (correct >= thresholds[1]) return 2;
  if (correct >= thresholds[0]) return 1;
  return 0;
}
