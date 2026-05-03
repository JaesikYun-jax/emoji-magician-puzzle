import { describe, it, expect } from 'vitest';
import { generateProblem, generateSession } from '../engine';
import type { SentenceTemplate } from '../types';

// ── 테스트용 템플릿 ──────────────────────────────────────────────────────────
const TPL_BEGINNER: SentenceTemplate = {
  id: 'test-beg-01',
  tokens: [
    { text: 'A',    blankable: false },
    { text: 'cat',  blankable: true },
    { text: 'runs', blankable: true },
  ],
  meaningKo: '고양이 한 마리가 달린다.',
  difficulty: 'beginner',
};

// 인접하지 않는 blankable 토큰을 충분히 포함 (인덱스 1, 4, 6 → 간격 ≥ 2)
const TPL_INTERMEDIATE: SentenceTemplate = {
  id: 'test-int-01',
  tokens: [
    { text: 'The',   blankable: false },
    { text: 'sky',   blankable: true  },
    { text: 'is',    blankable: false },
    { text: 'very',  blankable: false },
    { text: 'blue',  blankable: true  },
    { text: 'today', blankable: false },
    { text: 'here',  blankable: true  },
  ],
  meaningKo: '오늘 하늘은 매우 파랗다.',
  difficulty: 'intermediate',
};

const TPL_ADVANCED: SentenceTemplate = {
  id: 'test-adv-01',
  tokens: [
    { text: 'My',     blankable: false },
    { text: 'dog',    blankable: true },
    { text: 'loves',  blankable: true },
    { text: 'to',     blankable: false },
    { text: 'eat',    blankable: true },
    { text: 'red',    blankable: true },
    { text: 'apples', blankable: true },
  ],
  meaningKo: '내 강아지는 빨간 사과 먹는 것을 좋아한다.',
  difficulty: 'advanced',
};

const TPL_EXPERT: SentenceTemplate = {
  id: 'test-exp-01',
  tokens: [
    { text: 'The',          blankable: false },
    { text: 'curious',      blankable: true },
    { text: 'student',      blankable: true },
    { text: 'thoroughly',   blankable: true },
    { text: 'examined',     blankable: true },
    { text: 'the',          blankable: false },
    { text: 'mysterious',   blankable: true },
    { text: 'manuscript',   blankable: true },
  ],
  meaningKo: '그 호기심 많은 학생은 신비로운 원고를 철저히 검토했다.',
  difficulty: 'expert',
};

describe('generateProblem', () => {
  it('beginner: 빈칸 2개, 보기 = 정답 2개 셔플', () => {
    const prob = generateProblem(TPL_BEGINNER, 'beginner', 42);
    expect(prob.blanks).toHaveLength(2);
    expect(prob.choices).toHaveLength(2);
    // 보기에 가짜 단어 없음 — 정답들의 셔플본
    const answersSorted = prob.blanks.map((b) => b.answer).sort();
    const choicesSorted = [...prob.choices].sort();
    expect(choicesSorted).toEqual(answersSorted);
  });

  it('elementary: 빈칸 2개, 보기 2개', () => {
    const tpl: SentenceTemplate = { ...TPL_INTERMEDIATE, id: 'elem-test', difficulty: 'elementary' };
    const prob = generateProblem(tpl, 'elementary', 42);
    expect(prob.blanks).toHaveLength(2);
    expect(prob.choices).toHaveLength(2);
  });

  it('intermediate: 빈칸 3개, 보기 3개', () => {
    const prob = generateProblem(TPL_INTERMEDIATE, 'intermediate', 42);
    expect(prob.blanks).toHaveLength(3);
    expect(prob.choices).toHaveLength(3);
  });

  it('advanced: 빈칸 4개, 보기 4개', () => {
    const prob = generateProblem(TPL_ADVANCED, 'advanced', 42);
    expect(prob.blanks).toHaveLength(4);
    expect(prob.choices).toHaveLength(4);
  });

  it('expert: 빈칸 5개, 보기 5개', () => {
    const prob = generateProblem(TPL_EXPERT, 'expert', 42);
    expect(prob.blanks).toHaveLength(5);
    expect(prob.choices).toHaveLength(5);
  });

  it('보기에 가짜 단어 없음 (모두 정답들의 셔플)', () => {
    const prob = generateProblem(TPL_INTERMEDIATE, 'intermediate', 7);
    const answers = new Set(prob.blanks.map((b) => b.answer));
    prob.choices.forEach((c) => expect(answers.has(c)).toBe(true));
  });

  it('intermediate 이상: 인접 빈칸 없음', () => {
    for (let seed = 0; seed < 20; seed++) {
      const prob = generateProblem(TPL_INTERMEDIATE, 'intermediate', seed);
      const idxs = prob.blanks.map((b) => b.tokenIndex);
      for (let i = 1; i < idxs.length; i++) {
        expect(idxs[i] - idxs[i - 1]).toBeGreaterThan(1);
      }
    }
  });

  it('blanks 순서 = 토큰 등장 순서 (왼→오)', () => {
    const prob = generateProblem(TPL_ADVANCED, 'advanced', 0);
    const idxs = prob.blanks.map((b) => b.tokenIndex);
    const sorted = [...idxs].sort((a, b) => a - b);
    expect(idxs).toEqual(sorted);
  });

  it('blankable=false 토큰은 절대 빈칸 안 됨', () => {
    for (let seed = 0; seed < 30; seed++) {
      const prob = generateProblem(TPL_ADVANCED, 'advanced', seed);
      prob.blanks.forEach((b) => {
        expect(TPL_ADVANCED.tokens[b.tokenIndex].blankable).toBe(true);
      });
    }
  });

  it('결정론: 같은 seed → 동일 결과', () => {
    const a = generateProblem(TPL_INTERMEDIATE, 'intermediate', 42);
    const b = generateProblem(TPL_INTERMEDIATE, 'intermediate', 42);
    expect(a).toEqual(b);
  });

  it('빈칸이 아닌 토큰은 원래 순서·표면형 유지', () => {
    const prob = generateProblem(TPL_BEGINNER, 'beginner', 1);
    const fixedTexts = TPL_BEGINNER.tokens.filter((t) => !t.blankable).map((t) => t.text);
    const nonBlankTexts = prob.tokens.filter((t) => !t.isBlank).map((t) => t.text);
    fixedTexts.forEach((text) => expect(nonBlankTexts).toContain(text));
  });

  it('빈칸 후보 부족: graceful degrade (가능한 만큼만 생성)', () => {
    // beginner는 2 빈칸 요구하지만 후보가 1개만 있으면 1개만
    const tpl: SentenceTemplate = {
      id: 'sparse',
      tokens: [{ text: 'I', blankable: false }, { text: 'run', blankable: true }, { text: '.', blankable: false }],
      meaningKo: '나는 달린다.',
      difficulty: 'beginner',
    };
    const prob = generateProblem(tpl, 'beginner', 0);
    expect(prob.blanks).toHaveLength(1);
    expect(prob.choices).toHaveLength(1);
    expect(prob.choices[0]).toBe('run');
  });
});

describe('generateSession', () => {
  it('요청한 수만큼 문제 생성', () => {
    const probs = generateSession([TPL_BEGINNER], 'beginner', 5, 0);
    expect(probs).toHaveLength(5);
  });

  it('템플릿 없으면 빈 배열', () => {
    const probs = generateSession([], 'beginner', 5, 0);
    expect(probs).toHaveLength(0);
  });
});
