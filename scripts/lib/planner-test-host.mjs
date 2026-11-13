import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";

export async function loadPlannerApi(sourceRoot = process.cwd(), extraExports = "") {
	const result = await build({
		stdin: {
			contents: `
export * from './src/utils/holidays';
export * from './src/utils/date';
export * from './src/utils/date-formats';
export * from './src/utils/external-calendars';
export * from './src/views/yearly-planner/file-utils';
export { TFile, TFolder } from 'obsidian';
${extraExports}`,
			resolveDir: resolve(sourceRoot), loader: "ts",
		},
		bundle: true, write: false, format: "cjs", platform: "node",
		nodePaths: [resolve("node_modules")],
		plugins: [{ name: "planner-offline-host", setup(builder) {
			builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: "obsidian", namespace: "host" }));
			builder.onLoad({ filter: /.*/, namespace: "host" }, () => ({ contents: `
export class App {}
export class Plugin {}
export class WorkspaceLeaf {}
export class ItemView {}
export class Modal {}
export class SuggestModal {}
export class Notice {}
export class Component {}
export class PluginSettingTab {}
export class Setting {}
export const Platform = { isMobile: false }, MarkdownRenderer = {};
export function setIcon() {}
export class TFile {
  constructor(path) { this.path = path; this.basename = path.split('/').pop().replace(/\\.md$/i, ''); this.extension = 'md'; }
}
export class TFolder { constructor(path) { this.path = path; this.children = []; } }
export async function requestUrl() { throw new Error('Unexpected network request'); }
`, loader: "js" }));
		} }],
	});
	const module = { exports: {} };
	new Function("require", "module", "exports", result.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
	return module.exports;
}
