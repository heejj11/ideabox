---
name: "Idea Box"
description: "떠오른 생각을 종이 조각처럼 붙여두고 다시 발견하는 개인 아이디어 스크랩북"
colors:
  kraft-board: "#cdbfa6"
  ivory-paper: "#fdfbf4"
  recessed-paper: "#f0e8d6"
  charcoal-ink: "#1f1b16"
  soft-ink: "#4e463b"
  faded-ink: "#746a5b"
  pencil-red: "#d8452f"
  pencil-red-dark: "#aa2e20"
  pencil-red-deep: "#842419"
  masking-tape: "rgba(226, 205, 130, 0.62)"
  success-green: "#416348"
  warning-brown: "#7a4d16"
  error-red: "#9f2c23"
  focus-blue: "#245b79"
  sticker-blue: "#d7e3f5"
  sticker-green: "#d8e8cb"
  sticker-coral: "#f4d5c8"
  sticker-lilac: "#ead8ef"
  sticker-yellow: "#f3dfab"
  sticker-ink: "#302a22"
typography:
  display:
    fontFamily: "Nanum Pen Script, cursive"
    fontSize: "clamp(2.6rem, 5vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.16rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.018em"
  title:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 750
    lineHeight: 1.55
    letterSpacing: "normal"
  body:
    fontFamily: "Pretendard Variable, Pretendard, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Special Elite, monospace"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  handwritten-placeholder:
    fontFamily: "Nanum Pen Script, cursive"
    fontSize: "1.55rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
rounded:
  control: "2px"
  paper: "3px"
  round: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "24px"
  board-column: "28px"
  board-row: "34px"
components:
  button-paper:
    backgroundColor: "{colors.ivory-paper}"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "40px"
  button-accent:
    backgroundColor: "{colors.pencil-red-dark}"
    textColor: "{colors.ivory-paper}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
    height: "40px"
  button-accent-hover:
    backgroundColor: "{colors.pencil-red-deep}"
    textColor: "{colors.ivory-paper}"
    rounded: "{rounded.control}"
  input:
    backgroundColor: "rgba(253, 251, 244, 0.78)"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "7px 9px"
    height: "38px"
  idea-card:
    backgroundColor: "{colors.ivory-paper}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.paper}"
    padding: "25px 20px 17px"
  tag-sticker:
    textColor: "{colors.sticker-ink}"
    padding: "4px 8px"
---

# Design System: Idea Box

## Overview

**Creative North Star: "생각을 붙여두는 작업대"**

Idea Box의 `ib-scrapbook-v1` 세계는 생각을 완성된 문서가 아니라 당장 붙여두는 종이 조각으로 다룬다. 크라프트지 작업대 위에 단일 아이보리 종이를 펼치고, 마스킹테이프와 아주 작은 회전 차이로 손으로 모은 흔적을 만든다. 화면은 따뜻하고 개인적이어야 하지만 정보 구조와 조작은 항상 또렷해야 한다.

콜라주 감성은 무작위 장식의 양이 아니라 정돈된 반복 속의 미세한 차이에서 나온다. 카드 회전, 테이프 위치, 태그 색은 데이터에서 결정되어 다시 렌더링해도 바뀌지 않는다. 사용자가 정리 모드를 켜면 이 흔적을 걷어내고 곧은 카드 그리드로 전환한다. 장식은 기록·검색·상태·접근성보다 앞서지 않는다.

**Key Characteristics:**

- 따뜻한 크라프트 보드와 한 가지 아이보리 카드 종이
- 마스킹테이프만을 비기능적 장식으로 쓰는 절제된 스크랩북 문법
- 아이디어 ID에서 계산되는 결정적 카드 회전(최대 ±1.5deg)
- 빨간 색연필 액센트와 기능적인 파스텔 태그 스티커
- 정리 모드와 `prefers-reduced-motion`에서 사라지는 기울기와 들뜸
- 본문 가독성을 지키는 Pretendard와 제한적으로 쓰는 손글씨

## Colors

팔레트는 크라프트·아이보리·목탄색을 기반으로 하고, 행동에는 색연필 빨강, 분류에는 낮은 채도의 스티커 색만 허용한다.

### Primary

- **Pencil Red** (`pencil-red`): 선택된 태그, 체크박스, 캐럿처럼 사용자의 현재 행동이나 선택을 표시한다.
- **Dark Pencil Red** (`pencil-red-dark`): 주요 저장 행동, 링크, 텍스트 hover와 선택 배경에 쓰는 기본 행동색이다.
- **Deep Pencil Red** (`pencil-red-deep`): 주요 버튼 hover에서만 써서 눌림을 명확히 한다.

