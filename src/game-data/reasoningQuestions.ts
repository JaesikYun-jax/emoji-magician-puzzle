/**
 * reasoningQuestions.ts
 * 이 파일은 하위 호환용 re-export입니다.
 * 실제 문제 데이터는 src/game-data/banks/reasoningBank.ts 에서 관리합니다.
 */
export type {
  ReasoningKind,
  ReasoningDifficulty,
  ReasoningQuestion,
} from './banks/reasoningBank';

export {
  REASONING_BANK as REASONING_QUESTIONS,
  getQuestionsByDifficulty,
  pickRound,
} from './banks/reasoningBank';
