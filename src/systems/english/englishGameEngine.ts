import type { WordEntry } from '../../game-data/englishWords';

export interface EnglishQuizQuestion {
  word: WordEntry;
  choices: string[];      // 한국어 보기 (랜덤 순서)
  correctIdx: number;     // choices 배열에서 정답 인덱스
}

export interface EnglishQuizSession {
  questions: EnglishQuizQuestion[];
  totalCount: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** pool에서 correct를 제외하고 n개 오답 선택. pool이 n개 미만이면 있는 만큼만 반환 */
export function pickWrongOptions(pool: WordEntry[], correct: WordEntry, n: number): WordEntry[] {
  const filtered = pool.filter(w => w.id !== correct.id && w.korean !== correct.korean);
  return shuffle(filtered).slice(0, n);
}

/** words에서 count개 문제 생성. words.length < count이면 words 전체 사용 */
export function buildQuizSession(words: WordEntry[], count: number): EnglishQuizSession {
  if (words.length === 0) return { questions: [], totalCount: 0 };

  const selected = words.length <= count ? shuffle(words) : shuffle(words).slice(0, count);

  const questions: EnglishQuizQuestion[] = selected.map(word => {
    const maxChoices = Math.min(4, Math.max(2, words.length));
    const wrongCount = maxChoices - 1;
    const wrongs = pickWrongOptions(words, word, wrongCount);
    const allChoices = shuffle([word, ...wrongs]);
    return {
      word,
      choices: allChoices.map(w => w.korean),
      correctIdx: allChoices.findIndex(w => w.id === word.id),
    };
  });

  return { questions, totalCount: questions.length };
}
