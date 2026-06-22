# 외부 캘린더 오버레이 구현 계획서

이 문서는 Diary에 Google Calendar, Outlook, Apple Calendar, `webcal://`, `.ics` 같은 외부 캘린더를 불러와 플래너에 표시하는 기능의 실제 구현 계획이다. 핵심 방향은 **외부 일정은 먼저 읽기 전용 overlay로만 보여주고, 사용자가 선택한 일정만 Markdown 노트로 승격한다**는 것이다.

## 목표

- 외부 캘린더 일정을 기존 날짜 칩이나 기간 막대와 비슷한 위치에 표시한다.
- 외부 일정은 기본적으로 Markdown 파일을 만들지 않는다.
- 외부 일정은 기존 Diary 칩과 시각적으로 구분한다.
- 외부 일정 선택 시 상세 모달을 열고, 사용자가 원할 때만 실제 Markdown 노트를 생성한다.
- 생성된 Markdown 노트는 기존 Diary 파일 모델(`YYYY-MM-DD.md`, `YYYY-MM-DD--YYYY-MM-DD.md`)을 그대로 따른다.
- 네트워크 접근, feed URL 저장, 설명 본문 표시가 모두 명시적이고 예측 가능해야 한다.

## 비목표

초기 버전에서는 아래 범위를 구현하지 않는다.

- Google OAuth, Microsoft OAuth, CalDAV 쓰기 연동
- 외부 캘린더 원본 이벤트 수정/삭제
- 외부 이벤트 전체를 자동으로 Markdown 파일로 가져오기
- 외부 이벤트 description을 Markdown이나 HTML로 렌더링하기
- Obsidian 시작 직후 자동 네트워크 fetch 실행
- 외부 캘린더를 반복 이벤트의 source note처럼 취급하기

## 핵심 제품 원칙

1. **외부 일정은 파일이 아니라 임시 planner item이다.** 플래너에 보이지만 vault에 파일을 만들지 않는다.
2. **승격은 사용자 선택으로만 일어난다.** 외부 chip/range를 선택한 뒤 모달에서 **Create Markdown note**를 눌러야 파일이 생긴다.
3. **기존 파일 칩보다 한 단계 낮은 시각 우선순위를 가진다.** 외부 일정은 읽기 전용 정보이고, 사용자의 vault 파일이 더 중요하다.
4. **같은 이벤트가 두 번 보이지 않아야 한다.** 외부 이벤트에서 만든 Markdown 노트가 있으면 기본적으로 외부 overlay는 숨기거나 linked 상태로 축약한다.
5. **보이는 범위만 계산한다.** 반복 외부 이벤트도 현재 연/월/목록 범위와 작은 buffer 안에서만 expand한다.
6. **네트워크와 개인정보는 opt-in이다.** feed URL은 권한 토큰처럼 취급하고, 설정/문서에서 vault sync로 URL이 동기화될 수 있음을 알린다.

## 사용자 경험 설계

### 설정 화면

설정에 **External calendars** 섹션을 추가한다.

- feed 목록
  - 이름
  - 활성/비활성 toggle
  - 색상 swatch
  - 마지막 새로고침 시각
  - 오류 상태
  - **Refresh now**
  - **Edit**
  - **Remove**
- **Add calendar feed** 버튼
  - 이름
  - `webcal://` 또는 `https://...ics` URL
  - 색상
  - 표시 범위: `월간/목록/사이드바`, 후속으로 `연간`
  - description 포함 여부
  - 수동 새로고침만 사용할지, 주기 새로고침을 켤지

feed 추가 모달에는 짧은 개인정보 안내를 둔다.

> Google Calendar의 secret iCal URL은 링크를 아는 사람이 캘린더를 읽을 수 있습니다. Diary는 URL을 로컬 plugin data에 저장하며, vault sync 설정에 따라 다른 기기로 동기화될 수 있습니다.

초기 MVP에서는 기본값을 보수적으로 둔다.

- `enabled`: true
- `refreshMinutes`: null
- `includeDescriptions`: false
- `showInYearly`: false
- `showInMonthly`: true
- `showInMonthlyList`: true
- `showInSidebar`: true

### 플래너 표시

외부 일정은 기존 칩/기간 막대의 위치와 리듬을 따른다. 다만 스타일과 동작은 분명히 다르게 한다.

