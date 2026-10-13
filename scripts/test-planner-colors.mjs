import assert from "node:assert/strict";
import { build } from "esbuild";

const result = await build({
	stdin: {
		contents: `export * from "./src/utils/planner-colors.ts";
export { DEFAULT_DATE_FORMATS, configureDateFormats } from "./src/utils/date-formats.ts";
export { getRecurrenceVirtualEventsForRange, createRecurrenceOccurrenceFile, detachRecurrenceOccurrence } from "./src/utils/recurrence.ts";
export { createSingleDateFile, createRangeFile, updateFileColor } from "./src/views/yearly-planner/file-operations.ts";
export { TFile } from "obsidian";`,
		resolveDir: process.cwd(), loader: "ts",
	},
	bundle: true, write: false, format: "esm", platform: "node",
	plugins: [{
		name: "obsidian-test-host",
		setup(builder) {
			builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: "obsidian", namespace: "test-host" }));
			builder.onLoad({ filter: /.*/, namespace: "test-host" }, () => ({
				contents: `export class App {}
export class TFile { constructor(path) { this.path = path; this.basename = path.split("/").pop().replace(/\\.md$/, ""); this.extension = "md"; } }
export class TFolder {}
export class WorkspaceLeaf {}
export class SuggestModal {}
export class Notice {}
export const requestUrl = async () => { throw new Error("Network requests are not used by these tests"); };`, loader: "js",
			}));
		},
	}],
});
const colors = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

