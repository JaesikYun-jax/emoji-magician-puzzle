import '@/style.css';
import { gameBus } from './game-bus';
import { LevelIntro } from './components/LevelIntro';
import { HUD } from './components/HUD';
import { ResultScreen } from './components/ResultScreen';
import { BrandHome } from './components/BrandHome';
import { SubjectSelect } from './components/SubjectSelect';
import { MathMenu } from './components/MathMenu';
import { KoreanMenu } from './components/KoreanMenu';
import { EnglishMenu } from './components/EnglishMenu';
import { LevelTestMath } from './components/LevelTestMath';
import { LevelTestEnglish } from './components/LevelTestEnglish';
import { WatermelonGame } from './components/games/WatermelonGame';
import { MathGame } from './components/games/MathGame';
import { MathQuizGame } from './components/games/MathQuizGame';
import { EquationFillGame } from './components/games/EquationFillGame';
import { PatternFinderGame } from './components/games/PatternFinderGame';
import { LogicMenu } from './components/LogicMenu';
import { CreativityMenu } from './components/CreativityMenu';
import { LogicGame } from './components/games/LogicGame';
import { CreativityGame } from './components/games/CreativityGame';
import { appRouter } from './router/AppRouter';
import { G1_LEVELS } from './game-data/g1Levels';
import { getEqFillLevel } from './game-data/equationFillLevels';
import { getPatternLevel } from './game-data/patternFinderLevels';
import { getLogicLevel } from './game-data/logicLevels';
import { getCreativityLevel } from './game-data/creativityLevels';
import { saveService, userMathStatusService } from './services/SaveService';

// ── 1. DOM 루트 ─────────────────────────────────────────────────────────────
const app = document.getElementById('app') as HTMLElement;

// ── 2. 게임 캔버스 컨테이너 (WatermelonGame / MathGame용) ──────────────────
const g1Container = document.createElement('div');
g1Container.id = 'g1-container';
g1Container.style.cssText = `
  position: fixed; inset: 0;
  display: none; flex-direction: column;
  background: linear-gradient(160deg, #166534 0%, #16A34A 60%, #4ADE80 100%);
  z-index: 10;
`;
app.appendChild(g1Container);

const mathContainer = document.createElement('div');
mathContainer.id = 'math-container';
mathContainer.style.cssText = `
  position: fixed; inset: 0;
  display: none; flex-direction: column;
  background: linear-gradient(160deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%);
  z-index: 10;
`;
app.appendChild(mathContainer);

const mathQuizContainer = document.createElement('div');
mathQuizContainer.id = 'math-quiz-container';
app.appendChild(mathQuizContainer);

const eqFillContainer = document.createElement('div');
eqFillContainer.id = 'eq-fill-container';
app.appendChild(eqFillContainer);

const patternFinderContainer = document.createElement('div');
patternFinderContainer.id = 'pattern-finder-container';
app.appendChild(patternFinderContainer);

const logicContainer = document.createElement('div');
logicContainer.id = 'logic-container';
app.appendChild(logicContainer);

const creativityContainer = document.createElement('div');
creativityContainer.id = 'creativity-container';
app.appendChild(creativityContainer);

// ── 3. 게임 컴포넌트 ─────────────────────────────────────────────────────────
const watermelonGame = new WatermelonGame(g1Container);
const mathGame = new MathGame(mathContainer);
const mathQuizGame = new MathQuizGame(mathQuizContainer);
const equationFillGame = new EquationFillGame(eqFillContainer);
const patternFinderGame = new PatternFinderGame(patternFinderContainer);
const logicGame = new LogicGame(logicContainer);
const creativityGame = new CreativityGame(creativityContainer);

// ── 4. UI 레이어 컴포넌트 ────────────────────────────────────────────────────
const brandHome      = new BrandHome(app, appRouter);
const subjectSelect  = new SubjectSelect(app, appRouter);
const mathMenu       = new MathMenu(app, appRouter, saveService);
const koreanMenu     = new KoreanMenu(app, appRouter);
const englishMenu    = new EnglishMenu(app, appRouter, saveService);
const logicMenu = new LogicMenu(app, appRouter, saveService);
const creativityMenu = new CreativityMenu(app, appRouter, saveService);
const levelTestMath  = new LevelTestMath(app);
const levelTestEnglish = new LevelTestEnglish(app, appRouter, saveService);
const levelIntro    = new LevelIntro(app, gameBus);
const hud           = new HUD(app);
const resultScreen  = new ResultScreen(app, gameBus);

// ── 5. 라우터 등록 ────────────────────────────────────────────────────────────
appRouter.register('brand-home',         brandHome);
appRouter.register('subject-select',     subjectSelect);
appRouter.register('math-menu',          mathMenu);
appRouter.register('korean-menu',        koreanMenu);
appRouter.register('english-menu',       englishMenu);
appRouter.register('logic-menu',         logicMenu);
appRouter.register('creativity-menu',    creativityMenu);
appRouter.register('level-test-math',    levelTestMath);
appRouter.register('level-test-english', levelTestEnglish);
appRouter.register('math-quiz-game', {
  show() { mathQuizGame.show(); },
  hide() { mathQuizGame.hide(); },
});

