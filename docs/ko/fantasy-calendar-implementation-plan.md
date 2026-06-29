# 판타지 캘린더 구현 계획서

이 문서는 Diary의 현재 날짜 기반 플래너 구조 위에 커스텀 판타지 캘린더를 얹기 위한 실제 구현 계획이다. 사용자 커뮤니케이션에서는 "fantasy calendar"라고 설명할 수 있지만, 제품 UI에서는 용도를 더 넓게 포괄하는 **Custom calendar**를 기본 명칭으로 쓴다.

## 목표

현재 Diary는 파일명과 내부 계산의 기준을 `YYYY-MM-DD` 양력 날짜로 유지하고, 보조 역법은 날짜 셀에 라벨로 표시하거나 반복 이벤트의 기준 역법으로 사용한다. 판타지 캘린더도 이 원칙을 유지한다.

- 기존 Markdown 파일명, 기간 노트, 플랜 노트, 클립보드, 알림 동작을 깨지 않는다.
- 사용자가 직접 만든 달력의 월 길이, 요일 길이, 윤일 규칙을 플래너에 표시한다.
- 월간/연간/목록/사이드바에서 같은 날짜 변환 결과를 공유한다.
- 반복 이벤트는 현재처럼 보이는 범위 안에서만 lazy 생성한다.
- 모든 계산은 로컬에서 실행하고, 외부 네트워크나 원격 코드 실행을 추가하지 않는다.

## 비목표

초기 버전에서는 아래 범위를 구현하지 않는다.

- 파일명을 커스텀 날짜로 저장하기
- Obsidian의 기본 날짜 picker 자체를 대체하기
- 사용자가 임의 JavaScript나 수식을 입력해 윤년을 계산하기
- 여러 커스텀 캘린더를 동시에 셀 안에 표시하기
- 이미 만들어진 노트를 대량으로 커스텀 날짜 파일명으로 마이그레이션하기

## 핵심 제품 원칙

1. **양력 날짜가 저장 기준이다.** 모든 노트 생성, 이동, 기간 계산, 알림은 계속 `YYYY-MM-DD`를 canonical date로 사용한다.
2. **커스텀 날짜는 해석 레이어다.** 현재는 플래너 렌더링, 접근성 라벨, 생성/수정 모달의 미리보기에서 변환 결과를 사용한다. 반복 매칭은 후속 통합 단계에서 다룬다.
3. **복잡한 편집은 설정으로 분리한다.** 날짜 셀이나 노트 생성 모달에서 달력 구조를 편집하지 않는다.
4. **모바일 셀 밀도를 우선한다.** 좁은 셀에는 짧은 라벨만 표시하고, 상세 정보는 일자 요약 시트와 파일 옵션 모달에 둔다.
5. **프로필 변경은 명시적으로 다룬다.** 달력 구조가 바뀌면 기존 반복 시리즈가 달라질 수 있으므로 revision/hash로 감지한다.

## 사용자 경험 설계

### 설정 화면

설정은 기존 **Alternate calendar** 흐름을 확장하되, 사용자가 한 번에 하나의 표시 캘린더만 선택하는 현재 단순성을 유지한다.

- **Calendar overlay** 드롭다운
  - **None**
  - Built-in calendars
  - Custom calendars
- **Custom calendars** 섹션
  - 프로필 목록: 이름, 짧은 예시 라벨, 편집, 복제, 삭제
  - **Create custom calendar** 버튼
  - Import/export JSON 버튼은 2차 단계에서 추가

프로필 편집 모달은 한 화면에 모든 것을 넣지 않고 다음 순서로 나눈다.

1. **Basics**
   - 이름
   - 짧은 이름
   - 기준 양력 날짜
   - 그 날짜에 대응하는 커스텀 연/월/일
2. **Months**
   - 월 이름
   - 짧은 이름
   - 기본 일수
   - 순서 변경
3. **Weekdays**
   - 요일 이름
   - 짧은 이름
   - 시작 요일
4. **Leap days**
   - 없음
   - N년마다 특정 월 뒤에 하루 추가
   - N년마다 특정 월의 길이를 며칠 늘림
5. **Preview**
   - 오늘
   - 현재 플래너 월의 1일
   - 사용자가 입력한 양력 날짜
   - 오류와 경고

입력 검증은 저장 전뿐 아니라 입력 중에도 보여준다. 저장할 수 없는 상태에서는 **Save** 버튼을 비활성화하고, 오류 영역은 `aria-live="polite"`로 알린다.

### 플래너 표시

기존 보조 역법 라벨 위치를 재사용한다.

