import type { ArithmeticLevel, ArithmeticOp } from '../../game-data/arithmeticLevels';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  id: Difficulty;
  timePerQuestion: number;
  choiceSpread: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy:   { id: 'easy',   timePerQuestion: 30, choiceSpread: 5 },
  normal: { id: 'normal', timePerQuestion: 20, choiceSpread: 3 },
  hard:   { id: 'hard',   timePerQuestion: 15, choiceSpread: 1 },
};

export interface ArithmeticQuestion {
  operandA: number;
  operandB: number;
  operation: ArithmeticOp;
  operationSymbol: '+' | '-' | '×' | '÷';
  answer: number;
  choices: number[];
  displayEmoji: string;
  visualA: string[];
  visualB: string[];
  displayString: string;
}

export const QUESTIONS_PER_SET = 5;

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const OP_SYMBOL: Record<ArithmeticOp, '+' | '-' | '×' | '÷'> = {
  add: '+',
  sub: '-',
  mul: '×',
  div: '÷',
};

export function generateChoices(answer: number, spread: number): number[] {
  const choices = new Set<number>([answer]);
  let attempts = 0;
  while (choices.size < 4 && attempts < 200) {
    attempts++;
    // spread를 최대 offset으로 사용해 정답 근처 보기 생성
    const offset = randInt(1, spread);
    const sign = Math.random() < 0.5 ? 1 : -1;
    const candidate = answer + sign * offset;
    if (candidate > 0 && !choices.has(candidate)) {
      choices.add(candidate);
    }
  }
  // fallback: 정답 인접 숫자로 채우기 (1,2,3... 순서 아님)
  let fallbackOffset = 1;
  while (choices.size < 4) {
    const c1 = answer + fallbackOffset;
    const c2 = answer - fallbackOffset;
    if (c1 > 0 && !choices.has(c1)) choices.add(c1);
    if (choices.size < 4 && c2 > 0 && !choices.has(c2)) choices.add(c2);
    fallbackOffset++;
  }
  // 오름차순 정렬
  return [...choices].sort((a, b) => a - b);
}

export function generateArithmeticQuestion(
  level: ArithmeticLevel,
  diff: DifficultyConfig,
): ArithmeticQuestion {
  const operation = randItem(level.operations);
  const [rMin, rMax] = level.numRange;
  const displayEmoji = randItem(level.items);

  let operandA: number;
  let operandB: number;
  let answer: number;

  switch (operation) {
    case 'add': {
      operandA = randInt(rMin, rMax);
      operandB = randInt(rMin, rMax);
      answer = operandA + operandB;
      break;
    }
    case 'sub': {
      operandA = randInt(rMin, rMax);
      // b must be <= a so answer >= 0, and b >= 1
      const bMax = Math.max(rMin, operandA);
      operandB = randInt(1, bMax);
      answer = operandA - operandB;
      break;
    }
    case 'mul': {
      const mulMax = Math.min(10, rMax);
      const mulMin = Math.max(2, rMin);
      operandA = randInt(mulMin, mulMax);
      // ensure product <= rMax
      const bUpperMul = Math.min(mulMax, Math.floor(rMax / operandA));
      operandB = randInt(Math.max(2, mulMin), Math.max(2, bUpperMul));
      answer = operandA * operandB;
      break;
    }
    case 'div': {
      const quotient = randInt(2, 10);
      operandB = randInt(2, 9);
      operandA = operandB * quotient;
      answer = quotient;
      break;
    }
  }

  const visualA = Array(operandA).fill(displayEmoji) as string[];
  const visualB = Array(operandB).fill(displayEmoji) as string[];
  const symbol = OP_SYMBOL[operation];
  const displayString = `${operandA} ${symbol} ${operandB} = ?`;

  return {
    operandA,
    operandB,
    operation,
    operationSymbol: symbol,
    answer,
    choices: generateChoices(answer, diff.choiceSpread),
    displayEmoji,
    visualA,
    visualB,
    displayString,
  };
}

export function calcStars(correctCount: number): 0 | 1 | 2 | 3 {
  if (correctCount >= 5) return 3;
  if (correctCount >= 4) return 2;
  if (correctCount >= 3) return 1;
  return 0;
}
