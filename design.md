---
version: "alpha"
lastReviewedPluginVersion: "1.2.1"
name: "Diary Planner UI"
description: "Obsidian-native planner visuals for yearly, monthly, monthly list, and compact sidebar views."
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
---

## Overview

Diary 플러그인의 UI는 Obsidian 테마와 자연스럽게 통합되는 것을 최우선으로 한다.
따라서 실제 렌더링은 Obsidian CSS 변수(`--background-*`, `--text-*`, `--interactive-*`)를
기준으로 하되, 플러그인 내부에서는 공통 토큰으로 형태와 간격을 통일한다.
이 문서는 `1.2.1` 기준의 플래너 UI, 오른쪽 사이드바 플래너, 월간 목록 필터, 키보드 접근성 상태를 함께 설명한다.

핵심 원칙:

- 기능 우선: 스타일 변경으로 동작(클릭, 드래그, 선택, 모달 흐름)에 영향 주지 않는다.
- 테마 우선: 하드코딩 색상은 최소화하고, 가능한 Obsidian 변수로 위임한다.
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
- `planner-chip`: 단일 날짜 파일 칩
- `planner-holiday-badge`: 휴일 표시 뱃지
- `planner-range-bar`: 범위 파일 바
- `monthly-list-filter-button`: 월간 목록의 `전체`/`노트 있음`/`오늘 이후` 필터 버튼
- `plan-note-panel`: 연간/월간 플랜 노트 미리보기 패널
- `*-sidebar-planner-container`: 오른쪽 사이드바에서 compact layout을 강제하는 플래너 컨테이너

각 컴포넌트는 상태(hover, selected, active)에서도
기본 반경/패딩/보더 두께 규칙이 바뀌지 않아야 한다.

## Accessibility

상호작용 가능한 요소는 스타일과 DOM 상태를 같이 관리한다.

- 날짜 셀, 노트 칩, 기간 막대, 공휴일 배지, 월간 목록 행은 `tabIndex`, `role="button"`, `aria-label`을 유지한다.
- 키보드 사용자는 `Enter` 또는 `Space`로 클릭과 같은 동작을 실행할 수 있어야 한다.
- 월간 목록 필터의 선택 상태는 `.is-active`와 `aria-selected`가 함께 바뀌어야 한다.
- 모달의 오류 메시지는 `aria-live="polite"` 영역에 표시한다.
- 사이드바 플래너도 같은 키보드 실행 규칙을 따르며, 좁은 폭에서는 일자 요약 시트를 통해 노트를 탐색한다.

## Do's and Don'ts

Do:

- 공통 스타일 값은 `:root` 토큰으로 먼저 정의한 뒤 사용한다.
- yearly/monthly/list 간 동일 역할 요소는 같은 토큰을 참조한다.
- 변경 후 `npm run build`로 타입/번들 검증한다.

Don't:

- 클래스명 변경으로 DOM 이벤트 타겟팅을 깨뜨리지 않는다.
- 선택/드래그 상태 레이어(z-index, pointer-events)를 임의 변경하지 않는다.
- 테마 변수로 표현 가능한 값을 하드코딩으로 고정하지 않는다.
