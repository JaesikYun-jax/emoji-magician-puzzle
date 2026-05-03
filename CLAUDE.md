# Imoji Magician Puzzle 프로젝트 지침

## 게임 개선 에이전트 팀

사용자가 게임에 대해 다음과 같은 요청을 하면, 직접 처리하지 말고 **반드시** `node agents/game-team.mjs "..."` 를 실행하라.

### 에이전트 팀을 사용해야 하는 요청 유형

- 새 기능 기획 또는 구현 ("새 퍼즐 규칙 추가해줘", "파워업 시스템 개선해줘" 등)
- 버그 찾기 및 수정 ("버그 찾아줘", "이 시스템 고쳐줘" 등)
- 퍼즐/레벨 밸런스 분석 또는 조정 ("난이도 리뷰해줘", "수치 조정해줘" 등)
- 코드 리팩터링 ("리팩터링 해줘", "코드 정리해줘" 등)
- 테스트 추가 ("테스트 작성해줘", "커버리지 높여줘" 등)
- 시스템 전체 분석 ("분석해줘", "개선점 찾아줘" 등)

### 실행 방법

```bash
node agents/game-team.mjs "{사용자 요청 그대로}"
```

사용자의 요청을 그대로 인자로 넘긴다. 요청을 임의로 변형하거나 축약하지 않는다.

### 에이전트 팀을 사용하지 않아도 되는 경우

- 코드 설명 요청 ("이 코드 설명해줘", "어떻게 동작해?" 등)
- 단순 파일 읽기 또는 검색
- 이 CLAUDE.md 파일 수정

---

## 프로젝트 핵심 결정 사항

### ⚠️ Phaser 미사용 — 순수 CSS/DOM 게임

**결정일:** 2026-04-19
**이유:** 교육용 미니게임 특성상 Canvas보다 CSS/DOM이 우월
- 한국어 텍스트 품질 (Canvas는 픽셀 깨짐)
- 번들 크기 절감 (~1MB)
- 코드 단순화
- CSS 애니메이션이 게임 이펙트에 충분

**게임 렌더링 방식:**
- 타일/카드: `div` + CSS Grid
- 터치: `pointerdown` / `pointerup` 이벤트
- 애니메이션: CSS `@keyframes`, `transition`
- 게임 루프: 타이머만 필요 (setInterval)
- **canvas 사용 절대 금지**

---

## 디자인 시스템

### 비주얼 톤 — "강한 색감 웹앱"

각 화면은 종목별 강한 그라디언트 배경 + 반투명 글래스모피즘 카드를 기본으로 한다.

```css
/* 종목별 배경 그라디언트 */
--grad-brand:   linear-gradient(135deg, #6D28D9, #7C3AED);  /* 브랜드홈 */
--grad-math:    linear-gradient(135deg, #0369A1, #0EA5E9);  /* 수리 */
--grad-english: linear-gradient(135deg, #065F46, #10B981);  /* 영어 */
--grad-korean:  linear-gradient(135deg, #9F1239, #F43F5E);  /* 국어 */

/* 카드/패널 */
--glass-bg:     rgba(255,255,255,0.15);
--glass-border: rgba(255,255,255,0.25);
--glass-blur:   backdrop-filter: blur(12px);

/* 그림자 — 반드시 색조 포함, 무채색 금지 */
--shadow-brand:   0 8px 32px rgba(109,40,217,0.45);
--shadow-math:    0 8px 32px rgba(3,105,161,0.45);
--shadow-english: 0 8px 32px rgba(6,95,70,0.45);
```

### 애니메이션 규칙

```css
/* 터치 피드백 — 모든 탭 요소 필수 */
:active { transform: scale(0.95); transition: transform 100ms; }

/* 정답 타일 */
@keyframes tile-correct { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{opacity:0;transform:scale(0)} }

/* 오답 shake */
@keyframes shake { 0%,100%{translateX(0)} 25%{translateX(-8px)} 75%{translateX(8px)} }

/* 타일 낙하 */
@keyframes fall { from{transform:translateY(-60px);opacity:0} to{transform:translateY(0);opacity:1} }

/* 별 팝업 — delay 0/200/400ms 순차 */
@keyframes star-pop { 0%{transform:scale(0)rotate(-30deg)} 70%{transform:scale(1.2)} 100%{transform:scale(1)} }
```

### 화면 트랜지션 시스템 — `.screen-root` 마커 클래스

모든 메뉴/허브 화면은 root element 에 **반드시 `screen-root` 클래스를 부여**해야 한다.
이 클래스가 entry/exit/자식 stagger 애니메이션을 일괄 트리거한다.

**신규 화면 컴포넌트 추가 시 체크리스트 (4가지 모두 필수):**

