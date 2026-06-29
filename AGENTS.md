# Obsidian community plugin

## Project overview

- Target: Obsidian Community Plugin (TypeScript → bundled JavaScript).
- Source entry point: `src/main.ts`; esbuild bundles it to top-level `main.js`, which Obsidian loads.
- Release artifacts for this repo: `main.js`, `manifest.json`, and `styles.css`.
- Current plugin ID: `diary`.
- Current plugin version: `1.6.0`.
- Current minimum Obsidian version: `1.7.2`.

## Environment & tooling

- Node.js: use a supported LTS for local development. As of June 2026, Node.js 24 is the current LTS; this repo's CI validates Node.js `20.x` and `22.x`, and the release workflow currently builds with `18.x`.
- **Package manager: npm**. Use `npm ci` for clean CI-style installs and `npm install` when intentionally changing dependencies.
- **Bundler: esbuild** via `esbuild.config.mjs`; bundle all runtime dependencies into `main.js`.
- Types: `obsidian` type definitions.

### Install

```bash
npm install
```

### Dev (watch)

```bash
npm run dev
```

### Production build

```bash
npm run build
```

## Linting

- Use the repository script:

```bash
npm run lint
```

- The config uses `eslint-plugin-obsidianmd`, TypeScript ESLint, browser globals, and ignores generated `main.js`.
- Do not rely on a globally installed eslint for this repo.

## File & folder conventions

- **Organize code into multiple files**: Split functionality across separate modules rather than putting everything in `src/main.ts`.
- Source lives in `src/`. Keep `src/main.ts` focused on plugin lifecycle (loading, unloading, registering commands, registering views, wiring refresh events).
- **Example file structure**:
  ```
  src/
    main.ts           # Plugin entry point, lifecycle management
    settings.ts       # Settings interface and defaults
    commands/         # Command implementations
      command1.ts
      command2.ts
    ui/              # UI components, modals, views
      modal.ts
      view.ts
    utils/           # Utility functions, helpers
      helpers.ts
      constants.ts
    types.ts         # TypeScript interfaces and types
  ```
- **Do not commit build artifacts**: Never commit `node_modules/`, `main.js`, or other generated files to version control.
- Keep the plugin small. Avoid large dependencies. Prefer browser-compatible packages.
- Generated output should be placed at the plugin root or `dist/` depending on your build setup. Release artifacts must end up at the top level of the plugin folder in the vault (`main.js`, `manifest.json`, `styles.css`).
- `styles.css` is part of the current release asset set. Keep Diary CSS scoped to planner, settings, and modal surfaces so it does not restyle unrelated vault content.

## Manifest rules (`manifest.json`)

- Must include:
  - `id` (plugin ID; for local dev it should match the folder name)  
  - `name`  
  - `version` (Semantic Versioning `x.y.z`)  
  - `minAppVersion`  
  - `description`  
  - `author`
  - `isDesktopOnly` (boolean)  
- Optional: `authorUrl`, `fundingUrl` (string or map), `helpUrl`
- Never change `id` after release. Treat it as stable API.
- Keep `minAppVersion` accurate when using newer APIs.
- Keep the `manifest.json` version, `package.json` version, and `versions.json` mapping synchronized.
- Canonical requirements are coded here: https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/validate-plugin-entry.yml

## Testing

- Repository verification:

```bash
npm run lint
npm run build
git diff --check
```

- Manual install for testing: copy `main.js`, `manifest.json`, and `styles.css` to:
  ```
  <Vault>/.obsidian/plugins/<plugin-id>/
  ```
- Reload Obsidian and enable the plugin in **Settings → Community plugins**.

## Commands & settings

- Any user-facing commands should be added via `this.addCommand(...)`.
- If the plugin has configuration, provide a settings tab and sensible defaults.
- Persist settings using `this.loadData()` / `this.saveData()`.
- Use stable command IDs; avoid renaming once released.

## Versioning & releases

- Bump `version` in `manifest.json` (SemVer) and update `versions.json` to map plugin version → minimum app version.
- This repo uses npm for version bumps. Prefer `npm version patch|minor|major --no-git-tag-version` so `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` stay in sync through `version-bump.mjs`.
- Choose the smallest SemVer bump that accurately describes the release:
  - **Patch** (`x.y.z+1`): bug fixes, CSS/lint/build compatibility fixes, release metadata fixes, and other changes that should not alter user workflows.
  - **Minor** (`x.y+1.0`): user-visible features or improvements, new commands/settings/views, accessibility or mobile UX enhancements, and non-breaking behavior additions.
  - **Major** (`x+1.0.0`): breaking changes, removed or renamed commands/settings, incompatible data or file format changes, or a minimum Obsidian version increase that intentionally drops previously supported users.
- If a release contains mixed changes, use the highest applicable bump.
- When asked to push or release, inspect the diff first and state the selected version bump before committing.
- Create a GitHub release whose tag exactly matches `manifest.json`'s `version`. Do not use a leading `v`.
- Attach `manifest.json`, `main.js`, and `styles.css` (if present) to the release as individual assets.
- This repository's release workflow runs on every tag, builds with npm, creates a draft GitHub release, attaches `main.js`, `manifest.json`, and `styles.css`, and generates build provenance attestation.
- After the initial release, follow the process to add/update your plugin in the community catalog as required.

## Security, privacy, and compliance

Follow Obsidian's **Developer Policies** and **Plugin Guidelines**. In particular:

