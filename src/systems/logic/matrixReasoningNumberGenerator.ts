import type {
  NumberCell,
  NumberPatternKind,
  MatrixCell,
  MatrixLevelConfig,
  MatrixProblem,
} from './matrixReasoningTypes';
import { type Rand, shuffleWith, pickWith } from './matrixReasoningRandom';

let _problemCounter = 0;

function makeNumCell(value: number): NumberCell {
  return { kind: 'number', value };
}

function randInt(min: number, max: number, rand: Rand): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

interface BuildResult {
  cells: NumberCell[];
  answer: NumberCell;
  patternKind: NumberPatternKind;
}

// 모든 셀이 valueRange 내에 들어오도록 base/d/factor를 조정. 기본 검증 후 폴백 시도.
function fitsRange(cells: NumberCell[], range: [number, number]): boolean {
  return cells.every(c => c.value >= range[0] && c.value <= range[1] && Number.isInteger(c.value));
}

function buildArithRow(
  gridSize: 3,
  range: [number, number],
  rand: Rand,
  isSubtract = false,
): BuildResult {
  // 각 행이 다른 시작값과 동일/유사한 공차로 등차
  for (let attempt = 0; attempt < 50; attempt++) {
    const d = isSubtract ? -randInt(1, 5, rand) : randInt(1, 5, rand);
    const cells: NumberCell[] = [];
    for (let row = 0; row < gridSize; row++) {
      const a = isSubtract
        ? randInt(range[0] + Math.abs(d) * (gridSize - 1), range[1], rand)
        : randInt(range[0], range[1] - d * (gridSize - 1), rand);
      for (let col = 0; col < gridSize; col++) {
        cells.push(makeNumCell(a + col * d));
      }
    }
    if (fitsRange(cells, range)) {
      return { cells, answer: cells[cells.length - 1], patternKind: 'arith-row' };
    }
  }
  // fallback: 단순한 작은 값
  const cells: NumberCell[] = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells.push(makeNumCell((row + 1) + col));
    }
  }
  return { cells, answer: cells[cells.length - 1], patternKind: 'arith-row' };
}

function buildArithCol(
  gridSize: 3,
  range: [number, number],
  rand: Rand,
): BuildResult {
  for (let attempt = 0; attempt < 50; attempt++) {
    const d = randInt(1, 5, rand);
    const cells: NumberCell[] = new Array(gridSize * gridSize);
    let ok = true;
    for (let col = 0; col < gridSize; col++) {
      const a = randInt(range[0], range[1] - d * (gridSize - 1), rand);
      for (let row = 0; row < gridSize; row++) {
        cells[row * gridSize + col] = makeNumCell(a + row * d);
      }
    }
    if (fitsRange(cells, range)) {
      return { cells, answer: cells[cells.length - 1], patternKind: 'arith-col' };
    }
    if (!ok) continue;
  }
  const cells: NumberCell[] = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells.push(makeNumCell(row + (col + 1) * 2));
    }
  }
  return { cells, answer: cells[cells.length - 1], patternKind: 'arith-col' };
}

function buildArithBoth(
  gridSize: 3,
  range: [number, number],
  rand: Rand,
): BuildResult {
  for (let attempt = 0; attempt < 50; attempt++) {
    const dCol = randInt(1, 4, rand);
    const dRow = randInt(1, 4, rand);
    const base = randInt(range[0], range[1] - dCol * (gridSize - 1) - dRow * (gridSize - 1), rand);
    const cells: NumberCell[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        cells.push(makeNumCell(base + row * dRow + col * dCol));
      }
    }
    if (fitsRange(cells, range)) {
      return { cells, answer: cells[cells.length - 1], patternKind: 'arith-both' };
    }
  }
  return buildArithRow(gridSize, range, rand);
}

function buildMultiplication(
  gridSize: 3,
  range: [number, number],
  rand: Rand,
): BuildResult {
  for (let attempt = 0; attempt < 50; attempt++) {
    const rowFactors = Array.from({ length: gridSize }, () => randInt(2, 9, rand));
    const colFactors = Array.from({ length: gridSize }, () => randInt(2, 9, rand));
    const cells: NumberCell[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        cells.push(makeNumCell(rowFactors[row] * colFactors[col]));
      }
    }
    if (fitsRange(cells, range)) {
      return { cells, answer: cells[cells.length - 1], patternKind: 'multiplication' };
    }
  }
  // fallback
  const cells: NumberCell[] = [];
  const rowF = [2, 3, 4];
  const colF = [2, 3, 4];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      cells.push(makeNumCell(rowF[row] * colF[col]));
    }
  }
  return { cells, answer: cells[cells.length - 1], patternKind: 'multiplication' };
}

function buildSumCorner(
  gridSize: 3,
  range: [number, number],
  rand: Rand,
): BuildResult {
  for (let attempt = 0; attempt < 50; attempt++) {
    const rowVals = Array.from({ length: gridSize }, () => randInt(1, Math.floor(range[1] / 2), rand));
    const colVals = Array.from({ length: gridSize }, () => randInt(1, Math.floor(range[1] / 2), rand));
    const cells: NumberCell[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        cells.push(makeNumCell(rowVals[row] + colVals[col]));
      }
    }
    if (fitsRange(cells, range)) {
      return { cells, answer: cells[cells.length - 1], patternKind: 'sum-corner' };
    }
  }
  return buildArithRow(gridSize, range, rand);
}

