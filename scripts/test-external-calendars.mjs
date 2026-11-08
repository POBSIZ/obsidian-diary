import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { build } from "esbuild";

const result = await build({
	stdin: {
		contents: 'export * from "./src/utils/external-calendars.ts"; export * from "./src/utils/external-calendar-timezone.ts"; export { setFeed } from "obsidian";',
		resolveDir: process.cwd(), loader: "ts",
	},
	bundle: true, write: false, format: "cjs", platform: "node",
	plugins: [{ name: "offline-calendar-host", setup(builder) {
		builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: "obsidian", namespace: "test-host" }));
		builder.onLoad({ filter: /.*/, namespace: "test-host" }, () => ({
			contents: `export class App {}
export class TFile {}
let feed = "";
export function setFeed(value) { feed = value; }
export async function requestUrl() { return {status:200, text:feed, headers:{}}; }`, loader: "js",
		}));
	} }],
});
const bundled = { exports: {} };
new Function("require", "module", "exports", result.outputFiles[0].text)(
	createRequire(import.meta.url), bundled, bundled.exports,
);
const api = bundled.exports;
const calendar = api.normalizeExternalCalendarSettings([{ id:"test", url:"https://example.test/calendar.ics" }])[0];
const app = { metadataCache: { getFileCache: () => null } };
async function eventsForRange(lines, start, end = start, timeZone = "device") {
	api.setFeed(["BEGIN:VCALENDAR", "BEGIN:VEVENT", "UID:regression", "SUMMARY:Flight LJ731", ...lines, "END:VEVENT", "END:VCALENDAR"].join("\r\n"));
	const cache = await api.fetchExternalCalendarCache(calendar);
	assert.equal(cache.lastError, undefined);
	return api.getExternalEventsForRange(app, { externalCalendars:[calendar], externalCalendarCaches:[cache], externalCalendarTimeZone:timeZone }, { start, end }, "monthly", []);
}

const originalZone = process.env.TZ;
try {
	process.env.TZ = "Asia/Seoul";
	const [flight] = await eventsForRange(["DTSTART:20261110T234000Z", "DTEND:20261111T011000Z"], "2026-11-11");
	assert.ok(flight, "UTC previous-day departure must be included in the local Wednesday range");
	assert.equal(api.getExternalEventStartDate(flight), "2026-11-11");
	assert.equal(api.getExternalEventEndDate(flight), "2026-11-11");
	assert.match(api.getExternalEventTimeLabel(flight, "en"), /08:40/);
	assert.equal(api.getExternalEventsForDate([flight], "2026-11-10").summaryEvents.length, 0);
	assert.equal(api.getExternalEventsForDate([flight], "2026-11-11").singleEvents.length, 1);
	assert.equal(flight.instanceId, "2026-11-10T23:40:00.000Z", "display conversion must preserve source identity");
	assert.deepEqual(api.getExternalEventMinutes(flight, "2026-11-11"), { start:520, end:610 });
	const [utcFlight] = await eventsForRange(["DTSTART:20261110T234000Z", "DTEND:20261111T011000Z"], "2026-11-10", "2026-11-11", "UTC");
	assert.equal(api.getExternalEventStartDate(utcFlight), "2026-11-10");
	assert.match(api.getExternalEventTimeLabel(utcFlight, "en"), /11:40 PM/);
	assert.deepEqual(api.getExternalEventMinutes(utcFlight, "2026-11-10"), { start:1420, end:1440 });
	assert.deepEqual(api.getExternalEventMinutes(utcFlight, "2026-11-11"), { start:0, end:70 });
	assert.equal(utcFlight.instanceId, flight.instanceId);
	const eastRecurrences = await eventsForRange(["DTSTART:20261110T234000Z", "DTEND:20261111T011000Z", "RRULE:FREQ=DAILY;COUNT=3", "EXDATE:20261111T234000Z"], "2026-11-11", "2026-11-13");
	assert.deepEqual(eastRecurrences.map(api.getExternalEventStartDate), ["2026-11-11", "2026-11-13"]);
	assert.equal(eastRecurrences[0].instanceId, flight.instanceId);
	const [newYear] = await eventsForRange(["DTSTART:20261231T234000Z", "DTEND:20270101T011000Z"], "2027-01-01");
	assert.equal(api.getExternalEventStartDate(newYear), "2027-01-01");

	process.env.TZ = "America/Los_Angeles";
	const [west] = await eventsForRange(["DTSTART:20261111T014000Z", "DTEND:20261111T031000Z", "RRULE:FREQ=DAILY;COUNT=2"], "2026-11-10");
	assert.ok(west, "next UTC date must remain visible on the final local range date");
	assert.equal(api.getExternalEventStartDate(west), "2026-11-10");
	assert.equal(west.instanceId, "2026-11-11T01:40:00.000Z");
	const [fixedSeoul] = await eventsForRange(["DTSTART:20261110T234000Z", "DTEND:20261111T011000Z"], "2026-11-11", "2026-11-11", "Asia/Seoul");
	assert.equal(api.getExternalEventStartDate(fixedSeoul), "2026-11-11");
	assert.match(api.getExternalEventTimeLabel(fixedSeoul, "en"), /08:40/);
	assert.deepEqual(api.getExternalEventMinutes(fixedSeoul, "2026-11-11"), { start:520, end:610 });
	for (const [instant, expected] of [["20260701T160000Z", 12 * 60], ["20261201T160000Z", 11 * 60]]) {
		const [dst] = await eventsForRange([`DTSTART:${instant}`], "2026-01-01", "2026-12-31", "America/New_York");
		assert.equal(api.getExternalEventMinutes(dst, api.getExternalEventStartDate(dst)).start, expected, "fixed IANA zones must follow seasonal offsets");
	}
	assert.equal(api.normalizeExternalCalendarTimeZone(undefined), "device");
	assert.equal(api.normalizeExternalCalendarTimeZone("Not/AZone"), "device");
	assert.equal(api.normalizeExternalCalendarTimeZone(" Asia/Seoul "), "Asia/Seoul");
	assert.ok(api.getExternalCalendarTimeZones("UTC").includes("UTC"));

	for (const zone of ["Asia/Seoul", "America/Los_Angeles", "UTC"]) {
		process.env.TZ = zone;
		const [allDay] = await eventsForRange(["DTSTART;VALUE=DATE:20261111", "DTEND;VALUE=DATE:20261114"], "2026-11-11", "2026-11-13", "Pacific/Auckland");
		assert.equal(api.getExternalEventStartDate(allDay), "2026-11-11");
		assert.equal(api.getExternalEventEndDate(allDay), "2026-11-13");
		assert.equal(api.isExternalRangeEvent(allDay), true);
		const [floating] = await eventsForRange(["DTSTART:20261111T084000", "DTEND:20261111T101000"], "2026-11-11", "2026-11-11", "America/New_York");
		assert.equal(api.getExternalEventStartDate(floating), "2026-11-11");
		assert.deepEqual(api.getExternalEventMinutes(floating, "2026-11-11"), { start:520, end:610 });
		const [overnight] = await eventsForRange(["DTSTART:20261111T233000", "DTEND:20261112T003000"], "2026-11-11", "2026-11-12");
		assert.equal(api.getExternalEventEndDate(overnight), "2026-11-12");
		assert.equal(api.getExternalEventsForDate([overnight], "2026-11-12").summaryEvents.length, 1);
	}
} finally {
	if (originalZone === undefined) delete process.env.TZ;
	else process.env.TZ = originalZone;
}
console.log("External calendar timezone regressions passed.");
