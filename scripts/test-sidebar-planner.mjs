import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { build } from "esbuild";

// Exercise the real plugin methods without starting Obsidian or touching a vault.
const result = await build({
	stdin: {
		contents: 'export { default as Diary } from "./src/main.ts"; export * from "./src/constants.ts"; export * from "./src/utils/sidebar-planner.ts"; export { DEFAULT_SETTINGS, DiaryObsidianSettingTab } from "./src/settings.ts";',
		resolveDir: process.cwd(), loader: "ts",
	},
	bundle: true, write: false, format: "cjs", platform: "node",
	plugins: [{
		name: "obsidian-test-host",
		setup(builder) {
			builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: "obsidian", namespace: "test-host" }));
			builder.onLoad({ filter: /.*/, namespace: "test-host" }, () => ({
				contents: `export class Plugin {}
export class ItemView {}
export class Modal {}
export class SuggestModal {}
export class PluginSettingTab {}
export class Component {}
export class TFile {}
export class TFolder {}
export class Notice {}
export class Setting {}
export class WorkspaceLeaf {}
export class App {}
export const Platform = { isMobile: false };
export const MarkdownRenderer = {};
export function setIcon() {}
export function requestUrl() { throw new Error("Unexpected network request"); }`, loader: "js",
			}));
		},
	}],
});
const bundled = { exports: {} };
new Function("require", "module", "exports", result.outputFiles[0].text)(
	createRequire(import.meta.url), bundled, bundled.exports,
);
const { Diary, ...types } = bundled.exports;
const sidebarTypes = [
	types.VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
	types.VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
	types.VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
	types.VIEW_TYPE_DAILY_PLANNER,
	types.VIEW_TYPE_THREE_DAY_PLANNER,
];

function fixture() {
	const leaves = [];
	const workspace = {
		rightSplit: {}, leftSplit: {}, rootSplit: {},
		getLeavesOfType: (type) => leaves.filter((leaf) => leaf.type === type && !leaf.detached),
		revealLeaf: async (leaf) => { leaf.revealed = true; },
		ensureSideLeaf: async () => { throw new Error("Existing sidebar must be reused"); },
	};
	function add(type, root = workspace.rightSplit) {
		const leaf = {
			type, state: { year: 2026, month: 11, day: 3 }, view: { getState: () => leaf.state }, detached: false,
			getRoot: () => root,
			getViewState() { return { type: this.type, state: this.state }; },
			detach() { this.detached = true; },
			async setViewState(value) { this.type = value.type; this.state = value.state; },
		};
		leaves.push(leaf);
		return leaf;
	}
	const plugin = new Diary();
	plugin.app = { workspace };
	plugin.settings = { ...types.DEFAULT_SETTINGS };
	return { plugin, workspace, add };
}

for (const type of sidebarTypes) {
	const { plugin, workspace, add } = fixture();
	const mainDaily = add(types.VIEW_TYPE_DAILY_PLANNER, workspace.rootSplit);
	const leftThreeDay = add(types.VIEW_TYPE_THREE_DAY_PLANNER, workspace.leftSplit);
	const current = add(type);
	const originalState = current.state;
	// Startup preserves the restored sidebar's mode and selected date, even without DOM ancestors.
	assert.equal(await plugin.ensureMonthlyPlannerSidebarLeaf({ active: false, reveal: false }), current);
	assert.equal(current.type, type);
	assert.equal(current.state, originalState);
	assert.equal(current.revealed, undefined);
	// Reopening also reuses it; duplicates in the right sidebar alone are removed.
	const duplicate = add(type);
	await plugin.activateMonthlyPlannerInSidebar();
	assert.equal(current.type, type);
	assert.equal(current.state, originalState);
	assert.equal(current.revealed, true);
	assert.equal(duplicate.detached, true);
	assert.equal(mainDaily.detached, false);
	assert.equal(leftThreeDay.detached, false);
	// A command with an explicit month still navigates to the requested monthly grid.
	await plugin.activateMonthlyPlannerInSidebar(2027, 1);
	assert.equal(current.type, types.VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER);
	assert.deepEqual(current.state, { year: 2027, month: 1 });
}

{
	const { plugin, workspace, add } = fixture();
	add(types.VIEW_TYPE_DAILY_PLANNER, workspace.rootSplit);
	add(types.VIEW_TYPE_THREE_DAY_PLANNER, workspace.leftSplit);
	assert.equal(plugin.findPlannerSidebarLeaf(), null);
	const legacyMain = add(types.VIEW_TYPE_MONTHLY_PLANNER, workspace.rootSplit);
	const legacyLeft = add(types.VIEW_TYPE_MONTHLY_PLANNER, workspace.leftSplit);
	const legacyRight = add(types.VIEW_TYPE_MONTHLY_PLANNER);
	plugin.detachLegacyRightMonthlyPlannerLeaves();
	assert.equal(legacyRight.detached, true);
	assert.equal(legacyMain.detached, false);
	assert.equal(legacyLeft.detached, false);
}

