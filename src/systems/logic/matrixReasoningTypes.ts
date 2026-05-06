// ── Cell 종류별 (discriminated union) ────────────────────────────

export type EmojiCategory = 'fruit' | 'animal' | 'celestial' | 'vehicle' | 'food' | 'face';

export interface EmojiCell {
  kind: 'emoji';
  emoji: string;
  category: EmojiCategory;
  count?: 1 | 2 | 3;
}

export interface NumberCell {
  kind: 'number';
  value: number;
}

export type SetColor = 'red' | 'green' | 'blue';
export type SetShape = 'circle' | 'square' | 'triangle';
export type SetCount = 1 | 2 | 3;

export interface SetCardCell {
  kind: 'setcard';
  color: SetColor;
  shape: SetShape;
  count: SetCount;
}

export type MatrixCell = EmojiCell | NumberCell | SetCardCell;

// ── Pattern 종류 ──────────────────────────────────────────────────

export type EmojiPatternKind =
  | 'category-cycle'
  | 'sequence-shift'
  | 'count-progression'
  | 'odd-completion';

export type NumberPatternKind =
  | 'arith-row'
  | 'arith-col'
  | 'arith-both'
  | 'multiplication'
  | 'sum-corner'
  | 'geometric';

export type SetCardRule = 'all-same' | 'all-diff';

export interface SetCardPatternConfig {
  colorRule: SetCardRule;
  shapeRule: SetCardRule;
  countRule: SetCardRule;
}

// ── Problem (공통) ───────────────────────────────────────────────

export type CellKind = 'emoji' | 'number' | 'setcard';

export interface MatrixProblem {
  id: string;
  cellKind: CellKind;
  gridSize: 2 | 3;
  cells: (MatrixCell | null)[];
  choices: MatrixCell[];
  correctIndex: number;
  patternMeta?: {
    kind: string;
    description?: string;
  };
  difficultyLevel: 1 | 2 | 3;
}

// ── LevelConfig (공통) ──────────────────────────────────────────

export interface MatrixLevelConfig {
  id: string;
  subject: 'logic';
  gameType: 'matrix-reasoning';
  difficultyLevel: 1 | 2 | 3;
  cellKind: CellKind;
  gridSize: 2 | 3;
  totalRounds: number;
  timeLimit: number;
  choiceCount: 3 | 4;
  starThresholds: [number, number, number];
  emojiOpts?: {
    patterns: EmojiPatternKind[];
    categories: EmojiCategory[];
  };
  numberOpts?: {
    patterns: NumberPatternKind[];
    valueRange: [number, number];
  };
  setcardOpts?: {
    activeAttributeCount: 1 | 2 | 3;
  };
}