// ── 6. 상태 ──────────────────────────────────────────────────────────────────
const unlockedLevels = new Set<number>([1]);
let currentLevelId: string = '';
let currentScore = 0;
let currentPairsLeft = 10;
let currentTimeRemaining = 60;
let mathGameActive = false; // game-math show() 재진입 방지용

function showMathMenu(): void {
  hud.hide();
  resultScreen.hide();
  levelIntro.hide();
  watermelonGame.hide();
  mathGame.hide();
  // replace: true — game-math를 히스토리에 남기지 않고 math-menu로 복귀.
  // skipHistory 없이 navigate하면 'game-math'가 스택에 쌓여 back() 시 게임이 재시작되는 버그가 발생함.
  appRouter.navigate({ to: 'math-menu', subject: 'math', replace: true });
}

function launchG1Level(levelId: number): void {
  const level = G1_LEVELS.find((l) => l.levelId === levelId) ?? G1_LEVELS[0];
  currentLevelId = String(levelId);
  currentPairsLeft = level.targetPairs;
  currentScore = 0;
  currentTimeRemaining = level.timeLimit;

  mathGame.hide();
  mathContainer.style.display = "none";
  g1Container.style.display = "flex";
  watermelonGame.show();

  hud.show(levelId);
  hud.update(level.timeLimit, 0, level.targetPairs);
  watermelonGame.startLevel(level);
}

function launchMathLevel(levelId: string): void {
  currentLevelId = levelId;
  mathGameActive = true;

  watermelonGame.hide();
  g1Container.style.display = "none";
  mathContainer.style.display = "flex";
  mathGame.show();

  // HUD를 레벨 0으로 표시 (math는 레벨 인덱스 별도 관리)
  hud.show(0);
  hud.update(0, 0, 0);

  saveService.recordMathPlay(levelId);
  mathGame.startLevel(levelId);
}

// ── 7. level-intro 화면 ───────────────────────────────────────────────────────
let introFired = false;

appRouter.register('level-intro', {
  show() {
    const state = appRouter.getState();
    const mathLevelId = state.levelId ?? '';

    const g1Match = mathLevelId.match(/^math-add-single-(\d+)$/);
    if (g1Match) {
      const g1Id = parseInt(g1Match[1], 10);
      if (g1Id >= 1 && g1Id <= G1_LEVELS.length) {
        introFired = true;
        levelIntro.show(g1Id);
        return;
      }
    }

    if (mathLevelId.startsWith('math-')) {
      currentLevelId = mathLevelId;
      hud.hide();
      appRouter.navigate({ to: 'game-math', skipHistory: true });
      return;
    }

    introFired = true;
    levelIntro.show(1);
  },
  hide() {
    levelIntro.hide();
  },
});

// ── 8. game-math 화면 ─────────────────────────────────────────────────────────
appRouter.register('game-math', {
  show() {
    const mathLevelId = currentLevelId;
    if (!mathLevelId || !mathLevelId.startsWith('math-')) {
      appRouter.navigate({ to: 'math-menu', subject: 'math', skipHistory: true });
      return;
    }
    if (mathGameActive) return; // 이미 게임 진행 중이면 재시작 방지
    launchMathLevel(mathLevelId);
  },
  hide() {
    mathGame.hide();
    mathContainer.style.display = "none";
    mathGameActive = false;
  },
});

// ── 8-b. game-english 화면 (미구현 — 추후 EnglishGame 컴포넌트 연결) ─────────
appRouter.register('game-english', {
  show() { /* TODO: EnglishGame 컴포넌트 연결 */ },
  hide() {},
});

// ── 8-c. game-math-quiz 화면 ─────────────────────────────────────────────────
appRouter.register('game-math-quiz', {
  show() {
    mathQuizGame.show();
  },
  hide() {
    mathQuizGame.hide();
  },
});

// ── 8-d. game-eq-fill 화면 (등식 완성 게임) ───────────────────────────────────
appRouter.register('game-eq-fill', {
  show() {
    const state   = appRouter.getState();
    const levelId = state.levelId ?? 'eq-fill-1';
    const cfg     = getEqFillLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'math-menu', subject: 'math' });
      return;
    }
    equationFillGame.show(cfg);
  },
  hide() {
    equationFillGame.hide();
  },
});

// ── 8-f. game-logic 화면 ─────────────────────────────────────────────────────
appRouter.register('game-logic', {
  show() {
    const state   = appRouter.getState();
    const levelId = state.levelId ?? 'logic-1';
    const cfg     = getLogicLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'logic-menu', subject: 'logic' });
      return;
    }
    logicGame.show(cfg);
  },
  hide() {
    logicGame.hide();
  },
});

// ── 8-g. game-creativity 화면 ────────────────────────────────────────────────
appRouter.register('game-creativity', {
  show() {
    const state   = appRouter.getState();
    const levelId = state.levelId ?? 'creativity-1';
    const cfg     = getCreativityLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'creativity-menu', subject: 'creativity' });
      return;
    }
    creativityGame.show(cfg);
  },
  hide() {
    creativityGame.hide();
  },
});

