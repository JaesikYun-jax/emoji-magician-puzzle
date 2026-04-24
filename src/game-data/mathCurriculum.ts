// 연산 타입
export type MathOpType = 'add' | 'sub' | 'mul' | 'div';
export type CarryMode = 'none' | 'with' | 'mixed';

export interface OperandRule {
  min: number;
  max: number;
  excludeZero?: boolean;
}

export interface MathCurriculumRule {
  id: string;
  grade: 1 | 2 | 3;
  semester: 1 | 2;
  op: MathOpType;
  carryMode: CarryMode;
  operandA: OperandRule;
  operandB: OperandRule;
  resultRange: [number, number];
  descKo: string;
  representativeQ: string;
}

export const MATH_CURRICULUM: MathCurriculumRule[] = [
  // 1학년 1학기
  { id: 'g1s1-add-single-no-carry', grade: 1, semester: 1, op: 'add', carryMode: 'none',
    operandA: { min: 1, max: 9 }, operandB: { min: 1, max: 9 }, resultRange: [2, 9],
    descKo: '1자리수 + 1자리수 (합 9 이하)', representativeQ: '3 + 4 = ?' },
  { id: 'g1s1-add-single-to-10', grade: 1, semester: 1, op: 'add', carryMode: 'none',
    operandA: { min: 1, max: 9 }, operandB: { min: 1, max: 9 }, resultRange: [10, 10],
    descKo: '10 만들기 (1자리수 + 1자리수)', representativeQ: '6 + 4 = ?' },
  { id: 'g1s1-sub-single', grade: 1, semester: 1, op: 'sub', carryMode: 'none',
    operandA: { min: 2, max: 9 }, operandB: { min: 1, max: 8 }, resultRange: [1, 8],
    descKo: '1자리수 - 1자리수 (결과 양수)', representativeQ: '7 - 3 = ?' },
  // 1학년 2학기
  { id: 'g1s2-add-2d1d-no-carry', grade: 1, semester: 2, op: 'add', carryMode: 'none',
    operandA: { min: 11, max: 89 }, operandB: { min: 1, max: 9 }, resultRange: [12, 99],
    descKo: '(두 자리수) + (한 자리수) — 받아올림 없음', representativeQ: '23 + 5 = ?' },
  { id: 'g1s2-add-2d1d-carry', grade: 1, semester: 2, op: 'add', carryMode: 'with',
    operandA: { min: 11, max: 89 }, operandB: { min: 1, max: 9 }, resultRange: [12, 98],
    descKo: '(두 자리수) + (한 자리수) — 받아올림 있음', representativeQ: '27 + 5 = ?' },
  { id: 'g1s2-sub-2d1d-no-borrow', grade: 1, semester: 2, op: 'sub', carryMode: 'none',
    operandA: { min: 12, max: 99 }, operandB: { min: 1, max: 9 }, resultRange: [1, 98],
    descKo: '(두 자리수) - (한 자리수) — 받아내림 없음', representativeQ: '35 - 3 = ?' },
  { id: 'g1s2-sub-2d1d-borrow', grade: 1, semester: 2, op: 'sub', carryMode: 'with',
    operandA: { min: 12, max: 99 }, operandB: { min: 1, max: 9 }, resultRange: [1, 98],
    descKo: '(두 자리수) - (한 자리수) — 받아내림 있음', representativeQ: '32 - 5 = ?' },
  // 2학년 1학기
  { id: 'g2s1-add-2d2d-no-carry', grade: 2, semester: 1, op: 'add', carryMode: 'none',
    operandA: { min: 11, max: 88 }, operandB: { min: 11, max: 88 }, resultRange: [22, 99],
    descKo: '(두 자리수) + (두 자리수) — 받아올림 없음', representativeQ: '24 + 35 = ?' },
  { id: 'g2s1-add-2d2d-carry', grade: 2, semester: 1, op: 'add', carryMode: 'with',
    operandA: { min: 11, max: 89 }, operandB: { min: 11, max: 89 }, resultRange: [23, 178],
    descKo: '(두 자리수) + (두 자리수) — 받아올림 있음', representativeQ: '47 + 36 = ?' },
  { id: 'g2s1-sub-2d2d-no-borrow', grade: 2, semester: 1, op: 'sub', carryMode: 'none',
    operandA: { min: 22, max: 99 }, operandB: { min: 11, max: 88 }, resultRange: [1, 88],
    descKo: '(두 자리수) - (두 자리수) — 받아내림 없음', representativeQ: '57 - 24 = ?' },
  { id: 'g2s1-sub-2d2d-borrow', grade: 2, semester: 1, op: 'sub', carryMode: 'with',
    operandA: { min: 22, max: 99 }, operandB: { min: 11, max: 88 }, resultRange: [1, 88],
    descKo: '(두 자리수) - (두 자리수) — 받아내림 있음', representativeQ: '62 - 37 = ?' },
  { id: 'g2s1-mul-2-5', grade: 2, semester: 1, op: 'mul', carryMode: 'none',
    operandA: { min: 2, max: 5 }, operandB: { min: 1, max: 9 }, resultRange: [2, 45],
    descKo: '구구단 2~5단', representativeQ: '3 × 7 = ?' },
  // 2학년 2학기
  { id: 'g2s2-mul-6-9', grade: 2, semester: 2, op: 'mul', carryMode: 'none',
    operandA: { min: 6, max: 9 }, operandB: { min: 1, max: 9 }, resultRange: [6, 81],
    descKo: '구구단 6~9단', representativeQ: '7 × 8 = ?' },
  { id: 'g2s2-mul-mixed', grade: 2, semester: 2, op: 'mul', carryMode: 'mixed',
    operandA: { min: 2, max: 9 }, operandB: { min: 1, max: 9 }, resultRange: [2, 81],
    descKo: '구구단 혼합 (2~9단)', representativeQ: '8 × 6 = ?' },
  { id: 'g2s2-add-3d', grade: 2, semester: 2, op: 'add', carryMode: 'mixed',
    operandA: { min: 100, max: 899 }, operandB: { min: 100, max: 899 }, resultRange: [201, 1000],
    descKo: '세 자리수 + 세 자리수', representativeQ: '247 + 385 = ?' },
  { id: 'g2s2-sub-3d', grade: 2, semester: 2, op: 'sub', carryMode: 'mixed',
    operandA: { min: 200, max: 999 }, operandB: { min: 100, max: 899 }, resultRange: [1, 899],
    descKo: '세 자리수 - 세 자리수', representativeQ: '534 - 267 = ?' },
  // 3학년 1학기
  { id: 'g3s1-mul-2d1d', grade: 3, semester: 1, op: 'mul', carryMode: 'mixed',
    operandA: { min: 11, max: 99 }, operandB: { min: 2, max: 9 }, resultRange: [22, 891],
    descKo: '(두 자리수) × (한 자리수)', representativeQ: '34 × 6 = ?' },
  { id: 'g3s1-div-basic', grade: 3, semester: 1, op: 'div', carryMode: 'none',
    operandA: { min: 2, max: 81 }, operandB: { min: 2, max: 9 }, resultRange: [1, 9],
    descKo: '나머지 없는 나눗셈 (구구단 역산)', representativeQ: '36 ÷ 4 = ?' },
  { id: 'g3s1-div-remainder', grade: 3, semester: 1, op: 'div', carryMode: 'none',
    operandA: { min: 10, max: 99 }, operandB: { min: 2, max: 9 }, resultRange: [1, 49],
    descKo: '나머지 있는 나눗셈', representativeQ: '29 ÷ 4 = ?' },
  // 3학년 2학기
  { id: 'g3s2-mul-2d2d', grade: 3, semester: 2, op: 'mul', carryMode: 'mixed',
    operandA: { min: 11, max: 99 }, operandB: { min: 11, max: 99 }, resultRange: [121, 9801],
    descKo: '(두 자리수) × (두 자리수)', representativeQ: '23 × 47 = ?' },
  { id: 'g3s2-div-2d1d', grade: 3, semester: 2, op: 'div', carryMode: 'none',
    operandA: { min: 10, max: 99 }, operandB: { min: 2, max: 9 }, resultRange: [1, 49],
    descKo: '(두 자리수) ÷ (한 자리수) — 몫 1자리', representativeQ: '72 ÷ 8 = ?' },
];

// 헬퍼 함수들
export function getCurriculumIndex(ruleId: string): number {
  return MATH_CURRICULUM.findIndex(r => r.id === ruleId);
}

export function getPrevRule(ruleId: string): MathCurriculumRule | null {
  const idx = getCurriculumIndex(ruleId);
  return idx > 0 ? MATH_CURRICULUM[idx - 1] : null;
}

export function getNextRule(ruleId: string): MathCurriculumRule | null {
  const idx = getCurriculumIndex(ruleId);
  return idx >= 0 && idx < MATH_CURRICULUM.length - 1 ? MATH_CURRICULUM[idx + 1] : null;
}

export function getRulesByGrade(grade: 1 | 2 | 3): MathCurriculumRule[] {
  return MATH_CURRICULUM.filter(r => r.grade === grade);
}