- Default to local/offline operation. Only make network requests when essential to the feature.
- No hidden telemetry. If you collect optional analytics or call third-party services, require explicit opt-in and document clearly in `README.md` and in settings.
- Never execute remote code, fetch and eval scripts, or auto-update plugin code outside of normal releases.
- Minimize scope: read/write only what's necessary inside the vault. Do not access files outside the vault.
- Clearly disclose any external services used, data sent, and risks.
- Respect user privacy. Do not collect vault contents, filenames, or personal information unless absolutely necessary and explicitly consented.
- Avoid deceptive patterns, ads, or spammy notifications.
- Register and clean up all DOM, app, and interval listeners using the provided `register*` helpers so the plugin unloads safely.

## UX & copy guidelines (for UI text, commands, settings)

- Prefer sentence case for headings, buttons, and titles.
- Use clear, action-oriented imperatives in step-by-step copy.
- Use **bold** to indicate literal UI labels. Prefer "select" for interactions.
- Use arrow notation for navigation: **Settings → Community plugins**.
- Keep in-app strings short, consistent, and free of jargon.

## Performance

- Keep startup light. Defer heavy work until needed.
- Avoid long-running tasks during `onload`; use lazy initialization.
- Batch disk access and avoid excessive vault scans.
- Debounce/throttle expensive operations in response to file system events.
- When listening to vault `create` events, avoid reacting to Obsidian's startup file enumeration before the workspace is ready.

## Coding conventions

- TypeScript with `"strict": true` preferred.
- **Keep `src/main.ts` minimal**: Focus on plugin lifecycle, command/view registration, settings loading, and refresh wiring. Delegate planner logic to modules under `src/views/` and `src/utils/`.
- **Split large files**: If any file exceeds ~200-300 lines, consider breaking it into smaller, focused modules.
- **Use clear module boundaries**: Each file should have a single, well-defined responsibility.
- Bundle everything into `main.js` (no unbundled runtime deps).
- Avoid Node/Electron APIs if you want mobile compatibility; set `isDesktopOnly` accordingly.
- Prefer `async/await` over promise chains; handle errors gracefully.

## Mobile

- Where feasible, test on iOS and Android.
- Don't assume desktop-only behavior unless `isDesktopOnly` is `true`.
- Avoid large in-memory structures; be mindful of memory and storage constraints.
- Diary is not desktop-only; avoid Node/Electron-only runtime APIs in planner behavior.

## Agent do/don't

**Do**
- Add commands with stable IDs (don't rename once released).
- Provide defaults and validation in settings.
- Write idempotent code paths so reload/unload doesn't leak listeners or intervals.
- Use `this.register*` helpers for everything that needs cleanup.

**Don't**
- Introduce network calls without an obvious user-facing reason and documentation.
- Ship features that require cloud services without clear disclosure and explicit opt-in.
- Store or transmit vault contents unless essential and consented.

## Common tasks

### Organize code across multiple files

**src/main.ts** (minimal, lifecycle only):
```ts
import { Plugin } from "obsidian";
import { MySettings, DEFAULT_SETTINGS } from "./settings";
import { registerCommands } from "./commands";

export default class MyPlugin extends Plugin {
  settings: MySettings;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    registerCommands(this);
  }
}
```

**settings.ts**:
```ts
export interface MySettings {
  enabled: boolean;
  apiKey: string;
}

export const DEFAULT_SETTINGS: MySettings = {
  enabled: true,
  apiKey: "",
};
```

**commands/index.ts**:
```ts
import { Plugin } from "obsidian";
import { doSomething } from "./my-command";

export function registerCommands(plugin: Plugin) {
  plugin.addCommand({
    id: "do-something",
    name: "Do something",
    callback: () => doSomething(plugin),
  });
}
```

### Add a command

```ts
this.addCommand({
  id: "your-command-id",
  name: "Do the thing",
  callback: () => this.doTheThing(),
});
```

### Persist settings

```ts
interface MySettings { enabled: boolean }
const DEFAULT_SETTINGS: MySettings = { enabled: true };

async onload() {
  this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  await this.saveData(this.settings);
}
```

### Register listeners safely

```ts
this.registerEvent(this.app.workspace.on("file-open", f => { /* ... */ }));
this.registerDomEvent(window, "resize", () => { /* ... */ });
this.registerInterval(window.setInterval(() => { /* ... */ }, 1000));
```

## Troubleshooting

- Plugin doesn't load after build: ensure `main.js` and `manifest.json` are at the top level of the plugin folder under `<Vault>/.obsidian/plugins/<plugin-id>/`. 
- Build issues: if `main.js` is missing, run `npm run build` or `npm run dev` to compile your TypeScript source code.
- Commands not appearing: verify `addCommand` runs after `onload` and IDs are unique.
- Settings not persisting: ensure `loadData`/`saveData` are awaited and you re-render the UI after changes.
- Mobile-only issues: confirm you're not using desktop-only APIs; check `isDesktopOnly` and adjust.
- Planner notes not appearing: confirm filenames match `YYYY-MM-DD` or `YYYY-MM-DD--YYYY-MM-DD`, and check the **Planner note scan scope** setting.
- Reminder not firing: confirm Obsidian is open, the note date is today, and `notify_minutes` is between `0` and `1439`.

## References

- Obsidian sample plugin: https://github.com/obsidianmd/obsidian-sample-plugin
- Obsidian manifest reference: https://docs.obsidian.md/Reference/Manifest
- Obsidian plugin load-time guide: https://docs.obsidian.md/plugins/guides/load-time
- Obsidian community plugin validation workflow: https://github.com/obsidianmd/obsidian-releases/blob/master/.github/workflows/validate-plugin-entry.yml
- Node.js release schedule: https://nodejs.org/en/about/previous-releases
