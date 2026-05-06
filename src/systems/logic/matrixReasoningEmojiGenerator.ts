import type {
  EmojiCell,
  EmojiCategory,
  EmojiPatternKind,
  MatrixCell,
  MatrixLevelConfig,
  MatrixProblem,
} from './matrixReasoningTypes';
import { EMOJI_POOL, ALL_CATEGORIES } from './matrixReasoningEmojiPool';
import {
  type Rand,
  shuffleWith,
  pickWith,
  pickN,
} from './matrixReasoningRandom';

let _problemCounter = 0;

function makeEmojiCell(emoji: string, category: EmojiCategory, count?: 1 | 2 | 3): EmojiCell {
  const c: EmojiCell = { kind: 'emoji', emoji, category };
  if (count !== undefined) c.count = count;
  return c;
}

function emojiCellsEqual(a: EmojiCell, b: EmojiCell): boolean {
  return a.emoji === b.emoji && a.category === b.category && (a.count ?? 1) === (b.count ?? 1);
}

// ── 패턴별 빌더: 9 또는 4 셀과 정답 셀을 반환 ────────────────────

interface BuildResult {
  cells: EmojiCell[];      // 길이 = gridSize²
  answer: EmojiCell;       // = cells[last]
  patternKind: EmojiPatternKind;
}

function buildCategoryCycle(
  gridSize: 2 | 3,
  categories: EmojiCategory[],
  rand: Rand,
): BuildResult {
  // 각 행이 한 카테고리, 행마다 다른 카테고리 (행 → 카테고리 매핑)
  const cats = pickN(categories, gridSize, rand);
  const cells: EmojiCell[] = [];
  for (let row = 0; row < gridSize; row++) {
    const cat = cats[row];
    const emojis = pickN(EMOJI_POOL[cat], gridSize, rand);
    for (let col = 0; col < gridSize; col++) {
      cells.push(makeEmojiCell(emojis[col], cat));
    }
  }
  return { cells, answer: cells[cells.length - 1], patternKind: 'category-cycle' };
}

function buildSequenceShift(
  gridSize: 2 | 3,
  categories: EmojiCategory[],
  rand: Rand,
): BuildResult {
  // 한 카테고리에서 N개 이모지를 픽 → 행마다 한 칸씩 시프트
  const cat = pickWith(categories, rand);
  const seq = pickN(EMOJI_POOL[cat], gridSize, rand);
  const cells: EmojiCell[] = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const idx = (col + row) % gridSize;
      cells.push(makeEmojiCell(seq[idx], cat));
    }
  }
  return { cells, answer: cells[cells.length - 1], patternKind: 'sequence-shift' };
}

function buildCountProgression(
  gridSize: 2 | 3,
  categories: EmojiCategory[],
  rand: Rand,
): BuildResult {
  // 행마다 개수가 1→2→3 (gridSize=3) 또는 1→2 (gridSize=2). 같은 카테고리, 행마다 다른 이모지
  const cat = pickWith(categories, rand);
  const emojis = pickN(EMOJI_POOL[cat], gridSize, rand);
  const cells: EmojiCell[] = [];
  for (let row = 0; row < gridSize; row++) {
    const count = (row + 1) as 1 | 2 | 3;
    for (let col = 0; col < gridSize; col++) {
      cells.push(makeEmojiCell(emojis[col], cat, count));
    }
  }
  return { cells, answer: cells[cells.length - 1], patternKind: 'count-progression' };
}

function buildOddCompletion(
  gridSize: 2 | 3,
  categories: EmojiCategory[],
  rand: Rand,
): BuildResult {
  // 모든 셀이 같은 카테고리 + 같은 이모지 (가장 단순한 입문)
  const cat = pickWith(categories, rand);
  const emoji = pickWith(EMOJI_POOL[cat], rand);
  const total = gridSize * gridSize;
  const cells: EmojiCell[] = Array.from({ length: total }, () => makeEmojiCell(emoji, cat));
  return { cells, answer: cells[total - 1], patternKind: 'odd-completion' };
}

function pickPattern(patterns: EmojiPatternKind[], rand: Rand): EmojiPatternKind {
  return pickWith(patterns, rand);
}

