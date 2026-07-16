---
version: "alpha"
lastReviewedPluginVersion: "1.8.3"
name: "Diary Planner UI"
description: "Obsidian-native planner visuals for yearly, monthly, monthly list, daily, 3-day, recurrence, calendar overlays, external calendar overlays, and compact sidebar views."
colors:
  primary: "#1f2937"
  secondary: "#6b7280"
  accent: "#3b82f6"
  danger: "#ef4444"
  surface: "#f8fafc"
  surface-muted: "#f1f5f9"
  border: "#cbd5e1"
  text-primary: "#111827"
  text-secondary: "#4b5563"
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

Diary 플러그인의 UI는 Obsidian 테마와 자연스럽게 통합되는 것을 최우선으로 한다.
따라서 실제 렌더링은 Obsidian CSS 변수(`--background-*`, `--text-*`, `--interactive-*`)를
기준으로 하되, 플러그인 내부에서는 공통 토큰으로 형태와 간격을 통일한다.
이 문서는 `1.8.3` 기준의 연간/월간/목록/일별/3일 플래너 UI, 오른쪽 사이드바 플래너, 공통 헤더와 기간 이동, 반복 이벤트 표시, built-in/custom 캘린더 오버레이, 외부 캘린더 오버레이, 다국어 UI, 키보드 접근성 상태를 함께 설명한다.

핵심 원칙:

- 기능 우선: 스타일 변경으로 동작(클릭, 드래그, 선택, 모달 흐름)에 영향 주지 않는다.
- 테마 우선: 하드코딩 색상은 최소화하고, 가능한 Obsidian 변수로 위임한다.
- 스코프 우선: `styles.css`는 Diary의 planner, settings, modal surface에만 영향을 주도록 selector 범위를 좁힌다.
- 언어 우선: UI 문자열은 `locales/*`와 `src/i18n.ts`를 통하고, 월/요일/날짜 라벨도 locale registry에서 가져온다.
- 형태 일관성: 동일 역할 컴포넌트(칩, 뱃지, 네비 버튼, 범위 바)는 동일한 반경/패딩/보더 규칙을 쓴다.
- 접근성 우선: 포커스, 키보드 실행, `aria-label`, 선택 상태를 시각 상태와 함께 유지한다.

## Colors

이 파일의 `colors`는 플러그인의 시각적 성격을 표현하는 기준 팔레트다.
실제 구현에서는 다음 우선순위를 따른다.

1. Obsidian 테마 변수 사용
2. 플러그인 공통 토큰 사용 (`styles.css`의 `:root` 변수)
3. 필요 시에만 로컬 하드코딩 색상 사용

주말 tint는 정보성 강조를 위해 고정 hue를 유지한다.

- Saturday tint: `--planner-weekend-saturday`
- Sunday tint: `--planner-weekend-sunday`

## Typography

타이포그래피는 가독성과 정보 밀도 균형을 목표로 한다.

- 제목: 플래너 뷰 타이틀, 섹션 타이틀
- 본문: 일반 텍스트/설명
- 칩: 날짜 셀 내부 파일 칩 및 휴일 뱃지

실제 폰트 패밀리는 Obsidian 기본 폰트(`--font-text`, `--font-ui`)를 우선한다.

## Layout

간격과 라운드는 공통 토큰으로 관리한다.

- `--planner-chip-gap`: 칩/뱃지 수직 간격
- `--planner-chip-padding`: 칩/뱃지 내부 패딩
- `--planner-radius-xs|sm`: 작은/기본 라운드
- `--planner-border-width-thin|accent`: 일반/강조 보더 두께

모바일에서는 touch target 확보를 위해 높이와 패딩만 확장하고,
토큰의 의미(컴포넌트 역할)는 동일하게 유지한다.

오른쪽 사이드바 플래너는 데스크톱에서도 compact layout을 사용한다.
너비가 제한된 사이드 리프에서는 월간 그리드가 일자 요약 시트 중심으로 동작하며,
노트 열기는 메인 작업 영역으로 보내 사이드바가 보조 뷰 역할을 유지한다.

연간 플래너의 월 셀 너비 확장 상태는 사용자 설정에 저장된다.
저장된 상태가 복원되어도 전체 플래너 폭, 셀 hover 영역, 칩/범위 바 클릭 영역이
갑자기 달라지지 않도록 너비 토큰과 overflow 처리를 함께 유지한다.

일별 플래너는 24시간 세로 시간축을 사용하고 `start_time`/`end_time`이 없는 노트는
종일 영역으로 분리한다. 3일 플래너는 같은 시간축 컴포넌트를 세 날짜 열로 재사용하며,
좁은 화면에서는 열을 과도하게 압축하지 않고 가로 스크롤을 허용한다. 비어 있는 시간대를
선택하면 날짜와 시작/종료 시간이 미리 채워진 생성 모달을 연다.

