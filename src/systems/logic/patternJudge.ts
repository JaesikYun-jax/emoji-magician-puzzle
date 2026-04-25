/**
 * patternJudge.ts
 * 논리 종목 - 도형 패턴 이어가기 게임 로직.
 *
 * 핵심 설계 원칙
 *   1. 모호한 정답 금지 — 모든 문제는 표시된 타일만으로 ONE 정답이 결정된다.
 *   2. 충분한 가시성 — 모든 패턴은 최소 1.5 사이클 이상 보여 규칙이 드러나도록 한다.
 *   3. 객관적 규칙만 — "복잡도 순서" 같은 주관적 규칙 사용 금지.
 *   4. 보기 3개는 항상 서로 다름 + 정답 포함.
 *
 * 패턴 유형 (period 기준 정렬):
 *   ab       — period 2: ABAB…       (2종 교대)
 *   abc      — period 3: ABCABC…     (3종 순환)
 *   abcd     — period 4: ABCDABCD…   (4종 순환)
 *   aabb     — period 4: AABB AABB…  (쌍 교대)
 *   aaab     — period 4: AAAB AAAB…  (3+1 비대칭)
 *   abba     — period 4: ABBA ABBA…  (대칭)
 *   aabbcc   — period 6: AABBCC…     (3종 쌍 교대, 깊이↑)
 *   abccba   — period 6: ABCCBA…     (3종 회문/팔린드롬, 깊이↑)
 */

export type ShapeKey = 'tri' | 'cir' | 'sqr' | 'dia';
export type ShapePatternType =
  | 'ab' | 'abc' | 'abcd'
  | 'aabb' | 'aaab' | 'abba'
  | 'aabbcc' | 'abccba';

// 하위 호환 alias
export type PatternType = ShapePatternType;

const SHAPE_KEYS: ShapeKey[] = ['tri', 'cir', 'sqr', 'dia'];

export interface LogicLevelConfig {
  id: string;
  subject: 'logic';
  totalRounds: number;
  timeLimit: number;
  genParams: LogicGenParams;
  starThresholds: [number, number, number]; // [1star, 2star, 3star] 최소 정답 수
}

export interface LogicGenParams {
  types: ShapePatternType[];
  /** @deprecated — 패턴 종류별로 필요한 최소 가시 사이클이 결정되므로 무시됨. 하위 호환을 위해 남겨둠. */
  sequenceLength?: number;
}

export interface ShapeSequence {
  tiles: (ShapeKey | null)[];  // null = ? 빈칸 (항상 마지막 1개)
  choices: ShapeKey[];         // 항상 길이 3, 모두 다른 ShapeKey, 정답 포함
  correctIndex: number;        // choices 내 정답 위치
  patternType: ShapePatternType;
  hint: string;
}

// 하위 호환 alias
export type LogicSequence = ShapeSequence;

// ── 내부 유틸 ──────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistinct(count: number, from: ShapeKey[] = SHAPE_KEYS): ShapeKey[] {
  if (count > from.length) {
    throw new Error(`pickDistinct: count ${count} > pool ${from.length}`);
  }
  return shuffle(from).slice(0, count);
}

/**
 * 보기 3개 생성.
 * 정답 외 나머지 3종에서 랜덤 2개 선택 → 항상 서로 다름, 정답 포함.
 * 주의: SHAPE_KEYS는 4종이므로 others는 항상 3종 — 안전.
 */
function makeChoices(answer: ShapeKey): { choices: ShapeKey[]; correctIndex: number } {
  const others = SHAPE_KEYS.filter(k => k !== answer);
  const [w1, w2] = shuffle(others);
  const choices = shuffle([answer, w1, w2]);
  return { choices, correctIndex: choices.indexOf(answer) };
}

// ── 패턴 정의 ──────────────────────────────────────────────────

interface PatternDef {
  /** 한 사이클 길이 */
  period: number;
  /** 사용하는 distinct 도형 수 */
  shapeCount: number;
  /**
   * 사이클 패턴 정의.
   * 입력: [shape0, shape1, ...] (shapeCount 개)
   * 출력: period 길이의 ShapeKey 배열 (한 사이클)
   */
  buildCycle: (shapes: ShapeKey[]) => ShapeKey[];
  /** 표시할 타일 개수 (가시성 보장: 최소 1 완전 사이클 + 사이클 시작이 한 번 더 보이는 정도) */
  visibleCount: number;
  hint: string;
}

