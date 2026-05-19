# Diary (English)

Diary is an Obsidian planner plugin for year/month planning and date-based notes.

## Snapshot

- Plugin ID: `diary`
- Current version: `1.0.9`
- Min Obsidian version: `1.7.2`
- Platforms: desktop and mobile

## Core views

- **Yearly planner**: 12-month x 31-day grid for annual overview
- **Monthly planner**: calendar grid for one month (supports mobile pinch zoom)
- **Monthly list planner**: day-by-day list layout for dense monthly review

You can cycle views in-place: `Yearly -> Monthly Grid -> Monthly List -> Yearly`.

## Key capabilities

- **Date notes**: open/create notes by day cell
- **Range notes**: drag-select date ranges and create `YYYY-MM-DD--YYYY-MM-DD` notes
- **Plan notes**:
  - yearly note: `{plannerFolder}/{year}.md`
  - monthly note: `{plannerFolder}/{year}-{month}.md`
- **Holiday overlays**: selectable holiday country and clickable holiday badges
- **Chip coloring**: `color` frontmatter with presets and custom color input
- **Todo chips**: `todo` and `completed` frontmatter reflected in chip labels
- **Clipboard workflow** (planner selections):
  - multi-select with modifier click (desktop)
  - copy / paste rebasing
  - delete selection
  - undo last paste batch (`Cmd/Ctrl+Z`)
- **Reminder notices**:
  - based on `notify_minutes` frontmatter
  - checks while Obsidian is open and shows local-time notice on event date
- **i18n**: English + Korean

## Commands and entry points

- Ribbon icons:
  - `calendar-range`: open yearly planner
  - `calendar-days`: open monthly planner
  - `list-ordered`: open monthly list planner
- Command palette:
  - `Open yearly planner`
  - `Open monthly planner`
  - `Open monthly list planner`

## Settings

| Setting | Description |
| --- | --- |
| Language | UI language (`en` / `ko`) |
| Planner folder | Base folder for planner files (default: `Planner`) |
| Date format | Stored setting for date format (`YYYY-MM-DD`) |
| Show holidays | Toggle holiday rendering |
| Holiday country | `KR`, `US`, `JP`, `CN`, `GB`, `DE`, `FR`, `AU`, `CA`, `TW` |
| Mobile bottom padding | Bottom spacing for mobile planner container |
| Mobile cell width | Month cell width on mobile |

## Frontmatter reference

- `color`: chip color (CSS color string)
- `todo`: `true/false`
- `completed`: `true/false` (used when `todo: true`)
- `notify_minutes`: minutes from local midnight (`0-1439`)
- `date_start`, `date_end`: set automatically for range notes
- `title`: fallback title for non-standard filenames

## File naming

- Single date:
  - `2026-02-12.md`
  - `2026-02-12-meeting.md` (suffix shown as title)
- Range:
  - `2026-02-01--2026-02-07.md`
  - `2026-02-01--2026-02-07-vacation.md`
- Plan notes:
  - yearly: `2026.md`
  - monthly: `2026-02.md`

## Install

1. Download latest release from [Releases](https://github.com/POBSIZ/obsidian-diary/releases)
2. Copy `main.js`, `manifest.json`, `styles.css` to `Vault/.obsidian/plugins/diary/`
3. Enable **Diary** in **Settings -> Community plugins**

## Development

```bash
npm install
npm run dev
```

Build and lint:

```bash
npm run build
npm run lint
```

## Release process (current)

- Release workflow: `.github/workflows/release.yml`
- Release assets: `main.js`, `manifest.json`, `styles.css` only
- Build provenance attestation generated in CI

## License

See `LICENSE`.
