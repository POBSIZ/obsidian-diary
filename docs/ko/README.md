# Diary (한국어)

Diary는 Obsidian에서 연/월 단위 플래닝과 날짜 기반 노트 관리를 위한 플러그인입니다.

## 현재 정보

- 플러그인 ID: `diary`
- 현재 버전: `1.0.9`
- 최소 Obsidian 버전: `1.7.2`
- 지원 플랫폼: 데스크톱 / 모바일

## 핵심 뷰

- **연간 플래너**: 12개월 x 31일 격자
- **월간 플래너(그리드)**: 월 달력 상세 뷰 (모바일 핀치 줌 지원)
- **월간 리스트 플래너**: 월간 일자 목록형 뷰

같은 리프에서 다음 순서로 뷰를 순환할 수 있습니다.  
`Yearly -> Monthly Grid -> Monthly List -> Yearly`

## 주요 기능

- **날짜 노트**: 날짜 셀 클릭으로 해당 일자 노트 열기/생성
- **기간 노트**: 날짜 드래그로 범위 선택 후 `YYYY-MM-DD--YYYY-MM-DD` 형식 노트 생성
- **플랜 노트**:
  - 연간: `{plannerFolder}/{year}.md`
  - 월간: `{plannerFolder}/{year}-{month}.md`
- **공휴일 표시**: 국가 선택 기반 공휴일 배지 렌더링 + 클릭 정보
- **칩 색상**: frontmatter `color` 기반 색상 표시/수정
- **Todo 칩**: `todo`, `completed` frontmatter 상태 표시
- **플래너 클립보드 워크플로우**:
  - 멀티 선택(데스크톱 modifier 클릭)
  - 복사/붙여넣기(날짜 기준 재배치)
  - 선택 삭제
  - 마지막 붙여넣기 undo (`Cmd/Ctrl+Z`)
- **리마인더 Notice**:
  - frontmatter `notify_minutes` 기준
  - Obsidian 실행 중 이벤트 날짜/시간에 알림 표시
- **다국어 UI**: 영어/한국어

## 명령 및 진입점

- 리본 아이콘:
  - `calendar-range`: 연간 플래너 열기
  - `calendar-days`: 월간 플래너 열기
  - `list-ordered`: 월간 리스트 플래너 열기
- 커맨드 팔레트:
  - `Open yearly planner`
  - `Open monthly planner`
  - `Open monthly list planner`

## 설정

| 설정 | 설명 |
| --- | --- |
| Language | UI 언어 (`en` / `ko`) |
| Planner folder | 플래너 파일 기본 폴더 (기본: `Planner`) |
| Date format | 날짜 형식 저장값 (`YYYY-MM-DD`) |
| Show holidays | 공휴일 렌더링 여부 |
| Holiday country | `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `FR`, `AU`, `CA`, `TW` |
| Mobile bottom padding | 모바일 플래너 하단 여백 |
| Mobile cell width | 모바일 월간 셀 너비 |

## Frontmatter 참고

- `color`: 칩 색상(CSS color 문자열)
- `todo`: `true/false`
- `completed`: `true/false` (`todo: true`일 때 사용)
- `notify_minutes`: 자정 기준 분(`0-1439`)
- `date_start`, `date_end`: 기간 노트 생성/수정 시 자동 관리
- `title`: 비표준 파일명 노트의 제목 fallback

## 파일명 규칙

- 단일 날짜:
  - `2026-02-12.md`
  - `2026-02-12-meeting.md` (접미사가 칩 제목으로 사용)
- 기간:
  - `2026-02-01--2026-02-07.md`
  - `2026-02-01--2026-02-07-vacation.md`
- 플랜 노트:
  - 연간: `2026.md`
  - 월간: `2026-02.md`

## 설치

1. [Releases](https://github.com/POBSIZ/obsidian-diary/releases)에서 최신 버전 다운로드
2. `main.js`, `manifest.json`, `styles.css`를 `Vault/.obsidian/plugins/diary/`에 복사
3. **Settings -> Community plugins**에서 **Diary** 활성화

## 개발

```bash
npm install
npm run dev
```

빌드/린트:

```bash
npm run build
npm run lint
```

## 현재 릴리스 방식

- 릴리스 워크플로: `.github/workflows/release.yml`
- 릴리스 에셋: `main.js`, `manifest.json`, `styles.css`만 배포
- CI에서 build provenance attestation 생성

## 라이선스

`LICENSE` 파일 참고.