| 일정 유형 | 표시 방식 | 클릭 동작 |
| --- | --- | --- |
| 하루 종일 단일 일정 | 외부 event chip | 외부 일정 모달 |
| 시간이 있는 단일 일정 | 시간 prefix가 있는 외부 event chip, 모바일에서는 점/개수로 축약 가능 | 외부 일정 모달 |
| 여러 날 all-day 일정 | 외부 range bar | 외부 일정 모달 |
| 여러 날 timed 일정 | 시작일 chip + 일자 요약에서 전체 범위 표시 | 외부 일정 모달 |

시각 규칙:

- 기존 Markdown 칩: 실제 vault 파일, solid surface, drag/copy/edit 가능
- 외부 chip: 읽기 전용 overlay, outline 또는 ghost surface, 작은 calendar/link icon, drag 불가
- 외부 range bar: 기존 range bar 높이와 stack 규칙을 쓰되, dashed outline 또는 낮은 opacity의 stripe를 사용
- 외부 일정 색상은 feed 색상을 사용하되, 배경을 강하게 채우지 않는다
- 완료/todo/recurrence 같은 파일 상태 스타일과 섞지 않는다

권장 CSS 클래스:

```text
planner-external-event-chip
planner-external-event-range
planner-external-event-linked
planner-external-event-error
```

접근성:

- 외부 chip/range는 `role="button"`과 `tabIndex=0`을 가진다.
- `aria-label`에는 외부 캘린더 이름, 제목, 시간, 읽기 전용 상태를 포함한다.
- 키보드 `Enter`와 `Space`는 클릭과 같은 외부 일정 모달을 연다.

### 일자 요약 시트

모바일과 사이드바에서는 셀 안 밀도를 줄이고 일자 요약 시트에 상세도를 높인다.

- Markdown 노트 섹션
- 외부 캘린더 섹션
  - 캘린더 이름 pill
  - 시간
  - 제목
  - 장소
  - linked 상태

외부 일정이 많으면 셀 안에는 `+3 external` 같은 count를 우선하고, 상세 탐색은 요약 시트에서 처리한다.

### 외부 일정 모달

외부 chip/range를 선택하면 `ExternalCalendarEventModal`을 연다.

표시 정보:

- 제목
- 캘린더 이름과 색상
- 시작/종료 날짜와 시간
- 장소
- description plain text
- 반복 일정이면 "Repeats from external calendar" 안내
- 마지막 feed 새로고침 시각

주요 액션:

- **Create Markdown note**
- **Copy details**
- **Refresh calendar**
- **Close**

이미 연결된 Markdown 노트가 있으면 액션을 바꾼다.

- **Open linked note**
- **Create another note**는 보조 액션으로 둔다.
- 기본 플래너 표시에서는 linked 외부 overlay를 숨기거나 작은 linked mark로 축약한다.

### Markdown 노트 생성 흐름

**Create Markdown note**를 선택하면 기존 노트 생성 모달을 재사용하되, 외부 일정 값으로 미리 채운다.

- all-day 단일 일정: `YYYY-MM-DD.md`
- all-day 여러 날 일정: `YYYY-MM-DD--YYYY-MM-DD.md`
- timed 일정: 시작 날짜의 단일 날짜 노트
- 제목: 외부 `SUMMARY`
- 색상: feed 색상
- 본문: 사용자가 선택한 경우에만 description plain text 포함

생성 frontmatter 예시:

```yaml
diary_external_calendar: "work"
diary_external_event_uid: "abc123@example.com"
diary_external_event_instance: "2026-06-22T09:00:00+09:00"
diary_external_event_source: "sha256:8f2715..."
diary_external_event_linked_at: "2026-06-22T10:20:00+09:00"
title: "Design review"
color: "#3b82f6"
```

이 frontmatter는 외부 일정과 생성된 Markdown 노트를 연결하고, 다음 렌더링에서 중복 표시를 줄이는 데 사용한다. 외부 원본을 수정하거나 동기화하기 위한 필드는 아니다.

## 데이터 모델

### 설정

```ts
interface ExternalCalendarSettings {
  id: string;
  name: string;
  url: string;
  color: string;
  enabled: boolean;
  refreshMinutes: number | null;
  includeDescriptions: boolean;
  showInYearly: boolean;
  showInMonthly: boolean;
  showInMonthlyList: boolean;
  showInSidebar: boolean;
}
```

### 캐시

