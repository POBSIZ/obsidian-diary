---
version: "alpha"
lastReviewedPluginVersion: "1.15.1"
name: "Diary Planner UI"
description: "Obsidian-native planner visuals for yearly, monthly, monthly list, daily, 3-day, recurrence, calendar overlays, external calendar overlays, and compact sidebar views."
colors:
  primary: "#1f2937"
  secondary: "#6b7280"
  surface: "#f8fafc"
  surface-muted: "#f1f5f9"
  text-primary: "#111827"
typography:
  title:
    fontFamily: "Inter"
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.45
  chip:
    fontFamily: "Inter"
    fontSize: 0.65rem
    fontWeight: 500
    lineHeight: 1.2
rounded:
  xs: 2px
  sm: 4px
  md: 8px
spacing:
  2xs: 0.125rem
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
components:
  planner-nav-button:
    rounded: "{rounded.sm}"
    backgroundColor: "{colors.surface-muted}"
    textColor: "{colors.text-primary}"
  planner-chip:
    rounded: "{rounded.xs}"
    typography: "{typography.chip}"
    padding: 0.15rem
  planner-holiday-badge:
    rounded: "{rounded.xs}"
    typography: "{typography.chip}"
  planner-range-bar:
    rounded: "{rounded.xs}"
  monthly-list-filter-button:
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
  plan-note-panel:
    rounded: "{rounded.sm}"
  daily-timeline-event:
    rounded: "{rounded.sm}"
    typography: "{typography.chip}"
  planner-view-switcher:
    rounded: "{rounded.sm}"
    typography: "{typography.body}"
---

## Overview

Diary의 화면은 Obsidian 테마 안에서 이질감 없이 보여야 한다. 색상은
Obsidian CSS 변수(`--background-*`, `--text-*`, `--interactive-*`)를 따르고,
모양과 간격은 플러그인의 공통 토큰으로 맞춘다.

이 문서는 `1.15.1`의 연간·월간·목록·일별·3일 플래너와 오른쪽 사이드바,
공통 헤더, 기간 이동, 반복 일정, 기본 제공·사용자 지정 캘린더, 외부 캘린더,
파일 옵션 모달, 다국어 UI, 키보드 접근성에 적용되는 기준을 정리한다.

핵심 원칙:

- 동작을 보존한다. 스타일 변경이 클릭, 드래그, 선택, 모달 흐름을 깨뜨리면 안 된다.
- 테마를 따른다. 고정 색상은 꼭 필요한 곳에만 쓰고 나머지는 Obsidian 변수에 맡긴다.
- 범위를 제한한다. `styles.css`의 선택자는 Diary 플래너, 설정, 모달 안에서만 작동해야 한다.
- 번역 경로를 지킨다. UI 문자열과 날짜 라벨은 `locales/*`, `src/i18n.ts`, 로케일 레지스트리에서 가져온다.
- 같은 역할에는 같은 형태를 쓴다. 칩, 배지, 이동 버튼, 범위 막대의 반경·여백·테두리 규칙을 통일한다.
- 접근성을 상태의 일부로 다룬다. 포커스, 키보드 실행, `aria-label`, 선택 상태를 시각 상태와 함께 갱신한다.

런타임 UI의 기준은 `styles.css`의 Obsidian 연동 변수와 플래너 토큰,
`src/ui/components.ts` 및 `src/views/planner-components.ts`의 공통 구성 요소다.
토큰이나 구성 요소의 동작을 바꿀 때는 이 문서도 같은 변경에서 갱신한다.

## Colors

frontmatter의 `colors`는 디자인 도구가 참조할 기준 팔레트다. 실제 화면의 색상은
다음 순서로 결정한다.

1. Obsidian 테마 변수 사용
2. 플러그인 공통 토큰 사용 (`styles.css`의 `:root` 변수)
3. 필요 시에만 로컬 하드코딩 색상 사용

토요일과 일요일은 테마가 바뀌어도 구분되도록 고정 색조를 유지한다.

- 토요일: `--planner-weekend-saturday`
- 일요일: `--planner-weekend-sunday`

## Typography

