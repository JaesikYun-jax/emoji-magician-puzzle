# Sabak Design Handoff

디자인 시안(`Sabak Design.html` + `components/*.jsx` + `tokens.css`)을 실제 빌드(`emoji_Magician_Puzzle/`, TypeScript + Vite + 바닐라 DOM)로 이식하기 위한 작업 지시서.

---

## 🎯 컨셉 요약
- **브랜드**: 사박 (**사**·**교**·**육**·**비**·**박**·**살**) — 월 38만원 학원비의 대안
- **메인 카피**: "학원비는 박살, 두뇌는 쑥쑥"
- **학습 방식**: 하루 5분 미니게임, 5과목 (수학·영어·국어·논리·창의)
- **톤**: 학부모에겐 신뢰감, 아이에겐 장난감처럼 귀여움
- **타이포**: Fraunces (display, serif) + Pretendard Variable (body, KR)

---

## 📁 시안 파일 구조
```
Sabak Design.html            # 진입점 — 모든 화면을 DesignCanvas에 배치
tokens.css                   # 색상/폰트/타이포 토큰 + .sb-* 유틸 클래스
components/
  Chrome.jsx                 # iOS 상태바 + 노치 + 홈 인디케이터
  Home.jsx                   # HomeA(브랜드), HomeB(키즈), LogoMark, HeroMascot, SubjectIcon, SubjectOrb
  SubjectSelect.jsx          # 5과목 선택 그리드
  MathGame.jsx               # 수학 게임 + 공용 GameHud
  EnglishGame.jsx            # 영어 게임
  KoreanGame.jsx             # 국어 자모 조합
  LogicGame.jsx              # 논리 패턴
  CreativityGame.jsx         # 창의 한붓그리기
  OtherScreens.jsx           # LevelIntro, ResultScreen, ParentDashboard
```

---

## 🎨 Phase 1 — 디자인 토큰 이식 (30분)

### 1.1 `emoji_Magician_Puzzle/src/style.css`의 `:root`에 병합할 변수
시안 `tokens.css`에서 다음만 복사해서 기존 `src/style.css`의 `:root`에 추가 (중복 키는 시안 값으로 덮어쓰기):

```css
/* 사박 디자인 토큰 */
--ink: #1A0B3E;
--cream: #FAF7F2;
--brand-900: #2E1065;
--brand-700: #4C1D95;
--brand-600: #6D28D9;
--gold: #FDE68A;
--lime: #D9F99D;
--coral: #FB7185;

/* 과목별 액센트 (기존과 중복 시 이 값으로) */
--subject-math: #0EA5E9;
--subject-english: #10B981;
--subject-korean: #F43F5E;
--subject-logic: #6366F1;
--subject-creative: #F97316;

/* 폰트 스택 */
--f-display: 'Fraunces', 'Pretendard Variable', serif;
--f-sans: 'Pretendard Variable', 'Plus Jakarta Sans', system-ui, sans-serif;
```

### 1.2 웹폰트 로드
`index.html` `<head>`에 추가:
```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,300..900,30..100&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"/>
```

### 1.3 전역 em 규칙 추가
```css
em {
  font-style: normal;
  font-weight: 900;
  font-family: inherit;
}
```

### 1.4 유틸리티 클래스 복사
`.sb-phone`, `.sb-status`, `.sb-notch`, `.sb-home`, `.sb-eyebrow`, `.sb-display`, `.sb-btn`, `.sb-chip` 복사. 
→ **실기기에선 `sb-phone`이 모바일 뷰포트 그 자체이므로 불필요**. 내부 유틸만 유지.

---

## 🧩 Phase 2 — 공통 컴포넌트 포팅 (2시간)

### 2.1 `src/components/LogoMark.ts` (신규)
- 시안 `Home.jsx`의 `LogoMark` 함수 SVG 마크업 그대로 복사
- JSX → `document.createElementNS('http://www.w3.org/2000/svg', ...)` 또는 `innerHTML` 문자열 사용 (기존 `BrandHome.ts` 패턴 따름)
- size prop 옵션으로 받기

