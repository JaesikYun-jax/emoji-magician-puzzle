/**
 * reasoningBank.ts
 * 추리 5문 — 문제 은행 (사전 정의된 문제 풀, 은행형 게임)
 *
 * 난이도 분류
 *  easy   : 직관적인 공통점/차이점, 초등 저학년 수준
 *  normal : 개념적 분류가 필요한 문제, 초등 중학년 수준
 *  hard   : 혼동 유발 보기 포함, 초등 고학년~중학생 수준
 */

export type ReasoningKind = 'commonality' | 'oddOneOut';
export type ReasoningDifficulty = 'easy' | 'normal' | 'hard';

export interface ReasoningQuestion {
  id: string;
  kind: ReasoningKind;
  difficulty: ReasoningDifficulty;
  prompt: string;
  choices: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export const REASONING_BANK: ReasoningQuestion[] = [
  // ── 공통점 찾기 (commonality) ──────────────────────────────────────────────

  // easy ×5
  {
    id: 'co-01', kind: 'commonality', difficulty: 'easy',
    prompt: '바다, 강, 호수, 수영장의 공통점은?',
    choices: ['모두 짜다', '모두 물이 있다', '모두 크다', '모두 차갑다'],
    correctIndex: 1,
  },
  {
    id: 'co-02', kind: 'commonality', difficulty: 'easy',
    prompt: '봄, 여름, 가을, 겨울의 공통점은?',
    choices: ['모두 춥다', '모두 계절이다', '모두 덥다', '모두 짧다'],
    correctIndex: 1,
  },
  {
    id: 'co-03', kind: 'commonality', difficulty: 'easy',
    prompt: '자전거, 자동차, 기차, 버스의 공통점은?',
    choices: ['모두 빠르다', '모두 탈 것이다', '모두 전기로 간다', '모두 크다'],
    correctIndex: 1,
  },
  {
    id: 'co-05', kind: 'commonality', difficulty: 'easy',
    prompt: '책, 연필, 공책, 지우개의 공통점은?',
    choices: ['모두 파랗다', '모두 학용품이다', '모두 무겁다', '모두 비싸다'],
    correctIndex: 1,
  },
  {
    id: 'co-07', kind: 'commonality', difficulty: 'easy',
    prompt: '국어, 수학, 영어, 과학의 공통점은?',
    choices: ['모두 어렵다', '모두 학교 과목이다', '모두 시험이 있다', '모두 재미있다'],
    correctIndex: 1,
  },

  // normal ×5
  {
    id: 'co-04', kind: 'commonality', difficulty: 'normal',
    prompt: '사자, 호랑이, 표범, 치타의 공통점은?',
    choices: ['모두 아프리카에 산다', '모두 줄무늬가 있다', '모두 고양잇과이다', '모두 날 수 있다'],
    correctIndex: 2,
  },
  {
    id: 'co-06', kind: 'commonality', difficulty: 'normal',
    prompt: '고래, 돌고래, 상어, 문어의 공통점은?',
    choices: ['모두 포유류다', '모두 크다', '모두 바다에 산다', '모두 노래한다'],
    correctIndex: 2,
  },
  {
    id: 'co-08', kind: 'commonality', difficulty: 'normal',
    prompt: '사과, 배, 포도, 딸기의 공통점은?',
    choices: ['모두 빨갛다', '모두 달다', '모두 과일이다', '모두 씨가 있다'],
    correctIndex: 2,
  },
  {
    id: 'co-09', kind: 'commonality', difficulty: 'normal',
    prompt: '개, 고양이, 토끼, 햄스터의 공통점은?',
    choices: ['모두 털이 많다', '모두 소리를 낸다', '모두 반려동물이다', '모두 물 속에 산다'],
    correctIndex: 2,
  },
  {
    id: 'co-12', kind: 'commonality', difficulty: 'normal',
    prompt: '버스, 지하철, 기차, 비행기의 공통점은?',
    choices: ['모두 빠르다', '모두 대중교통이다', '모두 운전사가 있다', '모두 바퀴가 있다'],
    correctIndex: 1,
  },

  // hard ×5
  {
    id: 'co-10', kind: 'commonality', difficulty: 'hard',
    prompt: '토마토, 사과, 딸기, 소방차의 공통점은?',
    choices: ['모두 달다', '모두 빨간색이다', '모두 음식이다', '모두 동그랗다'],
    correctIndex: 1,
  },
  {
    id: 'co-11', kind: 'commonality', difficulty: 'hard',
    prompt: '피아노, 기타, 바이올린, 플루트의 공통점은?',
    choices: ['모두 크다', '모두 현악기이다', '모두 악기이다', '모두 비싸다'],
    correctIndex: 2,
  },
  {
    id: 'co-13', kind: 'commonality', difficulty: 'hard',
    prompt: '빨강, 파랑, 노랑, 초록의 공통점은?',
    choices: ['모두 따뜻한 색이다', '모두 색깔이다', '모두 어두운 색이다', '모두 밝다'],
    correctIndex: 1,
  },
  {
    id: 'co-14', kind: 'commonality', difficulty: 'hard',
    prompt: '의사, 간호사, 약사, 의료기사의 공통점은?',
    choices: ['모두 흰 가운을 입는다', '모두 병원에서만 일한다', '모두 의료 종사자이다', '모두 친절하다'],
    correctIndex: 2,
  },
  {
    id: 'co-15', kind: 'commonality', difficulty: 'hard',
    prompt: '감기, 독감, 천식, 폐렴의 공통점은?',
    choices: ['모두 전염된다', '모두 열이 난다', '모두 병이다', '모두 약을 먹는다'],
    correctIndex: 2,
  },

  // ── 다른 하나 찾기 (oddOneOut) ──────────────────────────────────────────────

  // easy ×5
  {
    id: 'oo-01', kind: 'oddOneOut', difficulty: 'easy',
    prompt: '다음 중 과일이 아닌 것은?',
    choices: ['사과', '바나나', '당근', '포도'],
    correctIndex: 2,
  },
  {
    id: 'oo-03', kind: 'oddOneOut', difficulty: 'easy',
    prompt: '피아노, 기타, 바이올린, 축구공 중 악기가 아닌 것은?',
    choices: ['피아노', '기타', '바이올린', '축구공'],
    correctIndex: 3,
  },
  {
    id: 'oo-04', kind: 'oddOneOut', difficulty: 'easy',
    prompt: '빨강, 파랑, 노랑, 동그라미 중 색깔이 아닌 것은?',
    choices: ['빨강', '파랑', '노랑', '동그라미'],
    correctIndex: 3,
  },
  {
    id: 'oo-11', kind: 'oddOneOut', difficulty: 'easy',
    prompt: '국어, 수학, 영어, 축구 중 학교 과목이 아닌 것은?',
    choices: ['국어', '수학', '영어', '축구'],
    correctIndex: 3,
  },
  {
    id: 'oo-12', kind: 'oddOneOut', difficulty: 'easy',
    prompt: '피자, 불고기, 김치, 비빔밥 중 한국 음식이 아닌 것은?',
    choices: ['피자', '불고기', '김치', '비빔밥'],
    correctIndex: 0,
  },

  // normal ×5
  {
    id: 'oo-02', kind: 'oddOneOut', difficulty: 'normal',
    prompt: '"개, 고양이, 닭, 토끼" 중 포유류가 아닌 것은?',
    choices: ['개', '고양이', '닭', '토끼'],
    correctIndex: 2,
  },
  {
    id: 'oo-06', kind: 'oddOneOut', difficulty: 'normal',
    prompt: '장미, 튤립, 해바라기, 당근 중 꽃이 아닌 것은?',
    choices: ['장미', '튤립', '해바라기', '당근'],
    correctIndex: 3,
  },
  {
    id: 'oo-07', kind: 'oddOneOut', difficulty: 'normal',
    prompt: '축구, 농구, 수영, 체스 중 신체 운동이 아닌 것은?',
    choices: ['축구', '농구', '체스', '수영'],
    correctIndex: 2,
  },
  {
    id: 'oo-13', kind: 'oddOneOut', difficulty: 'normal',
    prompt: '침대, 소파, 의자, 냉장고 중 앉거나 눕는 가구가 아닌 것은?',
    choices: ['침대', '소파', '의자', '냉장고'],
    correctIndex: 3,
  },
  {
    id: 'oo-14', kind: 'oddOneOut', difficulty: 'normal',
    prompt: '연필, 볼펜, 지우개, 스케이트보드 중 학용품이 아닌 것은?',
    choices: ['연필', '볼펜', '지우개', '스케이트보드'],
    correctIndex: 3,
  },

  // hard ×5
  {
    id: 'oo-05', kind: 'oddOneOut', difficulty: 'hard',
    prompt: '사자, 호랑이, 곰, 독수리 중 포유류가 아닌 것은?',
    choices: ['사자', '호랑이', '곰', '독수리'],
    correctIndex: 3,
  },
  {
    id: 'oo-08', kind: 'oddOneOut', difficulty: 'hard',
    prompt: '지구, 화성, 태양, 목성 중 행성이 아닌 것은?',
    choices: ['지구', '화성', '태양', '목성'],
    correctIndex: 2,
  },
  {
    id: 'oo-09', kind: 'oddOneOut', difficulty: 'hard',
    prompt: '개미, 나비, 벌, 거미 중 곤충이 아닌 것은?',
    choices: ['개미', '나비', '벌', '거미'],
    correctIndex: 3,
  },
  {
    id: 'oo-10', kind: 'oddOneOut', difficulty: 'hard',
    prompt: '한국어, 영어, 중국어, 음악 중 언어가 아닌 것은?',
    choices: ['한국어', '영어', '중국어', '음악'],
    correctIndex: 3,
  },
  {
    id: 'oo-15', kind: 'oddOneOut', difficulty: 'hard',
    prompt: '사과, 배, 수박, 당근 중 과일이 아닌 것은?',
    choices: ['사과', '배', '수박', '당근'],
    correctIndex: 3,
  },
];

/**
 * 난이도별 문제 풀 조회
 */
export function getQuestionsByDifficulty(difficulty: ReasoningDifficulty): ReasoningQuestion[] {
  return REASONING_BANK.filter(q => q.difficulty === difficulty);
}

/**
 * 풀에서 5문제를 랜덤 추출
 *  - difficulty 지정 시: 해당 난이도 풀에서 공통점 3 + 다른 하나 2
 *  - difficulty 미지정:  전체 풀에서 공통점 3 + 다른 하나 2
 */
export function pickRound(difficulty?: ReasoningDifficulty): ReasoningQuestion[] {
  const pool = difficulty ? getQuestionsByDifficulty(difficulty) : REASONING_BANK;

  const commonality = pool.filter(q => q.kind === 'commonality');
  const oddOneOut   = pool.filter(q => q.kind === 'oddOneOut');

  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  };

  // 풀이 부족하면 전체로 폴백
  const cPool = commonality.length >= 3 ? commonality : REASONING_BANK.filter(q => q.kind === 'commonality');
  const oPool = oddOneOut.length >= 2   ? oddOneOut   : REASONING_BANK.filter(q => q.kind === 'oddOneOut');

  const cPick = shuffle(cPool).slice(0, 3);
  const oPick = shuffle(oPool).slice(0, 2);
  return shuffle([...cPick, ...oPick]);
}