글자 크기와 굵기는 한 화면에 필요한 정보를 담되 읽기 어렵지 않은 수준으로 정한다.

- 제목: 플래너 뷰 타이틀, 섹션 타이틀
- 본문: 일반 텍스트/설명
- 칩: 날짜 셀 내부 파일 칩 및 휴일 뱃지

실제 글꼴은 Obsidian 기본 변수(`--font-text`, `--font-ui`)를 우선한다.

## Layout

간격과 모서리 반경은 공통 토큰으로 관리한다.

- `--planner-chip-gap`: 칩/뱃지 수직 간격
- `--planner-chip-padding`: 칩/뱃지 내부 패딩
- `--planner-radius-xs|sm`: 작은/기본 모서리 반경
- `--planner-border-width-thin|accent`: 일반/강조 테두리 두께

모바일에서는 터치 영역을 확보하기 위해 높이와 안쪽 여백을 넓힌다. 구성 요소의
역할과 토큰의 의미는 데스크톱과 동일하게 유지한다.

모바일 플래너의 스크롤 끝과 컴팩트 보기 전환기는 Obsidian의 일반·부동 하단
내비게이션 높이, 내비게이션 막대 오프셋, 안전 영역을 합산한 여유 공간 위에 둔다.
**Mobile bottom padding**은 이 자동 계산을 끄는 설정이 아니라 사용자가 원하는
최소 여백이다. 실제 여백에는 자동 계산값과 설정값 중 큰 값을 쓴다.

오른쪽 사이드바 플래너는 데스크톱에서도 컴팩트 레이아웃을 사용한다. 폭이 좁은
사이드 리프에서는 일자 요약 시트를 중심으로 월간 그리드를 탐색한다. 노트는 메인
작업 영역에 열어 사이드바가 보조 보기로 남게 한다.

연간 플래너에서 넓힌 월 셀의 너비는 사용자 설정에 저장한다. 복원 과정에서
전체 플래너 폭이나 셀의 hover 영역, 칩과 범위 막대의 클릭 영역이 달라지지 않도록
너비 토큰과 overflow 처리를 함께 유지한다.

일별 플래너는 24시간 세로 시간축을 사용하고 `start_time`/`end_time`이 없는 노트는
종일 영역으로 분리한다. 3일 플래너는 같은 시간축 컴포넌트를 세 날짜 열로 재사용하며,
좁은 화면에서는 열을 과도하게 압축하지 않고 가로 스크롤을 허용한다. 비어 있는 시간대를
선택하면 날짜와 시작/종료 시간이 미리 채워진 생성 모달을 연다.

기간 노트의 `date_start` + `start_time`과 `date_end` + `end_time`은 하나의 연속된
날짜·시간 구간이다. 시간이 모두 비어 있으면 날짜 열을 가로지르는 종일 막대로,
두 시간이 모두 있으면 첫날 시작 시각부터 마지막 날 종료 시각까지 날짜별 조각으로
시간축에 표시한다. 종일 막대를 시간축으로 끌어 시간을 지정할 수 있으며, 첫날의 위쪽
경계와 마지막 날의 아래쪽 경계는 날짜 열을 넘어 조절할 수 있다. 같은 기간에 속한
모든 조각은 hover와 focus 강조를 공유한다.

월간 범위 막대는 실제 시작일뿐 아니라 새 주와 새 달의 첫 구간에서도 제목을 다시
표시한다. 연간 플래너도 매월 첫 구간에 제목 칩을 배치해, 월이나 연도 경계를 넘은
일정의 이름을 놓치지 않게 한다.

모든 메인 플래너 헤더는 `src/views/planner-layout.ts`의 공통 구조를 사용한다.
보기 선택기는 폭이 좁아도 계속 노출하고, 오늘·추가 같은 보조 동작만 **More** 메뉴로
옮긴다. 기간 표시를 선택하면 현재 보기의 연·월·일 단위에 맞는 공통 기간 모달을 연다.

공통 화면 요소는 역할별 구성 요소로 렌더링한다.

