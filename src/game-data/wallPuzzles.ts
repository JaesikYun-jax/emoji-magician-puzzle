import type { CreativityLevelConfig } from './creativityLevels';

/** 문제은행 퍼즐 (walls 포함) */
export interface WallPuzzle extends CreativityLevelConfig {
  tier: 1 | 2 | 3 | 4 | 5;
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
  // 5×4 뱀 경로: (0,0)→(4,0)→(4,1)→(0,1)→(0,2)→(4,2)→(4,3)→(0,3) — startCell=(0,0), endCell=(0,3)
  { id:'t3-p01', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:2,y:0,dir:'d'},{x:1,y:2,dir:'d'}], timeLimit:155, starThresholds:[155,85,45], startCell:{x:0,y:0}, endCell:{x:0,y:3} },
  { id:'t3-p02', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'}], timeLimit:155, starThresholds:[155,85,45], startCell:{x:0,y:0}, endCell:{x:0,y:3} },
  { id:'t3-p03', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'}], timeLimit:155, starThresholds:[155,85,45] },
  { id:'t3-p04', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:3,y:0,dir:'d'},{x:2,y:2,dir:'d'}], timeLimit:155, starThresholds:[155,85,45] },
  { id:'t3-p05', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:1,y:0,dir:'d'},{x:4,y:1,dir:'d'},{x:2,y:2,dir:'d'}], timeLimit:150, starThresholds:[150,80,42] },
  { id:'t3-p06', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:3,y:0,dir:'d'},{x:2,y:1,dir:'d'},{x:0,y:2,dir:'d'}], timeLimit:150, starThresholds:[150,80,42] },
  { id:'t3-p07', tier:3, subject:'creativity', cols:5, rows:4, blocked:[], walls:[{x:0,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:1,y:2,dir:'d'}], timeLimit:150, starThresholds:[150,80,42] },
  // 5×5 변형 — 5×5 뱀: 짝수행 좌→우, 홀수행 우→좌, 마지막 행(4번째, y=4)은 짝수이므로 우측 끝 (4,4)
  { id:'t3-p08', tier:3, subject:'creativity', cols:5, rows:5, blocked:[], walls:[{x:2,y:0,dir:'d'},{x:1,y:1,dir:'d'}], timeLimit:185, starThresholds:[185,100,55], startCell:{x:0,y:0}, endCell:{x:4,y:4} },
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
    // 6×4 뱀: startCell=(0,0), endCell=(0,3) — blocked 없음, 벽 3개
    id:'t4-p01', tier:4, subject:'creativity',
    cols:6, rows:4, blocked:[],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'}],
    timeLimit:180, starThresholds:[180,100,55],
    startCell:{x:0,y:0}, endCell:{x:0,y:3},
  },
  {
    // 6×4 뱀: startCell=(0,0), endCell=(0,3)
    // FIXED: walls 수정 - 이전에 불가능했던 퍼즐 ({x:0,y:1,dir:'d'}는 뱀 경로 행1→행2 전환 간선 차단)
    id:'t4-p02', tier:4, subject:'creativity',
    cols:6, rows:4, blocked:[],
    walls:[{x:2,y:0,dir:'d'},{x:1,y:1,dir:'d'},{x:4,y:2,dir:'d'}],
    timeLimit:180, starThresholds:[180,100,55],
    startCell:{x:0,y:0}, endCell:{x:0,y:3},
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
    // 6×5 뱀: startCell=(0,0), endCell=(5,4) — blocked 없음, 벽 4개, 30칸
    // FIXED: walls 수정 - 이전에 불가능했던 퍼즐 ({x:0,y:1,dir:'d'}는 뱀 경로 행1→행2 전환 간선 차단)
    id:'t4-p06', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[],
    walls:[{x:2,y:0,dir:'d'},{x:3,y:3,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'}],
    timeLimit:210, starThresholds:[210,115,60],
    startCell:{x:0,y:0}, endCell:{x:5,y:4},
  },
  {
    // 6×5 뱀: startCell=(0,0), endCell=(5,4)
    id:'t4-p07', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'},{x:4,y:3,dir:'d'}],
    timeLimit:210, starThresholds:[210,115,60],
    startCell:{x:0,y:0}, endCell:{x:5,y:4},
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
    // 6×6 뱀: startCell=(0,0), endCell=(0,5) — blocked 없음, 벽 5개, 36칸
    id:'t4-p10', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[],
    walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'},{x:3,y:4,dir:'d'}],
    timeLimit:245, starThresholds:[245,135,70],
    startCell:{x:0,y:0}, endCell:{x:0,y:5},
  },
  {
    // 6×6 뱀: startCell=(0,0), endCell=(0,5)
    id:'t4-p11', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'},{x:4,y:3,dir:'d'},{x:1,y:4,dir:'d'}],
    timeLimit:245, starThresholds:[245,135,70],
    startCell:{x:0,y:0}, endCell:{x:0,y:5},
  },
  {
    // 6×6, blocked 1개 (좌하단 코너), 35칸
    id:'t4-p12', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:5}],
    walls:[{x:2,y:0,dir:'d'},{x:4,y:1,dir:'d'},{x:1,y:2,dir:'d'},{x:3,y:3,dir:'d'},{x:2,y:4,dir:'d'}],
    timeLimit:240, starThresholds:[240,130,68],
  },
];

