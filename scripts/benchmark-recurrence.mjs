import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { cpus } from "node:os";
import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { loadPlannerApi } from "./lib/planner-test-host.mjs";

export const CALENDARS = ["gregorian", "korean-lunar", "chinese", "dangi", "hebrew", "islamic", "islamic-civil", "islamic-umalqura", "persian", "indian", "buddhist", "japanese", "roc", "coptic", "ethiopic"];
export const isoAfter = (date, days) => new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
export const loadRecurrenceApi = (root) => loadPlannerApi(root, `export * from './src/utils/recurrence';`);

// The fixture uses browser-compatible hexadecimal colors and makes unexpected I/O fail.
export function makeRecurrenceFixture(api, sources) {
	const metadata = new Map();
	const files = [];
	const app = {
		metadataCache: { getFileCache: (file) => ({ frontmatter: metadata.get(file) ?? {} }) },
		vault: { getMarkdownFiles: () => files },
	};
	for (const [index, options] of sources.entries()) {
		const id = `series-${index}`;
		const anchor = options.anchor ?? "2024-02-29";
		const rangeEnd = options.span ? `--${isoAfter(anchor, options.span)}` : "";
		const file = new api.TFile(`Planner/${anchor}${rangeEnd}-Repeat ${index}.md`);
		file.parent = { path: "Planner" };
		const fm = api.buildRecurrenceSourceFrontmatter({ enabled: true, calendar: options.calendar ?? "gregorian", rule: options.rule ?? "FREQ=MONTHLY", untilDate: options.until }, anchor, id);
		Object.assign(fm, { recurrence_exdates: options.exdates ?? [], color: index % 2 === 0 ? "#123456" : ["#abcdef", "#654321"], start_time: index % 2 === 0 ? "09:00" : "invalid", end_time: "10:30", ...options.frontmatter });
		if (options.unstoredAnchor) {
			for (const key of Object.keys(fm).filter((key) => key.startsWith("recurrence_anchor_") && key !== "recurrence_anchor_date")) delete fm[key];
		}
		metadata.set(file, fm);
		files.push(file);
		for (const date of options.materialized ?? []) {
			const occurrence = new api.TFile(`Planner/${date}-Materialized ${index}.md`);
			occurrence.parent = { path: "Planner" };
			metadata.set(occurrence, { recurrence_id: id, recurrence_role: "occurrence", recurrence_occurrence_date: date, recurrence_source_path: "renamed-source.md", completed: true });
			files.push(occurrence);
		}
	}
	return { app, plannerFiles: files, metadata };
}

function measure(run, samples) {
	run();
	const times = [];
	let count;
	for (let i = 0; i < samples; i++) {
		const start = performance.now();
		const events = run();
		times.push(performance.now() - start);
		if (i > 0) assert.equal(events.length, count);
		count = events.length;
	}
	times.sort((a, b) => a - b);
	const result = run();
	return { medianMs: times[Math.floor(times.length / 2)], p95Ms: times[Math.ceil(samples * 0.95) - 1], eventCount: count, sha256: createHash("sha256").update(JSON.stringify(result)).digest("hex") };
}

async function benchmark(root, samples) {
	const api = await loadRecurrenceApi(root);
	const workloads = {
		weeklyYear240Sources: { sources: Array.from({ length: 240 }, (_, i) => ({ rule: `FREQ=WEEKLY;INTERVAL=${i % 4 + 1}`, calendar: CALENDARS[i % CALENDARS.length], anchor: "2020-01-03", exdates: ["2026-01-02", "2026-07-17"], materialized: ["2026-01-09"] })), range: { start: "2026-01-01", end: "2026-12-31" } },
		monthlyMonth120Sources: { sources: Array.from({ length: 120 }, (_, i) => ({ rule: `FREQ=MONTHLY;INTERVAL=${i % 3 + 1}`, calendar: CALENDARS[i % CALENDARS.length], span: i % 8 === 0 ? 2 : 0 })), range: { start: "2026-10-25", end: "2026-12-05" } },
		yearlyYear60Sources: { sources: Array.from({ length: 60 }, (_, i) => ({ rule: `FREQ=YEARLY;INTERVAL=${i % 2 + 1}`, calendar: CALENDARS[i % CALENDARS.length], anchor: "2023-03-22" })), range: { start: "2026-01-01", end: "2026-12-31" } },
	};
	const output = {};
	for (const [name, workload] of Object.entries(workloads)) {
		const fixture = makeRecurrenceFixture(api, workload.sources);
		output[name] = { sources: workload.sources.length, range: workload.range, ...measure(() => api.getRecurrenceVirtualEventsForRange({ ...fixture, range: workload.range }), samples) };
	}
	return output;
}

export async function main() {
	const args = process.argv.slice(2);
	const option = (name) => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
	const samples = Number(option("--samples") ?? 9);
	assert.ok(Number.isInteger(samples) && samples >= 3);
	process.env.TZ = "Asia/Seoul";
	// eslint-disable-next-line obsidianmd/no-global-this -- Offline color validation expects a browser document.
	global.window = { document: {} };
	const baselineRoot = option("--baseline");
	const sourceFiles = ["src/utils/recurrence.ts", "src/utils/recurrence/calculation.ts", "src/utils/recurrence/calendar.ts", "src/utils/recurrence/date.ts"];
	const sourceHashes = Object.fromEntries(sourceFiles.map((file) => [file, createHash("sha256").update(readFileSync(file)).digest("hex")]));
	const report = { environment: { node: process.version, platform: process.platform, arch: process.arch, cpu: cpus()[0]?.model, timeZone: process.env.TZ, samples }, baselineRoot, sourceHashes, scope: "Pure recurrence expansion plus virtual-event construction; each run owns a fresh calendar cache. No UI, disk I/O, external ICS, or persistent cache." };
	if (baselineRoot) report.baseline = await benchmark(resolve(baselineRoot), samples);
	report.current = await benchmark(process.cwd(), samples);
	if (report.baseline) {
		for (const [name, current] of Object.entries(report.current)) {
			assert.equal(current.sha256, report.baseline[name].sha256, `${name}: complete serialized events must match`);
			current.reductionPercent = (1 - current.medianMs / report.baseline[name].medianMs) * 100;
		}
	}
	if (option("--output")) writeFileSync(option("--output"), `${JSON.stringify(report, null, 2)}\n`);
	console.log(JSON.stringify(report, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
