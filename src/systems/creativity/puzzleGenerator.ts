/**
 * puzzleGenerator.ts
 * 플레이어 레벨 기반 한붓그리기 퍼즐 자동 생성기.
 * 레벨 1부터 시작해 클리어할 때마다 점진적으로 난이도 상승.
 */

import type { CreativityLevelConfig } from '../../game-data/creativityLevels';

interface PuzzleTemplate {
  cols: number;
  rows: number;
  blocked: Array<{ x: number; y: number }>;
  timeLimit: number;
}

/**
 * 진행 테이블: 인덱스 0 = 플레이어 레벨 1
 * 블록 배치는 풀이 경로 존재 여부를 사전에 검증한 패턴만 수록.
 */
const PROGRESSION_TABLE: PuzzleTemplate[] = [
  // Level 1-3: 3×3, 블록 없음 (입문)
  { cols: 3, rows: 3, blocked: [], timeLimit: 90 },
  { cols: 3, rows: 3, blocked: [], timeLimit: 80 },
  { cols: 3, rows: 3, blocked: [], timeLimit: 70 },
  // Level 4-6: 3×3, 블록 1개
  { cols: 3, rows: 3, blocked: [{ x: 1, y: 1 }], timeLimit: 75 },
  { cols: 3, rows: 3, blocked: [{ x: 0, y: 0 }], timeLimit: 70 },
  { cols: 3, rows: 3, blocked: [{ x: 2, y: 0 }], timeLimit: 65 },
  // Level 7-9: 4×3, 블록 없음
  { cols: 4, rows: 3, blocked: [], timeLimit: 90 },
  { cols: 4, rows: 3, blocked: [], timeLimit: 80 },
  { cols: 4, rows: 3, blocked: [], timeLimit: 70 },
  // Level 10-12: 4×3, 블록 1개
  { cols: 4, rows: 3, blocked: [{ x: 1, y: 1 }], timeLimit: 90 },
  { cols: 4, rows: 3, blocked: [{ x: 2, y: 1 }], timeLimit: 85 },
  { cols: 4, rows: 3, blocked: [{ x: 0, y: 1 }], timeLimit: 80 },
  // Level 13-15: 4×4, 블록 없음
  { cols: 4, rows: 4, blocked: [], timeLimit: 120 },
  { cols: 4, rows: 4, blocked: [], timeLimit: 110 },
  { cols: 4, rows: 4, blocked: [], timeLimit: 100 },
  // Level 16-18: 4×4, 블록 1-2개
  { cols: 4, rows: 4, blocked: [{ x: 1, y: 1 }], timeLimit: 120 },
  { cols: 4, rows: 4, blocked: [{ x: 2, y: 2 }], timeLimit: 115 },
  { cols: 4, rows: 4, blocked: [{ x: 1, y: 2 }], timeLimit: 110 },
  // Level 19-21: 5×4, 블록 없음
  { cols: 5, rows: 4, blocked: [], timeLimit: 150 },
  { cols: 5, rows: 4, blocked: [], timeLimit: 140 },
  { cols: 5, rows: 4, blocked: [], timeLimit: 130 },
  // Level 22-24: 5×4, 블록 1-2개
  { cols: 5, rows: 4, blocked: [{ x: 2, y: 1 }], timeLimit: 150 },
  { cols: 5, rows: 4, blocked: [{ x: 1, y: 2 }], timeLimit: 140 },
  { cols: 5, rows: 4, blocked: [{ x: 3, y: 2 }], timeLimit: 135 },
  // Level 25-27: 5×5, 블록 없음
  { cols: 5, rows: 5, blocked: [], timeLimit: 180 },
  { cols: 5, rows: 5, blocked: [], timeLimit: 170 },
  { cols: 5, rows: 5, blocked: [], timeLimit: 160 },
  // Level 28-30: 5×5, 블록 1-2개
  { cols: 5, rows: 5, blocked: [{ x: 2, y: 2 }], timeLimit: 180 },
  { cols: 5, rows: 5, blocked: [{ x: 1, y: 1 }], timeLimit: 175 },
  { cols: 5, rows: 5, blocked: [{ x: 3, y: 1 }, { x: 1, y: 3 }], timeLimit: 180 },
  // Level 31-33: 6×4
  { cols: 6, rows: 4, blocked: [], timeLimit: 180 },
  { cols: 6, rows: 4, blocked: [], timeLimit: 170 },
  { cols: 6, rows: 4, blocked: [], timeLimit: 160 },
  // Level 34-36: 6×5
  { cols: 6, rows: 5, blocked: [], timeLimit: 210 },
  { cols: 6, rows: 5, blocked: [], timeLimit: 200 },
  { cols: 6, rows: 5, blocked: [], timeLimit: 190 },
  // Level 37-39: 6×6 (최고 난이도)
  { cols: 6, rows: 6, blocked: [], timeLimit: 240 },
  { cols: 6, rows: 6, blocked: [], timeLimit: 220 },
  { cols: 6, rows: 6, blocked: [], timeLimit: 200 },
];

export const MAX_PUZZLE_LEVEL = PROGRESSION_TABLE.length;

/**
 * 플레이어 레벨(1-based)에 해당하는 퍼즐 설정을 생성한다.
 * 최고 레벨을 넘어도 마지막 설정을 반환한다.
 */
export function generatePuzzle(playerLevel: number): CreativityLevelConfig {
  const idx = Math.min(Math.max(0, playerLevel - 1), PROGRESSION_TABLE.length - 1);
  const t = PROGRESSION_TABLE[idx];
  return {
    id: `gen-${playerLevel}`,
    subject: 'creativity',
    cols: t.cols,
    rows: t.rows,
    blocked: t.blocked,
    timeLimit: t.timeLimit,
    starThresholds: [
      t.timeLimit,
      Math.round(t.timeLimit * 0.65),
      Math.round(t.timeLimit * 0.4),
    ],
  };
}

/** 레벨 구간별 난이도 레이블 */
export function getDifficultyLabel(playerLevel: number): string {
  if (playerLevel <= 3) return '입문';
  if (playerLevel <= 9) return '초급';
  if (playerLevel <= 18) return '중급';
  if (playerLevel <= 27) return '고급';
  return '달인';
}
