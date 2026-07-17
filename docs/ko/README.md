# Diary (한국어)

Diary는 Obsidian vault 안의 Markdown 파일을 날짜 기반 플래너로 보여주는 커뮤니티 플러그인입니다. 연간, 월간 그리드, 월간 목록, 일별, 3일 뷰를 오가며 단일 날짜 노트, 기간 노트, 월/연 플랜 노트, 캘린더 오버레이, 공휴일, todo 상태, 로컬 알림을 한 곳에서 관리할 수 있습니다.

전체 문서: [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## 현재 정보

| 항목 | 값 |
| --- | --- |
| 플러그인 ID | `diary` |
| 현재 버전 | `1.9.0` |
| 최소 Obsidian 버전 | `1.7.2` |
| 지원 플랫폼 | 데스크톱 / 모바일 (`isDesktopOnly: false`) |
| 기본 언어 | `en` |
| 기본 플래너 폴더 | `Planner` |

## 최신 버전

- `1.9.0`: 모바일 플래너 콘텐츠, 타임라인 끝, compact 뷰 메뉴가 Obsidian의 일반/부동 하단 내비게이션 위에 유지되며 설정 가능한 최소 하단 여백도 함께 적용됩니다.
- `1.8.3`: 타입이 지정된 Obsidian element instance helper로 요소를 생성한 뒤 즉시 detach해 직접 `Document` 생성 호출을 모두 제거했습니다.
- `1.8.2`: 타입이 지정된 `DocumentFragment` Obsidian helper로 detached 플래너 DOM을 생성해 community plugin audit의 unsafe 타입 전파 경고를 제거했습니다.
- `1.8.1`: 이전 Obsidian 설정 UI 호환성을 유지하면서 Obsidian 1.13+ 검색용 선언형 설정을 추가하고, DOM 생성을 Obsidian helper로 통일했습니다.
- `1.8.0`: 모든 플래너 뷰의 칩, 컨트롤, 모달 액션, compact 레이아웃 상태, 키보드 포커스 동작을 통일하고 스크린샷을 새로 갱신했습니다.
- `1.7.1`: 불필요한 DOM 타입 assertion을 제거하고 공통 플래너 기간 모달의 typed lint 해석을 안정화했습니다.
- `1.7.0`: 일별·3일 타임라인 플래너, 직접 뷰 선택기, 공통 기간 이동 모달, 독립적인 시작/종료 시간 메타데이터, N일·주·월·년 단위의 가상 반복 일정을 추가했습니다.
- `1.6.0`: 모든 지원 UI 언어의 full documentation, 스페인 공휴일, 보조 역법 선택지 문구 현지화를 추가했습니다.
- `1.5.0`: 영어에 더해 독일어, 스페인어, 프랑스어, 일본어, 중국어 간체, 중국어 번체, 한국어 UI 언어를 지원합니다.
- `1.4.2`: Diary 스타일 적용 범위를 플래너, 설정, 모달 화면으로 좁히고 색상 preset 버튼에 현지화된 라벨을 추가한 릴리스입니다.
- `1.4.1`: 외부 캘린더 일정 액션, 눌림 피드백, 성공/오류 Notice를 다듬은 릴리스입니다.
- `1.4.0`: 커스텀 캘린더 오버레이 설정과 사용자가 추가하는 외부 캘린더 feed를 지원합니다. 외부 `webcal://` 또는 `https://` `.ics` 일정은 사용자가 Markdown 노트로 만들기 전까지 읽기 전용 오버레이로 표시됩니다.
- `1.3.6`: 타입 기반 커뮤니티 플러그인 audit 검사를 안정화한 유지보수 릴리스입니다.
- `1.3.5`: Obsidian 플러그인 lint와 릴리스 검증 흐름을 맞춘 유지보수 릴리스입니다.
- `1.3.4`: 타입 기반 ESLint 검사가 명시적으로 TypeScript project를 사용하도록 하고, 재현 가능한 source validation을 위해 lint 도구 버전을 고정한 유지보수 릴리스입니다.
- `1.3.3`: 유지보수 릴리스입니다. 커뮤니티 플러그인 source validation을 위해 타입 기반 ESLint 안전성 검사를 더 엄격하게 적용합니다.
- `1.3.2`: 유지보수 릴리스입니다. 문서, 에이전트 가이드, ESLint config 타입, TypeScript lib target 정리를 포함합니다.
- `1.3.1`: 고정된 Obsidian 타입 패키지, 의존성 lockfile 정리, ESLint 호환성 업데이트, 반복 칩 스타일 정리를 포함합니다.
- `1.3.0`: 연간/월간 그리드/월간 목록/사이드바 플래너 전반에 반복 이벤트와 보조 역법 라벨을 추가했습니다.
- `1.2.1`: 유지보수 릴리스입니다. Obsidian 커뮤니티 플러그인 lint 호환성과 번들된 공휴일 의존성 정리를 포함하며, 사용자 워크플로는 `1.2.0`과 같습니다.
- `1.2.0`: 오른쪽 사이드바 플래너를 도입했습니다. 자동 사이드바 생성, **Open monthly planner in sidebar** 명령, 연간/월간 그리드/월간 목록 사이드 리프 전환을 포함합니다.

## 스크린샷

아래 이미지는 격리된 데모 폴더에 종일·시간 지정·기간·todo·플랜 노트를 만든 뒤 캡처했습니다. 촬영이 끝난 뒤 임시 데모 데이터는 모두 제거했습니다. 좁은 레이아웃 이미지는 가로 공간이 제한될 때 공통 헤더와 월간 뷰가 적응하는 모습을 보여줍니다.

### 데스크톱

![연간 플래너](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![월간 그리드 플래너](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![월간 목록 플래너](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

| 일별 타임라인 | 3일 타임라인 |
| --- | --- |
| ![일별 타임라인 플래너](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3일 타임라인 플래너](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

### 좁은 레이아웃

| 월간 그리드 | 월간 목록 |
| --- | --- |
| ![좁은 월간 그리드](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![좁은 월간 목록](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## 주요 기능

- **연간 플래너**: `12개월 x 31일` 표로 한 해의 날짜 노트와 기간 노트를 한눈에 봅니다. 펼친 월 셀 너비는 reload 이후에도 유지됩니다.
- **다국어 UI**: Diary UI를 영어, 독일어, 스페인어, 프랑스어, 일본어, 중국어 간체, 중국어 번체, 한국어로 전환할 수 있습니다.
- **월간 그리드 플래너**: 한 달 달력을 크게 보고 날짜별 칩, 기간 막대, 공휴일, 캘린더 오버레이 라벨, 외부 캘린더 오버레이를 확인합니다.
- **월간 목록 플래너**: 하루씩 세로로 훑으며 일정이 많은 달을 검토하고, `전체`, `노트 있음`, `오늘 이후` 필터로 범위를 좁힙니다.
- **일별 플래너**: 하루를 24시간 시간표로 계획합니다. `start_time`과 `end_time`이 있는 노트는 시간축에, 종일 및 시간 미지정 노트는 별도 영역에 표시됩니다.
- **3일 플래너**: 연속된 3일을 하나의 24시간 시간축에서 나란히 비교합니다. 좁은 화면에서는 날짜 열을 압축하지 않고 가로 스크롤을 사용합니다.
- **직접 뷰 선택기**: 연간, 월간 그리드, 월간 목록, 일별, 3일 뷰 중 원하는 뷰로 바로 이동합니다. 좁은 화면에서도 선택기는 유지하고 보조 동작만 **더보기**로 이동합니다.
- **오른쪽 사이드바 플래너**: 메인 작업 영역에는 노트를 열어 둔 채, 오른쪽 사이드바에 compact 월간 플래너를 계속 표시합니다.
- **플랜 노트 패널**: 연간 노트(`YYYY.md`)와 월간 노트(`YYYY-MM.md`)를 플래너 상단에서 만들고 미리 봅니다. 미리보기 접힘/펼침 상태는 저장되며, 모바일은 별도 상태로 처음에는 접혀 있습니다.
- **날짜/기간 노트**: 날짜 파일명과 기간 파일명을 기준으로 노트를 플래너 칩으로 표시합니다. 기본값은 vault 전체 스캔이며, 설정에서 플래너 폴더 안으로만 제한할 수 있습니다.
- **반복 이벤트**: 양력 또는 보조 역법을 기준으로 N일·주·월·년마다 반복합니다. 발생분은 선택해 Markdown 노트로 만들기 전까지 가상 일정으로 유지됩니다.
- **색상, todo, 완료 상태**: frontmatter의 `color`, `todo`, `completed` 값을 칩 스타일과 라벨에 반영합니다.
- **공휴일 오버레이**: 지원 UI 언어권의 국가별 공휴일을 표시하고 공휴일 배지를 선택해 이름을 확인합니다.
- **보조 역법 라벨**: 한국식 음력, 중국식 음력, 단기, 히브리력, 이슬람력, 페르시아력, 인도 국민력, 불기, 일본 연호, 민국력, 콥트력, 에티오피아력 등에서 하나만 선택해 표시하며, 모든 지원 UI 언어에서 자연스러운 선택지 문구를 제공합니다.
- **커스텀 캘린더 오버레이**: 판타지 세계관이나 캠페인용 캘린더 프로필을 만들고, 월 길이/요일/간단한 윤일 규칙을 바탕으로 플래너 셀에 커스텀 날짜 라벨을 표시합니다. 노트 파일명은 기존 `YYYY-MM-DD` 형식을 유지합니다.
- **외부 캘린더 오버레이**: `webcal://` 또는 `https://` `.ics` feed를 추가하고, 수동 또는 주기 새로고침으로 불러온 일정을 연간/월간 그리드/월간 목록/사이드바/일자 요약에 읽기 전용 chip/range로 표시합니다. 필요한 일정만 선택해 일반 Markdown 노트로 만들 수 있습니다.
- **스코프가 제한된 스타일**: Diary CSS는 플래너 뷰, 설정 패널, 플러그인 모달에만 적용되도록 제한해 일반 vault 내용의 스타일을 바꾸지 않습니다.
- **로컬 알림**: `notify_minutes`가 있는 날짜 노트는 Obsidian이 열려 있을 때 해당 날짜와 시간에 Notice를 표시합니다.
- **플래너 클립보드**: 데스크톱에서 선택한 날짜/노트를 복사, 붙여넣기, 삭제, 붙여넣기 취소할 수 있습니다.
- **키보드와 접근성 지원**: 날짜 셀, 칩, 기간 막대, 공휴일 배지, 플래너 라벨, 월간 목록 행을 키보드로 실행할 수 있고 접근성 라벨을 제공합니다.
- **모바일 최적화**: 월간 그리드에서 핀치 줌, 확대 초기화, 일자 요약 시트를 지원합니다.

## 향후 설계

현재 배포 버전은 일반 `YYYY-MM-DD` 파일명을 저장 기준으로 유지합니다. 커스텀 판타지 캘린더는 표시/입력 미리보기 중심으로 사용할 수 있고, 외부 캘린더는 읽기 전용 오버레이와 선택적 Markdown 노트 생성을 지원합니다. 아래 항목은 기존 Markdown 파일 모델을 유지하면서 확장하기 위한 후속 구현 계획입니다.

- **커스텀 판타지 캘린더 후속 단계**: 커스텀 날짜로 직접 이동하기, 반복 이벤트 기준 역법으로 사용하기, 프로필 import/export를 추가합니다. 자세한 계획은 [판타지 캘린더 구현 계획서](fantasy-calendar-implementation-plan.md)를 참고하세요.
- **외부 캘린더 후속 단계**: OAuth/CalDAV 같은 양방향 연동이 아니라, 현재 read-only feed 모델을 바탕으로 중복 처리와 표시 밀도를 더 다듬습니다. 자세한 계획은 [외부 캘린더 오버레이 구현 계획서](external-calendar-overlay-implementation-plan.md)를 참고하세요.

## 설치

1. [Releases](https://github.com/POBSIZ/obsidian-diary/releases)에서 최신 릴리스를 다운로드합니다.
2. `main.js`, `manifest.json`, `styles.css`를 vault의 `Vault/.obsidian/plugins/diary/` 폴더에 복사합니다.
3. Obsidian에서 **Settings → Community plugins**를 엽니다.
4. Restricted mode가 켜져 있다면 신뢰하는 vault에서만 끄고, **Diary**를 활성화합니다.
5. 왼쪽 리본 아이콘 또는 커맨드 팔레트에서 플래너를 엽니다. 월간 리본 아이콘은 오른쪽 사이드바 플래너를 엽니다.

## 빠른 시작

1. 사이드 플래너는 **Open monthly planner in sidebar**, 전체 작업 영역 탭은 **Open monthly planner** 명령을 실행합니다.
2. 상단의 파일 추가 버튼을 선택하거나 날짜 셀을 선택합니다.
3. **Single date** 또는 **Range**를 고릅니다.
4. 폴더, 날짜, 파일 이름, 색상, todo 여부, 알림 시간을 입력합니다.
5. **Create**를 선택하면 Markdown 노트가 만들어지고 플래너에 칩 또는 기간 막대로 표시됩니다.

생성된 노트는 일반 Markdown 파일입니다. 플러그인을 끄더라도 vault 안의 파일은 그대로 남습니다.

## 뷰 열기와 전환

리본 아이콘:

- `calendar-range`: 메인 작업 영역에 연간 플래너 열기
- `calendar-days`: 오른쪽 사이드바의 월간 플래너 열기 또는 다시 보이기
- `list-ordered`: 메인 작업 영역에 월간 목록 플래너 열기

커맨드 팔레트:

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`
- `Open daily planner`
- `Open 3-day planner`

각 플래너 헤더의 반복 아이콘을 선택하면 같은 리프에서 다음 순서로 전환됩니다.

```text
Yearly -> Monthly Grid -> Monthly List -> Daily -> 3 Days -> Yearly
```

이전/다음 버튼으로 연도나 월을 이동하고, 달력 아이콘으로 현재 연도/월로 돌아갑니다. 연도 또는 월 표시 텍스트를 선택하면 직접 값을 입력할 수 있습니다.

## 오른쪽 사이드바 플래너

Diary는 워크스페이스가 준비되면 오른쪽 사이드바에 compact 월간 플래너를 하나 만듭니다. **Open monthly planner in sidebar** 명령이나 월간 리본 아이콘으로 다시 표시할 수 있습니다.

사이드 플래너는 보조 뷰로 동작합니다.

- compact 월간 레이아웃과 일자 요약 시트를 사용합니다.
- 사이드바에서 플래너 노트를 선택하면 파일은 메인 작업 영역에 열려, 사이드바 플래너가 계속 보입니다.
- 레이아웃 전환 버튼으로 같은 사이드 리프 안에서 연간, 월간 그리드, 월간 목록을 순환합니다.
- 이전 버전에서 생긴 오른쪽 사이드바 월간 플래너가 있으면 하나의 사이드 플래너만 남도록 정리합니다.

## 월간 목록 필터

월간 목록에는 세 가지 필터가 있습니다.

- **전체**: 선택한 달의 모든 날짜를 표시합니다.
- **노트 있음**: 단일 날짜 노트나 기간 노트가 있는 날짜만 표시합니다.
- **오늘 이후**: 선택한 달에서 오늘과 이후 날짜만 표시합니다.

월간 목록을 현재 달로 열면 오늘 행이 자동으로 보이도록 스크롤됩니다. 현재 달 버튼을 선택해도 오늘 행으로 돌아갑니다.

## 외부 캘린더 feed

**Settings → Diary → External calendars**에서 공개된 `webcal://` URL 또는 `https://` `.ics` URL을 추가합니다.

- feed URL은 로컬 plugin data에 저장되며 vault sync 설정에 따라 다른 기기로 동기화될 수 있으므로, secret iCal URL은 접근 토큰처럼 다룹니다.
- Diary는 local/private network 캘린더 URL을 거부합니다.
- feed 이름, 색상, description 포함 여부, 새로고침 주기, 표시할 플래너 화면을 정할 수 있습니다.
- 새 feed는 기본적으로 60분마다 자동 새로고침하고 연간, 월간 그리드, 월간 목록, 사이드바에 표시됩니다. 필요하면 수동 새로고침만 사용하거나 화면별 표시를 끌 수 있습니다.
- 외부 일정은 별도 점선/ghost 스타일의 읽기 전용 오버레이입니다. drag, 클립보드, todo, 색상 수정 대상이 아닙니다.
- 외부 일정을 선택하면 상세 모달에서 **Markdown 노트 만들기**, **캘린더 새로고침**, **상세 복사**를 실행할 수 있습니다. 액션 버튼은 현지화된 라벨과 눌림/loading/완료 상태 피드백을 제공합니다.
- 외부 일정으로 Markdown 노트를 만들면 연결 frontmatter를 저장하고, 같은 외부 이벤트 overlay가 중복 표시되지 않도록 숨깁니다.

## 노트 만들기

### 단일 날짜 노트

날짜 셀을 선택하거나 파일 추가 버튼을 선택한 뒤 **Single date**를 사용합니다.

- 기본 파일명은 `YYYY-MM-DD.md`입니다.
- 접미사를 붙이면 칩 제목으로 사용됩니다. 예: `2026-05-19-mobile-qa.md` -> `mobile-qa`
- 색상을 지정하면 칩 왼쪽 선이나 모바일 점 색상으로 표시됩니다.
- **Todo file**을 켜면 칩에 todo 상태가 표시됩니다.
- **Reminder time**을 입력하면 `notify_minutes` frontmatter로 저장됩니다.
- **Repeat**를 켠 뒤 **매일**, **매주**, **매월**, **매년** 중 하나와 1~999 사이의 반복 간격, 기준 역법, 선택형 종료일을 고릅니다. N일·주·월·년마다 반복할 수 있으며 종료일 당일도 포함됩니다. 이후 발생분은 파일을 만들지 않고 플래너에 가상 일정으로 표시됩니다.

### 기간 노트

데스크톱에서는 날짜 셀을 드래그해 범위를 선택하면 **Range** 모달이 열립니다. 모바일에서는 파일 추가 버튼을 선택한 뒤 **Range**를 고르고 시작일과 종료일을 직접 입력합니다.

- 파일명 형식은 `YYYY-MM-DD--YYYY-MM-DD.md`입니다.
- 접미사를 붙이면 기간 제목으로 사용됩니다. 예: `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- 생성 시 `date_start`, `date_end` frontmatter가 자동으로 저장됩니다.
- 연간 플래너에는 세로 막대와 시작일 칩으로, 월간 그리드/목록에는 기간 막대로 표시됩니다.

### 플랜 노트

플래너 상단의 플랜 노트 패널에서 연간/월간 메모를 만들 수 있습니다.

- 연간 플랜 노트: `{plannerFolder}/{year}.md`
- 월간 플랜 노트: `{plannerFolder}/{year}-{month}.md`
- 패널은 접거나 펼칠 수 있으며 이 상태는 플러그인 데이터에 저장됩니다.
- 데스크톱과 모바일은 패널 상태를 따로 저장합니다. 데스크톱은 기본 펼침, 모바일은 사용자가 펼치기 전까지 기본 접힘입니다.
- 기존 플랜 노트가 있으면 미리보기와 열기 버튼이 표시됩니다.

## 노트 수정

플래너에 표시된 칩이나 기간 막대를 선택하면 파일 옵션 모달이 열립니다.

- 파일 경로 확인
- 표시 제목 변경
- 단일 날짜 또는 기간 날짜 변경
- 칩 색상 변경
- todo / completed 상태 변경
- 알림 시간 변경
- 파일 미리보기
- 파일 열기
- 파일 삭제

데스크톱에서는 날짜 칩 또는 기간 막대를 다른 날짜로 드래그해 이동할 수 있습니다. 기간 노트는 시작일이 이동하며 전체 기간 길이는 유지됩니다. 대상 경로에 이미 파일이 있으면 이동하지 않습니다.

## 키보드와 접근성

- 포커스된 날짜 셀, 플래너 칩, 기간 막대, 공휴일 배지, 월간 목록 행, 연도 라벨, 월 라벨에서 `Enter` 또는 `Space`를 누르면 실행됩니다.
- 플래너 컨트롤은 스크린 리더를 위해 button role, 상태 라벨, `aria-label` 텍스트를 제공합니다.
- 노트 생성/수정 모달의 색상 preset 버튼은 현지화된 `aria-label`과 `title`을 제공합니다.
- 월간 목록 필터는 탭 형태의 선택 상태를 `aria-selected`로 노출합니다.
- 모달의 검증 메시지는 polite live region으로 안내됩니다.

## 플래너 클립보드 (데스크톱)

플래너 영역에서 `Cmd`(macOS) 또는 `Ctrl`(Windows/Linux)을 누른 채 날짜나 칩을 선택합니다.

Diary는 복사한 플래너 노트를 현재 Obsidian 세션의 내부 메모리 클립보드에 보관합니다. 시스템 클립보드를 읽거나 쓰지 않습니다.

- `Cmd/Ctrl + click`: 선택을 새로 지정합니다.
- `Cmd/Ctrl + Shift + click`: 기존 선택에 추가하거나 제거합니다.
- `Cmd/Ctrl + C`: 선택한 날짜/노트를 Diary 내부 클립보드에 복사합니다.
- `Cmd/Ctrl + V`: 선택한 대상 날짜에 붙여넣습니다.
- `Cmd/Ctrl + Delete` 또는 `Cmd/Ctrl + Backspace`: 선택한 플래너 노트를 휴지통으로 보냅니다.
- `Cmd/Ctrl + Z`: 마지막 붙여넣기 배치를 휴지통으로 보내 되돌립니다.

붙여넣기 규칙:

- 노트 1개를 여러 날짜에 붙여넣을 수 있습니다.
- 여러 노트는 날짜 1개에 붙여넣을 수 있습니다.
- 여러 노트를 여러 날짜에 동시에 붙여넣는 조합은 충돌을 피하기 위해 막습니다.
- 기존 파일이 있으면 `-copy`, `-copy2`처럼 고유 경로를 만듭니다.

## 모바일 사용법

- 월간 그리드에서 날짜를 탭하면 하단 일자 요약 시트가 열립니다.
- 요약 시트에서 해당 날짜의 단일 노트, 기간 노트, 공휴일을 확인합니다.
- **노트 만들기**를 선택해 해당 날짜의 새 노트를 만듭니다.
- 월간 그리드에서는 핀치 줌을 사용할 수 있습니다.
- 확대 초기화 버튼으로 월간 그리드 확대 비율을 되돌립니다.
- 플래너 콘텐츠와 메뉴는 Obsidian의 일반/부동 하단 내비게이션을 자동으로 피합니다. **Mobile bottom padding**은 추가 최소 여백으로, **Mobile cell width**는 연간 셀 너비 조정에 사용합니다.

## 설정

| 설정 | 설명 |
| --- | --- |
| Language | 플러그인 UI 언어입니다. 기본값은 `en`이며, `en`, `de`, `es`, `fr`, `ja`, `zh-CN`, `zh-TW`, `ko`를 지원합니다. |
| Planner folder | 새 플래너 노트와 플랜 노트를 만들 기본 폴더입니다. 스캔 범위를 플래너 폴더로 제한할 때도 사용합니다. 기본값은 `Planner`입니다. |
| Planner note scan scope | Diary가 플래너 노트를 vault 전체에서 찾을지, **Planner folder**와 그 하위 폴더에서만 찾을지 정합니다. 기본값은 `Entire vault`입니다. |
| Date format | 날짜 형식 저장값입니다. 현재 플래너 파일명은 `YYYY-MM-DD` 규칙을 사용합니다. |
| Show holidays | 공휴일 표시를 켜거나 끕니다. |
| Holiday country | 공휴일 국가입니다. `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW`, `None`을 지원합니다. |
| Calendar overlay | 연간, 월간 그리드, 월간 목록, 일자 요약, 사이드바 플래너에 표시할 built-in 보조 역법 또는 커스텀 캘린더 프로필 하나를 선택합니다. 기본값은 `표시 안 함`입니다. |
| Custom calendars | 판타지/캠페인용 로컬 캘린더 프로필입니다. 월 길이, 요일 이름, 기준 양력 날짜와 커스텀 날짜의 연결, 라벨 형식, 간단한 윤일 규칙을 정의할 수 있습니다. |
| External calendars | 사용자가 추가하는 `webcal://` 또는 `https://` `.ics` feed입니다. feed별 활성 상태, 색상, 새로고침 주기, description 포함 여부, 화면별 표시 여부를 설정합니다. |
| Mobile bottom padding | 모든 모바일 플래너의 최소 하단 여백입니다. 설정값이 작아도 navbar와 safe area 자동 여백은 계속 적용됩니다. |
| Mobile cell width | 모바일 연간 플래너의 월 셀 너비입니다. `0`이면 기본값을 사용합니다. |

Diary는 플러그인 데이터에 UI 전용 상태도 저장합니다. 플랜 노트 미리보기 펼침 상태, 모바일 플랜 노트 미리보기 펼침 상태, 연간 플래너에서 펼친 월 셀 너비가 여기에 포함됩니다.

## Frontmatter 참고

| 키 | 설명 |
| --- | --- |
| `color` | 칩 색상입니다. 유효한 CSS 색상 문자열을 사용할 수 있습니다. 예: `#22c55e`, `red`, `rgb(34, 197, 94)` |
| `todo` | `true`이면 todo 칩으로 표시됩니다. |
| `completed` | `todo: true`일 때 완료 상태를 표시합니다. |
| `start_time` | 선택 사항인 칩 시작 시간(`HH:mm`)입니다. 시간이 있는 칩은 시작 시간순으로 정렬됩니다. |
| `end_time` | 선택 사항인 칩 종료 시간(`HH:mm`)입니다. 이 값은 리마인더를 실행하지 않습니다. |
| `notify_minutes` | 이벤트 날짜의 로컬 자정 기준 분입니다. `0`부터 `1439`까지 사용할 수 있습니다. 예: 오전 9시는 `540` |
| `date_start` | 기간 노트 생성/수정 시 자동 저장되는 시작일입니다. |
| `date_end` | 기간 노트 생성/수정 시 자동 저장되는 종료일입니다. |
| `title` | 파일명에서 제목을 추출할 수 없을 때 사용하는 표시 제목입니다. |
| `recurrence_id` | 반복 소스와 생성된 발생분이 공유하는 안정적인 시리즈 ID입니다. |
| `recurrence_role` | 반복 정의 노트는 `source`, 생성된 발생 노트는 `occurrence`입니다. |
| `recurrence_calendar` | 기준 역법입니다. `gregorian` 또는 지원되는 보조 역법 ID를 사용합니다. |
| `recurrence_rule` | `FREQ=WEEKLY;INTERVAL=2`처럼 주기와 선택형 간격을 저장합니다. `INTERVAL`이 없는 기존 규칙은 1단위마다 반복합니다. |
| `recurrence_anchor_date` | 시리즈 기준이 되는 양력 소스 날짜입니다. |
| `recurrence_until_date` | 이 날짜까지 포함해 반복하는 선택형 양력 종료일입니다. |
| `recurrence_anchor_year/month/day` | 보조 역법 기준 매칭에 쓰는 기준 역법 날짜 필드입니다. |
| `recurrence_exdates` | 시리즈에서 건너뛸 양력 발생 날짜 목록입니다. |
| `recurrence_source_path` | 생성된 발생 노트에 저장되는 소스 노트 경로입니다. |
| `recurrence_occurrence_date` | 생성된 발생 노트가 나타내는 양력 날짜입니다. |
| `diary_external_calendar` | 외부 일정에서 생성한 Markdown 노트에 저장되는 외부 캘린더 feed ID입니다. |
| `diary_external_event_uid` | 생성된 노트를 외부 feed 이벤트와 연결하기 위한 이벤트 UID입니다. |
| `diary_external_event_instance` | 외부 이벤트 instance key입니다. 보통 이벤트 시작 날짜/시간입니다. |
| `diary_external_event_source` | 중복 overlay를 숨기는 데 쓰는 안정적인 연결 key입니다. |
| `diary_external_event_linked_at` | 외부 일정에서 Markdown 노트를 만든 시각의 ISO timestamp입니다. |

알림은 OS 수준 예약 알림이 아닙니다. Obsidian이 열려 있는 동안 플러그인이 약 15초 간격으로 확인하고, 이벤트 날짜의 해당 분에 Obsidian Notice를 표시합니다.

반복 발생분은 기본적으로 가상 일정입니다. 플래너 모달에서 노트로 만들 때 같은 `recurrence_id` 발생분이 이미 있으면 해당 노트를 사용하고, 대상 경로가 일반 노트이거나 다른 시리즈이면 덮어쓰지 않습니다.

## 파일명 규칙

Diary는 기본적으로 vault 전체의 Markdown 파일을 스캔해 아래 파일명 규칙과 맞는 노트를 플래너에 표시합니다. 설정에서 스캔 범위를 **Planner folder**와 그 하위 폴더로 제한할 수 있습니다. 새로 만드는 노트는 기본적으로 **Planner folder**에 생성됩니다.

단일 날짜:

```text
2026-05-19.md
2026-05-19-mobile-qa.md
2026-05-19-mobile QA.md
```

기간:

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
2026-05-21--2026-05-24-family trip.md
```

플랜 노트:

```text
2026.md
2026-05.md
```

표시 제목 우선순위:

1. 파일명 접미사
2. frontmatter `title`
3. 첫 번째 Markdown heading
4. 파일 basename

플래너 노트 제목을 만들거나 수정할 때 표시 제목의 공백은 파일명 접미사에서도 유지됩니다. Diary는 더 이상 그 공백을 자동으로 하이픈으로 바꾸지 않습니다.

## 개발

이 저장소는 npm을 사용합니다. 현재 CI build matrix는 Node.js `20.x`, `22.x`에서 검증하며, 로컬 개발은 현재 LTS 릴리스에서도 동작합니다.

```bash
npm install
npm run dev
```

프로덕션 빌드:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

테스트:

```bash
npm test
```

## 릴리스

- 릴리스 워크플로: `.github/workflows/release.yml`
- 릴리스 에셋: `main.js`, `manifest.json`, `styles.css`
- `npm version patch|minor|major --no-git-tag-version`을 사용해 `package.json`, `package-lock.json`, `manifest.json`, `versions.json`을 함께 맞춥니다.
- GitHub 릴리스 태그는 `manifest.json`의 버전과 정확히 같아야 하며, 앞에 `v`를 붙이지 않습니다.
- 이 저장소는 릴리스 에셋을 개별 파일로 게시하며, 릴리스 워크플로는 `main.js`, `manifest.json`, `styles.css`에 대한 build provenance attestation을 생성합니다.

## 개인정보와 네트워크

- 플래너 기능은 vault 안의 로컬 Markdown 파일을 기준으로 동작합니다.
- 숨겨진 telemetry나 analytics가 없습니다.
- 공휴일과 캘린더 오버레이 계산은 번들된 의존성, 브라우저 제공 데이터, 로컬에 저장한 프로필을 사용하며, 플래너 표시를 위해 vault 내용을 외부 서비스로 보내지 않습니다.
- 외부 캘린더 feed는 사용자가 직접 추가한 경우에만 네트워크 요청을 보냅니다. Diary는 추가된 feed URL만 가져오고, 가져온 일정 cache를 plugin data에 저장하며, 사용자가 **Markdown 노트 만들기**를 선택하기 전에는 vault 파일을 만들지 않습니다.
- `obsidian-reminder-endpoint-spec.md`는 향후 외부 endpoint 연동 설계 메모입니다. 현재 배포된 플러그인은 reminder 데이터를 네트워크로 전송하지 않습니다.

## 문제 해결

- 플러그인이 보이지 않으면 `main.js`, `manifest.json`, `styles.css`가 `Vault/.obsidian/plugins/diary/` 바로 아래에 있는지 확인합니다.
- 명령이 보이지 않으면 **Settings → Community plugins**에서 **Diary**가 활성화되어 있는지 확인합니다.
- 사이드바 플래너가 보이지 않으면 **Open monthly planner in sidebar** 명령을 실행하거나 플러그인을 활성화한 뒤 Obsidian을 다시 로드합니다.
- 칩이 표시되지 않으면 파일명이 `YYYY-MM-DD` 또는 `YYYY-MM-DD--YYYY-MM-DD` 규칙을 따르는지 확인합니다.
- 자동으로 확보된 모바일 내비게이션 여백보다 더 넓은 공간이 필요하면 **Mobile bottom padding** 값을 키웁니다.
- 알림이 오지 않으면 Obsidian이 열려 있는지, 노트의 이벤트 날짜가 오늘인지, `notify_minutes` 값이 `0-1439` 범위인지 확인합니다.

## 라이선스

`LICENSE` 파일을 참고하세요.
