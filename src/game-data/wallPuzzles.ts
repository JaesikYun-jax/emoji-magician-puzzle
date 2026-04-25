import type { CreativityLevelConfig } from './creativityLevels';

/** 문제은행 퍼즐 (walls 포함) */
export interface WallPuzzle extends CreativityLevelConfig {
  tier: 1 | 2 | 3 | 4;
}

// ────────────────────────────────────────────────
// Tier 1: 3×3, 벽 1-2개, blocked 없음
// 참고 경로: (0,0)→(1,0)→(2,0)→(2,1)→(1,1)→(0,1)→(0,2)→(1,2)→(2,2)
// 미사용 간선(벽 후보): (0,0,d),(1,0,d),(1,1,d),(2,1,d)
// ────────────────────────────────────────────────
export const WALL_PUZZLES_TIER1: WallPuzzle[] = [
  { id:'t1-p01', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:0,y:0,dir:'d'}], timeLimit:90, starThresholds:[90,45,25] },
  { id:'t1-p02', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:1,y:0,dir:'d'}], timeLimit:90, starThresholds:[90,45,25] },
  { id:'t1-p03', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:1,y:1,dir:'d'}], timeLimit:90, starThresholds:[90,45,25] },
  { id:'t1-p04', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:2,y:1,dir:'d'}], timeLimit:90, starThresholds:[90,45,25] },
  { id:'t1-p05', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:1,y:1,dir:'d'}], timeLimit:85, starThresholds:[85,42,22] },
  { id:'t1-p06', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:2,y:1,dir:'d'}], timeLimit:85, starThresholds:[85,42,22] },
  { id:'t1-p07', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'}], timeLimit:85, starThresholds:[85,42,22] },
  { id:'t1-p08', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:1,y:1,dir:'d'}], timeLimit:85, starThresholds:[85,42,22] },
  // 수직 뱀 경로: (0,0)→(0,1)→(0,2)→(1,2)→(1,1)→(1,0)→(2,0)→(2,1)→(2,2)
  // 미사용 가로 간선: (0,0,r),(0,1,r),(1,1,r),(1,2,r)
  { id:'t1-p09', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:0,y:0,dir:'r'}], timeLimit:90, starThresholds:[90,45,25] },
  { id:'t1-p10', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:0,y:1,dir:'r'}], timeLimit:90, starThresholds:[90,45,25] },
  { id:'t1-p11', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:1,y:1,dir:'r'}], timeLimit:90, starThresholds:[90,45,25] },
  { id:'t1-p12', tier:1, subject:'creativity', cols:3, rows:3, blocked:[], walls:[{x:0,y:0,dir:'r'},{x:1,y:1,dir:'r'}], timeLimit:85, starThresholds:[85,42,22] },
];

