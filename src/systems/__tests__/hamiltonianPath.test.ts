import { describe, it, expect } from 'vitest';
import {
  createPathState,
  tryMove,
  undoMove,
  isAdjacent,
  getAvailableNeighbors,
  calcCreativityStars,
  type GridCell,
} from '../creativity/hamiltonianPath';

describe('createPathState', () => {
  it('3x3 grid, blocked 없음 -> totalCells=9, visited=[], visitedSet.size=0', () => {
    const state = createPathState(3, 3, []);
    expect(state.totalCells).toBe(9);
    expect(state.visited).toEqual([]);
    expect(state.visitedSet.size).toBe(0);
  });

  it('3x3, blocked=[{x:1,y:1}] -> totalCells=8', () => {
    const state = createPathState(3, 3, [{ x: 1, y: 1 }]);
    expect(state.totalCells).toBe(8);
  });
});

describe('tryMove', () => {
  it('빈 상태에서 첫 번째 칸 (0,0) 이동 -> status=continue, visited=[0,0]', () => {
    const state = createPathState(3, 3, []);
    const result = tryMove(state, { x: 0, y: 0 });
    expect(result.status).toBe('continue');
    expect(result.state.visited).toEqual(['0,0']);
  });

  it('첫 번째 이후 인접한 칸 (1,0) 이동 -> status=continue', () => {
    const state = createPathState(3, 3, []);
    const { state: s1 } = tryMove(state, { x: 0, y: 0 });
    const result = tryMove(s1, { x: 1, y: 0 });
    expect(result.status).toBe('continue');
  });

  it('인접하지 않은 칸 (2,2) 이동 (첫 번째 이동 후) -> status=invalid', () => {
    const state = createPathState(3, 3, []);
    const { state: s1 } = tryMove(state, { x: 0, y: 0 });
    const result = tryMove(s1, { x: 2, y: 2 });
    expect(result.status).toBe('invalid');
  });

  it('범위 밖 (-1,0) -> status=invalid', () => {
    const state = createPathState(3, 3, []);
    const result = tryMove(state, { x: -1, y: 0 });
    expect(result.status).toBe('invalid');
  });

  it('blocked 칸 -> status=invalid', () => {
    const blocked: GridCell[] = [{ x: 1, y: 0 }];
    const state = createPathState(3, 3, blocked);
    const { state: s1 } = tryMove(state, { x: 0, y: 0 });
    const result = tryMove(s1, { x: 1, y: 0 });
    expect(result.status).toBe('invalid');
  });

  it('이미 방문한 칸 -> status=invalid', () => {
    const state = createPathState(3, 3, []);
    const { state: s1 } = tryMove(state, { x: 0, y: 0 });
    const result = tryMove(s1, { x: 0, y: 0 });
    expect(result.status).toBe('invalid');
  });

  it('2x1 grid, 두 칸 모두 방문 -> status=complete', () => {
    const state = createPathState(2, 1, []);
    const { state: s1 } = tryMove(state, { x: 0, y: 0 });
    const result = tryMove(s1, { x: 1, y: 0 });
    expect(result.status).toBe('complete');
  });
});

describe('undoMove', () => {
  it("visited=['0,0','1,0'] -> undo -> visited=['0,0']", () => {
    const state = createPathState(3, 3, []);
    const { state: s1 } = tryMove(state, { x: 0, y: 0 });
    const { state: s2 } = tryMove(s1, { x: 1, y: 0 });
    expect(s2.visited).toEqual(['0,0', '1,0']);

    const undone = undoMove(s2);
    expect(undone.visited).toEqual(['0,0']);
  });

  it('빈 상태에서 undo -> 변화 없음', () => {
    const state = createPathState(3, 3, []);
    const undone = undoMove(state);
    expect(undone.visited).toEqual([]);
    expect(undone.visitedSet.size).toBe(0);
  });
});

describe('isAdjacent', () => {
  it('(0,0)-(1,0) -> true', () => {
    expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 0 })).toBe(true);
  });

  it('(0,0)-(0,1) -> true', () => {
    expect(isAdjacent({ x: 0, y: 0 }, { x: 0, y: 1 })).toBe(true);
  });

  it('(0,0)-(1,1) -> false (대각선)', () => {
    expect(isAdjacent({ x: 0, y: 0 }, { x: 1, y: 1 })).toBe(false);
  });

  it('(0,0)-(2,0) -> false', () => {
    expect(isAdjacent({ x: 0, y: 0 }, { x: 2, y: 0 })).toBe(false);
  });
});

describe('getAvailableNeighbors', () => {
  it('3x3 grid에서 (1,1) 위치의 neighbors -> 4개 방향 중 visited/blocked 제외', () => {
    const state = createPathState(3, 3, []);
    // (1,1)로 이동하기 위해 먼저 (1,0)에서 (1,1)로 이동
    const { state: s1 } = tryMove(state, { x: 1, y: 0 });
    const { state: s2 } = tryMove(s1, { x: 1, y: 1 });

    const neighbors = getAvailableNeighbors(s2);
    // (1,1)의 4방향 이웃: (0,1), (2,1), (1,0)visited, (1,2)
    // (1,0)은 이미 방문했으므로 제외 -> 3개
    const neighborIds = neighbors.map(c => `${c.x},${c.y}`);
    expect(neighborIds).not.toContain('1,0'); // 방문한 칸 제외
    expect(neighbors.length).toBe(3);
    expect(neighborIds).toContain('0,1');
    expect(neighborIds).toContain('2,1');
    expect(neighborIds).toContain('1,2');
  });
});

describe('calcCreativityStars', () => {
  it('timeUsed=10, timeLimit=60 -> ratio=0.167 -> 3stars (<=0.40)', () => {
    expect(calcCreativityStars(10, 60)).toBe(3);
  });

  it('timeUsed=30, timeLimit=60 -> ratio=0.50 -> 2stars (<=0.70)', () => {
    expect(calcCreativityStars(30, 60)).toBe(2);
  });

  it('timeUsed=50, timeLimit=60 -> ratio=0.833 -> 1star (>0.70)', () => {
    expect(calcCreativityStars(50, 60)).toBe(1);
  });
});
