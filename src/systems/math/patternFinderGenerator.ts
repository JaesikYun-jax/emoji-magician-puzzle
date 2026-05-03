/**
 * patternFinderGenerator.ts
 * 수 패턴 생성기: 등차·등비·피보나치·제곱수·교대 수열에서 빈칸(?) 문제를 생성한다.
 */

export type PatternType = 'arithmetic' | 'geometric' | 'fibonacci' | 'square' | 'alternating';

export interface PatternSequence {
  /** 표시될 타일 숫자 배열. null = ? 위치 */
  tiles: (number | null)[];
  /** 정답 숫자 */
  answer: number;
  /** 4개 선택지 (정답 포함, 셔플됨) */
  choices: number[];
  /** choices에서 정답의 인덱스 */
  correctIndex: number;
  /** 패턴 유형 */
  patternType: PatternType;
  /** null 타일의 인덱스 */
  blankIndex: number;
}

export interface PatternGenParams {
  /** 사용할 패턴 유형 목록 */
  patternTypes: PatternType[];
  /** 수열 길이 (빈칸 포함, 보통 5 또는 6) */
  length: number;
  /** 빈칸 위치: 'end'=마지막, 'middle'=중간(2번째~끝-1), 'any'=마지막 세 위치 중 랜덤 */
  blankPosition: 'end' | 'middle' | 'any';
  /** 난이도: [시작값 최대, 공차/공비 최대] */
  difficultyRange: [number, number];
  /** 오답 보기 편차 */
  distractorSpread: number;
}

// ── 내부 유틸 ────────────────────────────────────────────────────────────────

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface ChoicesResult {
  choices: number[];
  correctIndex: number;
}

function buildChoices(answer: number, spread: number): ChoicesResult {
  const distractors = new Set<number>();
  const maxAttempts = 200;
  let attempts = 0;
  // spread 범위 내에서 가까운 오답 우선 생성 (양방향 균등)
  while (distractors.size < 3 && attempts < maxAttempts) {
    attempts++;
    const delta = randInt(1, Math.max(spread, 3));
    const sign = Math.random() < 0.5 ? 1 : -1;
    const candidate = answer + sign * delta;
    if (candidate > 0 && candidate !== answer) distractors.add(candidate);
  }
  // 폴백: 양방향 교대
  for (let i = 1; distractors.size < 3; i++) {
    const plus = answer + i;
    const minus = answer - i;
    if (plus !== answer && plus > 0) distractors.add(plus);
    if (distractors.size < 3 && minus > 0 && minus !== answer) distractors.add(minus);
  }

  const all = [answer, ...Array.from(distractors).slice(0, 3)];
  const sorted = all.sort((a, b) => a - b); // 오름차순 반환
  const correctIndex = sorted.indexOf(answer);
  return { choices: sorted, correctIndex };
}

interface BlankResult {
  tiles: (number | null)[];
  blankIndex: number;
  answer: number;
}

function applyBlank(seq: number[], blankPosition: 'end' | 'middle' | 'any'): BlankResult {
  let blankIndex: number;

  if (blankPosition === 'end') {
    blankIndex = seq.length - 1;
  } else if (blankPosition === 'middle') {
    blankIndex = Math.max(2, Math.floor(seq.length / 2));
  } else {
    // 'any': 마지막 세 위치 중 랜덤
    blankIndex = seq.length - 1 - randInt(0, Math.min(2, seq.length - 3));
  }

  const answer = seq[blankIndex]!;
  const tiles: (number | null)[] = seq.map((v, i) => (i === blankIndex ? null : v));
  return { tiles, blankIndex, answer };
}

// ── 패턴별 생성 함수 ─────────────────────────────────────────────────────────

function makeArithmetic(params: PatternGenParams): PatternSequence | null {
  const start = randInt(1, params.difficultyRange[0]);
  const diff  = randInt(1, params.difficultyRange[1]);
  const seq: number[] = [];
  for (let i = 0; i < params.length; i++) {
    seq.push(start + i * diff);
  }
  const { tiles, blankIndex, answer } = applyBlank(seq, params.blankPosition);
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { tiles, answer, choices, correctIndex, patternType: 'arithmetic', blankIndex };
}

