import assert from "node:assert/strict";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";

const nativeDate = Date;
const originalZone = process.env.TZ;
let now = new nativeDate("2026-11-14T08:20:00+09:00").getTime();
// eslint-disable-next-line obsidianmd/no-global-this -- The reminder clock is deterministic and restored below.
global.Date = class extends nativeDate { constructor(...args) { super(...(args.length ? args : [now])); } };
// eslint-disable-next-line obsidianmd/no-global-this -- Offline planner utilities expect a browser document.
global.window = { document: { createEl: () => ({ style: { color: "" } }) } };
process.env.TZ = "Asia/Seoul";

async function loadApi(sourceRoot) {
	const result = await build({
		stdin: { contents: `
export { registerPlannerReminders } from './src/planner-reminders';
export { configureDateFormats, DEFAULT_DATE_FORMATS } from './src/utils/date-formats';
export { setLocale } from './src/i18n';
export { TFile, TFolder, notices } from 'obsidian';`, resolveDir: resolve(sourceRoot), loader: "ts" },
		bundle: true, write: false, format: "cjs", platform: "node", nodePaths: [resolve("node_modules")],
		plugins: [{ name: "offline-reminders", setup(builder) {
			builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: "obsidian", namespace: "host" }));
			builder.onLoad({ filter: /.*/, namespace: "host" }, () => ({ contents: `
export const notices = [];
export class Notice { constructor(message, duration) { notices.push({ message, duration }); } }
export class App {}
export class Plugin {}
export class Component {}
export class Modal {}
export class SuggestModal {}
export const Platform = {isMobile: false}, MarkdownRenderer = {};
export function setIcon() {}
export class TFile { constructor(path) { this.path = path; this.extension = path.split('.').pop(); this.basename = path.split('/').pop().replace(/\\.[^.]+$/, ''); } }
export class TFolder { constructor(path) { this.path = path; this.children = []; } }
export async function requestUrl() { throw new Error('Unexpected network access'); }
`, loader: "js" }));
		} }],
	});
	const module = { exports: {} };
	new Function("require", "module", "exports", result.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports);
	return module.exports;
}

function eventBus() {
	const listeners = new Map();
	return {
		on: (name, callback) => {
			const group = listeners.get(name) ?? new Set();
			listeners.set(name, group); group.add(callback);
			return { off: () => group.delete(callback) };
		},
		emit: (name, ...args) => { for (const callback of listeners.get(name) ?? []) callback(...args); },
	};
}