- `src/ui/components.ts`: 버튼, 작업 행, 입력 행, 펼침 영역, 배지, 오류 및 눌림 피드백
- `src/views/planner-components.ts`: 파일·외부 일정 칩, 공휴일 배지, 보조 역법 라벨의 상태와 접근성 속성
- `src/views/planner-dom.ts`: 포인터 좌표를 바탕으로 셀과 파일 경로 찾기
- `src/views/planner-layout.ts`: 분할 선택기, 컴팩트 컨테이너 상태, 스크롤 위치 복원

각 플래너는 이 구성 요소를 조합하되, 보기별 파일 작업과 드래그 동작은 그대로
유지한다.

## Elevation & Depth

깊이 표현은 최소화한다.

- 기본: 평면 배경 + 1px 경계선
- 포커스/오늘/선택: inset ring 또는 accent box-shadow
- 과도한 그림자 사용 금지 (테마 충돌 방지)

## Shapes

- 네비게이션/입력: `rounded.sm`
- 칩/휴일 뱃지/범위 바: `rounded.xs`
- 일관되지 않은 개별 값(예: 2px, 4px 직접 지정)은 점진적으로 토큰으로 치환한다.

## Components

구성 요소별 기준:

- `planner-nav-button`: 연/월 이동 버튼
- `settings.language`: 플러그인 UI 언어 선택. 영어, 독일어, 스페인어, 프랑스어, 일본어, 중국어 간체, 중국어 번체, 한국어를 제공하며 저장된 locale 값은 로드/저장 시 정규화한다.
- `settings.holidayCountry`: 지원 UI 언어권의 공휴일 국가 옵션을 제공한다. 현재 `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW`, `None`을 사용한다.
- `planner-chip`: 단일 날짜 파일 칩
- `diary-ui-button`: 플래너, 설정, 모달에서 함께 쓰는 버튼. CTA, warning, danger 변형과 아이콘, 레이블, 비활성 상태를 한 경로에서 적용한다.
- `planner-segmented-control`: 월간 목록 필터처럼 단일 선택 상태를 `tablist`/`tab` 의미와 함께 제공하는 공통 컨트롤
- `planner-holiday-badge`: 휴일 표시 뱃지
- `planner-range-bar`: 범위 파일 바
- `yearly-planner-color-preset-btn`: 노트 생성/수정 모달의 색상 프리셋 버튼. 첫 프리셋은 현재 Obsidian 강조색을 런타임에 해석하며, 각 버튼은 현지화된 `aria-label`과 `title`을 가진다.
- `planner-recurrence-occurrence`: 반복 발생분 표시. 칩/범위 바의 기본 border 규칙을 유지한 채 dashed border만 더한다.
- `planner-external-event-chip`: 외부 캘린더의 단일 일정. 칩의 위치와 높이는 따르되 반투명 배경과 외곽선으로 읽기 전용 오버레이임을 구분한다.
- `planner-external-event-range`: 외부 캘린더 기간 일정 표시. range bar의 stacking 규칙은 따르되 낮은 opacity와 dashed/striped 처리를 사용한다.
- `planner-alternate-calendar-label`: 보조 역법 라벨. 날짜 숫자와 충돌하지 않는 보조 메타데이터로 표시하며, 선택지 이름/설명은 지원 UI 언어별 문구를 사용한다.
- `monthly-list-filter-button`: 월간 목록의 `전체`/`노트 있음`/`오늘 이후` 필터 버튼
- `plan-note-panel`: 연간/월간 플랜 노트 미리보기 패널
- `planner-view-switcher`: 연간/월간 그리드/월간 목록/일별/3일 뷰를 직접 선택하는 공통 헤더 컨트롤
- `planner-header-period-display`: 현재 연/월/일을 표시하고 공통 기간 선택 모달을 여는 버튼
- `daily-planner-event`: `start_time`과 `end_time`으로 배치되는 시간축 이벤트. 겹치는 일정은 열로 나누며 최소 시각 높이를 유지한다.
- `daily-planner-all-day-row`: 종일 및 시간 미지정 노트를 시간축 위에서 날짜별로 분리하는 영역
- `daily-planner-range-lanes`: 기간이 겹칠 때 안정적인 lane으로 나눠 날짜 열을 가로질러 표시하는 종일 기간 영역
- `daily-planner-range-event`: 연속 datetime 기간을 날짜별 시간축 slice로 표시하고 시작/종료 경계 상태를 공유하는 이벤트
- `yearly-planner-file-options-form`: 단일 날짜/기간 모드, 폴더, 시작·종료일, 날짜를 포함한 전체 파일 이름을 한 흐름에서 편집하는 파일 옵션 폼. 모드·날짜·파일 이름은 서로 동기화되고, 적용 시 파일 이동과 `date_start`/`date_end` 갱신을 함께 처리한다.
- `*-sidebar-planner-container`: 오른쪽 사이드바에서 컴팩트 레이아웃을 적용하는 플래너 컨테이너