### Secondary

- **Sticker Pastels** (`sticker-blue`, `sticker-green`, `sticker-coral`, `sticker-lilac`, `sticker-yellow`): 태그 문자열을 안정적으로 다섯 색 중 하나에 매핑한다. 분류 외의 넓은 면이나 장식에는 사용하지 않는다.
- **Masking Tape** (`masking-tape`): 종이를 작업대에 붙인다는 물성을 만드는 유일한 비기능적 장식색이다.

### Tertiary

- **Success Green**, **Warning Brown**, **Error Red**: 연결·경고·실패 상태에만 사용한다. 상태 텍스트나 아이콘을 함께 제공해 색만으로 의미를 전달하지 않는다.
- **Focus Blue** (`focus-blue`): 모든 키보드 포커스의 3px 외곽선에만 사용한다. 팔레트의 분위기보다 식별성을 우선하는 접근성 색이다.

### Neutral

- **Kraft Board** (`kraft-board`): 전체 화면의 바탕이다. 매우 옅은 교차 선형 그라디언트는 종이 섬유감만 더하며 별도 패턴 그래픽처럼 보여서는 안 된다.
- **Ivory Paper** (`ivory-paper`): 작성창, 아이디어 카드, 상세 패널을 포함한 모든 주요 종이 면의 유일한 카드 톤이다.
- **Recessed Paper** (`recessed-paper`): 알림, 미리보기, 코드, 입력 드롭존처럼 카드 안쪽의 보조 영역에만 쓴다. 두 번째 카드 색으로 사용하지 않는다.
- **Charcoal Ink** (`charcoal-ink`): 제목과 핵심 본문을 위한 가장 진한 잉크다.
- **Soft Ink** (`soft-ink`): 본문과 보조 설명을 위한 기본 잉크다.
- **Faded Ink** (`faded-ink`): 날짜, 상태, 레이블, placeholder처럼 낮은 위계의 정보에 쓴다.

### Named Rules

**The One Paper Rule.** 주요 카드와 패널의 종이 면은 항상 `ivory-paper` 한 톤이다. `recessed-paper`와 사진의 흰 매트는 카드 내부의 기능적 층으로만 제한한다.

**The Functional Color Rule.** 빨강은 행동, 파스텔은 태그, 의미색은 상태에만 쓴다. 넓은 장식 면이나 카드별 배경색을 추가하지 않는다.

## Typography

**Display Font:** Nanum Pen Script (cursive fallback)  
**Body Font:** Pretendard Variable (Pretendard, sans-serif fallback)  
**Label/Mono Font:** Special Elite (monospace fallback)

**Character:** Pretendard가 한글 본문과 조작을 단정하게 묶고, Special Elite가 날짜·상태·단축키에 타자기 같은 기록성을 더한다. Nanum Pen Script는 인간적인 입구를 만드는 예외이며 읽기 본문으로 확장하지 않는다.

### Hierarchy

- **Display** (400, responsive clamp, 0.9): 제품 로고 `Idea Box`에만 쓴다. 로고는 -1.2deg 기울지만 reduced motion에서는 곧게 선다.
- **Headline** (700, 1.16rem, 1.35): 아이디어 카드 제목에 쓴다. 긴 제목은 균형 줄바꿈을 허용한다.
- **Title** (750, 1.12rem, 1.55): 작성창의 제목 입력과 유사한 강한 입력 위계에 쓴다.
- **Body** (400, 1rem, 1.55): 전역 본문과 폼의 기본값이다. Markdown 읽기 영역은 1.72 line-height와 최대 72ch로 더 여유롭게 운용한다.
- **Label** (400, 0.7rem, 1.55): 날짜, 상태, 필드 레이블, 결과 수, 단축키에 쓴다. 상태 라벨만 uppercase를 사용한다.
- **Handwritten Placeholder** (400, 1.55rem, 1.55): 비어 있는 본문 작성창의 “생각을 붙여두세요…” 힌트에만 쓴다.

### Named Rules

**The Two Handwritten Moments Rule.** 손글씨는 로고와 비어 있는 작성창의 본문 placeholder 두 곳에만 쓴다. 카드 제목, 본문, 버튼, 상태, 빈 목록 안내에는 쓰지 않는다.

