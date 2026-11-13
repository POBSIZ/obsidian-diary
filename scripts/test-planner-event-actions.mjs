import assert from "node:assert/strict";
import { build } from "esbuild";

const mocks = {
	"external-event-modal": `export const modals = [];
export class ExternalEventModal {
	constructor(app, options) { this.app = app; this.options = options; modals.push(this); }
	open() { this.opened = true; }
}`,
	"i18n": "export const t = (key) => key;",
	"external-calendars": `export const nameCalls = [];
export function getExternalCalendarName(settings, id) {
	nameCalls.push({ settings, id });
	return settings.externalCalendars.find((calendar) => calendar.id === id)?.name ?? "Calendar";
}`,
	"recurrence": `export const materializations = [];
export const isRecurrenceVirtualEvent = (event) => Boolean(event.recurrenceSourcePath);
export async function createRecurrenceOccurrenceFile(options) {
	materializations.push(options);
	return { path: options.sourcePath + ":" + options.occurrenceDate };
}`,
	"file-utils": `export const scans = [];
export function getPlannerMarkdownFiles(app, folder, scope) {
	scans.push({ app, folder, scope });
	return app.files;
}`,
};
const result = await build({
	stdin: {
		contents: `export { openPlannerEventModal } from "./src/views/planner-event-actions.ts";
export { modals } from "./src/views/external-event-modal";
export { materializations } from "./src/utils/recurrence";
export { scans } from "./src/views/yearly-planner/file-utils";
export { nameCalls } from "./src/utils/external-calendars";`,
		resolveDir: process.cwd(), loader: "ts",
	},
	bundle: true, write: false, format: "esm", platform: "node",
	plugins: [{
		name: "planner-action-test-host",
		setup(builder) {
			builder.onResolve({ filter: /(?:external-event-modal|i18n|external-calendars|recurrence|file-utils)$/ }, (args) => {
				const name = args.path.split("/").pop();
				return { path: name, namespace: "test-host" };
			});
			builder.onLoad({ filter: /.*/, namespace: "test-host" }, (args) => ({ contents: mocks[args.path], loader: "js" }));
		},
	}],
});
const actions = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`);

function deferred() {
	let resolve;
	const promise = new Promise((complete) => { resolve = complete; });
	return { promise, resolve };
}

function fixture(settings = {}) {
	actions.modals.length = 0;
	actions.materializations.length = 0;
	actions.scans.length = 0;
	actions.nameCalls.length = 0;
	const app = { files: [{ path: "Planner/source.md" }, { path: "Elsewhere/note.md" }] };
	const leaf = { name: "original sidebar or main leaf" };
	const events = [];
	const plugin = {
		settings: {
			plannerFolder: "Plans",
			plannerFileScope: "plannerFolder",
			locale: "ko",
			externalCalendars: [{ id: "feed", name: "Work calendar" }],
			...settings,
		},
		async openPlannerFile(openLeaf, file) { events.push(["open", openLeaf, file]); },
		async refreshExternalCalendar(id) { events.push(["refresh", id]); return true; },
	};
	function open(event) {
		actions.openPlannerEventModal(app, plugin, leaf, event, () => events.push(["render"]));
		const modal = actions.modals.at(-1);
		assert.equal(modal.app, app);
		assert.equal(modal.opened, true);
		assert.equal(modal.options.event, event, "event identity and source timestamps are retained");
		return modal.options;
	}
	return { app, leaf, events, plugin, open };
}

const external = { id: "instance", calendarId: "feed", start: "2026-11-14T02:00:00Z" };
const recurrence = { ...external, recurrenceSourcePath: "Plans/source.md", recurrenceOccurrenceDate: "2026-11-14" };

{
	const host = fixture();
	const options = host.open(external);
	assert.equal(options.calendarName, "Work calendar");
	assert.equal(options.folder, "Plans");
	assert.equal(options.locale, "ko");
	assert.equal(options.createFile, undefined, "external notes retain ExternalEventModal's existing creation path");
	assert.equal(options.readOnlyHint, undefined);
	assert.equal(options.createSuccessMessage, undefined);
	assert.deepEqual(actions.scans, [], "opening an external event must not scan planner notes");
	assert.deepEqual(actions.nameCalls, [{ settings: host.plugin.settings, id: "feed" }]);
	assert.equal(await options.onRefresh(), true);
	assert.deepEqual(host.events, [["refresh", "feed"], ["render"]]);
	const file = { path: "Plans/created.md" };
	await options.onCreated(file);
	assert.deepEqual(host.events.slice(2), [["open", host.leaf, file], ["render"]]);
	assert.deepEqual(actions.materializations, [], "external callbacks must not create recurrence occurrences");
}

for (const scope of ["vault", "plannerFolder"]) {
	const host = fixture({ plannerFileScope: scope });
	const options = host.open(recurrence);
	assert.deepEqual(actions.scans, [{ app: host.app, folder: "Plans", scope }]);
	assert.equal(options.calendarName, "recurrence.virtualSource");
	assert.equal(options.readOnlyHint, "recurrence.virtualHint");
	assert.equal(options.createSuccessMessage, "recurrence.createSuccess");
	assert.equal(options.onRefresh, undefined, "virtual occurrences cannot refresh an external feed");
	assert.deepEqual(actions.nameCalls, []);
	assert.deepEqual(actions.materializations, [], "opening a recurrence modal must not create a note");
	const scanSnapshot = host.app.files;
	host.app.files = [];
	const file = await options.createFile();
	assert.deepEqual(actions.materializations, [{
		app: host.app,
		sourcePath: "Plans/source.md",
		occurrenceDate: "2026-11-14",
		plannerFiles: scanSnapshot,
	}], "creation retains the scoped file snapshot captured when opening the modal");
	await options.onCreated(file);
	assert.deepEqual(host.events, [["open", host.leaf, file], ["render"]]);
}

{
	const host = fixture({ plannerFolder: "", plannerFileScope: undefined, locale: undefined });
	const options = host.open(recurrence);
	assert.equal(options.folder, "Planner");
	assert.equal(options.locale, "en");
	assert.deepEqual(actions.scans, [{ app: host.app, folder: "Planner", scope: "vault" }]);
}

{
	const host = fixture();
	const wait = deferred();
	host.plugin.openPlannerFile = async (...args) => {
		host.events.push(["open", ...args]);
		await wait.promise;
	};
	const options = host.open(external);
	const file = { path: "Plans/awaited.md" };
	const created = options.onCreated(file);
	assert.deepEqual(host.events, [["open", host.leaf, file]], "render must wait for note routing to finish");
	wait.resolve();
	await created;
	assert.deepEqual(host.events.at(-1), ["render"]);
}

for (const outcome of [true, false]) {
	const host = fixture();
	const wait = deferred();
	host.plugin.refreshExternalCalendar = async (id) => {
		host.events.push(["refresh", id]);
		await wait.promise;
		return outcome;
	};
	const refreshed = host.open(external).onRefresh();
	assert.deepEqual(host.events, [["refresh", "feed"]], "render must wait for feed refresh to finish");
	wait.resolve();
	assert.equal(await refreshed, outcome, "refresh result remains available to the modal");
	assert.deepEqual(host.events.at(-1), ["render"]);
}

for (const callback of ["onCreated", "onRefresh"]) {
	const host = fixture();
	const failure = new Error("original action failure");
	host.plugin.openPlannerFile = async () => { throw failure; };
	host.plugin.refreshExternalCalendar = async () => { throw failure; };
	const options = host.open(external);
	await assert.rejects(options[callback]({ path: "Plans/failure.md" }), (error) => error === failure);
	assert.deepEqual(host.events, [], "failed actions retain their existing no-render behavior");
}

console.log("Planner event action regressions passed (external, recurrence, scope, routing, async order, failures).");