```ts
interface ExternalCalendarCache {
  calendarId: string;
  urlHash: string;
  fetchedAt: string;
  etag?: string;
  lastModified?: string;
  events: ExternalCalendarEvent[];
  lastError?: {
    message: string;
    occurredAt: string;
  };
}
```

캐시는 plugin data에 저장하되, 너무 커지면 최근 6개월 전부터 12개월 후까지의 normalized event만 유지한다. 원본 `.ics` 전문은 저장하지 않는다.

### 외부 이벤트

```ts
interface ExternalCalendarEvent {
  id: string;
  calendarId: string;
  uid: string;
  instanceId: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  location?: string;
  descriptionText?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  categories: string[];
  updated?: string;
  color?: string;
}
```

`id`는 `calendarId + uid + instanceId`로 안정적으로 만든다. 반복 일정의 각 occurrence는 같은 `uid`를 공유하되 `instanceId`로 구분한다.

### Planner item 추상화

현재 렌더러가 `TFile`만 직접 다루는 구조를 완전히 갈아엎지 않기 위해, 우선 얇은 adapter를 둔다.

```ts
type PlannerItemKind = "markdown-single" | "markdown-range" | "external-single" | "external-range";

interface PlannerItem {
  id: string;
  kind: PlannerItemKind;
  title: string;
  startDate: string;
  endDate?: string;
  color?: string;
  readOnly: boolean;
  file?: TFile;
  external?: ExternalCalendarEvent;
}
```

기존 `getFilesForDate()`와 `getRangesForYear()`는 초기에는 유지하고, 새 query layer가 Markdown item과 external item을 함께 반환하도록 점진 전환한다.

```text
src/utils/planner-items.ts
src/utils/external-calendars.ts
src/utils/ical-events.ts
```

## 최적화된 로직

### Range-scoped query

각 플래너는 렌더링 전에 필요한 양력 범위만 요청한다.

- 연간: `YYYY-01-01`부터 `YYYY-12-31`
- 월간 그리드: 보이는 grid cell 전체 범위
- 월간 목록: 해당 월 전체
- 사이드바: 현재 월 grid 범위

외부 이벤트 provider는 이 범위와 작은 buffer 안에서만 recurrence를 expand한다. 전체 feed의 모든 반복 occurrence를 미리 만들지 않는다.

### Fetch와 cache

MVP는 수동 새로고침만 제공한다.

1. 사용자가 **Refresh now**를 누른다.
2. URL을 검증한다.
3. `webcal://`은 `https://`로 정규화한다.
4. 최대 크기와 timeout을 적용해 `.ics`를 가져온다.
5. iCalendar parser로 `VEVENT`만 읽는다.
6. 이벤트를 normalized cache로 저장한다.
7. 활성 플래너를 refresh한다.

후속 단계에서만 주기 새로고침을 추가한다.

- workspace ready 이후에만 시작
- feed마다 interval 등록
- plugin unload에서 interval 정리
- Obsidian이 foreground일 때만 refresh

### 파싱 범위

MVP에서 읽는 필드:

- `UID`
- `SUMMARY`
- `DTSTART`
- `DTEND`
- `DURATION`
- `RRULE`
- `EXDATE`
- `RDATE`
- `LOCATION`
- `DESCRIPTION`
- `CATEGORIES`
- `STATUS`
- `LAST-MODIFIED`

`STATUS:CANCELLED`는 기본적으로 숨긴다. 사용자가 원하면 후속 설정으로 cancelled 표시를 추가할 수 있다.

시간 처리:

- all-day `DTEND`는 iCalendar 규칙상 exclusive end이므로 하루를 빼서 표시 종료일을 계산한다.
- timezone이 있는 timed event는 Obsidian 실행 환경의 timezone으로 표시한다.
- timezone 파싱이 불완전한 이벤트는 원본 시간 문자열을 보존하고 모달에 경고를 표시한다.

### 중복 방지

Markdown 노트와 외부 이벤트는 아래 key로 연결한다.

```text
calendarId | uid | instanceId
```

렌더링 정책:

1. 연결된 Markdown 노트가 있으면 Markdown chip을 우선 표시한다.
2. 기본값으로 같은 외부 overlay는 숨긴다.
3. 설정에서 **Show linked external events**를 켜면 linked mark가 붙은 외부 chip을 같이 보여준다.
4. 외부 이벤트 시간이 바뀌어 instance key가 달라진 경우 모달에서 "May be moved in source calendar" 상태를 보여준다.