- 연간 플래너: 날짜 숫자 아래에 짧은 라벨을 표시한다.
- 월간 그리드: 날짜 숫자 아래에 짧은 라벨을 표시한다.
- 월간 목록: 날짜 제목 줄 옆에 라벨을 표시한다.
- 사이드바: 셀이 좁으면 셀 안 라벨을 줄이고 일자 요약 시트에 전체 라벨을 표시한다.

라벨 예시:

```text
Rains 12
Moon 3.12
1 Frost 12
```

월간 헤더에는 선택적으로 해당 양력 월이 걸치는 커스텀 월 범위를 보여준다.

```text
June 2026
Frostwane 18 - Emberfall 17
```

단, 헤더가 작아지는 모바일이나 사이드바에서는 이 보조 헤더를 숨기고 tooltip 또는 summary sheet에 둔다.

### 날짜 이동과 생성

초기 버전의 날짜 이동은 현재 UI를 유지한다.

- 이전/다음 버튼은 양력 연/월을 이동한다.
- 연/월 직접 입력 모달은 양력 값을 유지한다.
- 노트 생성 모달의 date field도 양력 날짜를 유지한다.
- 선택한 커스텀 캘린더가 있으면 date field 아래에 커스텀 날짜 미리보기를 표시한다.

다음 단계에서 **Go to custom date**를 추가한다.

- 커스텀 연/월/일을 입력하면 대응하는 양력 날짜로 이동한다.
- 유효하지 않은 날짜는 즉시 오류를 표시한다.
- 월 길이가 가변인 달력은 해당 연도 기준의 유효 범위를 안내한다.

### 반복 이벤트 UX

반복 모달의 **Repeat calendar** 선택지에 커스텀 캘린더 프로필을 추가한다.

- Built-in: Gregorian, Korean lunar, Hebrew 등
- Custom: 사용자가 만든 프로필

반복 정책:

- **Daily**: 양력 하루 단위로 생성한다. 커스텀 요일/월 구조와 무관하게 모든 날짜가 대상이다.
- **Monthly**: 커스텀 캘린더의 매월 같은 day를 찾는다.
- **Yearly**: 커스텀 캘린더의 매년 같은 month/day를 찾는다.
- 해당 월에 같은 day가 없으면 기본 정책은 **skip**이다.
- "마지막 날로 당김" 정책은 사용자가 예상하기 어려우므로 후속 옵션으로 둔다.

프로필이 수정되면 기존 반복 소스의 `recurrence_calendar_profile_hash`와 현재 프로필 hash가 달라질 수 있다. 이 경우 파일 옵션 모달에서 경고를 보여주고, 사용자가 확인하기 전에는 해당 시리즈의 추가 materialize를 건너뛰는 것이 안전하다.

## 데이터 모델

### 설정 저장

기존 `alternateCalendarId`는 built-in 보조 역법 호환을 위해 유지한다. 새 기능은 별도 필드를 추가하고, 나중에 UI에서 하나의 **Calendar overlay**로 묶는다.

```ts
interface DiaryObsidianSettings {
  alternateCalendarId: AlternateCalendarSelection;
  customCalendarProfiles: CustomCalendarProfile[];
  selectedCustomCalendarId: string;
}
```

프로필 수가 많아질 경우 plugin data의 크기를 줄이기 위해 `customCalendarProfiles`를 별도 키로 분리할 수 있지만, 초기 버전은 기존 `loadData()` / `saveData()` 흐름 안에서 관리한다.

### 프로필 스키마

```ts
interface CustomCalendarProfile {
  id: string;
  name: string;
  shortName: string;
  revision: number;
  epoch: {
    gregorianDate: string;
    year: number;
    month: number;
    day: number;
  };
  months: CustomCalendarMonth[];
  weekdays: CustomCalendarWeekday[];
  leapRule: CustomCalendarLeapRule;
  display: {
    labelFormat: "month-day" | "short-month-day" | "year-month-day";
  };
}

interface CustomCalendarMonth {
  id: string;
  name: string;
  shortName: string;
  days: number;
}

interface CustomCalendarWeekday {
  id: string;
  name: string;
  shortName: string;
}

type CustomCalendarLeapRule =
  | { type: "none" }
  | {
      type: "every-n-years";
      interval: number;
      addDays: number;
      month: number;
      mode: "extend-month" | "after-month";
    };
```

제약:

- `months.length`: 1-24
- `month.days`: 1-99
- `weekdays.length`: 1-14
- `year`: 정수, `0`은 허용하지 않음
- `leapRule.interval`: 2-100
- `leapRule.addDays`: 1-30
- 프로필 `id`는 생성 후 변경하지 않음