## Layout

전역 셸은 최대 1440px이며 데스크톱에서 좌우 20px, 모바일에서 좌우 12px의 안전 여백을 둔다. 기본 화면은 헤더, 큰 sticky 작성 종이, 검색·필터 띠, 카드 보드 순서다. 작성 종이는 12px 위에 고정되어 입력까지의 거리를 줄이며, 680px 이하에서는 sticky를 해제해 작은 화면의 가시 영역을 점유하지 않는다.

기본 아이디어 보드는 최소 250px 카드의 자동 채움 그리드와 28px 열 간격·34px 행 간격을 쓴다. 카드 높이는 내용에 따라 달라져 실제 종이 조각처럼 보인다. 정리 모드는 최소 270px 열, 22px 균일 간격, 데스크톱 카드 최소 높이 320px로 바뀌며 회전과 테이프를 제거한다. 680px 이하에서는 두 모드 모두 한 열이고, 정리 모드의 최소 높이도 제거한다.

작성 종이는 데스크톱에서 본문과 230px 첨부 영역의 2열이며, 960px에서 첨부 영역이 210px로 줄고, 680px에서 한 열로 합쳐진다. 필터는 넓은 화면에서 검색과 선택 도구를 양쪽에 두고, 960px 아래에서 한 열, 680px 아래에서 두 개의 select와 한 줄 전체 정리 토글로 재배치한다. 상세 편집은 오른쪽에서 열리는 가변 폭 패널로, 기본 920px·최소 620px·최대 1280px 범위와 56px viewport 여백을 지킨다. 패널 내부가 760px 이상이면 Markdown 편집과 미리보기를 나란히 두고, 680px 이하에서는 화면 전체 너비의 단일 열로 바뀐다.

**The Clear Workspace Rule.** 자유로운 느낌은 카드 내부가 아니라 카드 사이의 여백과 높이 차이에서 만든다. 검색·입력·상태의 정렬선을 의도 없이 흔들지 않는다.

## Elevation & Depth

깊이는 흐림이 전혀 없는 하드 오프셋 그림자, 종이 겹침, 얇은 선으로만 표현한다. 기본 종이는 `3px 5px 0 rgba(31, 27, 22, 0.16)`, hover/focus 카드는 `5px 8px 0 rgba(31, 27, 22, 0.18)`로 올라오며 동시에 3px 위로 이동한다. 작은 알림·필터·사진 매트는 2–4px 범위의 같은 하드 오프셋 문법을 쓴다. 상세 패널은 왼쪽에 `-7px 0 0 rgba(31, 27, 22, 0.17)`을 두어 옆에서 밀려온 종이처럼 보이게 한다.

### Shadow Vocabulary

- **Paper Rest:** `3px 5px 0 rgba(31, 27, 22, 0.16)` — 작성 종이, 카드, 빈 상태의 기본 깊이.
- **Paper Raised:** `5px 8px 0 rgba(31, 27, 22, 0.18)` — 상호작용 가능한 카드의 hover와 focus-within에만 사용.
- **Small Paper:** `2px 3px 0 rgba(31, 27, 22, 0.13–0.20)` — 버튼, 알림, 사진처럼 작은 조각에 사용.
- **Side Sheet:** `-7px 0 0 rgba(31, 27, 22, 0.17)` — 데스크톱 상세 패널의 왼쪽 경계에만 사용.

### Named Rules

**The Zero Blur Rule.** 모든 그림자의 blur radius는 0이다. 부드러운 드롭 섀도, 글로우, 유리 효과, backdrop blur를 추가하지 않는다.

**The State-Lift Rule.** 들뜸은 상호작용 피드백이다. 카드 hover/focus 외의 장식 요소를 임의로 띄우지 않는다.

## Shapes

종이는 거의 직각인 3px 모서리, 버튼과 입력은 2px 모서리를 사용한다. 태그와 필터 칩도 둥근 pill이 아니라 잘라 붙인 직사각형이다. 테두리는 1px 목탄색 또는 투명도가 낮은 잉크색으로 얇게 유지하고, 입력의 핵심 작성 영역은 밑줄만 사용해 종이 위 필기처럼 보이게 한다.

테이프는 74×24px의 반투명 직사각형이며 카드 ID에서 계산한 -3.5deg–3.5deg 회전과 24%–68% 수평 위치를 유지한다. 기본 작성 종이의 테이프만 96px 너비와 -1.4deg로 고정한다. 별 모양 핀은 고정 기능을 위한 44px 조작 영역과 32px 표시 모양이며, 비기능적 장식으로 복제하지 않는다.

