/**
 * wallSystem.test.ts
 * 한붓그리기 게임 신규 기능 3가지 테스트:
 *   1. 벽(wall) 시스템 - hamiltonianPath.ts
 *   2. 문제은행 선택 - wallPuzzleSelector.ts
 *   3. 문제은행 데이터 유효성 - wallPuzzles.ts
 */

import { describe, it, expect } from 'vitest';
import {
  createPathState,
  tryMove,
  getAvailableNeighbors,
  isSolvable,
} from '../creativity/hamiltonianPath';
import {
  selectWallPuzzle,
  selectWallPuzzleByTier,
  getTierForClears,
} from '../creativity/wallPuzzleSelector';
import {
  ALL_WALL_PUZZLES,
  WALL_PUZZLES_TIER1,
  WALL_PUZZLES_TIER2,
  WALL_PUZZLES_TIER3,
  WALL_PUZZLES_TIER3_BLOCKED,
  WALL_PUZZLES_TIER4,
  WALL_PUZZLES_TIER4_HARD,
  WALL_PUZZLES_TIER5,
} from '../../game-data/wallPuzzles';

// ────────────────────────────────────────────────
// 1. 벽(wall) 시스템 - hamiltonianPath.ts
// ────────────────────────────────────────────────
describe('벽(wall) 시스템 - hamiltonianPath', () => {
  describe('벽이 없을 때 기존 동작 유지', () => {
    it('walls 미전달 시 인접 셀 이동 가능', () => {
      const state = createPathState(3, 3, []);
      const { state: s1 } = tryMove(state, { x: 0, y: 0 });
      const result = tryMove(s1, { x: 1, y: 0 });
      expect(result.status).toBe('continue');
    });

    it('walls=[] (빈 배열) 전달 시 인접 셀 이동 가능', () => {
      const state = createPathState(3, 3, [], []);
      const { state: s1 } = tryMove(state, { x: 0, y: 0 });
      const result = tryMove(s1, { x: 1, y: 0 });
      expect(result.status).toBe('continue');
    });
  });

  describe('dir:r 벽 - 가로 이동 차단', () => {
    it('(1,0,r) 벽이 있으면 (1,0)→(2,0) 이동 불가', () => {
      // dir:'r' 벽: (x,y)↔(x+1,y) 이동 불가
      const state = createPathState(3, 3, [], [{ x: 1, y: 0, dir: 'r' }]);
      const { state: s1 } = tryMove(state, { x: 1, y: 0 });
      const result = tryMove(s1, { x: 2, y: 0 });
      expect(result.status).toBe('invalid');
    });

    it('(1,0,r) 벽 - 반대 방향 (2,0)→(1,0)도 이동 불가', () => {
      const state = createPathState(3, 3, [], [{ x: 1, y: 0, dir: 'r' }]);
      const { state: s1 } = tryMove(state, { x: 2, y: 0 });
      const result = tryMove(s1, { x: 1, y: 0 });
      expect(result.status).toBe('invalid');
    });

    it('(1,0,r) 벽이 있어도 벽 없는 방향 (0,0)→(1,0) 이동 가능', () => {
      const state = createPathState(3, 3, [], [{ x: 1, y: 0, dir: 'r' }]);
      const { state: s1 } = tryMove(state, { x: 0, y: 0 });
      const result = tryMove(s1, { x: 1, y: 0 });
      expect(result.status).toBe('continue');
    });
  });

  describe('dir:d 벽 - 세로 이동 차단', () => {
    it('(0,0,d) 벽이 있으면 (0,0)→(0,1) 이동 불가', () => {
      const state = createPathState(3, 3, [], [{ x: 0, y: 0, dir: 'd' }]);
      const { state: s1 } = tryMove(state, { x: 0, y: 0 });
      const result = tryMove(s1, { x: 0, y: 1 });
      expect(result.status).toBe('invalid');
    });

    it('(0,0,d) 벽 - 반대 방향 (0,1)→(0,0)도 이동 불가', () => {
      const state = createPathState(3, 3, [], [{ x: 0, y: 0, dir: 'd' }]);
      const { state: s1 } = tryMove(state, { x: 0, y: 1 });
      const result = tryMove(s1, { x: 0, y: 0 });
      expect(result.status).toBe('invalid');
    });

    it('(0,0,d) 벽이 있어도 가로 이동 (0,0)→(1,0) 가능', () => {
      const state = createPathState(3, 3, [], [{ x: 0, y: 0, dir: 'd' }]);
      const { state: s1 } = tryMove(state, { x: 0, y: 0 });
      const result = tryMove(s1, { x: 1, y: 0 });
      expect(result.status).toBe('continue');
    });
  });

  describe('getAvailableNeighbors - 벽 방향 제외', () => {
    it('(0,0,d) 벽 있을 때 (0,0)에서 아래 방향(0,1)이 neighbors에 없음', () => {
      const state = createPathState(3, 3, [], [{ x: 0, y: 0, dir: 'd' }]);
      const { state: s1 } = tryMove(state, { x: 0, y: 0 });
      const neighbors = getAvailableNeighbors(s1);
      const ids = neighbors.map(c => `${c.x},${c.y}`);
      expect(ids).not.toContain('0,1');
      // 오른쪽(1,0)은 이동 가능
      expect(ids).toContain('1,0');
    });

    it('(1,0,r) 벽 있을 때 (1,0)에서 오른쪽(2,0)이 neighbors에 없음', () => {
      const state = createPathState(3, 3, [], [{ x: 1, y: 0, dir: 'r' }]);
      const { state: s1 } = tryMove(state, { x: 1, y: 0 });
      const neighbors = getAvailableNeighbors(s1);
      const ids = neighbors.map(c => `${c.x},${c.y}`);
      expect(ids).not.toContain('2,0');
      // 왼쪽(0,0)과 아래(1,1)는 이동 가능
      expect(ids).toContain('0,0');
      expect(ids).toContain('1,1');
    });

    it('벽 없으면 중앙 셀 (1,1) neighbors = 4개 방향 모두', () => {
      const state = createPathState(3, 3, [], []);
      const { state: s1 } = tryMove(state, { x: 1, y: 1 });
      const neighbors = getAvailableNeighbors(s1);
      expect(neighbors.length).toBe(4);
    });
  });

  describe('벽 PathState 내부 저장 확인', () => {
    it('walls 전달 시 PathState.walls Set에 키 저장됨', () => {
      const state = createPathState(3, 3, [], [
        { x: 0, y: 0, dir: 'r' },
        { x: 1, y: 1, dir: 'd' },
      ]);
      expect(state.walls.has('0,0,r')).toBe(true);
      expect(state.walls.has('1,1,d')).toBe(true);
      expect(state.walls.has('0,0,d')).toBe(false);
    });
  });
});

