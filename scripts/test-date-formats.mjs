import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

// eslint-disable-next-line obsidianmd/no-global-this -- This Node test installs the browser host required by plugin utilities.
global.window = { document: {createEl:() => ({style:{color:""}})} };

const obsidianStub = `
export const notices = [], modals = [];
export class TFile {
  constructor(path) { this.path = path; this.name = path.split('/').pop(); this.basename = this.name.replace(/\\.md$/i, ''); this.extension = 'md'; this.stat = {mtime: 1, size: 1}; this.parent = null; }
}
export class TFolder { constructor(path) { this.path = path; this.children = []; } }
export class Notice { constructor(message) { notices.push(message); } }
export class Component { load() {} unload() {} }
export class Modal extends Component { open() { modals.push(this); } close() {} }
export class SuggestModal extends Modal { setPlaceholder(value) { this.placeholder = value; } }
export const Platform = {isMobile:false}, MarkdownRenderer = {render:async()=>{}}, setIcon = ()=>{};
export const requestUrl = async () => { throw new Error('Unexpected network request in offline date tests'); };
`;
const result = await build({
	stdin: {
		contents: `
export * from './src/utils/date-formats';
export * from './src/utils/plan-note-path';
export * from './src/views/yearly-planner/file-utils';
export * from './src/views/yearly-planner/file-operations';
export * from './src/utils/recurrence';
export { rebasePlannerFileBasename, copyPlannerSelectionToClipboard, pastePlannerClipboard, makeDateSelectionKey } from './src/views/planner-clipboard';
export { registerPlannerReminders } from './src/planner-reminders';
export { TFile, TFolder, notices, modals } from 'obsidian';`,
		resolveDir: process.cwd(), loader: "ts",
	},
	bundle: true, write: false, format: "cjs", platform: "node",
	plugins: [{ name: "mock-obsidian", setup(builder) {
		builder.onResolve({ filter: /^obsidian$/ }, () => ({ path: "obsidian", namespace: "mock" }));
		builder.onLoad({ filter: /.*/, namespace: "mock" }, () => ({ contents: obsidianStub, loader: "js" }));
	} }],
});
const directory = mkdtempSync(join(tmpdir(), "diary-date-regressions-"));
const bundlePath = join(directory, "bundle.cjs");
writeFileSync(bundlePath, result.outputFiles[0].text);
let api;
try { api = createRequire(import.meta.url)(bundlePath); }
finally { rmSync(directory, {recursive:true,force:true}); }
const kinds = ["daily", "monthly", "yearly"];
function config(defaultDaily = "literal", extraDaily = []) {
	return {
		daily: { formats: [{id:"iso",format:"YYYY-MM-DD"},{id:"literal",format:"YYYY-[M]MM-DD"},{id:"dot",format:"YYYY.MM.DD"}, ...extraDaily], defaultFormatId: defaultDaily },
		monthly: {formats:[{id:"iso-month",format:"YYYY-MM"},{id:"literal-month",format:"YYYY-[M]MM"}],defaultFormatId:"literal-month"},
		yearly: {formats:[{id:"iso-year",format:"YYYY"},{id:"literal-year",format:"YYYY-[Year]"}],defaultFormatId:"literal-year"},
	};
}
function fakeApp() {
	const files = new Map(), contents = new Map(), metadata = new Map();
	const root = new api.TFolder(""); files.set("", root);
	const app = {
		vault: {
			getRoot: () => root, getAbstractFileByPath: (path) => files.get(path) ?? null,
			getMarkdownFiles: () => [...files.values()].filter((file) => file instanceof api.TFile),
			read: async (file) => contents.get(file.path) ?? "",
			createFolder: async (path) => { const folder = new api.TFolder(path); files.set(path, folder); root.children.push(folder); },
			create: async (path, content) => {
				assert.equal(files.has(path), false, `unexpected duplicate creation: ${path}`);
				const file = new api.TFile(path); file.parent = files.get(path.slice(0, path.lastIndexOf("/"))) ?? root;
				file.parent.children.push(file); files.set(path, file); contents.set(path, content); return file;
			},
			rename: async (file, path) => { const content = contents.get(file.path); files.delete(file.path); contents.delete(file.path); file.path = path; file.name = path.split("/").pop(); file.basename = file.name.replace(/\.md$/i, ""); files.set(path, file); contents.set(path, content); },
			on: () => ({}),
		},
		metadataCache: {getFileCache: (file) => ({frontmatter:metadata.get(file) ?? {}}), on: () => ({})},
		fileManager: {processFrontMatter: async (file, callback) => { const fm = metadata.get(file) ?? {}; callback(fm); metadata.set(file, fm); }},
		workspace: {containerEl:{ownerDocument:{defaultView:null}}},
	};
	return {app, files, metadata, contents};
}

