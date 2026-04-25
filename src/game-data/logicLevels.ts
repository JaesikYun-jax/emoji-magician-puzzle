import type { LogicLevelConfig } from '../systems/logic/patternJudge';

/**
 * 논리 레벨 — 단계적 깊이.
 *
 * 패턴 도입 순서 (점진적 난이도):
 *   L1: ab                    — 가장 단순한 교대
 *   L2: ab + abc              — 교대 + 3종 순환
 *   L3: abc + abcd            — 3종 + 4종 순환
 *   L4: abcd + aabb           — 4종 순환 + 쌍 교대
 *   L5: aabb + aaab           — 쌍 교대 + 3+1 비대칭
 *   L6: aabb + aaab + abba    — + 대칭(회문)
 *   L7: abcd + abba + aabbcc  — 깊이 ↑ (3종 쌍 교대 도입)
 *   L8: aabb + abba + abccba  — 깊이 ↑ (3종 회문 도입)
 *   L9: aabbcc + abccba + abcd — 가장 어려운 3종 패턴 + 4종 순환
 *   L10: 모든 8종 패턴 — 마스터 챌린지
 *
 * sequenceLength는 deprecated (각 패턴이 자체 visibleCount를 가짐).
 * 라운드/시간/별점 기준만 레벨별로 조정.
 */
export const LOGIC_LEVELS: LogicLevelConfig[] = [
  {
    id: 'logic-1',
    subject: 'logic',
    totalRounds: 5,
    timeLimit: 90,
    genParams: { types: ['ab'] },
    starThresholds: [3, 4, 5],
  },
  {
    id: 'logic-2',
    subject: 'logic',
    totalRounds: 6,
    timeLimit: 90,
    genParams: { types: ['ab', 'abc'] },
    starThresholds: [4, 5, 6],
  },
  {
    id: 'logic-3',
    subject: 'logic',
    totalRounds: 6,
    timeLimit: 80,
    genParams: { types: ['abc', 'abcd'] },
    starThresholds: [4, 5, 6],
  },
  {
    id: 'logic-4',
    subject: 'logic',
    totalRounds: 7,
    timeLimit: 80,
    genParams: { types: ['abcd', 'aabb'] },
    starThresholds: [4, 6, 7],
  },
  {
    id: 'logic-5',
    subject: 'logic',
    totalRounds: 7,
    timeLimit: 75,
    genParams: { types: ['aabb', 'aaab'] },
    starThresholds: [4, 6, 7],
  },
  {
    id: 'logic-6',
    subject: 'logic',
    totalRounds: 8,
    timeLimit: 70,
    genParams: { types: ['aabb', 'aaab', 'abba'] },
    starThresholds: [5, 6, 8],
  },
  {
    id: 'logic-7',
    subject: 'logic',
    totalRounds: 8,
    timeLimit: 70,
    genParams: { types: ['abcd', 'abba', 'aabbcc'] },
    starThresholds: [5, 7, 8],
  },
  {
    id: 'logic-8',
    subject: 'logic',
    totalRounds: 9,
    timeLimit: 65,
    genParams: { types: ['aabb', 'abba', 'abccba'] },
    starThresholds: [6, 7, 9],
  },
  {
    id: 'logic-9',
    subject: 'logic',
    totalRounds: 9,
    timeLimit: 60,
    genParams: { types: ['aabbcc', 'abccba', 'abcd'] },
    starThresholds: [6, 8, 9],
  },
  {
    id: 'logic-10',
    subject: 'logic',
    totalRounds: 10,
    timeLimit: 65,
    genParams: { types: ['ab', 'abc', 'abcd', 'aabb', 'aaab', 'abba', 'aabbcc', 'abccba'] },
    starThresholds: [7, 8, 10],
  },
];

export function getLogicLevel(id: string): LogicLevelConfig | undefined {
  return LOGIC_LEVELS.find(l => l.id === id);
}