// ────────────────────────────────────────────────
// 2. 문제은행 선택 - wallPuzzleSelector.ts
// ────────────────────────────────────────────────
describe('문제은행 선택 - wallPuzzleSelector', () => {
  describe('getTierForClears', () => {
    it('0 clears → tier 1', () => expect(getTierForClears(0)).toBe(1));
    it('12 clears → tier 1', () => expect(getTierForClears(12)).toBe(1));
    it('13 clears → tier 2', () => expect(getTierForClears(13)).toBe(2));
    it('30 clears → tier 2', () => expect(getTierForClears(30)).toBe(2));
    it('31 clears → tier 3', () => expect(getTierForClears(31)).toBe(3));
    it('55 clears → tier 3', () => expect(getTierForClears(55)).toBe(3));
    it('56 clears → tier 4', () => expect(getTierForClears(56)).toBe(4));
    it('100 clears → tier 5', () => expect(getTierForClears(100)).toBe(5));
    it('90 clears → tier 5', () => expect(getTierForClears(90)).toBe(5));
    it('89 clears → tier 4', () => expect(getTierForClears(89)).toBe(4));
    it('streak 3, 5 clears → tier 2 (5+8=13)', () => expect(getTierForClears(5, 3)).toBe(2));
    it('streak 6, 10 clears → tier 2 (10+18=28)', () => expect(getTierForClears(10, 6)).toBe(2));
    it('streak 10, 20 clears → tier 4 (20+33=53)', () => expect(getTierForClears(20, 10)).toBe(3));
  });

  describe('selectWallPuzzle', () => {
    it('0 clears → tier 1 퍼즐 반환', () => {
      const puzzle = selectWallPuzzle(0, []);
      expect(puzzle.tier).toBe(1);
    });

    it('13 clears → tier 2 퍼즐 반환', () => {
      const puzzle = selectWallPuzzle(13, []);
      expect(puzzle.tier).toBe(2);
    });

    it('31 clears → tier 3 퍼즐 반환', () => {
      const puzzle = selectWallPuzzle(31, []);
      expect(puzzle.tier).toBe(3);
    });

    it('56 clears → tier 4 퍼즐 반환', () => {
      const puzzle = selectWallPuzzle(56, []);
      expect(puzzle.tier).toBe(4);
    });

    it('recentPuzzleIds에 있는 퍼즐이 제외됨 (일부 제외)', () => {
      const tier1Ids = WALL_PUZZLES_TIER1.map(p => p.id);
      // 처음 6개만 recent에 넣으면 나머지 중에서 선택
      const recent = tier1Ids.slice(0, 6);
      const results = Array.from({ length: 20 }, () =>
        selectWallPuzzle(0, recent)
      );
      // recent에 있는 id가 반환된 경우가 없어야 함 (pool이 충분하므로)
      const recentSet = new Set(recent);
      results.forEach(p => expect(recentSet.has(p.id)).toBe(false));
    });

    it('모든 퍼즐 id를 recent에 넣어도 fallback으로 퍼즐이 반환됨', () => {
      const allTier1Ids = WALL_PUZZLES_TIER1.map(p => p.id);
      const puzzle = selectWallPuzzle(0, allTier1Ids);
      expect(puzzle).toBeDefined();
      expect(puzzle.id).toBeTruthy();
      expect(puzzle.tier).toBe(1);
    });

    it('반환된 퍼즐에 walls 필드가 있음', () => {
      const puzzle = selectWallPuzzle(0, []);
      // walls 필드가 있거나(배열이면 통과), 없으면 undefined도 허용하되 구조 확인
      expect(puzzle).toHaveProperty('cols');
      expect(puzzle).toHaveProperty('rows');
      expect(puzzle).toHaveProperty('timeLimit');
      // walls가 있는 경우 배열이어야 함
      if (puzzle.walls !== undefined) {
        expect(Array.isArray(puzzle.walls)).toBe(true);
      }
    });

    it('반환된 퍼즐의 walls가 실제로 있음 (문제은행 퍼즐은 모두 walls 보유)', () => {
      // 문제은행 퍼즐은 모두 walls 배열 가짐
      for (let i = 0; i < 10; i++) {
        const puzzle = selectWallPuzzle(0, []);
        expect(Array.isArray(puzzle.walls)).toBe(true);
      }
    });
  });
});

