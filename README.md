# Diary

Diary is an Obsidian planner plugin with three calendar views:

- Yearly planner (`12 months x 31 days`)
- Monthly grid planner
- Monthly list planner

It supports date notes, range notes, plan notes, holiday overlays, and reminder notices.

📖 Documentation: [English](docs/en/README.md) | [한국어](docs/ko/README.md)

## Current project status

- Plugin ID: `diary`
- Version: `1.0.9`
- Minimum Obsidian version: `1.7.2`
- Mobile support: enabled (`isDesktopOnly: false`)

## What this repository contains

- `src/main.ts`: plugin lifecycle, view registration, commands, refresh wiring
- `src/settings.ts`: settings schema/defaults + settings tab UI
- `src/views/yearly-planner/*`: yearly calendar UI, interactions, modals, file operations
- `src/views/monthly-planner/*`: monthly grid UI, mobile pinch zoom, interactions
- `src/views/monthly-list-planner/*`: monthly list UI and interactions
- `src/views/planner-clipboard.ts`: multi-select copy/paste/delete/undo flow
- `src/planner-reminders.ts`: runtime reminders based on `notify_minutes`
- `src/i18n.ts`, `locales/*`: localization
- `styles.css`: shared styling tokens and per-view UI styles

## Quick start (development)

```bash
npm install
npm run dev
```

For production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Manual installation

1. Download the latest release from [Releases](https://github.com/POBSIZ/obsidian-diary/releases)
2. Copy `main.js`, `manifest.json`, `styles.css` to `Vault/.obsidian/plugins/diary/`
3. Enable **Diary** in **Settings -> Community plugins**

## Release notes

- Releases are published from GitHub Actions (`.github/workflows/release.yml`)
- Only these assets are shipped: `main.js`, `manifest.json`, `styles.css`
- Build provenance attestation is generated during release workflow

## Contributing

- Use `.github/pull_request_template.md` when opening PRs
- Follow `design.md` for UI/UX consistency
- For planner UI changes, verify Yearly/Monthly/Monthly List and mobile behavior

## License

See `LICENSE`.
