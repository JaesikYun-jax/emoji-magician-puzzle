export type SentenceForm = 'SV' | 'SVC' | 'SVO';

export interface SentenceSlot {
  word: string;
  fixed: boolean; // true면 처음부터 표시, 탭 불가
}

export interface SentenceOrderingQuestion {
  id: string;
  slots: SentenceSlot[]; // 정답 순서대로
  distractors: string[]; // 오답 선택지 (정답 단어는 제외, 별도 혼합됨)
  form: SentenceForm;
  hintKo?: string;
}

export const SENTENCE_ORDERING_QUESTIONS: SentenceOrderingQuestion[] = [
  // 1. SV — Birds fly. (고정 없음)
  {
    id: 'so-001',
    slots: [
      { word: 'Birds', fixed: false },
      { word: 'fly', fixed: false },
    ],
    distractors: ['Cats', 'swim'],
    form: 'SV',
    hintKo: '주어 + 동사',
  },
  // 2. SVC — The sky is blue. (The 고정)
  {
    id: 'so-002',
    slots: [
      { word: 'The', fixed: true },
      { word: 'sky', fixed: false },
      { word: 'is', fixed: false },
      { word: 'blue', fixed: false },
    ],
    distractors: ['red', 'moon', 'are'],
    form: 'SVC',
    hintKo: '주어 + be동사 + 보어',
  },
  // 3. SVO — She likes apples. (고정 없음)
  {
    id: 'so-003',
    slots: [
      { word: 'She', fixed: false },
      { word: 'likes', fixed: false },
      { word: 'apples', fixed: false },
    ],
    distractors: ['He', 'eats', 'bananas'],
    form: 'SVO',
    hintKo: '주어 + 동사 + 목적어',
  },
  // 4. SV+부사 — Dogs run fast. (fast 고정)
  {
    id: 'so-004',
    slots: [
      { word: 'Dogs', fixed: false },
      { word: 'run', fixed: false },
      { word: 'fast', fixed: true },
    ],
    distractors: ['Cats', 'jump', 'walk'],
    form: 'SV',
    hintKo: '주어 + 동사 + 부사',
  },
  // 5. SVO — I see a star. (a 고정)
  {
    id: 'so-005',
    slots: [
      { word: 'I', fixed: false },
      { word: 'see', fixed: false },
      { word: 'a', fixed: true },
      { word: 'star', fixed: false },
    ],
    distractors: ['You', 'hear', 'moon'],
    form: 'SVO',
    hintKo: '주어 + 동사 + 목적어',
  },
];
