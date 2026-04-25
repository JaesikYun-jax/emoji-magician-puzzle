export interface SyllableQuestion {
  id: string;
  given: string;      // 주어진 자모 (예: 'ㄱ')
  blank: string;      // 정답 자모 (예: 'ㅏ')
  result: string;     // 완성 글자 (예: '가')
  hint: string;       // 힌트 문장 (예: '"가방"의 첫 글자')
  exampleWords: string[]; // 예시 단어 최대 4개
  distractors: string[];  // 오답 자모 3개 (blank 포함 총 4개 선택지)
  blankType: 'onset' | 'nucleus'; // 초성 vs 중성 어느 쪽이 blank인가
}

export const KOREAN_QUESTIONS: SyllableQuestion[] = [
  // 초성 고정 + 중성 빈칸 (beginner)
  { id:'kr-001', given:'ㄱ', blank:'ㅏ', result:'가', hint:'"가방"의 첫 글자', exampleWords:['가방','가족','가을','가수'], blankType:'nucleus', distractors:['ㅓ','ㅗ','ㅜ'] },
  { id:'kr-002', given:'ㄴ', blank:'ㅏ', result:'나', hint:'"나비"의 첫 글자', exampleWords:['나비','나라','나무','나팔'], blankType:'nucleus', distractors:['ㅓ','ㅗ','ㅣ'] },
  { id:'kr-003', given:'ㄷ', blank:'ㅏ', result:'다', hint:'"다리"의 첫 글자', exampleWords:['다리','다람쥐','다음','다섯'], blankType:'nucleus', distractors:['ㅓ','ㅗ','ㅜ'] },
  { id:'kr-004', given:'ㅁ', blank:'ㅏ', result:'마', hint:'"마음"의 첫 글자', exampleWords:['마음','마을','마법','마차'], blankType:'nucleus', distractors:['ㅓ','ㅗ','ㅣ'] },
  { id:'kr-005', given:'ㅂ', blank:'ㅏ', result:'바', hint:'"바다"의 첫 글자', exampleWords:['바다','바람','바나나','박쥐'], blankType:'nucleus', distractors:['ㅓ','ㅗ','ㅜ'] },
  { id:'kr-006', given:'ㅅ', blank:'ㅏ', result:'사', hint:'"사자"의 첫 글자', exampleWords:['사자','사과','사탕','사랑'], blankType:'nucleus', distractors:['ㅓ','ㅗ','ㅜ'] },
  { id:'kr-007', given:'ㅈ', blank:'ㅏ', result:'자', hint:'"자동차"의 첫 글자', exampleWords:['자동차','자전거','자리','자연'], blankType:'nucleus', distractors:['ㅓ','ㅗ','ㅣ'] },
  { id:'kr-008', given:'ㅎ', blank:'ㅏ', result:'하', hint:'"하늘"의 첫 글자', exampleWords:['하늘','하마','하루','하트'], blankType:'nucleus', distractors:['ㅓ','ㅗ','ㅜ'] },
  { id:'kr-009', given:'ㄱ', blank:'ㅗ', result:'고', hint:'"고양이"의 첫 글자', exampleWords:['고양이','고래','고구마','고마워'], blankType:'nucleus', distractors:['ㅏ','ㅜ','ㅣ'] },
  { id:'kr-010', given:'ㄴ', blank:'ㅗ', result:'노', hint:'"노래"의 첫 글자', exampleWords:['노래','노랑','노트','노을'], blankType:'nucleus', distractors:['ㅏ','ㅜ','ㅣ'] },
  { id:'kr-011', given:'ㅅ', blank:'ㅗ', result:'소', hint:'"소나기"의 첫 글자', exampleWords:['소나기','소금','소방차','소원'], blankType:'nucleus', distractors:['ㅏ','ㅜ','ㅣ'] },
  { id:'kr-012', given:'ㅁ', blank:'ㅗ', result:'모', hint:'"모자"의 첫 글자', exampleWords:['모자','모래','모기','모두'], blankType:'nucleus', distractors:['ㅏ','ㅜ','ㅣ'] },
  { id:'kr-013', given:'ㅂ', blank:'ㅗ', result:'보', hint:'"보물"의 첫 글자', exampleWords:['보물','보라','보름달','보라색'], blankType:'nucleus', distractors:['ㅏ','ㅜ','ㅣ'] },
  { id:'kr-014', given:'ㄱ', blank:'ㅣ', result:'기', hint:'"기린"의 첫 글자', exampleWords:['기린','기차','기쁨','기러기'], blankType:'nucleus', distractors:['ㅏ','ㅗ','ㅜ'] },
  { id:'kr-015', given:'ㅅ', blank:'ㅣ', result:'시', hint:'"시계"의 첫 글자', exampleWords:['시계','시장','시원','시작'], blankType:'nucleus', distractors:['ㅏ','ㅗ','ㅜ'] },
  { id:'kr-016', given:'ㄷ', blank:'ㅗ', result:'도', hint:'"도서관"의 첫 글자', exampleWords:['도서관','도마뱀','도넛','도움'], blankType:'nucleus', distractors:['ㅏ','ㅜ','ㅣ'] },
  { id:'kr-017', given:'ㄱ', blank:'ㅜ', result:'구', hint:'"구름"의 첫 글자', exampleWords:['구름','구두','구멍','구슬'], blankType:'nucleus', distractors:['ㅏ','ㅗ','ㅣ'] },
  { id:'kr-018', given:'ㅅ', blank:'ㅜ', result:'수', hint:'"수박"의 첫 글자', exampleWords:['수박','수영','수달','수건'], blankType:'nucleus', distractors:['ㅏ','ㅗ','ㅣ'] },
  { id:'kr-019', given:'ㅎ', blank:'ㅗ', result:'호', hint:'"호랑이"의 첫 글자', exampleWords:['호랑이','호박','호수','호빵'], blankType:'nucleus', distractors:['ㅏ','ㅜ','ㅣ'] },
  { id:'kr-020', given:'ㅎ', blank:'ㅣ', result:'히', hint:'"히어로"의 첫 글자', exampleWords:['히어로','히트','히말라야','힘'], blankType:'nucleus', distractors:['ㅏ','ㅗ','ㅜ'] },
];

export function buildKoreanSession(count = 10): SyllableQuestion[] {
  // Fisher-Yates 셔플 (Array.sort 비교자 기반 셔플은 편향됨)
  const a = [...KOREAN_QUESTIONS];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.min(count, a.length));
}
