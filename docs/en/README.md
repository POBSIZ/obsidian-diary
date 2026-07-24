# Diary (English)

Diary turns ordinary Markdown notes into planner views inside Obsidian. Use the yearly, monthly, daily, or 3-day view without moving your notes into a separate database or proprietary format.

Full documentation: [English](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/en/README.md) | [Deutsch](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/de/README.md) | [Español](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/es/README.md) | [Français](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/fr/README.md) | [日本語](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ja/README.md) | [简体中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-CN/README.md) | [繁體中文](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/zh-TW/README.md) | [한국어](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/ko/README.md)

## At a glance

| Item | Value |
| --- | --- |
| Plugin ID | `diary` |
| Current version | `1.15.1` |
| Minimum Obsidian version | `1.7.2` |
| Supported platforms | Desktop / mobile (`isDesktopOnly: false`) |
| Default language | `en` |
| Default planner folder | `Planner` |

## What's new

- `1.15.1`: Rewrites and streamlines the documentation in every supported language, with clearer terminology and shorter release notes.

For earlier changes, see the [Releases page](https://github.com/POBSIZ/obsidian-diary/releases).

## Screenshots

The screenshots use temporary demo notes for all-day, timed, range, todo, and plan entries. The narrow examples show the same views with limited horizontal space; the demo folder was removed after capture.

### Desktop

![Yearly planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/yearly-planner.png)

![Monthly grid planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-grid.png)

![Monthly list planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/monthly-list.png)

| Daily timeline | 3-day timeline |
| --- | --- |
| ![Daily timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/daily-planner.png) | ![3-day timeline planner](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/three-day-planner.png) |

### Narrow layout

| Monthly grid | Monthly list |
| --- | --- |
| ![Narrow monthly grid](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-grid.png) | ![Narrow monthly list](https://github.com/POBSIZ/obsidian-diary/blob/main/docs/assets/screenshots/mobile-monthly-list.png) |

## Features

- **Yearly planner**: View date and range notes in a `12 months × 31 days` table. Expanded month-cell widths are restored after reloads.
- **Localized UI**: Switch Diary between English, German, Spanish, French, Japanese, Simplified Chinese, Traditional Chinese, and Korean.
- **Monthly grid planner**: Inspect one month in a large calendar grid with chips, range bars, holidays, calendar overlay labels, and external calendar overlays.
- **Monthly list planner**: Review a busy month as a day-by-day list, with `All`, `With notes`, and `Upcoming` filters.
- **Daily planner**: Plan one day on a 24-hour timeline. Multi-day ranges render as continuous all-day bars or datetime intervals; timed range boundaries can be resized across dates. All-day and untimed notes stay in a separate section.
- **3-day planner**: Compare three consecutive days in parallel columns on one 24-hour timeline. Narrow screens use horizontal scrolling instead of compressing the day columns.
- **Direct view selector**: Switch directly among yearly, monthly grid, monthly list, daily, and 3-day views. On narrow screens it stays visible while secondary actions move into **More**.
- **Right sidebar planner**: Keep a compact monthly planner open in the right sidebar while notes remain open in the main workspace.
- **Plan note panel**: Create and preview yearly notes (`YYYY.md`) and monthly notes (`YYYY-MM.md`) above the planner. Preview expanded/collapsed state is saved, with a separate mobile state that starts collapsed.
- **Date and range notes**: Display notes as planner chips based on single-date and date-range filenames. Diary scans the whole vault by default, or only the planner folder when configured.
- **Recurring events**: Repeat every N days, weeks, months, or years using a Gregorian or alternate-calendar basis. Occurrences remain virtual until selected and converted to Markdown notes.
- **Color, todo, and completion state**: Reflect `color`, `todo`, and `completed` frontmatter in chip styling and labels.
- **Holiday overlays**: Show country-specific public holidays for the supported UI-language regions and select holiday badges to see their names.
- **Alternate calendar label**: Show one secondary date label at a time. Available calendars include Korean lunar, Chinese lunar, Dangi, Hebrew, Islamic, Persian, Indian national, Buddhist, Japanese era, Minguo, Coptic, and Ethiopic.
- **Custom calendar overlay**: Create local fantasy or campaign calendar profiles with custom months, weekdays, and simple leap rules. Diary shows the custom date as an overlay label while keeping normal `YYYY-MM-DD` note files.
- **External calendar overlays**: Add `webcal://` or `https://` `.ics` feeds, refresh them manually or on an interval, and show events as read-only chips/ranges in yearly, monthly grid, monthly list, side planner, and day summary surfaces. Select an external event only when you want to create a normal Markdown note for it.
- **Scoped styling**: Diary's CSS is limited to planner views, settings panels, and plugin modals so it does not restyle ordinary vault content.
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

## Quick start

1. Run the **Open monthly planner in sidebar** command for the side planner, or **Open monthly planner** for a full workspace tab.
2. Select the add-file button in the header or select a date cell.
3. Choose **Single date** or **Range**.
4. Enter the folder, dates, filename, color, todo state, reminder time, and optional repeat settings.
5. Select **Create**. Diary creates a Markdown note and displays it as a chip or range bar in the planner.

Created notes are ordinary Markdown files. They remain in your vault even if the plugin is disabled.

## Open and switch views

Ribbon icons:

- `calendar-range`: open yearly planner in the main workspace
- `calendar-days`: open or reveal the monthly planner in the right sidebar
- `list-ordered`: open monthly list planner in the main workspace

Command palette:

- `Open yearly planner`
- `Open monthly planner`
- `Open monthly planner in sidebar`
- `Open monthly list planner`
- `Open daily planner`
- `Open 3-day planner`

Select the view-cycle icon in any planner header to move the current leaf through this order.

```text
Yearly -> Monthly Grid -> Monthly List -> Daily -> 3 Days -> Yearly
```

Use previous/next buttons to move through years or months, and the calendar icon to return to the current year or month. Select the year or month label to type a specific value.

## Right sidebar planner

Diary creates one compact monthly planner in the right sidebar when the workspace is ready. Use **Open monthly planner in sidebar** or the monthly ribbon icon to reveal it again.

The sidebar works as a companion view:

- It uses the compact monthly layout and day summary sheet.
- Selecting a planner note from the sidebar opens the file in the main workspace, so the sidebar remains available.
- The switch-layout button cycles the side leaf through yearly, monthly grid, and monthly list views.
- Diary keeps only one planner sidebar leaf and cleans up older right-sidebar monthly planner leaves from previous versions.

## Monthly list filters

The monthly list has three filters:

- **All**: show every day in the selected month.
- **With notes**: show only days with single-date notes or range notes.
- **Upcoming**: show today and future dates in the selected month.

When the monthly list opens on the current month, Diary scrolls today's row into view. The current-month button also returns to today.

## External calendar feeds

Use **Settings → Diary → External calendars** to add a published `webcal://` URL or an `https://` `.ics` URL.

- Feed URLs are stored in local plugin data and may sync with your vault, so treat secret iCal URLs like access tokens.
- Diary rejects local/private network calendar URLs.
- Choose the feed name, color, description inclusion, refresh interval, and which planner surfaces show it.
- New feeds default to a 60-minute auto refresh and visibility in yearly, monthly grid, monthly list, and sidebar surfaces; you can switch refresh to manual only or hide a feed from individual views.
- External events are read-only planner overlays with a separate dashed/ghost style. They do not support drag, clipboard, todo, or color-edit actions.
- Selecting an external event opens a details modal with **Create Markdown note**, **Refresh calendar**, and **Copy details** actions, with localized labels plus pressed/loading/completed feedback.
- When you create a Markdown note from an external event, Diary stores linking frontmatter and hides the duplicate overlay for that event.

## Create notes

### Single-date notes

Select a date cell or the add-file button, then use **Single date**.

- The default filename is `YYYY-MM-DD.md`.
- Add a suffix to use it as the chip title. Example: `2026-05-19-mobile-qa.md` -> `mobile-qa`
- Set a color to display a chip border or mobile dot.
- Enable **Todo file** to show todo state on the chip.
- Set **Reminder time** to save `notify_minutes` frontmatter.
- Enable **Repeat**, choose **Daily**, **Weekly**, **Monthly**, or **Yearly**, enter an interval from 1 to 999, then choose a calendar basis and optional inclusive end date. This supports every N days, weeks, months, or years. Future occurrences appear as virtual planner items without creating files.

### Range notes

On desktop, drag across date cells to prefill a **Range** modal. On mobile, select the add-file button, choose **Range**, and enter the start and end dates manually.

- The filename format is `YYYY-MM-DD--YYYY-MM-DD.md`.
- Add a suffix to use it as the range title. Example: `2026-05-21--2026-05-24-family-trip.md` -> `family-trip`
- `date_start` and `date_end` frontmatter are saved automatically when the range note is created.
- The yearly planner shows range notes with vertical bars and a start-date chip. The monthly grid and list show them as range bars.
- Choose **All day** to keep both times empty, or enter both times to define one continuous interval from `date_start` + `start_time` through `date_end` + `end_time`.
- The daily and 3-day planners show all-day ranges as spanning bars. Drag an all-day range onto the timeline to assign times, then drag its first or last edge to change the corresponding date and time boundary.

### Plan notes

Use the plan note panel above each planner to create yearly or monthly planning notes.

- Yearly plan note: `{plannerFolder}/{year}.md`
- Monthly plan note: `{plannerFolder}/{year}-{month}.md`
- The panel can be collapsed or expanded, and that state is saved in plugin data.
- Desktop and mobile keep separate panel state: desktop defaults expanded, while mobile defaults collapsed until you expand it.
- If the plan note already exists, Diary shows a preview and an open button.

## Edit notes

Select a chip or range bar in the planner to open the file options modal.

- Switch between **Single date** and **Range**
- Choose an existing folder or enter a custom folder path
- Edit the complete filename, including its date or range and title suffix
- Change the start and end dates; the filename stays synchronized
- Change the chip color
- Change todo / completed state
- Change reminder time
- Preview the file
- Open the file
- Delete the file

Applying the change moves or renames the Markdown file. Converting to a range writes `date_start` and `date_end`; converting back to a single date removes those range fields. Diary blocks the change if the destination already contains a file with the same name.

On desktop, drag a date chip or range bar to another date to move it. Range notes move by start date and keep the same duration. If the target path already exists, Diary does not move the file.

## Keyboard and accessibility

- Press `Enter` or `Space` on a focused date cell, planner chip, range bar, holiday badge, monthly list row, year label, or month label to activate it.
- Planner controls use button roles, state labels, and `aria-label` text for screen readers.
- Color preset buttons in create/edit modals expose localized `aria-label` and `title` text.
- Monthly list filters expose tab-style selected state with `aria-selected`.
- Modal validation messages are announced with polite live regions.

## Planner clipboard (desktop)

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

## Mobile use

- Tap a date in the monthly grid to open the bottom day summary sheet.
- Use the summary sheet to review that day's single notes, range notes, and holidays.
- Select **Create note** to create a new note for that date.
- Use pinch zoom in the monthly grid.
- Use the reset zoom button to restore the monthly grid zoom level.
- Diary automatically keeps planner content and menus above standard or floating Obsidian bottom navigation. Use **Mobile bottom padding** as an additional minimum gap and **Mobile cell width** to adjust yearly cells.

## Settings

| Setting | Description |
| --- | --- |
| Language | Plugin UI language. Default: `en`. Supports `en`, `de`, `es`, `fr`, `ja`, `zh-CN`, `zh-TW`, and `ko`. |
| Planner folder | Default folder for new planner notes and plan notes. Also used when scan scope is set to planner folder only. Default: `Planner`. |
| Planner note scan scope | Controls whether Diary finds planner notes across the entire vault or only inside **Planner folder** and its subfolders. Default: `Entire vault`. |
| Date format | Stored date format setting. Planner filenames currently use the `YYYY-MM-DD` rule. |
| Show holidays | Turns holiday rendering on or off. |
| Holiday country | Holiday country. Supports `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `ES`, `FR`, `AU`, `CA`, `TW`, and `None`. |
| Calendar overlay | Selects one built-in alternate calendar or one custom calendar profile for yearly, monthly grid, monthly list, day summary, and sidebar planner views. Default: `None`. |
| Custom calendars | Local fantasy/campaign calendar profiles. Each profile can define month lengths, weekday names, an epoch mapping, a label format, and a simple leap rule. |
| External calendars | Opt-in `webcal://` or `https://` `.ics` feeds shown as read-only overlays. Each feed has an enabled state, color, refresh interval, description toggle, and per-view visibility settings. |
| Mobile bottom padding | Minimum bottom padding for every mobile planner. Automatic navbar and safe-area clearance still applies when this value is smaller. |
| Mobile cell width | Month cell width for the mobile yearly planner. `0` uses the default. |
| Feedback and support | Opens public GitHub forms for feedback, bug reports, and feature suggestions. |

Diary also stores UI-only state in plugin data: plan note preview expansion, mobile plan note preview expansion, and expanded yearly month-cell widths.

## Frontmatter reference

| Key | Description |
| --- | --- |
| `color` | Chip color. Any valid CSS color string can be used. Examples: `#22c55e`, `red`, `rgb(34, 197, 94)` |
| `todo` | Shows the note as a todo chip when `true`. |
| `completed` | Shows completed state when `todo: true`. |
| `start_time` | Optional chip start time in `HH:mm` format. For a range note, this is the time boundary on `date_start`; range notes require both times or neither. |
| `end_time` | Optional chip end time in `HH:mm` format. For a range note, this is the time boundary on `date_end`; it does not schedule a reminder. |
| `notify_minutes` | Minutes from local midnight on the event date. Accepts `0` through `1439`. Example: 9:00 AM is `540`. |
| `date_start` | Start date automatically saved for range notes. |
| `date_end` | End date automatically saved for range notes. |
| `title` | Display title fallback when the title cannot be derived from the filename. |
| `recurrence_id` | Stable series ID shared by a repeat source and generated occurrences. |
| `recurrence_role` | `source` for the repeat definition, `occurrence` for generated notes. |
| `recurrence_calendar` | Calendar basis: `gregorian` or one of the supported alternate calendar IDs. |
| `recurrence_rule` | Frequency plus optional interval, such as `FREQ=WEEKLY;INTERVAL=2`. Existing rules without `INTERVAL` mean every 1 unit. |
| `recurrence_anchor_date` | Gregorian source date used as the start of the series. |
| `recurrence_until_date` | Optional inclusive Gregorian date after which no occurrences are created. |
| `recurrence_anchor_year/month/day` | Calendar-basis anchor fields used for alternate-calendar matching. |
| `recurrence_exdates` | Gregorian occurrence dates skipped from the series. |
| `recurrence_source_path` | Source note path stored on generated occurrences. |
| `recurrence_occurrence_date` | Gregorian date represented by a generated occurrence note. |
| `diary_external_calendar` | External calendar feed ID saved on a Markdown note created from an external event. |
| `diary_external_event_uid` | External event UID used to link the created note back to the feed event. |
| `diary_external_event_instance` | External event instance key, usually the event start date/time. |
| `diary_external_event_source` | Stable link key used for duplicate overlay suppression. |
| `diary_external_event_linked_at` | ISO timestamp for when Diary created the Markdown note from the external event. |

Reminders are not scheduled OS notifications. While Obsidian is open, Diary checks about every 15 seconds and shows an Obsidian Notice during the matching minute on the event date.

Recurring occurrences are virtual by default. Creating one from its planner modal is idempotent: if the occurrence already belongs to the same `recurrence_id`, Diary opens that note; if the target path is an ordinary note or another series, Diary leaves it untouched.

## Filename rules

Diary scans Markdown files across the vault by default and displays notes whose filenames match these rules. In settings, you can limit scanning to the configured **Planner folder** and its subfolders. Newly created notes go into the configured **Planner folder** by default.

Single date:

```text
2026-05-19.md
2026-05-19-mobile-qa.md
2026-05-19-mobile QA.md
```

Range:

```text
2026-05-21--2026-05-24.md
2026-05-21--2026-05-24-family-trip.md
2026-05-21--2026-05-24-family trip.md
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

When you create or edit planner note titles, spaces in the visible title are preserved in the filename suffix. Diary no longer rewrites those spaces to hyphens.

## Development

Use npm for this repository. The CI build matrix currently validates Node.js `20.x` and `22.x`; local development also works on the current LTS release.

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

## Release

- Release workflow: `.github/workflows/release.yml`
- Release assets: `main.js`, `manifest.json`, `styles.css`
- Use `npm version patch|minor|major --no-git-tag-version` so `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` stay in sync.
- The GitHub release tag must exactly match the `manifest.json` version and should not have a leading `v`.
- This repository builds `main.js`, `manifest.json`, and `styles.css` from the tagged source in GitHub Actions and publishes them as individual release assets.

## Feedback and support

- [Share feedback](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feedback.yml)
- [Report a bug](https://github.com/POBSIZ/obsidian-diary/issues/new?template=bug_report.yml)
- [Suggest a feature](https://github.com/POBSIZ/obsidian-diary/issues/new?template=feature_request.yml)

These links open public GitHub issues and require a GitHub account. Do not include private vault content, calendar URLs, access tokens, or other sensitive information.

## Privacy and network

- Planner features operate on local Markdown files inside the vault.
- Diary has no hidden telemetry or analytics.
- Holiday and calendar-overlay calculation use bundled, browser-provided, or locally saved profile data and do not send vault content to external services for planner rendering.
- External calendar feeds are opt-in. Diary fetches only the feed URL you add, stores fetched event cache in plugin data, and does not create Markdown files unless you select **Create Markdown note**.
- Local reminders are processed inside Obsidian and do not send reminder data over the network.

## Troubleshooting

- If the plugin is missing, make sure `main.js`, `manifest.json`, and `styles.css` are directly inside `Vault/.obsidian/plugins/diary/`.
- If commands are missing, confirm that **Diary** is enabled in **Settings → Community plugins**.
- If the sidebar planner is missing, run **Open monthly planner in sidebar** or reload Obsidian after enabling the plugin.
- If chips do not appear, confirm that filenames follow `YYYY-MM-DD` or `YYYY-MM-DD--YYYY-MM-DD` rules.
- If you want more space above the automatically cleared mobile navigation, increase **Mobile bottom padding**.
- If a reminder does not appear, confirm that Obsidian is open, the event date is today, and `notify_minutes` is within `0-1439`.

## License

See `LICENSE`.
