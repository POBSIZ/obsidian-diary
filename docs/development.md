# Diary development and verification

Use npm with the committed `package-lock.json`. Keep generated `main.js` and `node_modules/` out of source commits; GitHub releases publish `main.js`, `manifest.json` and `styles.css` as separate assets. The [root README](../README.md) covers setup, and [the 1.23.1 release record](releases/1.23.1.md) records the date-format and color migration evidence.

## Date filenames

Use [date-formats.ts](../src/utils/date-formats.ts) for filename parsing and generation across creation, movement, clipboard, recurrence, holiday drag and external-event note creation. Each note type has multiple recognized formats and one creation default. Operations on recognized notes preserve the detected format. Keep internal dates and range `date_start` / `date_end` values in Gregorian ISO form.

Validate real dates and both endpoints of ranges. Check the final filename after adding collision suffixes such as `-copy` or `-2`. Different date interpretations or token structures are ambiguous, even when they currently produce the same date.

Representative notes use exact recognized basenames. Daily lookup searches the selected folder; monthly and yearly lookup searches the resolved plan path's parent folder. Reuse an existing representative and offer a choice if several exist. A nonempty monthly/yearly full-path override takes priority over the creation default. Keep legacy path-template grammar until the template is edited.

## Linked colors

Use [planner-colors.ts](../src/utils/planner-colors.ts) to resolve theme, fixed and palette colors, and [planner-color-field.ts](../src/ui/planner-color-field.ts) for shared creation/editing controls. Stable `diary_color_id` values identify links; `color` stores a fallback snapshot. Palette changes update rendering without rewriting every linked note.

Preserve the first entry of legacy `color` lists, archived references, and explicit fixed colors equal to the theme color. Existing-color linking previews eligible notes within the planner scan scope, starts with nothing selected, and applies only to selected notes. Report partial failures.

Recurring occurrences inherit source colors through stable `recurrence_id` lookup after source renames. Detaching an occurrence snapshots its current effective color. Keep holiday colors consistent across all main and sidebar planner views, including compact dots, borders and tinted backgrounds; text follows readable theme colors.

## Verification

Run the repository gates before committing and pushing:

```bash
npm ci
npm run lint
npm run build
npm test
npm run design:lint
npm audit --omit=dev
git diff --check
```

`npm test` runs the date-format and linked-color regression suites and checks locale message keys and placeholders. `npm run design:lint` validates [design.md](../design.md) with the pinned published CLI. Public documentation and UI strings must preserve the same behavior and conditions across the eight supported locales.

For behavior changes, verify the affected workflows in the running Obsidian plugin and record the loaded version. Distinguish WebKit mobile emulation from physical-device testing. Restore the original workspace and settings, and remove only owned test notes and tabs. For a release, check the published assets, completed Community review and public version, then install the downloaded assets and compare their hashes. Documentation-only follow-ups retain the existing plugin version and release tag.
