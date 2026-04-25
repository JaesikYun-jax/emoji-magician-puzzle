import type { UserMathStatus, MathOperation } from './UserMathStatus';
import {
  getCurriculumRule,
  generateDistractors,
  resolveChoiceCount,
  DISTRACTOR_RULES,
  type CurriculumRule,
} from './mathCurriculum';
import {
  MATH_CURRICULUM,
  getCurriculumIndex,
  type MathCurriculumRule,
  type MathOpType,
} from '../../game-data/mathCurriculum';
import type { DifficultyParams } from './difficultyEngine';
import { pickRuleByWeight } from './difficultyEngine';

// ── 새 룰 기반 문제 생성 시스템 ──────────────────────────────────────────────

export interface NewMathQuestion {
  id: string;
  ruleId: string;
  displayText: string;   // '27 + 5 = ?'
  operandA: number;
  operandB: number;
  op: MathOpType;
  correctAnswer: number;
  remainder?: number;    // 나눗셈 나머지
  choices: number[];     // 4개, 셔플됨
  correctIndex: number;  // choices 내 정답 위치
}

// 최근 10문제 중복 방지 캐시 (module-level)
const _recentCache = new Set<string>();
const _recentCacheOrder: string[] = [];
const CACHE_MAX = 10;

function _addToCache(key: string): void {
  if (_recentCache.has(key)) return;
  _recentCache.add(key);
  _recentCacheOrder.push(key);
  if (_recentCacheOrder.length > CACHE_MAX) {
    const oldest = _recentCacheOrder.shift()!;
    _recentCache.delete(oldest);
  }
}

function _randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _shrinkRange(rule: { min: number; max: number }, scale: number): { min: number; max: number } {
  const mid = (rule.min + rule.max) / 2;
  const half = ((rule.max - rule.min) / 2) * scale;
  return {
    min: Math.max(rule.min, Math.floor(mid - half)),
    max: Math.min(rule.max, Math.ceil(mid + half)),
  };
}

function _computeAnswer(a: number, b: number, op: MathOpType): number {
  switch (op) {
    case 'add': return a + b;
    case 'sub': return a - b;
    case 'mul': return a * b;
    case 'div': return Math.floor(a / b);
  }
}

function _checkCarry(a: number, b: number, op: MathOpType, carryMode: string): boolean {
  if (op === 'add') {
    const hasCarry = (a % 10) + (b % 10) >= 10;
    if (carryMode === 'none' && hasCarry) return false;
    if (carryMode === 'with' && !hasCarry) return false;
  }
  if (op === 'sub') {
    const hasBorrow = (a % 10) < (b % 10);
    if (carryMode === 'none' && hasBorrow) return false;
    if (carryMode === 'with' && !hasBorrow) return false;
  }
  return true;
}

function _opSymbol(op: MathOpType): string {
  switch (op) {
    case 'add': return '+';
    case 'sub': return '-';
    case 'mul': return '×';
    case 'div': return '÷';
  }
}

function _generateNewDistractors(
  answer: number,
  rule: MathCurriculumRule,
  mode: 'easy' | 'normal' | 'hard',
): number[] {
  const distractors = new Set<number>();
  const [resMin, resMax] = rule.resultRange;

  const spread = mode === 'easy' ? [3, 8] : mode === 'normal' ? [2, 5] : [1, 3];

  let attempts = 0;
  while (distractors.size < 3 && attempts < 100) {
    attempts++;
    const sign = Math.random() < 0.5 ? 1 : -1;
    const delta = _randInt(spread[0], spread[1]);
    const candidate = answer + sign * delta;
    if (
      candidate !== answer &&
      candidate >= Math.max(0, resMin - 10) &&
      candidate <= resMax + 10 &&
      !distractors.has(candidate)
    ) {
      distractors.add(candidate);
    }
  }

  if (mode === 'hard' && distractors.size < 3) {
    if (answer >= 10 && answer <= 99) {
      const flipped = Math.floor(answer / 10) + (answer % 10) * 10;
      if (flipped !== answer && !distractors.has(flipped)) {
        distractors.add(flipped);
      }
    }
    if (distractors.size < 3) distractors.add(answer + 1);
    if (distractors.size < 3 && answer - 1 > 0) distractors.add(answer - 1);
    if (distractors.size < 3) distractors.add(answer + 2);
  }

  return Array.from(distractors).slice(0, 3);
}