function makeGeometric(params: PatternGenParams): PatternSequence | null {
  const start = randInt(1, Math.min(params.difficultyRange[0], 5));
  const ratio = randInt(2, Math.min(params.difficultyRange[1], 4));
  const seq: number[] = [];
  for (let i = 0; i < params.length; i++) {
    seq.push(start * Math.pow(ratio, i));
  }
  if (seq[seq.length - 1]! > 1000) return null;
  const { tiles, blankIndex, answer } = applyBlank(seq, params.blankPosition);
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { tiles, answer, choices, correctIndex, patternType: 'geometric', blankIndex };
}

function makeFibonacci(params: PatternGenParams): PatternSequence | null {
  const a = randInt(1, Math.min(params.difficultyRange[0], 8));
  const b = randInt(1, Math.min(params.difficultyRange[0], 8));
  const seq: number[] = [a, b];
  for (let i = 2; i < params.length; i++) {
    seq.push(seq[i - 1]! + seq[i - 2]!);
  }
  if (seq[seq.length - 1]! > 500) return null;
  const { tiles, blankIndex, answer } = applyBlank(seq, params.blankPosition);
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { tiles, answer, choices, correctIndex, patternType: 'fibonacci', blankIndex };
}

function makeSquare(params: PatternGenParams): PatternSequence | null {
  const startN = randInt(1, Math.min(params.difficultyRange[0], 7));
  const seq: number[] = [];
  for (let i = 0; i < params.length; i++) {
    seq.push((startN + i) * (startN + i));
  }
  const { tiles, blankIndex, answer } = applyBlank(seq, params.blankPosition);
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { tiles, answer, choices, correctIndex, patternType: 'square', blankIndex };
}

function makeAlternating(params: PatternGenParams): PatternSequence | null {
  const aStart = randInt(1, params.difficultyRange[0]);
  const aDiff  = randInt(1, params.difficultyRange[1]);
  const bStart = randInt(1, params.difficultyRange[0]);
  const bDiff  = randInt(1, params.difficultyRange[1]);
  const seq: number[] = [];
  for (let i = 0; i < params.length; i++) {
    if (i % 2 === 0) {
      seq.push(aStart + Math.floor(i / 2) * aDiff);
    } else {
      seq.push(bStart + Math.floor((i - 1) / 2) * bDiff);
    }
  }
  // 교대 패턴은 blankPosition을 항상 'end'로 고정
  const { tiles, blankIndex, answer } = applyBlank(seq, 'end');
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return { tiles, answer, choices, correctIndex, patternType: 'alternating', blankIndex };
}

// ── 공개 API ─────────────────────────────────────────────────────────────────

const MAX_TRIES = 30;

export function generatePatternSequence(params: PatternGenParams): PatternSequence {
  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const type = params.patternTypes[randInt(0, params.patternTypes.length - 1)]!;
    let result: PatternSequence | null = null;

    if (type === 'arithmetic')  result = makeArithmetic(params);
    else if (type === 'geometric')   result = makeGeometric(params);
    else if (type === 'fibonacci')   result = makeFibonacci(params);
    else if (type === 'square')      result = makeSquare(params);
    else if (type === 'alternating') result = makeAlternating(params);

    if (result !== null) return result;
  }

  // 폴백: 단순 등차수열 (start=2, diff=2)
  const fallbackSeq: number[] = [];
  for (let i = 0; i < params.length; i++) {
    fallbackSeq.push(2 + i * 2);
  }
  const answer = fallbackSeq[fallbackSeq.length - 1]!;
  const tiles: (number | null)[] = fallbackSeq.map((v, i) =>
    i === fallbackSeq.length - 1 ? null : v,
  );
  const { choices, correctIndex } = buildChoices(answer, params.distractorSpread);
  return {
    tiles,
    answer,
    choices,
    correctIndex,
    patternType: 'arithmetic',
    blankIndex: fallbackSeq.length - 1,
  };
}

export function calcPatternStars(
  correctCount: number,
  starThresholds: [number, number, number],
): number {
  if (correctCount >= starThresholds[2]) return 3;
  if (correctCount >= starThresholds[1]) return 2;
  if (correctCount >= starThresholds[0]) return 1;
  return 0;
}
