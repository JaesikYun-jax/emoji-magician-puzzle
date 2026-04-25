/**
 * creativityPuzzleGenerator.ts
 * 레벨 번호(1-based)에 따라 CreativityLevelConfig를 반환한다.
 *  - 레벨 1~10 : 미리 정의된 CREATIVITY_LEVELS
 *  - 레벨 11+  : 그리드 크기를 점진적으로 확대하여 자동 생성
 */

import { CREATIVITY_LEVELS, type CreativityLevelConfig } from '../../game-data/creativityLevels';
import { cellId } from './hamiltonianPath';

// ── 내부 헬퍼 ──────────────────────────────────────────────────────────────────

const DIRS = [
  { x: 0, y: -1 }, { x: 0, y: 1 },
  { x: -1, y: 0 }, { x: 1, y: 0 },
];

/** 레벨 번호 → 그리드 크기 */
function getDimensions(n: number): { cols: number; rows: number } {
  if (n <= 12) return { cols: 5, rows: 5 };
  if (n <= 16) return { cols: 6, rows: 5 };
  if (n <= 20) return { cols: 6, rows: 6 };
  if (n <= 25) return { cols: 7, rows: 5 };
  return { cols: 7, rows: 6 };
}

/** 레벨 번호 → 목표 블록 칸 수 */
function getTargetBlocked(n: number): number {
  if (n <= 10) return 0;
  return Math.min(Math.floor((n - 10) / 3), 5);
}

/** 시드 기반 xorshift 난수 생성기 */
function makeRng(seed: number): () => number {
  let s = (seed ^ 0x9e3779b9) >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
}

/**
 * Warnsdorff 휴리스틱 DFS로 해밀토니안 경로 존재 여부 판별.
 * 최대 호출 횟수 제한으로 대형 그리드에서도 빠르게 동작.
 */
function hasHamiltonianPath(
  cols: number,
  rows: number,
  blocked: Set<string>,
): boolean {
  const totalCells = cols * rows - blocked.size;
  if (totalCells <= 1) return true;

  const MAX_CALLS = 100_000;
  let calls = 0;
  let found = false;
  const visited = new Set<string>();

  function score(x: number, y: number): number {
    return DIRS.filter(d => {
      const nx = x + d.x, ny = y + d.y;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return false;
      const id = cellId(nx, ny);
      return !blocked.has(id) && !visited.has(id);
    }).length;
  }

  function dfs(x: number, y: number): void {
    if (found || ++calls > MAX_CALLS) return;
    const id = cellId(x, y);
    visited.add(id);
    if (visited.size === totalCells) { found = true; return; }

    const neighbors = DIRS
      .map(d => ({ x: x + d.x, y: y + d.y }))
      .filter(n =>
        n.x >= 0 && n.x < cols && n.y >= 0 && n.y < rows &&
        !blocked.has(cellId(n.x, n.y)) && !visited.has(cellId(n.x, n.y)),
      )
      .sort((a, b) => score(a.x, a.y) - score(b.x, b.y)); // 적은 이웃 먼저

    for (const n of neighbors) {
      dfs(n.x, n.y);
      if (found) return;
    }
    visited.delete(id);
  }

  // 모서리·가장자리 칸부터 탐색 시작 (더 빠르게 경로 발견)
  const starts: { x: number; y: number }[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!blocked.has(cellId(x, y))) starts.push({ x, y });
    }
  }
  starts.sort((a, b) => {
    const ea = +(a.x === 0) + +(a.x === cols - 1) + +(a.y === 0) + +(a.y === rows - 1);
    const eb = +(b.x === 0) + +(b.x === cols - 1) + +(b.y === 0) + +(b.y === rows - 1);
    return eb - ea;
  });

  for (const s of starts) {
    if (found || calls > MAX_CALLS) break;
    visited.clear();
    dfs(s.x, s.y);
  }
  return found;
}

/** 내부 칸(가장자리 제외)을 시드 기반으로 섞어 반환 */
function shuffledInner(
  cols: number, rows: number,
  rng: () => number,
): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = [];
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      cells.push({ x, y });
    }
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return cells;
}

// ── 퍼블릭 API ─────────────────────────────────────────────────────────────────

/**
 * 레벨 번호에 해당하는 CreativityLevelConfig 반환.
 * 레벨 1~10은 미리 정의된 CREATIVITY_LEVELS, 11 이상은 자동 생성.
 */
export function generateCreativityLevel(levelNum: number): CreativityLevelConfig {
  // 미리 정의된 레벨
  const predef = CREATIVITY_LEVELS.find(l => l.id === `creativity-${levelNum}`);
  if (predef) return { ...predef };

  const { cols, rows } = getDimensions(levelNum);
  const targetBlocked = getTargetBlocked(levelNum);
  const rng = makeRng(levelNum * 31337 + 0xcafe);

  let blocked: Array<{ x: number; y: number }> = [];

  if (targetBlocked > 0) {
    const candidates = shuffledInner(cols, rows, rng);
    for (let k = 0; k + targetBlocked <= candidates.length; k++) {
      const tryBlocked = candidates.slice(k, k + targetBlocked);
      const blockedSet = new Set(tryBlocked.map(c => cellId(c.x, c.y)));
      if (hasHamiltonianPath(cols, rows, blockedSet)) {
        blocked = tryBlocked;
        break;
      }
    }
    // 실패 시 blocked=[] → 항상 snake 경로로 풀 수 있음
  }

  const cellCount = cols * rows - blocked.length;
  const timeLimit = Math.max(60, Math.min(Math.round(cellCount * 8), 360));

  return {
    id: `creativity-${levelNum}`,
    subject: 'creativity',
    cols,
    rows,
    blocked,
    timeLimit,
    starThresholds: [timeLimit, Math.round(timeLimit * 0.6), Math.round(timeLimit * 0.35)],
  };
}
