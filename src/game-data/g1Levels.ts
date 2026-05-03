export interface G1LevelData {
  levelId: number;
  name: string;
  nameEn: string;
  timeLimit: number;
  targetPairs: number;
  allowedNumbers: number[];
  adjacentPairGuarantee: number;
  starThresholds: { star3: number; star2: number };
}

export const G1_LEVELS: G1LevelData[] = [
  {
    levelId: 1,
    name: '달콤한 시작',
    nameEn: 'Sweet Start',
    timeLimit: 60,
    targetPairs: 10,
    allowedNumbers: [1, 4, 5, 6, 9],
    adjacentPairGuarantee: 5,
    starThresholds: { star3: 45, star2: 60 },
  },
  {
    levelId: 2,
    name: '수박 한 판',
    nameEn: 'Watermelon Round',
    timeLimit: 60,
    targetPairs: 10,
    allowedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    adjacentPairGuarantee: 2,
    starThresholds: { star3: 40, star2: 60 },
  },
  {
    levelId: 3,
    name: '씨 없는 수박',
    nameEn: 'Seedless Watermelon',
    timeLimit: 60,
    targetPairs: 10,
    allowedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    adjacentPairGuarantee: 0,
    starThresholds: { star3: 35, star2: 60 },
  },
  {
    levelId: 4,
    name: '폭풍 수박',
    nameEn: 'Storm Melon',
    timeLimit: 50,
    targetPairs: 13,
    allowedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    adjacentPairGuarantee: 0,
    starThresholds: { star3: 30, star2: 50 },
  },
  {
    levelId: 5,
    name: '마법사의 시험',
    nameEn: "Wizard's Trial",
    timeLimit: 45,
    targetPairs: 15,
    allowedNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    adjacentPairGuarantee: 0,
    starThresholds: { star3: 25, star2: 45 },
  },
];
