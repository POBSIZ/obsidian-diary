import { loadPlannerApi } from "./planner-test-host.mjs";

export function loadSettingsApi(sourceRoot = process.cwd()) {
	return loadPlannerApi(sourceRoot, `
export { default as Diary } from './src/main';
export { DEFAULT_SETTINGS, DiaryObsidianSettingTab } from './src/settings';
export { MonthlyPlannerView } from './src/views/monthly-planner/view';
export { VIEW_TYPE_MONTHLY_PLANNER } from './src/constants';`);
}

export async function settingsFixture(api, eventCount = 1000) {
	const calendar = api.normalizeExternalCalendarSettings([{ id: "fixture", url: "https://example.invalid/offline.ics" }])[0];
	const events = Array.from({ length: eventCount }, (_, i) => ({
		id: String(i), calendarId: calendar.id, uid: String(i), instanceId: "2026-11-14", title: `Event ${i}`,
		start: "2026-11-14T09:00:00.000Z", end: "2026-11-14T10:00:00.000Z", allDay: false, categories: [],
	}));
	const raw = { ...structuredClone(api.DEFAULT_SETTINGS), externalCalendars: [calendar], externalCalendarCaches: [{
		calendarId: calendar.id, urlHash: "fixture", fetchedAt: "2026-11-14T00:00:00.000Z", events,
	}] };
	const plugin = new api.Diary();
	const leaves = new Map(), refreshes = [];
	plugin.app = { workspace: { getLeavesOfType: (type) => leaves.get(type) ?? [] } };
	plugin.loadData = async () => structuredClone(raw);
	await plugin.loadSettings();
	for (const method of ["refreshYearlyPlannerViews", "refreshMonthlyPlannerViews", "refreshMonthlyListPlannerViews", "refreshDailyPlannerViews"]) {
		plugin[method] = () => refreshes.push(method);
	}
	let saved;
	plugin.saveData = async (data) => { saved = JSON.stringify(data); };
	return { plugin, leaves, refreshes, saved: () => saved };
}
