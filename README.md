# Diary

Diary is an Obsidian community plugin for date-based planning in Markdown.

Diary는 Obsidian vault 안의 Markdown 파일을 날짜 기반 플래너로 보여주는 커뮤니티 플러그인입니다.

📖 Full documentation: [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## Snapshot

| Item | Value |
| --- | --- |
| Plugin ID | `diary` |
| Version | `1.5.0` |
| Minimum Obsidian version | `1.7.2` |
| Platforms | Desktop and mobile (`isDesktopOnly: false`) |
| Default language | `en` |
| Default planner folder | `Planner` |

## Latest Version

- `1.5.0`: adds German, Spanish, French, Japanese, Simplified Chinese, Traditional Chinese, and Korean UI language support alongside English.
- `1.4.2`: narrows Diary styles to planner, settings, and modal surfaces and adds localized labels for color preset buttons.
- `1.4.1`: polishes external calendar event actions, press feedback, and success/error notices.
- `1.4.0`: adds custom calendar overlay controls and opt-in external calendar feeds. External `webcal://` or `https://` `.ics` events render as read-only planner overlays until you choose one and create a Markdown note.
- `1.3.6`: maintenance release that stabilizes typed community-plugin audit checks.
- `1.3.5`: maintenance release that aligns Obsidian plugin lint and release validation.
- `1.3.4`: maintenance release with explicit TypeScript project wiring for typed ESLint checks and pinned lint tooling for reproducible source validation.
- `1.3.3`: maintenance release with stricter type-aware ESLint safety checks enabled for community-plugin source validation.
- `1.3.2`: maintenance release with documentation, agent guidance, ESLint config typing, and TypeScript lib target cleanup.
- `1.3.1`: release with pinned Obsidian typings, dependency lockfile maintenance, ESLint compatibility updates, and recurrence chip styling cleanup.
- `1.3.0`: added recurring events and alternate calendar labels across yearly, monthly grid, monthly list, and sidebar planner views.
- `1.2.1`: maintenance release with Obsidian community-plugin lint compatibility and bundled holiday dependency maintenance. User workflows are unchanged from `1.2.0`.
- `1.2.0`: added the right sidebar planner, including automatic sidebar setup, a dedicated **Open monthly planner in sidebar** command, and side-leaf layout switching.

## Screenshots

Captured from a fresh demo vault with sample planner notes. The main screenshots
show full-size planner layouts; the right sidebar planner reuses the monthly
grid in compact form.

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

| Yearly planner | Monthly list |
| --- | --- |
| ![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png) | ![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png) |

| Mobile monthly grid | Mobile monthly list |
| --- | --- |
| ![Mobile monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Mobile monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## What It Does

- Yearly planner: `12 months x 31 days` overview.
- Localized UI: switch Diary between English, German, Spanish, French, Japanese, Simplified Chinese, Traditional Chinese, and Korean.
- Monthly grid planner: one-month calendar view with date chips, range bars, holidays, calendar overlay labels, external calendar overlays, and mobile pinch zoom.
- Monthly list planner: day-by-day list for dense monthly review, with `All`, `With notes`, and `Upcoming` filters.
- Sidebar planner: a compact monthly planner opens in the right sidebar by default, can be revealed from the ribbon or command palette, and can cycle through yearly, monthly grid, and monthly list layouts in the same side leaf.
- Date notes and range notes: recognized by `YYYY-MM-DD` and `YYYY-MM-DD--YYYY-MM-DD` filenames. By default Diary scans the entire vault, with an optional planner-folder-only scope. Title suffixes can keep visible spaces.
- Plan notes: yearly `{plannerFolder}/{year}.md` and monthly `{plannerFolder}/{year}-{month}.md` notes, with persisted preview state on desktop and separate mobile state.
- Remembered yearly cell width: expanded month-cell widths are saved across reloads.
- Chip metadata: `color`, `todo`, `completed`, `notify_minutes`, `title`, `date_start`, `date_end`, and recurrence frontmatter.
- Recurring events: repeat a note daily, monthly, or yearly with a Gregorian or alternate-calendar basis. Diary materializes only the occurrences inside the planner range you are currently viewing.
- Custom calendar overlays: create local fantasy/campaign calendar profiles and show one custom label in planner cells while keeping normal `YYYY-MM-DD` files.
- External calendar overlays: add opt-in `webcal://` or `https://` `.ics` feeds, refresh them manually or on an interval, and show events as read-only chips/ranges. Select an external event only when you want to create a normal Markdown note for it.
- Scoped styling: Diary's CSS is limited to planner views, settings panels, and plugin modals so it does not restyle ordinary vault content.
- Desktop workflows: right-sidebar companion planner, drag range selection, chip drag-to-move, keyboard activation, internal planner copy/paste/delete/undo.
- Mobile workflows: tap a day to open the day summary sheet, create notes from the sheet, pinch zoom the monthly grid, and adjust mobile spacing in settings.

## Quick Usage

1. Enable **Diary** in **Settings → Community plugins**.
2. Run **Open monthly planner in sidebar**, **Open monthly planner**, **Open yearly planner**, or **Open monthly list planner** from the command palette.
3. Select a date cell or the add-file button.
4. Choose **Single date** or **Range**, then set the folder, dates, filename, color, todo state, reminder time, and optional repeat frequency/calendar.
5. Select **Create**. Diary creates an ordinary Markdown note and renders it in the planner.

한국어 빠른 사용법:

1. **Settings → Community plugins**에서 **Diary**를 활성화합니다.
2. 커맨드 팔레트에서 **Open monthly planner in sidebar**, **Open monthly planner**, **Open yearly planner**, **Open monthly list planner** 중 하나를 실행합니다.
3. 날짜 셀 또는 파일 추가 버튼을 선택합니다.
4. **Single date** 또는 **Range**를 고르고 폴더, 날짜, 파일명, 색상, todo 여부, 알림 시간, 반복 주기/역법을 입력합니다.
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

Test:

```bash
npm test
```

## Repository Map

- `src/main.ts`: plugin lifecycle, view registration, sidebar planner setup, commands, refresh wiring.
- `src/settings.ts`: settings schema/defaults and settings tab UI.
- `src/views/yearly-planner/*`: yearly calendar UI, interactions, modals, file operations.
- `src/views/monthly-planner/*`: monthly grid UI, sidebar compact layout, mobile pinch zoom, interactions.
- `src/views/monthly-list-planner/*`: monthly list UI, filters, and interactions.
- `src/views/*/sidebar-view.ts`: compact side-leaf variants for planner views.
- `src/views/planner-clipboard.ts`: multi-select copy/paste/delete/undo flow.
- `src/planner-reminders.ts`: runtime reminders based on `notify_minutes`.
- `src/i18n.ts`, `locales/*`: English, German, Spanish, French, Japanese, Simplified Chinese, Traditional Chinese, and Korean localization.
- `styles.css`: shared styling tokens and per-view UI styles.

## Release

- Release workflow: `.github/workflows/release.yml`
- Release assets: `main.js`, `manifest.json`, `styles.css`
- Version bump helper: `npm version patch|minor|major --no-git-tag-version`
- Build provenance attestation is generated during release workflow.

## License

See `LICENSE`.
