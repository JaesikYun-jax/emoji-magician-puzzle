export type MatrixShape = 'circle' | 'triangle' | 'square' | 'diamond' | 'pentagon' | 'star';
export type MatrixColor = 'violet' | 'sky' | 'rose' | 'amber' | 'emerald';
export type MatrixSize = 'sm' | 'md' | 'lg';
export type MatrixFill = 'filled' | 'outline';
export type MatrixRotation = 0 | 45 | 90 | 135 | 180;
export type ActiveAttribute = 'shape' | 'color' | 'size' | 'fill' | 'rotation';

export interface MatrixCell {
  shape: MatrixShape;
  color: MatrixColor;
  size: MatrixSize;
  fill: MatrixFill;
  rotation: MatrixRotation;
}

export interface MatrixProblem {
  id: string;
  gridSize: 2 | 3;
  cells: (MatrixCell | null)[];  // 길이 gridSize*gridSize, 마지막(우하단)이 null
  choices: MatrixCell[];          // 3 or 4개
  correctIndex: number;
  activeAttributes: ActiveAttribute[];
  difficultyLevel: 1 | 2 | 3;
}

export interface MatrixLevelConfig {
  id: string;
  subject: 'logic';
  gameType: 'matrix-reasoning';
  difficultyLevel: 1 | 2 | 3;
  gridSize: 2 | 3;
  totalRounds: number;
  timeLimit: number;
  activeAttributes: ActiveAttribute[];
  choiceCount: 3 | 4;
  starThresholds: [number, number, number];
}
