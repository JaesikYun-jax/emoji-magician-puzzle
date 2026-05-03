import { shuffleArray } from '../../utils/shuffle';
import type {
  SentenceTemplate,
  FIBDifficulty,
  GeneratedProblem,
} from './types';
import { DIFFICULTY_RULES } from './types';

/**
 * 템플릿 하나에서 GeneratedProblem을 생성한다.
 * 같은 (template, difficulty, seed) → 항상 동일한 결과 (결정론적).
 *
 * 보기는 정답 단어들만으로 구성되며 (가짜 단어 없음), 사용자는
 * 보기를 순서대로 클릭하여 빈칸을 왼쪽부터 채워나간다.
 */
export function generateProblem(
  template: SentenceTemplate,
  difficulty: FIBDifficulty,
  seed?: number,
): GeneratedProblem {
  const rule = DIFFICULTY_RULES[difficulty];

  // 빈칸 후보 토큰 인덱스 목록
  const blankableIdxs = template.tokens
    .map((tok, i) => (tok.blankable ? i : -1))
    .filter((i) => i !== -1);

  // 빈칸 개수 결정
  let targetBlanks: number;
  if (typeof rule.blankCount === 'number') {
    targetBlanks = rule.blankCount;
  } else {
    const [min, max] = rule.blankCount;
    const rand = seed !== undefined ? seededRandFn(seed + 999) : Math.random;
    targetBlanks = min + Math.floor(rand() * (max - min + 1));
  }

  // 후보보다 많이 뽑을 수 없음 (graceful degrade)
  targetBlanks = Math.min(targetBlanks, blankableIdxs.length);

  // 빈칸 인덱스 선택 (인접 금지: intermediate 이상)
  const chosenIdxs = pickBlankIndices(blankableIdxs, targetBlanks, difficulty, seed);
  const chosenSet = new Set(chosenIdxs);

  // tokens 배열 조립
  let blankCounter = 0;
  const outputTokens = template.tokens.map((tok, i) => {
    if (chosenSet.has(i)) {
      return { text: tok.text, isBlank: true, blankIndex: blankCounter++ };
    }
    return { text: tok.text, isBlank: false };
  });

  // blanks 배열 (빈칸 순서대로의 정답)
  const blanks = chosenIdxs.map((tokenIdx) => ({
    tokenIndex: tokenIdx,
    answer: template.tokens[tokenIdx].text,
  }));

  // 보기 = 정답들을 셔플한 배열
  const answersInOrder = blanks.map((b) => b.answer);
  const choices = shuffleArray(
    answersInOrder,
    seed !== undefined ? seed + 1234 : undefined,
  );

  return {
    templateId: template.id,
    meaningKo: template.meaningKo,
    tokens: outputTokens,
    blanks,
    choices,
  };
}

/**
 * 빈칸 위치 선택.
 * intermediate/advanced에서 인접 금지 (tokenIdx 차이 <= 1 인 쌍 불허).
 * 후보 부족 시 인접 금지 완화.
 */
function pickBlankIndices(
  candidates: number[],
  count: number,
  difficulty: FIBDifficulty,
  seed?: number,
): number[] {
  const noAdjacent = difficulty === 'intermediate' || difficulty === 'advanced';
  const shuffled = shuffleArray(candidates, seed);

  if (!noAdjacent || count <= 1) {
    return [...shuffled.slice(0, count)].sort((a, b) => a - b);
  }

  // 인접 금지 greedy 선택
  const chosen: number[] = [];
  for (const idx of shuffled) {
    if (chosen.length >= count) break;
    const adjacent = chosen.some((c) => Math.abs(c - idx) <= 1);
    if (!adjacent) chosen.push(idx);
  }

  // 인접 금지로 부족하면 완화
  if (chosen.length < count) {
    for (const idx of shuffled) {
      if (chosen.length >= count) break;
      if (!chosen.includes(idx)) chosen.push(idx);
    }
  }

  return chosen.sort((a, b) => a - b);
}

function seededRandFn(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * 여러 템플릿에서 세션(문제 목록)을 생성한다.
 */
export function generateSession(
  templates: SentenceTemplate[],
  difficulty: FIBDifficulty,
  count: number,
  seed?: number,
): GeneratedProblem[] {
  if (templates.length === 0) return [];

  const shuffled = shuffleArray(templates, seed);
  const picked: SentenceTemplate[] = [];
  while (picked.length < count) picked.push(...shuffled);
  const session = picked.slice(0, count);

  return session.map((tpl, i) =>
    generateProblem(
      tpl,
      difficulty,
      seed !== undefined ? seed + i * 1000 : undefined,
    ),
  );
}
