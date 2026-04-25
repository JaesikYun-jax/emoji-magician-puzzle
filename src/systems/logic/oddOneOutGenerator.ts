import type {
  OddShape,
  OddOneOutProblem,
  OddOneOutLevelConfig,
  OddReason,
} from './oddOneOutTypes';
import type {
  MatrixShape,
  MatrixColor,
  MatrixSize,
  MatrixFill,
  MatrixRotation,
} from './matrixReasoningTypes';

const SHAPES: MatrixShape[] = ['circle', 'triangle', 'square', 'diamond', 'pentagon', 'star'];
const COLORS: MatrixColor[] = ['violet', 'sky', 'rose', 'amber', 'emerald'];
const SIZES: MatrixSize[] = ['sm', 'md', 'lg'];
const FILLS: MatrixFill[] = ['filled', 'outline'];
// rotation 기본 세트: 90° 단위 (나머지용)
const BASE_ROTATIONS: MatrixRotation[] = [0, 90, 180];
// 정답 rotation 후보: 45° 또는 135° (나머지와 구별됨)
const ODD_ROTATIONS: MatrixRotation[] = [45, 135];

// ── LCG 난수 생성기 ────────────────────────────────────────────

function makeLcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ── 내부 유틸 ──────────────────────────────────────────────────

function pickWith<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function differentValue<T>(pool: T[], current: T, rand: () => number): T {
  const others = pool.filter(v => v !== current);
  return pickWith(others, rand);
}

function shuffleWith<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── 공개 API ───────────────────────────────────────────────────

let _problemCounter = 0;

export function generateOddOneOutProblem(
  config: OddOneOutLevelConfig,
  seed?: number,
): OddOneOutProblem {
  const rand = seed !== undefined ? makeLcg(seed) : Math.random;
  const { shapeCount, allowedOddReasons, difficultyLevel } = config;
  const normalCount = shapeCount - 1;

  // 1. 기본 도형 속성 선택
  const baseShape: OddShape = {
    shape:     pickWith(SHAPES, rand),
    color:     pickWith(COLORS, rand),
    size:      pickWith(SIZES, rand),
    fill:      pickWith(FILLS, rand),
    rotation:  pickWith(BASE_ROTATIONS, rand),
    chirality: 'normal',
  };

  // 2. normalCount개 복사본 (rotation을 90° 단위로 다양하게)
  const normalShapes: OddShape[] = Array.from({ length: normalCount }, (_, i) => ({
    ...baseShape,
    rotation: BASE_ROTATIONS[i % BASE_ROTATIONS.length],
  }));

  // 3. oddReason 선택
  const oddReason: OddReason = pickWith(allowedOddReasons, rand);

  // 4. 정답 도형 생성: oddReason 속성만 변경
  const oddShape: OddShape = { ...baseShape };

  switch (oddReason) {
    case 'color':
      oddShape.color = differentValue(COLORS, baseShape.color, rand);
      break;

    case 'shape':
      oddShape.shape = differentValue(SHAPES, baseShape.shape, rand);
      break;

    case 'size':
      oddShape.size = differentValue(SIZES, baseShape.size, rand);
      break;

    case 'fill':
      oddShape.fill = baseShape.fill === 'filled' ? 'outline' : 'filled';
      break;

    case 'rotation':
      // 나머지는 90° 단위, 정답만 45° 또는 135°
      oddShape.rotation = pickWith(ODD_ROTATIONS, rand);
      break;

    case 'chirality':
      oddShape.chirality = 'mirrored';
      break;

    case 'compound': {
      // 두 속성 동시 변경
      type CompoundAttr = 'color' | 'shape' | 'size' | 'fill';
      const compoundPool: CompoundAttr[] = ['color', 'shape', 'size', 'fill'];
      const compoundAttrs = shuffleWith(compoundPool, rand).slice(0, 2);
      for (const attr of compoundAttrs) {
        switch (attr) {
          case 'color': oddShape.color = differentValue(COLORS, baseShape.color, rand); break;
          case 'shape': oddShape.shape = differentValue(SHAPES, baseShape.shape, rand); break;
          case 'size':  oddShape.size  = differentValue(SIZES,  baseShape.size,  rand); break;
          case 'fill':  oddShape.fill  = baseShape.fill === 'filled' ? 'outline' : 'filled'; break;
        }
      }
      break;
    }
  }

  // 5. 전체 배열 조합: normalShapes + oddShape 셔플 후 oddIndex 추적
  const allShapes = [...normalShapes, oddShape];
  const shuffled = shuffleWith(allShapes, rand);
  // oddShape가 shuffled의 어느 위치에 있는지 — rotation이 다를 수 있으므로
  // oddShape 참조 동일성으로 찾기 위해 인덱스 추적
  const oddIndex = shuffled.indexOf(oddShape);

  _problemCounter++;

  return {
    id: `odd-problem-${_problemCounter}`,
    shapes: shuffled,
    oddIndex,
    oddReason,
    difficultyLevel,
  };
}

export function calcOddOneOutStars(
  correct: number,
  thresholds: [number, number, number],
): number {
  if (correct >= thresholds[2]) return 3;
  if (correct >= thresholds[1]) return 2;
  if (correct >= thresholds[0]) return 1;
  return 0;
}