각 구성 요소는 hover, selected, active 상태에서도
기본 반경, 여백, 테두리 두께가 바뀌지 않아야 한다.
반복 발생분처럼 의미 상태를 추가할 때도 기존 선택, 드래그, 클립보드 상태보다
시각 우선순위가 높아지지 않도록 한다.

## Custom Calendar Overlay

판타지 캘린더의 사용자용 이름은 **Custom calendar**다. 이 기능은
`YYYY-MM-DD` 파일명 규칙을 바꾸지 않으며, 기존 보조 역법 라벨과 같은 오버레이
레이어에서만 동작한다.

**Calendar overlay**에서는 기본 제공 보조 역법이나 사용자 지정 캘린더 프로필을
하나 선택할 수 있다. 선택한 캘린더는 연간, 월간, 목록, 사이드바의 날짜 라벨과
노트 생성·수정 모달의 미리보기에 반영된다.

UI/UX 원칙:

- 셀 안에는 한 개의 짧은 라벨만 표시한다.
- 상세 커스텀 날짜는 일자 요약 시트, 파일 옵션 모달, 접근성 라벨에서 보강한다.
- 캘린더 구조 편집은 설정 모달로 분리하고, 플래너 셀에서는 편집하지 않는다.
- 모바일/사이드바에서는 헤더 보조 문구보다 셀과 요약 시트의 가독성을 우선한다.

구현 경계:

- 양력 `YYYY-MM-DD`는 저장 기준으로 유지한다.
- 현재 custom calendar는 표시와 입력 미리보기 계산 레이어로만 사용한다.

## External Calendar Overlay

외부 캘린더는 사용자가 직접 추가한 `webcal://` 또는 `.ics` 피드를 읽기 전용
플래너 항목으로 표시한다.

**External calendars** 설정에서 `webcal://` 또는 `https://` `.ics` 피드를 추가한다.
가져온 일정은 수동 또는 기본 60분 주기로 새로고침하며, 연간·월간 그리드·월간
목록·일별·3일·사이드바·일자 요약에 표시한다.
외부 이벤트 상세 모달에서 사용자가 **Create Markdown note**를 선택한 경우에만 기존 날짜/기간 노트로 승격한다.

UI/UX 원칙:

- 외부 일정은 기존 칩과 범위 막대의 위치·밀도 규칙을 따르되, 실제 Markdown 파일 칩과 혼동되지 않아야 한다.
- 외부 일정 칩은 반투명 배경과 외곽선, 작은 캘린더·링크 아이콘, 채도를 낮춘 피드 색상으로 표시한다.
- 외부 기간 막대는 기존 범위 레인과 높이를 재사용하되 점선, 줄무늬 또는 낮은 불투명도로 읽기 전용 상태를 드러낸다.
- 외부 일정에는 드래그, 클립보드, 할 일 전환, 색상 편집 기능을 제공하지 않는다.
- 클릭과 키보드 실행은 파일 옵션 모달이 아니라 외부 일정 상세 모달로 이어진다.
- 모달에서 사용자가 **Create Markdown note**를 선택한 일정만 실제 날짜/기간 노트가 된다.
- 모달 작업 버튼은 아이콘과 텍스트를 함께 표시하고 눌림, 로딩, 완료 상태를 구분한다.
- linked Markdown 노트가 있는 외부 일정은 Markdown chip을 우선하고, 외부 overlay는 기본적으로 숨긴다.
- 모바일/사이드바에서는 셀 안 title보다 count와 일자 요약 시트의 탐색성을 우선한다.

