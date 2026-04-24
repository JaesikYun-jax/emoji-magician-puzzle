import type { LogicLevelConfig } from '../systems/logic/patternJudge';

export const LOGIC_LEVELS: LogicLevelConfig[] = [
  {
    id: 'logic-1',
    subject: 'logic',
    totalRounds: 5,
    timeLimit: 60,
    genParams: { types: ['arithmetic'], sequenceLength: 4, choiceCount: 3, maxValue: 50 },
    starThresholds: [3, 4, 5],
  },
  {
    id: 'logic-2',
    subject: 'logic',
    totalRounds: 6,
    timeLimit: 60,
    genParams: { types: ['arithmetic'], sequenceLength: 5, choiceCount: 3, maxValue: 80 },
    starThresholds: [4, 5, 6],
  },
  {
    id: 'logic-3',
    subject: 'logic',
    totalRounds: 6,
    timeLimit: 55,
    genParams: { types: ['arithmetic', 'fibonacci'], sequenceLength: 5, choiceCount: 4, maxValue: 100 },
    starThresholds: [4, 5, 6],
  },
  {
    id: 'logic-4',
    subject: 'logic',
    totalRounds: 6,
    timeLimit: 55,
    genParams: { types: ['arithmetic', 'geometric'], sequenceLength: 5, choiceCount: 4, maxValue: 150 },
    starThresholds: [4, 5, 6],
  },
  {
    id: 'logic-5',
    subject: 'logic',
    totalRounds: 7,
    timeLimit: 50,
    genParams: { types: ['arithmetic', 'geometric', 'fibonacci'], sequenceLength: 5, choiceCount: 4, maxValue: 200 },
    starThresholds: [5, 6, 7],
  },
  {
    id: 'logic-6',
    subject: 'logic',
    totalRounds: 7,
    timeLimit: 50,
    genParams: { types: ['arithmetic', 'geometric', 'square'], sequenceLength: 5, choiceCount: 4, maxValue: 200 },
    starThresholds: [5, 6, 7],
  },
  {
    id: 'logic-7',
    subject: 'logic',
    totalRounds: 8,
    timeLimit: 45,
    genParams: { types: ['arithmetic', 'geometric', 'fibonacci', 'square'], sequenceLength: 5, choiceCount: 4, maxValue: 250 },
    starThresholds: [5, 6, 8],
  },
  {
    id: 'logic-8',
    subject: 'logic',
    totalRounds: 8,
    timeLimit: 45,
    genParams: { types: ['arithmetic', 'alternating', 'fibonacci'], sequenceLength: 6, choiceCount: 4, maxValue: 300 },
    starThresholds: [5, 7, 8],
  },
  {
    id: 'logic-9',
    subject: 'logic',
    totalRounds: 8,
    timeLimit: 40,
    genParams: { types: ['arithmetic', 'geometric', 'fibonacci', 'square', 'alternating'], sequenceLength: 6, choiceCount: 4, maxValue: 400 },
    starThresholds: [6, 7, 8],
  },
  {
    id: 'logic-10',
    subject: 'logic',
    totalRounds: 10,
    timeLimit: 60,
    genParams: { types: ['arithmetic', 'geometric', 'fibonacci', 'square', 'alternating'], sequenceLength: 6, choiceCount: 4, maxValue: 500 },
    starThresholds: [7, 8, 10],
  },
];

export function getLogicLevel(id: string): LogicLevelConfig | undefined {
  return LOGIC_LEVELS.find(l => l.id === id);
}