### 2.2 `src/components/Mascot.ts` (신규) — 핵심 캐릭터
- 시안 `HeroMascot` 전체 포팅:
  - SVG 몸체 (radial gradient, eyes, cheeks, smile)
  - **초롱아귀 스타일 머리카락 + 전구** (viewBox `-20 -40 280 300`)
  - 연속 탭 4단계 frenzy 시스템:
    - 1회: 14개 별 파티클
    - 5회+ (2초 내): 20개 + 쇼크웨이브
    - 7회+: 26개 무지개 이모지 + "신난다! ✨" 팝업
    - 12회+: 36개 + 하트 눈 💕 + "대박! 🎉" 팝업
- React state → 클래스 필드 + 수동 리렌더 (WebComponent 또는 DOM 조작)
- `tapTimes` 배열로 2초 롤링 윈도우 관리

### 2.3 `src/components/SubjectIcon.ts` (신규)
- 5개 과목 심볼 SVG (주판·말풍선·가·탱그램·스파크) — 시안 `SubjectIcon` 함수에서 switch문 그대로
- `id: 'math'|'english'|'korean'|'logic'|'creative'` + `color` prop

### 2.4 `src/components/Chrome.ts` 수정
기존 상태바 스타일을 시안 `Chrome.jsx` 버전으로 갱신 (dark/light 모드 지원)

---

## 🖼️ Phase 3 — 화면 교체 (4–6시간)

### 3.1 `src/components/BrandHome.ts` — **HomeA 전체 이식**
시안 `HomeA`는 스크롤 랜딩 페이지로 4개 섹션:

| 섹션 | 내용 | 소스 위치 |
|---|---|---|
| Hero | "학원비는 박살, 두뇌는 쑥쑥" 헤드라인, eyebrow "사·교·육·비·박·살", Mascot + 5개 orbiting SubjectOrb, 메인 CTA "사박 시작하기", 스크롤 힌트 | `Home.jsx` lines 352–465 |
| Why | "월 38만원 학원비, 정말 필요해요?" + 3개 통계 카드 (73% / 5분 / 1/40) | `Home.jsx` lines 467–484 |
| Subjects | "기본기는 탄탄하게, 학습은 게임으로" + 가로 스냅 스크롤 5과목 미니게임 프리뷰 카드 + "교과서의 기본기" 다크 스트립 | `Home.jsx` lines 486–680 |
| Parent | "학부모용 리포트까지" + 4개 안심 항목 | `Home.jsx` lines 683–700 |

**포팅 포인트:**
- 가로 스냅 스크롤: `overflow-x: auto; scroll-snap-type: x mandatory` 그대로
- 각 과목 카드 데모 영역(수학 카드 6장, 영어 🍎+단어칩, 국어 자모 조합, 논리 ○△패턴, 창의 점잇기)은 인라인 SVG로 포팅
- SubjectOrb 궤도 애니메이션: 5개 동일 44s duration, 72° 간격 고정 keyframes (`sb-orbit-0` ~ `sb-orbit-288`)

### 3.2 `src/components/SubjectSelect.ts` — **시안 SubjectSelect 그대로**
- 5과목 카드 그리드, 각 카드: 아이콘 + 이름 + 진행 바 + 다음 레벨 프리뷰
- 소스: `components/SubjectSelect.jsx`

### 3.3 과목별 게임 화면 (`src/games/*`)
**기존 게임 로직은 건드리지 말 것.** 껍데기(HUD + 문제 영역)만 시안 스타일로 교체.

공용 `GameHud` 컴포넌트 신규 추가:
- 뒤로가기 + 타이머 + 진행바 + 점수 + "🔥 N연속 정답" 콤보 뱃지
- 소스: `MathGame.jsx` 상단 `GameHud` 함수

각 게임 과목별 배경 그라디언트:
- 수학: `linear-gradient(160deg, #0369A1, #0EA5E9)`
- 영어: `linear-gradient(160deg, #047857, #10B981)`
- 국어: `linear-gradient(160deg, #9F1239, #F43F5E)`
- 논리: `linear-gradient(160deg, #3730A3, #6366F1)`
- 창의: `linear-gradient(160deg, #C2410C, #F97316)`