function host(api, { scope = "vault", folder = "Planner", layout = "ready" } = {}) {
	api.configureDateFormats(api.DEFAULT_DATE_FORMATS);
	api.setLocale("en");
	const files = new Map(), metadata = new Map(), vaultEvents = eventBus(), metadataEvents = eventBus();
	const timeouts = new Map(), intervals = new Map(), cleanups = [], layoutCallbacks = [];
	const root = new api.TFolder(""); files.set("", root);
	const stats = { scans: 0, metadataReads: 0 };
	let timerId = 0, controller;
	const win = {
		setTimeout: (callback, delay) => { const id = ++timerId; timeouts.set(id, { callback, delay }); return id; },
		clearTimeout: (id) => timeouts.delete(id),
		setInterval: (callback, delay) => { const id = ++timerId; intervals.set(id, { callback, delay }); return id; },
		clearInterval: (id) => intervals.delete(id),
	};
	function addFolder(path) {
		if (files.has(path)) return files.get(path);
		const slash = path.lastIndexOf("/"), parent = addFolder(slash < 0 ? "" : path.slice(0, slash));
		const folderEntry = new api.TFolder(path); folderEntry.parent = parent;
		parent.children.push(folderEntry); files.set(path, folderEntry); return folderEntry;
	}
	function add(path, frontmatter = {}, emit = false) {
		const slash = path.lastIndexOf("/"), parent = addFolder(slash < 0 ? "" : path.slice(0, slash));
		const file = new api.TFile(path); file.parent = parent; parent.children.push(file);
		files.set(path, file); metadata.set(file, frontmatter);
		if (emit) vaultEvents.emit("create", file);
		return file;
	}
	function remove(file) {
		if (file instanceof api.TFolder) for (const child of [...file.children]) removeSilently(child);
		removeSilently(file); vaultEvents.emit("delete", file);
	}
	function removeSilently(file) {
		if (file instanceof api.TFolder) for (const child of [...file.children]) removeSilently(child);
		files.delete(file.path);
		if (file.parent) file.parent.children = file.parent.children.filter((child) => child !== file);
	}
	function rename(file, path) {
		const oldPath = file.path;
		const descendants = [...files.values()].filter((entry) => entry.path.startsWith(`${oldPath}/`));
		files.delete(oldPath);
		for (const entry of descendants) files.delete(entry.path);
		if (file.parent) file.parent.children = file.parent.children.filter((child) => child !== file);
		const slash = path.lastIndexOf("/"), parent = addFolder(slash < 0 ? "" : path.slice(0, slash));
		file.path = path; file.parent = parent; parent.children.push(file); files.set(path, file);
		if (file instanceof api.TFile) {
			file.basename = path.split("/").pop().replace(/\.[^.]+$/, ""); file.extension = path.split(".").pop();
		}
		for (const entry of descendants) { entry.path = path + entry.path.slice(oldPath.length); files.set(entry.path, entry); }
		vaultEvents.emit("rename", file, oldPath);
	}
	const workspace = { containerEl: { ownerDocument: { defaultView: win } } };
	if (layout !== "missing") workspace.onLayoutReady = (callback) => layout === "ready" ? callback() : layoutCallbacks.push(callback);
	const plugin = {
		settings: { plannerFolder: folder, plannerFileScope: scope },
		app: {
			workspace,
			vault: {
				...vaultEvents,
				getMarkdownFiles: () => { stats.scans++; return [...files.values()].filter((entry) => entry instanceof api.TFile && entry.extension.toLowerCase() === "md"); },
				getAbstractFileByPath: (path) => files.get(path) ?? null,
				getRoot: () => root,
			},
			metadataCache: { ...metadataEvents, getFileCache: (file) => { stats.metadataReads++; return { frontmatter: metadata.get(file) ?? {} }; } },
		},
		registerEvent: (reference) => cleanups.push(reference.off),
		registerInterval: (id) => cleanups.push(() => win.clearInterval(id)),
		register: (callback) => cleanups.push(callback),
	};
	return {
		add, addFolder, remove, rename, metadata, files, stats, plugin, timeouts, intervals, layoutCallbacks,
		start: () => { controller = api.registerPlannerReminders(plugin); return controller; },
		changed: (file, value) => { if (value) metadata.set(file, value); metadataEvents.emit("changed", file); },
		ready: () => { for (const callback of layoutCallbacks.splice(0)) callback(); },
		flush: () => { const pending = [...timeouts.values()]; timeouts.clear(); pending.forEach(({ callback, delay }) => { assert.equal(delay, 200); callback(); }); },
		tick: (date = "2026-11-14T08:20:00+09:00") => { now = new nativeDate(date).getTime(); for (const { callback, delay } of intervals.values()) { assert.equal(delay, 15_000); callback(); } },
		unload: () => cleanups.reverse().forEach((cleanup) => cleanup()),
		scope: (nextScope, nextFolder) => {
			plugin.settings.plannerFileScope = nextScope; plugin.settings.plannerFolder = nextFolder;
			controller?.refreshScope();
		},
		resetStats: () => { stats.scans = 0; stats.metadataReads = 0; },
	};
}