function _shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateQuestionByRule(
  ruleId: string,
  params: DifficultyParams,
): NewMathQuestion {
  const rule = MATH_CURRICULUM.find(r => r.id === ruleId);
  if (!rule) throw new Error(`Unknown ruleId: ${ruleId}`);

  const rangeA = _shrinkRange(rule.operandA, params.operandScaleFactor);
  const rangeB = _shrinkRange(rule.operandB, params.operandScaleFactor);

  let a = 0, b = 0, answer = 0;
  let found = false;

  for (let attempt = 0; attempt < 100; attempt++) {
    a = _randInt(rangeA.min, rangeA.max);
    b = _randInt(rangeB.min, rangeB.max);

    if (rule.op === 'sub' && a <= b) continue;
    if (rule.op === 'div' && rule.id.includes('basic')) {
      b = _randInt(rangeB.min, rangeB.max);
      const quotient = _randInt(rule.resultRange[0], rule.resultRange[1]);
      a = b * quotient;
      if (a < rule.operandA.min || a > rule.operandA.max) continue;
    }

    if (!_checkCarry(a, b, rule.op, rule.carryMode)) continue;

    answer = _computeAnswer(a, b, rule.op);

    if (answer < rule.resultRange[0] || answer > rule.resultRange[1]) continue;

    const cacheKey = `${a}${rule.op}${b}`;
    if (_recentCache.has(cacheKey)) continue;

    _addToCache(cacheKey);
    found = true;
    break;
  }

  if (!found) {
    a = _randInt(rule.operandA.min, rule.operandA.max);
    b = _randInt(rule.operandB.min, Math.min(rule.operandB.max, rule.operandA.min));
    if (rule.op === 'sub' && a <= b) b = a - 1;
    if (b < 1) b = 1;
    answer = _computeAnswer(a, b, rule.op);
  }

  const remainder = rule.op === 'div' ? a % b : undefined;
  const displayText = `${a} ${_opSymbol(rule.op)} ${b} = ?`;

  const distractors = _generateNewDistractors(answer, rule, params.distractorMode);
  const allChoices = _shuffleArray([answer, ...distractors]);
  const correctIndex = allChoices.indexOf(answer);

  return {
    id: `${ruleId}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ruleId,
    displayText,
    operandA: a,
    operandB: b,
    op: rule.op,
    correctAnswer: answer,
    remainder,
    choices: allChoices,
    correctIndex,
  };
}

/** DifficultyParams로부터 가중치 기반으로 ruleId 선택 후 문제 생성 */
export function generateNextQuestion(params: DifficultyParams): NewMathQuestion {
  const ruleId = pickRuleByWeight(params.ruleWeights);
  return generateQuestionByRule(ruleId, params);
}

/** 캐시 초기화 (게임 재시작 시) */
export function clearQuestionCache(): void {
  _recentCache.clear();
  _recentCacheOrder.length = 0;
}

// ── 기존 스테이지 기반 문제 생성 시스템 (하위 호환) ──────────────────────────

export interface MathQuestion {
  operandA: number;
  operandB: number;
  operation: MathOperation;
  answer: number;
  remainder?: number;        // G3_S2 div 전용
  choices: number[];         // choiceCount개, 섞인 순서
  choiceCount: 2 | 3 | 4;
  displayString: string;     // "3 + 4 = ?" 형태
}

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randIntFromRng(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function generateOperands(
  rule: CurriculumRule,
  operation: MathOperation,
  rng: () => number
): { a: number; b: number; result: number; remainder?: number } | null {
  const [aMin, aMax] = rule.aRange;
  const [bMin, bMax] = rule.bRange;

  // Division with exact quotient/divisor ranges
  if (operation === 'div') {
    const [qMin, qMax] = rule.quotientRange ?? [1, 9];
    const [dMin, dMax] = rule.divisorRange ?? [2, 9];

    for (let attempt = 0; attempt < 50; attempt++) {
      const divisor = randIntFromRng(dMin, dMax, rng);
      const quotient = randIntFromRng(qMin, qMax, rng);

      if (rule.hasRemainder) {
        // dividend in rule.aRange
        const dividend = randIntFromRng(aMin, aMax, rng);
        const remainder = dividend % divisor;
        const q = Math.floor(dividend / divisor);
        if (q < qMin || q > qMax) continue;
        if (rule.constraint && !rule.constraint(dividend, divisor, q)) continue;
        return { a: dividend, b: divisor, result: q, remainder };
      } else {
        const dividend = divisor * quotient;
        if (dividend < aMin || dividend > aMax) continue;
        if (rule.constraint && !rule.constraint(dividend, divisor, quotient)) continue;
        return { a: dividend, b: divisor, result: quotient };
      }
    }
    return null;
  }

  for (let attempt = 0; attempt < 50; attempt++) {
    const a = randIntFromRng(aMin, aMax, rng);
    const b = randIntFromRng(bMin, bMax, rng);
    let result: number;

    switch (operation) {
      case 'add': result = a + b; break;
      case 'sub': result = a - b; break;
      case 'mul': result = a * b; break;
      default: result = a + b;
    }

    if (result < rule.resultMin || result > rule.resultMax) continue;
    if (rule.constraint && !rule.constraint(a, b, result)) continue;

    return { a, b, result };
  }

  return null;
}

function buildFallback(operation: MathOperation): { a: number; b: number; result: number; remainder?: number } {
  switch (operation) {
    case 'add': return { a: 3, b: 4, result: 7 };
    case 'sub': return { a: 7, b: 3, result: 4 };
    case 'mul': return { a: 3, b: 4, result: 12 };
    case 'div': return { a: 12, b: 3, result: 4 };
  }
}

function buildDisplayString(
  a: number,
  b: number,
  operation: MathOperation,
  remainder?: number
): string {
  const opSymbol: Record<MathOperation, string> = {
    add: '+',
    sub: '-',
    mul: '×',
    div: '÷',
  };

  if (operation === 'div' && remainder !== undefined) {
    return `${a} ${opSymbol[operation]} ${b} = ? … 나머지 ?`;
  }
  return `${a} ${opSymbol[operation]} ${b} = ?`;
}

/** @deprecated 새 generateNextQuestion(params) 를 사용하세요. */
export function generateQuestion(_status: UserMathStatus, _seed?: number): MathQuestion {
  // fallback: 간단한 덧셈 문제 반환
  return {
    operandA: 3,
    operandB: 4,
    operation: 'add',
    answer: 7,
    choices: [7, 5, 9, 6],
    choiceCount: 4,
    displayString: '3 + 4 = ?',
  };
}
