# Idea Box

떠오른 아이디어를 빠르게 적고 이미지와 태그를 붙여 다시 찾는 1인용 스크랩북 웹앱입니다. 별도 서버 없이
Google Sheets를 데이터베이스로, Google Drive를 이미지 저장소로 사용합니다.

## 주요 기능

- 선택적 제목과 Markdown 본문 작성, `Cmd/Ctrl + Enter` 저장
- 붙여넣기, 드래그 앤 드롭, 파일 선택을 통한 이미지 첨부
- 제목·본문·태그 통합 검색과 태그·상태 필터
- 최신순·오래된순·수정순 정렬, 핀 고정 항목 우선 표시
- 우측 상세 패널에서 Markdown 미리보기와 인라인 편집
- 회전과 테이프를 없애는 정리 모드
- IndexedDB 기반 목록·이미지·작성 초안 캐시
- 네트워크 실패 시 마지막 목록을 읽기 전용으로 표시

## 준비 사항

- Node.js 22.12 이상
- Google 계정
- Google Cloud 프로젝트와 Web OAuth 클라이언트 ID

## Google Cloud 설정

### 1. 프로젝트 만들기

1. [Google Cloud Console](https://console.cloud.google.com/)을 엽니다.
2. 상단 프로젝트 선택 메뉴에서 **새 프로젝트**를 선택합니다.
3. 프로젝트 이름을 정하고 **만들기**를 누릅니다.
4. 생성한 프로젝트가 현재 프로젝트로 선택되어 있는지 확인합니다.

### 2. Sheets API와 Drive API 활성화

1. **API 및 서비스 → 라이브러리**로 이동합니다.
2. `Google Sheets API`를 검색해 **사용**을 누릅니다.
3. 다시 라이브러리에서 `Google Drive API`를 검색해 **사용**을 누릅니다.

### 3. OAuth 동의 화면 구성

1. **Google Auth Platform** 또는 **API 및 서비스 → OAuth 동의 화면**으로 이동합니다.
2. 앱 이름과 지원 이메일을 입력합니다.
3. 개인 Google 계정에서 쓸 경우 대상 유형을 **외부**로 선택합니다.
4. 앱이 테스트 상태라면 자신의 Google 계정을 테스트 사용자로 추가합니다.
5. 앱이 요청하는 범위는 아래 두 개뿐입니다.

```text
https://www.googleapis.com/auth/drive.file
https://www.googleapis.com/auth/spreadsheets
```

`drive.file`은 Idea Box가 만들거나 사용자가 이 앱으로 연 파일에만 접근합니다. 전체 Drive 읽기 권한은 요청하지
않습니다.

### 4. OAuth 클라이언트 ID 발급

1. **Google Auth Platform → 클라이언트** 또는 **API 및 서비스 → 사용자 인증 정보**로 이동합니다.
2. **클라이언트 만들기 → OAuth 클라이언트 ID**를 선택합니다.
3. 애플리케이션 유형은 **웹 애플리케이션**을 선택합니다.
4. **승인된 JavaScript 원본**에 다음 주소를 등록합니다.

```text
http://localhost:5173
http://localhost:4173
```

5. 별도 승인된 리디렉션 URI는 필요하지 않습니다.
6. 생성된 클라이언트 ID를 복사합니다.

### 5. 환경 변수 설정

`.env.example`을 `.env.local`로 복사하고 발급받은 값을 입력합니다.

```bash
cp .env.example .env.local
```

```dotenv
VITE_GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com
```

OAuth 클라이언트 ID는 브라우저 앱을 식별하는 공개 값이지만, 저장소별 설정을 위해 `.env.local`은 Git에서
제외되어 있습니다. 액세스 토큰은 앱 메모리에만 존재하며 localStorage나 IndexedDB에 저장하지 않습니다.

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

프로덕션 빌드를 로컬에서 확인하려면 다음 명령을 사용합니다.

```bash
npm run build
npm run preview
```

preview 주소는 `http://localhost:4173`입니다.

## 최초 로그인 시 생성되는 항목

첫 로그인 후 아래 구조가 사용자의 Drive에 자동으로 만들어집니다.

```text
IdeaBox/
├── ideas              Google 스프레드시트
└── images/            첨부 이미지 폴더
```

스프레드시트 안에는 `ideas` 시트가 만들어지며 첫 행은 다음 헤더입니다.

| id | createdAt | updatedAt | title | body | tags | status | pinned | imageIds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |

폴더와 파일 ID는 `idea-box:workspace:v1` 키로 localStorage에 캐시합니다. 액세스 토큰은 이 캐시에 포함되지
않습니다. 캐시된 파일이 사라졌다면 앱이 다시 탐색하거나 필요한 항목을 생성합니다.

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run typecheck` | TypeScript 검사 |
| `npm run test` | Vitest 단위·컴포넌트 테스트 |
| `npm run build` | 타입 검사 후 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 로컬 확인 |
| `npm run check` | 테스트, 타입 검사, 빌드를 한 번에 실행 |

## 데이터와 오프라인 동작

- 목록은 로그인 후 `ideas!A:I`를 한 번 읽고 브라우저에서 검색·필터링합니다.
- 신규 아이디어는 append, 수정은 최신 시트에서 `id`를 찾아 계산한 행 범위에 update합니다.
- 삭제는 실제 행 삭제 대신 `status=dropped`로 저장합니다.
- 첨부를 제거하면 해당 Drive 이미지 파일도 삭제합니다. 아이디어를 `dropped`로 바꿀 때 이미지는 유지합니다.
- 이미지 표시는 공개 URL이 아니라 인증된 `files.get?alt=media` 응답을 Blob으로 받아 처리합니다.
- 네트워크가 끊기면 마지막 목록과 이미지 캐시를 읽을 수 있지만 작성과 수정은 비활성화됩니다.
- 작성 중 초안과 아직 업로드하지 않은 이미지 파일은 IndexedDB에 보관됩니다.

## 문제 해결

### 새로고침 후 Google 연결 버튼이 다시 표시됨

보안을 위해 액세스 토큰은 브라우저 저장소에 남기지 않고 현재 페이지의 메모리에만 둡니다. 따라서 전체 새로고침이나
탭을 닫은 뒤에는 **Google로 시작하기**를 한 번 눌러야 합니다. 이미 허용한 권한은 다시 묻지 않고 이어서 연결합니다.
페이지를 계속 열어 둔 동안에는 토큰 만료 전에 다음 클릭 또는 키 입력 시점에 자동 갱신을 시도합니다.

### `origin_mismatch` 또는 OAuth 400 오류

현재 주소의 **원본**이 OAuth 클라이언트의 승인된 JavaScript 원본에 정확히 등록되어 있는지 확인합니다. 경로와
마지막 슬래시는 제외하고 `http://localhost:5173`처럼 등록합니다.

### 로그인했지만 403 오류가 표시됨

현재 Cloud 프로젝트에서 Google Sheets API와 Google Drive API가 모두 활성화되어 있는지 확인합니다. OAuth
동의 화면이 테스트 상태라면 로그인 계정이 테스트 사용자에 포함되어 있어야 합니다.

### Drive 파일을 옮기거나 삭제한 뒤 초기화가 실패함

브라우저 개발자 도구에서 localStorage의 `idea-box:workspace:v1` 항목을 지우고 다시 로그인합니다. 앱은 접근 가능한
IdeaBox 항목을 다시 찾고 없는 항목만 생성합니다.

### 오프라인 목록이 너무 오래됨

온라인 연결을 복구한 뒤 화면의 **다시 시도**를 누르거나 페이지를 새로고침합니다. 오프라인 편집 자동 동기화는
제공하지 않습니다.
