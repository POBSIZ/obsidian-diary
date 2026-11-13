import assert from "node:assert/strict";
import { loadSettingsApi, settingsFixture } from "./lib/settings-test-host.mjs";

const api = await loadSettingsApi();
const { plugin, refreshes, leaves, saved } = await settingsFixture(api);
let scopeChecks = 0;
plugin.plannerReminders = { refreshScope: () => scopeChecks++ };

// A full save continues to validate externally changed data and refresh all surfaces.
plugin.settings.externalCalendarTimeZone = "invalid/timezone";
plugin.settings.yearlyPlannerExpandedMonths = [12, 0, 1, 12, "2"];
await plugin.saveSettings();
assert.equal(plugin.settings.externalCalendarTimeZone, "device");
assert.deepEqual(plugin.settings.yearlyPlannerExpandedMonths, [1, 2, 12]);
assert.equal(refreshes.length, 4);
assert.equal(scopeChecks, 1);
assert.deepEqual(JSON.parse(saved()), JSON.parse(JSON.stringify(plugin.settings)));

// Presentation changes reuse normalized cache objects, preserving every persisted event.
const caches = plugin.settings.externalCalendarCaches;
const events = caches[0].events;
const expectedEvents = JSON.stringify(events);
refreshes.length = 0;
await plugin.setYearlyPlannerExpandedMonths([5, 3, 5]);
assert.deepEqual(plugin.settings.yearlyPlannerExpandedMonths, [3, 5]);
assert.deepEqual(refreshes, ["refreshYearlyPlannerViews"]);
assert.equal(plugin.settings.externalCalendarCaches, caches);
assert.equal(plugin.settings.externalCalendarCaches[0].events, events);
assert.equal(JSON.stringify(JSON.parse(saved()).externalCalendarCaches[0].events), expectedEvents);

// The real panel helper updates body/header presentation without rebuilding the grid.
const toggled = [];
const body = { toggleClass: (name, value) => toggled.push(["body", name, value]) };
const button = { setAttribute: (name, value) => toggled.push(["button", name, value]) };
const wrapper = { querySelector: (selector) => selector.includes("body") ? body : button,
	toggleClass: (name, value) => toggled.push(["wrapper", name, value]) };
const view = Object.create(api.MonthlyPlannerView.prototype);
view.contentEl = { querySelector: () => wrapper };
leaves.set(api.VIEW_TYPE_MONTHLY_PLANNER, [{ view }]);
plugin.settings.planNotePanelExpanded = true;
refreshes.length = 0;
await plugin.togglePlanNotePanelExpanded();
assert.equal(plugin.settings.planNotePanelExpanded, false);
assert.deepEqual(refreshes, []);
assert.deepEqual(toggled.slice(0, 2), [["body", "is-collapsed", true], ["wrapper", "is-collapsed", true]]);
assert.equal(toggled[2][1], "aria-label");
assert.equal(plugin.settings.externalCalendarCaches, caches);

for (const [keys, expected] of [
	[["yearlyPlanNotePath", "yearlyPlanNotePathGrammarVersion"], ["refreshYearlyPlannerViews"]],
	[["monthlyPlanNotePath", "monthlyPlanNotePathGrammarVersion"], ["refreshMonthlyPlannerViews", "refreshMonthlyListPlannerViews"]],
	[["weekStart"], ["refreshYearlyPlannerViews", "refreshMonthlyPlannerViews", "refreshMonthlyListPlannerViews", "refreshDailyPlannerViews"]],
]) {
	refreshes.length = 0;
	await plugin.saveSettings(keys);
	assert.deepEqual(refreshes, expected);
}

// A failed disk save must not claim success by refreshing the UI or reminder scope.
refreshes.length = 0;
scopeChecks = 0;
plugin.saveData = async () => { throw new Error("Disk write failed"); };
await assert.rejects(plugin.saveSettings(), /Disk write failed/);
assert.equal(scopeChecks, 0);
assert.deepEqual(refreshes, []);

// Optional differential contract check against an immutable source snapshot.
const baselineRoot = process.argv[2];
if (baselineRoot) {
	const baseline = await loadSettingsApi(baselineRoot);
	for (const [changes, keys] of [
		[{ planNotePanelExpanded: false }, ["planNotePanelExpanded"]],
		[{ yearlyPlannerExpandedMonths: [12, 1, 12] }, ["yearlyPlannerExpandedMonths"]],
		[{ locale: "ko" }, ["locale"]],
		[{ externalCalendarTimeZone: "Asia/Seoul" }, ["externalCalendarTimeZone"]],
		[{ monthlyPlanNotePath: "Notes/YYYY-MM.md", monthlyPlanNotePathGrammarVersion: 2 }, ["monthlyPlanNotePath", "monthlyPlanNotePathGrammarVersion"]],
		[{ weekStart: 1, plannerFolder: "Events" }, undefined],
	]) {
		const before = await settingsFixture(baseline), after = await settingsFixture(api);
		Object.assign(before.plugin.settings, changes); Object.assign(after.plugin.settings, changes);
		await before.plugin.saveSettings(); await after.plugin.saveSettings(keys);
		assert.deepEqual(JSON.parse(after.saved()), JSON.parse(before.saved()), "Persisted data must match the previous full-save path");
	}
	for (const [key, value] of [
		["locale", "ko"], ["plannerFolder", " Events "], ["plannerFileScope", "plannerFolder"],
		["weekStart", 1], ["yearlyPlanNotePath", "Notes/YYYY.md"], ["monthlyPlanNotePath", "Notes/YYYY-MM.md"],
		["dateFormat", "YYYY-MM-DD"], ["showHolidays", false], ["holidayCountry", "JP"],
		["mobileBottomPadding", 4], ["mobileCellWidth", 5],
	]) {
		const before = await settingsFixture(baseline), after = await settingsFixture(api);
		for (const [host, fixture] of [[baseline, before], [api, after]]) {
			const tab = new host.DiaryObsidianSettingTab(fixture.plugin.app, fixture.plugin);
			tab.update = () => {};
			await tab.setControlValue(key, value);
		}
		assert.deepEqual(JSON.parse(after.saved()), JSON.parse(before.saved()), `${key}: control persistence must match baseline`);
	}

}
console.log("Settings persistence regressions passed (complete validation, scoped normalization, panel state, reminder scope and save failures).");
