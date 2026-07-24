# Diary

Diary turns ordinary Markdown notes into yearly, monthly, daily, and 3-day planner views in Obsidian.

Diary는 Obsidian 볼트의 일반 Markdown 노트를 연간·월간·일간·3일 플래너로 보여주는 커뮤니티 플러그인입니다.

📖 Full documentation: [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## At a glance

| Item | Value |
| --- | --- |
| Plugin ID | `diary` |
| Version | `1.15.1` |
| Minimum Obsidian version | `1.7.2` |
| Platforms | Desktop and mobile (`isDesktopOnly: false`) |
| Default language | `en` |
| Default planner folder | `Planner` |

## What's new

- `1.15.1`: rewrites and streamlines the documentation in every supported language, with clearer terminology and shorter release notes.

Older changes are listed on the [Releases page](https://github.com/POBSIZ/obsidian-diary/releases).

## Screenshots

These screenshots use temporary demo notes for all-day, timed, range, todo, and plan entries. The demo folder was removed after capture.

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

| Yearly planner | Monthly list planner |
| --- | --- |
| ![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png) | ![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png) |

| Daily timeline | 3-day timeline |
| --- | --- |
| ![Daily timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3-day timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

| Narrow monthly grid | Narrow monthly list |
| --- | --- |
| ![Narrow monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Narrow monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## Features

- Yearly planner: `12 months × 31 days` overview.
- Localized UI: switch Diary between English, German, Spanish, French, Japanese, Simplified Chinese, Traditional Chinese, and Korean.
- Monthly grid planner: one-month calendar view with date chips, range bars, holidays, calendar overlay labels, external calendar overlays, and mobile pinch zoom.
- Monthly list planner: day-by-day list for dense monthly review, with `All`, `With notes`, and `Upcoming` filters.
- Daily planner: a 24-hour timeline that separates timed plans from all-day and untimed notes. Multi-day ranges render as continuous all-day bars or datetime slices, with cross-date time selection and boundary resizing. Select an empty time slot to create a note with start and end times prefilled.
- 3-day planner: compare three consecutive days in parallel columns on the same 24-hour timeline. Narrow screens keep readable column widths with horizontal scrolling.
- Direct view selector: switch directly among yearly, monthly grid, monthly list, daily, and 3-day views. In narrow layouts it remains visible while secondary actions move into **More**.
- Sidebar planner: a compact monthly planner opens in the right sidebar by default, can be revealed from the ribbon or command palette, and can cycle through yearly, monthly grid, and monthly list layouts in the same side leaf.
- Date notes and range notes: recognized by `YYYY-MM-DD` and `YYYY-MM-DD--YYYY-MM-DD` filenames. By default Diary scans the entire vault, with an optional planner-folder-only scope. Title suffixes can keep visible spaces.
- File options: switch an existing planner note between single-date and range modes, choose its folder, and edit the complete date-based filename. Diary moves the file and synchronizes `date_start` / `date_end` metadata.
- Range title continuity: monthly range bars repeat their title at new week and month boundaries, while yearly cells repeat it at month and year boundaries.
- Plan notes: yearly `{plannerFolder}/{year}.md` and monthly `{plannerFolder}/{year}-{month}.md` notes, with persisted preview state on desktop and separate mobile state.
- Remembered yearly cell width: expanded month-cell widths are saved across reloads.
- Chip metadata: `color`, `todo`, `completed`, `start_time`, `end_time`, `notify_minutes`, `title`, `date_start`, `date_end`, and recurrence frontmatter. For range files, `date_start` + `start_time` and `date_end` + `end_time` define one continuous datetime interval; times remain independent from reminders.
- Recurring events: repeat every N days, weeks, months, or years with a Gregorian or alternate-calendar basis. Occurrences stay virtual until you explicitly create Markdown notes from them.
- Custom calendar overlays: create local fantasy/campaign calendar profiles and show one custom label in planner cells while keeping normal `YYYY-MM-DD` files.
- External calendar overlays: add opt-in `webcal://` or `https://` `.ics` feeds, refresh them manually or on an interval, and show events as read-only chips/ranges. Select an external event only when you want to create a normal Markdown note for it.
- Scoped styling: Diary's CSS is limited to planner views, settings panels, and plugin modals so it does not restyle ordinary vault content.
- Desktop workflows: right-sidebar companion planner, drag range selection, chip drag-to-move, keyboard activation, internal planner copy/paste/delete/undo.
- Mobile workflows: tap a day to open the day summary sheet, create notes from the sheet, pinch zoom the monthly grid, and keep planner content and menus above standard or floating Obsidian navigation with an adjustable minimum bottom gap.

## Quick start

1. Enable **Diary** in **Settings → Community plugins**.
2. Run **Open monthly planner in sidebar**, **Open monthly planner**, **Open yearly planner**, **Open monthly list planner**, **Open daily planner**, or **Open 3-day planner** from the command palette.
3. Select a date cell or the add-file button.
4. Choose **Single date** or **Range**, then set the folder, dates, filename, color, todo state, reminder time, and optional every-N-days/weeks/months/years repeat rule, calendar, and end date.
5. Select **Create**. Diary creates an ordinary Markdown note and renders it in the planner.

한국어로 빠르게 시작하기:

1. **Settings → Community plugins**에서 **Diary**를 활성화합니다.
2. 커맨드 팔레트에서 **Open monthly planner in sidebar**, **Open monthly planner**, **Open yearly planner**, **Open monthly list planner**, **Open daily planner**, **Open 3-day planner** 중 하나를 실행합니다.
3. 날짜 셀 또는 파일 추가 버튼을 선택합니다.
4. **Single date** 또는 **Range**를 고르고 폴더, 날짜, 파일명, 색상, todo 여부, 알림 시간, N일·주·월·년 반복 간격/역법/종료일을 입력합니다.
5. **Create**를 선택하면 Markdown 노트가 생성되고 플래너에 표시됩니다.

## Install

1. Download the latest release from [Releases](https://github.com/POBSIZ/obsidian-diary/releases).
2. Copy `main.js`, `manifest.json`, and `styles.css` to `Vault/.obsidian/plugins/diary/`.
3. Enable **Diary** in **Settings → Community plugins**.

## Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

Design document lint:

```bash
npm run design:lint
```

Test:

```bash
npm test
```

## Repository layout

- `src/main.ts`: plugin lifecycle, view registration, sidebar planner setup, commands, refresh wiring.
- `src/settings.ts`: settings schema/defaults and settings tab UI.
- `src/views/yearly-planner/*`: yearly calendar UI, interactions, modals, file operations.
- `src/views/monthly-planner/*`: monthly grid UI, sidebar compact layout, mobile pinch zoom, interactions.
- `src/views/monthly-list-planner/*`: monthly list UI, filters, and interactions.
- `src/views/*/sidebar-view.ts`: compact side-leaf variants for planner views.
- `src/views/planner-clipboard.ts`: multi-select copy/paste/delete/undo flow.
- `src/views/planner-components.ts`, `src/views/planner-dom.ts`: shared planner chips, badges, labels, and pointer/DOM lookup helpers.
- `src/views/planner-layout.ts`, `src/views/plan-note-panel.ts`: shared headers, filters, container/scroll restoration, and reusable plan-note panels.
- `src/ui/components.ts`: shared buttons, button rows, fields, disclosures, badges, errors, and press feedback for planner, modal, and settings surfaces.
- `src/planner-reminders.ts`: runtime reminders based on `notify_minutes`.
- `src/i18n.ts`, `locales/*`: English, German, Spanish, French, Japanese, Simplified Chinese, Traditional Chinese, and Korean localization.
- `docs/*/README.md`: full documentation for each supported UI language.
- `design.md`: current planner design rules; runtime tokens and component primitives live in `styles.css`, `src/ui/components.ts`, and `src/views/planner-components.ts`.
- `styles.css`: shared styling tokens and per-view UI styles.

## Release

- Release workflow: `.github/workflows/release.yml`
- Release assets: `main.js`, `manifest.json`, `styles.css`
- Version bump helper: `npm version patch|minor|major --no-git-tag-version`
- Release assets are built from the tagged source in GitHub Actions and uploaded directly to the matching GitHub release.

## Feedback and support

- [Share feedback](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feedback.yml)
- [Report a bug](https://github.com/POBSIZ/obsidian-diary/issues/new?template=bug_report.yml)
- [Suggest a feature](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feature_request.yml)

These links open public GitHub issues and require a GitHub account. Do not include private vault content, calendar URLs, access tokens, or other sensitive information.

## License

See `LICENSE`.
