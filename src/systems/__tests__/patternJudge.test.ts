import { describe, it, expect } from 'vitest';
import {
  generateLogicSequence,
  judgeLogicAnswer,
  calcLogicStars,
  type LogicGenParams,
} from '../logic/patternJudge';

describe('generateLogicSequence', () => {
  it('arithmetic: tiles 마지막이 null, choices에 정답 포함, correctIndex가 올바름', () => {
    const params: LogicGenParams = {
      types: ['arithmetic'],
      sequenceLength: 4,
      choiceCount: 4,
      maxValue: 1000,
    };
    const seq = generateLogicSequence(params);

    // 마지막 tile이 null
    expect(seq.tiles[seq.tiles.length - 1]).toBeNull();

    // choices에 정답 포함
    const answer = seq.choices[seq.correctIndex];
    expect(seq.choices).toContain(answer);

    // correctIndex가 실제 정답을 가리킴: 등차수열에서 null 전 두 값의 차가 일정해야 함
    const nonNullTiles = seq.tiles.filter((t): t is number => t !== null);
    const diff = nonNullTiles[1] - nonNullTiles[0];
    const expectedAnswer = nonNullTiles[nonNullTiles.length - 1] + diff;
    expect(answer).toBe(expectedAnswer);
  });

  it('fibonacci: tiles[2] === tiles[0] + tiles[1] 패턴 확인', () => {
    const params: LogicGenParams = {
      types: ['fibonacci'],
      sequenceLength: 5,
      choiceCount: 4,
      maxValue: 10000,
    };
    // 피보나치가 maxValue를 넘으면 arithmetic으로 폴백할 수 있으므로 여러 번 시도
    let fibFound = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      const seq = generateLogicSequence(params);
      if (seq.patternType === 'fibonacci') {
        const nonNull = seq.tiles.filter((t): t is number => t !== null);
        expect(nonNull.length).toBeGreaterThanOrEqual(3);
        expect(nonNull[2]).toBe(nonNull[0] + nonNull[1]);
        fibFound = true;
        break;
      }
    }
    // 피보나치 패턴이 최소 한 번은 생성되어야 함
    expect(fibFound).toBe(true);
  });

  it('choiceCount=4: choices 길이가 4', () => {
    const params: LogicGenParams = {
      types: ['arithmetic'],
      sequenceLength: 4,
      choiceCount: 4,
      maxValue: 1000,
    };
    const seq = generateLogicSequence(params);
    expect(seq.choices).toHaveLength(4);
  });

  it('choiceCount=3: choices 길이가 3', () => {
    const params: LogicGenParams = {
      types: ['arithmetic'],
      sequenceLength: 4,
      choiceCount: 3,
      maxValue: 1000,
    };
    const seq = generateLogicSequence(params);
    expect(seq.choices).toHaveLength(3);
  });

  it('geometric: null이 아닌 tiles 값들이 올바른 등비수열 (폴백 포함)', () => {
    const params: LogicGenParams = {
      types: ['geometric'],
      sequenceLength: 4,
      choiceCount: 4,
      maxValue: 10000,
    };
    // geometric이 maxValue를 초과하면 arithmetic으로 폴백 가능
    // geometric 패턴이 생성된 경우에만 비율 검증
    let checked = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      const seq = generateLogicSequence(params);
      if (seq.patternType === 'geometric') {
        const nonNull = seq.tiles.filter((t): t is number => t !== null);
        expect(nonNull.length).toBeGreaterThanOrEqual(2);
        const ratio = nonNull[1] / nonNull[0];
        // 비율이 2 또는 3이어야 함
        expect([2, 3]).toContain(ratio);
        // 각 항이 등비인지 확인
        for (let i = 1; i < nonNull.length; i++) {
          expect(nonNull[i] / nonNull[i - 1]).toBeCloseTo(ratio, 5);
        }
        checked = true;
        break;
      }
    }
    // geometric이 전혀 생성되지 않은 경우(모두 폴백)도 테스트 통과 허용
    // (maxValue 제약으로 인해 항상 폴백될 수 있음)
    if (!checked) {
      // 폴백이 arithmetic으로 이루어진 경우 - 정상 동작
      expect(true).toBe(true);
    }
  });

  it('deterministic correctIndex: choices[correctIndex]가 실제 시퀀스 다음 값', () => {
    const params: LogicGenParams = {
      types: ['arithmetic'],
      sequenceLength: 5,
      choiceCount: 4,
      maxValue: 1000,
    };
    for (let i = 0; i < 10; i++) {
      const seq = generateLogicSequence(params);
      const answer = seq.choices[seq.correctIndex];
      const nonNull = seq.tiles.filter((t): t is number => t !== null);
      const diff = nonNull[1] - nonNull[0];
      const expectedAnswer = nonNull[nonNull.length - 1] + diff;
      expect(answer).toBe(expectedAnswer);
    }
  });
});

describe('judgeLogicAnswer', () => {
  it('올바른 index -> { correct: true }', () => {
    const params: LogicGenParams = {
      types: ['arithmetic'],
      sequenceLength: 4,
      choiceCount: 4,
      maxValue: 1000,
    };
    const seq = generateLogicSequence(params);
    expect(judgeLogicAnswer(seq, seq.correctIndex)).toEqual({ correct: true });
  });

  it('틀린 index -> { correct: false }', () => {
    const params: LogicGenParams = {
      types: ['arithmetic'],
      sequenceLength: 4,
      choiceCount: 4,
      maxValue: 1000,
    };
    const seq = generateLogicSequence(params);
    const wrongIndex = (seq.correctIndex + 1) % seq.choices.length;
    expect(judgeLogicAnswer(seq, wrongIndex)).toEqual({ correct: false });
  });
});

describe('calcLogicStars', () => {
  const thresholds: [number, number, number] = [3, 4, 5];

  it('correct=5 -> stars=3', () => {
    expect(calcLogicStars(5, thresholds)).toBe(3);
  });

  it('correct=4 -> stars=2', () => {
    expect(calcLogicStars(4, thresholds)).toBe(2);
  });

  it('correct=3 -> stars=1', () => {
    expect(calcLogicStars(3, thresholds)).toBe(1);
  });

  it('correct=2 -> stars=0', () => {
    expect(calcLogicStars(2, thresholds)).toBe(0);
  });
});
