import type { WordEntry } from '../../game-data/englishWords';

export type QuestionType = 'en-to-ko' | 'ko-to-en';

export interface EnglishQuizQuestion {
  word: WordEntry;
  questionType: QuestionType;
  choices: string[];      // en-to-ko: 한국어 보기 / ko-to-en: 영어 보기
  correctIdx: number;     // choices 배열에서 정답 인덱스
}

export interface EnglishQuizSession {
  questions: EnglishQuizQuestion[];
  totalCount: number;
}

export function shuffle<T>(arr: T[]): T[] {
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

/** 단어 1개 + 문제 유형으로 EnglishQuizQuestion 생성 */
export function buildQuestion(word: WordEntry, type: QuestionType, pool: WordEntry[]): EnglishQuizQuestion {
  const maxChoices = Math.min(4, Math.max(2, pool.length));
  const wrongCount = maxChoices - 1;
  const wrongs = pickWrongOptions(pool, word, wrongCount);
  const allChoices = shuffle([word, ...wrongs]);

  if (type === 'en-to-ko') {
    return {
      word,
      questionType: 'en-to-ko',
      choices: allChoices.map(w => w.korean),
      correctIdx: allChoices.findIndex(w => w.id === word.id),
    };
  } else {
    return {
      word,
      questionType: 'ko-to-en',
      choices: allChoices.map(w => w.english),
      correctIdx: allChoices.findIndex(w => w.id === word.id),
    };
  }
}

/**
 * words에서 count개 문제 생성.
 * - count개 중 1쌍(2문제)은 같은 단어를 en-to-ko + ko-to-en으로 출제 (페어)
 * - 나머지는 랜덤 방향 혼합
 * - words.length가 부족하면 가능한 범위 내에서 생성
 */
export function buildQuizSession(words: WordEntry[], count: number): EnglishQuizSession {
  if (words.length === 0) return { questions: [], totalCount: 0 };

  // 페어 포함 시 필요 unique 단어 수 = count - 1
  // 단, words가 부족하면 words 전체를 사용
  const canUsePair = count >= 2 && words.length >= 2;
  const uniqueNeeded = canUsePair ? Math.max(1, count - 1) : count;
  const uniqueCount = Math.min(uniqueNeeded, words.length);

  const selected = shuffle(words).slice(0, uniqueCount);

  const questions: EnglishQuizQuestion[] = [];

  if (canUsePair && selected.length >= 1) {
    // 페어 단어: 첫 번째 선택된 단어를 양방향으로 출제
    const pairWord = selected[0];
    const restWords = selected.slice(1);

    questions.push(buildQuestion(pairWord, 'en-to-ko', words));
    questions.push(buildQuestion(pairWord, 'ko-to-en', words));

    // 나머지 단어들은 랜덤 방향
    restWords.forEach(word => {
      const type: QuestionType = Math.random() < 0.5 ? 'en-to-ko' : 'ko-to-en';
      questions.push(buildQuestion(word, type, words));
    });
  } else {
    // 페어 없이 모두 en-to-ko (단어 수 부족 등 edge case)
    selected.forEach(word => {
      questions.push(buildQuestion(word, 'en-to-ko', words));
    });
  }

  const shuffledQuestions = shuffle(questions);
  return { questions: shuffledQuestions, totalCount: shuffledQuestions.length };
}
