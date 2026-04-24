/**
 * hamiltonianPath.ts
 * 창의 종목 - 한붓그리기 게임 핵심 로직.
 *
 * 규칙:
 *  - 인접 4방향(상하좌우)만 이동 가능
 *  - 이미 방문한 칸 재방문 불가
 *  - blocked 칸 진입 불가
 *  - 모든 non-blocked 칸 방문 시 complete
 */

export interface GridCell {
  x: number; // col (0-based)
  y: number; // row (0-based)
}

export interface PathState {
  cols: number;
  rows: number;
  blocked: Set<string>;         // "x,y" 형태
  visited: string[];            // 방문 순서 (push/pop)
  visitedSet: Set<string>;      // 빠른 조회
  totalCells: number;           // blocked 제외 총 칸 수
}

export type MoveStatus = 'continue' | 'invalid' | 'complete';

export interface MoveResult {
  state: PathState;
  status: MoveStatus;
}

/** cellId: "x,y" 형태 */
export function cellId(x: number, y: number): string {
  return `${x},${y}`;
}

export function parseCell(id: string): GridCell {
  const [x, y] = id.split(',').map(Number);
  return { x, y };
}

/** 초기 상태 생성 */
export function createPathState(
  cols: number,
  rows: number,
  blocked: GridCell[],
): PathState {
  const blockedSet = new Set(blocked.map(c => cellId(c.x, c.y)));
  const totalCells = cols * rows - blockedSet.size;
  return {
    cols,
    rows,
    blocked: blockedSet,
    visited: [],
    visitedSet: new Set(),
    totalCells,
  };
}

/** 인접 여부 확인 (4방향) */
export function isAdjacent(a: GridCell, b: GridCell): boolean {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/** 이동 시도 */
export function tryMove(state: PathState, cell: GridCell): MoveResult {
  const id = cellId(cell.x, cell.y);

  // 범위 밖
  if (cell.x < 0 || cell.x >= state.cols || cell.y < 0 || cell.y >= state.rows) {
    return { state, status: 'invalid' };
  }
  // 블록 칸
  if (state.blocked.has(id)) {
    return { state, status: 'invalid' };
  }
  // 이미 방문
  if (state.visitedSet.has(id)) {
    return { state, status: 'invalid' };
  }

  // 첫 번째 칸이 아니면 인접 확인
  if (state.visited.length > 0) {
    const last = parseCell(state.visited[state.visited.length - 1]);
    if (!isAdjacent(last, cell)) {
      return { state, status: 'invalid' };
    }
  }

  const newVisited = [...state.visited, id];
  const newSet = new Set(state.visitedSet);
  newSet.add(id);

  const newState: PathState = {
    ...state,
    visited: newVisited,
    visitedSet: newSet,
  };

  const status: MoveStatus =
    newVisited.length === state.totalCells ? 'complete' : 'continue';

  return { state: newState, status };
}

/** 되돌아가기 (마지막 방문 칸 취소) */
export function undoMove(state: PathState): PathState {
  if (state.visited.length === 0) return state;
  const newVisited = state.visited.slice(0, -1);
  const newSet = new Set(newVisited);
  return { ...state, visited: newVisited, visitedSet: newSet };
}

/** 모든 칸 방문 여부 */
export function isAllCellsVisited(state: PathState): boolean {
  return state.visited.length === state.totalCells;
}

/** 현재 위치에서 갈 수 있는 칸 목록 */
export function getAvailableNeighbors(state: PathState): GridCell[] {
  if (state.visited.length === 0) return [];
  const last = parseCell(state.visited[state.visited.length - 1]);
  const dirs = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
  return dirs
    .map(d => ({ x: last.x + d.x, y: last.y + d.y }))
    .filter(c =>
      c.x >= 0 && c.x < state.cols &&
      c.y >= 0 && c.y < state.rows &&
      !state.blocked.has(cellId(c.x, c.y)) &&
      !state.visitedSet.has(cellId(c.x, c.y))
    );
}

/** 별 점수 계산 (시간 기반) */
export function calcCreativityStars(timeUsed: number, timeLimit: number): number {
  const ratio = timeUsed / timeLimit;
  if (ratio <= 0.40) return 3;
  if (ratio <= 0.70) return 2;
  return 1;
}