function dispatchPattern(
  patternKind: EmojiPatternKind,
  gridSize: 2 | 3,
  categories: EmojiCategory[],
  rand: Rand,
): BuildResult {
  switch (patternKind) {
    case 'category-cycle':    return buildCategoryCycle(gridSize, categories, rand);
    case 'sequence-shift':    return buildSequenceShift(gridSize, categories, rand);
    case 'count-progression': return buildCountProgression(gridSize, categories, rand);
    case 'odd-completion':    return buildOddCompletion(gridSize, categories, rand);
  }
}

// ── 오답 보기 생성 ───────────────────────────────────────────────

function buildEmojiDistractors(
  answer: EmojiCell,
  patternKind: EmojiPatternKind,
  cellsBeforeAnswer: EmojiCell[],
  choiceCount: 3 | 4,
  rand: Rand,
): EmojiCell[] {
  const wrongs: EmojiCell[] = [];
  const need = choiceCount - 1;

  // 후보 풀: 같은 카테고리의 다른 이모지 (약 오답) + 다른 카테고리 풀 (강 오답)
  const sameCatPool = EMOJI_POOL[answer.category]
    .filter(e => e !== answer.emoji)
    .map(e => makeEmojiCell(e, answer.category, answer.count));

  const otherCats = ALL_CATEGORIES.filter(c => c !== answer.category);
  const otherCatPool: EmojiCell[] = [];
  for (const c of otherCats) {
    for (const e of EMOJI_POOL[c]) {
      otherCatPool.push(makeEmojiCell(e, c, answer.count));
    }
  }

  // count-progression일 때 count가 다른 오답도 추가
  const wrongCountPool: EmojiCell[] = [];
  if (patternKind === 'count-progression' && answer.count !== undefined) {
    const wrongCounts: (1 | 2 | 3)[] = ([1, 2, 3] as (1 | 2 | 3)[]).filter(c => c !== answer.count);
    for (const wc of wrongCounts) {
      wrongCountPool.push(makeEmojiCell(answer.emoji, answer.category, wc));
    }
  }

  const allCandidates = [
    ...shuffleWith(wrongCountPool, rand),
    ...shuffleWith(sameCatPool, rand),
    ...shuffleWith(otherCatPool, rand),
  ];

  for (const cand of allCandidates) {
    if (wrongs.length >= need) break;
    if (emojiCellsEqual(cand, answer)) continue;
    if (wrongs.some(w => emojiCellsEqual(w, cand))) continue;
    // 셀 중에 이미 노출된 이모지는 약한 오답 단서이므로 우선 제외 (대신 충분한 풀에서 픽)
    if (cellsBeforeAnswer.some(c => c.emoji === cand.emoji && c.category === cand.category && (c.count ?? 1) === (cand.count ?? 1))) {
      // 이미 노출된 셀이라도 다른 후보가 부족할 때 fallback
      continue;
    }
    wrongs.push(cand);
  }

  // 부족하면 노출된 셀이라도 채움
  if (wrongs.length < need) {
    for (const cand of allCandidates) {
      if (wrongs.length >= need) break;
      if (emojiCellsEqual(cand, answer)) continue;
      if (wrongs.some(w => emojiCellsEqual(w, cand))) continue;
      wrongs.push(cand);
    }
  }

  return wrongs;
}

// ── 공개 API ──────────────────────────────────────────────────

export function generateEmojiProblem(
  config: MatrixLevelConfig,
  rand: Rand,
): MatrixProblem {
  const opts = config.emojiOpts;
  if (!opts) {
    throw new Error('generateEmojiProblem: emojiOpts is required');
  }
  const { gridSize, choiceCount, difficultyLevel } = config;
  const patternKind = pickPattern(opts.patterns, rand);
  const built = dispatchPattern(patternKind, gridSize, opts.categories, rand);

  const totalCells = gridSize * gridSize;
  const cellsBeforeAnswer = built.cells.slice(0, totalCells - 1);
  const cells: (MatrixCell | null)[] = [...cellsBeforeAnswer, null];

  const wrongs = buildEmojiDistractors(built.answer, patternKind, cellsBeforeAnswer, choiceCount, rand);
  const allChoices: EmojiCell[] = [built.answer, ...wrongs];
  const shuffled = shuffleWith(allChoices, rand);
  const correctIndex = shuffled.findIndex(c => emojiCellsEqual(c, built.answer));

  _problemCounter++;
  return {
    id: `matrix-emoji-${_problemCounter}`,
    cellKind: 'emoji',
    gridSize,
    cells,
    choices: shuffled as MatrixCell[],
    correctIndex,
    patternMeta: { kind: patternKind },
    difficultyLevel,
  };
}
