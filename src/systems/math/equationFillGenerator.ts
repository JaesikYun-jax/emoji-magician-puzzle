/**
 * equationFillGenerator.ts
 * 역산(reverse-computation) 기반 등식 완성 문제 생성기.
 *
 * 지원 유형:
 *   add  : □ + b = c  /  a + □ = c
 *   sub  : □ − b = c  /  a − □ = c
 *   mul  : □ × b = c  /  a × □ = c
 *   div  : □ ÷ b = c  /  a ÷ □ = c
 *
 * 항상 정수 답, 양수 답을 보장한다.
 */

export type EqOp = 'add' | 'sub' | 'mul' | 'div';
export type BlankPos = 'left' | 'right';

export interface EqFillQuestion {
  /** 화면에 표시되는 등식 문자열. 예: "3 + □ = 7" */
  displayText: string;
  /** 정답 숫자 */
  answer: number;
  /** 4개의 선택지 (answer 포함, 셔플됨) */
  choices: number[];
  /** choices 배열에서 정답의 인덱스 */
  correctIndex: number;
  /** 사용된 연산 */
  op: EqOp;
  /** 빈칸 위치 */
  blankPos: BlankPos;
}

export interface EqFillGenParams {
  /** 사용할 연산 종류 목록 */
  ops: EqOp[];
  /** 빈칸이 올 수 있는 위치 목록 */
  blankPositions: BlankPos[];
  /** 피연산자 범위 [min, max] */
  operandRange: [number, number];
  /** 오답 보기의 최대 편차 (answer ± spread) */
  distractorSpread: number;
}

// ─── 유틸 ───────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function opSymbol(op: EqOp): string {
  switch (op) {
    case 'add': return '+';
    case 'sub': return '−';
    case 'mul': return '×';
    case 'div': return '÷';
  }
}

/**
 * answer 와 distractors 3개를 섞어 4개 선택지를 만든다.
 */
function buildChoices(answer: number, spread: number): { choices: number[]; correctIndex: number } {
  const used = new Set<number>([answer]);
  const raw: number[] = [];

  let attempts = 0;
  while (raw.length < 3 && attempts < 80) {
    attempts++;
    const offset = randInt(1, Math.max(spread, 2));
    const sign = Math.random() < 0.5 ? 1 : -1;
    const d = answer + sign * offset;
    if (d > 0 && !used.has(d)) {
      used.add(d);
      raw.push(d);
    }
  }
  // 폴백: 양방향 교대로 채운다
  for (let i = 1; raw.length < 3; i++) {
    const plus = answer + i;
    const minus = answer - i;
    if (!used.has(plus)) { used.add(plus); raw.push(plus); }
    if (raw.length < 3 && minus > 0 && !used.has(minus)) { used.add(minus); raw.push(minus); }
  }

  const choices = [answer, ...raw.slice(0, 3)].sort((a, b) => a - b); // 오름차순 정렬
  const correctIndex = choices.indexOf(answer);
  return { choices, correctIndex };
}

// ─── 연산별 생성 함수 ──────────────────────────────────────────────────────

function makeAddQ(params: EqFillGenParams, blankPos: BlankPos): EqFillQuestion | null {
  const [min, max] = params.operandRange;
  const a = randInt(min, max);
  const b = randInt(min, max);
  const result = a + b;

  const answer = blankPos === 'left' ? a : b;
  const known  = blankPos === 'left' ? b : a;
  const displayText = blankPos === 'left'
    ? `□ ${opSymbol('add')} ${known} = ${result}`
    : `${known} ${opSymbol('add')} □ = ${result}`;

  if (answer <= 0) return null;
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { displayText, answer, choices, correctIndex, op: 'add', blankPos };
}

function makeSubQ(params: EqFillGenParams, blankPos: BlankPos): EqFillQuestion | null {
  const [min, max] = params.operandRange;
  // 항상 a − b = result (a > b > 0, result > 0)
  const b      = randInt(min, Math.max(min, max - 1));
  const result = randInt(1, max - b);
  const a      = result + b;

  if (a > max * 2) return null; // 너무 큰 경우 재시도

  const answer = blankPos === 'left' ? a : b;
  const displayText = blankPos === 'left'
    ? `□ ${opSymbol('sub')} ${b} = ${result}`
    : `${a} ${opSymbol('sub')} □ = ${result}`;

  if (answer <= 0) return null;
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { displayText, answer, choices, correctIndex, op: 'sub', blankPos };
}