// ────────────────────────────────────────────────
// Tier 2: 4×3 or 4×4, 벽 1-2개
// 4×3 경로: (0,0)→(1,0)→(2,0)→(3,0)→(3,1)→(2,1)→(1,1)→(0,1)→(0,2)→(1,2)→(2,2)→(3,2)
// 미사용 세로: (0,0,d),(1,0,d),(2,0,d) / (1,1,d),(2,1,d),(3,1,d)
// ────────────────────────────────────────────────
export const WALL_PUZZLES_TIER2: WallPuzzle[] = [
  { id:'t2-p01', tier:2, subject:'creativity', cols:4, rows:3, blocked:[], walls:[{x:1,y:0,dir:'d'}], timeLimit:100, starThresholds:[100,55,30] },
  { id:'t2-p02', tier:2, subject:'creativity', cols:4, rows:3, blocked:[], walls:[{x:2,y:0,dir:'d'}], timeLimit:100, starThresholds:[100,55,30] },
  { id:'t2-p03', tier:2, subject:'creativity', cols:4, rows:3, blocked:[], walls:[{x:1,y:1,dir:'d'}], timeLimit:100, starThresholds:[100,55,30] },
  { id:'t2-p04', tier:2, subject:'creativity', cols:4, rows:3, blocked:[], walls:[{x:2,y:1,dir:'d'}], timeLimit:100, starThresholds:[100,55,30] },
  { id:'t2-p05', tier:2, subject:'creativity', cols:4, rows:3, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'}], timeLimit:95, starThresholds:[95,50,28] },
  { id:'t2-p06', tier:2, subject:'creativity', cols:4, rows:3, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'}], timeLimit:95, starThresholds:[95,50,28] },
  { id:'t2-p07', tier:2, subject:'creativity', cols:4, rows:3, blocked:[], walls:[{x:2,y:0,dir:'d'},{x:1,y:1,dir:'d'}], timeLimit:95, starThresholds:[95,50,28] },
  { id:'t2-p08', tier:2, subject:'creativity', cols:4, rows:3, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:1,y:1,dir:'d'}], timeLimit:95, starThresholds:[95,50,28] },
  // 4×4 경로: (0,0)→...→(3,0)→(3,1)→...→(0,1)→(0,2)→...→(3,2)→(3,3)→...→(0,3)
  // 미사용 세로: (0,0,d),(1,0,d),(2,0,d) / (1,1,d),(2,1,d),(3,1,d) / (0,2,d),(1,2,d),(2,2,d)
  { id:'t2-p09', tier:2, subject:'creativity', cols:4, rows:4, blocked:[], walls:[{x:1,y:0,dir:'d'}], timeLimit:130, starThresholds:[130,70,38] },
  { id:'t2-p10', tier:2, subject:'creativity', cols:4, rows:4, blocked:[], walls:[{x:2,y:0,dir:'d'},{x:1,y:1,dir:'d'}], timeLimit:125, starThresholds:[125,65,35] },
  { id:'t2-p11', tier:2, subject:'creativity', cols:4, rows:4, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:3,y:1,dir:'d'}], timeLimit:125, starThresholds:[125,65,35] },
  { id:'t2-p12', tier:2, subject:'creativity', cols:4, rows:4, blocked:[], walls:[{x:1,y:1,dir:'d'},{x:2,y:2,dir:'d'}], timeLimit:125, starThresholds:[125,65,35] },
  { id:'t2-p13', tier:2, subject:'creativity', cols:4, rows:4, blocked:[], walls:[{x:2,y:0,dir:'d'},{x:0,y:2,dir:'d'}], timeLimit:125, starThresholds:[125,65,35] },
  { id:'t2-p14', tier:2, subject:'creativity', cols:4, rows:4, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:1,y:1,dir:'d'},{x:2,y:2,dir:'d'}], timeLimit:120, starThresholds:[120,62,32] },
];

// ────────────────────────────────────────────────
// Tier 3: 5×4 or 5×5, 벽 2-3개
// 5×4 경로: 뱀. 미사용 세로:
//   (0,0,d),(1,0,d),(2,0,d),(3,0,d) / (1,1,d),(2,1,d),(3,1,d),(4,1,d) / (0,2,d),(1,2,d),(2,2,d),(3,2,d)
// 5×5 경로: 뱀. 추가 미사용:
//   (1,3,d),(2,3,d),(3,3,d),(4,3,d)
// ────────────────────────────────────────────────
export const WALL_PUZZLES_TIER3: WallPuzzle[] = [
  { id:'t3-p01', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:2,y:0,dir:'d'},{x:1,y:2,dir:'d'}], timeLimit:155, starThresholds:[155,85,45] },
  { id:'t3-p02', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'}], timeLimit:155, starThresholds:[155,85,45] },
  { id:'t3-p03', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'}], timeLimit:155, starThresholds:[155,85,45] },
  { id:'t3-p04', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:3,y:0,dir:'d'},{x:2,y:2,dir:'d'}], timeLimit:155, starThresholds:[155,85,45] },
  { id:'t3-p05', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:4,y:1,dir:'d'},{x:2,y:2,dir:'d'}], timeLimit:150, starThresholds:[150,80,42] },
  { id:'t3-p06', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:3,y:0,dir:'d'},{x:2,y:1,dir:'d'},{x:0,y:2,dir:'d'}], timeLimit:150, starThresholds:[150,80,42] },
  { id:'t3-p07', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:1,y:2,dir:'d'}], timeLimit:150, starThresholds:[150,80,42] },
  // 5×5 변형
  { id:'t3-p08', tier:3, subject:'creativity', cols:5, rows:5, blocked:[], walls:[{x:2,y:0,dir:'d'},{x:1,y:1,dir:'d'}], timeLimit:185, starThresholds:[185,100,55] },
  { id:'t3-p09', tier:3, subject:'creativity', cols:5, rows:5, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:3,y:2,dir:'d'}], timeLimit:185, starThresholds:[185,100,55] },
  { id:'t3-p10', tier:3, subject:'creativity', cols:5, rows:5, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:4,y:1,dir:'d'}], timeLimit:185, starThresholds:[185,100,55] },
  { id:'t3-p11', tier:3, subject:'creativity', cols:5, rows:5, blocked:[], walls:[{x:2,y:1,dir:'d'},{x:1,y:3,dir:'d'}], timeLimit:185, starThresholds:[185,100,55] },
  { id:'t3-p12', tier:3, subject:'creativity', cols:5, rows:5, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:3,y:2,dir:'d'},{x:2,y:3,dir:'d'}], timeLimit:180, starThresholds:[180,95,50] },
  { id:'t3-p13', tier:3, subject:'creativity', cols:5, rows:5, blocked:[], walls:[{x:3,y:0,dir:'d'},{x:1,y:1,dir:'d'},{x:4,y:3,dir:'d'}], timeLimit:180, starThresholds:[180,95,50] },
  { id:'t3-p14', tier:3, subject:'creativity', cols:5, rows:5, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:2,y:2,dir:'d'},{x:3,y:3,dir:'d'}], timeLimit:180, starThresholds:[180,95,50] },
];

