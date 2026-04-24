import type { G1LevelData } from '@/game-data/g1Levels';

const ROWS = 5;
const COLS = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns list of pairs that sum to 10 using only numbers in allowedNumbers.
function buildPairs(allowedNumbers: number[]): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  // Level 1 uses [1,4,5,6,9]: pairs are (1+9)×3, (4+6)×3, (5+5)×2, plus 2 more
  // Level 2/3 use all 1-9: (1+9)×2,(2+8)×2,(3+7)×2,(4+6)×2,(5+5)×2 = 10 pairs
  const allowed = new Set(allowedNumbers);

  if (allowed.size <= 5) {
    // Level 1 style: use small set — produce exactly 10 pairs
    // (1+9)×3, (4+6)×3, (5+5)×2, (1+9)×1, (4+6)×1 per spec
    const template: Array<[number, number]> = [
      [1, 9], [1, 9], [1, 9], [1, 9],
      [4, 6], [4, 6], [4, 6], [4, 6],
      [5, 5], [5, 5],
    ];
    // Filter to only allowed numbers
    for (const [a, b] of template) {
      if (allowed.has(a) && allowed.has(b)) pairs.push([a, b]);
      if (pairs.length === 10) break;
    }
    // Pad if needed (shouldn't happen with level 1 data)
    while (pairs.length < 10) pairs.push([1, 9]);
  } else {
    // Level 2/3: 2 of each pair type
    const types: Array<[number, number]> = [[1,9],[2,8],[3,7],[4,6],[5,5]];
    for (const p of types) {
      pairs.push(p, [...p] as [number, number]);
    }
  }
  return pairs;
}

// Get neighbours of cell (r, c)
function neighbours(r: number, c: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  if (r > 0) result.push([r - 1, c]);
  if (r < ROWS - 1) result.push([r + 1, c]);
  if (c > 0) result.push([r, c - 1]);
  if (c < COLS - 1) result.push([r, c + 1]);
  return result;
}

// Count adjacent correct pairs on the board
function countAdjacentPairs(board: number[][]): number {
  let count = 0;
  const counted = new Set<string>();
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [nr, nc] of neighbours(r, c)) {
        const key = [Math.min(r * COLS + c, nr * COLS + nc), Math.max(r * COLS + c, nr * COLS + nc)].join(',');
        if (!counted.has(key) && board[r][c] + board[nr][nc] === 10) {
          counted.add(key);
          count++;
        }
      }
    }
  }
  return count;
}

// Place tiles so that `guarantee` pairs are adjacent.
// Strategy: place `guarantee` pairs as adjacent cells first, fill rest randomly.
function placeWithAdjacentGuarantee(tiles: number[], guarantee: number): number[][] {
  const board: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const totalCells = ROWS * COLS;
  const positions = shuffle(Array.from({ length: totalCells }, (_, i) => i));

  // Group tiles into pairs (index 0&1 form pair, 2&3 form pair, etc.)
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < tiles.length; i += 2) {
    pairs.push([tiles[i], tiles[i + 1]]);
  }

  const usedPositions = new Set<number>();
  let placedAdjacent = 0;

  // Place adjacent pairs first
  const shuffledPairs = shuffle(pairs.slice());
  for (const pair of shuffledPairs) {
    if (placedAdjacent >= guarantee) break;
    // Find a free cell and a free neighbour
    const freeCells = positions.filter((p) => !usedPositions.has(p));
    let placed = false;
    for (const pos of shuffle(freeCells)) {
      const r = Math.floor(pos / COLS);
      const c = pos % COLS;
      const freeNeighbours = neighbours(r, c).filter(([nr, nc]) => !usedPositions.has(nr * COLS + nc));
      if (freeNeighbours.length > 0) {
        const [nr, nc] = freeNeighbours[Math.floor(Math.random() * freeNeighbours.length)];
        board[r][c] = pair[0];
        board[nr][nc] = pair[1];
        usedPositions.add(pos);
        usedPositions.add(nr * COLS + nc);
        placedAdjacent++;
        placed = true;
        break;
      }
    }
    if (!placed) break; // can't place adjacent, give up for this pair
  }

  // Place remaining pairs in any free positions
  const remainingPairs = shuffledPairs.slice(placedAdjacent);
  const freePositions = shuffle(positions.filter((p) => !usedPositions.has(p)));
  let posIdx = 0;
  for (const pair of remainingPairs) {
    const r1 = Math.floor(freePositions[posIdx] / COLS);
    const c1 = freePositions[posIdx] % COLS;
    const r2 = Math.floor(freePositions[posIdx + 1] / COLS);
    const c2 = freePositions[posIdx + 1] % COLS;
    board[r1][c1] = pair[0];
    board[r2][c2] = pair[1];
    posIdx += 2;
  }

  return board;
}

export function generateBoard(levelData: G1LevelData): number[][] {
  const pairs = buildPairs(levelData.allowedNumbers);
  // Flatten pairs into tile array
  const tiles = pairs.flatMap((p) => [p[0], p[1]]);

  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const board = placeWithAdjacentGuarantee(shuffle(tiles), levelData.adjacentPairGuarantee);
    if (countAdjacentPairs(board) >= levelData.adjacentPairGuarantee) {
      return board;
    }
  }

  // Fallback: return best-effort board
  return placeWithAdjacentGuarantee(shuffle(tiles), 0);
}
