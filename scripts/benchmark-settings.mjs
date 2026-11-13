import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
import { performance } from "node:perf_hooks";
import { loadSettingsApi, settingsFixture } from "./lib/settings-test-host.mjs";

const args = process.argv.slice(2);
const option = (name) => args.includes(name) ? args[args.indexOf(name) + 1] : undefined;
const samples = Number(option("--samples") ?? 31);
assert.ok(Number.isInteger(samples) && samples >= 3);

async function benchmark(sourceRoot) {
	const api = await loadSettingsApi(sourceRoot);
	const results = {};
	for (const eventCount of [0, 1000, 10000]) {
		for (const operation of ["panelToggle", "yearlyLayout", "paddingControl"]) {
			const { plugin, refreshes, saved } = await settingsFixture(api, eventCount);
			const run = async () => {
				if (operation === "panelToggle") await plugin.togglePlanNotePanelExpanded();
				else if (operation === "yearlyLayout") await plugin.setYearlyPlannerExpandedMonths([1, 6, 12]);
				else {
					plugin.settings.mobileBottomPadding = 4;
					await plugin.saveSettings(["mobileBottomPadding"]);
				}
			};
			await run();
			refreshes.length = 0;
			let replacedEventObjects = 0;
			const times = [];
			for (let i = 0; i < samples; i++) {
				const previous = plugin.settings.externalCalendarCaches[0].events;
				const start = performance.now();
				await run();
				times.push(performance.now() - start);
				replacedEventObjects += previous.filter((event, index) => plugin.settings.externalCalendarCaches[0].events[index] !== event).length;
			}
			times.sort((a, b) => a - b);
			results[`${operation}_${eventCount}`] = {
				medianMs: times[Math.floor(samples / 2)], p95Ms: times[Math.ceil(samples * 0.95) - 1],
				refreshCallsPerSave: refreshes.length / samples, replacedEventObjectsPerSave: replacedEventObjects / samples,
				savedSha256: createHash("sha256").update(saved()).digest("hex"),
			};
		}
	}
	return results;
}

const baselineRoot = option("--baseline");
const report = { node: process.version, samples, method: "Real save methods with JSON serialization and counted refreshes; excludes filesystem writes and UI render cost." };
if (baselineRoot) report.baseline = await benchmark(baselineRoot);
report.current = await benchmark(process.cwd());
if (report.baseline) {
	for (const [name, current] of Object.entries(report.current)) {
		const baseline = report.baseline[name];
		assert.equal(current.savedSha256, baseline.savedSha256, `${name}: persisted setting bytes differ`);
		current.reductionPercent = (1 - current.medianMs / baseline.medianMs) * 100;
	}
}
if (option("--output")) writeFileSync(option("--output"), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
