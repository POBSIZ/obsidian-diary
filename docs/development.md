# Diary development and verification

Use npm with the committed `package-lock.json`. Keep generated `main.js` and `node_modules/` out of source commits; GitHub releases publish `main.js`, `manifest.json` and `styles.css` as separate assets. The [root README](../README.md) covers setup, and [the 1.23.1 release record](releases/1.23.1.md) records the date-format and color migration evidence.

The [1.24.0 release record](releases/1.24.0.md) covers multilingual copy, narrow-screen layout checks and Community distribution.

## Date filenames

Use [date-formats.ts](../src/utils/date-formats.ts) for filename parsing and generation across creation, movement, clipboard, recurrence, holiday drag and external-event note creation. Each note type has multiple recognized formats and one creation default. Operations on recognized notes preserve the detected format. Keep internal dates and range `date_start` / `date_end` values in Gregorian ISO form.

Validate real dates and both endpoints of ranges. Check the final filename after adding collision suffixes such as `-copy` or `-2`. Different date interpretations or token structures are ambiguous, even when they currently produce the same date.

Representative notes use exact recognized basenames. Daily lookup searches the selected folder; monthly and yearly lookup searches the resolved plan path's parent folder. Reuse an existing representative and offer a choice if several exist. A nonempty monthly/yearly full-path override takes priority over the creation default. Keep legacy path-template grammar until the template is edited.

## Linked colors

Use [planner-colors.ts](../src/utils/planner-colors.ts) to resolve theme, fixed and palette colors, and [planner-color-field.ts](../src/ui/planner-color-field.ts) for shared creation/editing controls. Stable `diary_color_id` values identify links; `color` stores a fallback snapshot. Palette changes update rendering without rewriting every linked note.

Preserve the first entry of legacy `color` lists, archived references, and explicit fixed colors equal to the theme color. Existing-color linking previews eligible notes within the planner scan scope, starts with nothing selected, and applies only to selected notes. Report partial failures.

Recurring occurrences inherit source colors through stable `recurrence_id` lookup after source renames. Detaching an occurrence snapshots its current effective color. Keep holiday colors consistent across all main and sidebar planner views, including compact dots, borders and tinted backgrounds; text follows readable theme colors.

## Localized UI and text layout

Apply `multilingual-writing` when editing public documentation or UI copy. Preserve message keys, placeholders, numeric limits, conditions and accessibility meaning across all eight supported locales. Keep validation errors in locale messages and translate them at the UI boundary. Use the existing localized monthly display messages for month–year headings instead of concatenating a month label and year.

Check affected settings and dialogs in each supported locale at narrow widths. Include validation errors, disabled actions, selected dropdown values and long translated labels. Fix wrapping and container padding without removing conditions from the text. Keep layout changes scoped to Diary surfaces.

In Obsidian 1.14.4, Settings can open in a separate native window. Inspect the window that owns the settings elements (`app.setting.win` or the element's `.win`); a main-window screenshot does not prove the settings dialog renders correctly. Before inspecting a deferred workspace leaf, call the public `loadIfDeferred()` API and wait for its view to render. Cancel temporary forms through their actual Cancel action and confirm each dialog closes before opening the next locale.

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

`npm test` runs date-format, external-calendar time zone, linked-color, sidebar default-view and holiday dependency regressions, and checks locale message keys and placeholders. `npm run design:lint` validates [design.md](../design.md) with the pinned published CLI. Public documentation and UI strings must preserve the same behavior and conditions across the eight supported locales.

For behavior changes, verify the affected workflows in the running Obsidian plugin and record the loaded version. Record the emulation engine and viewport, and distinguish emulation from physical iOS/Android testing. Restore the original workspace and settings, and remove only owned test notes and tabs. For a release, check the published assets, completed Community review and public version, then install the downloaded assets and compare their hashes. Documentation-only follow-ups retain the existing plugin version and release tag; check the changed documents and links without rerunning unchanged code gates solely for prose edits.

If pre-existing untracked backup files interfere with lint, preserve them. A clean temporary copy of tracked source can provide release verification without a new branch or Git worktree when the user has ruled those out. Compare every copied source file with the staged release tree and record the tree and source commit; run the full gates without broad ignore rules. Do not treat a passing check from a different source tree as release evidence.

## Holiday merge dependency

The holiday parser’s `deepmerge` dependency is overridden with the pinned npm alias `npm:@stackline/deepmerge@1.1.0`. The original 4.3.1 package is affected by [CVE-2026-93753](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), with no patched upstream release at verification on 2026-11-03. The [replacement’s compatibility contract](https://github.com/alexandroit/stackline-deepmerge/blob/main/docs/COMPATIBILITY.md) retains the `merge.all()` API used by the parser and blocks prototype poisoning.

The 1.25.0 release checks compared complete serialized holiday results before and after the override for KR, US, GB, DE, ES, FR, JP, CN and TW across 2024, 2026, 2027, 2028 and 2030; all 45 combinations matched. The permanent regression suite checks the prototype-poisoning case, merge behavior and nine country calendars. Runtime audit reports no vulnerabilities. The full audit retains 23 moderate development-only findings rooted in fast-uri, minimatch and the development Moment dependency; they are outside the shipped runtime bundle.

## External calendar display time zone

`externalCalendarTimeZone` defaults to `device`; saved IANA zones are validated with `Intl.DateTimeFormat` and invalid or missing values fall back to the device. The display preference is attached only to rendered external event copies, never to source timestamps or instance IDs. Date grouping, range filtering, details, note creation and daily/3-day timeline placement share the same conversion. All-day dates, floating times and existing Planner notes retain their original values. IANA zone offsets follow daylight saving rules. Recurrence expansion retains its source date basis so exception dates and linked event identities stay stable.