## 변환 로직

새 모듈을 추가한다.

```text
src/utils/custom-calendars.ts
```

주요 함수:

```ts
normalizeCustomCalendarProfile(value: unknown): CustomCalendarProfile | null;
validateCustomCalendarProfile(profile: CustomCalendarProfile): ValidationResult;
getCustomCalendarDateParts(dateStr: string, profile: CustomCalendarProfile): CustomCalendarDateParts | null;
getGregorianDateFromCustomParts(parts: CustomCalendarInputParts, profile: CustomCalendarProfile): string | null;
formatCustomCalendarLabel(parts: CustomCalendarDateParts, profile: CustomCalendarProfile, locale: string): string;
getCustomCalendarProfileHash(profile: CustomCalendarProfile): string;
```

계산 방식:

1. 양력 날짜 문자열을 UTC day index로 바꾼다.
2. 기준 양력 날짜의 UTC day index와 비교해 offset을 구한다.
3. 기준 커스텀 날짜를 해당 연도의 day-of-year로 변환한다.
4. offset을 더해 target absolute custom day를 얻는다.
5. 연도 길이를 누적해 target year를 찾는다.
6. 해당 연도의 누적 월 길이에서 month/day를 찾는다.
7. weekday는 epoch 기준 offset과 weekday 길이로 계산한다.

성능 최적화:

- `profile.id + revision + year` 기준으로 연도 길이와 누적 월 길이를 캐시한다.
- `profile.id + revision + dateStr` 기준으로 라벨 변환을 캐시한다.
- 설정 저장 또는 프로필 편집 시 캐시를 비운다.
- 렌더링에서는 이미 보이는 날짜만 변환한다.

UTC day index를 쓰는 이유는 DST와 로컬 timezone 변화로 하루 차이가 생기는 것을 막기 위해서다.

## 렌더링 통합

기존 built-in 보조 역법 함수와 커스텀 캘린더를 통합하는 얇은 resolver를 둔다.

```text
src/utils/calendar-overlays.ts
```

역할:

- built-in `AlternateCalendarSelection` 처리
- custom calendar profile 처리
- 공통 label/aria 반환

렌더러 변경 대상:

- `src/views/yearly-planner/render.ts`
- `src/views/monthly-planner/render.ts`
- `src/views/monthly-list-planner/render-list.ts`
- `src/views/monthly-planner/view.ts`의 일자 요약 시트

각 렌더러는 직접 변환 함수를 호출하지 않고 overlay resolver 결과만 받는다.

```ts
interface CalendarOverlayLabel {
  id: string;
  name: string;
  text: string;
  fullText: string;
}
```

## 반복 통합

변경 대상:

- `src/utils/recurrence.ts`
- `src/views/yearly-planner/modals.ts`
- `locales/*.json`
- `docs/en/README.md`
- `docs/ko/README.md`

저장 예시:

```yaml
recurrence_calendar: "custom:cal_abc123"
recurrence_calendar_profile_hash: "sha256:..."
recurrence_anchor_date: "2026-06-22"
recurrence_anchor_year: 4
recurrence_anchor_month: 7
recurrence_anchor_day: 12
```

`recurrence_calendar` 값은 기존 `gregorian`과 built-in ID를 계속 허용한다. `custom:` prefix가 있으면 설정에서 해당 프로필을 찾아 변환한다.

프로필이 없거나 hash가 맞지 않는 경우:

- materialize는 `skipped`로 처리한다.
- 콘솔에는 짧은 debug-level 메시지만 남긴다.
- 파일 옵션 모달에는 "This repeat uses an edited or missing custom calendar" 경고를 표시한다.

## 파일별 구현 순서

1. `src/utils/custom-calendars.ts`
   - 스키마 정규화, 검증, 양방향 변환, 라벨 포맷, 캐시
2. `src/utils/calendar-overlays.ts`
   - built-in 보조 역법과 custom profile의 공통 라벨 resolver
3. `src/settings.ts`
   - custom calendar settings 필드, 편집 모달, preview
4. `locales/*.json`
   - settings, validation, modal copy
5. `src/views/*/render*.ts`
   - overlay resolver로 라벨 표시 경로 교체
6. `src/views/yearly-planner/modals.ts`
   - 노트 생성/수정 모달의 custom date preview
7. `src/utils/recurrence.ts`
   - `custom:` calendar basis, profile hash, skip policy
8. `styles.css`
   - 라벨이 셀 크기를 밀지 않도록 line-height, max-width, overflow 처리
9. 문서
   - README 설정/반복/개인정보 섹션 업데이트