### 상호작용 제한

외부 item은 다음 동작을 지원하지 않는다.

- drag 이동
- 클립보드 copy/paste/delete
- todo 완료 toggle
- 색상 변경
- 반복 편집

외부 item에서 가능한 동작은 모달 열기와 Markdown 노트 생성뿐이다. 파일 동작이 필요한 순간에만 Markdown으로 승격한다.

## 구현 파일 계획

1. `src/settings.ts`
   - external calendar settings 필드
   - feed 목록 UI
   - add/edit/remove 모달
   - manual refresh 버튼
2. `src/utils/external-calendars.ts`
   - URL 검증
   - fetch/cache 관리
   - feed 활성 상태와 오류 상태 관리
3. `src/utils/ical-events.ts`
   - `.ics` parsing wrapper
   - `VEVENT` normalization
   - recurrence expansion helper
4. `src/utils/planner-items.ts`
   - Markdown provider와 external provider를 합치는 query layer
   - linked Markdown dedupe
5. `src/views/external-event-modal.ts`
   - 외부 일정 상세 모달
   - Markdown 노트 생성 진입점
6. `src/views/yearly-planner/file-operations.ts`
   - 외부 이벤트 기반 단일/기간 노트 생성 helper
   - linked frontmatter 저장
7. `src/views/yearly-planner/render.ts`
   - 연간 compact external indicator 또는 후속 phase placeholder
8. `src/views/monthly-planner/render.ts`
   - 외부 chip/range 렌더링
9. `src/views/monthly-list-planner/render-list.ts`
   - 외부 일정 섹션 렌더링
10. `src/views/monthly-planner/view.ts`
    - 일자 요약 시트 외부 섹션
11. `src/views/*/interactions.ts`
    - 외부 item 클릭/키보드 실행 라우팅
12. `styles.css`
    - external chip/range/linked/error 스타일
13. `locales/en.json`, `locales/ko.json`
    - 설정, 모달, 오류, 개인정보 안내 문구
14. `docs/en/README.md`, `docs/ko/README.md`
    - 기능이 출시될 때만 사용자 문서 업데이트

## 단계별 출시 계획

### 0단계: Planner item foundation

- Markdown 파일 provider와 렌더러 사이에 `PlannerItem` adapter를 추가한다.
- 기존 파일명 기반 동작은 그대로 유지한다.
- 외부 item 없이도 build/lint와 기존 UI가 동일해야 한다.

검증:

- `npm run build`
- `npm run lint`
- 기존 날짜 칩, 기간 막대, 반복 발생분, 공휴일 표시가 이전과 동일

### 1단계: 단일 feed 읽기 전용 MVP

- 설정에서 하나의 `.ics` URL을 추가한다.
- **Refresh now**로 수동 fetch한다.
- 월간 그리드, 월간 목록, 일자 요약 시트, 사이드바에 외부 item을 표시한다.
- 외부 item은 클릭 시 상세 모달만 연다.
- Markdown 파일은 만들지 않는다.

검증:

- 외부 event가 vault에 파일을 생성하지 않음
- URL이 비활성화되면 overlay가 사라짐
- 모바일 셀에서 Markdown chip과 외부 chip이 겹치지 않음
- timed/all-day/multi-day 일정이 각각 올바른 형태로 표시됨

### 2단계: Markdown 승격

- 외부 일정 모달에 **Create Markdown note**를 추가한다.
- 기존 단일/기간 노트 생성 경로를 재사용한다.
- linked frontmatter를 저장한다.
- linked Markdown 노트가 있으면 중복 외부 overlay를 숨긴다.

검증:

- all-day 단일 일정은 단일 날짜 노트가 됨
- multi-day all-day 일정은 기간 노트가 됨
- timed 일정은 시작 날짜 노트가 됨
- 같은 외부 이벤트에서 노트를 만든 뒤 overlay가 중복 표시되지 않음
- 생성된 노트는 플러그인을 꺼도 일반 Markdown 파일로 남음

### 3단계: 반복, timezone, cache 안정화

- `RRULE`, `EXDATE`, `RDATE`를 visible range 안에서만 expand한다.
- `ETag`와 `Last-Modified`를 사용해 불필요한 fetch를 줄인다.
- 여러 feed를 지원한다.
- feed별 오류 상태와 마지막 성공 시각을 표시한다.