function makeMulQ(params: EqFillGenParams, blankPos: BlankPos): EqFillQuestion | null {
  // 곱셈은 2~9 범위 내에서 피연산자 선택
  const [, max] = params.operandRange;
  const capMax = Math.min(max, 9);
  const a = randInt(2, capMax);
  const b = randInt(2, capMax);
  const result = a * b;

  const answer = blankPos === 'left' ? a : b;
  const known  = blankPos === 'left' ? b : a;
  const displayText = blankPos === 'left'
    ? `□ ${opSymbol('mul')} ${known} = ${result}`
    : `${known} ${opSymbol('mul')} □ = ${result}`;

  if (answer <= 0) return null;
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { displayText, answer, choices, correctIndex, op: 'mul', blankPos };
}

function makeDivQ(params: EqFillGenParams, blankPos: BlankPos): EqFillQuestion | null {
  // a ÷ b = result (나머지 0 보장)
  // blank=left  : □ ÷ b = result → answer = b × result
  // blank=right : a ÷ □ = result → answer = b (= a / result)
  const b      = randInt(2, 9);
  const result = randInt(2, 9);
  const a      = b * result;

  const answer = blankPos === 'left' ? a : b;
  const displayText = blankPos === 'left'
    ? `□ ${opSymbol('div')} ${b} = ${result}`
    : `${a} ${opSymbol('div')} □ = ${result}`;

  if (answer <= 0) return null;
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { displayText, answer, choices, correctIndex, op: 'div', blankPos };
}

// ─── 공개 API ──────────────────────────────────────────────────────────────

/**
 * 파라미터에 맞는 등식 완성 문제를 1개 생성한다.
 * 실패 시 간단한 덧셈 문제로 폴백한다.
 */
export function generateEqFillQuestion(params: EqFillGenParams): EqFillQuestion {
  const MAX_TRIES = 30;
  for (let i = 0; i < MAX_TRIES; i++) {
    const op       = params.ops[Math.floor(Math.random() * params.ops.length)]!;
    const blankPos = params.blankPositions[Math.floor(Math.random() * params.blankPositions.length)]!;

    let q: EqFillQuestion | null = null;
    switch (op) {
      case 'add': q = makeAddQ(params, blankPos); break;
      case 'sub': q = makeSubQ(params, blankPos); break;
      case 'mul': q = makeMulQ(params, blankPos); break;
      case 'div': q = makeDivQ(params, blankPos); break;
    }
    if (q) return q;
  }
  // 최후 폴백: 단순 덧셈
  return makeAddQ({ ...params, ops: ['add'] }, 'right')!;
}

/**
 * 레벨 하나에 필요한 문제 배열을 생성한다.
 * 동일한 displayText 가 연속으로 나오지 않도록 간단히 필터링한다.
 */
export function generateEqFillLevel(
  params: EqFillGenParams,
  count: number,
): EqFillQuestion[] {
  const questions: EqFillQuestion[] = [];
  let lastText = '';
  let attempts = 0;

  while (questions.length < count && attempts < count * 5) {
    attempts++;
    const q = generateEqFillQuestion(params);
    if (q.displayText !== lastText) {
      questions.push(q);
      lastText = q.displayText;
    }
  }
  return questions;
}

/**
 * 별점 계산: correctCount / totalCount 비율로 1~3별 반환.
 * starThresholds = [1별 최소, 2별 최소, 3별 최소] (정답 수 기준)
 */
export function calcEqFillStars(
  correctCount: number,
  starThresholds: [number, number, number],
): number {
  if (correctCount >= starThresholds[2]) return 3;
  if (correctCount >= starThresholds[1]) return 2;
  if (correctCount >= starThresholds[0]) return 1;
  return 0;
}
