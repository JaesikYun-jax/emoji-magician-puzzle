import type { SentenceOrderingQuestion } from '../../game-data/sentenceOrderingLevels';

/** 빈 슬롯(fixed=false)의 정답 단어 배열 반환 */
export function getAnswerWords(q: SentenceOrderingQuestion): string[] {
  return q.slots.filter(s => !s.fixed).map(s => s.word);
}

/** 선택지 카드 목록 생성: 정답 단어 + distractors를 섞어서 반환 */
export function buildCardPool(q: SentenceOrderingQuestion, seed?: number): string[] {
  const pool = [...getAnswerWords(q), ...q.distractors];
  return shuffleArray(pool, seed);
}

/** 사용자가 선택한 순서가 정답인지 판정 */
export function validateAnswer(selected: string[], q: SentenceOrderingQuestion): boolean {
  const answer = getAnswerWords(q);
  if (selected.length !== answer.length) return false;
  return selected.every((w, i) => w === answer[i]);
}

/** 전체 실수 횟수 기반 별 계산 */
export function computeStars(totalMistakes: number): number {
  if (totalMistakes <= 1) return 3;
  if (totalMistakes <= 3) return 2;
  return 1;
}

/** Fisher-Yates shuffle (순수 함수) */
export function shuffleArray<T>(arr: T[], seed?: number): T[] {
  const copy = [...arr];
  const rand = seed !== undefined ? seededRandom(seed) : Math.random;
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