모든 메인 플래너 헤더는 `src/views/planner-layout.ts`의 공통 구조를 사용한다.
뷰 선택기는 compact 폭에서도 계속 노출하고, 오늘/추가 같은 보조 동작만 **More** 메뉴로
이동한다. 기간 표시를 선택하면 연/월/일 granularity에 맞는 공통 기간 모달을 연다.

`1.8.0`부터 공통 surface는 역할별 primitive로 렌더링한다. `src/ui/components.ts`는
버튼, 액션 행, field row, disclosure, badge, error/press feedback을 담당하고,
`src/views/planner-components.ts`는 파일/외부 일정 chip, holiday badge, 보조 역법 label의
동일한 의미 상태와 접근성 속성을 제공한다. `src/views/planner-dom.ts`는 pointer 좌표 기반
cell/path lookup을, `src/views/planner-layout.ts`는 segmented control, container compact 상태와
scroll 복원을 담당한다. 각 뷰는 이 primitive를 조합하되 고유한 파일 작업과 drag 동작은 유지한다.

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

대표 컴포넌트 기준:

- `planner-nav-button`: 연/월 이동 버튼
- `settings.language`: 플러그인 UI 언어 선택. 영어, 독일어, 스페인어, 프랑스어, 일본어, 중국어 간체, 중국어 번체, 한국어를 제공하며 저장된 locale 값은 로드/저장 시 정규화한다.
- `settings.holidayCountry`: 지원 UI 언어권의 공휴일 국가 옵션을 제공한다. 현재 `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW`, `None`을 사용한다.
- `planner-chip`: 단일 날짜 파일 칩
- `diary-ui-button`: 플래너, 설정, 모달에서 공통으로 쓰는 버튼 기반 primitive. CTA/warning/danger 변형과 아이콘/레이블/비활성 상태를 한 경로에서 적용한다.
- `planner-segmented-control`: 월간 목록 필터처럼 단일 선택 상태를 `tablist`/`tab` 의미와 함께 제공하는 공통 컨트롤
- `planner-holiday-badge`: 휴일 표시 뱃지
- `planner-range-bar`: 범위 파일 바
- `yearly-planner-color-preset-btn`: 노트 생성/수정 모달의 색상 preset 버튼. 첫 preset은 현재 Obsidian accent를 런타임에 해석하며, 각 버튼은 현지화된 `aria-label`과 `title`을 가진다.
- `planner-recurrence-occurrence`: 반복 발생분 표시. 칩/범위 바의 기본 border 규칙을 유지한 채 dashed border만 더한다.
- `planner-external-event-chip`: 외부 캘린더 단일 일정 표시. 칩의 위치와 높이는 따르되 ghost/outline 스타일로 읽기 전용 overlay임을 구분한다.
- `planner-external-event-range`: 외부 캘린더 기간 일정 표시. range bar의 stacking 규칙은 따르되 낮은 opacity와 dashed/striped 처리를 사용한다.
- `planner-alternate-calendar-label`: 보조 역법 라벨. 날짜 숫자와 충돌하지 않는 보조 메타데이터로 표시하며, 선택지 이름/설명은 지원 UI 언어별 문구를 사용한다.
- `monthly-list-filter-button`: 월간 목록의 `전체`/`노트 있음`/`오늘 이후` 필터 버튼
- `plan-note-panel`: 연간/월간 플랜 노트 미리보기 패널
- `planner-view-switcher`: 연간/월간 그리드/월간 목록/일별/3일 뷰를 직접 선택하는 공통 헤더 컨트롤
- `planner-header-period-display`: 현재 연/월/일을 표시하고 공통 기간 선택 모달을 여는 버튼
- `daily-planner-event`: `start_time`과 `end_time`으로 배치되는 시간축 이벤트. 겹치는 일정은 열로 나누며 최소 시각 높이를 유지한다.
- `daily-planner-all-day-row`: 종일 및 시간 미지정 노트를 시간축 위에서 날짜별로 분리하는 영역
- `*-sidebar-planner-container`: 오른쪽 사이드바에서 compact layout을 강제하는 플래너 컨테이너

각 컴포넌트는 상태(hover, selected, active)에서도
기본 반경/패딩/보더 두께 규칙이 바뀌지 않아야 한다.
반복 발생분처럼 의미 상태를 추가할 때도 기존 선택, 드래그, 클립보드 상태보다
시각 우선순위가 높아지지 않도록 한다.

## Custom Calendar Overlay

판타지 캘린더는 사용자-facing UI에서는 **Custom calendar**로 부른다.
현재 `YYYY-MM-DD` 파일명 모델을 대체하지 않고, 기존 보조 역법 라벨과 같은
overlay 레이어에서 시작한다. 자세한 구현 계획은
[`docs/ko/fantasy-calendar-implementation-plan.md`](docs/ko/fantasy-calendar-implementation-plan.md)에 둔다.

