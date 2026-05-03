/**
 * reasoningBank.ts
 * 추리 5문 — 문제 은행 (사전 정의된 문제 풀, 은행형 게임)
 *
 * 난이도 분류
 *  easy   : 직관적인 공통점/차이점, 초등 저학년 수준
 *  normal : 개념적 분류가 필요한 문제, 초등 중학년 수준
 *  hard   : 혼동 유발 보기 포함, 초등 고학년~중학생 수준
 *  expert : 과학/사회 개념 기반, 중학생 이상 수준
 */

export type ReasoningKind = 'commonality' | 'oddOneOut';
export type ReasoningDifficulty = 'easy' | 'normal' | 'hard' | 'expert';

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

  // ── 추가 easy 공통점 ×3 ──────────────────────────────────────────────────
  {
    id: 'co-e01', kind: 'commonality', difficulty: 'easy',
    prompt: '신발, 양말, 슬리퍼, 부츠의 공통점은?',
    choices: ['모두 가죽이다', '모두 발에 신는 것이다', '모두 비싸다', '모두 따뜻하다'],
    correctIndex: 1,
  },
  {
    id: 'co-e02', kind: 'commonality', difficulty: 'easy',
    prompt: '강아지, 고양이, 새, 물고기의 공통점은?',
    choices: ['모두 털이 있다', '모두 날 수 있다', '모두 동물이다', '모두 소리를 낸다'],
    correctIndex: 2,
  },
  {
    id: 'co-e03', kind: 'commonality', difficulty: 'easy',
    prompt: '사막, 초원, 밀림, 극지방의 공통점은?',
    choices: ['모두 덥다', '모두 사람이 산다', '모두 지구의 자연환경이다', '모두 동물이 없다'],
    correctIndex: 2,
  },

  // ── 추가 easy 다른 하나 ×3 ───────────────────────────────────────────────
  {
    id: 'oo-e01', kind: 'oddOneOut', difficulty: 'easy',
    prompt: '바나나, 레몬, 해바라기, 하늘 중 노란색이 아닌 것은?',
    choices: ['바나나', '레몬', '해바라기', '하늘'],
    correctIndex: 3,
  },
  {
    id: 'oo-e02', kind: 'oddOneOut', difficulty: 'easy',
    prompt: '강아지, 고양이, 소, 독수리 중 날 수 있는 것은?',
    choices: ['강아지', '고양이', '소', '독수리'],
    correctIndex: 3,
  },
  {
    id: 'oo-e03', kind: 'oddOneOut', difficulty: 'easy',
    prompt: '빨강, 파랑, 노랑, 동그라미 중 모양인 것은?',
    choices: ['빨강', '파랑', '노랑', '동그라미'],
    correctIndex: 3,
  },

  // ── 추가 normal 공통점 ×3 ────────────────────────────────────────────────
  {
    id: 'co-n01', kind: 'commonality', difficulty: 'normal',
    prompt: '눈, 얼음, 서리, 우박의 공통점은?',
    choices: ['모두 차갑다', '모두 봄에 볼 수 있다', '모두 물이 얼어 생긴다', '모두 땅에 쌓인다'],
    correctIndex: 2,
  },
  {
    id: 'co-n02', kind: 'commonality', difficulty: 'normal',
    prompt: '소설, 신문, 잡지, 만화책의 공통점은?',
    choices: ['모두 그림이 있다', '모두 매일 나온다', '모두 읽는 것이다', '모두 두껍다'],
    correctIndex: 2,
  },
  {
    id: 'co-n03', kind: 'commonality', difficulty: 'normal',
    prompt: '축구화, 농구화, 운동화, 등산화의 공통점은?',
    choices: ['모두 흰색이다', '모두 신발이다', '모두 실내에서 신는다', '모두 가죽이다'],
    correctIndex: 1,
  },

  // ── 추가 normal 다른 하나 ×3 ─────────────────────────────────────────────
  {
    id: 'oo-n01', kind: 'oddOneOut', difficulty: 'normal',
    prompt: '고등어, 참치, 연어, 오징어 중 뼈가 없는 것은?',
    choices: ['고등어', '참치', '연어', '오징어'],
    correctIndex: 3,
  },
  {
    id: 'oo-n02', kind: 'oddOneOut', difficulty: 'normal',
    prompt: '수성, 금성, 지구, 달 중 태양 주위를 도는 행성이 아닌 것은?',
    choices: ['수성', '금성', '지구', '달'],
    correctIndex: 3,
  },
  {
    id: 'oo-n03', kind: 'oddOneOut', difficulty: 'normal',
    prompt: '코끼리, 기린, 하마, 독수리 중 포유류가 아닌 것은?',
    choices: ['코끼리', '기린', '하마', '독수리'],
    correctIndex: 3,
  },

  // ── 추가 hard 공통점 ×3 ──────────────────────────────────────────────────
  {
    id: 'co-h01', kind: 'commonality', difficulty: 'hard',
    prompt: '세포, 원자, 분자, 입자의 공통점은?',
    choices: ['모두 눈에 보인다', '모두 물질을 이루는 단위이다', '모두 생물에만 있다', '모두 똑같은 크기이다'],
    correctIndex: 1,
  },
  {
    id: 'co-h02', kind: 'commonality', difficulty: 'hard',
    prompt: '민주주의, 공화주의, 사회주의, 자본주의의 공통점은?',
    choices: ['모두 자유롭다', '모두 정치·경제 이념이다', '모두 투표를 한다', '모두 같은 결과를 낳는다'],
    correctIndex: 1,
  },
  {
    id: 'co-h03', kind: 'commonality', difficulty: 'hard',
    prompt: '심장, 폐, 위, 신장의 공통점은?',
    choices: ['모두 가슴에 있다', '모두 쌍으로 있다', '모두 우리 몸의 기관이다', '모두 근육으로만 이루어져 있다'],
    correctIndex: 2,
  },

  // ── 추가 hard 다른 하나 ×3 ───────────────────────────────────────────────
  {
    id: 'oo-h01', kind: 'oddOneOut', difficulty: 'hard',
    prompt: '원심력, 중력, 마찰력, 탄성력 중 물체를 잡아당기는 힘이 아닌 것은?',
    choices: ['원심력', '중력', '마찰력', '탄성력'],
    correctIndex: 0,
  },
  {
    id: 'oo-h02', kind: 'oddOneOut', difficulty: 'hard',
    prompt: '산소, 질소, 이산화탄소, 설탕 중 공기 중에 있는 성분이 아닌 것은?',
    choices: ['산소', '질소', '이산화탄소', '설탕'],
    correctIndex: 3,
  },
  {
    id: 'oo-h03', kind: 'oddOneOut', difficulty: 'hard',
    prompt: '베토벤, 모차르트, 바흐, 피카소 중 음악가가 아닌 것은?',
    choices: ['베토벤', '모차르트', '바흐', '피카소'],
    correctIndex: 3,
  },

  // ── expert 공통점 ×5 ──────────────────────────────────────────────────────
  {
    id: 'co-x01', kind: 'commonality', difficulty: 'expert',
    prompt: '개구리, 두꺼비, 도롱뇽, 영원의 공통점은?',
    choices: ['모두 물에서만 산다', '모두 독이 있다', '모두 양서류이다', '모두 겨울잠을 잔다'],
    correctIndex: 2,
  },
  {
    id: 'co-x02', kind: 'commonality', difficulty: 'expert',
    prompt: '시, 소설, 희곡, 수필의 공통점은?',
    choices: ['모두 길이가 길다', '모두 주인공이 있다', '모두 운율이 있다', '모두 문학 장르이다'],
    correctIndex: 3,
  },
  {
    id: 'co-x03', kind: 'commonality', difficulty: 'expert',
    prompt: '지진, 홍수, 화산 폭발, 태풍의 공통점은?',
    choices: ['모두 바다에서 발생한다', '모두 자연재해이다', '모두 계절에 따라 생긴다', '모두 사전에 예측 가능하다'],
    correctIndex: 1,
  },
  {
    id: 'co-x04', kind: 'commonality', difficulty: 'expert',
    prompt: '원자, 분자, 이온, 전자의 공통점은?',
    choices: ['모두 양전하를 띤다', '모두 원소이다', '모두 물질을 이루는 입자이다', '모두 눈에 보인다'],
    correctIndex: 2,
  },
  {
    id: 'co-x05', kind: 'commonality', difficulty: 'expert',
    prompt: '삼각형, 사각형, 오각형, 육각형의 공통점은?',
    choices: ['모두 각도의 합이 360도이다', '모두 변의 길이가 같다', '모두 다각형이다', '모두 대각선이 있다'],
    correctIndex: 2,
  },

  // ── expert 다른 하나 ×5 ───────────────────────────────────────────────────
  {
    id: 'oo-x01', kind: 'oddOneOut', difficulty: 'expert',
    prompt: '태양, 시리우스, 북극성, 달 중 스스로 빛을 내지 않는 것은?',
    choices: ['태양', '시리우스', '북극성', '달'],
    correctIndex: 3,
  },
  {
    id: 'oo-x02', kind: 'oddOneOut', difficulty: 'expert',
    prompt: '나트륨(Na), 칼슘(Ca), 철(Fe), 소금(NaCl) 중 홑원소 물질이 아닌 것은?',
    choices: ['나트륨', '칼슘', '철', '소금'],
    correctIndex: 3,
  },
  {
    id: 'oo-x03', kind: 'oddOneOut', difficulty: 'expert',
    prompt: '개구리, 두꺼비, 도롱뇽, 도마뱀 중 파충류인 것은?',
    choices: ['개구리', '두꺼비', '도롱뇽', '도마뱀'],
    correctIndex: 3,
  },
  {
    id: 'oo-x04', kind: 'oddOneOut', difficulty: 'expert',
    prompt: '뼈, 근육, 피부, 혈액 중 결합 조직이 아닌 것은?',
    choices: ['뼈', '근육', '피부', '혈액'],
    correctIndex: 2,
  },
  {
    id: 'oo-x05', kind: 'oddOneOut', difficulty: 'expert',
    prompt: '삼권분립, 법치주의, 기본권 보장, 군주제 중 민주주의 원리가 아닌 것은?',
    choices: ['삼권분립', '법치주의', '기본권 보장', '군주제'],
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
