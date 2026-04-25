import type { EnglishCategory, EnglishDifficulty } from './english/categories';
export type { EnglishCategory, EnglishDifficulty };

export type SubjectId = 'math' | 'english' | 'korean' | 'logic' | 'creativity';
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
}

export interface LevelTestResult {
  testedAt: number;
  recommendedLevelId: string;
  recommendedLevelIndex: number;
  stagesCleared: number;
  totalQuestions: number;
  correctCount: number;
}

export interface SaveData {
  /**
   * 저장 데이터 버전.
   * v1 : 최초 버전 (gamification 없음)
   * v2 : gamification 필드 추가, 14일 XP 롤링 윈도우
   * v3 : logic, creativity 필드 추가
   * v4 : creativity 자동 진행 방식 (totalClears, consecutiveClears, currentLevelIdx)
   */
  version: number;
  math: { levelProgress: Record<string, LevelProgress>; levelTestResult?: LevelTestResult };
  english: { levelProgress: Record<string, LevelProgress>; levelTestResult?: LevelTestResult };
  settings: { language: 'ko' | 'en'; soundEnabled: boolean; musicEnabled: boolean };
  /** v2+ 에서만 존재. 없으면 마이그레이션 필요. */
  gamification?: import('../systems/gamification/types').GamificationState;
  /** v3+ : 논리 종목 저장 */
  logic?: { levelProgress: Record<string, LevelProgress>; streak?: number; clearCount?: number };
  /** v4+ : 창의 종목 저장 */
  creativity?: {
    levelProgress: Record<string, LevelProgress>;
    meta?: CreativityMeta;
    playerLevel?: number;
    totalClears?: number;
    streak?: number;
    consecutiveClears?: number;
    currentLevelIdx?: number;
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