const migrated = api.normalizeDateFormats(undefined, "YYYY.[M]MM.DD");
assert.equal(migrated.daily.defaultFormatId, "iso-daily");
assert.equal(migrated.daily.formats.length, 2);
assert.doesNotThrow(() => api.normalizeDateFormats(undefined, {format:"wrong type"}));
const nonIso = api.normalizeDateFormats({daily:{formats:[{id:"dot",format:"YYYY.MM.DD"}],defaultFormatId:"missing"}});
assert.equal(nonIso.daily.formats.length, 1);
assert.equal(nonIso.daily.defaultFormatId, "dot");
for (const kind of kinds) assert.equal(api.normalizeDateFormats({[kind]:{formats:[]}})[kind].formats.length, 1);

api.configureDateFormats(config());
assert.equal(api.formatDateForFilename("daily", 2026, 10, 13), "2026-M10-13");
assert.equal(api.previewDateFormat("YYYY-[M]MM", "monthly", 2026, 10), "2026-M10");
assert.equal(api.previewDateFormat("YYYY-[Year]", "yearly", 2026), "2026-Year");
for (const format of ["YYYY-MMM-DD", "YYYY-[M]MM", "[YYYY]-MM-DD", "YYYY-MM-DD--", "YYYY-MM-DD.md", "../YYYY-MM-DD", "YYYY-[oops"]) {
	assert.equal(api.validateDateFormat(format, "daily").valid, false, format);
}
assert.equal(api.parsePlannerBasename("2026-M02-30"), null);
assert.equal(api.parsePlannerBasename("2024-M02-29-School--notes").start, "2024-02-29");
assert.equal(api.parsePlannerBasename("2026-M10-13--2026-M10-15-Trip").end, "2026-10-15");
assert.equal(api.parsePlannerBasename("2026-M10-15--2026-M10-13-Trip"), null);

api.configureDateFormats(config("iso", [{id:"us",format:"MM-DD-YYYY"},{id:"eu",format:"DD-MM-YYYY"}]));
assert.equal(api.recognizePlannerBasename("05-06-2026-Visit").status, "ambiguous");
assert.equal(api.recognizePlannerBasename("10-10-2026").status, "ambiguous", "original format must remain knowable before moving a symmetric date");
assert.equal(api.parsePlannerBasename("13-10-2026-Visit").start, "2026-10-13");
api.configureDateFormats(config("iso", [{id:"equivalent",format:"YYYY[-]MM-DD"}]));
assert.equal(api.recognizePlannerBasename("2026-10-13").status, "matched");
api.configureDateFormats(config("iso", [{id:"work",format:"YYYY-MM-DD-[Work]"}]));
assert.equal(api.recognizePlannerBasename("2026-10-13-Work-Meeting").status, "ambiguous", "different suffix boundaries must not be silently resolved");
api.configureDateFormats(config());

assert.equal(api.getPlanNotePath("monthly", "Planner", "SUMMER/YYYY-[M]MM.md", 2026, 10, 2), "SUMMER/2026-M10.md");
assert.equal(api.getPlanNotePath("yearly", "Planner", "[SUMMER]/YYYY-[Year].md", 2026, undefined, 1), "[SUMMER]/2026-[Year].md");
assert.equal(api.getPlanNotePath("yearly", "Planner", "[SUMMER]/YYYY-[Year].md", 2026, undefined, 2), "SUMMER/2026-Year.md");
assert.equal(api.isValidPlanNoteTemplate("[../]YYYY-MM.md", "monthly", 2), false);
assert.equal(api.isValidPlanNoteTemplate("Planner/YYYY-[YYYY].md", "yearly", 2), true);
assert.equal(api.isValidPlanNoteTemplate("Planner/[YYYY]-MM.md", "monthly", 2), false);