구현 경계:

- 외부 캘린더를 추가해도 자동으로 볼트 파일을 만들지 않는다.
- 피드 새로고침은 사용자가 피드를 추가한 뒤에만 실행하며, 주기는 피드별 설정을 따른다.
- 외부 description은 plain text로만 보여주고, HTML/첨부/원격 이미지는 렌더링하지 않는다.
- 반복 외부 일정은 visible range 안에서만 expand해 렌더링 비용을 제한한다.
- 로컬·사설 네트워크 URL은 차단한다. 비공개 iCal URL은 볼트 동기화로 다른 기기에 전송될 수 있음을 설정과 문서에 알린다.

## Persisted UI State

사용자가 직접 조정한 접힘/펼침 상태는 plugin data에 저장한다.

- 데스크톱 플랜 노트 패널: 기본 펼침
- 모바일 플랜 노트 패널: 기본 접힘
- 연간 플래너 월 셀 너비: 펼친 월 index만 저장

이 상태들은 정보 구조를 보존하기 위한 UI 상태이며, 날짜 노트 frontmatter에는 쓰지 않는다.

## Accessibility

상호작용 가능한 요소는 스타일과 DOM 상태를 같이 관리한다.

- 날짜 셀, 노트 칩, 기간 막대, 공휴일 배지, 월간 목록 행은 `tabIndex`, `role="button"`, `aria-label`을 유지한다.
- 공통 뷰 선택기와 기간 표시 버튼은 실제 `button`/`summary` 의미를 유지하고 현재 뷰를 텍스트와 아이콘으로 함께 전달한다.
- 일별/3일 시간축의 일정 블록은 키보드로 열 수 있어야 하며, 비어 있는 시간대 생성 동작은 pointer 입력에서 날짜와 시간을 정확히 보존한다.
- 키보드 사용자는 `Enter` 또는 `Space`로 클릭과 같은 동작을 실행할 수 있어야 한다.
- 월간 목록 필터의 선택 상태는 `.is-active`와 `aria-selected`가 함께 바뀌어야 한다.
- 모달의 오류 메시지는 `aria-live="polite"` 영역에 표시한다.
- 사이드바 플래너도 같은 키보드 실행 규칙을 따르며, 좁은 폭에서는 일자 요약 시트를 통해 노트를 탐색한다.
- 보조 역법 라벨은 날짜 셀의 접근성 이름에 포함하되, 날짜 자체를 대체하지 않는다.
- 반복 발생분의 시각 표시는 스크린 리더가 파일 옵션 모달에서 소스/발생분 액션을 찾는 흐름을 방해하지 않아야 한다.

## Do's and Don'ts

Do:

- 공통 스타일 값은 `:root` 토큰으로 먼저 정의한 뒤 사용한다.
- 새 CSS 선택자는 Diary 컨테이너, 설정 마운트, 모달 콘텐츠 같은 플러그인 화면 안으로 범위를 제한한다.
- yearly/monthly/list/daily/three-day 간 동일 역할 요소는 같은 토큰을 참조한다.
- 반복, 보조 역법, 휴일처럼 날짜에 겹치는 메타데이터는 서로 다른 밀도에서도 읽히는지 yearly/monthly/list/daily/three-day/sidebar에서 확인한다.
- `npm run design:lint`로 design.md 규격과 토큰 참조를 확인한다.
- 변경 후 `npm run build`로 타입/번들 검증한다.

Don't:

- 클래스명 변경으로 DOM 이벤트 타겟팅을 깨뜨리지 않는다.
- 선택/드래그 상태 레이어(z-index, pointer-events)를 임의 변경하지 않는다.
- 테마 변수로 표현 가능한 값을 하드코딩으로 고정하지 않는다.
- 반복 발생분 dashed border에 `!important`를 붙여 테마나 상태 스타일을 강제로 이기게 하지 않는다.
