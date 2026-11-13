import assert from "node:assert/strict";
import { resolve } from "node:path";
import { CALENDARS, isoAfter, loadRecurrenceApi, makeRecurrenceFixture } from "./benchmark-recurrence.mjs";

// eslint-disable-next-line obsidianmd/no-global-this -- Offline color validation expects a browser document.
global.window = { document: {} };
const api = await loadRecurrenceApi(process.cwd());
const events = (host, range, currentApi = api) => currentApi.getRecurrenceVirtualEventsForRange({ ...host, range });
const recurrenceDates = (options, start, end) => events(makeRecurrenceFixture(api, [options]), { start, end }).map((event) => event.start);

assert.deepEqual(recurrenceDates({ anchor: "2026-12-25", rule: "FREQ=WEEKLY;INTERVAL=2", until: "2027-02-05", exdates: ["2027-01-08"], materialized: ["2027-01-22"] }, "2026-12-01", "2027-03-01"), ["2027-02-05"], "anchor is excluded, until is inclusive, exclusions and materialized occurrences suppress their virtual events");
assert.deepEqual(recurrenceDates({ anchor: "2024-02-29", rule: "FREQ=YEARLY" }, "2024-01-01", "2028-03-01"), ["2028-02-29"], "Gregorian leap-day recurrence does not clamp to another day");
assert.deepEqual(recurrenceDates({ anchor: "2026-01-31", rule: "FREQ=MONTHLY" }, "2026-01-01", "2026-05-31"), ["2026-03-31", "2026-05-31"], "short months are skipped");
assert.deepEqual(recurrenceDates({ anchor: "2026-01-01", rule: "FREQ=DAILY;INTERVAL=3" }, "2026-01-02", "2026-01-11"), ["2026-01-04", "2026-01-07", "2026-01-10"], "intervals are aligned to the anchor rather than range start");
assert.deepEqual(recurrenceDates({ anchor: "2026-01-01", rule: "FREQ=DAILY;INTERVAL=999" }, "2026-12-01", "2027-01-01"), []);
assert.deepEqual(recurrenceDates({ anchor: "2026-01-01", rule: "FREQ=WEEKLY" }, "2025-01-01", "2025-12-31"), []);
for (const calendar of ["korean-lunar", "chinese", "dangi"]) {
	assert.equal(api.getCalendarDateParts("2023-03-22", calendar).isLeapMonth, true, "2023 leap second lunar month is retained");
	assert.deepEqual(recurrenceDates({ anchor: "2023-03-22", calendar, rule: "FREQ=MONTHLY" }, "2025-07-01", "2025-08-31"), ["2025-07-25"], "leap-month sources keep their existing leap-only matching rule");
}

// Every calculation owns a fresh snapshot; metadata and color edits must be visible immediately.
const mutable = makeRecurrenceFixture(api, [{ anchor: "2026-12-29", rule: "FREQ=DAILY" }]);
const range = { start: "2026-12-29", end: "2027-01-03" };
const before = events(mutable, range);
const fm = mutable.metadata.get(mutable.plannerFiles[0]);
fm.recurrence_exdates = ["2027-01-01"];
fm.color = "#fedcba";
const after = events(mutable, range);
assert.equal(before.length - after.length, 1);
assert.ok(after.every((event) => event.start !== "2027-01-01" && event.color === "#fedcba"));
assert.equal(events(mutable, range).find((event) => event.start === "2027-01-02").id, "diary-recurrence:series-0:2027-01-02");

// All calendars exercise leap-month / era boundaries and fresh renders after a device-zone change.
const baselineArg = process.argv.indexOf("--baseline");
const baseline = baselineArg >= 0 ? await loadRecurrenceApi(resolve(process.argv[baselineArg + 1])) : null;
let compared = 0;
const originalTimeZone = process.env.TZ;
try {
	for (const timeZone of ["Asia/Seoul", "America/New_York"]) {
		process.env.TZ = timeZone;
		for (const anchor of ["2019-04-30", "2023-03-22", "2024-02-29", "2025-07-25", "2026-12-31"]) {
			for (const calendar of CALENDARS) {
				const sources = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].flatMap((frequency, i) => [1, 2, 13].map((interval) => ({
					anchor, calendar, rule: `FREQ=${frequency};INTERVAL=${interval}`, span: i === 2 ? 3 : 0,
					until: isoAfter(anchor, 390), exdates: [isoAfter(anchor, 7), isoAfter(anchor, 28)], materialized: [isoAfter(anchor, 14)], unstoredAnchor: interval === 13,
				})));
				const host = makeRecurrenceFixture(api, sources);
				const baselineHost = baseline ? makeRecurrenceFixture(baseline, sources) : null;
				for (const days of [-8, 0, 31, 340]) {
					const selectedRange = { start: isoAfter(anchor, days), end: isoAfter(anchor, days + 41) };
					const actual = events(host, selectedRange);
					assert.ok(actual.every((event) => event.start >= selectedRange.start && event.start <= selectedRange.end));
					assert.deepEqual(actual, events(host, selectedRange), "no mutations or persistent cache state between calls");
					if (baseline) assert.deepEqual(actual, events(baselineHost, selectedRange, baseline), `${timeZone}/${anchor}/${calendar}/${days}: all serialized virtual-event fields and ordering must match baseline`);
					compared++;
				}
			}
		}
	}
} finally {
	if (originalTimeZone === undefined) delete process.env.TZ;
	else process.env.TZ = originalTimeZone;
}
console.log(`Recurrence regressions passed: ${compared} calendar/range/time-zone cases, anchor alignment, leap days, short months, stable identities, colors, exclusions and materialized-occurrence de-duplication${baseline ? "; all complete outputs match baseline" : ""}.`);