function assertLifecycle(api) {
	const h = host(api, { layout: "pending" });
	const file = h.add("Planner/2026-11-14-Startup.md", { notify_minutes: 500 });
	h.start();
	h.changed(file); h.add("Planner/2026-11-14-Created.md", { notify_minutes: 500 }, true);
	h.tick(); h.flush();
	assert.deepEqual(h.stats, { scans: 0, metadataReads: 0 }, "Startup enumeration must not scan before layout readiness");
	assert.equal(h.timeouts.size, 0);
	h.ready(); assert.equal(h.stats.scans, 1); h.resetStats();
	h.changed(file); h.changed(file); h.changed(file);
	assert.equal(h.timeouts.size, 1, "A file burst shares one cancellable debounce");
	h.flush(); assert.deepEqual(h.stats, { scans: 0, metadataReads: 1 });
	h.changed(file);
	const staleTimeout = [...h.timeouts.values()][0].callback, staleTick = [...h.intervals.values()][0].callback;
	h.unload(); h.resetStats();
	assert.equal(h.timeouts.size, 0); assert.equal(h.intervals.size, 0);
	const noticeCount = api.notices.length;
	staleTimeout(); staleTick(); h.changed(file); h.scope("plannerFolder", "Other"); h.ready();
	assert.deepEqual(h.stats, { scans: 0, metadataReads: 0 }, "Late callbacks must not access the vault after unload");
	assert.equal(api.notices.length, noticeCount, "Late callbacks must not show notices after unload");
	const pending = host(api, { layout: "pending" });
	pending.add("2026-11-14-Unloaded.md", { notify_minutes: 500 }); pending.start(); pending.unload(); pending.ready();
	assert.equal(pending.stats.scans, 0, "Unloading before layout readiness cancels deferred initialization");
	const compatible = host(api, { layout: "missing" });
	compatible.add("2026-11-14-Compatible.md", { notify_minutes: 500 }); compatible.start();
	assert.equal(compatible.stats.scans, 1, "Older fake hosts initialize without onLayoutReady"); compatible.unload();
}

function assertScope(api) {
	const h = host(api, { scope: "plannerFolder", folder: " /Planner/ " });
	h.add("Planner/2026-11-14-In.md", { notify_minutes: 500 });
	const outside = h.add("Outside/2026-11-14-Out.md", { notify_minutes: 500 });
	h.start(); h.resetStats();
	h.scope("plannerFolder", "Planner"); h.flush();
	assert.equal(h.stats.metadataReads, 0, "Normalized equivalent folders must not rebuild");
	h.changed(outside); h.flush(); assert.equal(h.stats.metadataReads, 0, "Out-of-scope metadata stays unread");
	h.scope("vault", "Ignored"); h.flush(); assert.equal(h.stats.metadataReads, 2);
	h.resetStats(); h.scope("vault", "Still ignored"); h.flush(); assert.deepEqual(h.stats, { scans: 0, metadataReads: 0 });
	h.scope("plannerFolder", " "); h.flush(); assert.equal(h.stats.metadataReads, 2, "Whitespace folder selects the vault root");
	h.scope("plannerFolder", "Missing"); h.flush();
	const start = api.notices.length; h.tick(); assert.equal(api.notices.length, start, "Missing folders have no reminders");
	h.addFolder("Missing"); h.rename(outside, "Missing/2026-11-14-Out.md"); h.flush(); h.tick();
	assert.equal(api.notices.length, start + 1, "A file moved into a newly created scope is indexed");
	h.unload();
}

function semanticScenario(api) {
	const start = api.notices.length, h = host(api);
	const beta = h.add("z/2026-11-14-Beta.md", { notify_minutes: "500ignored" });
	const alpha = h.add("a/2026-11-14-Alpha.md", { notify_minutes: 499.5 });
	h.add("a/2026-11-14--2026-11-16-Range.md", { notify_minutes: 500 });
	h.add("a/2026-11-13--2026-11-15-Not range end.md", { notify_minutes: 500 });
	for (const [suffix, value] of [["Negative", -1], ["Large", 1440], ["Bool", true], ["Empty", ""], ["Null", null]]) h.add(`2026-11-14-${suffix}.md`, { notify_minutes: value });
	h.add("2026-02-30-Invalid.md", { notify_minutes: 500 });
	h.add("2026-11-14.png", { notify_minutes: 500 });
	h.add("2026-11.md", { notify_minutes: 500 });
	h.add("2026-11-15-Tomorrow.md", { notify_minutes: 500 });
	const future = h.add("2026-11-14-Later.md", { notify_minutes: 501 });
	h.start(); h.tick(); h.tick();
	assert.equal(api.notices.length - start, 3, "Only today's three valid reminders fire, once each");
	assert.deepEqual(api.notices.slice(start).map(({ message }) => message.match(/(Alpha|Beta|Range)/)?.[1]), ["Range", "Alpha", "Beta"], "Notice order matches sorted paths");
	h.changed(alpha, { notify_minutes: 500, title: "Changed" }); h.flush(); h.tick();
	assert.equal(api.notices.length - start, 3, "An unchanged fired key stays suppressed after metadata changes");
	h.rename(beta, "b/2026-11-14-Renamed.md"); h.flush(); h.tick();
	assert.equal(api.notices.length - start, 4, "Renaming retains path-based fired-key semantics");
	h.changed(alpha, { notify_minutes: 501 }); h.remove(future); h.flush(); h.tick("2026-11-14T08:21:00+09:00");
	assert.equal(api.notices.length - start, 5, "Changed minutes trigger a new key and deleted entries do not fire");
	const created = h.add("2026-11-14-Created.md", { notify_minutes: 502 }, true);
	h.changed(created); h.flush(); h.tick("2026-11-14T08:22:00+09:00");
	assert.equal(api.notices.length - start, 6);
	h.rename(created, "2026-11-14-Created.txt"); h.flush();
	h.tick("2026-11-15T08:20:00+09:00");
	assert.equal(api.notices.length - start, 7, "Range reminders do not repeat on later range dates");
	h.tick("2026-11-14T08:20:00+09:00");
	assert.equal(api.notices.length - start, 9, "The original previous-day fired-key pruning is retained if the clock moves back");
	h.unload();
	return api.notices.slice(start);
}