**The Nearly Square Rule.** 2–3px 이상의 둥근 모서리와 pill 형태를 새 기본값으로 만들지 않는다. 원형은 연결 상태 점처럼 의미가 있는 작은 표시로 제한한다.

## Components

### Buttons

- **Shape:** 거의 직각인 2px 모서리, 최소 높이 40px, 9px 14px 내부 여백, 1px 잉크 테두리.
- **Primary:** 짙은 색연필 빨강 바탕과 아이보리 글자, 2px×3px 하드 그림자를 사용한다. hover에서는 더 깊은 빨강으로 바뀐다.
- **Paper:** 아이보리 바탕과 진한 잉크로 두며 hover에서 recessed paper로 바뀐다.
- **Text / Danger:** 텍스트 버튼은 투명 바탕과 2px 밑줄, danger는 오류색 텍스트와 현재색 테두리로 표현한다.
- **Focus / Disabled:** 모든 버튼은 3px focus-blue 외곽선과 3px offset을 공유한다. disabled는 opacity 0.55와 `not-allowed` 커서를 사용한다.

### Chips

- **Tag Sticker:** 4px 8px의 작고 각진 파스텔 직사각형이며, 문자열 기반의 색과 -2.5deg–2.5deg 회전을 안정적으로 유지한다.
- **Tag Filter:** recessed paper 바탕과 1px 경계를 사용하고, 선택 시 pencil-red 바탕·흰 글자·dark red 경계로 바뀐다.
- **State:** 선택 여부는 색뿐 아니라 `aria-pressed` 상태로도 전달한다.

### Cards / Containers

- **Corner Style:** 3px 모서리의 아이보리 종이.
- **Idea Card:** 25px 20px 17px 내부 여백과 ID 기반의 -1.5deg–1.5deg 회전을 사용한다. 같은 ID는 데이터가 바뀌지 않는 한 항상 같은 회전을 유지한다.
- **Hover / Focus:** 170ms `cubic-bezier(0.2, 0.75, 0.25, 1)`로 3px 올라오며 회전값은 그대로 보존한다.
- **Organized Mode:** 회전, 테이프, hover 기울기 없이 곧게 정렬한다. 데스크톱에서는 최소 높이 320px로 스캔성을 높인다.
- **Paper Tone:** 카드 종류나 상태가 달라도 배경색을 바꾸지 않는다. 상태는 텍스트 레이블과 기능색으로 보조한다.

### Inputs / Fields

- **Style:** 기본 필드는 38px 이상, 7px 9px 내부 여백, 2px 모서리, 반투명 아이보리 바탕과 1px 잉크 경계를 쓴다.
- **Composer:** 제목과 본문은 종이 위에 직접 쓰는 듯 투명 배경을 유지한다. 제목은 얇은 밑줄, 본문은 무테두리다.
- **Dropzone:** recessed paper의 옅은 층과 1px dashed 경계로 첨부 가능 영역임을 표시한다.
- **Focus / Error / Disabled:** 3px focus-blue 외곽선을 공통 사용하고, 오류는 error-red 텍스트와 해결 가능한 문장으로 설명한다. disabled는 흐리게 보이되 레이블과 원인은 남긴다.

### Navigation

전통적인 상단 메뉴 대신 로고·제품 문장·연결 상태·로그인 행동만 둔 가벼운 헤더를 사용한다. 연결 상태는 색 점과 “온라인/오프라인” 텍스트를 함께 제공한다. 680px 이하에서는 제품 문장과 연결 상태를 숨기되 로고와 로그인 행동은 유지한다.

### Composer Paper

첫 입력 표면은 화면에서 가장 큰 종이 조각이다. 데스크톱에서 sticky이고 중앙 테이프 한 장만 장식으로 가진다. 제목, 본문, 첨부, 태그, 상태, 고정, 저장의 순서는 빠른 기록 흐름을 따른다. 손글씨는 비어 있는 본문 placeholder에만 나타나며 입력을 시작하면 Pretendard 본문으로 전환된다.

### Detail Panel