`1.5.0`부터 설정의 **Calendar overlay**에서 built-in 보조 역법 또는 custom calendar profile 하나를 선택할 수 있다.
선택된 custom calendar는 연간/월간/목록/사이드바 라벨과 노트 생성/수정 모달 미리보기에 반영된다.

UI/UX 원칙:

- 셀 안에는 한 개의 짧은 라벨만 표시한다.
- 상세 커스텀 날짜는 일자 요약 시트, 파일 옵션 모달, 접근성 라벨에서 보강한다.
- 캘린더 구조 편집은 설정 모달로 분리하고, 플래너 셀에서는 편집하지 않는다.
- 반복 이벤트에서 custom calendar를 기준 역법으로 쓰는 기능은 후속 단계이며, 구현 시에도 발생분 표시는 기존 dashed border 규칙을 따른다.
- 모바일/사이드바에서는 헤더 보조 문구보다 셀과 요약 시트의 가독성을 우선한다.

구현 경계:

- 양력 `YYYY-MM-DD`는 저장 기준으로 유지한다.
- 현재 custom calendar는 표시와 입력 미리보기 계산 레이어로만 사용한다.
- 날짜 이동, 반복 매칭, import/export는 후속 단계로 분리한다.
- 후속 반복 통합에서는 custom 프로필 변경을 revision/hash로 감지해 반복 시리즈의 조용한 drift를 막는다.

## External Calendar Overlay

외부 캘린더는 사용자가 명시적으로 추가한 `webcal://` 또는 `.ics` feed를
읽기 전용 planner item으로 표시한다. 자세한 구현 계획은
[`docs/ko/external-calendar-overlay-implementation-plan.md`](docs/ko/external-calendar-overlay-implementation-plan.md)에 둔다.

`1.5.0`부터 **External calendars** 설정에서 `webcal://` 또는 `https://` `.ics` feed를 추가하고,
수동 또는 60분 기본 주기 새로고침으로 가져온 이벤트를 연간/월간 그리드/월간 목록/일별/3일/사이드바/일자 요약에 표시한다.
외부 이벤트 상세 모달에서 사용자가 **Create Markdown note**를 선택한 경우에만 기존 날짜/기간 노트로 승격한다.

UI/UX 원칙:

- 외부 일정은 기존 chip/range bar의 위치와 밀도 규칙을 따르되, 실제 Markdown 파일 칩과 혼동되지 않아야 한다.
- 외부 chip은 ghost/outline surface, 작은 calendar/link icon, 낮은 채도의 feed 색상으로 표시한다.
- 외부 range bar는 기존 range lane과 높이를 재사용하되 dashed/striped 또는 낮은 opacity로 읽기 전용 상태를 드러낸다.
- 외부 일정은 drag, clipboard, todo toggle, color edit을 지원하지 않는다.
- 클릭과 키보드 실행은 파일 옵션 모달이 아니라 외부 일정 상세 모달로 이어진다.
- 모달에서 사용자가 **Create Markdown note**를 선택한 일정만 실제 날짜/기간 노트가 된다.
- 모달 액션 버튼은 아이콘과 텍스트를 함께 표시하고, press/loading/complete 상태를 시각적으로 구분한다.
- linked Markdown 노트가 있는 외부 일정은 Markdown chip을 우선하고, 외부 overlay는 기본적으로 숨긴다.
- 모바일/사이드바에서는 셀 안 title보다 count와 일자 요약 시트의 탐색성을 우선한다.

구현 경계:

- 외부 캘린더를 추가해도 자동으로 vault 파일을 만들지 않는다.
- feed 새로고침은 사용자가 feed를 추가한 이후에만 실행하며, 주기 새로고침은 feed별 설정을 따른다.
- 외부 description은 plain text로만 보여주고, HTML/첨부/원격 이미지는 렌더링하지 않는다.
- 반복 외부 일정은 visible range 안에서만 expand해 렌더링 비용을 제한한다.
- local/private network URL은 차단하고, secret iCal URL은 vault sync로 동기화될 수 있음을 설정과 문서에서 알린다.

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
- 새 CSS selector는 Diary container, settings mount, modal content 같은 플러그인 surface를 기준으로 스코프를 제한한다.
- yearly/monthly/list/daily/three-day 간 동일 역할 요소는 같은 토큰을 참조한다.
- 반복, 보조 역법, 휴일처럼 날짜에 겹치는 메타데이터는 서로 다른 밀도에서도 읽히는지 yearly/monthly/list/daily/three-day/sidebar에서 확인한다.
- 변경 후 `npm run build`로 타입/번들 검증한다.

Don't:

- 클래스명 변경으로 DOM 이벤트 타겟팅을 깨뜨리지 않는다.
- 선택/드래그 상태 레이어(z-index, pointer-events)를 임의 변경하지 않는다.
- 테마 변수로 표현 가능한 값을 하드코딩으로 고정하지 않는다.
- 반복 발생분 dashed border에 `!important`를 붙여 테마나 상태 스타일을 강제로 이기게 하지 않는다.
