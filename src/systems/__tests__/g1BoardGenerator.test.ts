import { describe, it, expect } from 'vitest';
import { generateBoard } from '../g1BoardGenerator';
import { G1_LEVELS } from '@/game-data/g1Levels';

const ROWS = 5;
const COLS = 4;

function countSumTenPairs(board: number[][]): number {
  const flat = board.flat();
  // Count how many unordered pairs sum to 10 (greedy matching)
  const counts = new Map<number, number>();
  flat.forEach((n) => counts.set(n, (counts.get(n) ?? 0) + 1));
  let pairs = 0;
  for (const [n, cnt] of counts) {
    const partner = 10 - n;
    if (n === partner) {
      pairs += Math.floor(cnt / 2);
    } else if (n < partner) {
      const partnerCnt = counts.get(partner) ?? 0;
      pairs += Math.min(cnt, partnerCnt);
    }
  }
  return pairs;
}

function getAdjacentPairCount(board: number[][]): number {
  const counted = new Set<string>();
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const neighbours: Array<[number, number]> = [];
      if (r + 1 < ROWS) neighbours.push([r + 1, c]);
      if (c + 1 < COLS) neighbours.push([r, c + 1]);
      for (const [nr, nc] of neighbours) {
        const key = `${r},${c}-${nr},${nc}`;
        if (!counted.has(key) && board[r][c] + board[nr][nc] === 10) {
          counted.add(key);
          count++;
        }
      }
    }
  }
  return count;
}

describe('generateBoard', () => {
  it('returns a 5x4 board', () => {
    const board = generateBoard(G1_LEVELS[0]);
    expect(board.length).toBe(ROWS);
    board.forEach((row) => expect(row.length).toBe(COLS));
  });

  it('contains exactly 10 pairs summing to 10 for each level', () => {
    for (const level of G1_LEVELS) {
      const board = generateBoard(level);
      const pairs = countSumTenPairs(board);
      expect(pairs).toBe(10);
    }
  });

  it('level 1: has at least 5 adjacent pairs', () => {
    const level = G1_LEVELS[0];
    // Run multiple times since it uses randomness
    let passed = false;
    for (let i = 0; i < 10; i++) {
      const board = generateBoard(level);
      if (getAdjacentPairCount(board) >= level.adjacentPairGuarantee) {
        passed = true;
        break;
      }
    }
    expect(passed).toBe(true);
  });

  it('only uses allowed numbers for level 1', () => {
    const level = G1_LEVELS[0];
    const allowed = new Set(level.allowedNumbers);
    for (let i = 0; i < 5; i++) {
      const board = generateBoard(level);
      board.flat().forEach((n) => {
        expect(allowed.has(n)).toBe(true);
      });
    }
  });
});
