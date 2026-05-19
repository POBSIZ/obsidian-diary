# Diary

Diary is an Obsidian community plugin for date-based planning in Markdown.

Diary는 Obsidian vault 안의 Markdown 파일을 날짜 기반 플래너로 보여주는 커뮤니티 플러그인입니다.

📖 Full documentation: [English](docs/en/README.md) | [한국어](docs/ko/README.md)

## Snapshot

| Item | Value |
| --- | --- |
| Plugin ID | `diary` |
| Version | `1.0.10` |
| Minimum Obsidian version | `1.7.2` |
| Platforms | Desktop and mobile (`isDesktopOnly: false`) |
| Default language | `en` |
| Default planner folder | `Planner` |

## Screenshots

Captured from a fresh demo vault with sample planner notes.

![Monthly grid planner](docs/assets/screenshots/monthly-grid.png)

| Yearly planner | Monthly list |
| --- | --- |
| ![Yearly planner](docs/assets/screenshots/yearly-planner.png) | ![Monthly list planner](docs/assets/screenshots/monthly-list.png) |

| Mobile monthly grid | Mobile monthly list |
| --- | --- |
| ![Mobile monthly grid](docs/assets/screenshots/mobile-monthly-grid.png) | ![Mobile monthly list planner](docs/assets/screenshots/mobile-monthly-list.png) |

## What It Does

- Yearly planner: `12 months x 31 days` overview.
- Monthly grid planner: one-month calendar view with date chips, range bars, holidays, and mobile pinch zoom.
- Monthly list planner: day-by-day list for dense monthly review.
- Date notes and range notes: recognized by `YYYY-MM-DD` and `YYYY-MM-DD--YYYY-MM-DD` filenames.
- Plan notes: yearly `{plannerFolder}/{year}.md` and monthly `{plannerFolder}/{year}-{month}.md` notes.
- Chip metadata: `color`, `todo`, `completed`, `notify_minutes`, `title`, `date_start`, and `date_end` frontmatter.
- Desktop workflows: drag range selection, chip drag-to-move, planner copy/paste/delete/undo.
- Mobile workflows: tap a day to open the day summary sheet, create notes from the sheet, and adjust mobile spacing in settings.

## Quick Usage

1. Enable **Diary** in **Settings -> Community plugins**.
2. Run **Open monthly planner**, **Open yearly planner**, or **Open monthly list planner** from the command palette.
3. Select a date cell or the add-file button.
4. Choose **Single date** or **Range**, then set the folder, dates, filename, color, todo state, and reminder time.
5. Select **Create**. Diary creates an ordinary Markdown note and renders it in the planner.

한국어 빠른 사용법:

1. **Settings -> Community plugins**에서 **Diary**를 활성화합니다.
2. 커맨드 팔레트에서 **Open monthly planner**, **Open yearly planner**, **Open monthly list planner** 중 하나를 실행합니다.
3. 날짜 셀 또는 파일 추가 버튼을 선택합니다.
4. **Single date** 또는 **Range**를 고르고 폴더, 날짜, 파일명, 색상, todo 여부, 알림 시간을 입력합니다.
5. **Create**를 선택하면 Markdown 노트가 생성되고 플래너에 표시됩니다.

## Install

1. Download the latest release from [Releases](https://github.com/POBSIZ/obsidian-diary/releases).
2. Copy `main.js`, `manifest.json`, and `styles.css` to `Vault/.obsidian/plugins/diary/`.
3. Enable **Diary** in **Settings -> Community plugins**.

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

## Repository Map

- `src/main.ts`: plugin lifecycle, view registration, commands, refresh wiring.
- `src/settings.ts`: settings schema/defaults and settings tab UI.
- `src/views/yearly-planner/*`: yearly calendar UI, interactions, modals, file operations.
- `src/views/monthly-planner/*`: monthly grid UI, mobile pinch zoom, interactions.
- `src/views/monthly-list-planner/*`: monthly list UI and interactions.
- `src/views/planner-clipboard.ts`: multi-select copy/paste/delete/undo flow.
- `src/planner-reminders.ts`: runtime reminders based on `notify_minutes`.
- `src/i18n.ts`, `locales/*`: English and Korean localization.
- `styles.css`: shared styling tokens and per-view UI styles.

## Release

- Release workflow: `.github/workflows/release.yml`
- Release assets: `main.js`, `manifest.json`, `styles.css`
- Build provenance attestation is generated during release workflow.

## License

See `LICENSE`.