const vault = fakeApp();
await vault.app.vault.createFolder("Planner");
const iso = await vault.app.vault.create("Planner/2026-10-13-Meeting.md", "# Meeting\n");
const custom = await vault.app.vault.create("Planner/2026-M10-13-School.md", "# School\n");
const range = await vault.app.vault.create("Planner/2026-M10-13--2026-M10-15-Trip.md", "# Trip\n");
await vault.app.vault.create("Planner/2026-M02-30-Invalid.md", "");
await vault.app.vault.create("Outside/2026-M10-13-Out.md", "");
const scoped = api.getPlannerMarkdownFiles(vault.app, "Planner", "plannerFolder");
const day = api.getFilesForDate(vault.app, "Planner", 2026, 10, 13, "plannerFolder", scoped);
assert.deepEqual(new Set(day.singleFiles), new Set([iso, custom]));
assert.equal(day.rangeFiles.length, 1);
assert.equal(api.getPlannerEventDateString(custom), "2026-10-13", "reminders consume normalized dates");
await api.moveFileToDate(vault.app, custom, 2026, 10, 14);
assert.equal(custom.path, "Planner/2026-M10-14-School.md");
await api.updateFileTitle(vault.app, custom, "School-renamed");
assert.equal(custom.path, "Planner/2026-M10-14-School-renamed.md");
api.configureDateFormats(config("iso"));
await api.moveRangeFileToNewDates(vault.app, range, 2026, 12, 31, 2027, 1, 2);
assert.equal(range.path, "Planner/2026-M12-31--2027-M01-02-Trip.md");
assert.equal(vault.metadata.get(range).date_end, "2027-01-02");
assert.equal(api.rebasePlannerFileBasename(range.path, "2027-02-28"), "2027-M02-28--2027-M03-02-Trip.md");
assert.equal(api.rebasePlannerFileBasename(custom.path, "2027-02-28"), "2027-M02-28-School-renamed.md");
assert.equal(api.parsePlannerFile(custom).start, "2026-10-14");
await api.moveFileToDate(vault.app, custom, 2026, 10, 15);
assert.equal(api.parsePlannerFile(custom).start, "2026-10-15", "cached file parsing invalidates after rename");

const representative = fakeApp();
await representative.app.vault.createFolder("Planner");
const oldDaily = await representative.app.vault.create("Planner/2026-10-13.md", "# Old daily");
const oldMonthly = await representative.app.vault.create("Planner/2026-10.md", "# Old monthly");
api.configureDateFormats(config());
const opened = [], leaf = {openFile:async (file) => opened.push(file)};
await api.openDateNote(representative.app, leaf, "Planner", 2026, 10, 13);
assert.equal(opened[0], oldDaily);
assert.equal(representative.files.has("Planner/2026-M10-13.md"), false);
assert.equal(api.resolvePlanNote(representative.app, "monthly", "Planner", "", 2026, 10).path, oldMonthly.path);
await representative.app.vault.create("Planner/2026-M10-13.md", "# Another daily");
await api.openDateNote(representative.app, leaf, "Planner", 2026, 10, 13);
assert.equal(api.modals.length, 1);
assert.equal(opened.length, 1, "multiple existing notes require explicit selection");
await representative.app.vault.create("Planner/2026-M10.md", "# Another month");
assert.equal(api.resolvePlanNote(representative.app, "monthly", "Planner", "", 2026, 10).candidates.length, 2);
await api.openDateNote(representative.app, leaf, "Planner", 2026, 10, 14);
assert.equal(opened.at(-1).path, "Planner/2026-M10-14.md");

api.configureDateFormats(config("iso", [{id:"us",format:"MM-DD-YYYY"},{id:"eu",format:"DD-MM-YYYY"}]));
const ambiguousVault = fakeApp();
await ambiguousVault.app.vault.createFolder("Planner");
await ambiguousVault.app.vault.create("Planner/03-04-2026.md", "# Ambiguous");
const openedBefore = opened.length, choicesBefore = api.modals.length;
await api.openDateNote(ambiguousVault.app, leaf, "Planner", 2026, 3, 4);
assert.equal(opened.length, openedBefore, "an ambiguous existing representative is not automatically opened on either date");
assert.equal(api.modals.length, choicesBefore + 1);
assert.equal(ambiguousVault.files.has("Planner/2026-03-04.md"), false, "ambiguity must not create a duplicate representative");
api.configureDateFormats(config());

