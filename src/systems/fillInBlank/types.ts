/** 슬롯 태그 — 빈칸 보기 풀을 식별하는 의미·문법 복합 키 (현재 미사용, 추후 hybrid 모드용) */
export type SlotTag = string;

export interface TemplateToken {
  text: string;          // 'sky'
  blankable: boolean;    // 빈칸으로 만들 수 있는지
  slotTag?: SlotTag;     // (선택) 의미·문법 분류 — 현재 엔진은 사용하지 않음
}

export type FIBDifficulty = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';

export interface SentenceTemplate {
  id: string;                  // 'fb-en-014'
  tokens: TemplateToken[];
  meaningKo: string;           // 한국어 의미 전체 (placeholder 없음)
  difficulty: FIBDifficulty;
  tags?: string[];             // ['SVC', 'present'] 분석용
}

/** (deprecated) 풀 타입 — 현재 엔진은 사용하지 않음. 추후 hybrid 모드 도입 시 사용 가능. */
export type DistractorPools = Record<SlotTag, string[]>;

/** 생성된 문제 인스턴스 */
export interface GeneratedProblem {
  templateId: string;
  meaningKo: string;
  /** 모든 토큰 (isBlank=true 이면 빈칸 자리) */
  tokens: { text: string; isBlank: boolean; blankIndex?: number }[];
  /** 빈칸 정보 배열 (빈칸 순서 = blankIndex 순) */
  blanks: {
    tokenIndex: number;    // tokens 배열에서 몇 번째 토큰인지
    answer: string;        // 정답 단어
  }[];
  /** 보기 — 빈칸 정답들을 셔플한 배열 (length === blanks.length, 가짜 단어 없음) */
  choices: string[];
}

/** 난이도별 생성 규칙 */
export interface DifficultyRule {
  blankCount: number | [number, number];  // 정확한 수 또는 [min, max]
}

export const DIFFICULTY_RULES: Record<FIBDifficulty, DifficultyRule> = {
  beginner:     { blankCount: 2 },
  elementary:   { blankCount: 2 },
  intermediate: { blankCount: 3 },
  advanced:     { blankCount: 4 },
  expert:       { blankCount: 5 },
};
