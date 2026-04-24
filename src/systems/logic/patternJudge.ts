/**
 * patternJudge.ts
 * 논리 종목 - 패턴 이어가기 게임 로직.
 * 패턴 유형: arithmetic(등차), geometric(등비), fibonacci(피보나치), square(제곱수), alternating(교대)
 */

export type PatternType = 'arithmetic' | 'geometric' | 'fibonacci' | 'square' | 'alternating';

export interface LogicLevelConfig {
  id: string;
  subject: 'logic';
  totalRounds: number;
  timeLimit: number;
  genParams: LogicGenParams;
  starThresholds: [number, number, number]; // [1star, 2star, 3star] 최소 정답 수
}

export interface LogicGenParams {
  types: PatternType[];         // 이 레벨에서 나올 수 있는 패턴 유형
  sequenceLength: number;       // 시퀀스 총 길이 (? 제외)
  choiceCount: 3 | 4;          // 보기 수
  maxValue: number;             // 시퀀스 값 최대
}

export interface LogicSequence {
  tiles: (number | null)[];     // null = ? (빈칸)
  choices: number[];
  correctIndex: number;
  patternType: PatternType;
}

/**
 * 패턴 시퀀스 생성
 */
export function generateLogicSequence(params: LogicGenParams): LogicSequence {
  const type = params.types[Math.floor(Math.random() * params.types.length)];
  const len = params.sequenceLength + 1; // 표시할 길이 + 정답 1개

  let full: number[] = [];

  if (type === 'arithmetic') {
    const start = Math.floor(Math.random() * 5) + 1;
    const diff = Math.floor(Math.random() * 4) + 1;
    full = Array.from({ length: len }, (_, i) => start + diff * i);
  } else if (type === 'geometric') {
    const start = Math.floor(Math.random() * 3) + 1;
    const ratio = Math.floor(Math.random() * 2) + 2; // 2 or 3
    full = Array.from({ length: len }, (_, i) => start * Math.pow(ratio, i));
    // 너무 크면 다시
    if (full[full.length - 1] > params.maxValue) {
      return generateLogicSequence({ ...params, types: params.types.filter(t => t !== 'geometric').length > 0 ? params.types.filter(t => t !== 'geometric') : ['arithmetic'] });
    }
  } else if (type === 'fibonacci') {
    const a = Math.floor(Math.random() * 3) + 1;
    const b = Math.floor(Math.random() * 3) + 1;
    full = [a, b];
    for (let i = 2; i < len; i++) {
      full.push(full[i-1] + full[i-2]);
    }
    if (full[full.length - 1] > params.maxValue) {
      return generateLogicSequence({ ...params, types: ['arithmetic'] });
    }
  } else if (type === 'square') {
    const start = Math.floor(Math.random() * 3) + 1;
    full = Array.from({ length: len }, (_, i) => (start + i) * (start + i));
    if (full[full.length - 1] > params.maxValue) {
      return generateLogicSequence({ ...params, types: ['arithmetic'] });
    }
  } else {
    // alternating: 두 등차수열이 번갈아
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 5;
    const da = Math.floor(Math.random() * 3) + 1;
    const db = Math.floor(Math.random() * 3) + 1;
    full = Array.from({ length: len }, (_, i) => {
      if (i % 2 === 0) return a + da * Math.floor(i / 2);
      return b + db * Math.floor(i / 2);
    });
  }

  const answer = full[full.length - 1];
  const tiles: (number | null)[] = [...full.slice(0, -1), null];

  // 보기 생성 (정답 + 오답 (choiceCount-1)개)
  const wrongs = new Set<number>();
  while (wrongs.size < params.choiceCount - 1) {
    const delta = Math.floor(Math.random() * 8) + 1;
    const wrong = Math.random() < 0.5 ? answer + delta : Math.max(1, answer - delta);
    if (wrong !== answer) wrongs.add(wrong);
  }

  const choices = shuffle([answer, ...Array.from(wrongs)]);
  const correctIndex = choices.indexOf(answer);

  return { tiles, choices, correctIndex, patternType: type };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 정답 판정
 */
export function judgeLogicAnswer(seq: LogicSequence, selectedIndex: number): { correct: boolean } {
  return { correct: selectedIndex === seq.correctIndex };
}

/**
 * 별 점수 계산
 */
export function calcLogicStars(correct: number, thresholds: [number, number, number]): number {
  if (correct >= thresholds[2]) return 3;
  if (correct >= thresholds[1]) return 2;
  if (correct >= thresholds[0]) return 1;
  return 0;
}