### 3.4 결과 화면 (`src/components/ResultScreen.ts` 신규)
- 별 3개, 점수, 배지 획득 카드, "다시하기" / "다음 레벨" CTA
- 소스: `OtherScreens.jsx` `ResultScreen`

### 3.5 레벨 인트로 (`src/components/LevelIntro.ts` 신규)
- 카운트다운 "3" (non-italic, 중앙 정렬 보정)
- 문제 프리뷰 + 시간/문제수/목표점수 메타
- 소스: `OtherScreens.jsx` `LevelIntro`

### 3.6 학부모 대시보드 (`src/components/ParentDashboard.ts` 신규)
- 주간 리포트: 과목별 숙련도 바, 연속일수, 집중시간
- 소스: `OtherScreens.jsx` `ParentDashboard`

---

## 🗣️ Phase 4 — i18n & QA (1시간)

### 4.1 `src/i18n/ko.ts`에 추가할 키
```ts
brand: {
  tagline: "학원비는 박살, 두뇌는 쑥쑥",
  eyebrow: "사 · 교 · 육 · 비 · 박 · 살",
  ctaStart: "사박 시작하기",
  scrollHint: "왜 사박일까?"
},
why: {
  heading: "월 38만원 학원비, 정말 필요해요?",
  stat73: "초등생 학부모가 '사교육비 부담 크다'고 답함",
  stat5: "하루 5분 게임 학습이 집중력·기억력 향상에 효과적",
  stat140: "사박 구독료는 학원비의 40분의 1"
},
subjects: {
  heading1: "기본기는 탄탄하게",
  heading2: "학습은 게임으로",
  foundation: "교과서의 기본기를 아이 스스로 쌓아요",
  foundationSub: "초1-6 교과 과정 기반 · 교육 전문가 감수"
},
parent: {
  heading: "학부모용 리포트까지",
  report: "주간 성장 리포트",
  noAds: "광고 없음, 결제 없음",
  timeLimit: "시간 제한 설정",
  ageTune: "연령 맞춤 난이도"
}
```

### 4.2 `en.ts`에도 영문 번역본 추가

### 4.3 QA 체크리스트
- [ ] HomeA 스크롤 시 4섹션 순서대로 나타남
- [ ] 마스코트 연속 탭 → frenzy 4단계 정상 동작
- [ ] 5과목 SubjectOrb 궤도 간격 72° 유지, 느린 속도 (44s)
- [ ] 과목 카드 가로 스와이프 정상
- [ ] em 강조 텍스트 전부 볼드 + 색상 (이탤릭 없음)
- [ ] 카운트다운 "3" 원 안에서 중앙 정렬
- [ ] 게임 로직 회귀 없음 (기존 테스트 통과)

---

## ⚠️ 반드시 지킬 것

1. **게임 로직 건드리지 말 것** — 껍데기(HUD, 배경, 레이아웃)만 교체
2. **이탤릭 금지** — `em`은 `font-style: normal + font-weight: 900`으로 처리
3. **이모지 최소화** — 시안처럼 꼭 필요한 파티클/상태 표시에만 (🔥 콤보, 🎉 대박 등)
4. **캐릭터 일체감** — SubjectIcon은 마스코트와 같은 stroke `#2E1065`, strokeWidth `2.4–3.5`
5. **과목 색상은 밝은 톤**으로 유지 (`#7DD3FC`, `#86EFAC` 같은 pastel) — 진한 톤은 그라디언트 배경에만

---

## 📦 핸드오프 파일
- `Sabak Design.html` — 시안 진입점 (로컬 서버로 열어서 확인)
- `Sabak Design (standalone).html` — 오프라인 단일 파일 (검토·공유용)
- `components/*.jsx` — 컴포넌트별 소스
- `tokens.css` — 토큰 파일
- `docs/handoff.md` — 이 문서

질문이나 명확화 필요하면 시안 파일 먼저 열어보고, 해당 섹션 찾아서 소스 참고하세요.
