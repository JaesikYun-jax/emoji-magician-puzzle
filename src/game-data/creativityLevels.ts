export interface CreativityLevelConfig {
  id: string;
  subject: 'creativity';
  cols: number;
  rows: number;
  blocked: Array<{ x: number; y: number }>;
  timeLimit: number;    // 초
  starThresholds: [number, number, number]; // [1star, 2star, 3star] 사용 시간 상한 (초)
}

export const CREATIVITY_LEVELS: CreativityLevelConfig[] = [
  // Level 1-2: 3×3, 블록 없음
  {
    id: 'creativity-1',
    subject: 'creativity',
    cols: 3, rows: 3, blocked: [],
    timeLimit: 60,
    starThresholds: [60, 30, 15],
  },
  {
    id: 'creativity-2',
    subject: 'creativity',
    cols: 3, rows: 3,
    blocked: [{ x: 1, y: 1 }],
    timeLimit: 60,
    starThresholds: [60, 25, 12],
  },
  // Level 3-4: 4×3
  {
    id: 'creativity-3',
    subject: 'creativity',
    cols: 4, rows: 3, blocked: [],
    timeLimit: 90,
    starThresholds: [90, 50, 25],
  },
  {
    id: 'creativity-4',
    subject: 'creativity',
    cols: 4, rows: 3,
    blocked: [{ x: 1, y: 1 }],
    timeLimit: 90,
    starThresholds: [90, 45, 20],
  },
  // Level 5-6: 4×4
  {
    id: 'creativity-5',
    subject: 'creativity',
    cols: 4, rows: 4, blocked: [],
    timeLimit: 120,
    starThresholds: [120, 70, 35],
  },
  {
    id: 'creativity-6',
    subject: 'creativity',
    cols: 4, rows: 4,
    blocked: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
    timeLimit: 120,
    starThresholds: [120, 65, 30],
  },
  // Level 7-8: 5×4
  {
    id: 'creativity-7',
    subject: 'creativity',
    cols: 5, rows: 4, blocked: [],
    timeLimit: 150,
    starThresholds: [150, 90, 45],
  },
  {
    id: 'creativity-8',
    subject: 'creativity',
    cols: 5, rows: 4,
    blocked: [{ x: 0, y: 2 }, { x: 4, y: 1 }],
    timeLimit: 150,
    starThresholds: [150, 85, 40],
  },
  // Level 9-10: 5×5, 6×4
  {
    id: 'creativity-9',
    subject: 'creativity',
    cols: 5, rows: 5,
    blocked: [{ x: 1, y: 1 }, { x: 3, y: 3 }],
    timeLimit: 180,
    starThresholds: [180, 110, 55],
  },
  {
    id: 'creativity-10',
    subject: 'creativity',
    cols: 6, rows: 4,
    blocked: [{ x: 1, y: 2 }, { x: 4, y: 1 }],
    timeLimit: 180,
    starThresholds: [180, 100, 50],
  },
];

export function getCreativityLevel(id: string): CreativityLevelConfig | undefined {
  return CREATIVITY_LEVELS.find(l => l.id === id);
}
