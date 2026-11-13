import assert from "node:assert/strict";
import Holidays from "date-holidays";
import { loadPlannerApi } from "./lib/planner-test-host.mjs";

// eslint-disable-next-line obsidianmd/no-global-this -- Offline planner color helpers use the browser document.
global.window = { document: { createEl: () => ({ style: { color: "" } }) } };

const api = await loadPlannerApi(process.cwd(), `
export { DateIntervalIndex } from './src/utils/date-interval-index';
export { LruCache } from './src/utils/lru-cache';
export { registerPlannerRefresh } from './src/planner-refresh';
export { ThreeDayPlannerView } from './src/views/three-day-planner/view';`);

const cache = new api.LruCache(2);
cache.set("a", 1); cache.set("b", 2);
assert.equal(cache.get("a"), 1);
cache.set("c", 3);
assert.equal(cache.get("b"), undefined, "Least recently used values are evicted");
cache.set("a", 4); cache.set("d", 5);
assert.equal(cache.get("c"), undefined);
assert.equal(cache.get("a"), 4);
assert.throws(() => new api.LruCache(0));

// Compare the bounded holiday cache to the upstream library and test nested mutation isolation.
for (const country of ["KR", "US", "JP"]) {
	for (const year of [2024, 2026, 2027]) {
		for (const types of [["public"], [], ["observance", "public"]]) {
			const expected = new Set(new Holidays(country).getHolidays(year)
				.filter((holiday) => types.length === 0 || types.includes(holiday.type ?? "public"))
				.map((holiday) => holiday.date.split(" ")[0]));
			const first = api.getHolidaysForYear(country, year, types);
			assert.deepEqual(first.dates, expected);
			const names = JSON.stringify([...first.names]);
			for (const values of first.names.values()) values.push("must not escape");
			first.dates.clear(); first.names.clear();
			const second = api.getHolidaysForYear(country, year, types);
			assert.deepEqual(second.dates, expected);
			assert.equal(JSON.stringify([...second.names]), names);
		}
	}
}

// Deterministic mixed short/long/duplicate intervals compared against a brute-force oracle.
const iso = (offset) => new Date(Date.UTC(2024, 0, offset + 1)).toISOString().slice(0, 10);
const ranges = Array.from({ length: 1500 }, (_, i) => ({
	id: i, start: iso(i * 37 % 1100), end: iso((i * 37 % 1100) + (i % 9 === 0 ? 800 : i % 17)),
}));
ranges.push({ id: "centuries", start: "0001-01-01", end: "9999-12-31" });
const index = new api.DateIntervalIndex(ranges, (range) => range);
const ordered = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
for (let day = -2; day < 1500; day += 7) {
	for (const width of [0, 6, 42]) {
		const start = iso(day), end = iso(day + width);
		assert.deepEqual(index.query(start, end), ordered.filter((range) => range.start <= end && range.end >= start));
	}
}
assert.deepEqual(index.query("2026-02-02", "2026-02-01"), []);
assert.deepEqual(new api.DateIntervalIndex([], (value) => value).query("2026-01-01"), []);

// Indexed external grouping must match the existing single-date API, including input order and range flags.
const originalZone = process.env.TZ;
try {
	for (const deviceZone of ["Asia/Seoul", "America/Los_Angeles"]) {
		process.env.TZ = deviceZone;
		for (const displayTimeZone of ["device", "UTC", "Asia/Seoul", "America/New_York"]) {
			const events = Array.from({ length: 80 }, (_, i) => ({
				id: String(i), title: `Event ${i}`, calendarId: "fixture", uid: String(i), instanceId: String(i),
				start: i % 3 === 0 ? iso(1080 + i % 20) : `${iso(1080 + i % 20)}T23:40:00${i % 2 === 0 ? "Z" : ""}`,
				end: i % 3 === 0 ? iso(1083 + i % 20) : `${iso(1081 + i % 20)}T01:10:00${i % 2 === 0 ? "Z" : ""}`,
				allDay: i % 3 === 0, displayTimeZone, categories: [],
			}));
			const lookup = api.createExternalEventDateLookup(events);
			for (let day = 1078; day <= 1105; day++) {
				assert.deepEqual(lookup(iso(day)), api.getExternalEventsForDate(events, iso(day)));
			}
			for (const event of events.filter((event) => !event.allDay)) {
				for (const locale of ["ko", "en"]) {
					const zone = /Z$/.test(event.start) && displayTimeZone !== "device" ? displayTimeZone : undefined;
					const expected = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { hour: "2-digit", minute: "2-digit", timeZone: zone }).format(new Date(event.start));
					assert.equal(api.getExternalEventTimeLabel(event, locale), expected, "Formatter reuse follows device changes and floating times");
				}
			}
		}
	}
} finally {
	if (originalZone === undefined) delete process.env.TZ;
	else process.env.TZ = originalZone;
}

const files = ["2026-12-31--2027-01-02-Trip", "2027-01-01-Note 10", "2027-01-01-Note 2"]
	.map((name) => new api.TFile(`Planner/${name}.md`));
