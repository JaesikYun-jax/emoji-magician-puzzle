# 사박겜(sabak-gam) 확장 기획서

**문서 경로:** `docs/game-design/sabak-gam-plan.md`  
**버전:** v1.0 | 작성일: 2026-04-19  
**상태:** Draft  
**연관 문서:** 01-product-core.md, 02-puzzle-mechanics.md, 03-content-level-balance.md, 04-emoji-art-ui.md, 05-tech-test-ops.md

---

## 목차

1. 프로젝트 개요 및 비전
2. 전체 아키텍처
3. 메뉴 계층 구조 및 화면 흐름
4. 종목별 게임 기획
5. SVG 아트 컨셉 및 UI 색상 팔레트
6. 기술 명세
7. 테스트 전략
8. 개발 로드맵

---

## 1. 프로젝트 개요 및 비전

### 1-1. 브랜드 정의

- **브랜드명:** 사박겜 (sabak-gam)
- **부제:** 공부가 게임이 되는 순간
- **타깃:** 초등학생 및 미취학 아동 (5~13세), 학부모 보조 사용 포함
- **한 세션:** 2~5분 이내 완결되는 짧고 명확한 미션
- **핵심 철학:** 교육 내용을 퍼즐 메커니즘에 녹여 정답 맞히기 자체가 쾌감이 되게 한다

### 1-2. 확장 방향

기존 G1(수박 터뜨리기)은 "수리 > 덧셈 > 1자리" 첫 번째 게임으로 편입된다. 신규 종목인 영어 플래시카드를 Phase 3에서 추가하고, 국어는 Phase 4에서 구현한다. 브랜드 홈 화면과 종목 선택 구조가 최상위 레이어를 형성하며, 기존 BootScene → G1GameScene 단층 구조를 다층 라우팅 구조로 전환한다.

---

## 2. 전체 아키텍처

### 2-1. 뷰포트 및 렌더링 전략

```
뷰포트 범위: 480px ~ 768px (모바일 세로 우선, 태블릿 지원)
기준 해상도: 480 x 854 (기준값, Phaser scale manager로 stretch)

렌더링 분리:
  - DOM 레이어: 메뉴, HUD, 결과 화면, 레벨 인트로, 종목 선택 UI
  - Phaser 캔버스 레이어: 실제 퍼즐 게임 로직 및 애니메이션

z-index 규칙:
  Phaser canvas   : z-index 0
  DOM HUD 오버레이 : z-index 10
  DOM 풀스크린 메뉴 : z-index 20
  DOM 모달        : z-index 30
```

### 2-2. 기존 → 신규 구조 전환

```
[기존]
BootScene → G1GameScene

[신규]
BootScene → BrandHomeScreen(DOM) → SubjectSelectScreen(DOM)
              ├── MathMenuScreen(DOM) → MathGame(Phaser)
              ├── EnglishMenuScreen(DOM) → EnglishGame(Phaser)
              └── KoreanMenuScreen(DOM) → [Coming Soon]
```

### 2-3. 레이어 분리 원칙

```
src/systems/     순수 로직 (Phaser/DOM 의존 금지, 테스트 대상)
src/scenes/      Phaser 씬
src/components/  DOM UI 컴포넌트
src/game-data/   게임 데이터 정의
src/router/      화면 전환 상태 머신
src/i18n/        다국어
src/assets/svg/  SVG 에셋
```

---

## 3. 메뉴 계층 구조 및 화면 흐름

### 3-1. 전체 화면 흐름도

```
[앱 진입]
    │
    ▼
[BootScene] ── 에셋 로드, 저장 데이터 복구
    │
    ▼
[BrandHomeScreen]
  타이틀: "사박겜"
  버튼: [시작하기] [설정]
    │
    ▼
[SubjectSelectScreen]
  종목 카드 3개:
    [수리 수학] [영어] [국어]
    │                │              │
    ▼                ▼              ▼
[MathMenuScreen]  [EnglishMenuScreen]  [KoreanMenuScreen]
                                       (Coming Soon)
    │                │
    ▼                ▼
[LevelSelectGrid] [LevelSelectGrid]
    │                │
    ▼                ▼
[LevelIntroScreen] [LevelIntroScreen]
    │                │
    ▼                ▼
[MathScene]        [EnglishScene]
    │                │
    ▼                ▼
[ResultScreen]     [ResultScreen]
```

