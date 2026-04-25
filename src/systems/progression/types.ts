/** 분야별 진행 데이터 통합 타입 */
export interface SubjectProgress {
  subjectId: string;
  xp: number;
  level: number;
  totalClears: number;
  streak: number;
  bestStreak: number;
  rank: string;
  xpToNextLevel: number;
  xpInCurrentLevel: number;
  levelProgressPercent: number;
}

export interface XpGain {
  base: number;
  streakBonus: number;
  total: number;
}

export type SubjectId = 'math' | 'english' | 'logic' | 'creativity';
