import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { cpus, tmpdir } from "node:os";
import { join } from "node:path";
import { performance } from "node:perf_hooks";
import { loadPlannerApi } from "./lib/planner-test-host.mjs";

const args = process.argv.slice(2);
const option = (name) => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const samples = Number(option("--samples") ?? 9);
assert.ok(Number.isInteger(samples) && samples >= 3, "Use at least three measured samples");
process.env.TZ = "Asia/Seoul";

function measure(run) {
	run(); // Warm caches/JIT; fresh snapshots are still built inside workloads that need them.
	const times = [];
	let checksum;
	for (let i = 0; i < samples; i++) {
		const start = performance.now();
		const value = run();
		times.push(performance.now() - start);
		if (i > 0) assert.equal(value, checksum, "Workload results must stay deterministic");
		checksum = value;
	}
	times.sort((a, b) => a - b);
	return { medianMs: times[Math.floor(times.length / 2)], p95Ms: times[Math.ceil(times.length * 0.95) - 1], checksum };
}

async function benchmark(sourceRoot) {
	const api = await loadPlannerApi(sourceRoot);
	const firstHolidayStart = performance.now();
	api.getHolidaysForYear("KR", 2026);
	const firstHolidayLookupMs = performance.now() - firstHolidayStart;
	const metadata = new Map();
	const app = { metadataCache: { getFileCache: (file) => ({ frontmatter: metadata.get(file) ?? {} }) } };
	const dates = Array.from({ length: 365 }, (_, i) => new Date(Date.UTC(2026, 0, i + 1)).toISOString().slice(0, 10));
	const files = Array.from({ length: 10000 }, (_, i) => {
		const start = i % 365;
		const basename = i % 5 === 0 ? `${dates[start]}--${dates[Math.min(364, start + 3)]}-Range ${i}` : `${dates[start]}-Note ${i}`;
		const file = new api.TFile(`Planner/${basename}.md`);
		metadata.set(file, { start_time: `${String(8 + i % 12).padStart(2, "0")}:00` });
		return file;
	});
	const events = Array.from({ length: 600 }, (_, i) => ({
		id: String(i), calendarId: "bench", uid: String(i), instanceId: String(i), title: `Event ${i}`,
		start: `${dates[i % 365]}T09:00:00.000Z`, end: `${dates[i % 365]}T10:00:00.000Z`,
		allDay: false, categories: [], displayTimeZone: "Asia/Seoul",
	}));
	const groupEvents = (selectedDates) => {
		// A render owns a new snapshot; include index construction in the measurement.
		const snapshot = [...events];
		const lookup = api.createExternalEventDateLookup?.(snapshot) ?? ((date) => api.getExternalEventsForDate(snapshot, date));
		return selectedDates.reduce((sum, date) => sum + lookup(date).summaryEvents.length, 0);
	};
	const lookupNotes = () => {
		const snapshot = [...files];
		return dates.reduce((sum, date) => {
			const [year, month, day] = date.split("-").map(Number);
			const result = api.getFilesForDate(app, "Planner", year, month, day, "vault", snapshot);
			return sum + result.singleFiles.length + result.rangeFiles.length;
		}, 0);
	};
	return {
		holidayThreeDays: { ...measure(() => {
			let count = 0;
			for (let i = 0; i < 3; i++) count += api.getHolidaysForYear("KR", 2026).dates.size;
			return count;
		}), firstLookupMs: firstHolidayLookupMs },
		externalMonth42Days: measure(() => groupEvents(dates.slice(290, 332))),
		externalYear365Days: measure(() => groupEvents(dates)),
		notesYear10000Files: measure(lookupNotes),
		externalTimeLabels600: measure(() => events.reduce((sum, event) => sum + api.getExternalEventTimeLabel(event, "ko").length, 0)),
	};
}

const report = {
	environment: { node: process.version, platform: process.platform, arch: process.arch, cpu: cpus()[0]?.model, timeZone: process.env.TZ, samples },
	fixture: { notes: 10000, ranges: 2000, timedExternalEvents: 600, monthCells: 42, yearDays: 365, holidayCountry: "KR" },
};
const compareRef = option("--compare-ref");
let directory;
try {
	if (compareRef) {
		directory = mkdtempSync(join(tmpdir(), "diary-benchmark-baseline-"));
		const archive = join(directory, "baseline.tar");
		execFileSync("git", ["archive", "--output", archive, compareRef, "src", "locales"]);
		execFileSync("tar", ["-xf", archive, "-C", directory]);
		report.baselineRef = execFileSync("git", ["rev-parse", compareRef], { encoding: "utf8" }).trim();
		report.baseline = await benchmark(directory);
	}
	report.current = await benchmark(process.cwd());
	if (report.baseline) {
		for (const [name, current] of Object.entries(report.current)) {
			assert.equal(current.checksum, report.baseline[name].checksum, `${name}: baseline and current results differ`);
			current.reductionPercent = (1 - current.medianMs / report.baseline[name].medianMs) * 100;
		}
	}
	if (option("--output")) writeFileSync(option("--output"), `${JSON.stringify(report, null, 2)}\n`);
	console.log(JSON.stringify(report, null, 2));
} finally {
	if (directory) rmSync(directory, { recursive: true, force: true });
}