### 3-2. 화면별 요소 명세

#### BrandHomeScreen
| 요소 | 타입 | 설명 |
|------|------|------|
| 브랜드 로고 | SVG 인라인 | "사박겜" 로고 |
| 시작하기 버튼 | DOM button | → SubjectSelectScreen |
| 설정 버튼 | DOM button | → SettingsModal |
| 배경 | CSS gradient | Primary Gradient |

이벤트: `NAVIGATE_TO_SUBJECT_SELECT`

#### SubjectSelectScreen
| 요소 | 타입 | 설명 |
|------|------|------|
| 뒤로 가기 버튼 | DOM button | → BrandHomeScreen |
| 수리 카드 | DOM card | SVG 아이콘 + "수리 수학" |
| 영어 카드 | DOM card | SVG 아이콘 + "영어" |
| 국어 카드 | DOM card | SVG 아이콘 + "국어" + "준비중" |

이벤트: `SUBJECT_SELECTED(subject: 'math' | 'english' | 'korean')`

#### MathMenuScreen / EnglishMenuScreen
| 요소 | 타입 | 설명 |
|------|------|------|
| 카테고리 탭 | tab bar | 수리: 덧셈/뺄셈/곱셈 |
| 레벨 그리드 | DOM grid | 레벨 번호 + 별점 |
| 잠금 표시 | SVG icon | 미해금 레벨은 자물쇠 |

이벤트: `LEVEL_SELECTED(subject, category, levelId)`

---

## 4. 종목별 게임 기획

### 4-1. 수리(Math)

#### 카테고리 구조
```
수리
  ├── 덧셈 (Addition)
  │     ├── 1자리 덧셈  (Lv 1~7)   ← G1(수박 터뜨리기) 편입
  │     ├── 2자리 덧셈  (Lv 8~14)
  │     └── 3자리 덧셈  (Lv 15~20)
  ├── 뺄셈 (Subtraction)
  │     ├── 1자리 뺄셈  (Lv 1~7)
  │     ├── 2자리 뺄셈  (Lv 8~14)
  │     └── 3자리 뺄셈  (Lv 15~20)
  └── 곱셈 (Multiplication)
        ├── 구구단 2단~5단  (Lv 1~8)
        ├── 구구단 6단~9단  (Lv 9~16)
        └── 두 자리 곱셈   (Lv 17~22)
```

#### 핵심 메커니즘
- 보드에 숫자 타일이 배치됨
- 두 타일을 탭하여 목표 연산 결과와 일치하는지 판정
- 정답 쌍 제거 → 빈 자리에 새 타일 낙하
- **덧셈:** 두 타일의 합 = 목표값
- **뺄셈:** 큰 타일 - 작은 타일 = 목표값 (순서 강제)
- **곱셈:** 두 타일의 곱 = 목표값

#### 1자리 덧셈 레벨 설계 (Lv 1~7, G1 편입)

| Lv | 목표값 | 타일 범위 | 보드 | 목표 쌍 | 제약 | 제약값 |
|----|--------|-----------|------|---------|------|--------|
| 1  | 10 | 1~9 | 4×4 | 5쌍 | 이동수 | 20 |
| 2  | 10 | 1~9 | 4×4 | 7쌍 | 이동수 | 22 |
| 3  | 10 | 1~9 | 4×5 | 8쌍 | 이동수 | 24 |
| 4  | 8,10 | 1~9 | 4×5 | 6쌍×2 | 이동수 | 26 |
| 5  | 10 | 1~9 | 5×5 | 10쌍 | 시간 | 60초 |
| 6  | 7,10 | 1~9 | 5×5 | 5쌍×2 | 시간 | 70초 |
| 7  | 10 | 1~9 | 5×6 | 12쌍 | 시간 | 80초 |

**점수 계산**
```
기본 점수 = 쌍 1개당 100점
콤보 보너스 = 연속 정답 N개 × 50점 (N ≥ 2)
남은 이동/시간 보너스 = 잔여량 × 10점
```

**별점 기준**
- 1별: 목표 달성
- 2별: 잔여 이동 5회 이상 (타이머: 15초 이상)
- 3별: 잔여 이동 10회 이상 (타이머: 30초 이상)

#### 2자리/3자리 덧셈
- 2자리 (Lv 8~14): 목표값 20~100, 타일 범위 10~90
- 3자리 (Lv 15~20): 목표값 100~1000, 타일 범위 100~900

