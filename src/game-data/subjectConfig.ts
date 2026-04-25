import type { EnglishCategory, EnglishDifficulty } from './english/categories';
export type { EnglishCategory, EnglishDifficulty };

export type SubjectId = 'math' | 'english' | 'korean' | 'logic' | 'creativity';

// ── 프로필 ──────────────────────────────────────────────────────────────────

export type AgeGroup =
  | 'daycare'      // 어린이집 (3-5세)
  | 'kindergarten' // 유치원 (6-7세)
  | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6'; // 초1~초6

export interface ChildProfile {
  nickname: string;    // 1~10자
  ageGroup: AgeGroup;
  avatar?: string;     // 추후 확장
  createdAt: number;
}
export type MathOperation = 'addition' | 'subtraction' | 'multiplication';
export type DigitLevel = 'single' | 'double' | 'triple';
export type ConstraintType = 'moves' | 'time';

export interface SubjectConfig {
  id: SubjectId;
  nameKo: string;
  nameEn: string;
  iconPath: string;
  colorPrimary: string;
  colorLight: string;
  isAvailable: boolean;
}

export interface MathLevelConfig {
  id: string;
  subject: 'math';
  operation: MathOperation;
  digitLevel: DigitLevel;
  levelIndex: number;
  targetValue: number | number[];
  tileRange: [number, number];
  boardCols: number;
  boardRows: number;
  targetPairs: number | Record<number, number>;
  constraint: ConstraintType;
  constraintValue: number;
  starThresholds: [number, number, number];
  baseScore: number;
  comboBonus: number;
}

export interface WordEntry {
  id: string;
  english: string;
  korean: string;
  category: EnglishCategory;
  difficulty: EnglishDifficulty;
}

export interface EnglishLevelConfig {
  id: string;
  subject: 'english';
  category: EnglishDifficulty;
  wordCategories: string[];
  presentationDir: 'en-to-ko' | 'ko-to-en';
  choiceCount: 2 | 3 | 4;
  cardCount: number;
  constraint: ConstraintType;
  constraintValue: number;
  passThreshold: number;
  starThresholds: [number, number, number];
}

export interface LevelProgress {
  stars: number;
  bestScore: number;
  playCount: number;
  isUnlocked: boolean;
}

export interface CreativityMeta {
  totalClears: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedAt: string;
  earnedBadgeThresholds: number[];
  recentPuzzleIds: string[];   // 최근 플레이한 퍼즐 id (최대 20개)
  rankScore: number;           // 가중치 점수 (랭크 계산용)
  maxDifficultyTier: number;   // 최고 달성 난이도 티어 (1-5)
}

export interface LevelTestResult {
  testedAt: number;
  recommendedLevelId: string;
  recommendedLevelIndex: number;
  stagesCleared: number;
  totalQuestions: number;
  correctCount: number;
}

/** 분야별 통합 진행 데이터 (v6+ 저장 형식) */
export interface SubjectProgressData {
  xp: number;
  level: number;
  totalClears: number;
  streak: number;
  bestStreak: number;
  placementDone: boolean;
  placementScore?: number;
}

export interface SaveData {
  /**
   * 저장 데이터 버전.
   * v1 : 최초 버전 (gamification 없음)
   * v2 : gamification 필드 추가, 14일 XP 롤링 윈도우
   * v3 : logic, creativity 필드 추가
   * v4 : creativity 자동 진행 방식 (totalClears, consecutiveClears, currentLevelIdx)
   * v5 : 아이 프로필 (nickname + ageGroup) 추가
   */
  version: number;
  math: { levelProgress: Record<string, LevelProgress>; levelTestResult?: LevelTestResult; progress?: SubjectProgressData };
  english: { levelProgress: Record<string, LevelProgress>; levelTestResult?: LevelTestResult; progress?: SubjectProgressData };
  settings: { language: 'ko' | 'en'; soundEnabled: boolean; musicEnabled: boolean };
  /** v2+ 에서만 존재. 없으면 마이그레이션 필요. */
  gamification?: import('../systems/gamification/types').GamificationState;
  /** v3+ : 논리 종목 저장 */
  logic?: { levelProgress: Record<string, LevelProgress>; streak?: number; clearCount?: number; progress?: SubjectProgressData };
  /** v5+ : 아이 프로필 */
  profile?: ChildProfile | null;
  /** v4+ : 창의 종목 저장 */
  creativity?: {
    levelProgress: Record<string, LevelProgress>;
    meta?: CreativityMeta;
    playerLevel?: number;
    totalClears?: number;
    streak?: number;
    consecutiveClears?: number;
    currentLevelIdx?: number;
    progress?: SubjectProgressData;
  };
}

export const SUBJECTS: SubjectConfig[] = [
  {
    id: 'math',
    nameKo: '수리 수학',
    nameEn: 'Math',
    iconPath: '/src/assets/svg/icon-math.svg',
    colorPrimary: '#0EA5E9',
    colorLight: '#E0F2FE',
    isAvailable: true,
  },
  {
    id: 'english',
    nameKo: '영어',
    nameEn: 'English',
    iconPath: '/src/assets/svg/icon-english.svg',
    colorPrimary: '#10B981',
    colorLight: '#D1FAE5',
    isAvailable: true,
  },
  {
    id: 'korean',
    nameKo: '국어',
    nameEn: 'Korean',
    iconPath: '/src/assets/svg/icon-korean.svg',
    colorPrimary: '#F43F5E',
    colorLight: '#FFE4E6',
    isAvailable: false,
  },
  {
    id: 'logic',
    nameKo: '논리',
    nameEn: 'Logic',
    iconPath: '/src/assets/svg/icon-logic.svg',
    colorPrimary: '#6366F1',
    colorLight: '#E0E7FF',
    isAvailable: true,
  },
  {
    id: 'creativity',
    nameKo: '창의',
    nameEn: 'Creativity',
    iconPath: '/src/assets/svg/icon-creativity.svg',
    colorPrimary: '#F97316',
    colorLight: '#FFEDD5',
    isAvailable: true,
  },
];