검증:

- 매주 반복 일정이 현재 월에만 필요한 occurrence로 표시됨
- cancelled event는 기본 숨김 처리됨
- timezone이 있는 일정이 로컬 표시 시간으로 안정적으로 보임
- fetch 실패가 기존 cache를 즉시 지우지 않음

### 4단계: 연간 플래너와 주기 새로고침

- 연간 플래너에는 title chip을 모두 넣기보다 count 또는 작은 external marker를 우선한다.
- 사용자가 원하면 연간 셀에서도 외부 item 목록을 일자 요약으로 확인할 수 있게 한다.
- 명시적으로 켠 feed에 한해 주기 새로고침을 제공한다.

검증:

- 연간 `12 x 31` 밀도에서 셀이 과밀해지지 않음
- 주기 새로고침 interval이 plugin unload에서 정리됨
- Obsidian 시작 중 파일 enumeration과 network fetch가 겹치지 않음

## 보안과 개인정보

- `https://`와 `webcal://`만 허용한다.
- `webcal://`은 `https://`로 변환한다.
- `javascript:`, `data:`, `file:`, `ftp:` URL은 거부한다.
- localhost, private IP, link-local IP는 기본 거부한다.
- redirect 횟수를 제한한다.
- fetch timeout과 최대 다운로드 크기를 둔다.
- attachment, alarm, HTML, remote image는 렌더링하지 않는다.
- description은 plain text로만 표시한다.
- feed URL은 secret일 수 있음을 설정과 문서에서 안내한다.

## 수용 기준

- 외부 캘린더를 추가해도 자동으로 Markdown 파일이 생기지 않는다.
- 외부 일정은 기존 Diary 칩/기간 막대와 비슷한 위치에 보이지만, 읽기 전용 overlay임이 시각적으로 구분된다.
- 외부 일정 클릭은 항상 상세 모달로 이어진다.
- 모달에서 사용자가 명시적으로 선택한 일정만 Markdown 노트로 생성된다.
- 생성된 Markdown 노트는 기존 Diary 파일명, frontmatter, 색상, 기간 막대 로직을 재사용한다.
- linked Markdown 노트가 있는 외부 일정은 기본적으로 중복 표시되지 않는다.
- 모든 네트워크 요청은 사용자가 feed를 추가하고 새로고침을 실행한 뒤에만 일어난다.
- 모바일과 사이드바에서 셀 내부 텍스트가 겹치지 않는다.

## 리스크와 대응

| 리스크 | 대응 |
| --- | --- |
| 사용자가 "import"를 모든 이벤트의 파일 생성으로 이해함 | UI copy에서 "show without creating notes"와 "Create Markdown note"를 분리 |
| 외부 일정이 기존 칩처럼 보여서 편집 가능하다고 오해함 | ghost/outline 스타일, 읽기 전용 icon, 모달의 source calendar 표기 |
| linked 노트와 외부 overlay가 중복되어 일정이 두 개처럼 보임 | `calendarId + uid + instanceId` key로 dedupe하고 Markdown chip 우선 |
| 모바일 셀이 너무 복잡해짐 | 셀에는 축약 chip/count, 상세는 일자 요약 시트로 이동 |
| 반복 ICS를 전부 expand해 성능 저하 | visible range + buffer 안에서만 expand |
| secret iCal URL 유출 위험 | 설정 안내, URL 로컬 저장, vault sync 가능성 명시 |
| CORS나 provider 제한으로 fetch 실패 | 오류 상태 표시, 기존 cache 유지, provider-specific troubleshooting 문서화 |

## 최종 UX 문구 방향

설정 설명:

> Show external calendar events as read-only overlays. Diary will not create Markdown notes unless you choose **Create Markdown note** from an event.

한국어 설정 설명:

> 외부 캘린더 일정을 읽기 전용 오버레이로 표시합니다. 이벤트에서 **Markdown 노트 만들기**를 선택하기 전까지 파일은 생성되지 않습니다.

외부 일정 모달 안내:

> This event comes from an external calendar. Create a Markdown note only if you want to keep notes for it in your vault.

한국어 모달 안내:

> 이 일정은 외부 캘린더에서 불러온 읽기 전용 항목입니다. vault에 기록을 남기고 싶을 때만 Markdown 노트로 만드세요.