#### 뺄셈 특이사항
- 큰 수 → 작은 수 순서 탭 강제
- 역순 탭 시 shake + 이동수 차감 없음
- 첫 탭 타일에 "-" 연산자 오버레이

#### 곱셈 특이사항
- 두 타일 탭 시 곱 결과를 HUD 말풍선으로 즉시 표시
- 구구단 2단 → 5단 → 6단 → 9단 순차 진행

### 4-2. 영어(English)

#### 카테고리 구조
```
영어
  ├── 입문 (Beginner)  — 색깔, 숫자, 동물    (Lv 1~5)
  ├── 기초 (Elementary) — 일상어, 신체, 가족  (Lv 6~12)
  ├── 중급 (Intermediate) — 학교, 음식, 감정 (Lv 13~20)
  └── 고급 (Advanced)  — 자연, 직업, 형용사  (Lv 21~28)
```

#### 핵심 메커니즘 — 플래시카드 객관식
1. 카드 앞면에 제시어 표시 (한→영 또는 영→한)
2. 하단에 보기 버튼 배열 (2개 → 3개 → 4개)
3. 선택 → 정오답 피드백
4. 1.2초 후 다음 카드
5. 레벨 내 N장 완료 시 결과 화면

#### 보기 수 점진적 증가
| 레벨 구간 | 보기 수 |
|-----------|---------|
| Lv 1~3   | 2개     |
| Lv 4~8   | 3개     |
| Lv 9+    | 4개     |

#### 단어 풀 (입문 — 색깔/숫자/동물 예시)

**색깔 (10단어)**
| 영어 | 한국어 |
|------|--------|
| red | 빨간색 |
| blue | 파란색 |
| yellow | 노란색 |
| green | 초록색 |
| orange | 주황색 |
| purple | 보라색 |
| pink | 분홍색 |
| white | 흰색 |
| black | 검은색 |
| brown | 갈색 |

**동물 (15단어)**
| 영어 | 한국어 |
|------|--------|
| cat | 고양이 |
| dog | 강아지 |
| rabbit | 토끼 |
| bear | 곰 |
| pig | 돼지 |
| cow | 소 |
| horse | 말 |
| monkey | 원숭이 |
| lion | 사자 |
| tiger | 호랑이 |
| elephant | 코끼리 |
| penguin | 펭귄 |
| duck | 오리 |
| frog | 개구리 |
| fish | 물고기 |

#### 오답 재삽입 정책
- 오답 카드는 덱 후반에 재삽입 (한 레벨 내 재도전)
- 이동수 제약: 오답 시 이동수 1 추가 차감
- 타이머 제약: 오답 시 5초 패널티

#### 별점 기준 (영어)
- 1별: 60% 이상 정답
- 2별: 80% 이상 정답
- 3별: 100% 정답 (퍼펙트)

### 4-3. 국어(Korean)

현재 "Coming Soon" 플레이스홀더 유지.

**향후 방향 (Phase 4):**
- 받아쓰기 게임 (TTS 기반, 맞춤법 선택)
- 낱말 잇기 게임 (끝말잇기 방식)
- 한글 조합 퍼즐 (자음/모음 타일)

---

## 5. SVG 아트 컨셉 및 UI 색상 팔레트

### 5-1. 브랜드 로고 SVG 명세

- **뷰박스:** `0 0 320 120` (배너형), `0 0 120 120` (아이콘형)
- **배경:** 둥근 모서리 사각형, Primary Gradient
- **텍스트 "사박겜":** 흰색, 둥근 고딕
- **부제 "sabak-gam":** 흰색 80%, 라틴 폰트
- **캐릭터 아이콘:** 마법사 모자 + 별 (보라/노란 조합)

### 5-2. 종목별 아이콘 SVG

