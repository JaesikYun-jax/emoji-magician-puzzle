export type ArithmeticOp = 'add' | 'sub' | 'mul' | 'div';

export interface ArithmeticLevel {
  id: number;
  labelKey: string;
  operations: ArithmeticOp[];
  numRange: [number, number];
  items: string[];
}

export const ARITHMETIC_LEVELS: ArithmeticLevel[] = [
  { id: 1,  labelKey: 'arithmetic.level1.label',  operations: ['add'],                    numRange: [1, 5],   items: ['🍎','🍊','🍋'] },
  { id: 2,  labelKey: 'arithmetic.level2.label',  operations: ['add'],                    numRange: [1, 9],   items: ['🍇','🍓','🍑'] },
  { id: 3,  labelKey: 'arithmetic.level3.label',  operations: ['add'],                    numRange: [2, 10],  items: ['🍒','🫐','🍈'] },
  { id: 4,  labelKey: 'arithmetic.level4.label',  operations: ['add','sub'],              numRange: [1, 10],  items: ['🥝','🍍','🥭'] },
  { id: 5,  labelKey: 'arithmetic.level5.label',  operations: ['add','sub'],              numRange: [1, 15],  items: ['🍅','🌽','🥕'] },
  { id: 6,  labelKey: 'arithmetic.level6.label',  operations: ['add','sub'],              numRange: [5, 20],  items: ['🥦','🥑','🍆'] },
  { id: 7,  labelKey: 'arithmetic.level7.label',  operations: ['add','sub','mul'],        numRange: [2, 20],  items: ['🍕','🍔','🌮'] },
  { id: 8,  labelKey: 'arithmetic.level8.label',  operations: ['add','sub','mul'],        numRange: [2, 30],  items: ['🍣','🍜','🍱'] },
  { id: 9,  labelKey: 'arithmetic.level9.label',  operations: ['add','sub','mul'],        numRange: [5, 50],  items: ['🎈','🎁','🎀'] },
  { id: 10, labelKey: 'arithmetic.level10.label', operations: ['add','sub','mul','div'],  numRange: [5, 100], items: ['🏆','🌟','💎'] },
];