const recurrence = fakeApp();
await recurrence.app.vault.createFolder("Planner");
const source = await recurrence.app.vault.create("Planner/2026-M10-13-Repeat.md", "# Repeat");
recurrence.metadata.set(source, {recurrence_role:"source",recurrence_id:"test-series",recurrence_rule:"FREQ=DAILY",recurrence_anchor_date:"2026-10-13"});
api.configureDateFormats(config("iso"));
const occurrence = await api.createRecurrenceOccurrenceFile({app:recurrence.app,sourcePath:source.path,occurrenceDate:"2026-10-14",plannerFiles:[source]});
assert.equal(occurrence.path, "Planner/2026-M10-14-Repeat.md");
assert.match(recurrence.contents.get(occurrence.path), /recurrence_occurrence_date: "2026-10-14"/);
const existingOccurrence = await recurrence.app.vault.create("Planner/2026.10.15-Repeat.md", "# Existing occurrence");
recurrence.metadata.set(existingOccurrence, {recurrence_role:"occurrence",recurrence_id:"test-series",recurrence_occurrence_date:"2026-10-15",recurrence_source_path:source.path});
assert.equal(await api.createRecurrenceOccurrenceFile({app:recurrence.app,sourcePath:source.path,occurrenceDate:"2026-10-15",plannerFiles:[source,existingOccurrence]}), existingOccurrence);
assert.equal(existingOccurrence.path, "Planner/2026.10.15-Repeat.md");
const metadataSource = await recurrence.app.vault.create("Planner/Recurring schedule.md", "# Metadata source");
recurrence.metadata.set(metadataSource, {recurrence_role:"source",recurrence_id:"metadata-series",recurrence_rule:"FREQ=DAILY",recurrence_anchor_date:"2026-10-13"});
api.configureDateFormats(config());
assert.equal(api.getRecurrenceSourceDefinition(recurrence.app, metadataSource).anchorDate, "2026-10-13", "explicit metadata anchors retain existing generic-filename compatibility");
const metadataOccurrence = await api.createRecurrenceOccurrenceFile({app:recurrence.app,sourcePath:metadataSource.path,occurrenceDate:"2026-10-14",plannerFiles:[metadataSource]});
assert.equal(metadataOccurrence.path, "Planner/2026-M10-14-Recurring schedule.md", "unrecognized source filenames use the creation default for new occurrences");

const onlyDot = config("dot");
onlyDot.daily.formats = [{id:"dot",format:"YYYY.MM.DD"}];
api.configureDateFormats(onlyDot);
const holidays = fakeApp();
const holiday = await api.createHolidayPlannerFile(holidays.app, "Planner", "2026-10-13", "Holiday");
assert.equal(holiday.path, "Planner/2026.10.13-Holiday.md", "holiday drag honors the default after ISO recognition is removed");
const holidayCopy = await api.createHolidayPlannerFile(holidays.app, "Planner", "2026-10-13", "Holiday");
assert.equal(holidayCopy.path, "Planner/2026.10.13-Holiday-2.md");
assert.equal(api.getPlannerEventDateString(holidayCopy), "2026-10-13");
api.configureDateFormats(config());

const copies = fakeApp();
await copies.app.vault.createFolder("Planner");
const copiedRange = await copies.app.vault.create("Planner/2026-M10-13--2026-M10-15-Trip.md", "---\ndate_start: 2026-10-13\ndate_end: 2026-10-15\n---\n# Trip");
await api.copyPlannerSelectionToClipboard(copies.app, [copiedRange]);
const pasted = await api.pastePlannerClipboard(copies.app, "Planner", new Set([api.makeDateSelectionKey("2027-02-28")]));
assert.equal(pasted.ok, true);
assert.equal(pasted.createdPaths[0], "Planner/2027-M02-28--2027-M03-02-Trip.md");
assert.equal(copies.metadata.get(copies.files.get(pasted.createdPaths[0])).date_start, "2027-02-28");
assert.equal(copies.metadata.get(copies.files.get(pasted.createdPaths[0])).date_end, "2027-03-02");
api.configureDateFormats(config("iso", [{id:"copy-pattern",format:"YYYY-MM-DD-[copy]"}]));
const plain = await copies.app.vault.create("Planner/2026-10-13.md", "# Original");
await api.copyPlannerSelectionToClipboard(copies.app, [plain]);
const copyCollision = await api.pastePlannerClipboard(copies.app, "Planner", new Set([api.makeDateSelectionKey("2026-10-13")]));
assert.equal(copyCollision.createdPaths[0], "Planner/2026-10-13-copy2.md", "final collision suffixes must remain recognizable");
assert.equal(copies.files.has("Planner/2026-10-13-copy.md"), false);
api.configureDateFormats(config("iso", [{id:"event-counter-pattern",format:"YYYY-MM-DD-[Visit-2]"}]));
await copies.app.vault.create("Planner/2026-10-13-Visit.md", "# Existing event");
const external = await api.createExternalEventFile(copies.app, "Planner", {id:"external",calendarId:"test",uid:"uid",instanceId:"instance",title:"Visit",start:"2026-10-13",allDay:true,categories:[]}, "Test", "en");
assert.equal(external.path, "Planner/2026-10-13-Visit-3.md", "external note counter suffixes also skip ambiguous final filenames");
api.configureDateFormats(config());