## 단계별 출시 계획

### 1단계: 표시 전용 MVP

- custom calendar profile을 만들고 선택할 수 있다.
- 플래너 셀과 목록에 라벨이 보인다.
- 노트 생성/수정 모달에 커스텀 날짜 미리보기가 보인다.
- 반복 이벤트의 기준 역법으로는 아직 선택할 수 없다.

상태: `1.5.0` 기준 적용됨. 설정의 **Calendar overlay**에서 built-in 보조 역법 또는 커스텀 캘린더 프로필 하나를 선택하고, 연간/월간/목록/사이드바 라벨과 노트 생성/수정 모달 미리보기에 반영한다. 설정 UI는 프로필 생성, 편집, 복제, 삭제, 선택을 지원하며 import/export와 custom recurrence basis는 아직 후속 단계다.

검증:

- `npm run build`
- `npm run lint`
- built-in alternate calendar 선택이 이전처럼 동작
- custom calendar 선택 시 yearly/monthly/list/sidebar 라벨 일치
- 모바일 월간 그리드에서 라벨과 칩이 겹치지 않음

### 2단계: 이동과 입력 보강

- **Go to custom date** 모달 추가
- 월간 헤더에 커스텀 월 범위 표시
- custom date 입력에서 대응하는 양력 날짜 미리보기

검증:

- 유효하지 않은 custom date 입력이 저장/이동을 막음
- leap day가 있는 연도와 없는 연도 모두 이동 가능
- 사이드바 compact layout에서 보조 헤더가 과밀하지 않음

### 3단계: 반복 이벤트 통합

- 반복 기준 역법에 custom calendar profile 추가
- `custom:` recurrence calendar 저장
- profile hash mismatch 감지
- missing day는 skip 정책으로 처리

검증:

- 매월 31일 같은 불가능한 날짜가 일부 월에서 생성되지 않음
- 보이는 범위 밖의 발생분은 생성되지 않음
- profile 삭제/수정 후 기존 반복 시리즈가 일반 노트를 덮어쓰지 않음
- `recurrence_id`가 같은 발생분만 갱신

### 4단계: 내보내기와 공유

- 프로필 JSON import/export
- JSON schema version 추가
- 잘못된 JSON을 부분 적용하지 않고 오류만 표시

검증:

- import 실패가 기존 설정을 변경하지 않음
- export한 profile을 다른 vault에서 import해 같은 날짜 변환 결과를 얻음

## 수용 기준

- 기존 사용자가 아무 설정을 바꾸지 않으면 UI와 데이터가 이전과 동일하다.
- 커스텀 캘린더를 켜도 노트 파일명은 `YYYY-MM-DD` 또는 `YYYY-MM-DD--YYYY-MM-DD`로 유지된다.
- 모든 라벨은 스크린 리더용 날짜 셀 `aria-label`에 포함된다.
- invalid profile은 선택 목록에 나타나지 않거나 비활성 상태로 표시된다.
- 커스텀 캘린더 계산은 vault 내용을 외부로 보내지 않는다.
- 반복 이벤트 materialize는 현재처럼 idempotent하게 동작한다.

## 리스크와 대응

| 리스크 | 대응 |
| --- | --- |
| 사용자가 파일명도 커스텀 날짜로 바뀐다고 기대함 | 설정/문서/모달 copy에서 양력 파일명이 저장 기준임을 반복 안내 |
| 월/요일 편집 UI가 너무 복잡해짐 | settings 안의 별도 편집 모달로 분리하고 preview를 항상 표시 |
| 프로필 수정 후 반복 결과가 바뀜 | `revision`과 hash mismatch를 감지하고 사용자 확인 전 materialize skip |
| 모바일 셀 과밀 | 셀에는 짧은 라벨만, 상세 라벨은 summary sheet와 aria-label에 표시 |
| DST로 날짜 offset이 틀어짐 | 변환 모듈은 UTC day index만 사용 |
| 윤일/월말 반복 정책이 모호함 | 초기 정책은 skip으로 고정하고, roll-to-last-day는 후속 옵션 |

## 최종 UX 문구 방향

설정 설명:

> Show one extra calendar label in planner views. Built-in calendars use local browser data; custom calendars use your local profile and keep normal `YYYY-MM-DD` files.

반복 경고:

> This repeat uses a custom calendar that has changed since the repeat was created. Review it before creating more occurrences.

한국어 설정 설명:

> 플래너에 보조 캘린더 라벨 하나를 표시합니다. 커스텀 캘린더를 사용해도 노트 파일명은 기존 `YYYY-MM-DD` 형식을 유지합니다.