| 종목 | 배경 | 중앙 요소 |
|------|------|-----------|
| 수리 | 하늘파랑 원형 (#38BDF8→#0EA5E9) | "123" + "+" |
| 영어 | 에메랄드 원형 (#34D399→#10B981) | "Abc" + 별 |
| 국어 | 로즈레드 원형 (#FB7185→#F43F5E) | "가" |

### 5-3. UI 색상 팔레트

```
Primary Gradient : #6D28D9 → #7C3AED (보라, 마법사)

Subject Colors:
  Math    : #0EA5E9 / 배경 연 #E0F2FE
  English : #10B981 / 배경 연 #D1FAE5
  Korean  : #F43F5E / 배경 연 #FFE4E6

Base Colors:
  Background     : #F8FAFC
  Surface        : #FFFFFF
  Border         : #E2E8F0
  Text Primary   : #1E293B
  Text Secondary : #64748B

Feedback Colors:
  Correct : #22C55E
  Wrong   : #EF4444
  Star    : #FBBF24
```

---

## 6. 기술 명세

### 6-1. 디렉토리 구조 변경사항

```
src/
  components/
    BrandHome.ts       ← 신규
    SubjectSelect.ts   ← 신규
    MathMenu.ts        ← 신규
    EnglishMenu.ts     ← 신규
    KoreanMenu.ts      ← 신규
    LevelSelectGrid.ts ← 신규
    FlashCard.ts       ← 신규 (영어)
    ChoiceButtons.ts   ← 신규 (영어)
    HUD.ts             ← 유지
    ResultScreen.ts    ← 유지
    LevelIntro.ts      ← 유지
  scenes/
    BootScene.ts       ← 유지 (폰트 로딩 추가)
    G1GameScene.ts     ← 유지 (MathScene으로 점진적 통합)
    MathScene.ts       ← 신규
    EnglishScene.ts    ← 신규
  systems/
    math/
      operationJudge.ts
      levelProgressTracker.ts
    english/
      wordSetManager.ts
      flashCardEngine.ts
      answerJudge.ts
  game-data/
    g1Levels.ts        ← 유지
    mathLevels.ts      ← 신규
    englishWords.ts    ← 신규
    subjectConfig.ts   ← 신규
  router/
    AppRouter.ts       ← 신규
  assets/svg/
    logo-brand.svg     ← 신규
    icon-math.svg      ← 신규
    icon-english.svg   ← 신규
    icon-korean.svg    ← 신규
```

### 6-2. 핵심 TypeScript 타입 정의

```typescript
// src/game-data/subjectConfig.ts
type SubjectId = 'math' | 'english' | 'korean';
type MathOperation = 'addition' | 'subtraction' | 'multiplication';
type DigitLevel = 'single' | 'double' | 'triple';
type EnglishCategory = 'beginner' | 'elementary' | 'intermediate' | 'advanced';
type ConstraintType = 'moves' | 'time';

interface SubjectConfig {
  id: SubjectId;
  nameKo: string;
  nameEn: string;
  iconPath: string;
  colorPrimary: string;
  colorLight: string;
  isAvailable: boolean;
}

interface MathLevelConfig {
  id: string;
  subject: 'math';
  operation: MathOperation;
  digitLevel: DigitLevel;
  levelIndex: number;
  targetValue: number | number[];
  tileRange: [number, number];
  boardCols: number;
  boardRows: number;
  targetPairs: number | Record<number, number>;
  constraint: ConstraintType;
  constraintValue: number;
  starThresholds: [number, number, number];
  baseScore: number;
  comboBonus: number;
}

interface WordEntry {
  id: string;
  english: string;
  korean: string;
  emoji?: string;
  category: string;
  difficulty: EnglishCategory;
}

interface EnglishLevelConfig {
  id: string;
  subject: 'english';
  category: EnglishCategory;
  wordCategories: string[];
  presentationDir: 'en-to-ko' | 'ko-to-en';
  choiceCount: 2 | 3 | 4;
  cardCount: number;
  showEmoji: boolean;
  constraint: ConstraintType;
  constraintValue: number;
  passThreshold: number;
  starThresholds: [number, number, number];
}
```

### 6-3. 이벤트 버스 확장

```typescript
// 신규 이벤트 추가
'NAVIGATE': { to: ScreenId; subject?: SubjectId; levelId?: string }
'NAVIGATE_BACK': void

'MATH_PAIR_CORRECT': { pairValue: number; comboCount: number; scoreGained: number }
'MATH_PAIR_WRONG': { tileA: number; tileB: number }
'MATH_LEVEL_COMPLETE': { levelId: string; score: number; stars: number }
'MATH_LEVEL_FAIL': { levelId: string; score: number }

'ENGLISH_ANSWER_CORRECT': { word: WordEntry; timeTaken: number }
'ENGLISH_ANSWER_WRONG': { selected: WordEntry; correct: WordEntry }
'ENGLISH_LEVEL_COMPLETE': { levelId: string; correctCount: number; totalCount: number; stars: number }
```

### 6-4. AppRouter 핵심 로직

```typescript
type ScreenId =
  | 'brand-home' | 'subject-select'
  | 'math-menu' | 'english-menu' | 'korean-menu'
  | 'level-select' | 'level-intro'
  | 'game-math' | 'game-english' | 'result';

class AppRouter {
  navigate(payload: { to: ScreenId; subject?: SubjectId; levelId?: string }): void {
    // 1. 현재 화면 hide
    // 2. Phaser 씬 전환 (필요 시)
    // 3. 상태 업데이트
    // 4. 신규 화면 show
  }
  back(): void { /* previousScreen으로 복귀 */ }
}
```

### 6-5. 저장 데이터 (localStorage)

```typescript
interface SaveData {
  version: number;
  math: { levelProgress: Record<string, LevelProgress> };
  english: { levelProgress: Record<string, LevelProgress> };
  settings: { language: 'ko' | 'en'; soundEnabled: boolean; musicEnabled: boolean };
}

interface LevelProgress {
  stars: number;
  bestScore: number;
  playCount: number;
  isUnlocked: boolean;
}
```

---

## 7. 테스트 전략

### 7-1. 수리 시스템 단위 테스트 목록

```
operationJudge.test.ts
  - 덧셈: 합 = 목표값 → true
  - 뺄셈: 역순 탭 → 'order-error'
  - 곱셈: 곱 = 목표값 → true

levelProgressTracker.test.ts
  - 레벨 완료 시 다음 레벨 잠금 해제
  - 최고 별점 보존

boardGenerator.test.ts (기존 확장)
  - 각 연산 모드에서 유효 쌍 최소 1개 보장
```

### 7-2. 영어 시스템 단위 테스트 목록

```
wordSetManager.test.ts
  - 카테고리 필터링
  - 오답 보기 중복 없음
  - 오답은 동일 카테고리 우선

flashCardEngine.test.ts
  - 오답 카드 덱 후반 재삽입
  - 카드 소진 시 COMPLETE

answerJudge.test.ts
  - 별점 계산: 60%=1별, 80%=2별, 100%=3별
```

### 7-3. 자동 테스트 harness

```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      - run: npm ci
      - run: npx vitest run --coverage
  build:
    needs: test
    steps:
      - run: npx vite build
      - run: test -f dist/index.html
```

vitest 커버리지 임계값:
- statements: 80%
- branches: 75%
- functions: 80%
- 대상: src/systems/, src/router/, src/game-data/
- 제외: src/scenes/, src/components/

---

## 8. 개발 로드맵

### Phase 1 — 메뉴 계층 + 홈 화면 SVG (현재 진행)

**완료 기준:**
- 앱 진입 시 BrandHome 표시
- 수리 → 덧셈 Lv1 → 기존 G1 게임 → 결과 → 메뉴 복귀 전체 흐름 작동
- 수리/영어/국어 아이콘 SVG 표시
- 네비게이션 단위 테스트 통과

### Phase 2 — 수리 확장 (뺄셈, 곱셈)

- mathLevels.ts 전체 데이터
- operationJudge.ts 구현
- MathScene 동적 보드 생성
- 레벨 잠금/해제 저장

### Phase 3 — 영어 플래시카드

- englishWords.ts 단어 풀
- flashCardEngine.ts
- EnglishScene Phaser 씬
- 별점 계산 (정답률 기반)

### Phase 4 — 국어 실제 구현

- TTS 연동 또는 낱말 잇기 방식 확정
- 교과 어휘 데이터
- KoreanScene 구현

---

## 부록 A. i18n 신규 키 목록

```typescript
'brand.title': '사박겜'
'brand.subtitle': '공부가 게임이 되는 순간'
'brand.startButton': '시작하기'
'subject.math': '수리 수학'
'subject.english': '영어'
'subject.korean': '국어'
'subject.comingSoon': '준비중'
'math.operation.addition': '덧셈'
'math.operation.subtraction': '뺄셈'
'math.operation.multiplication': '곱셈'
'english.category.beginner': '입문'
'english.category.elementary': '기초'
'english.category.intermediate': '중급'
'english.category.advanced': '고급'
'result.perfect': '완벽해요!'
'result.great': '잘했어요!'
'result.good': '했어요!'
'result.fail': '다시 도전!'
```