우측에서 들어오는 단일 아이보리 시트다. 38% 잉크색 backdrop으로 목록과 분리하고, 헤더는 상단에 고정한 채 본문만 독립적으로 스크롤한다. 데스크톱에서는 왼쪽 손잡이를 드래그하거나 방향키로 폭을 조절하고 Home·End로 최소·최대 폭, 더블클릭으로 기본 폭에 돌아간다. 키보드 포커스는 패널 안에 머물고 Escape 또는 닫기 버튼으로 원래 위치에 돌아간다. 모바일에서는 손잡이와 하드 그림자를 제거한 전체 너비 편집면이 된다.

### Local Site Utility Strip

Markdown에서 `localhost` 또는 `127.0.0.1` 링크가 발견될 때만 미리보기 아래에 나타나는 기능 띠다. recessed paper 바탕과 위아래 1px 경계로 편집 영역과 분리하고, 포트·경로·상태를 왼쪽에, 재확인·사이트 열기·중지 명령 복사를 오른쪽에 둔다. 상태는 9px 의미색 점과 “확인 중/실행 중/꺼짐” 텍스트를 항상 함께 제공하며, 확인 중 점멸은 reduced motion에서 사실상 제거한다. 사이트 열기만 빨간 primary 행동으로 강조하고, 중지 명령은 브라우저에서 직접 실행하지 않고 복사 완료·실패를 버튼 문구로 되돌려준다. 좁은 화면에서는 주소와 행동을 세로로 쌓고 버튼이 남은 너비를 나눠 가진다.

### Image Lightbox

인증된 첨부 이미지를 확대할 때 쓰는 중첩 모달이다. 88% 목탄색 backdrop 위에 최대 1180px의 단일 아이보리 시트를 놓고, 이미지는 charcoal-ink 무대 안에서 `contain`으로 온전히 보인다. 썸네일은 버튼으로 제공하며 hover에서 2px만 움직이고, 키보드 포커스에는 기존 3px focus-blue 외곽선을 사용한다. 열리면 닫기 버튼에 포커스를 두고 Tab을 모달 안에 가두며, Escape나 바깥 클릭으로 라이트박스만 닫은 뒤 원래 썸네일로 포커스를 돌린다. 모바일에서는 외곽 여백과 종이 padding을 10px로 줄이고 같은 계층과 종료 동작을 유지한다.

### Motion & Reduced Motion

기본 모션은 카드의 170ms 들뜸과 네 단계 테이프 로딩 회전에만 제한한다. `prefers-reduced-motion: reduce`에서는 모든 animation·transition을 0.01ms로 축소하고, 로고·카드·테이프·핀·태그의 transform을 제거하며, 카드 hover/focus 그림자를 기본 Paper Rest로 되돌린다. 감소 모드에서 위치나 기울기 변화를 다른 장식 애니메이션으로 대체하지 않는다.

## Do's and Don'ts

### Do

- **Do** 모든 주요 종이 카드와 패널에 한 가지 아이보리 톤을 유지한다.
- **Do** 카드 회전을 아이디어 ID에서 결정적으로 계산하고 범위를 ±1.5deg 이내로 제한한다.
- **Do** 정리 모드에서 카드 회전과 테이프를 제거하고 간격과 높이를 규칙적으로 만든다.
- **Do** `prefers-reduced-motion`에서 회전, hover 이동, 로딩 회전을 사실상 제거한다.
- **Do** 키보드 포커스를 3px focus-blue 외곽선과 3px offset으로 명확히 표시한다.
- **Do** 상태를 색과 함께 텍스트, 레이블, `aria` 상태로 설명한다.
- **Do** 테이프는 종이가 붙어 있다는 맥락이 있는 위치에만 드물게 사용한다.

### Don't

- **Don't** 흐림이 있는 그림자, 글로우, glassmorphism, backdrop blur를 사용한다.
- **Don't** 테이프 외의 비기능적 낙서, 클립, 스탬프, 스티커, 질감 이미지를 장식으로 추가한다. 태그 스티커와 별 핀은 기능적 정보·조작으로만 유지한다.
- **Don't** 카드 상태나 종류마다 다른 종이 배경색을 만든다.
- **Don't** 손글씨를 로고와 비어 있는 본문 작성창 placeholder 밖으로 확장한다.
- **Don't** 매 렌더링마다 카드·테이프·태그의 회전이나 위치를 다시 무작위화한다.
- **Don't** 과도한 회전, 겹침, 자유 배치로 검색·필터·읽기 순서를 흐린다.
- **Don't** pill 버튼, 큰 둥근 모서리, 부드러운 SaaS 카드 스타일로 스크랩북의 각진 종이 문법을 희석한다.