let basenameReads = 0;
const snapshot = Array.from({length:5000}, (_, index) => {
	const file = new api.TFile(`Planner/2026-M10-13-Event${index}.md`);
	const basename = file.basename;
	Object.defineProperty(file, "basename", {get:() => {basenameReads++; return basename;}});
	return file;
});
api.getFilesForDate(vault.app, "Planner", 2026, 10, 1, "vault", snapshot);
const initialReads = basenameReads;
for (let i = 2; i <= 12; i++) api.getFilesForDate(vault.app, "Planner", 2026, 10, i, "vault", snapshot);
assert.equal(basenameReads, initialReads, "date cells reuse the file snapshot index");
api.configureDateFormats(config("iso", [{id:"eu",format:"DD-MM-YYYY"}]));
api.getFilesForDate(vault.app, "Planner", 2026, 10, 1, "vault", snapshot);
assert.ok(basenameReads > initialReads, "format changes invalidate the snapshot index");
api.configureDateFormats(config());

const periodAmbiguity = config();
periodAmbiguity.yearly = {formats:[{id:"prefix",format:"[20]YYYY"},{id:"suffix",format:"YYYY[20]"}],defaultFormatId:"suffix"};
api.configureDateFormats(periodAmbiguity);
assert.equal(api.recognizeRepresentativeBasename("yearly", "202620").status, "ambiguous");
const periodVault = fakeApp();
assert.equal(api.resolvePlanNote(periodVault.app, "yearly", "Planner", "", 2026).ambiguous, true, "ambiguous period defaults cannot create new notes");
const ambiguousYear = await periodVault.app.vault.create("Planner/202620.md", "# Ambiguous year");
const periodResolution = api.resolvePlanNote(periodVault.app, "yearly", "Planner", "", 2026);
assert.equal(periodResolution.ambiguous, true);
assert.equal(periodResolution.candidates[0], ambiguousYear);
assert.equal(api.resolvePlanNote(periodVault.app, "yearly", "Planner", "Planner/YYYY[20].md", 2026, undefined, 2).ambiguous, false, "explicit path overrides retain their own period contract");
api.configureDateFormats(config());

process.env.TZ = "Asia/Seoul";
const NativeDate = Date;
// eslint-disable-next-line obsidianmd/no-global-this -- This Node test supplies a deterministic clock for reminders.
global.Date = class extends NativeDate { constructor(...args) { super(...(args.length ? args : ["2026-10-13T16:30:00+09:00"])); } };
const callbacks = [], cleanups = [];
const reminder = fakeApp();
const reminderNote = await reminder.app.vault.create("2026-M10-13-Reminder.md", "# Reminder");
reminder.metadata.set(reminderNote, {notify_minutes:990});
const win = {setInterval:(fn) => {callbacks.push(fn);return 1;},setTimeout:(fn) => {fn();return 1;},clearTimeout:()=>{}};
reminder.app.workspace.containerEl.ownerDocument.defaultView = win;
api.registerPlannerReminders({app:reminder.app,settings:{plannerFolder:"Planner",plannerFileScope:"vault"},registerEvent:()=>{},registerInterval:()=>{},register:(fn)=>cleanups.push(fn)});
const noticeCount = api.notices.length;
callbacks[0]();
assert.equal(api.notices.length, noticeCount + 1, "non-ISO filenames trigger reminders on their ISO-normalized date");
callbacks[0]();
assert.equal(api.notices.length, noticeCount + 1, "the same reminder fires once");
cleanups.forEach((cleanup) => cleanup());
// eslint-disable-next-line obsidianmd/no-global-this -- Restore the Node test host's original clock.
global.Date = NativeDate;
console.log("Date format regressions passed: strict parsing, legacy paths, representative reuse, moves, copies, recurrence, reminders, and 5,000-file snapshot caching.");
