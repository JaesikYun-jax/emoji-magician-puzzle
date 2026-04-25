import type { MatrixShape, MatrixColor, MatrixSize, MatrixFill, MatrixRotation } from './matrixReasoningTypes';

export type ChiralityVariant = 'normal' | 'mirrored';
export type OddReason = 'color' | 'shape' | 'size' | 'fill' | 'rotation' | 'chirality' | 'compound';

export interface OddShape {
  shape: MatrixShape;
  color: MatrixColor;
  size: MatrixSize;
  fill: MatrixFill;
  rotation: MatrixRotation;
  chirality: ChiralityVariant;
}

export interface OddOneOutProblem {
  id: string;
  shapes: OddShape[];     // 4개 또는 5개
  oddIndex: number;       // 정답 인덱스
  oddReason: OddReason;
  difficultyLevel: 1 | 2 | 3;
}

export interface OddOneOutLevelConfig {
  id: string;
  subject: 'logic';
  gameType: 'odd-one-out';
  difficultyLevel: 1 | 2 | 3;
  shapeCount: 4 | 5;
  totalRounds: number;
  timeLimit: number | null;  // null = 타이머 없음
  allowedOddReasons: OddReason[];
  starThresholds: [number, number, number];
}
