export interface DifficultyOption {
  id: string;
  label: string;
}

export interface GameDifficultySettings {
  paramKey: 'levelId' | 'difficulty';
  panelLabel: string;
  options: DifficultyOption[];
}

export interface GameDefinition {
  id: string;
  subjectId: string;
  labelKo: string;
  labelEn: string;
  descriptionKo: string;
  descriptionEn: string;
  icon: string;
  routeId: string;
  isDefault: boolean;
  difficultySettings?: GameDifficultySettings;
}

export const GAMES_CATALOG: GameDefinition[] = [
  // math 분야
  {
    id: 'eq-fill',
    subjectId: 'math',
    labelKo: '식 채우기',
    labelEn: 'Fill the Equation',
    descriptionKo: '빈 칸에 알맞은 숫자나 기호를 채워 넣어요',
    descriptionEn: 'Fill in the blanks with the right numbers or symbols',
    icon: '🔢',
    routeId: 'game-eq-fill',
    isDefault: true,
    difficultySettings: {
      paramKey: 'levelId',
      panelLabel: '레벨 선택',
      options: [
        { id: 'eq-fill-1',  label: '입문 (Lv.1~3)' },
        { id: 'eq-fill-4',  label: '초급 (Lv.4~6)' },
        { id: 'eq-fill-7',  label: '중급 (Lv.7~9)' },
        { id: 'eq-fill-10', label: '고급 (Lv.10~12)' },
        { id: 'eq-fill-13', label: '심화 (Lv.13~15)' },
      ],
    },
  },
  {
    id: 'pat-find',
    subjectId: 'math',
    labelKo: '패턴 찾기',
    labelEn: 'Pattern Finder',
    descriptionKo: '숫자와 도형 패턴의 규칙을 찾아요',
    descriptionEn: 'Find the rule in number and shape patterns',
    icon: '🔷',
    routeId: 'game-pattern-finder',
    isDefault: false,
    difficultySettings: {
      paramKey: 'levelId',
      panelLabel: '레벨 선택',
      options: [
        { id: 'pat-find-1',  label: '입문 (Lv.1~3)' },
        { id: 'pat-find-4',  label: '초급 (Lv.4~6)' },
        { id: 'pat-find-7',  label: '중급 (Lv.7~9)' },
        { id: 'pat-find-10', label: '고급 (Lv.10~12)' },
        { id: 'pat-find-13', label: '심화 (Lv.13~15)' },
      ],
    },
  },
  {
    id: 'arithmetic',
    subjectId: 'math',
    labelKo: '산수 퀴즈',
    labelEn: 'Arithmetic Quiz',
    descriptionKo: '빠르게 덧셈·뺄셈·곱셈 문제를 풀어요',
    descriptionEn: 'Quickly solve addition, subtraction, and multiplication',
    icon: '➕',
    routeId: 'game-arithmetic',
    isDefault: false,
    difficultySettings: {
      paramKey: 'difficulty',
      panelLabel: '난이도 선택',
      options: [
        { id: 'easy',   label: '쉬움' },
        { id: 'normal', label: '보통' },
        { id: 'hard',   label: '어려움' },
      ],
    },
  },
  // english 분야
  {
    id: 'english-spelling',
    subjectId: 'english',
    labelKo: '단어 스펠링',
    labelEn: 'Word Spelling',
    descriptionKo: '이미지를 보고 영어 단어 철자를 맞혀요',
    descriptionEn: 'See the image and spell the English word',
    icon: '🔤',
    routeId: 'game-english',
    isDefault: true,
    difficultySettings: {
      paramKey: 'levelId',
      panelLabel: '레벨 선택',
      options: [
        { id: 'beginner',     label: '입문' },
        { id: 'elementary',   label: '기초' },
        { id: 'intermediate', label: '중급' },
        { id: 'advanced',     label: '고급' },
      ],
    },
  },
  {
    id: 'english-sentence-order',
    subjectId: 'english',
    labelKo: '어순 맞추기',
    labelEn: 'Sentence Ordering',
    descriptionKo: '단어 카드를 올바른 순서로 탭하세요',
    descriptionEn: 'Tap word cards in the correct order',
    icon: '📝',
    routeId: 'game-sentence-order',
    isDefault: false,
  },
  // logic 분야
  {
    id: 'logic-sequence',
    subjectId: 'logic',
    labelKo: '논리 퀴즈',
    labelEn: 'Logic Quiz',
    descriptionKo: '규칙과 패턴을 추론해 답을 찾아요',
    descriptionEn: 'Reason through rules and patterns to find answers',
    icon: '🧩',
    routeId: 'game-logic',
    isDefault: true,
    difficultySettings: {
      paramKey: 'levelId',
      panelLabel: '레벨 선택',
      options: [
        { id: 'logic-1', label: '입문 (Lv.1~2)' },
        { id: 'logic-3', label: '초급 (Lv.3~4)' },
        { id: 'logic-5', label: '중급 (Lv.5~6)' },
        { id: 'logic-7', label: '고급 (Lv.7~8)' },
        { id: 'logic-9', label: '심화 (Lv.9~10)' },
      ],
    },
  },
  {
    id: 'matrix-reasoning',
    subjectId: 'logic',
    labelKo: '행렬 추론',
    labelEn: 'Matrix Reasoning',
    descriptionKo: '격자 속 도형 규칙을 찾아 빈 칸을 채워요',
    descriptionEn: 'Find the pattern in the grid to fill the blank',
    icon: '🔲',
    routeId: 'game-matrix-reasoning',
    isDefault: false,
    difficultySettings: {
      paramKey: 'levelId',
      panelLabel: '난이도 선택',
      options: [
        { id: 'matrix-1',  label: '초급 (1단계)' },
        { id: 'matrix-11', label: '중급 (2단계)' },
        { id: 'matrix-21', label: '고급 (3단계)' },
      ],
    },
  },
  {
    id: 'odd-one-out',
    subjectId: 'logic',
    labelKo: '다른 하나',
    labelEn: 'Odd One Out',
    descriptionKo: '나머지와 다른 도형을 찾아보세요',
    descriptionEn: 'Find the shape that does not belong',
    icon: '🔍',
    routeId: 'game-odd-one-out',
    isDefault: false,
    difficultySettings: {
      paramKey: 'levelId',
      panelLabel: '난이도 선택',
      options: [
        { id: 'odd-1',  label: '초급 (1단계)' },
        { id: 'odd-11', label: '중급 (2단계)' },
        { id: 'odd-21', label: '고급 (3단계)' },
      ],
    },
  },
  // creativity 분야
  {
    id: 'creativity-wall',
    subjectId: 'creativity',
    labelKo: '벽 퍼즐',
    labelEn: 'Wall Puzzle',
    descriptionKo: '단어를 4개 그룹으로 연결하는 연상 퍼즐',
    descriptionEn: 'Connect words into 4 groups in this association puzzle',
    icon: '🧱',
    routeId: 'game-creativity',
    isDefault: true,
  },
];

export function getGamesBySubject(subjectId: string): GameDefinition[] {
  return GAMES_CATALOG.filter(g => g.subjectId === subjectId);
}

export function getDefaultGame(subjectId: string): GameDefinition | undefined {
  return GAMES_CATALOG.find(g => g.subjectId === subjectId && g.isDefault);
}

export function getGameById(id: string): GameDefinition | undefined {
  return GAMES_CATALOG.find(g => g.id === id);
}
