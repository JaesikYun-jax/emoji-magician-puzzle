import type { SentenceTemplate } from '../../../systems/fillInBlank/types';

/**
 * 영어 빈칸 채우기 템플릿 v1 — 30개
 * 난이도별: beginner 8개 / elementary 8개 / intermediate 7개 / advanced 7개
 *
 * 작성 규칙:
 * - blankable=true 토큰은 slotTag 필수
 * - meaningKo는 전체 사전 번역 (어순/placeholder 없음)
 * - 한 템플릿의 blankable 토큰 수는 advanced에서 최소 4개 이상
 */
export const ENGLISH_FIB_TEMPLATES: SentenceTemplate[] = [

  // ══════════════════════════════════════════════════════════
  // BEGINNER (2~3 단어, blankable 2~3개)
  // ══════════════════════════════════════════════════════════

  {
    id: 'fb-en-001',
    tokens: [
      { text: 'A',    blankable: false },
      { text: 'cat',  blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'runs', blankable: true,  slotTag: 'VERB_MOTION_3S' },
    ],
    meaningKo: '고양이 한 마리가 달린다.',
    difficulty: 'beginner',
    tags: ['SV'],
  },

  {
    id: 'fb-en-002',
    tokens: [
      { text: 'Birds', blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'fly',   blankable: true,  slotTag: 'VERB_MOTION_BASE' },
    ],
    meaningKo: '새들이 날아간다.',
    difficulty: 'beginner',
    tags: ['SV'],
  },

  {
    id: 'fb-en-003',
    tokens: [
      { text: 'I',    blankable: false },
      { text: 'like', blankable: true,  slotTag: 'VERB_LIKE_BASE' },
      { text: 'dogs', blankable: true,  slotTag: 'NOUN_ANIMAL' },
    ],
    meaningKo: '나는 개를 좋아한다.',
    difficulty: 'beginner',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-004',
    tokens: [
      { text: 'The',  blankable: false },
      { text: 'sky',  blankable: true,  slotTag: 'NOUN_NATURE' },
      { text: 'is',   blankable: true,  slotTag: 'COPULA_3S' },
      { text: 'blue', blankable: true,  slotTag: 'ADJ_COLOR' },
    ],
    meaningKo: '하늘은 파랗다.',
    difficulty: 'beginner',
    tags: ['SVC'],
  },

  {
    id: 'fb-en-005',
    tokens: [
      { text: 'She',  blankable: true,  slotTag: 'NOUN_PERSON' },
      { text: 'eats', blankable: true,  slotTag: 'VERB_EAT_3S' },
      { text: 'cake', blankable: true,  slotTag: 'NOUN_FOOD' },
    ],
    meaningKo: '그녀는 케이크를 먹는다.',
    difficulty: 'beginner',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-006',
    tokens: [
      { text: 'The',  blankable: false },
      { text: 'dog',  blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'is',   blankable: false },
      { text: 'big',  blankable: true,  slotTag: 'ADJ_SIZE' },
    ],
    meaningKo: '그 개는 크다.',
    difficulty: 'beginner',
    tags: ['SVC'],
  },

  {
    id: 'fb-en-007',
    tokens: [
      { text: 'I',   blankable: false },
      { text: 'see', blankable: true,  slotTag: 'VERB_SENSE_BASE' },
      { text: 'a',   blankable: false },
      { text: 'star', blankable: true, slotTag: 'NOUN_NATURE' },
    ],
    meaningKo: '나는 별을 본다.',
    difficulty: 'beginner',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-008',
    tokens: [
      { text: 'My',  blankable: false },
      { text: 'mom', blankable: true,  slotTag: 'NOUN_FAMILY' },
      { text: 'is',  blankable: false },
      { text: 'kind', blankable: true, slotTag: 'ADJ_QUALITY' },
    ],
    meaningKo: '우리 엄마는 친절하다.',
    difficulty: 'beginner',
    tags: ['SVC'],
  },

  // ══════════════════════════════════════════════════════════
  // ELEMENTARY (3~5 단어, blankable 3~4개)
  // ══════════════════════════════════════════════════════════

  {
    id: 'fb-en-009',
    tokens: [
      { text: 'The',    blankable: false },
      { text: 'rabbit', blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'eats',   blankable: true,  slotTag: 'VERB_EAT_3S' },
      { text: 'a',      blankable: false },
      { text: 'carrot', blankable: true,  slotTag: 'NOUN_VEGETABLE' },
    ],
    meaningKo: '그 토끼는 당근을 먹는다.',
    difficulty: 'elementary',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-010',
    tokens: [
      { text: 'She',    blankable: true,  slotTag: 'NOUN_PERSON' },
      { text: 'reads',  blankable: true,  slotTag: 'VERB_SENSE_3S' },
      { text: 'a',      blankable: false },
      { text: 'book',   blankable: true,  slotTag: 'NOUN_SCHOOL' },
      { text: 'slowly', blankable: true,  slotTag: 'ADV_MANNER' },
    ],
    meaningKo: '그녀는 책을 천천히 읽는다.',
    difficulty: 'elementary',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-011',
    tokens: [
      { text: 'The',     blankable: false },
      { text: 'flowers', blankable: true,  slotTag: 'NOUN_NATURE_OBJ' },
      { text: 'are',     blankable: true,  slotTag: 'COPULA_PL' },
      { text: 'very',    blankable: false },
      { text: 'pretty',  blankable: true,  slotTag: 'ADJ_QUALITY' },
    ],
    meaningKo: '그 꽃들은 매우 예쁘다.',
    difficulty: 'elementary',
    tags: ['SVC'],
  },

  {
    id: 'fb-en-012',
    tokens: [
      { text: 'We',   blankable: false },
      { text: 'play', blankable: true,  slotTag: 'VERB_MAKE_BASE' },
      { text: 'in',   blankable: false },
      { text: 'the',  blankable: false },
      { text: 'park', blankable: true,  slotTag: 'NOUN_PLACE' },
      { text: 'every', blankable: false },
      { text: 'day',  blankable: true,  slotTag: 'NOUN_THING' },
    ],
    meaningKo: '우리는 매일 공원에서 논다.',
    difficulty: 'elementary',
    tags: ['SV'],
  },

  {
    id: 'fb-en-013',
    tokens: [
      { text: 'The', blankable: false },
      { text: 'baby', blankable: true,  slotTag: 'NOUN_PERSON' },
      { text: 'is',   blankable: false },
      { text: 'very', blankable: false },
      { text: 'cute', blankable: true,  slotTag: 'ADJ_QUALITY' },
      { text: 'and',  blankable: false },
      { text: 'small', blankable: true, slotTag: 'ADJ_SIZE' },
    ],
    meaningKo: '그 아기는 매우 귀엽고 작다.',
    difficulty: 'elementary',
    tags: ['SVC'],
  },

  {
    id: 'fb-en-014',
    tokens: [
      { text: 'My',    blankable: false },
      { text: 'sister', blankable: true, slotTag: 'NOUN_FAMILY' },
      { text: 'loves',  blankable: true, slotTag: 'VERB_LIKE_3S' },
      { text: 'to',     blankable: false },
      { text: 'sing',   blankable: true, slotTag: 'VERB_MAKE_BASE' },
    ],
    meaningKo: '내 여동생은 노래 부르는 것을 좋아한다.',
    difficulty: 'elementary',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-015',
    tokens: [
      { text: 'It',   blankable: false },
      { text: 'rains', blankable: true,  slotTag: 'VERB_MOTION_3S' },
      { text: 'a',    blankable: false },
      { text: 'lot',  blankable: false },
      { text: 'in',   blankable: false },
      { text: 'the',  blankable: false },
      { text: 'forest', blankable: true, slotTag: 'NOUN_NATURE' },
    ],
    meaningKo: '숲에는 비가 많이 온다.',
    difficulty: 'elementary',
    tags: ['SV'],
  },

  {
    id: 'fb-en-016',
    tokens: [
      { text: 'The',   blankable: false },
      { text: 'lemon', blankable: true,  slotTag: 'NOUN_FRUIT' },
      { text: 'tastes', blankable: true, slotTag: 'VERB_EAT_3S' },
      { text: 'very',  blankable: false },
      { text: 'sour',  blankable: true,  slotTag: 'ADJ_TASTE' },
    ],
    meaningKo: '레몬은 매우 시다.',
    difficulty: 'elementary',
    tags: ['SVC'],
  },

  // ══════════════════════════════════════════════════════════
  // INTERMEDIATE (5~7 단어, blankable 4~5개)
  // ══════════════════════════════════════════════════════════

  {
    id: 'fb-en-017',
    tokens: [
      { text: 'The',     blankable: false },
      { text: 'monkey',  blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'climbs',  blankable: true,  slotTag: 'VERB_MOTION_3S' },
      { text: 'the',     blankable: false },
      { text: 'tall',    blankable: true,  slotTag: 'ADJ_SIZE' },
      { text: 'tree',    blankable: true,  slotTag: 'NOUN_NATURE_OBJ' },
      { text: 'quickly', blankable: true,  slotTag: 'ADV_MANNER' },
    ],
    meaningKo: '그 원숭이는 키 큰 나무를 빠르게 오른다.',
    difficulty: 'intermediate',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-018',
    tokens: [
      { text: 'She',       blankable: false },
      { text: 'drinks',    blankable: true,  slotTag: 'VERB_EAT_3S' },
      { text: 'warm',      blankable: true,  slotTag: 'ADJ_FEEL' },
      { text: 'milk',      blankable: true,  slotTag: 'NOUN_FOOD' },
      { text: 'before',    blankable: false },
      { text: 'going',     blankable: false },
      { text: 'to',        blankable: false },
      { text: 'sleep',     blankable: true,  slotTag: 'VERB_MOTION_BASE' },
    ],
    meaningKo: '그녀는 자기 전에 따뜻한 우유를 마신다.',
    difficulty: 'intermediate',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-019',
    tokens: [
      { text: 'The',      blankable: false },
      { text: 'children', blankable: true,  slotTag: 'NOUN_PERSON' },
      { text: 'are',      blankable: true,  slotTag: 'COPULA_PL' },
      { text: 'very',     blankable: false },
      { text: 'happy',    blankable: true,  slotTag: 'ADJ_EMOTION' },
      { text: 'in',       blankable: false },
      { text: 'the',      blankable: false },
      { text: 'garden',   blankable: true,  slotTag: 'NOUN_PLACE' },
    ],
    meaningKo: '그 아이들은 정원에서 매우 행복하다.',
    difficulty: 'intermediate',
    tags: ['SVC'],
  },

  {
    id: 'fb-en-020',
    tokens: [
      { text: 'Every',     blankable: false },
      { text: 'morning',   blankable: true,  slotTag: 'NOUN_THING' },
      { text: 'my',        blankable: false },
      { text: 'dad',       blankable: true,  slotTag: 'NOUN_FAMILY' },
      { text: 'makes',     blankable: true,  slotTag: 'VERB_MAKE_3S' },
      { text: 'delicious', blankable: true,  slotTag: 'ADJ_TASTE' },
      { text: 'bread',     blankable: true,  slotTag: 'NOUN_FOOD' },
    ],
    meaningKo: '매일 아침 우리 아빠는 맛있는 빵을 만든다.',
    difficulty: 'intermediate',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-021',
    tokens: [
      { text: 'The',    blankable: false },
      { text: 'storm',  blankable: true,  slotTag: 'NOUN_WEATHER' },
      { text: 'was',    blankable: true,  slotTag: 'COPULA_3S' },
      { text: 'very',   blankable: false },
      { text: 'strong', blankable: true,  slotTag: 'ADJ_QUALITY' },
      { text: 'and',    blankable: false },
      { text: 'loud',   blankable: true,  slotTag: 'ADJ_QUALITY' },
    ],
    meaningKo: '그 폭풍은 매우 강하고 시끄러웠다.',
    difficulty: 'intermediate',
    tags: ['SVC'],
  },

  {
    id: 'fb-en-022',
    tokens: [
      { text: 'We',     blankable: false },
      { text: 'found',  blankable: true,  slotTag: 'VERB_SENSE_BASE' },
      { text: 'a',      blankable: false },
      { text: 'small',  blankable: true,  slotTag: 'ADJ_SIZE' },
      { text: 'bird',   blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'near',   blankable: false },
      { text: 'the',    blankable: false },
      { text: 'river',  blankable: true,  slotTag: 'NOUN_NATURE' },
    ],
    meaningKo: '우리는 강 근처에서 작은 새 한 마리를 발견했다.',
    difficulty: 'intermediate',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-023',
    tokens: [
      { text: 'The',      blankable: false },
      { text: 'market',   blankable: true,  slotTag: 'NOUN_PLACE' },
      { text: 'sells',    blankable: true,  slotTag: 'VERB_EAT_3S' },
      { text: 'fresh',    blankable: true,  slotTag: 'ADJ_TASTE' },
      { text: 'fruit',    blankable: true,  slotTag: 'NOUN_FRUIT' },
      { text: 'every',    blankable: false },
      { text: 'morning',  blankable: false },
    ],
    meaningKo: '그 시장은 매일 아침 신선한 과일을 판다.',
    difficulty: 'intermediate',
    tags: ['SVO'],
  },

  // ══════════════════════════════════════════════════════════
  // ADVANCED (7~12 단어, blankable 5~6개)
  // ══════════════════════════════════════════════════════════

  {
    id: 'fb-en-024',
    tokens: [
      { text: 'My',       blankable: false },
      { text: 'dog',      blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'loves',    blankable: true,  slotTag: 'VERB_LIKE_3S' },
      { text: 'to',       blankable: false },
      { text: 'eat',      blankable: true,  slotTag: 'VERB_EAT_BASE' },
      { text: 'big',      blankable: true,  slotTag: 'ADJ_SIZE' },
      { text: 'red',      blankable: true,  slotTag: 'ADJ_COLOR' },
      { text: 'apples',   blankable: true,  slotTag: 'NOUN_FRUIT' },
    ],
    meaningKo: '내 강아지는 크고 빨간 사과를 먹는 것을 좋아한다.',
    difficulty: 'advanced',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-025',
    tokens: [
      { text: 'The',       blankable: false },
      { text: 'little',    blankable: true,  slotTag: 'ADJ_SIZE' },
      { text: 'girl',      blankable: true,  slotTag: 'NOUN_PERSON' },
      { text: 'found',     blankable: true,  slotTag: 'VERB_SENSE_BASE' },
      { text: 'a',         blankable: false },
      { text: 'soft',      blankable: true,  slotTag: 'ADJ_FEEL' },
      { text: 'rabbit',    blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'behind',    blankable: false },
      { text: 'the',       blankable: false },
      { text: 'garden',    blankable: true,  slotTag: 'NOUN_PLACE' },
    ],
    meaningKo: '그 작은 소녀는 정원 뒤에서 부드러운 토끼를 발견했다.',
    difficulty: 'advanced',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-026',
    tokens: [
      { text: 'She',       blankable: false },
      { text: 'carefully', blankable: true,  slotTag: 'ADV_MANNER' },
      { text: 'painted',   blankable: true,  slotTag: 'VERB_MAKE_BASE' },
      { text: 'a',         blankable: false },
      { text: 'beautiful', blankable: true,  slotTag: 'ADJ_QUALITY' },
      { text: 'blue',      blankable: true,  slotTag: 'ADJ_COLOR' },
      { text: 'flower',    blankable: true,  slotTag: 'NOUN_NATURE_OBJ' },
      { text: 'in',        blankable: false },
      { text: 'her',       blankable: false },
      { text: 'room',      blankable: true,  slotTag: 'NOUN_PLACE_INDOORS' },
    ],
    meaningKo: '그녀는 방에서 아름다운 파란 꽃을 조심스럽게 그렸다.',
    difficulty: 'advanced',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-027',
    tokens: [
      { text: 'The',       blankable: false },
      { text: 'hungry',    blankable: true,  slotTag: 'ADJ_EMOTION' },
      { text: 'bear',      blankable: true,  slotTag: 'NOUN_ANIMAL' },
      { text: 'walked',    blankable: true,  slotTag: 'VERB_MOVE_PAST' },
      { text: 'slowly',    blankable: true,  slotTag: 'ADV_MANNER' },
      { text: 'to',        blankable: false },
      { text: 'the',       blankable: false },
      { text: 'cold',      blankable: true,  slotTag: 'ADJ_FEEL' },
      { text: 'river',     blankable: true,  slotTag: 'NOUN_NATURE' },
    ],
    meaningKo: '그 배고픈 곰은 차가운 강으로 천천히 걸어갔다.',
    difficulty: 'advanced',
    tags: ['SV'],
  },

  {
    id: 'fb-en-028',
    tokens: [
      { text: 'My',        blankable: false },
      { text: 'grandma',   blankable: true,  slotTag: 'NOUN_FAMILY' },
      { text: 'always',    blankable: true,  slotTag: 'ADV_DEGREE' },
      { text: 'cooks',     blankable: true,  slotTag: 'VERB_EAT_3S' },
      { text: 'very',      blankable: false },
      { text: 'delicious', blankable: true,  slotTag: 'ADJ_TASTE' },
      { text: 'soup',      blankable: true,  slotTag: 'NOUN_FOOD' },
      { text: 'in',        blankable: false },
      { text: 'the',       blankable: false },
      { text: 'kitchen',   blankable: true,  slotTag: 'NOUN_PLACE_INDOORS' },
    ],
    meaningKo: '우리 할머니는 항상 부엌에서 매우 맛있는 수프를 요리하신다.',
    difficulty: 'advanced',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-029',
    tokens: [
      { text: 'The',     blankable: false },
      { text: 'school',  blankable: true,  slotTag: 'NOUN_PLACE' },
      { text: 'library', blankable: true,  slotTag: 'NOUN_PLACE_INDOORS' },
      { text: 'has',     blankable: false },
      { text: 'many',    blankable: true,  slotTag: 'QUANTIFIER' },
      { text: 'old',     blankable: true,  slotTag: 'ADJ_QUALITY' },
      { text: 'but',     blankable: false },
      { text: 'interesting', blankable: true, slotTag: 'ADJ_QUALITY' },
      { text: 'books',   blankable: true,  slotTag: 'NOUN_SCHOOL' },
    ],
    meaningKo: '학교 도서관에는 오래되었지만 흥미로운 책들이 많다.',
    difficulty: 'advanced',
    tags: ['SVO'],
  },

  {
    id: 'fb-en-030',
    tokens: [
      { text: 'The',    blankable: false },
      { text: 'brave',  blankable: true,  slotTag: 'ADJ_EMOTION' },
      { text: 'boy',    blankable: true,  slotTag: 'NOUN_PERSON' },
      { text: 'quickly', blankable: true, slotTag: 'ADV_MANNER' },
      { text: 'ran',    blankable: true,  slotTag: 'VERB_MOVE_PAST' },
      { text: 'to',     blankable: false },
      { text: 'the',    blankable: false },
      { text: 'big',    blankable: true,  slotTag: 'ADJ_SIZE' },
      { text: 'hospital', blankable: true, slotTag: 'NOUN_PLACE' },
      { text: 'for',    blankable: false },
      { text: 'help',   blankable: false },
    ],
    meaningKo: '그 용감한 소년은 도움을 받으러 큰 병원으로 빠르게 달려갔다.',
    difficulty: 'advanced',
    tags: ['SV'],
  },

  // ══════════════════════════════════════════════════════════
  // EXPERT (심화 — 더 어려운 어휘, 5+ 빈칸)
  // ══════════════════════════════════════════════════════════

  {
    id: 'fb-en-031',
    tokens: [
      { text: 'The',         blankable: false },
      { text: 'curious',     blankable: true },
      { text: 'student',     blankable: true },
      { text: 'thoroughly',  blankable: true },
      { text: 'examined',    blankable: true },
      { text: 'the',         blankable: false },
      { text: 'mysterious',  blankable: true },
      { text: 'manuscript',  blankable: true },
    ],
    meaningKo: '그 호기심 많은 학생은 신비로운 원고를 철저히 검토했다.',
    difficulty: 'expert',
    tags: ['SVO'],
  },
  {
    id: 'fb-en-032',
    tokens: [
      { text: 'She',         blankable: false },
      { text: 'confidently', blankable: true },
      { text: 'presented',   blankable: true },
      { text: 'her',         blankable: false },
      { text: 'innovative',  blankable: true },
      { text: 'research',    blankable: true },
      { text: 'to',          blankable: false },
      { text: 'the',         blankable: false },
      { text: 'distinguished', blankable: true },
      { text: 'committee',   blankable: true },
    ],
    meaningKo: '그녀는 자신의 혁신적인 연구를 저명한 위원회에 자신감 있게 발표했다.',
    difficulty: 'expert',
    tags: ['SVO'],
  },
  {
    id: 'fb-en-033',
    tokens: [
      { text: 'The',          blankable: false },
      { text: 'ambitious',    blankable: true },
      { text: 'entrepreneur', blankable: true },
      { text: 'gradually',    blankable: true },
      { text: 'transformed',  blankable: true },
      { text: 'the',          blankable: false },
      { text: 'struggling',   blankable: true },
      { text: 'company',      blankable: true },
    ],
    meaningKo: '그 야심 찬 기업가는 그 어려움을 겪던 회사를 점진적으로 변화시켰다.',
    difficulty: 'expert',
    tags: ['SVO'],
  },
  {
    id: 'fb-en-034',
    tokens: [
      { text: 'He',           blankable: false },
      { text: 'reluctantly',  blankable: true },
      { text: 'acknowledged', blankable: true },
      { text: 'the',          blankable: false },
      { text: 'unexpected',   blankable: true },
      { text: 'consequences', blankable: true },
      { text: 'of',           blankable: false },
      { text: 'his',          blankable: false },
      { text: 'reckless',     blankable: true },
      { text: 'decision',     blankable: true },
    ],
    meaningKo: '그는 자신의 무모한 결정의 예상치 못한 결과를 마지못해 인정했다.',
    difficulty: 'expert',
    tags: ['SVO'],
  },
  {
    id: 'fb-en-035',
    tokens: [
      { text: 'The',           blankable: false },
      { text: 'remarkable',    blankable: true },
      { text: 'discovery',     blankable: true },
      { text: 'fundamentally', blankable: true },
      { text: 'altered',       blankable: true },
      { text: 'our',           blankable: false },
      { text: 'understanding', blankable: true },
      { text: 'of',            blankable: false },
      { text: 'ancient',       blankable: true },
      { text: 'civilizations', blankable: true },
    ],
    meaningKo: '그 놀라운 발견은 고대 문명에 대한 우리의 이해를 근본적으로 바꿨다.',
    difficulty: 'expert',
    tags: ['SVO'],
  },
  {
    id: 'fb-en-036',
    tokens: [
      { text: 'The',          blankable: false },
      { text: 'experienced',  blankable: true },
      { text: 'researcher',   blankable: true },
      { text: 'meticulously', blankable: true },
      { text: 'documented',   blankable: true },
      { text: 'every',        blankable: false },
      { text: 'subtle',       blankable: true },
      { text: 'observation',  blankable: true },
    ],
    meaningKo: '그 경험 많은 연구자는 모든 미묘한 관찰을 꼼꼼히 기록했다.',
    difficulty: 'expert',
    tags: ['SVO'],
  },
  {
    id: 'fb-en-037',
    tokens: [
      { text: 'They',         blankable: false },
      { text: 'enthusiastically', blankable: true },
      { text: 'embraced',     blankable: true },
      { text: 'the',          blankable: false },
      { text: 'extraordinary', blankable: true },
      { text: 'opportunity',  blankable: true },
      { text: 'to',           blankable: false },
      { text: 'collaborate',  blankable: true },
      { text: 'globally',     blankable: true },
    ],
    meaningKo: '그들은 전 세계적으로 협력할 비범한 기회를 열정적으로 받아들였다.',
    difficulty: 'expert',
    tags: ['SVO'],
  },
];