function buildGeometric(
  gridSize: 3,
  range: [number, number],
  rand: Rand,
  ratio: 2 | 3,
): BuildResult {
  for (let attempt = 0; attempt < 50; attempt++) {
    const cells: NumberCell[] = [];
    let ok = true;
    for (let row = 0; row < gridSize; row++) {
      const maxStart = Math.floor(range[1] / Math.pow(ratio, gridSize - 1));
      if (maxStart < range[0]) { ok = false; break; }
      const a = randInt(range[0], Math.max(range[0], maxStart), rand);
      for (let col = 0; col < gridSize; col++) {
        cells.push(makeNumCell(a * Math.pow(ratio, col)));
      }
    }
    if (ok && fitsRange(cells, range)) {
      return { cells, answer: cells[cells.length - 1], patternKind: 'geometric' };
    }
  }
  // fallback: 안전한 작은 값
  const cells: NumberCell[] = [];
  for (let row = 0; row < gridSize; row++) {
    const a = row + 2;
    for (let col = 0; col < gridSize; col++) {
      cells.push(makeNumCell(a * Math.pow(ratio, col)));
    }
  }
  return { cells, answer: cells[cells.length - 1], patternKind: 'geometric' };
}

function dispatchPattern(
  patternKind: NumberPatternKind,
  gridSize: 3,
  range: [number, number],
  rand: Rand,
): BuildResult {
  switch (patternKind) {
    case 'arith-row':       return buildArithRow(gridSize, range, rand);
    case 'arith-col':       return buildArithCol(gridSize, range, rand);
    case 'arith-both':      return buildArithBoth(gridSize, range, rand);
    case 'multiplication':  return buildMultiplication(gridSize, range, rand);
    case 'sum-corner':      return buildSumCorner(gridSize, range, rand);
    case 'geometric':       return buildGeometric(gridSize, range, rand, rand() < 0.5 ? 2 : 3);
  }
}

// ── 오답 보기 생성 ───────────────────────────────────────────────

function buildNumberDistractors(
  answer: NumberCell,
  range: [number, number],
  cellsBeforeAnswer: NumberCell[],
  choiceCount: 3 | 4,
  rand: Rand,
): NumberCell[] {
  const need = choiceCount - 1;
  const wrongs: NumberCell[] = [];
  // 후보: 정답 ±1, ±2, ±3, ±10, 그리고 cells 안의 일부 값
  const offsets = [1, -1, 2, -2, 3, -3, 10, -10, 5, -5, 4, -4];
  const cellValues = cellsBeforeAnswer.map(c => c.value).filter(v => v !== answer.value);
  const candidates: number[] = [];
  for (const off of shuffleWith(offsets, rand)) {
    candidates.push(answer.value + off);
  }
  for (const v of shuffleWith(cellValues, rand)) {
    candidates.push(v);
  }

  for (const v of candidates) {
    if (wrongs.length >= need) break;
    if (v === answer.value) continue;
    if (!Number.isInteger(v)) continue;
    if (v < 0) continue;            // 음수 금지
    if (v > range[1] * 2) continue; // 너무 큰 수 금지
    if (wrongs.some(w => w.value === v)) continue;
    wrongs.push(makeNumCell(v));
  }

  // 부족하면 정답 주변 ±N 으로 채움
  let extra = 1;
  while (wrongs.length < need && extra < 30) {
    const cand = answer.value + extra;
    if (cand !== answer.value && cand >= 0 && !wrongs.some(w => w.value === cand)) {
      wrongs.push(makeNumCell(cand));
    }
    extra++;
  }

  return wrongs;
}

// ── 공개 API ──────────────────────────────────────────────────

export function generateNumberProblem(
  config: MatrixLevelConfig,
  rand: Rand,
): MatrixProblem {
  const opts = config.numberOpts;
  if (!opts) {
    throw new Error('generateNumberProblem: numberOpts is required');
  }
  const { gridSize, choiceCount, difficultyLevel } = config;
  if (gridSize !== 3) {
    throw new Error('generateNumberProblem: only gridSize=3 is supported');
  }
  const patternKind = pickWith(opts.patterns, rand);
  const built = dispatchPattern(patternKind, gridSize, opts.valueRange, rand);

  const totalCells = gridSize * gridSize;
  const cellsBeforeAnswer = built.cells.slice(0, totalCells - 1);
  const cells: (MatrixCell | null)[] = [...cellsBeforeAnswer, null];

  const wrongs = buildNumberDistractors(built.answer, opts.valueRange, cellsBeforeAnswer, choiceCount, rand);
  const allChoices: NumberCell[] = [built.answer, ...wrongs];
  const shuffled = shuffleWith(allChoices, rand);
  const correctIndex = shuffled.findIndex(c => c.value === built.answer.value);

  _problemCounter++;
  return {
    id: `matrix-number-${_problemCounter}`,
    cellKind: 'number',
    gridSize,
    cells,
    choices: shuffled as MatrixCell[],
    correctIndex,
    patternMeta: { kind: patternKind },
    difficultyLevel,
  };
}
