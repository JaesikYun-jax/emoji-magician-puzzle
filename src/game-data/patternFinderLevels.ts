import type { PatternGenParams } from '../systems/math/patternFinderGenerator';

export interface PatternLevelConfig {
  id: string;            // 'pat-find-1' ~ 'pat-find-15'
  levelIndex: number;    // 1~15
  totalRounds: number;   // 라운드 수
  timeLimit: number;     // 초
  genParams: PatternGenParams;
  starThresholds: [number, number, number]; // [1별, 2별, 3별] 정답 수 기준
  requiresPrev: boolean; // 이전 레벨 클리어 필요 여부
}

export const PATTERN_FINDER_LEVELS: PatternLevelConfig[] = [
  // L1: 등차수열, 공차 1-3, 끝 blank, 5타일, 10라운드
  {
    id: 'pat-find-1', levelIndex: 1, totalRounds: 10, timeLimit: 90,
    genParams: { patternTypes: ['arithmetic'], length: 5, blankPosition: 'end', difficultyRange: [5, 3], distractorSpread: 3 },
    starThresholds: [5, 7, 10], requiresPrev: false,
  },
  // L2: 등차수열, 공차 1-5, 끝 blank
  {
    id: 'pat-find-2', levelIndex: 2, totalRounds: 10, timeLimit: 90,
    genParams: { patternTypes: ['arithmetic'], length: 5, blankPosition: 'end', difficultyRange: [10, 5], distractorSpread: 4 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L3: 등차수열, 공차 1-8, 끝 blank, 6타일
  {
    id: 'pat-find-3', levelIndex: 3, totalRounds: 10, timeLimit: 80,
    genParams: { patternTypes: ['arithmetic'], length: 6, blankPosition: 'end', difficultyRange: [15, 8], distractorSpread: 5 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L4: 등차수열, 중간 blank
  {
    id: 'pat-find-4', levelIndex: 4, totalRounds: 10, timeLimit: 80,
    genParams: { patternTypes: ['arithmetic'], length: 5, blankPosition: 'middle', difficultyRange: [10, 5], distractorSpread: 4 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L5: 등차수열+제곱수, any blank
  {
    id: 'pat-find-5', levelIndex: 5, totalRounds: 10, timeLimit: 80,
    genParams: { patternTypes: ['arithmetic', 'square'], length: 5, blankPosition: 'any', difficultyRange: [12, 6], distractorSpread: 5 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L6: 제곱수, 끝 blank
  {
    id: 'pat-find-6', levelIndex: 6, totalRounds: 10, timeLimit: 75,
    genParams: { patternTypes: ['square'], length: 5, blankPosition: 'end', difficultyRange: [5, 2], distractorSpread: 6 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L7: 등비수열, ratio 2, 끝 blank
  {
    id: 'pat-find-7', levelIndex: 7, totalRounds: 10, timeLimit: 75,
    genParams: { patternTypes: ['geometric'], length: 5, blankPosition: 'end', difficultyRange: [3, 2], distractorSpread: 8 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L8: 등비수열, ratio 2-3, 끝 blank
  {
    id: 'pat-find-8', levelIndex: 8, totalRounds: 10, timeLimit: 70,
    genParams: { patternTypes: ['geometric'], length: 5, blankPosition: 'end', difficultyRange: [4, 3], distractorSpread: 10 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L9: 등비수열+제곱수, any blank
  {
    id: 'pat-find-9', levelIndex: 9, totalRounds: 10, timeLimit: 70,
    genParams: { patternTypes: ['geometric', 'square'], length: 5, blankPosition: 'any', difficultyRange: [4, 3], distractorSpread: 10 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L10: 피보나치형, 끝 blank
  {
    id: 'pat-find-10', levelIndex: 10, totalRounds: 10, timeLimit: 70,
    genParams: { patternTypes: ['fibonacci'], length: 6, blankPosition: 'end', difficultyRange: [6, 6], distractorSpread: 8 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L11: 피보나치+등차 혼합
  {
    id: 'pat-find-11', levelIndex: 11, totalRounds: 10, timeLimit: 65,
    genParams: { patternTypes: ['fibonacci', 'arithmetic'], length: 6, blankPosition: 'any', difficultyRange: [8, 8], distractorSpread: 10 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L12: 교대 수열, 끝 blank
  {
    id: 'pat-find-12', levelIndex: 12, totalRounds: 10, timeLimit: 65,
    genParams: { patternTypes: ['alternating'], length: 6, blankPosition: 'end', difficultyRange: [8, 3], distractorSpread: 5 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L13: 교대+등비 혼합
  {
    id: 'pat-find-13', levelIndex: 13, totalRounds: 10, timeLimit: 60,
    genParams: { patternTypes: ['alternating', 'geometric'], length: 6, blankPosition: 'end', difficultyRange: [8, 3], distractorSpread: 10 },
    starThresholds: [5, 7, 10], requiresPrev: true,
  },
  // L14: 전체 혼합, any blank
  {
    id: 'pat-find-14', levelIndex: 14, totalRounds: 12, timeLimit: 60,
    genParams: { patternTypes: ['arithmetic', 'geometric', 'fibonacci', 'square'], length: 6, blankPosition: 'any', difficultyRange: [12, 4], distractorSpread: 12 },
    starThresholds: [6, 9, 12], requiresPrev: true,
  },
  // L15: 전체 혼합 최고 난이도
  {
    id: 'pat-find-15', levelIndex: 15, totalRounds: 12, timeLimit: 55,
    genParams: { patternTypes: ['arithmetic', 'geometric', 'fibonacci', 'square', 'alternating'], length: 6, blankPosition: 'any', difficultyRange: [15, 5], distractorSpread: 15 },
    starThresholds: [6, 9, 12], requiresPrev: true,
  },
];

export function getPatternLevel(id: string): PatternLevelConfig | undefined {
  return PATTERN_FINDER_LEVELS.find(l => l.id === id);
}