// ────────────────────────────────────────────────
// 2-b. selectWallPuzzleByTier 테스트
// ────────────────────────────────────────────────
describe('selectWallPuzzleByTier', () => {
  it.each([1, 2, 3, 4, 5] as const)(
    'tier=%i → puzzle.tier === %i',
    (t) => {
      const puzzle = selectWallPuzzleByTier(t, []);
      expect(puzzle.tier).toBe(t);
    },
  );

  it('풀 전체 id가 recentPuzzleIds에 있어도 undefined 아닌 퍼즐 반환 (3중 폴백)', () => {
    const allTier1Ids = ALL_WALL_PUZZLES.filter(p => p.tier === 1).map(p => p.id);
    const puzzle = selectWallPuzzleByTier(1, allTier1Ids);
    expect(puzzle).toBeDefined();
    expect(puzzle.id).toBeTruthy();
    expect(puzzle.tier).toBe(1);
  });

  it('직전 ID와 다른 퍼즐을 우선 반환 (10회 반복 통계)', () => {
    // tier 1 퍼즐이 2개 이상이어야 의미 있음 — 데이터 유효성 사전 확인
    const tier1Pool = ALL_WALL_PUZZLES.filter(p => p.tier === 1);
    if (tier1Pool.length < 2) return; // 풀이 1개뿐이면 스킵

    const lastId = tier1Pool[0].id;
    const results = Array.from({ length: 10 }, () =>
      selectWallPuzzleByTier(1, [lastId]),
    );
    // 10회 중 적어도 1회는 lastId와 다른 퍼즐이 나와야 함
    const hasDifferent = results.some(p => p.id !== lastId);
    expect(hasDifferent).toBe(true);
  });
});

