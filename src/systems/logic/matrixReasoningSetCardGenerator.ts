import type {
  SetCardCell,
  SetColor,
  SetShape,
  SetCount,
  SetCardRule,
  SetCardPatternConfig,
  MatrixCell,
  MatrixLevelConfig,
  MatrixProblem,
} from './matrixReasoningTypes';
import { type Rand, shuffleWith, pickWith } from './matrixReasoningRandom';

let _problemCounter = 0;

const COLORS: SetColor[] = ['red', 'green', 'blue'];
const SHAPES: SetShape[] = ['circle', 'square', 'triangle'];
const COUNTS: SetCount[] = [1, 2, 3];

function makeCard(color: SetColor, shape: SetShape, count: SetCount): SetCardCell {
  return { kind: 'setcard', color, shape, count };
}

function cardsEqual(a: SetCardCell, b: SetCardCell): boolean {
  return a.color === b.color && a.shape === b.shape && a.count === b.count;
}

// ── 룰 검증 ─────────────────────────────────────────────────────

export function isValidSetCardLine(
  cells: SetCardCell[],
  rules: SetCardPatternConfig,
): boolean {
  if (cells.length !== 3) return false;
  const checks: { rule: SetCardRule; values: (string | number)[] }[] = [
    { rule: rules.colorRule, values: cells.map(c => c.color) },
    { rule: rules.shapeRule, values: cells.map(c => c.shape) },
    { rule: rules.countRule, values: cells.map(c => c.count) },
  ];
  for (const { rule, values } of checks) {
    const unique = new Set(values).size;
    if (rule === 'all-same' && unique !== 1) return false;
    if (rule === 'all-diff' && unique !== 3) return false;
  }
  return true;
}

// ── 룰 생성 ─────────────────────────────────────────────────────

function pickRules(activeCount: 1 | 2 | 3, rand: Rand): SetCardPatternConfig {
  const attrs: Array<'colorRule' | 'shapeRule' | 'countRule'> = ['colorRule', 'shapeRule', 'countRule'];
  const shuffled = shuffleWith(attrs, rand);
  const diffSet = new Set(shuffled.slice(0, activeCount));
  return {
    colorRule: diffSet.has('colorRule') ? 'all-diff' : 'all-same',
    shapeRule: diffSet.has('shapeRule') ? 'all-diff' : 'all-same',
    countRule: diffSet.has('countRule') ? 'all-diff' : 'all-same',
  };
}

// ── 그리드 생성 (Latin Square 기반) ────────────────────────────

function buildAttributeGrid<T>(rule: SetCardRule, pool: readonly T[], rand: Rand): T[] {
  if (rule === 'all-same') {
    const v = pickWith([...pool], rand);
    return new Array(9).fill(v);
  }
  // all-diff: 3x3 Latin Square — perm[(r+c) % 3]
  const perm = shuffleWith([...pool], rand);
  const grid: T[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      grid.push(perm[(r + c) % 3]);
    }
  }
  return grid;
}

function buildCells(rules: SetCardPatternConfig, rand: Rand): SetCardCell[] {
  const colorGrid = buildAttributeGrid<SetColor>(rules.colorRule, COLORS, rand);
  const shapeGrid = buildAttributeGrid<SetShape>(rules.shapeRule, SHAPES, rand);
  const countGrid = buildAttributeGrid<SetCount>(rules.countRule, COUNTS, rand);
  const cells: SetCardCell[] = [];
  for (let i = 0; i < 9; i++) {
    cells.push(makeCard(colorGrid[i], shapeGrid[i], countGrid[i]));
  }
  return cells;
}

// ── 오답 보기 생성 ───────────────────────────────────────────────

function buildSetCardDistractors(
  answer: SetCardCell,
  rules: SetCardPatternConfig,
  choiceCount: 3 | 4,
  rand: Rand,
): SetCardCell[] {
  // 정답에서 1개 속성만 변경하면 룰 위반 → 강력한 오답
  const candidates: SetCardCell[] = [];
  for (const color of COLORS) {
    for (const shape of SHAPES) {
      for (const count of COUNTS) {
        const cand = makeCard(color, shape, count);
        if (cardsEqual(cand, answer)) continue;
        candidates.push(cand);
      }
    }
  }

  // 단순 셔플 후 룰 위반하는 것만 골라서 픽
  const shuffled = shuffleWith(candidates, rand);
  const wrongs: SetCardCell[] = [];
  for (const cand of shuffled) {
    if (wrongs.length >= choiceCount - 1) break;
    if (cardsEqual(cand, answer)) continue;
    if (wrongs.some(w => cardsEqual(w, cand))) continue;
    // 정답 행을 시뮬레이션하여 룰 위반 여부 확인 — 후보가 마지막 행 셀로 들어갔을 때 행이 invalid해야 강한 오답
    // 그러나 단순화: 정답이 아닌 모든 카드는 자동으로 어떤 행/열 룰을 위반함 (정답이 유일하므로)
    wrongs.push(cand);
  }
  return wrongs;
}

// ── 정답 유일성 검증용 헬퍼 ─────────────────────────────────────

function findValidAnswers(
  cells: SetCardCell[],
  rules: SetCardPatternConfig,
): SetCardCell[] {
  // cells[0..7] 가 주어진 상태에서 cells[8]에 들어갈 수 있는 모든 후보 검증
  const valid: SetCardCell[] = [];
  for (const color of COLORS) {
    for (const shape of SHAPES) {
      for (const count of COUNTS) {
        const cand = makeCard(color, shape, count);
        const filled = [...cells.slice(0, 8), cand];
        const lastRow = filled.slice(6, 9);
        const lastCol = [filled[2], filled[5], filled[8]];
        if (isValidSetCardLine(lastRow, rules) && isValidSetCardLine(lastCol, rules)) {
          valid.push(cand);
        }
      }
    }
  }
  return valid;
}

// ── 공개 API ──────────────────────────────────────────────────

export function generateSetCardProblem(
  config: MatrixLevelConfig,
  rand: Rand,
): MatrixProblem {
  const opts = config.setcardOpts;
  if (!opts) {
    throw new Error('generateSetCardProblem: setcardOpts is required');
  }
  const { gridSize, choiceCount, difficultyLevel } = config;
  if (gridSize !== 3) {
    throw new Error('generateSetCardProblem: only gridSize=3 is supported');
  }

  const rules = pickRules(opts.activeAttributeCount, rand);
  const built = buildCells(rules, rand);
  const answer = built[8];

  const cells: (MatrixCell | null)[] = [...built.slice(0, 8), null];
  const wrongs = buildSetCardDistractors(answer, rules, choiceCount, rand);
  const allChoices: SetCardCell[] = [answer, ...wrongs];
  const shuffled = shuffleWith(allChoices, rand);
  const correctIndex = shuffled.findIndex(c => cardsEqual(c, answer));

  _problemCounter++;
  return {
    id: `matrix-setcard-${_problemCounter}`,
    cellKind: 'setcard',
    gridSize,
    cells,
    choices: shuffled as MatrixCell[],
    correctIndex,
    patternMeta: {
      kind: 'setcard',
      description: `color:${rules.colorRule},shape:${rules.shapeRule},count:${rules.countRule}`,
    },
    difficultyLevel,
  };
}

// 내부 헬퍼 export (테스트용)
export const _internals = { findValidAnswers, buildCells, pickRules };
