# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 18, TypeScript, Vite. TanStack Query manages remote state, zustand manages transient UI and in-memory auth state.
The application is a client-only SPA deployed through local preview or GitHub Pages.

## Users

한 사람이 데스크톱을 중심으로 떠오른 아이디어를 즉시 적고, 이미지와 태그를 붙여 나중에 다시 찾는다.

## Product Purpose

미완성 아이디어도 부담 없이 기록하고, 시간이 지난 뒤 검색·태그·상태·핀으로 다시 발견할 수 있게 한다.
첫 화면에서 입력까지의 거리를 최소화하고 저장 결과는 목록에 즉시 반영한다.

## Positioning

별도 서버 없이 사용자의 Google Sheets와 Google Drive만으로 개인 아이디어 기록과 이미지 보관을 제공한다.

## Operating Context

Google 로그인 후 상단 작성창에서 제목, Markdown 본문, 태그, 이미지를 추가한다. 아이디어는 카드 목록과 상세 편집
패널에서 관리하며 오프라인에서는 마지막 목록과 작성 중 초안을 읽을 수 있다.

## Capabilities and Constraints

- Google OAuth scope는 `drive.file`과 `spreadsheets`만 사용한다.
- 액세스 토큰은 메모리에만 보관하며 만료 시 조용히 재발급한다.
- `IdeaBox/`, `IdeaBox/images/`, `ideas` 스프레드시트는 최초 로그인 후 자동 생성한다.
- 목록과 이미지, 초안은 IndexedDB에 캐싱한다.
- 오프라인 상태는 읽기 전용이며 자동 쓰기 동기화 큐를 제공하지 않는다.
- 제목은 선택 사항이며 비어 있으면 본문의 첫 유효 줄에서 생성한다.
- 아이디어 삭제는 `dropped` 상태로 처리하고 복구할 수 있다.

## Brand Commitments

제품명은 Idea Box다. 인터페이스는 사용자가 지정한 콜라주/스크랩북 세계를 유지한다. 손글씨는 로고와 빈
작성창의 힌트에만 쓰고 본문에는 쓰지 않는다. 종이 카드는 한 가지 톤으로 유지하며 색은 태그 스티커와 빨간
색연필 액센트에만 사용한다.

## Evidence on Hand

실제 아이디어 데이터나 브랜드 이미지 자산은 제공되지 않았다. 샘플 데이터는 개발·테스트 전용으로만 사용한다.

## Product Principles

- 로그인 직후 바로 쓸 수 있어야 한다.
- 저장 피드백은 토스트보다 낙관적으로 갱신되는 목록이 먼저다.
- 장식은 기록과 탐색을 방해하지 않아야 한다.
- 한 번 정해진 카드 회전은 데이터가 바뀌지 않는 한 유지된다.
- 네트워크 실패를 숨기지 않고 복구 방법을 알려준다.

## Accessibility & Inclusion

키보드만으로 핵심 흐름을 완료할 수 있어야 한다. `prefers-reduced-motion`에서는 회전과 hover 변형을 모두
제거하고, 상태를 색상 하나만으로 표현하지 않는다.