function folderAndFormatsScenario(api) {
	const start = api.notices.length, h = host(api, { scope: "plannerFolder" });
	const moving = h.addFolder("Outside/Trips");
	h.add("Outside/Trips/2026-11-14-Moved.md", { notify_minutes: 500 });
	const deleted = h.addFolder("Planner/Deleted");
	h.add("Planner/Deleted/2026-11-14-Deleted.md", { notify_minutes: 500 });
	h.add("Planner/2026.11.14-Custom.md", { notify_minutes: 500 });
	h.start(); h.remove(deleted); h.rename(moving, "Planner/Trips"); h.flush(); h.tick();
	assert.equal(api.notices.length - start, 1, "Folder-only events must rebuild descendants");
	api.configureDateFormats({ ...api.DEFAULT_DATE_FORMATS, daily: { formats: [...api.DEFAULT_DATE_FORMATS.daily.formats, { id: "dot", format: "YYYY.MM.DD" }], defaultFormatId: "iso-daily" } });
	h.flush(); h.tick(); assert.equal(api.notices.length - start, 2, "Date-format changes rebuild all reminder dates");
	h.rename(h.files.get("Planner"), "RenamedPlanner"); h.flush();
	const next = h.add("RenamedPlanner/2026-11-14-Outside.md", { notify_minutes: 501 }, true);
	h.flush(); h.tick("2026-11-14T08:21:00+09:00");
	assert.equal(api.notices.length - start, 2, "Renaming the configured root removes its old scope");
	h.rename(h.files.get("RenamedPlanner"), "Planner"); h.flush(); h.tick("2026-11-14T08:21:00+09:00");
	assert.equal(api.notices.length - start, 3);
	h.changed(next, { notify_minutes: 502 }); h.flush(); h.tick("2026-11-14T08:22:00+09:00");
	h.unload(); return api.notices.slice(start);
}

function canonicalOrderScenario(api) {
	const start = api.notices.length, h = host(api);
	const first = h.add("2026-11-14-Caf\u00e9.md", {});
	h.add("2026-11-14-Cafe\u0301.md", { notify_minutes: 500 });
	h.start(); h.changed(first, { notify_minutes: 500 }); h.flush(); h.tick(); h.unload();
	assert.equal(api.notices.length - start, 2);
	return api.notices.slice(start);
}