const PATTERN_DEFS: Record<ShapePatternType, PatternDef> = {
  ab: {
    period: 2,
    shapeCount: 2,
    buildCycle: ([A, B]) => [A, B],
    visibleCount: 4, // ABAB → 2 사이클
    hint: '두 모양이 번갈아 나와요. 짝수번째와 홀수번째를 봐요!',
  },
  abc: {
    period: 3,
    shapeCount: 3,
    buildCycle: ([A, B, C]) => [A, B, C],
    visibleCount: 6, // ABCABC → 2 사이클
    hint: '세 모양이 1-2-3 순서로 반복돼요.',
  },
  abcd: {
    period: 4,
    shapeCount: 4,
    buildCycle: ([A, B, C, D]) => [A, B, C, D],
    visibleCount: 6, // ABCDAB → 1.5 사이클 (반복 시작이 한 번 더 보임)
    hint: '네 모양이 1-2-3-4 순서로 반복돼요.',
  },
  aabb: {
    period: 4,
    shapeCount: 2,
    buildCycle: ([A, B]) => [A, A, B, B],
    visibleCount: 6, // AABBAA → 1.5 사이클
    hint: '같은 모양 2개씩 짝지어 나와요. AA-BB-AA-BB.',
  },
  aaab: {
    period: 4,
    shapeCount: 2,
    buildCycle: ([A, B]) => [A, A, A, B],
    visibleCount: 6, // AAABAA → 1.5 사이클
    hint: '한 모양이 3번, 다른 모양이 1번씩 반복돼요.',
  },
  abba: {
    period: 4,
    shapeCount: 2,
    buildCycle: ([A, B]) => [A, B, B, A],
    visibleCount: 6, // ABBAAB → 1.5 사이클
    hint: '거울처럼 대칭이에요. ABBA - ABBA 처럼!',
  },
  aabbcc: {
    period: 6,
    shapeCount: 3,
    buildCycle: ([A, B, C]) => [A, A, B, B, C, C],
    visibleCount: 6, // AABBCC → 1 사이클 (다음에 또 A가 나옴이 명확)
    hint: '세 모양이 2개씩 차례로 나와요. AA-BB-CC-AA…',
  },
  abccba: {
    period: 6,
    shapeCount: 3,
    buildCycle: ([A, B, C]) => [A, B, C, C, B, A],
    visibleCount: 6, // ABCCBA → 1 사이클 (회문 후 다시 시작)
    hint: '거울처럼 대칭이에요. ABC 갔다가 CBA로 돌아와요.',
  },
};

// ── 패턴 생성기 ────────────────────────────────────────────────

function generateForType(type: ShapePatternType): ShapeSequence {
  const def = PATTERN_DEFS[type];
  const shapes = pickDistinct(def.shapeCount);
  const cycle = def.buildCycle(shapes);

  // 표시 타일들 (visibleCount 개)
  const tiles: (ShapeKey | null)[] = [];
  for (let i = 0; i < def.visibleCount; i++) {
    tiles.push(cycle[i % def.period]);
  }

  // ? 위치는 항상 visibleCount (마지막에 빈칸 1개 추가)
  const answer = cycle[def.visibleCount % def.period];
  tiles.push(null);

  const { choices, correctIndex } = makeChoices(answer);

  return {
    tiles,
    choices,
    correctIndex,
    patternType: type,
    hint: def.hint,
  };
}

// ── 공개 API ───────────────────────────────────────────────────

export function generateLogicSequence(params: LogicGenParams): ShapeSequence {
  if (!params.types || params.types.length === 0) {
    return generateForType('ab');
  }
  const type = params.types[Math.floor(Math.random() * params.types.length)];
  return generateForType(type);
}

export function judgeLogicAnswer(seq: ShapeSequence, selectedIndex: number): { correct: boolean } {
  return { correct: selectedIndex === seq.correctIndex };
}

export function calcLogicStars(correct: number, thresholds: [number, number, number]): number {
  if (correct >= thresholds[2]) return 3;
  if (correct >= thresholds[1]) return 2;
  if (correct >= thresholds[0]) return 1;
  return 0;
}

// 테스트/외부 도구에서 패턴 메타 조회용
export function getPatternMeta(type: ShapePatternType): { period: number; shapeCount: number; visibleCount: number } {
  const def = PATTERN_DEFS[type];
  return { period: def.period, shapeCount: def.shapeCount, visibleCount: def.visibleCount };
}