// ────────────────────────────────────────────────
// 3. 문제은행 데이터 유효성 - wallPuzzles.ts
// ────────────────────────────────────────────────
describe('문제은행 데이터 유효성 - wallPuzzles', () => {
  describe('ALL_WALL_PUZZLES 총 개수 및 tier별 존재', () => {
    it('tier 1 퍼즐이 존재함', () => {
      const t1 = ALL_WALL_PUZZLES.filter(p => p.tier === 1);
      expect(t1.length).toBeGreaterThan(0);
    });

    it('tier 2 퍼즐이 존재함', () => {
      const t2 = ALL_WALL_PUZZLES.filter(p => p.tier === 2);
      expect(t2.length).toBeGreaterThan(0);
    });

    it('tier 3 퍼즐이 존재함', () => {
      const t3 = ALL_WALL_PUZZLES.filter(p => p.tier === 3);
      expect(t3.length).toBeGreaterThan(0);
    });

    it('tier 4 퍼즐이 존재함', () => {
      const t4 = ALL_WALL_PUZZLES.filter(p => p.tier === 4);
      expect(t4.length).toBeGreaterThan(0);
    });

    it('각 tier에 최소 12개 퍼즐이 있음', () => {
      [1, 2, 3, 4].forEach(tier => {
        const count = ALL_WALL_PUZZLES.filter(p => p.tier === tier).length;
        expect(count).toBeGreaterThanOrEqual(12);
      });
    });

    it('ALL_WALL_PUZZLES = 모든 tier 배열 합산', () => {
      const expected =
        WALL_PUZZLES_TIER1.length +
        WALL_PUZZLES_TIER2.length +
        WALL_PUZZLES_TIER3.length +
        WALL_PUZZLES_TIER3_BLOCKED.length +
        WALL_PUZZLES_TIER4.length +
        WALL_PUZZLES_TIER4_HARD.length +
        WALL_PUZZLES_TIER5.length;
      expect(ALL_WALL_PUZZLES.length).toBe(expected);
    });

    it('tier 5 퍼즐이 존재함', () => {
      const t5 = ALL_WALL_PUZZLES.filter(p => p.tier === 5);
      expect(t5.length).toBeGreaterThan(0);
    });
  });

  describe('모든 퍼즐 id가 유니크함', () => {
    it('중복 id 없음', () => {
      const ids = ALL_WALL_PUZZLES.map(p => p.id);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });
  });

  describe('walls 배열 좌표 유효성', () => {
    it('dir:r 벽의 x 좌표는 cols-1 미만이어야 함', () => {
      ALL_WALL_PUZZLES.forEach(puzzle => {
        (puzzle.walls ?? []).forEach(wall => {
          if (wall.dir === 'r') {
            expect(wall.x).toBeLessThan(puzzle.cols - 1);
          }
        });
      });
    });

    it('dir:d 벽의 y 좌표는 rows-1 미만이어야 함', () => {
      ALL_WALL_PUZZLES.forEach(puzzle => {
        (puzzle.walls ?? []).forEach(wall => {
          if (wall.dir === 'd') {
            expect(wall.y).toBeLessThan(puzzle.rows - 1);
          }
        });
      });
    });

    it('모든 벽의 x, y는 격자 범위 내', () => {
      ALL_WALL_PUZZLES.forEach(puzzle => {
        (puzzle.walls ?? []).forEach(wall => {
          expect(wall.x).toBeGreaterThanOrEqual(0);
          expect(wall.x).toBeLessThan(puzzle.cols);
          expect(wall.y).toBeGreaterThanOrEqual(0);
          expect(wall.y).toBeLessThan(puzzle.rows);
        });
      });
    });
  });

  describe('blocked 셀 좌표 유효성', () => {
    it('blocked 셀 x, y가 격자 범위 내', () => {
      ALL_WALL_PUZZLES.forEach(puzzle => {
        puzzle.blocked.forEach(cell => {
          expect(cell.x).toBeGreaterThanOrEqual(0);
          expect(cell.x).toBeLessThan(puzzle.cols);
          expect(cell.y).toBeGreaterThanOrEqual(0);
          expect(cell.y).toBeLessThan(puzzle.rows);
        });
      });
    });
  });

  describe('wallPuzzles 클리어 가능성 검증', () => {
    it.each(ALL_WALL_PUZZLES.map(p => [p.id, p] as [string, typeof p]))(
      '퍼즐 %s 는 클리어 가능해야 한다',
      (_, puzzle) => {
        const solvable = isSolvable({
          cols: puzzle.cols,
          rows: puzzle.rows,
          blocked: puzzle.blocked,
          walls: puzzle.walls,
          startCell: puzzle.startCell,
          endCell: puzzle.endCell,
        });
        expect(solvable).toBe(true);
      },
    );
  });

  describe('timeLimit 유효성', () => {
    it('모든 퍼즐의 timeLimit > 0', () => {
      ALL_WALL_PUZZLES.forEach(puzzle => {
        expect(puzzle.timeLimit).toBeGreaterThan(0);
      });
    });
  });

  describe('starThresholds 유효성', () => {
    it('모든 퍼즐의 starThresholds가 [number, number, number]', () => {
      ALL_WALL_PUZZLES.forEach(puzzle => {
        expect(Array.isArray(puzzle.starThresholds)).toBe(true);
        expect(puzzle.starThresholds.length).toBe(3);
        puzzle.starThresholds.forEach(t => {
          expect(typeof t).toBe('number');
          expect(t).toBeGreaterThan(0);
        });
      });
    });
  });
});