function clockScenario(api) {
	const start = api.notices.length;
	process.env.TZ = "Asia/Seoul";
	const midnight = host(api);
	midnight.add("2026-11-14-Last minute.md", { notify_minutes: 1439 });
	midnight.add("2026-11-14-Rounded last minute.md", { notify_minutes: 1438.6 });
	midnight.add("2026-11-15-Local midnight.md", { notify_minutes: "0" });
	midnight.add("2026-11-14-No catch up.md", { notify_minutes: 0 });
	midnight.start(); midnight.tick("2026-11-14T23:58:00+09:00");
	assert.equal(api.notices.length, start, "Reminders do not fire early or catch up missed minutes");
	midnight.tick("2026-11-14T23:59:00+09:00"); midnight.tick("2026-11-15T00:00:00+09:00");
	assert.equal(api.notices.length - start, 3, "Boundary minutes use the local event date and preserve numeric rounding");
	midnight.unload();
	process.env.TZ = "America/Los_Angeles";
	const spring = host(api);
	spring.add("2026-03-08-Before clock jump.md", { notify_minutes: 90 });
	spring.add("2026-03-08-Skipped minute.md", { notify_minutes: 150 });
	spring.add("2026-03-08-After clock jump.md", { notify_minutes: 180 });
	spring.start(); spring.tick("2026-03-08T01:30:00-08:00"); spring.tick("2026-03-08T03:00:00-07:00");
	assert.equal(api.notices.length - start, 5, "A DST-skipped minute is not caught up"); spring.unload();
	const autumn = host(api);
	autumn.add("2026-11-01-Repeated minute.md", { notify_minutes: 90 }); autumn.start();
	autumn.tick("2026-11-01T01:30:00-07:00"); autumn.tick("2026-11-01T01:30:00-08:00");
	assert.equal(api.notices.length - start, 6, "The repeated DST hour retains once-per-key delivery"); autumn.unload();
	process.env.TZ = "Asia/Seoul";
	return api.notices.slice(start);
}

function measure(api, count = 10_000) {
	const h = host(api);
	for (let i = 0; i < count; i++) h.add(`Planner/2026-11-14-Note ${i}.md`, i % 100 === 0 ? { notify_minutes: 500 } : {});
	h.start(); const file = h.files.get("Planner/2026-11-14-Note 1.md");
	for (let i = 0; i < 10; i++) { h.changed(file); h.flush(); }
	h.resetStats(); const timings = [];
	for (let i = 0; i < 51; i++) {
		const begin = performance.now(); h.changed(file); h.flush(); timings.push(performance.now() - begin);
	}
	const counts = { ...h.stats }; h.unload();
	timings.sort((a, b) => a - b);
	return { files: count, samples: timings.length, medianMs: timings[25], p95Ms: timings[48], ...counts };
}

try {
	const api = await loadApi(process.cwd());
	assertLifecycle(api); assertScope(api);
	const expected = [semanticScenario(api), folderAndFormatsScenario(api), canonicalOrderScenario(api), clockScenario(api)];
	assert(expected.flat().every(({ duration }) => duration === 12_000), "Notice duration remains 12 seconds");
	const after = measure(api);
	assert.deepEqual({ scans: after.scans, metadataReads: after.metadataReads }, { scans: 0, metadataReads: 51 }, "Single-file changes read one metadata entry without vault enumeration");
	const baselineArgument = process.argv.indexOf("--baseline");
	const report = { after, limitations: "Offline fake host; timing is metadata update processing, not whole-app or physical-device latency." };
	if (baselineArgument >= 0) {
		const baseline = await loadApi(process.argv[baselineArgument + 1]);
		const beforeOutputs = [semanticScenario(baseline), folderAndFormatsScenario(baseline), canonicalOrderScenario(baseline), clockScenario(baseline)];
		assert.deepEqual(expected, beforeOutputs, "Notices, ordering, timing and fired keys must match the immutable pre-refactor source");
		report.before = measure(baseline);
		assert.deepEqual({ scans: report.before.scans, metadataReads: report.before.metadataReads }, { scans: 51, metadataReads: 510_000 });
		report.metadataReadReductionPercent = 100 * (1 - after.metadataReads / report.before.metadataReads);
		report.medianReductionPercent = 100 * (1 - after.medianMs / report.before.medianMs);
	}
	const outputArgument = process.argv.indexOf("--output");
	if (outputArgument >= 0) writeFileSync(process.argv[outputArgument + 1], `${JSON.stringify(report, null, 2)}\n`);
	console.log("Planner reminder regressions passed: reminder outputs/order/fired keys, incremental events, scope/folder/date-format invalidation, startup readiness and unload cancellation.");
	console.log(JSON.stringify(report));
} finally {
	// eslint-disable-next-line obsidianmd/no-global-this -- Restore the test process's native clock.
	global.Date = nativeDate;
	if (originalZone === undefined) delete process.env.TZ; else process.env.TZ = originalZone;
}