// ── 8-e. game-pattern-finder 화면 (규칙 찾기 게임) ────────────────────────
appRouter.register('game-pattern-finder', {
  show() {
    const state   = appRouter.getState();
    const levelId = state.levelId ?? 'pat-find-1';
    const cfg     = getPatternLevel(levelId);
    if (!cfg) {
      appRouter.navigate({ to: 'math-menu', subject: 'math' });
      return;
    }
    patternFinderGame.show(cfg);
  },
  hide() {
    patternFinderGame.hide();
  },
});

// ── 9. G1 게임 시작 (카운트다운 완료 후) ─────────────────────────────────────
gameBus.on('game:start', ({ levelId }) => {
  if (introFired) {
    introFired = false;
    launchG1Level(parseInt(levelId, 10));
    return;
  }
  introFired = true;
  levelIntro.show(parseInt(levelId, 10));
});

// ── 10. Gameplay 이벤트 (G1 공통) ────────────────────────────────────────────
gameBus.on('timer:tick', ({ remaining }) => {
  currentTimeRemaining = remaining;
  hud.update(remaining, currentScore, currentPairsLeft);
});

gameBus.on('pair:correct', ({ score, combo, pairsLeft }) => {
  currentScore = score;
  currentPairsLeft = pairsLeft;
  hud.update(currentTimeRemaining, score, pairsLeft, combo);
});

gameBus.on('pair:wrong', () => {
  hud.update(currentTimeRemaining, currentScore, currentPairsLeft, 0);
});

gameBus.on('level:clear', ({ score, stars }) => {
  hud.hide();
  watermelonGame.hide();
  g1Container.style.display = "none";
  const numId = parseInt(currentLevelId, 10);
  if (numId < G1_LEVELS.length) {
    unlockedLevels.add(numId + 1);
  }
  resultScreen.show({
    cleared: true,
    score,
    stars,
    levelId: numId,
    maxLevelId: G1_LEVELS.length,
  });
});

gameBus.on('level:timeover', ({ score, pairsCompleted }) => {
  hud.hide();
  watermelonGame.hide();
  g1Container.style.display = "none";
  resultScreen.show({
    cleared: false,
    score,
    stars: 0,
    levelId: parseInt(currentLevelId, 10),
    pairsCompleted,
    maxLevelId: G1_LEVELS.length,
  });
});

// ── 11. MathGame 이벤트 ────────────────────────────────────────────────────────
gameBus.on('math:pairCorrect', ({ score, combo, pairsLeft }) => {
  currentScore = score;
  currentPairsLeft = pairsLeft;
  hud.update(currentTimeRemaining, score, pairsLeft, combo);
});

gameBus.on('math:pairWrong', () => {
  hud.update(currentTimeRemaining, currentScore, currentPairsLeft, 0);
});

gameBus.on('math:levelClear', ({ levelId, score, stars }) => {
  mathGameActive = false;
  hud.hide();
  mathGame.hide();
  mathContainer.style.display = "none";
  saveService.recordMathClear(levelId, stars, score);
  resultScreen.show({
    cleared: true,
    score,
    stars,
    levelId: 0,
    maxLevelId: 0,
  });
});

gameBus.on('math:levelFail', ({ score, pairsCompleted, levelId: _failLevelId }) => {
  mathGameActive = false;
  hud.hide();
  mathGame.hide();
  mathContainer.style.display = "none";
  resultScreen.show({
    cleared: false,
    score,
    stars: 0,
    levelId: 0,
    pairsCompleted,
    maxLevelId: 0,
  });
});

// ── 11-b. MathQuizGame 이벤트 ─────────────────────────────────────────────────
gameBus.on('math:quiz:ready', ({ status }) => {
  userMathStatusService.update(status);
  appRouter.navigate({ to: 'game-math-quiz', subject: 'math' });
});

gameBus.on('math:quiz:correct', ({ streak: _streak, totalCorrect: _totalCorrect }) => {
  // HUD 등 필요 시 연동
});

gameBus.on('math:quiz:levelUp', ({ grade: _grade, semester: _semester }) => {
  // 학기/학년 전환 시 상태 자동 저장은 MathQuizGame 내부에서 처리
});

// ── 12. UI 이벤트 ─────────────────────────────────────────────────────────────
gameBus.on('ui:retry', () => {
  resultScreen.hide();
  if (currentLevelId.startsWith('math-') && !currentLevelId.match(/^math-add-single-\d+$/)) {
    appRouter.navigate({ to: 'game-math', skipHistory: true });
  } else {
    launchG1Level(parseInt(currentLevelId, 10));
  }
});

gameBus.on('ui:nextLevel', ({ levelId }) => {
  resultScreen.hide();
  introFired = true;
  levelIntro.show(parseInt(levelId, 10));
});

gameBus.on('ui:mainMenu', () => {
  showMathMenu();
});

// ── 13. 초기 화면 ─────────────────────────────────────────────────────────────
appRouter.navigate({ to: 'brand-home' });
