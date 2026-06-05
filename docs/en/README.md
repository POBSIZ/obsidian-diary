# Diary (English)

Diary is an Obsidian community plugin that turns Markdown files in your vault into date-based planner views. It helps you move between a yearly overview, a monthly grid, and a monthly list while managing single-date notes, range notes, monthly/yearly plan notes, holidays, todo state, and local reminders.

한국어 문서: [docs/ko/README.md](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## Current Info

| Item | Value |
| --- | --- |
| Plugin ID | `diary` |
| Current version | `1.2.1` |
| Minimum Obsidian version | `1.7.2` |
| Supported platforms | Desktop / mobile (`isDesktopOnly: false`) |
| Default language | `en` |
| Default planner folder | `Planner` |

## Latest Version

- `1.2.1`: Current maintenance release with Obsidian community-plugin lint compatibility and bundled holiday dependency maintenance. User workflows are unchanged from `1.2.0`.
- `1.2.0`: Introduced the right sidebar planner, automatic sidebar setup, the **Open monthly planner in sidebar** command, and side-leaf switching between yearly, monthly grid, and monthly list layouts.

## Screenshots

The images below were captured from a fresh demo vault with sample planner notes created for this README. The mobile images were captured at a mobile viewport width in the demo vault with the plugin's mobile rendering path enabled. The right sidebar planner uses the same monthly grid in compact mode, so the full-size monthly grid screenshot remains the canonical visual reference.

### Desktop

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

### Mobile

| Monthly grid and day summary | Monthly list |
| --- | --- |
| ![Mobile monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Mobile monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## Key Features

- **Yearly planner**: View date notes and range notes in a `12 months x 31 days` table.
- **Monthly grid planner**: Inspect one month in a large calendar grid with chips, range bars, and holidays.
- **Monthly list planner**: Review busy months in a day-by-day vertical list with `All`, `With notes`, and `Upcoming` filters.
- **Right sidebar planner**: Keep a compact monthly planner open in the right sidebar while notes remain open in the main workspace.
- **Plan note panel**: Create and preview yearly notes (`YYYY.md`) and monthly notes (`YYYY-MM.md`) above the planner.
- **Date and range notes**: Display notes as planner chips based on single-date and date-range filenames. Diary scans the whole vault by default, or only the planner folder when configured.
- **Color, todo, and completion state**: Reflect `color`, `todo`, and `completed` frontmatter in chip styling and labels.
- **Holiday overlays**: Show country-specific public holidays and select holiday badges to see their names.
- **Local reminders**: Notes with `notify_minutes` show an Obsidian Notice on the event date while Obsidian is open.
- **Planner clipboard**: On desktop, copy, paste, delete, and undo pasted planner notes from selected dates or chips.
- **Keyboard and accessibility support**: Date cells, chips, range bars, holiday badges, planner labels, and monthly list rows expose keyboard activation and accessible labels.
- **Mobile optimization**: Monthly grid supports pinch zoom, reset zoom, and a day summary sheet.

## Install

1. Download the latest release from [Releases](https://github.com/POBSIZ/obsidian-diary/releases).
2. Copy `main.js`, `manifest.json`, and `styles.css` into `Vault/.obsidian/plugins/diary/`.
3. In Obsidian, open **Settings → Community plugins**.
4. If Restricted mode is enabled, turn it off only for vaults you trust, then enable **Diary**.
5. Open a planner from the left ribbon icons or the command palette. The monthly ribbon icon opens the right sidebar planner.

## Quick Start

1. Run the **Open monthly planner in sidebar** command for the side planner, or **Open monthly planner** for a full workspace tab.
2. Select the add-file button in the header or select a date cell.
3. Choose **Single date** or **Range**.
4. Enter the folder, dates, filename, color, todo state, and reminder time.
5. Select **Create**. Diary creates a Markdown note and displays it as a chip or range bar in the planner.

Created notes are ordinary Markdown files. They remain in your vault even if the plugin is disabled.

## Opening and Switching Views

Ribbon icons:

- `calendar-range`: open yearly planner in the main workspace
- `calendar-days`: open or reveal the monthly planner in the right sidebar
- `list-ordered`: open monthly list planner in the main workspace

Command palette:

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`

Select the repeat icon in any planner header to cycle the same leaf through this order.

```text
Yearly -> Monthly Grid -> Monthly List -> Yearly
```

Use previous/next buttons to move through years or months, and the calendar icon to return to the current year or month. Select the year or month label to type a specific value.

## Right Sidebar Planner

Diary creates one compact monthly planner in the right sidebar when the workspace is ready. Use **Open monthly planner in sidebar** or the monthly ribbon icon to reveal it again.

The side planner is designed as a companion view:

- It uses the compact monthly layout and day summary sheet.
- Selecting a planner note from the sidebar opens the file in the main workspace, so the sidebar remains available.
- The switch-layout button cycles the side leaf through yearly, monthly grid, and monthly list views.
- Diary keeps only one planner sidebar leaf and cleans up older right-sidebar monthly planner leaves from previous versions.

## Monthly List Filters

The monthly list has three filters:

- **All**: show every day in the selected month.
- **With notes**: show only days with single-date notes or range notes.
- **Upcoming**: show today and future dates in the selected month.

When the monthly list opens on the current month, Diary scrolls today's row into view. The current-month button also returns to today.

## Creating Notes

### Single-Date Notes

Select a date cell or the add-file button, then use **Single date**.

- The default filename is `YYYY-MM-DD.md`.
- Add a suffix to use it as the chip title. Example: `2026-05-19-mobile-qa.md` -> `mobile-qa`
- Set a color to display a chip border or mobile dot.
- Enable **Todo file** to show todo state on the chip.
- Set **Reminder time** to save `notify_minutes` frontmatter.

### Range Notes

On desktop, drag across date cells to prefill a **Range** modal. On mobile, select the add-file button, choose **Range**, and enter the start and end dates manually.

- The filename format is `YYYY-MM-DD--YYYY-MM-DD.md`.
- Add a suffix to use it as the range title. Example: `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- `date_start` and `date_end` frontmatter are saved automatically when the range note is created.
- The yearly planner shows range notes with vertical bars and a start-date chip. The monthly grid and list show them as range bars.

### Plan Notes

Use the plan note panel above each planner to create yearly or monthly planning notes.

- Yearly plan note: `{plannerFolder}/{year}.md`
- Monthly plan note: `{plannerFolder}/{year}-{month}.md`
- The panel can be collapsed or expanded, and that state is saved in plugin data.
- If the plan note already exists, Diary shows a preview and an open button.

## Editing Notes

Select a chip or range bar in the planner to open the file options modal.

- Check the file path
- Change the display title
- Change a single date or range dates
- Change the chip color
- Change todo / completed state
- Change reminder time
- Preview the file
- Open the file
- Delete the file

On desktop, drag a date chip or range bar to another date to move it. Range notes move by start date and keep the same duration. If the target path already exists, Diary does not move the file.

## Keyboard and Accessibility

- Press `Enter` or `Space` on a focused date cell, planner chip, range bar, holiday badge, monthly list row, year label, or month label to activate it.
- Planner controls use button roles, state labels, and `aria-label` text for screen readers.
- Monthly list filters expose tab-style selected state with `aria-selected`.
- Modal validation messages are announced with polite live regions.

## Planner Clipboard (Desktop)

In a planner view, hold `Cmd` on macOS or `Ctrl` on Windows/Linux while selecting dates or chips.

Diary keeps copied planner notes in an internal in-memory clipboard for the current Obsidian session. It does not read from or write to the system clipboard.

- `Cmd/Ctrl + click`: replace the current selection.
- `Cmd/Ctrl + Shift + click`: add to or remove from the current selection.
- `Cmd/Ctrl + C`: copy selected planner notes to Diary's internal clipboard.
- `Cmd/Ctrl + V`: paste to selected target dates.
- `Cmd/Ctrl + Delete` or `Cmd/Ctrl + Backspace`: move selected planner notes to the trash.
- `Cmd/Ctrl + Z`: undo the last paste batch by moving pasted files to the trash.

Paste rules:

- You can paste one copied note to multiple dates.
- You can paste multiple copied notes to one date.
- Diary blocks many-notes-to-many-dates paste combinations to avoid ambiguous conflicts.
- If a file already exists, Diary creates a unique path such as `-copy` or `-copy2`.

## Mobile Usage

- Tap a date in the monthly grid to open the bottom day summary sheet.
- Use the summary sheet to review that day's single notes, range notes, and holidays.
- Select **Create note** to create a new note for that date.
- Use pinch zoom in the monthly grid.
- Use the reset zoom button to restore the monthly grid zoom level.
- Use **Mobile bottom padding** and **Mobile cell width** settings to adjust spacing and cell width.

## Settings

| Setting | Description |
| --- | --- |
| Language | Plugin UI language. Default: `en`. Supports `en` and `ko`. |
| Planner folder | Default folder for new planner notes and plan notes. Also used when scan scope is set to planner folder only. Default: `Planner`. |
| Planner note scan scope | Controls whether Diary finds planner notes across the entire vault or only inside **Planner folder** and its subfolders. Default: `Entire vault`. |
| Date format | Stored date format setting. Planner filenames currently use the `YYYY-MM-DD` rule. |
| Show holidays | Turns holiday rendering on or off. |
| Holiday country | Holiday country. Supports `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `FR`, `AU`, `CA`, `TW`, and `None`. |
| Mobile bottom padding | Bottom padding for mobile planners so content is not covered by Obsidian mobile controls. |
| Mobile cell width | Month cell width for the mobile yearly planner. `0` uses the default. |

## Frontmatter Reference

| Key | Description |
| --- | --- |
| `color` | Chip color. Any valid CSS color string can be used. Examples: `#22c55e`, `red`, `rgb(34, 197, 94)` |
| `todo` | Shows the note as a todo chip when `true`. |
| `completed` | Shows completed state when `todo: true`. |
| `notify_minutes` | Minutes from local midnight on the event date. Accepts `0` through `1439`. Example: 9:00 AM is `540`. |
| `date_start` | Start date automatically saved for range notes. |
| `date_end` | End date automatically saved for range notes. |
| `title` | Display title fallback when the title cannot be derived from the filename. |

Reminders are not scheduled OS notifications. While Obsidian is open, Diary checks about every 15 seconds and shows an Obsidian Notice during the matching minute on the event date.

## Filename Rules

Diary scans Markdown files across the vault by default and displays notes whose filenames match these rules. In settings, you can limit scanning to the configured **Planner folder** and its subfolders. Newly created notes go into the configured **Planner folder** by default.

Single date:

```text
2026-05-19.md
2026-05-19-mobile-qa.md
```

Range:

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
```

Plan notes:

```text
2026.md
2026-05.md
```

Display title priority:

1. Filename suffix
2. Frontmatter `title`
3. First Markdown heading
4. File basename

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

## Release

- Release workflow: `.github/workflows/release.yml`
- Release assets: `main.js`, `manifest.json`, `styles.css`
- Use `npm version patch|minor|major --no-git-tag-version` so `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` stay in sync.
- The GitHub release tag must exactly match the `manifest.json` version and should not have a leading `v`.

## Privacy And Network

- Planner features operate on local Markdown files inside the vault.
- Diary has no hidden telemetry or analytics.
- Holiday calculation uses the bundled dependency and does not send vault content to external services for planner rendering.
- `obsidian-reminder-endpoint-spec.md` is a future external endpoint design note. The released plugin currently does not send reminder data over the network.

## Troubleshooting

- If the plugin is missing, make sure `main.js`, `manifest.json`, and `styles.css` are directly inside `Vault/.obsidian/plugins/diary/`.
- If commands are missing, confirm that **Diary** is enabled in **Settings → Community plugins**.
- If the sidebar planner is missing, run **Open monthly planner in sidebar** or reload Obsidian after enabling the plugin.
- If chips do not appear, confirm that filenames follow `YYYY-MM-DD` or `YYYY-MM-DD--YYYY-MM-DD` rules.
- If mobile content is covered at the bottom, increase **Mobile bottom padding**.
- If a reminder does not appear, confirm that Obsidian is open, the event date is today, and `notify_minutes` is within `0-1439`.

## License

See `LICENSE`.
