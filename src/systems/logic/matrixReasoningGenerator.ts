import type {
  MatrixShape,
  MatrixColor,
  MatrixSize,
  MatrixFill,
  MatrixRotation,
  MatrixCell,
  MatrixProblem,
  MatrixLevelConfig,
  ActiveAttribute,
} from './matrixReasoningTypes';

const SHAPES: MatrixShape[] = ['circle', 'triangle', 'square', 'diamond', 'pentagon', 'star'];
const COLORS: MatrixColor[] = ['violet', 'sky', 'rose', 'amber', 'emerald'];
const SIZES: MatrixSize[] = ['sm', 'md', 'lg'];
const FILLS: MatrixFill[] = ['filled', 'outline'];
const ROTATIONS: MatrixRotation[] = [0, 45, 90, 135, 180];

// ── 재현 가능한 LCG 난수 생성기 ────────────────────────────────

function makeLcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ── 내부 유틸 ──────────────────────────────────────────────────

function shuffleWith<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickWith<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function cellsEqual(a: MatrixCell, b: MatrixCell): boolean {
  return (
    a.shape === b.shape &&
    a.color === b.color &&
    a.size === b.size &&
    a.fill === b.fill &&
    a.rotation === b.rotation
  );
}

function differentValue<T>(pool: T[], current: T, rand: () => number): T {
  const others = pool.filter(v => v !== current);
  return pickWith(others, rand);
}

// 속성 이름 → 셔플된 순환 시퀀스 생성
function buildSeq(attr: ActiveAttribute, rand: () => number): unknown[] {
  switch (attr) {
    case 'shape':    return shuffleWith(SHAPES, rand).slice(0, 3);
    case 'color':    return shuffleWith(COLORS, rand).slice(0, 3);
    case 'size':     return shuffleWith(SIZES, rand);
    case 'fill':     return shuffleWith(FILLS, rand);
    case 'rotation': return shuffleWith(ROTATIONS, rand).slice(0, 3);
  }
}

// ── 공개 API ───────────────────────────────────────────────────

let _problemCounter = 0;

export function generateMatrixProblem(
  config: MatrixLevelConfig,
  seed?: number,
): MatrixProblem {
  const rand = seed !== undefined ? makeLcg(seed) : Math.random;
  const { gridSize, activeAttributes, choiceCount, difficultyLevel } = config;

  // 기본 셀 (비활성 속성의 고정값)
  const baseCell: MatrixCell = {
    shape:    pickWith(SHAPES, rand),
    color:    pickWith(COLORS, rand),
    size:     pickWith(SIZES, rand),
    fill:     pickWith(FILLS, rand),
    rotation: pickWith(ROTATIONS, rand),
  };

  // 방향별 속성 시퀀스 사전 계산 (col방향/row방향/대각방향)
  const colSeq  = activeAttributes[0] ? buildSeq(activeAttributes[0], rand) : null;
  const rowSeq  = activeAttributes[1] ? buildSeq(activeAttributes[1], rand) : null;
  const diagSeq = activeAttributes[2] ? buildSeq(activeAttributes[2], rand) : null;

  const totalCells = gridSize * gridSize;
  const cells: (MatrixCell | null)[] = [];

  for (let pos = 0; pos < totalCells; pos++) {
    const row = Math.floor(pos / gridSize);
    const col = pos % gridSize;

    const cell: MatrixCell = { ...baseCell };

    if (activeAttributes[0] && colSeq) {
      const attr = activeAttributes[0];
      (cell as unknown as Record<string, unknown>)[attr] = colSeq[col % colSeq.length];
    }
    if (activeAttributes[1] && rowSeq) {
      const attr = activeAttributes[1];
      (cell as unknown as Record<string, unknown>)[attr] = rowSeq[row % rowSeq.length];
    }
    if (activeAttributes[2] && diagSeq) {
      const attr = activeAttributes[2];
      (cell as unknown as Record<string, unknown>)[attr] = diagSeq[(row + col) % diagSeq.length];
    }

    cells.push(cell);
  }

  // 정답 셀 (우하단) 추출 후 null로 교체
  const answerCell = cells[totalCells - 1] as MatrixCell;
  cells[totalCells - 1] = null;

  // ── 오답 보기 생성 ─────────────────────────────────────────
  const wrongCells: MatrixCell[] = [];
  const attrsForWrong: ActiveAttribute[] =
    activeAttributes.length > 0 ? activeAttributes : ['shape'];

  let attempts = 0;
  while (wrongCells.length < choiceCount - 1 && attempts < 200) {
    attempts++;
    const attrToChange = pickWith(attrsForWrong, rand);
    const candidate: MatrixCell = { ...answerCell };

    switch (attrToChange) {
      case 'shape':
        candidate.shape = differentValue(SHAPES, answerCell.shape, rand);
        break;
      case 'color':
        candidate.color = differentValue(COLORS, answerCell.color, rand);
        break;
      case 'size':
        candidate.size = differentValue(SIZES, answerCell.size, rand);
        break;
      case 'fill':
        candidate.fill = differentValue(FILLS, answerCell.fill, rand);
        break;
      case 'rotation':
        candidate.rotation = differentValue(ROTATIONS, answerCell.rotation, rand);
        break;
    }

    const isDup =
      cellsEqual(candidate, answerCell) ||
      wrongCells.some(w => cellsEqual(w, candidate));
    if (!isDup) {
      wrongCells.push(candidate);
    }
  }

  // 보기 배열 셔플 후 correctIndex 확정
  const allChoices = [answerCell, ...wrongCells];
  const shuffled = shuffleWith(allChoices, rand);
  const correctIndex = shuffled.findIndex(c => cellsEqual(c, answerCell));

  _problemCounter++;

  return {
    id: `matrix-problem-${_problemCounter}`,
    gridSize,
    cells,
    choices: shuffled,
    correctIndex,
    activeAttributes,
    difficultyLevel,
  };
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