let metadataReads = 0;
const app = { metadataCache: { getFileCache: () => { metadataReads++; return { frontmatter: {} }; } } };
const firstDay = api.getFilesForDate(app, "Planner", 2027, 1, 1, "vault", files);
assert.deepEqual(firstDay.singleFiles.map((file) => file.basename), ["2027-01-01-Note 2", "2027-01-01-Note 10"]);
assert.equal(metadataReads, 2, "Read each sort key once, rather than per comparator call");
assert.deepEqual(firstDay.rangeFiles[0].runPos, { runStart: true, runEnd: false }, "Range rows restart at the month boundary");
assert.equal(firstDay.rangeFiles[0].isFirst, false);
files[0].basename = "2027-02-01--2027-02-02-Trip";
assert.equal(api.getFilesForDate(app, "Planner", 2027, 1, 1, "vault", [...files]).rangeFiles.length, 0, "A fresh render snapshot reflects a rename");
const config = api.normalizeDateFormats({ daily: { formats: [{ id: "dot", format: "YYYY.MM.DD" }], defaultFormatId: "dot" } });
api.configureDateFormats(config);
assert.equal(api.getFilesForDate(app, "Planner", 2027, 1, 1, "vault", files).singleFiles.length, 0, "Date-format revisions invalidate existing snapshot indexes");
api.configureDateFormats(api.normalizeDateFormats(undefined));

// Exercise the real 3-day data path across New Year with an excluded and materialized occurrence.
const source = new api.TFile("Planner/2026-12-01--2026-12-03-Repeat.md");
const occurrence = new api.TFile("Planner/2027-01-01--2027-01-03-Repeat.md");
const dailyFiles = [source, occurrence];
const dailyMetadata = new Map([
	[source, { recurrence_role: "source", recurrence_id: "series", recurrence_rule: "FREQ=DAILY", recurrence_anchor_date: "2026-12-01", recurrence_exdates: ["2026-12-31"] }],
	[occurrence, { recurrence_role: "occurrence", recurrence_id: "series", recurrence_occurrence_date: "2027-01-01", recurrence_source_path: source.path }],
]);
let vaultScans = 0;
const dailyApp = {
	vault: { getMarkdownFiles: () => { vaultScans++; return [...dailyFiles]; }, getAbstractFileByPath: (path) => dailyFiles.find((file) => file.path === path) },
	metadataCache: { getFileCache: (file) => ({ frontmatter: dailyMetadata.get(file) }) },
};
const dailyView = Object.create(api.ThreeDayPlannerView.prototype);
Object.assign(dailyView, { app: dailyApp, year: 2026, month: 12, day: 31,
	plugin: { settings: { plannerFolder: "Planner", plannerFileScope: "vault", externalCalendars: [], externalCalendarCaches: [], locale: "en", showHolidays: false } } });
const visibleDays = dailyView.getVisibleDays();
assert.equal(vaultScans, 1, "The entire 3-day view shares a single file snapshot");
assert.deepEqual(visibleDays.map((day) => day.dateString), ["2026-12-31", "2027-01-01", "2027-01-02"]);
assert.equal(visibleDays[0].entries.length, 0, "Excluded occurrences stay absent");
assert.deepEqual(visibleDays[1].entries.map((entry) => entry.kind), ["range"], "A materialized occurrence suppresses its virtual duplicate");
assert.equal(visibleDays[2].entries.filter((entry) => entry.kind === "external").length, 1);
// Remove the exclusion and materialized file: range occurrences keep the original per-date placement.
dailyMetadata.get(source).recurrence_exdates = [];
dailyFiles.pop();
const virtualDays = dailyView.getVisibleDays();
assert.deepEqual(virtualDays.map((day) => day.entries.length), [1, 1, 1], "Batch expansion does not leak the prior day's virtual range into later columns");

// Lifecycle uses fake timers so startup suppression, coalescing and cancellation are exact.
// eslint-disable-next-line obsidianmd/no-global-this -- Save the browser host before installing fake timers.
const previousWindow = global.window;
const timers = new Map(), listeners = new Map(), cleanup = [];
let nextId = 0, layoutReady, refreshes = 0;
// eslint-disable-next-line obsidianmd/no-global-this -- This offline test supplies deterministic browser timers.
global.window = {
	setTimeout: (callback) => { timers.set(++nextId, callback); return nextId; },
	clearTimeout: (id) => timers.delete(id), setInterval: () => ++nextId,
};
try {
	const plugin = {
		app: { workspace: { onLayoutReady: (callback) => { layoutReady = callback; } },
			vault: { on: (name, callback) => listeners.set(name, callback) },
			metadataCache: { on: (name, callback) => listeners.set(name, callback) } },
		register: (callback) => cleanup.push(callback), registerEvent: () => {}, registerInterval: () => {},
		refreshYearlyPlannerViews: () => refreshes++, refreshMonthlyPlannerViews: () => refreshes++,
		refreshMonthlyListPlannerViews: () => refreshes++, refreshDailyPlannerViews: () => refreshes++,
	};
	api.registerPlannerRefresh(plugin);
	listeners.get("create")();
	assert.equal(timers.size, 0, "Startup file enumeration must not schedule rendering");
	layoutReady();
	for (const callback of listeners.values()) callback();
	assert.equal(timers.size, 1, "A burst across all event types produces one refresh");
	const callback = [...timers.values()][0]; timers.clear(); callback();
	assert.equal(refreshes, 4);
	listeners.get("changed")();
	const pending = [...timers.values()][0];
	for (const dispose of cleanup) dispose();
	assert.equal(timers.size, 0);
	pending(); layoutReady(); listeners.get("create")();
	assert.equal(refreshes, 4, "Unloaded plugins must not execute deferred refreshes");
	assert.equal(timers.size, 0);
} finally {
	// eslint-disable-next-line obsidianmd/no-global-this -- Restore the previous host after the offline lifecycle test.
	if (previousWindow === undefined) delete global.window;
	else global.window = previousWindow; // eslint-disable-line obsidianmd/no-global-this -- Restore the original test host.
}
console.log("Planner performance regressions passed (bounded caches, interval queries, grouping equivalence, time labels, sorting and refresh lifecycle).");