function makeStyle() {
	let color = "";
	return {
		get color() { return color; },
		set color(value) {
			color = typeof value === "string" && (/^#[\da-f]{3}(?:[\da-f]{3})?$/i.test(value) || /^(?:rgb|hsl|var)\(/.test(value) || ["red", "blue", "green"].includes(value)) ? value : "";
		},
	};
}
// eslint-disable-next-line obsidianmd/no-global-this -- This Node regression test supplies its browser-host fixture.
global.window = {
	document: {
		body: { createSpan() { return { style: makeStyle(), remove() {} }; } },
	},
	getComputedStyle(element) { return { color: element.style.color }; },
};

function makeApp() {
	const files = new Map();
	const metadata = new Map();
	const failures = new Set();
	const app = {
		vault: {
			getAbstractFileByPath: (path) => files.get(path) ?? null,
			getMarkdownFiles: () => [...files.values()].filter((file) => file instanceof colors.TFile),
			rename: async (file, path) => {
				const fm = metadata.get(file.path);
				files.delete(file.path);
				metadata.delete(file.path);
				file.path = path;
				file.basename = path.split("/").pop().replace(/\.md$/, "");
				files.set(path, file);
				metadata.set(path, fm);
			},
			createFolder: async (path) => { files.set(path, {}); },
			create: async (path, content) => {
				const fm = {};
				if (content.startsWith("---\n")) {
					for (const line of content.split("---")[1].trim().split("\n")) {
						const separator = line.indexOf(": ");
						fm[line.slice(0, separator)] = JSON.parse(line.slice(separator + 2));
					}
				}
				return add(path, fm);
			},
		},
		metadataCache: { getFileCache: (file) => ({ frontmatter: metadata.get(file.path) }) },
		fileManager: {
			processFrontMatter: async (file, callback) => {
				if (failures.has(file.path)) throw new Error("simulated file write failure");
				callback(metadata.get(file.path));
			},
		},
	};
	function add(path, fm) {
		const file = new colors.TFile(path);
		files.set(path, file);
		metadata.set(path, { ...fm });
		return file;
	}
	return { app, add, metadata, failures };
}

const palette = [{ id: "hospital", name: "Hospital", color: "#3b82f6" }, { id: "school", name: "School", color: "#f59e0b" }];
const host = makeApp();
const { app, add, metadata, failures } = host;
const configure = (entries = palette, holiday = { mode: "theme" }) => colors.configurePlannerColors(app, { colorPalette: entries, holidayColor: holiday });
configure();

assert.deepEqual(colors.normalizeColorPalette(null), colors.DEFAULT_COLOR_PALETTE);
assert.deepEqual(colors.normalizeColorPalette([]), []);
assert.equal(colors.normalizeColorPalette([{ id: "bad", color: "invalid" }]).length, 4);
assert.deepEqual(colors.normalizeColorPalette([{ id: "same", name: " A ", color: "#AbC" }, { id: "same", color: "#123456" }]), [{ id: "same", name: "A", color: "#aabbcc" }]);

const linked = add("Planner/2026-10-13-hospital.md", { diary_color_id: "hospital", color: "#3b82f6" });
const fixed = add("Planner/2026-10-13-school.md", { color: "#3b82f6" });
const plain = add("Planner/2026-10-13.md", {});
const legacyNamed = add("Planner/2026-10-13-legacy.md", { color: "red" });
assert.equal(colors.getPlannerFileColor(app, linked), "#3b82f6");
const changedPalette = [{ ...palette[0], name: "Renamed", color: "#e11d48" }, palette[1]];
configure(changedPalette);
assert.equal(colors.getPlannerFileColor(app, linked), "#e11d48");
assert.equal(metadata.get(linked.path).color, "#3b82f6", "runtime updates do not rewrite note snapshots");
assert.equal(colors.getPlannerFileColor(app, fixed), "#3b82f6");
assert.equal(colors.getPlannerFileColor(app, plain), null);
assert.equal(colors.getPlannerFileColor(app, legacyNamed), "red", "legacy CSS colors survive palette configuration");
configure([{ ...changedPalette[0], archived: true }, palette[1]]);
assert.equal(colors.getPlannerFileColor(app, linked), "#e11d48", "archiving preserves references");
configure([palette[1]]);
assert.equal(colors.getPlannerFileColor(app, linked), "#3b82f6", "missing synced palette falls back to stored hex");
configure(changedPalette);
assert.equal(colors.getPlannerFileColor(app, linked), "#e11d48", "restoring the same ID restores its current color");
assert.equal(colors.resolvePlannerColorSelection({ mode: "palette", id: "hospital", color: "#3b82f6" }, changedPalette, "#e11d48"), "#e11d48", "equal theme and palette colors retain separate identities");

await colors.setFileColorSelection(app, linked, { mode: "fixed", color: "#e11d48" });
assert.equal(metadata.get(linked.path).diary_color_id, undefined);
configure();
assert.equal(colors.getPlannerFileColor(app, linked), "#e11d48", "disconnect freezes the displayed color");
await colors.setFileColorSelection(app, linked, { mode: "theme" });
assert.equal(colors.getPlannerFileColor(app, linked), null);
assert.equal(metadata.get(linked.path).color, undefined);

const range = await colors.createRangeFile(app, "Planner", "2026-10-13--2026-10-16-trip", "#3b82f6", false, null, null, null, "hospital");
assert.equal(metadata.get(range.path).diary_color_id, "hospital");
configure(changedPalette);
assert.equal(colors.getPlannerFileColor(app, range), "#e11d48");
assert.equal(colors.getHolidayColor(app), "var(--text-accent)");
configure(changedPalette, { mode: "palette", id: "hospital", color: "#3b82f6" });
assert.equal(colors.getHolidayColor(app), "#e11d48");
configure([], { mode: "palette", id: "hospital", color: "#3b82f6" });
assert.equal(colors.getHolidayColor(app), "#3b82f6");

configure();
const source = await colors.createSingleDateFile(app, "Planner", "2026-10-13-series", "#3b82f6", false, null, null,
	{ enabled: true, calendar: "gregorian", rule: "FREQ=DAILY;INTERVAL=1" }, "hospital");
configure(changedPalette);
const virtual = colors.getRecurrenceVirtualEventsForRange({ app, plannerFiles: [source], range: { start: "2026-10-14", end: "2026-10-14" } });
assert.equal(virtual[0].color, "#e11d48", "virtual repeats use live palette colors");
const occurrence = await colors.createRecurrenceOccurrenceFile({ app, sourcePath: source.path, occurrenceDate: "2026-10-14", plannerFiles: [source] });
assert.equal(metadata.get(occurrence.path).diary_color_id, "hospital");
assert.equal(metadata.get(occurrence.path).diary_color_inherit, true);
assert.equal(metadata.get(occurrence.path).color, "#e11d48", "new repeat snapshots use the current palette color");
await colors.setFileColorSelection(app, source, { mode: "palette", id: "school", color: "#f59e0b" });
assert.equal(colors.getPlannerFileColor(app, occurrence), "#f59e0b", "inherited repeats follow source reassignment");
assert.ok(colors.getLinkedColorFiles(app, "school").includes(occurrence));
await colors.setFileColorSelection(app, occurrence, { mode: "fixed", color: "#123456" });
assert.equal(metadata.get(occurrence.path).diary_color_inherit, false);
assert.equal(colors.getPlannerFileColor(app, occurrence), "#123456");
await colors.setFileColorSelection(app, occurrence, { mode: "inherit" });
assert.equal(colors.getPlannerFileColor(app, occurrence), "#f59e0b");
const oldSourcePath = source.path;
await app.vault.rename(source, "Planner/2026-10-13-renamed-series.md");
add(oldSourcePath, { color: "#abcdef" });
assert.equal(colors.getPlannerFileColor(app, occurrence), "#f59e0b", "source identity survives a rename");
await colors.detachRecurrenceOccurrence(app, occurrence);
assert.equal(metadata.get(occurrence.path).diary_color_id, "school", "detaching snapshots the current source palette reference");
assert.equal(metadata.get(occurrence.path).color, "#f59e0b");
assert.equal(metadata.get(occurrence.path).recurrence_role, undefined);
const fixedOccurrence = await colors.createRecurrenceOccurrenceFile({ app, sourcePath: source.path, occurrenceDate: "2026-10-15", plannerFiles: [source] });
await colors.setFileColorSelection(app, source, { mode: "fixed", color: "#123456" });
await colors.detachRecurrenceOccurrence(app, fixedOccurrence);
assert.equal(metadata.get(fixedOccurrence.path).color, "#123456", "detaching snapshots a changed fixed source color");
assert.equal(metadata.get(fixedOccurrence.path).diary_color_id, undefined);
const themeOccurrence = await colors.createRecurrenceOccurrenceFile({ app, sourcePath: source.path, occurrenceDate: "2026-10-16", plannerFiles: [source] });
await colors.setFileColorSelection(app, source, { mode: "theme" });
await colors.detachRecurrenceOccurrence(app, themeOccurrence);
assert.equal(metadata.get(themeOccurrence.path).color, undefined, "detaching follows a source reset to theme");
assert.equal(metadata.get(themeOccurrence.path).diary_color_id, undefined);

configure();
const unrelated = add("Projects/Project.md", { color: "#3b82f6" });
const invalidDate = add("Planner/2026-02-31.md", { color: "#3b82f6" });
const failed = add("Planner/2026-10-15-failed.md", { color: "#3b82f6" });
failures.add(failed.path);
const candidates = colors.findMatchingColorFiles(app, "hospital");
assert.ok(candidates.includes(fixed));
assert.ok(!candidates.includes(unrelated));
assert.ok(!candidates.includes(invalidDate));
const bulk = await colors.linkMatchingColorFiles(app, "hospital", [fixed, unrelated, failed]);
assert.deepEqual(bulk, { linked: 1, failed: [failed.path] });
assert.equal(metadata.get(unrelated.path).diary_color_id, undefined);
assert.equal(metadata.get(fixed.path).diary_color_id, "hospital");

colors.configureDateFormats({ ...colors.DEFAULT_DATE_FORMATS, daily: {
	formats: [{ id: "dmy", format: "DD-MM-YYYY" }, { id: "mdy", format: "MM-DD-YYYY" }], defaultFormatId: "dmy",
} });
const ambiguous = add("Planner/03-04-2026.md", { color: "#3b82f6" });
assert.ok(!colors.findMatchingColorFiles(app, "hospital").includes(ambiguous), "ambiguous schedule names are never linked automatically");
colors.configureDateFormats(colors.DEFAULT_DATE_FORMATS);
console.log("Planner color regression checks passed (palette, fallback, linking, ranges, holidays, recurrence and scope).");