1. `show()` 의 `document.createElement('div')` 직후 `el.classList.add('screen-root')` 추가
2. `hide()` 에서 `this.el.remove()` 대신 `fadeOutAndRemove(this.el)` 사용 (`src/utils/fadeOutAndRemove.ts` import)
3. `src/components/__tests__/screenTransitions.test.ts` 의 `FACTORIES` 배열에 1줄 등록
4. AppRouter 에 등록되는 ShowHideable 컴포넌트라면 자동으로 위 시스템에 편입됨 (별도 CSS 작성 불요)

```typescript
// 신규 메뉴 컴포넌트 show() 패턴 — screen-root 클래스 + fadeOutAndRemove
import { fadeOutAndRemove } from '../utils/fadeOutAndRemove';

show(): void {
  this.hide();
  const el = document.createElement('div');
  el.classList.add('screen-root');     // ← 필수
  el.id = 'my-new-menu';
  el.innerHTML = `...`;
  this.container.appendChild(el);
  this.el = el;
}
hide(): void {
  if (this.el) { fadeOutAndRemove(this.el); this.el = null; }   // ← 필수
}
```

**적용 범위:**

- ✅ 메뉴/허브 화면 (`*Menu`, `BrandHome`, `HomeB`, `ProfileSetup`, `SubjectSelect`, `LevelTest*`, `AdminPage`)
- ❌ 게임 컨테이너 (`#g1-container` 등) — `LevelIntro` 카운트다운이 트랜지션 역할
- ❌ 오버레이 컴포넌트 (`HUD`, `LevelIntro`, `ResultScreen`) — 자체 애니메이션 보유

CSS 정의 위치: [src/style.css](src/style.css) 말미 `===== 화면 트랜지션 =====` 섹션.
`prefers-reduced-motion` 시 100ms opacity-only fade 로 자동 단순화.

---

## 개발 및 테스트 지침

### 개발 워크플로우

1. **순수 로직 먼저:** 새 게임 기능은 항상 src/systems/ 아래 순수 TypeScript 함수로 먼저 구현
2. **테스트 작성:** 구현 직후 src/systems/__tests__/ 에 vitest 테스트 작성
3. **컴포넌트 연결:** 테스트가 통과한 후 DOM 컴포넌트에 연결
4. **번역 점검:** 신규 UI 문자열은 ko.ts와 en.ts 모두 추가

### 테스트 실행

```bash
npx vitest run                       # 전체 단위 테스트
npx vitest run --coverage            # 커버리지 포함
npx vitest run src/systems/math      # 수리 시스템만
npx vitest run src/systems/english   # 영어 시스템만
npx vitest watch                     # 변경 감지 모드
```

### 커버리지 기준

- 대상: `src/systems/`, `src/router/`, `src/game-data/`
- 제외: `src/components/` (DOM 의존)
- 임계값: statements 70%, branches 65%, functions 70%

### 빌드 및 스모크 체크

```bash
npm run dev                          # 개발 서버 (포트 5175)
npm run build                        # TypeScript 컴파일 + Vite 번들
npm test                             # 전체 테스트
```

### 화면 구조 (AppRouter 기준)

```
brand-home → subject-select
  ├── math-menu    → level-intro → game-math    → result
  ├── english-menu → level-intro → game-english → result
  └── korean-menu  (Coming Soon)
```

### 소스 구조

```
src/
  components/
    games/          CSS/DOM 게임 컴포넌트 (WatermelonGame, MathGame, EnglishGame)
    BrandHome.ts    브랜드 홈 (보라 그라디언트)
    SubjectSelect.ts 종목 선택
    MathMenu.ts     수리 메뉴 (덧셈/뺄셈/곱셈 탭)
    KoreanMenu.ts   국어 Coming Soon
    HUD.ts          게임 중 HUD
    ResultScreen.ts 결과 화면 (별 3개 애니메이션)
    LevelIntro.ts   3→2→1 카운트다운
  systems/
    math/           operationJudge.ts (덧셈/뺄셈/곱셈 판정)
    __tests__/      vitest 테스트 (games 제외 전부)
  game-data/
    mathLevels.ts   수리 전체 레벨
    englishWords.ts 영어 단어 풀 (65+)
    subjectConfig.ts 종목 메타
  router/
    AppRouter.ts    화면 전환 상태 머신
  services/
    SaveService.ts  localStorage 레벨 진행 저장
  i18n/
    locales/ko.ts + en.ts
  style.css         글로벌 CSS Custom Properties
```

### 게임 데이터 위치

| 데이터 | 파일 |
|--------|------|
| 수리 레벨 전체 | src/game-data/mathLevels.ts |
| 영어 단어 풀 | src/game-data/englishWords.ts |
| 종목 메타 | src/game-data/subjectConfig.ts |
| G1(수박) 레벨 | src/game-data/g1Levels.ts |