// ────────────────────────────────────────────────
// Tier 3 HARD: 5×4 / 5×5, blocked 1-2개, 벽 2-3개
// blocked으로 L자·비직사각형 모양 연출
// ────────────────────────────────────────────────
export const WALL_PUZZLES_TIER3_BLOCKED: WallPuzzle[] = [
  // 5×4, blocked 좌상단 코너 (0,0) → L자 형태 19칸
  { id:'t3-p15', tier:3, subject:'creativity', cols:5, rows:4, blocked:[{x:0,y:0}], walls:[{x:2,y:1,dir:'d'},{x:1,y:2,dir:'d'}], timeLimit:145, starThresholds:[145,78,40] },
  { id:'t3-p16', tier:3, subject:'creativity', cols:5, rows:4, blocked:[{x:0,y:0}], walls:[{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'}], timeLimit:145, starThresholds:[145,78,40] },
  // 5×4, blocked 우하단 코너 (4,3) → 역L자 형태 19칸
  { id:'t3-p17', tier:3, subject:'creativity', cols:5, rows:4, blocked:[{x:4,y:3}], walls:[{x:1,y:0,dir:'d'},{x:3,y:2,dir:'d'}], timeLimit:145, starThresholds:[145,78,40] },
  { id:'t3-p18', tier:3, subject:'creativity', cols:5, rows:4, blocked:[{x:4,y:3}], walls:[{x:0,y:1,dir:'d'},{x:2,y:1,dir:'d'}], timeLimit:145, starThresholds:[145,78,40] },
  // 5×5, blocked 두 대각 코너 (0,0),(4,4) → 23칸 계단형
  { id:'t3-p19', tier:3, subject:'creativity', cols:5, rows:5, blocked:[{x:0,y:0},{x:4,y:4}], walls:[{x:2,y:1,dir:'d'},{x:1,y:3,dir:'d'}], timeLimit:175, starThresholds:[175,95,50] },
  { id:'t3-p20', tier:3, subject:'creativity', cols:5, rows:5, blocked:[{x:0,y:0},{x:4,y:4}], walls:[{x:3,y:1,dir:'d'},{x:2,y:3,dir:'d'}], timeLimit:175, starThresholds:[175,95,50] },
  // 5×5, blocked 반대 대각 (4,0),(0,4) → 23칸 역계단형
  { id:'t3-p21', tier:3, subject:'creativity', cols:5, rows:5, blocked:[{x:4,y:0},{x:0,y:4}], walls:[{x:1,y:1,dir:'d'},{x:3,y:2,dir:'d'}], timeLimit:175, starThresholds:[175,95,50] },
  { id:'t3-p22', tier:3, subject:'creativity', cols:5, rows:5, blocked:[{x:4,y:0},{x:0,y:4}], walls:[{x:2,y:0,dir:'r'},{x:2,y:3,dir:'d'}], timeLimit:175, starThresholds:[175,95,50] },
];

// ────────────────────────────────────────────────
// Tier 4 HARD: 6×4 / 6×5 / 6×6, blocked 2-3개, 벽 4-5개
// ────────────────────────────────────────────────
export const WALL_PUZZLES_TIER4_HARD: WallPuzzle[] = [
  {
    // 6×5, blocked 2 (상단 양쪽 코너) → 역T 형태 28칸
    id:'t4-p13', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[{x:0,y:0},{x:5,y:0}],
    walls:[{x:2,y:1,dir:'d'},{x:4,y:1,dir:'d'},{x:1,y:2,dir:'d'},{x:3,y:3,dir:'d'}],
    timeLimit:195, starThresholds:[195,105,55],
  },
  {
    // 6×5, blocked 2 (하단 양쪽 코너) → T 형태 28칸
    id:'t4-p14', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[{x:0,y:4},{x:5,y:4}],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'},{x:4,y:3,dir:'d'}],
    timeLimit:195, starThresholds:[195,105,55],
  },
  {
    // 6×6, blocked 2 (좌상단 + 우하단 인접) → 34칸
    // FIXED: (5,5)→(5,4)로 변경 — blocked 2칸이 같은 체커보드 parity(둘 다 짝수)여서
    // 수학적으로 해밀턴 경로가 불가능했음. (0,0)=even, (5,4)=odd로 패리티 수정.
    id:'t4-p15', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:0},{x:5,y:4}],
    walls:[{x:2,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'},{x:3,y:4,dir:'d'},{x:2,y:0,dir:'r'}],
    timeLimit:235, starThresholds:[235,128,66],
  },
  {
    // 6×6, blocked 2 반대 패턴 → 34칸
    // FIXED: (5,0)→(4,0)으로 변경 — (5,0)=odd, (0,5)=odd 로 둘 다 홀수 패리티라
    // 수학적으로 해밀턴 경로가 불가능했음. (4,0)=even, (0,5)=odd로 패리티 수정.
    id:'t4-p16', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[{x:4,y:0},{x:0,y:5}],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'},{x:4,y:3,dir:'d'},{x:1,y:4,dir:'d'}],
    timeLimit:235, starThresholds:[235,128,66],
  },
  {
    // 6×6, blocked 3 (왼쪽 상단 L) → 33칸
    id:'t4-p17', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:0},{x:0,y:1},{x:1,y:0}],
    walls:[{x:3,y:1,dir:'d'},{x:1,y:2,dir:'d'},{x:4,y:2,dir:'d'},{x:2,y:4,dir:'d'},{x:0,y:3,dir:'r'}],
    timeLimit:230, starThresholds:[230,125,64],
  },
  {
    // 6×4, blocked 2 (상하 같은 열) → 22칸 ㄷ형
    id:'t4-p18', tier:4, subject:'creativity',
    cols:6, rows:4, blocked:[{x:0,y:0},{x:0,y:3}],
    walls:[{x:2,y:0,dir:'d'},{x:4,y:1,dir:'d'},{x:1,y:2,dir:'d'},{x:3,y:2,dir:'d'}],
    timeLimit:170, starThresholds:[170,92,48],
  },
  {
    // 6×5, blocked 2 + walls 5개, 28칸
    id:'t4-p19', tier:4, subject:'creativity',
    cols:6, rows:5, blocked:[{x:0,y:0},{x:5,y:4}],
    walls:[{x:2,y:0,dir:'d'},{x:0,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'},{x:3,y:3,dir:'d'}],
    timeLimit:200, starThresholds:[200,108,56],
  },
  {
    // 6×6, blocked 없음, walls 6개, 극한 미로
    id:'t4-p20', tier:4, subject:'creativity',
    cols:6, rows:6, blocked:[],
    walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'},{x:3,y:4,dir:'d'},{x:2,y:2,dir:'r'}],
    timeLimit:250, starThresholds:[250,138,72],
  },
];

// ────────────────────────────────────────────────
// Tier 5: 극한 난이도 — 연승 10+ 또는 총 클리어 90+
// 6×6 이상, blocked 2-4개, 다양한 모양, walls 5-7개
// ────────────────────────────────────────────────
export const WALL_PUZZLES_TIER5: WallPuzzle[] = [
  {
    // 6×6 십자형 (4 코너 blocked) → 32칸
    id:'t5-p01', tier:5, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:0},{x:5,y:0},{x:0,y:5},{x:5,y:5}],
    walls:[{x:2,y:1,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'},{x:3,y:4,dir:'d'},{x:2,y:2,dir:'r'}],
    timeLimit:220, starThresholds:[220,120,62],
  },
  {
    // 6×6 십자형 + 다른 벽 배치
    id:'t5-p02', tier:5, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:0},{x:5,y:0},{x:0,y:5},{x:5,y:5}],
    walls:[{x:1,y:1,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:3,dir:'d'},{x:4,y:3,dir:'d'},{x:1,y:2,dir:'r'},{x:3,y:4,dir:'r'}],
    timeLimit:215, starThresholds:[215,118,60],
  },
  {
    // 6×6 L자 (상단 우측 2x2 blocked) → 32칸 — startCell=(0,0), endCell=(0,5)
    // FIXED: walls 수정 - 이전에 불가능했던 퍼즐 ({x:0,y:3,dir:'r'}는 뱀 경로에서 (1,3)→(0,3) 차단)
    id:'t5-p03', tier:5, subject:'creativity',
    cols:6, rows:6, blocked:[{x:4,y:0},{x:5,y:0},{x:4,y:1},{x:5,y:1}],
    walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'},{x:1,y:2,dir:'d'},{x:3,y:3,dir:'d'},{x:2,y:4,dir:'d'},{x:4,y:3,dir:'d'}],
    timeLimit:215, starThresholds:[215,118,60],
    startCell:{x:0,y:0}, endCell:{x:0,y:5},
  },
  {
    // 6×6 역L자 (하단 좌측 2x2 blocked) → 32칸
    id:'t5-p04', tier:5, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:4},{x:1,y:4},{x:0,y:5},{x:1,y:5}],
    walls:[{x:1,y:0,dir:'d'},{x:3,y:1,dir:'d'},{x:2,y:2,dir:'d'},{x:4,y:3,dir:'d'},{x:1,y:3,dir:'d'},{x:3,y:2,dir:'r'}],
    timeLimit:215, starThresholds:[215,118,60],
  },
  {
    // 6×6 T자 (상단 가운데 2칸 blocked) → 34칸 — startCell=(0,0), endCell=(0,5)
    id:'t5-p05', tier:5, subject:'creativity',
    cols:6, rows:6, blocked:[{x:2,y:0},{x:3,y:0}],
    walls:[{x:0,y:0,dir:'d'},{x:1,y:1,dir:'d'},{x:4,y:1,dir:'d'},{x:2,y:2,dir:'d'},{x:3,y:3,dir:'d'},{x:1,y:4,dir:'d'}],
    timeLimit:228, starThresholds:[228,124,64],
    startCell:{x:0,y:0}, endCell:{x:0,y:5},
  },
  {
    // 6×6 계단형 (대각 3칸 blocked) → 33칸
    id:'t5-p06', tier:5, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:0},{x:5,y:0},{x:5,y:5}],
    walls:[{x:2,y:1,dir:'d'},{x:0,y:2,dir:'d'},{x:4,y:2,dir:'d'},{x:1,y:3,dir:'d'},{x:3,y:4,dir:'d'},{x:4,y:0,dir:'r'}],
    timeLimit:222, starThresholds:[222,121,62],
  },
  {
    // 6×6, blocked 2 + walls 7개 (최대 미로 난이도)
    // FIXED: (5,5)→(4,5)로 변경 + 상단 벽 2개 제거
    // 원래 (0,0)/(5,5) 같은 패리티(불가)였고, 패리티 수정 후에도
    // {x:1,y:0,d} + {x:3,y:0,r}가 (1,0)을 차수 1 데드엔드로 만들어 경로 불가. 해당 2개 제거.
    id:'t5-p07', tier:5, subject:'creativity',
    cols:6, rows:6, blocked:[{x:0,y:0},{x:4,y:5}],
    walls:[{x:3,y:1,dir:'d'},{x:0,y:2,dir:'d'},{x:4,y:2,dir:'d'},{x:2,y:3,dir:'d'},{x:1,y:4,dir:'d'}],
    timeLimit:240, starThresholds:[240,130,68],
  },
  {
    // 6×6 빈 보드 + 벽 7개 (모양보단 미로 복잡도) — startCell=(0,0), endCell=(0,5)
    id:'t5-p08', tier:5, subject:'creativity',
    cols:6, rows:6, blocked:[],
    walls:[{x:0,y:0,dir:'d'},{x:2,y:1,dir:'d'},{x:4,y:1,dir:'d'},{x:1,y:2,dir:'d'},{x:3,y:3,dir:'d'},{x:0,y:4,dir:'d'},{x:2,y:3,dir:'r'}],
    timeLimit:255, starThresholds:[255,140,74],
    startCell:{x:0,y:0}, endCell:{x:0,y:5},
  },
];

/** 전체 문제은행 */
export const ALL_WALL_PUZZLES: WallPuzzle[] = [
  ...WALL_PUZZLES_TIER1,
  ...WALL_PUZZLES_TIER2,
  ...WALL_PUZZLES_TIER3,
  ...WALL_PUZZLES_TIER3_BLOCKED,
  ...WALL_PUZZLES_TIER4,
  ...WALL_PUZZLES_TIER4_HARD,
  ...WALL_PUZZLES_TIER5,
];