// ────────────────────────────────────────────────
// Tier 4: 6×4 / 6×5 / 6×6, 벽 3-5개, blocked 0-1개
// 모든 경로: 뱀 패턴 (짝수행 좌→우, 홀수행 우→좌)
// blocked은 반드시 코너(가장자리)에만 배치
// ────────────────────────────────────────────────
export const WALL_PUZZLES_TIER4: WallPuzzle[] = [
  {
    // 6×4, blocked 없음, 벽 3개
    id:'t4-p01', tier:4, subject:'creativity',
    cols:6, rows:4, blocked:[],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'}],
    timeLimit:180, starThresholds:[180,100,55],
  },
  {
    id:'t4-p02', tier:4, subject:'creativity',
    cols:6, rows:4, blocked:[],
    walls:[{x:2,y:0,dir:'d'},{x:0,y:1,dir:'d'},{x:4,y:2,dir:'d'}],
    timeLimit:180, starThresholds:[180,100,55],
  },
  {
    id:'t4-p03', tier:4, subject:'creativity',
    cols:6, rows:4, blocked:[],
    walls:[{x:3,y:0,dir:'d'},{x:1,y:1,dir:'d'},{x:0,y:2,dir:'d'},{x:3,y:2,dir:'d'}],
    timeLimit:175, starThresholds:[175,95,52],
  },
  {
    // 6×4, blocked 1개 (좌상단 코너), 23칸
    id:'t4-p04', tier:4, subject:'creativity',
    cols:6, rows:4, blocked:[{x:0,y:0}],
    walls:[{x:2,y:0,dir:'d'},{x:0,y:1,dir:'d'},{x:4,y:2,dir:'d'}],
    timeLimit:175, starThresholds:[175,95,52],
  },
  {
    // 6×4, blocked 1개 (좌하단 코너), 23칸
    id:'t4-p05', tier:4, subject:'creativity',
    cols:6, rows:4, blocked:[{x:0,y:3}],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'}],
    timeLimit:175, starThresholds:[175,95,52],
  },
  {
    // 6×5, blocked 없음, 벽 4개, 30칸
    id:'t4-p06', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[],
    walls:[{x:2,y:0,dir:'d'},{x:0,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'}],
    timeLimit:210, starThresholds:[210,115,60],
  },
  {
    id:'t4-p07', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'},{x:4,y:3,dir:'d'}],
    timeLimit:210, starThresholds:[210,115,60],
  },
  {
    id:'t4-p08', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[],
    walls:[{x:3,y:0,dir:'d'},{x:1,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:0,y:3,dir:'d'},{x:3,y:3,dir:'d'}],
    timeLimit:205, starThresholds:[205,112,58],
  },
  {
    // 6×5, blocked 1개 (우하단 코너), 29칸
    id:'t4-p09', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[{x:5,y:4}],
    walls:[{x:2,y:0,dir:'d'},{x:0,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'}],
    timeLimit:205, starThresholds:[205,112,58],
  },
  {
    // 6×6, blocked 없음, 벽 5개, 36칸
    id:'t4-p10', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[],
    walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'},{x:3,y:4,dir:'d'}],
    timeLimit:245, starThresholds:[245,135,70],
  },
  {
    id:'t4-p11', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'},{x:4,y:3,dir:'d'},{x:1,y:4,dir:'d'}],
    timeLimit:245, starThresholds:[245,135,70],
  },
  {
    // 6×6, blocked 1개 (좌하단 코너), 35칸
    id:'t4-p12', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:5}],
    walls:[{x:2,y:0,dir:'d'},{x:4,y:1,dir:'d'},{x:1,y:2,dir:'d'},{x:3,y:3,dir:'d'},{x:2,y:4,dir:'d'}],
    timeLimit:240, starThresholds:[240,130,68],
  },
];

/** 전체 문제은행 */
export const ALL_WALL_PUZZLES: WallPuzzle[] = [
  ...WALL_PUZZLES_TIER1,
  ...WALL_PUZZLES_TIER2,
  ...WALL_PUZZLES_TIER3,
  ...WALL_PUZZLES_TIER4,
];