const modes = ["yearly", "monthly", "monthlyList", "daily", "threeDay"];
for (const [index, mode] of modes.entries()) {
	const { plugin, workspace, add } = fixture();
	plugin.settings.sidebarDefaultView = mode;
	let creations = 0;
	workspace.ensureSideLeaf = async (type, side, options) => {
		assert.equal(side, "right");
		creations++;
		const leaf = add(type);
		leaf.state = options.state;
		return leaf;
	};
	const created = await plugin.ensureMonthlyPlannerSidebarLeaf({ active: false, reveal: false });
	assert.equal(created.type, sidebarTypes[index]);
	assert.equal(creations, 1);
	// Changing the default switches the existing sidebar without opening a new leaf or stealing focus.
	let savedMode;
	plugin.saveSettings = async () => { savedMode = plugin.settings.sidebarDefaultView; };
	const selected = { year: 2028, month: 2, day: 29 };
	created.type = mode === "daily" ? types.VIEW_TYPE_THREE_DAY_PLANNER : types.VIEW_TYPE_DAILY_PLANNER;
	created.state = selected;
	await types.DiaryObsidianSettingTab.prototype.setControlValue.call({ plugin }, "sidebarDefaultView", mode);
	assert.equal(savedMode, mode);
	assert.equal(created.type, sidebarTypes[index]);
	assert.equal(created.state.year, 2028);
	if (mode !== "yearly") assert.equal(created.state.month, 2);
	if (mode === "daily" || mode === "threeDay") assert.equal(created.state.day, 29);
	assert.equal(created.revealed, undefined);
	assert.equal(creations, 1);
	// An unrelated save or startup must not reapply the default over a manually selected view.
	await plugin.selectPlannerView(created, "daily", selected);
	await plugin.ensureMonthlyPlannerSidebarLeaf({ active: false, reveal: false });
	assert.equal(created.type, types.VIEW_TYPE_DAILY_PLANNER);
}
assert.equal(types.DEFAULT_SETTINGS.sidebarDefaultView, "monthly");
assert.equal(types.DEFAULT_SETTINGS.externalCalendarTimeZone, "device");
for (const value of [undefined, null, "invalid", "device", "UTC", "Asia/Seoul", "America/New_York"]) {
	const { plugin } = fixture();
	plugin.loadData = async () => ({ externalCalendarTimeZone:value });
	await plugin.loadSettings();
	const expected = ["UTC", "Asia/Seoul", "America/New_York"].includes(value) ? value : "device";
	assert.equal(plugin.settings.externalCalendarTimeZone, expected);
	let saved;
	plugin.saveData = async (data) => { saved = structuredClone(data); };
	const refreshed = [];
	for (const method of ["refreshYearlyPlannerViews", "refreshMonthlyPlannerViews", "refreshMonthlyListPlannerViews", "refreshDailyPlannerViews"]) plugin[method] = () => refreshed.push(method);
	await plugin.saveSettings();
	assert.equal(refreshed.length, 4, "time zone changes must refresh every planner surface");
	plugin.loadData = async () => saved;
	await plugin.loadSettings();
	assert.equal(plugin.settings.externalCalendarTimeZone, expected);
}
for (const value of [...modes, undefined, "invalid"]) {
	const { plugin } = fixture();
	plugin.loadData = async () => ({ sidebarDefaultView: value });
	await plugin.loadSettings();
	assert.equal(plugin.settings.sidebarDefaultView, modes.includes(value) ? value : "monthly");
	let saved;
	plugin.saveData = async (data) => { saved = structuredClone(data); };
	for (const method of ["refreshYearlyPlannerViews", "refreshMonthlyPlannerViews", "refreshMonthlyListPlannerViews", "refreshDailyPlannerViews"]) plugin[method] = () => {};
	await plugin.saveSettings();
	plugin.loadData = async () => saved;
	await plugin.loadSettings();
	assert.equal(plugin.settings.sidebarDefaultView, modes.includes(value) ? value : "monthly");
}
for (const invalid of [undefined, null, "", "invalid", 1, {}, []]) {
	assert.equal(types.normalizeSidebarDefaultView(invalid), "monthly");
}
assert.deepEqual(types.getSidebarPlannerViewState("daily", { year: 2027, month: 2 }, new Date(2026, 10, 30)).state,
	{ year: 2027, month: 2, day: 28 });
assert.deepEqual(types.getSidebarPlannerViewState("threeDay", { year: 2028, month: 2 }, new Date(2026, 10, 30)).state,
	{ year: 2028, month: 2, day: 29 });
{
	const { plugin } = fixture();
	plugin.saveSettings = async () => {};
	await plugin.setSidebarDefaultView("threeDay");
	assert.equal(plugin.settings.sidebarDefaultView, "threeDay");
	assert.equal(plugin.findPlannerSidebarLeaf(), null);
}

console.log("Sidebar planner regressions passed (five defaults, settings updates, restored views, date clamping, root isolation).");
