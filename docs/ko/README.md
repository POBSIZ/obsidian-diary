# Diary (한국어)

Diary는 Obsidian 볼트의 일반 Markdown 노트를 날짜별 플래너로 보여주는 커뮤니티 플러그인입니다. 별도 데이터베이스나 전용 파일 형식 없이 연간·월간·일간·3일 보기를 오가며 일정을 관리할 수 있습니다.

전체 문서: [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## 한눈에 보기

| 항목 | 값 |
| --- | --- |
| 플러그인 ID | `diary` |
| 현재 버전 | `1.15.1` |
| 최소 Obsidian 버전 | `1.7.2` |
| 지원 플랫폼 | 데스크톱 / 모바일 (`isDesktopOnly: false`) |
| 기본 언어 | `en` |
| 기본 플래너 폴더 | `Planner` |

## 1.15.1 변경 사항

- `1.15.1`: 모든 지원 언어의 문서를 자연스럽게 다듬고, 용어와 릴리스 안내를 더 짧고 명확하게 정리했습니다.

이전 변경 사항은 [Releases](https://github.com/POBSIZ/obsidian-diary/releases)에서 확인할 수 있습니다.

## 스크린샷

스크린샷에는 종일 일정, 시간 일정, 기간, 할 일, 플랜 노트를 담은 임시 데모 폴더를 사용했습니다. 좁은 화면 예시는 가로 공간이 부족할 때 같은 화면이 어떻게 달라지는지 보여줍니다. 촬영 뒤 데모 폴더는 삭제했습니다.

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

- **연간 플래너**: `12개월 × 31일` 표로 한 해의 날짜 노트와 기간 노트를 한눈에 봅니다. 넓힌 월 셀 너비는 다시 불러와도 유지됩니다.
- **다국어 UI**: Diary UI를 영어, 독일어, 스페인어, 프랑스어, 일본어, 중국어 간체, 중국어 번체, 한국어로 전환할 수 있습니다.
- **월간 그리드 플래너**: 한 달 달력을 크게 보고 날짜별 칩, 기간 막대, 공휴일, 캘린더 오버레이 라벨, 외부 캘린더 오버레이를 확인합니다.
- **월간 목록 플래너**: 일정이 많은 달을 날짜별 목록으로 살펴보고 `전체`, `노트 있음`, `오늘 이후` 필터로 추립니다.
- **일별 플래너**: 하루를 24시간 시간표로 계획합니다. 여러 날의 기간 노트는 연속된 종일 막대 또는 날짜·시간 구간으로 표시하고, 시간 지정 기간의 양쪽 경계를 날짜를 넘겨 조절할 수 있습니다. 종일 및 시간 미지정 노트는 별도 영역에 표시됩니다.
- **3일 플래너**: 연속된 3일을 하나의 24시간 시간축에서 나란히 비교합니다. 좁은 화면에서는 날짜 열을 압축하지 않고 가로 스크롤을 사용합니다.
- **직접 뷰 선택기**: 연간, 월간 그리드, 월간 목록, 일별, 3일 뷰 중 원하는 뷰로 바로 이동합니다. 좁은 화면에서도 선택기는 유지하고 보조 동작만 **더보기**로 이동합니다.
- **오른쪽 사이드바 플래너**: 메인 작업 영역에는 노트를 열어 둔 채 오른쪽 사이드바에 컴팩트 월간 플래너를 계속 표시합니다.
- **플랜 노트 패널**: 연간 노트(`YYYY.md`)와 월간 노트(`YYYY-MM.md`)를 플래너 상단에서 만들고 미리 봅니다. 미리보기 접힘/펼침 상태는 저장되며, 모바일은 별도 상태로 처음에는 접혀 있습니다.
- **날짜/기간 노트**: 날짜 파일명과 기간 파일명을 기준으로 노트를 플래너 칩으로 표시합니다. 기본값은 볼트 전체 스캔이며, 설정에서 플래너 폴더 안으로만 제한할 수 있습니다.
- **반복 이벤트**: 양력 또는 보조 역법을 기준으로 N일·주·월·년마다 반복합니다. 발생분은 선택해 Markdown 노트로 만들기 전까지 가상 일정으로 유지됩니다.
- **색상, 할 일, 완료 상태**: 프런트매터의 `color`, `todo`, `completed` 값을 칩 스타일과 라벨에 반영합니다.
- **공휴일 오버레이**: 지원 UI 언어권의 국가별 공휴일을 표시하고 공휴일 배지를 선택해 이름을 확인합니다.
- **보조 역법 라벨**: 한국식 음력, 중국식 음력, 단기, 히브리력, 이슬람력, 페르시아력, 인도 국민력, 불기, 일본 연호, 민국력, 콥트력, 에티오피아력 중 하나를 보조 날짜로 표시합니다.
- **커스텀 캘린더 오버레이**: 판타지 세계관이나 캠페인용 캘린더 프로필을 만들고, 월 길이/요일/간단한 윤일 규칙을 바탕으로 플래너 셀에 커스텀 날짜 라벨을 표시합니다. 노트 파일명은 기존 `YYYY-MM-DD` 형식을 유지합니다.
- **외부 캘린더 오버레이**: `webcal://` 또는 `https://` `.ics` 피드를 추가하고, 수동 또는 주기 새로고침으로 불러온 일정을 각 플래너에 읽기 전용 칩과 범위 막대로 표시합니다. 필요한 일정만 골라 일반 Markdown 노트로 만들 수 있습니다.
- **범위가 제한된 스타일**: Diary CSS는 플래너 보기, 설정 패널, 플러그인 모달에만 적용되어 일반 볼트 문서의 스타일을 바꾸지 않습니다.
- **로컬 알림**: `notify_minutes`가 있는 날짜 노트는 Obsidian이 열려 있을 때 해당 날짜와 시간에 Notice를 표시합니다.
- **플래너 클립보드**: 데스크톱에서 선택한 날짜/노트를 복사, 붙여넣기, 삭제, 붙여넣기 취소할 수 있습니다.
- **키보드와 접근성 지원**: 날짜 셀, 칩, 기간 막대, 공휴일 배지, 플래너 라벨, 월간 목록 행을 키보드로 실행할 수 있고 접근성 라벨을 제공합니다.
- **모바일 최적화**: 월간 그리드에서 핀치 줌, 확대 초기화, 일자 요약 시트를 지원합니다.

## 설치

1. [Releases](https://github.com/POBSIZ/obsidian-diary/releases)에서 최신 릴리스를 다운로드합니다.
2. `main.js`, `manifest.json`, `styles.css`를 볼트의 `Vault/.obsidian/plugins/diary/` 폴더에 복사합니다.
3. Obsidian에서 **Settings → Community plugins**를 엽니다.
4. Restricted mode가 켜져 있다면 신뢰하는 vault에서만 끄고, **Diary**를 활성화합니다.
5. 왼쪽 리본 아이콘 또는 커맨드 팔레트에서 플래너를 엽니다. 월간 리본 아이콘은 오른쪽 사이드바 플래너를 엽니다.

## 빠른 시작

1. 사이드 플래너는 **Open monthly planner in sidebar**, 전체 작업 영역 탭은 **Open monthly planner** 명령을 실행합니다.
2. 상단의 파일 추가 버튼을 선택하거나 날짜 셀을 선택합니다.
3. **Single date** 또는 **Range**를 고릅니다.
4. 폴더, 날짜, 파일 이름, 색상, 할 일 여부, 알림 시간을 입력합니다.
5. **Create**를 선택하면 Markdown 노트가 만들어지고 플래너에 칩 또는 기간 막대로 표시됩니다.

생성된 노트는 일반 Markdown 파일입니다. 플러그인을 끄더라도 볼트 안의 파일은 그대로 남습니다.

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

Diary는 작업 공간이 준비되면 오른쪽 사이드바에 컴팩트 월간 플래너를 하나 만듭니다. **Open monthly planner in sidebar** 명령이나 월간 리본 아이콘으로 다시 표시할 수 있습니다.

사이드 플래너는 보조 뷰로 동작합니다.

- 컴팩트 월간 레이아웃과 일자 요약 시트를 사용합니다.
- 사이드바에서 플래너 노트를 선택하면 파일은 메인 작업 영역에 열려, 사이드바 플래너가 계속 보입니다.
- 레이아웃 전환 버튼으로 같은 사이드 리프 안에서 연간, 월간 그리드, 월간 목록을 순환합니다.
- 이전 버전에서 생긴 오른쪽 사이드바 월간 플래너가 있으면 하나의 사이드 플래너만 남도록 정리합니다.

## 월간 목록 필터

월간 목록에는 세 가지 필터가 있습니다.

- **전체**: 선택한 달의 모든 날짜를 표시합니다.
- **노트 있음**: 단일 날짜 노트나 기간 노트가 있는 날짜만 표시합니다.
- **오늘 이후**: 선택한 달에서 오늘과 이후 날짜만 표시합니다.

월간 목록을 현재 달로 열면 오늘 행이 자동으로 보이도록 스크롤됩니다. 현재 달 버튼을 선택해도 오늘 행으로 돌아갑니다.

## 외부 캘린더 피드

**Settings → Diary → External calendars**에서 공개된 `webcal://` URL 또는 `https://` `.ics` URL을 추가합니다.

- 피드 URL은 로컬 플러그인 데이터에 저장되며 볼트 동기화 설정에 따라 다른 기기로 전송될 수 있습니다. 비공개 iCal URL은 접근 토큰처럼 다루세요.
- Diary는 local/private network 캘린더 URL을 거부합니다.
- 피드 이름, 색상, 설명 포함 여부, 새로고침 주기, 표시할 플래너 화면을 정할 수 있습니다.
- 새 피드는 기본적으로 60분마다 새로고침하며 연간, 월간 그리드, 월간 목록, 사이드바에 표시됩니다. 필요하면 수동 새로고침만 사용하거나 화면별 표시를 끌 수 있습니다.
- 외부 일정은 점선으로 구분되는 읽기 전용 오버레이입니다. 드래그, 클립보드, 할 일, 색상 수정 기능은 적용되지 않습니다.
- 외부 일정을 선택하면 상세 모달에서 **Markdown 노트 만들기**, **캘린더 새로고침**, **상세 복사**를 실행할 수 있습니다. 버튼에는 현지화된 라벨과 눌림·로딩·완료 상태가 표시됩니다.
- 외부 일정으로 Markdown 노트를 만들면 연결 정보를 프런트매터에 저장하고, 같은 외부 일정이 오버레이에 중복 표시되지 않도록 숨깁니다.

## 노트 만들기

### 단일 날짜 노트

날짜 셀을 선택하거나 파일 추가 버튼을 선택한 뒤 **Single date**를 사용합니다.

- 기본 파일명은 `YYYY-MM-DD.md`입니다.
- 접미사를 붙이면 칩 제목으로 사용됩니다. 예: `2026-05-19-mobile-qa.md` -> `mobile-qa`
- 색상을 지정하면 칩 왼쪽 선이나 모바일 점 색상으로 표시됩니다.
- **Todo file**을 켜면 칩에 할 일 상태가 표시됩니다.
- **Reminder time**을 입력하면 `notify_minutes` frontmatter로 저장됩니다.
- **Repeat**를 켠 뒤 **매일**, **매주**, **매월**, **매년** 중 하나와 1~999 사이의 반복 간격, 기준 역법, 선택형 종료일을 고릅니다. N일·주·월·년마다 반복할 수 있으며 종료일 당일도 포함됩니다. 이후 발생분은 파일을 만들지 않고 플래너에 가상 일정으로 표시됩니다.

### 기간 노트

데스크톱에서는 날짜 셀을 드래그해 범위를 선택하면 **Range** 모달이 열립니다. 모바일에서는 파일 추가 버튼을 선택한 뒤 **Range**를 고르고 시작일과 종료일을 직접 입력합니다.

- 파일명 형식은 `YYYY-MM-DD--YYYY-MM-DD.md`입니다.
- 접미사를 붙이면 기간 제목으로 사용됩니다. 예: `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- 생성 시 `date_start`, `date_end` frontmatter가 자동으로 저장됩니다.
- 연간 플래너에는 세로 막대와 시작일 칩으로, 월간 그리드/목록에는 기간 막대로 표시됩니다.
- **종일**을 선택하면 두 시간을 모두 비우고, 시간을 지정할 때는 `date_start` + `start_time`부터 `date_end` + `end_time`까지 하나의 연속 구간으로 저장되도록 두 시간을 모두 입력합니다.
- 일별/3일 플래너는 종일 기간을 날짜를 가로지르는 막대로 표시합니다. 종일 기간을 시간축에 드래그해 시간을 지정한 뒤 첫날 또는 마지막 날의 경계를 드래그하면 해당 날짜와 시간을 함께 바꿀 수 있습니다.

### 플랜 노트

플래너 상단의 플랜 노트 패널에서 연간/월간 메모를 만들 수 있습니다.

- 연간 플랜 노트: `{plannerFolder}/{year}.md`
- 월간 플랜 노트: `{plannerFolder}/{year}-{month}.md`
- 패널은 접거나 펼칠 수 있으며 이 상태는 플러그인 데이터에 저장됩니다.
- 데스크톱과 모바일은 패널 상태를 따로 저장합니다. 데스크톱은 기본 펼침, 모바일은 사용자가 펼치기 전까지 기본 접힘입니다.
- 기존 플랜 노트가 있으면 미리보기와 열기 버튼이 표시됩니다.

## 노트 수정

플래너에 표시된 칩이나 기간 막대를 선택하면 파일 옵션 모달이 열립니다.

- **Single date**와 **Range** 모드 전환
- 기존 폴더 선택 또는 사용자 지정 폴더 경로 입력
- 날짜·기간과 제목 접미사를 포함한 전체 파일 이름 수정
- 시작일과 종료일 변경 및 파일 이름 자동 동기화
- 칩 색상 변경
- 할 일 / 완료 상태 변경
- 알림 시간 변경
- 파일 미리보기
- 파일 열기
- 파일 삭제

변경 사항을 적용하면 Markdown 파일을 이동하거나 이름을 바꿉니다. 기간으로 전환하면 `date_start`, `date_end`를 기록하고, 단일 날짜로 되돌리면 두 필드를 제거합니다. 대상 폴더에 같은 이름의 파일이 있으면 변경하지 않습니다.

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
| Planner note scan scope | Diary가 플래너 노트를 볼트 전체에서 찾을지, **Planner folder**와 그 하위 폴더에서만 찾을지 정합니다. 기본값은 `Entire vault`입니다. |
| Date format | 날짜 형식 저장값입니다. 현재 플래너 파일명은 `YYYY-MM-DD` 규칙을 사용합니다. |
| Show holidays | 공휴일 표시를 켜거나 끕니다. |
| Holiday country | 공휴일 국가입니다. `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW`, `None`을 지원합니다. |
| Calendar overlay | 연간, 월간 그리드, 월간 목록, 일자 요약, 사이드바 플래너에 표시할 기본 제공 보조 역법 또는 커스텀 캘린더 프로필 하나를 선택합니다. 기본값은 `표시 안 함`입니다. |
| Custom calendars | 판타지/캠페인용 로컬 캘린더 프로필입니다. 월 길이, 요일 이름, 기준 양력 날짜와 커스텀 날짜의 연결, 라벨 형식, 간단한 윤일 규칙을 정의할 수 있습니다. |
| External calendars | 사용자가 추가하는 `webcal://` 또는 `https://` `.ics` feed입니다. feed별 활성 상태, 색상, 새로고침 주기, description 포함 여부, 화면별 표시 여부를 설정합니다. |
| Mobile bottom padding | 모든 모바일 플래너의 최소 하단 여백입니다. 설정값이 작아도 navbar와 safe area 자동 여백은 계속 적용됩니다. |
| Mobile cell width | 모바일 연간 플래너의 월 셀 너비입니다. `0`이면 기본값을 사용합니다. |
| 피드백 및 지원 | 피드백, 버그 신고, 기능 제안을 위한 공개 GitHub 양식을 엽니다. |

Diary는 플러그인 데이터에 UI 전용 상태도 저장합니다. 플랜 노트 미리보기 펼침 상태, 모바일 플랜 노트 미리보기 펼침 상태, 연간 플래너에서 펼친 월 셀 너비가 여기에 포함됩니다.

## 프런트매터 참고

| 키 | 설명 |
| --- | --- |
| `color` | 칩 색상입니다. 유효한 CSS 색상 문자열을 사용할 수 있습니다. 예: `#22c55e`, `red`, `rgb(34, 197, 94)` |
| `todo` | `true`이면 할 일 칩으로 표시됩니다. |
| `completed` | `todo: true`일 때 완료 상태를 표시합니다. |
| `start_time` | 선택 사항인 칩 시작 시간(`HH:mm`)입니다. 기간 노트에서는 `date_start` 날짜의 시간 경계이며, 두 시간은 모두 입력하거나 모두 비워야 합니다. |
| `end_time` | 선택 사항인 칩 종료 시간(`HH:mm`)입니다. 기간 노트에서는 `date_end` 날짜의 시간 경계이며, 리마인더를 실행하지 않습니다. |
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
| `diary_external_calendar` | 외부 일정에서 생성한 Markdown 노트에 저장되는 외부 캘린더 피드 ID입니다. |
| `diary_external_event_uid` | 생성된 노트를 외부 피드 일정과 연결하기 위한 이벤트 UID입니다. |
| `diary_external_event_instance` | 외부 일정의 인스턴스 키입니다. 보통 일정 시작 날짜와 시간입니다. |
| `diary_external_event_source` | 중복 overlay를 숨기는 데 쓰는 안정적인 연결 key입니다. |
| `diary_external_event_linked_at` | 외부 일정에서 Markdown 노트를 만든 시각의 ISO timestamp입니다. |

알림은 OS 수준 예약 알림이 아닙니다. Obsidian이 열려 있는 동안 플러그인이 약 15초 간격으로 확인하고, 이벤트 날짜의 해당 분에 Obsidian Notice를 표시합니다.

반복 발생분은 기본적으로 가상 일정입니다. 플래너 모달에서 노트로 만들 때 같은 `recurrence_id` 발생분이 이미 있으면 해당 노트를 사용하고, 대상 경로가 일반 노트이거나 다른 시리즈이면 덮어쓰지 않습니다.

## 파일명 규칙

Diary는 기본적으로 볼트 전체의 Markdown 파일을 스캔해 아래 파일명 규칙과 맞는 노트를 플래너에 표시합니다. 설정에서 스캔 범위를 **Planner folder**와 그 하위 폴더로 제한할 수 있습니다. 새로 만드는 노트는 기본적으로 **Planner folder**에 생성됩니다.

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
2. 프런트매터 `title`
3. 첫 번째 Markdown 제목
4. 기본 파일명

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

디자인 문서 검증:

```bash
npm run design:lint
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
- 이 저장소는 태그된 소스에서 `main.js`, `manifest.json`, `styles.css`를 GitHub Actions로 빌드한 뒤 개별 릴리스 에셋으로 게시합니다.

## 피드백 및 지원

- [피드백 보내기](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feedback.yml)
- [버그 신고](https://github.com/POBSIZ/obsidian-diary/issues/new?template=bug_report.yml)
- [기능 제안](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feature_request.yml)

이 링크는 공개 GitHub 이슈를 열며 GitHub 계정이 필요합니다. 비공개 볼트 내용, 캘린더 URL, 액세스 토큰 또는 기타 민감한 정보를 포함하지 마세요.

## 개인정보 보호와 네트워크

- 플래너 기능은 볼트 안의 로컬 Markdown 파일을 기준으로 동작합니다.
- 숨겨진 telemetry나 analytics가 없습니다.
- 공휴일과 캘린더 오버레이 계산은 번들된 의존성, 브라우저 제공 데이터, 로컬에 저장한 프로필을 사용하며, 플래너 표시를 위해 볼트 내용을 외부 서비스로 보내지 않습니다.
- 외부 캘린더 피드는 사용자가 직접 추가한 경우에만 네트워크 요청을 보냅니다. Diary는 추가된 피드 URL만 가져오고 일정 캐시를 플러그인 데이터에 저장합니다. 사용자가 **Markdown 노트 만들기**를 선택하기 전에는 볼트 파일을 만들지 않습니다.
- 로컬 알림은 Obsidian 안에서 처리하며 reminder 데이터를 네트워크로 전송하지 않습니다.

## 문제 해결

- 플러그인이 보이지 않으면 `main.js`, `manifest.json`, `styles.css`가 `Vault/.obsidian/plugins/diary/` 바로 아래에 있는지 확인합니다.
- 명령이 보이지 않으면 **Settings → Community plugins**에서 **Diary**가 활성화되어 있는지 확인합니다.
- 사이드바 플래너가 보이지 않으면 **Open monthly planner in sidebar** 명령을 실행하거나 플러그인을 활성화한 뒤 Obsidian을 다시 로드합니다.
- 칩이 표시되지 않으면 파일명이 `YYYY-MM-DD` 또는 `YYYY-MM-DD--YYYY-MM-DD` 규칙을 따르는지 확인합니다.
- 자동으로 확보된 모바일 내비게이션 여백보다 더 넓은 공간이 필요하면 **Mobile bottom padding** 값을 키웁니다.
- 알림이 오지 않으면 Obsidian이 열려 있는지, 노트의 이벤트 날짜가 오늘인지, `notify_minutes` 값이 `0-1439` 범위인지 확인합니다.

## 라이선스

`LICENSE` 파일을 참고하세요.
