# Diary

Obsidian용 **다이어리 플러그인**입니다. 연간·월간 플래너와 날짜 노트, 기간 노트, 공휴일 표시를 지원합니다.

## 기능

### 플래너

- **연간 플래너**: 12개월 × 31일 격자 형태의 연간 캘린더. 한 해를 한눈에 파악할 수 있습니다.
- **월간 플래너**: 주 단위로 구성된 한 달 상세 뷰. 모바일에서 핀치 줌으로 편하게 볼 수 있습니다.

### 노트

- **날짜 노트**: 셀 클릭 시 해당 날짜 노트 열기. 없으면 자동 생성됩니다.
- **기간 노트**: 날짜 셀을 드래그해 범위 선택 후 놓으면 생성 모달이 열립니다. 여러 날에 걸쳐 바 형태로 표시됩니다.
- **플랜 노트**: 연간(`{year}.md`), 월간(`{year}-{month}.md`) 요약 패널. 플래너 사이드바에서 해당 기간 노트를 생성하거나 열 수 있습니다.

### 시각 및 상호작용

- **색상 칩**: frontmatter `color`로 노트 색상 지정. 생성 모달에서 프리셋 또는 hex/rgb 커스텀 선택 가능.
- **칩 드래그 앤 드롭** (데스크톱): 날짜/기간 칩을 다른 셀로 드래그해 이동. 기간 노트는 일수 유지.
- **기간 하이라이트**: 기간 바에 마우스를 올리면 해당 기간 전체 셀이 하이라이트됩니다.
- **공휴일**: 선택한 국가의 공휴일 표시. 공휴일 배지 클릭 시 이름 확인 가능.

### 기타

- **다국어**: 영어/한국어 UI.
- **모바일 지원**: 기간 선택 터치 드래그, 핀치 줌(월간), 하단 여백·셀 너비 설정.

## 사용 방법

### 플래너 열기

- 사이드바: **calendar-range** 아이콘 → 연간 플래너, **calendar-days** 아이콘 → 월간 플래너
- 명령 팔레트: "Open yearly planner" / "Open monthly planner"

### 날짜·기간 노트

- **날짜 노트**: 날짜 셀 클릭 시 해당 날짜 노트 열기 (없으면 자동 생성).
- **기간 노트**: 날짜 셀을 드래그해 범위 선택 후 놓으면 기간 노트 생성 모달 표시.
- **Add file** 버튼: 생성 모달을 바로 열어 단일 날짜 또는 기간 노트 생성.

### 파일 옵션 (칩 또는 바 클릭)

- **Open**: 에디터에서 노트 열기.
- **Change date**: 시작/종료일 수정 (기간 노트) 또는 단일 날짜 노트 이동.
- **Color**: 프리셋 또는 컬러 피커로 칩 색상 변경.
- **Delete**: 파일을 휴지통으로 이동.

### 네비게이션

- **연간**: ◀/▶ 이전·다음 연도, "Today" 현재 연도, 연도 클릭으로 특정 연도 입력.
- **월간**: ◀/▶ 이전·다음 달, "Today" 현재 달, 월·연도 클릭으로 이동.

## 설정

| 설정 | 설명 |
|------|------|
| **Language** | UI 언어 (English / 한국어) |
| **Planner folder** | 날짜·기간 노트 저장 폴더 (기본: `Planner`) |
| **Date format** | 파일명 날짜 형식 (기본: `YYYY-MM-DD`) |
| **Show holidays** | 공휴일 표시 여부 |
| **Holiday country** | 공휴일 국가 (대한민국, 미국, 일본, 중국, 영국, 독일, 프랑스, 호주, 캐나다, 대만) |
| **Mobile bottom padding** | 모바일 플래너 하단 여백 (rem) |
| **Mobile cell width** | 모바일 월 셀 너비 (rem) |

## 파일 형식

- **단일 날짜**: `{Planner folder}/2026-02-12.md` 또는 `2026-02-12-meeting.md` (접미사가 제목으로 사용됨)
- **기간 노트**: `{Planner folder}/2026-02-01--2026-02-07.md` 또는 `2026-02-01--2026-02-07-vacation.md` (frontmatter: `date_start`, `date_end`, 선택적 `color`)
- **플랜 노트**: 연간 `{Planner folder}/{year}.md`, 월간 `{Planner folder}/{year}-{month}.md` (해당 기간 요약 노트)

## 베타 테스트

- **방법 A (간단)**: [Releases](https://github.com/POBSIZ/obsidian-diary/releases)에서 Pre-release 또는 Draft를 수동 다운로드 후 설치
- **방법 B (BRAT)**: [BRAT 플러그인](https://obsidian.md/plugins?id=obsidian42-brat) 설치 → **Add beta plugin** → `POBSIZ/obsidian-diary` 레포 URL 추가

## 수동 설치

1. [Releases](https://github.com/POBSIZ/obsidian-diary/releases)에서 최신 버전 다운로드
2. `main.js`, `styles.css`, `manifest.json`을 `Vault/.obsidian/plugins/diary/` 폴더에 복사
3. **Settings → Community plugins**에서 "Diary" 활성화

## 개발

- Node.js 18+ (LTS 권장)
- `npm install` → `npm run dev` (watch 모드 빌드)
- `npm run build` (프로덕션 빌드)
- `npm run lint` (ESLint 검사)

## 라이선스

LICENSE 파일 참고.
