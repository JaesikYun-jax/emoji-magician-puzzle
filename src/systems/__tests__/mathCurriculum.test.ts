import { describe, it, expect } from 'vitest';
import {
  MATH_CURRICULUM,
  getCurriculumIndex,
  getPrevRule,
  getNextRule,
  getRulesByGrade,
  type MathCurriculumRule,
} from '../../game-data/mathCurriculum';

describe('MATH_CURRICULUM 배열', () => {
  it('21개 이상의 룰을 포함한다', () => {
    expect(MATH_CURRICULUM.length).toBeGreaterThanOrEqual(21);
  });

  it('각 룰이 필수 필드를 모두 가진다', () => {
    const requiredKeys: (keyof MathCurriculumRule)[] = [
      'id', 'grade', 'semester', 'op', 'operandA', 'operandB', 'resultRange',
    ];
    for (const rule of MATH_CURRICULUM) {
      for (const key of requiredKeys) {
        expect(rule, `${rule.id} 에 ${key} 누락`).toHaveProperty(key);
      }
    }
  });

  it('operandA, operandB 에 min/max 가 있다', () => {
    for (const rule of MATH_CURRICULUM) {
      expect(typeof rule.operandA.min).toBe('number');
      expect(typeof rule.operandA.max).toBe('number');
      expect(typeof rule.operandB.min).toBe('number');
      expect(typeof rule.operandB.max).toBe('number');
    }
  });

  it('resultRange 가 [number, number] 튜플이다', () => {
    for (const rule of MATH_CURRICULUM) {
      expect(Array.isArray(rule.resultRange)).toBe(true);
      expect(rule.resultRange).toHaveLength(2);
      expect(typeof rule.resultRange[0]).toBe('number');
      expect(typeof rule.resultRange[1]).toBe('number');
      expect(rule.resultRange[0]).toBeLessThanOrEqual(rule.resultRange[1]);
    }
  });

  it('grade 는 1, 2, 3 중 하나만 존재한다', () => {
    const validGrades = new Set([1, 2, 3]);
    for (const rule of MATH_CURRICULUM) {
      expect(validGrades.has(rule.grade), `${rule.id} grade=${rule.grade}`).toBe(true);
    }
  });

  it('semester 는 1, 2 중 하나만 존재한다', () => {
    const validSemesters = new Set([1, 2]);
    for (const rule of MATH_CURRICULUM) {
      expect(validSemesters.has(rule.semester), `${rule.id} semester=${rule.semester}`).toBe(true);
    }
  });

  it('op 는 add/sub/mul/div 중 하나이다', () => {
    const validOps = new Set(['add', 'sub', 'mul', 'div']);
    for (const rule of MATH_CURRICULUM) {
      expect(validOps.has(rule.op), `${rule.id} op=${rule.op}`).toBe(true);
    }
  });

  it('id 가 중복 없이 유일하다', () => {
    const ids = MATH_CURRICULUM.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('getCurriculumIndex()', () => {
  it('존재하는 ruleId 의 인덱스를 반환한다', () => {
    const idx = getCurriculumIndex('g1s1-add-single-no-carry');
    expect(idx).toBe(0);
  });

  it('두 번째 룰의 인덱스는 1이다', () => {
    const idx = getCurriculumIndex(MATH_CURRICULUM[1].id);
    expect(idx).toBe(1);
  });

  it('존재하지 않는 ruleId 는 -1을 반환한다', () => {
    expect(getCurriculumIndex('nonexistent-rule')).toBe(-1);
  });
});

describe('getPrevRule()', () => {
  it('첫 번째 룰의 이전 룰은 null 이다', () => {
    expect(getPrevRule(MATH_CURRICULUM[0].id)).toBeNull();
  });

  it('두 번째 룰의 이전 룰은 첫 번째 룰이다', () => {
    const prev = getPrevRule(MATH_CURRICULUM[1].id);
    expect(prev).not.toBeNull();
    expect(prev!.id).toBe(MATH_CURRICULUM[0].id);
  });

  it('마지막 룰에 이전 룰이 존재한다', () => {
    const last = MATH_CURRICULUM[MATH_CURRICULUM.length - 1];
    const prev = getPrevRule(last.id);
    expect(prev).not.toBeNull();
    expect(prev!.id).toBe(MATH_CURRICULUM[MATH_CURRICULUM.length - 2].id);
  });

  it('존재하지 않는 ruleId 는 null 을 반환한다', () => {
    expect(getPrevRule('nonexistent')).toBeNull();
  });
});

describe('getNextRule()', () => {
  it('첫 번째 룰의 다음 룰은 두 번째 룰이다', () => {
    const next = getNextRule(MATH_CURRICULUM[0].id);
    expect(next).not.toBeNull();
    expect(next!.id).toBe(MATH_CURRICULUM[1].id);
  });

  it('마지막 룰의 다음 룰은 null 이다', () => {
    const last = MATH_CURRICULUM[MATH_CURRICULUM.length - 1];
    expect(getNextRule(last.id)).toBeNull();
  });

  it('존재하지 않는 ruleId 는 null 을 반환한다', () => {
    expect(getNextRule('nonexistent')).toBeNull();
  });
});

describe('getRulesByGrade()', () => {
  it('grade 1 룰만 반환한다', () => {
    const rules = getRulesByGrade(1);
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every(r => r.grade === 1)).toBe(true);
  });

  it('grade 2 룰만 반환한다', () => {
    const rules = getRulesByGrade(2);
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every(r => r.grade === 2)).toBe(true);
  });

  it('grade 3 룰만 반환한다', () => {
    const rules = getRulesByGrade(3);
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every(r => r.grade === 3)).toBe(true);
  });

  it('3개 학년의 룰 합산이 전체 룰 수와 같다', () => {
    const total = getRulesByGrade(1).length + getRulesByGrade(2).length + getRulesByGrade(3).length;
    expect(total).toBe(MATH_CURRICULUM.length);
  });
});
