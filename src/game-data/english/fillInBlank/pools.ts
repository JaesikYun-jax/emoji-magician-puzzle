import type { DistractorPools } from '../../../systems/fillInBlank/types';

/**
 * 빈칸 채우기 게임의 보기 풀.
 * 키는 TemplateToken.slotTag 와 일치해야 한다.
 *
 * 폴백 체인:
 *   희귀 태그 없음 → 가까운 상위 풀 사용 (templates.ts에서 상위 태그로 통합)
 */
export const ENGLISH_FIB_POOLS: DistractorPools = {
  // ── 색깔 ─────────────────────────────────────────────────────────────────
  ADJ_COLOR: ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'orange', 'purple', 'brown'],

  // ── be 동사 (3인칭 단수 현재) ──────────────────────────────────────────────
  COPULA_3S:  ['is', 'was', 'looks', 'seems', 'feels', 'appears', 'sounds'],
  // be 동사 (복수/1·2인칭 현재)
  COPULA_PL:  ['are', 'were', 'look', 'seem', 'feel', 'appear', 'sound'],

  // ── 동사 ──────────────────────────────────────────────────────────────────
  VERB_MOTION_3S:    ['runs', 'jumps', 'flies', 'swims', 'walks', 'dances', 'hops'],
  VERB_MOTION_BASE:  ['run', 'jump', 'fly', 'swim', 'walk', 'dance', 'hop'],
  VERB_LIKE_3S:      ['likes', 'loves', 'hates', 'wants', 'needs', 'enjoys', 'prefers'],
  VERB_LIKE_BASE:    ['like', 'love', 'hate', 'want', 'need', 'enjoy', 'prefer'],
  VERB_EAT_3S:       ['eats', 'drinks', 'bites', 'chews', 'tastes', 'cooks', 'bakes'],
  VERB_EAT_BASE:     ['eat', 'drink', 'bite', 'chew', 'taste', 'cook', 'bake'],
  VERB_SENSE_3S:     ['sees', 'hears', 'smells', 'feels', 'touches', 'watches', 'reads'],
  VERB_SENSE_BASE:   ['see', 'hear', 'smell', 'feel', 'touch', 'watch', 'read'],
  VERB_MAKE_3S:      ['makes', 'builds', 'draws', 'paints', 'writes', 'sings', 'plays'],
  VERB_MAKE_BASE:    ['make', 'build', 'draw', 'paint', 'write', 'sing', 'play'],
  VERB_MOVE_PAST:    ['ran', 'jumped', 'flew', 'swam', 'walked', 'fell', 'came'],

  // ── 명사: 동물 ───────────────────────────────────────────────────────────
  NOUN_ANIMAL:  ['cat', 'dog', 'bird', 'fish', 'bear', 'rabbit', 'tiger', 'lion', 'monkey', 'elephant', 'frog', 'penguin'],
  NOUN_PET:     ['cat', 'dog', 'rabbit', 'hamster', 'fish', 'parrot', 'turtle'],

  // ── 명사: 자연 ───────────────────────────────────────────────────────────
  NOUN_NATURE:    ['sky', 'sea', 'moon', 'sun', 'cloud', 'river', 'forest', 'mountain', 'island', 'desert'],
  NOUN_WEATHER:   ['rain', 'snow', 'wind', 'storm', 'cloud', 'sunshine', 'fog', 'thunder'],
  NOUN_NATURE_OBJ: ['tree', 'flower', 'leaf', 'rock', 'grass', 'seed', 'branch', 'root'],

  // ── 명사: 음식 ───────────────────────────────────────────────────────────
  NOUN_FOOD:       ['apple', 'banana', 'cookie', 'cake', 'bread', 'rice', 'pizza', 'soup', 'candy', 'juice'],
  NOUN_FRUIT:      ['apple', 'banana', 'grape', 'strawberry', 'lemon', 'orange', 'watermelon', 'peach'],
  NOUN_VEGETABLE:  ['carrot', 'potato', 'onion', 'tomato', 'cucumber', 'garlic', 'mushroom', 'spinach'],

  // ── 명사: 사람/가족 ──────────────────────────────────────────────────────
  NOUN_PERSON:     ['boy', 'girl', 'man', 'woman', 'child', 'baby', 'kid', 'friend'],
  NOUN_FAMILY:     ['mom', 'dad', 'sister', 'brother', 'grandma', 'grandpa', 'aunt', 'uncle'],

  // ── 명사: 장소 ───────────────────────────────────────────────────────────
  NOUN_PLACE:      ['school', 'park', 'home', 'garden', 'library', 'market', 'beach', 'hospital'],
  NOUN_PLACE_INDOORS: ['room', 'kitchen', 'bathroom', 'classroom', 'office', 'hall', 'shop', 'cafe'],

  // ── 명사: 사물 ───────────────────────────────────────────────────────────
  NOUN_THING:   ['ball', 'book', 'bag', 'cup', 'pen', 'toy', 'hat', 'box', 'chair', 'table'],
  NOUN_SCHOOL:  ['book', 'pen', 'pencil', 'bag', 'desk', 'ruler', 'eraser', 'notebook'],

  // ── 형용사 ──────────────────────────────────────────────────────────────
  ADJ_SIZE:      ['big', 'small', 'tall', 'short', 'long', 'wide', 'tiny', 'huge', 'little'],
  ADJ_TASTE:     ['sweet', 'sour', 'salty', 'bitter', 'spicy', 'delicious', 'fresh', 'tasty'],
  ADJ_FEEL:      ['soft', 'hard', 'smooth', 'rough', 'warm', 'cold', 'hot', 'wet', 'dry'],
  ADJ_EMOTION:   ['happy', 'sad', 'angry', 'scared', 'tired', 'excited', 'bored', 'proud'],
  ADJ_QUALITY:   ['good', 'bad', 'fast', 'slow', 'new', 'old', 'clean', 'dirty', 'loud', 'quiet'],

  // ── 부사 ──────────────────────────────────────────────────────────────
  ADV_MANNER:    ['fast', 'slowly', 'carefully', 'quietly', 'loudly', 'happily', 'gently', 'quickly'],
  ADV_DEGREE:    ['very', 'quite', 'really', 'so', 'too', 'almost', 'just', 'always'],

  // ── 관사/한정사 ──────────────────────────────────────────────────────────
  ARTICLE:       ['a', 'an', 'the', 'some', 'many', 'every'],
  QUANTIFIER:    ['one', 'two', 'three', 'many', 'some', 'all', 'no', 'few'],

  // ── 전치사 ──────────────────────────────────────────────────────────────
  PREP_PLACE:    ['in', 'on', 'at', 'under', 'near', 'beside', 'behind', 'above'],
  PREP_TIME:     ['at', 'on', 'in', 'before', 'after', 'during', 'until', 'since'],

  // ── 숫자 ──────────────────────────────────────────────────────────────
  NUMBER_1_10:   ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'],
};
