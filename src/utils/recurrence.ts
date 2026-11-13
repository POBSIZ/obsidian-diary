import { App, TFile } from "obsidian";
import type {
	AlternateCalendarId,
	AlternateCalendarSelection,
} from "./alternate-calendars";
import type { ExternalCalendarEvent } from "./external-calendars";
import { parseRangeBasename } from "./range";
import { getFileColorSelection, getFileColorValues, getPlannerFileColor } from "./planner-colors";
import { formatPlannerBasename, isPlannerBasenameForDates, parsePlannerBasename, recognizePlannerBasename } from "./date-formats";
import { t } from "../i18n";
import { getCalendarDateParts, createCalendarDatePartsLookup } from "./recurrence/calendar";
import { expandSimpleRecurrenceDates } from "./recurrence/calculation";
import { addDays, daysBetween, isValidDateString } from "./recurrence/date";

export { getCalendarDateParts } from "./recurrence/calendar";

export const RECURRENCE_GREGORIAN = "gregorian";

export type RecurrenceCalendarId =
	| typeof RECURRENCE_GREGORIAN
	| AlternateCalendarId;

export type RecurrenceRole = "source" | "occurrence";
export type SimpleRecurrenceFrequency =
	| "DAILY"
	| "WEEKLY"
	| "MONTHLY"
	| "YEARLY";

export interface CalendarDateParts {
	year: number;
	month: number;
	day: number;
	era?: string;
	isLeapMonth?: boolean;
}

export interface RecurrenceFormValue {
	enabled: boolean;
	calendar: RecurrenceCalendarId;
	rule: string;
	untilDate?: string | null;
}

export interface RecurrenceSourceDefinition {
	id: string;
	role: "source";
	calendar: RecurrenceCalendarId;
	rule: string;
	anchorDate: string;
	anchorParts: CalendarDateParts;
	untilDate: string | null;
	exdates: string[];
	file: TFile;
}

export interface RecurrenceMaterializeRange {
	start: string;
	end: string;
}

export interface RecurrenceVirtualEvent extends ExternalCalendarEvent {
	recurrenceSourcePath: string;
	recurrenceOccurrenceDate: string;
}

const SIMPLE_RECURRENCE_FREQUENCIES: readonly SimpleRecurrenceFrequency[] = [
	"DAILY",
	"WEEKLY",
	"MONTHLY",
	"YEARLY",
];

const RECURRENCE_SOURCE_KEYS = [
	"recurrence_id",
	"recurrence_role",
	"recurrence_calendar",
	"recurrence_rule",
	"recurrence_anchor_date",
	"recurrence_anchor_year",
	"recurrence_anchor_month",
	"recurrence_anchor_day",
	"recurrence_anchor_era",
	"recurrence_anchor_is_leap_month",
	"recurrence_until_date",
	"recurrence_exdates",
] as const;

const RECURRENCE_OCCURRENCE_KEYS = [
	"diary_color_inherit",
	"recurrence_id",
	"recurrence_role",
	"recurrence_source_path",
	"recurrence_occurrence_date",
	"recurrence_calendar",
	"recurrence_rule",
	"recurrence_anchor_date",
] as const;

export function createRecurrenceId(): string {
	const cryptoObj = typeof window !== "undefined" ? window.crypto : null;
	if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
	const random =
		cryptoObj?.getRandomValues != null
			? Array.from(cryptoObj.getRandomValues(new Uint32Array(2)))
					.map((n) => n.toString(36))
					.join("")
			: Math.random().toString(36).slice(2);
	return `rec-${Date.now().toString(36)}-${random}`;
}

export function normalizeRecurrenceCalendar(
	value: unknown,
): RecurrenceCalendarId {
	if (value === RECURRENCE_GREGORIAN) return RECURRENCE_GREGORIAN;
	if (typeof value !== "string") return RECURRENCE_GREGORIAN;
	if (isAlternateCalendarId(value)) return value;
	return RECURRENCE_GREGORIAN;
}

export function normalizeRecurrenceRule(rule: string): string {
	return buildSimpleRecurrenceRule(
		getSimpleRecurrenceFrequency(rule),
		getRecurrenceInterval(rule),
	);
}

export function buildRecurrenceRuleFromForm(options: {
	frequency: string;
	interval?: number | string;
}): string {
	return buildSimpleRecurrenceRule(
		normalizeSimpleRecurrenceFrequency(options.frequency),
		normalizeRecurrenceInterval(options.interval),
	);
}

export function buildSimpleRecurrenceRule(
	frequency: SimpleRecurrenceFrequency,
	interval = 1,
): string {
	const normalizedInterval = normalizeRecurrenceInterval(interval);
	return normalizedInterval > 1
		? `FREQ=${frequency};INTERVAL=${normalizedInterval}`
		: `FREQ=${frequency}`;
}

export function getSimpleRecurrenceFrequency(
	rule: string,
): SimpleRecurrenceFrequency {
	const pairs = parseRulePairs(rule);
	return normalizeSimpleRecurrenceFrequency(pairs.get("FREQ"));
}

export function getRecurrenceInterval(rule: string): number {
	return normalizeRecurrenceInterval(parseRulePairs(rule).get("INTERVAL"));
}

export function normalizeRecurrenceInterval(value: unknown): number {
	const parsed =
		typeof value === "number"
			? value
			: typeof value === "string"
				? Number(value.trim())
				: 1;
	if (!Number.isFinite(parsed)) return 1;
	return Math.max(1, Math.min(999, Math.floor(parsed)));
}

export function normalizeSimpleRecurrenceFrequency(
	value: unknown,
): SimpleRecurrenceFrequency {
	return typeof value === "string" &&
		SIMPLE_RECURRENCE_FREQUENCIES.includes(
			value.toUpperCase() as SimpleRecurrenceFrequency,
		)
		? (value.toUpperCase() as SimpleRecurrenceFrequency)
		: "YEARLY";
}

export function getRecurrenceRole(app: App, file: TFile): RecurrenceRole | null {
	const fm = app.metadataCache.getFileCache(file)?.frontmatter;
	const role = fm?.recurrence_role;
	return role === "source" || role === "occurrence" ? role : null;
}

export function isRecurrenceOccurrenceFile(app: App, file: TFile): boolean {
	return getRecurrenceRole(app, file) === "occurrence";
}

export function isRecurrenceSourceFile(app: App, file: TFile): boolean {
	return getRecurrenceRole(app, file) === "source";
}

export function getRecurrenceSourceDefinition(
	app: App,
	file: TFile,
): RecurrenceSourceDefinition | null {
	const fm = app.metadataCache.getFileCache(file)?.frontmatter;
	if (!fm || fm.recurrence_role !== "source") return null;
	if (recognizePlannerBasename(file.basename).status === "ambiguous") return null;
	const id = toStringValue(fm.recurrence_id);
	const rule = toStringValue(fm.recurrence_rule);
	const anchorDate =
		toStringValue(fm.recurrence_anchor_date) ??
		getPlannerDateFromBasename(file.basename);
	if (!id || !rule || !anchorDate || !isValidDateString(anchorDate)) {
		return null;
	}

	const calendar = normalizeRecurrenceCalendar(fm.recurrence_calendar);
	const storedAnchor = getStoredAnchorParts(fm);
	const anchorParts =
		storedAnchor ?? getCalendarDateParts(anchorDate, calendar);
	if (!anchorParts) return null;
	const storedUntilDate = toStringValue(fm.recurrence_until_date);
	const untilDate =
		storedUntilDate &&
		isValidDateString(storedUntilDate) &&
		storedUntilDate >= anchorDate
			? storedUntilDate
			: null;

	return {
		id,
		role: "source",
		calendar,
		rule: normalizeRecurrenceRule(rule),
		anchorDate,
		anchorParts,
		untilDate,
		exdates: normalizeDateList(fm.recurrence_exdates),
		file,
	};
}

export function getRecurrenceOccurrenceInfo(
	app: App,
	file: TFile,
): {
	id: string;
	sourcePath: string | null;
	occurrenceDate: string | null;
} | null {
	const fm = app.metadataCache.getFileCache(file)?.frontmatter;
	if (!fm || fm.recurrence_role !== "occurrence") return null;
	const id = toStringValue(fm.recurrence_id);
	if (!id) return null;
	return {
		id,
		sourcePath: toStringValue(fm.recurrence_source_path),
		occurrenceDate: toStringValue(fm.recurrence_occurrence_date),
	};
}

export function buildRecurrenceSourceFrontmatter(
	value: RecurrenceFormValue,
	anchorDate: string,
	existingId?: string | null,
): Record<string, unknown> {
	const calendar = normalizeRecurrenceCalendar(value.calendar);
	const anchorParts =
		getCalendarDateParts(anchorDate, calendar) ??
		getCalendarDateParts(anchorDate, RECURRENCE_GREGORIAN) ?? { year: 0, month: 1, day: 1 };
	const fields: Record<string, unknown> = {
		recurrence_id: existingId || createRecurrenceId(),
		recurrence_role: "source",
		recurrence_calendar: calendar,
		recurrence_rule: normalizeRecurrenceRule(value.rule),
		recurrence_anchor_date: anchorDate,
		recurrence_anchor_year: anchorParts.year,
		recurrence_anchor_month: anchorParts.month,
		recurrence_anchor_day: anchorParts.day,
	};
	if (anchorParts.era) fields.recurrence_anchor_era = anchorParts.era;
	if (anchorParts.isLeapMonth) fields.recurrence_anchor_is_leap_month = true;
	if (
		value.untilDate &&
		isValidDateString(value.untilDate) &&
		value.untilDate >= anchorDate
	) {
		fields.recurrence_until_date = value.untilDate;
	}
	return fields;
}

export function applyRecurrenceSourceFrontmatter(
	frontmatter: Record<string, unknown>,
	value: RecurrenceFormValue | null,
	anchorDate: string,
	existingId?: string | null,
): void {
	const existingExdates = normalizeDateList(frontmatter.recurrence_exdates);
	removeRecurrenceFrontmatter(frontmatter);
	if (!value?.enabled) return;
	const fields = buildRecurrenceSourceFrontmatter(value, anchorDate, existingId);
	for (const [key, fieldValue] of Object.entries(fields)) {
		frontmatter[key] = fieldValue;
	}
	if (existingExdates.length > 0) {
		frontmatter.recurrence_exdates = existingExdates;
	}
}

export function removeRecurrenceFrontmatter(
	frontmatter: Record<string, unknown>,
): void {
	for (const key of RECURRENCE_SOURCE_KEYS) delete frontmatter[key];
	for (const key of RECURRENCE_OCCURRENCE_KEYS) delete frontmatter[key];
}

export async function detachRecurrenceOccurrence(
	app: App,
	file: TFile,
): Promise<void> {
	const selection = getFileColorSelection(app, file);
	const currentColor = selection.mode === "inherit" ? getFileColorValues(app, file, selection) : null;
	await app.fileManager.processFrontMatter(
		file,
		(frontmatter: Record<string, unknown>) => {
			removeRecurrenceFrontmatter(frontmatter);
			if (currentColor) {
				if (currentColor.color) frontmatter.color = currentColor.color;
				else delete frontmatter.color;
				if (currentColor.colorId) frontmatter.diary_color_id = currentColor.colorId;
				else delete frontmatter.diary_color_id;
			}
		},
	);
}

export async function addRecurrenceExdate(
	app: App,
	sourceFile: TFile,
	dateStr: string,
): Promise<void> {
	if (!isValidDateString(dateStr)) return;
	await app.fileManager.processFrontMatter(
		sourceFile,
		(frontmatter: Record<string, unknown>) => {
			const dates = normalizeDateList(frontmatter.recurrence_exdates);
			if (!dates.includes(dateStr)) dates.push(dateStr);
			frontmatter.recurrence_exdates = dates.sort();
		},
	);
}

export function getRecurrenceVirtualEventsForRange(args: {
	app: App;
	plannerFiles: TFile[];
	range: RecurrenceMaterializeRange;
}): RecurrenceVirtualEvent[] {
	const existingOccurrenceKeys = new Set<string>();
	for (const file of args.plannerFiles) {
		const occurrence = getRecurrenceOccurrenceInfo(args.app, file);
		if (occurrence?.occurrenceDate) {
			existingOccurrenceKeys.add(`${occurrence.id}|${occurrence.occurrenceDate}`);
		}
	}

	const events: RecurrenceVirtualEvent[] = [];
	const getParts = createCalendarDatePartsLookup();
	for (const file of args.plannerFiles) {
		const source = getRecurrenceSourceDefinition(args.app, file);
		if (!source) continue;
		const sourceFm = args.app.metadataCache.getFileCache(file)?.frontmatter ?? {};
		const targetTemplate = materializeTargetPath(source, source.anchorDate);
		const color = getPlannerFileColor(args.app, file) ?? undefined;
		const timeLabel = getPlannerTimeLabelFromFrontmatter(sourceFm);
		for (const occurrenceDate of expandRecurrenceDates(source, args.range, getParts)) {
			if (occurrenceDate === source.anchorDate) continue;
			if (existingOccurrenceKeys.has(`${source.id}|${occurrenceDate}`)) continue;
			const target = materializeTargetPath(source, occurrenceDate);
			events.push({
				id: `diary-recurrence:${source.id}:${occurrenceDate}`,
				calendarId: "diary-recurrence",
				uid: source.id,
				instanceId: occurrenceDate,
				title: timeLabel
					? `${timeLabel} ${targetTemplate.title}`
					: targetTemplate.title,
				start: occurrenceDate,
				end: target.rangeEnd,
				allDay: true,
				categories: [],
				color,
				recurrenceSourcePath: file.path,
				recurrenceOccurrenceDate: occurrenceDate,
			});
		}
	}

	return events.sort((a, b) => {
		const dateCompare = a.start.localeCompare(b.start);
		return dateCompare !== 0 ? dateCompare : a.title.localeCompare(b.title);
	});
}

export function isRecurrenceVirtualEvent(
	event: ExternalCalendarEvent,
): event is RecurrenceVirtualEvent {
	return (
		"recurrenceSourcePath" in event &&
		typeof event.recurrenceSourcePath === "string" &&
		"recurrenceOccurrenceDate" in event &&
		typeof event.recurrenceOccurrenceDate === "string"
	);
}

export async function createRecurrenceOccurrenceFile(args: {
	app: App;
	sourcePath: string;
	occurrenceDate: string;
	plannerFiles: TFile[];
}): Promise<TFile> {
	const sourceFile = args.app.vault.getAbstractFileByPath(args.sourcePath);
	if (!(sourceFile instanceof TFile)) {
		throw new Error("The repeat source note no longer exists.");
	}
	const source = getRecurrenceSourceDefinition(args.app, sourceFile);
	if (!source) throw new Error("The repeat source is no longer valid.");
	const matches = expandRecurrenceDates(source, {
		start: args.occurrenceDate,
		end: args.occurrenceDate,
	});
	if (!matches.includes(args.occurrenceDate)) {
		throw new Error("This date is no longer part of the repeat series.");
	}

	const existingOccurrence = findExistingSeriesOccurrence(
		args.app,
		args.plannerFiles,
		source.id,
		args.occurrenceDate,
	);
	if (existingOccurrence) return existingOccurrence;

	const target = materializeTargetPath(source, args.occurrenceDate);
	if (!isPlannerBasenameForDates(target.basename, args.occurrenceDate, target.rangeEnd)) {
		throw new Error(t("dateFormats.ambiguousFilename"));
	}
	const existingTarget = args.app.vault.getAbstractFileByPath(target.path);
	if (existingTarget instanceof TFile) {
		throw new Error(`A different note already exists at ${target.path}.`);
	}
	await materializeOccurrence(
		args.app,
		source,
		args.occurrenceDate,
		args.plannerFiles,
	);
	const created = args.app.vault.getAbstractFileByPath(target.path);
	if (!(created instanceof TFile)) {
		throw new Error("Failed to create the repeat occurrence note.");
	}
	return created;
}

function materializeTargetPath(
	source: RecurrenceSourceDefinition,
	occurrenceDate: string,
): {
	path: string;
	basename: string;
	rangeEnd?: string;
	title: string;
} {
	const folder = source.file.parent?.path ?? "";
	const cleanBase = source.file.basename.replace(/\.md$/i, "");
	const rangeParsed = parseRangeBasename(cleanBase);
	const singleParsed = parseSingleDateBasename(cleanBase);
	const title =
		rangeParsed?.suffix ??
		singleParsed?.suffix ??
		getFallbackTitleFromFile(source.file);
	const suffix = sanitizePlannerBasenameSuffix(title);

	if (rangeParsed) {
		const span = daysBetween(rangeParsed.start, rangeParsed.end);
		const rangeEnd = addDays(occurrenceDate, Math.max(0, span - 1));
		const basename = `${formatPlannerBasename(occurrenceDate, suffix, rangeEnd, rangeParsed.format)}.md`;
		return {
			path: folder ? `${folder}/${basename}` : basename,
			basename,
			rangeEnd,
			title,
		};
	}

	const basename = `${formatPlannerBasename(occurrenceDate, suffix, undefined, singleParsed?.format)}.md`;
	return {
		path: folder ? `${folder}/${basename}` : basename,
		basename,
		title,
	};
}

async function materializeOccurrence(
	app: App,
	source: RecurrenceSourceDefinition,
	occurrenceDate: string,
	plannerFiles: TFile[],
): Promise<"created" | "updated" | "skipped"> {
	const target = materializeTargetPath(source, occurrenceDate);
	if (target.path === source.file.path) return "skipped";
	let existing = app.vault.getAbstractFileByPath(target.path);
	const fields = buildOccurrenceFrontmatter(app, source, occurrenceDate, target);

	if (!(existing instanceof TFile)) {
		const sameOccurrence = findExistingSeriesOccurrence(
			app,
			plannerFiles,
			source.id,
			occurrenceDate,
		);
		if (sameOccurrence) existing = sameOccurrence;
	}

	if (existing instanceof TFile) {
		const fm = app.metadataCache.getFileCache(existing)?.frontmatter;
		if (fm?.recurrence_id !== source.id) return "skipped";
		if (fm.completed !== undefined) delete fields.completed;
		// Older occurrences and explicit individual colors retain their own selection.
		if (fm.diary_color_inherit !== true) {
			delete fields.color;
			delete fields.diary_color_id;
			delete fields.diary_color_inherit;
		}
		if (frontmatterMatches(fm, fields)) return "skipped";
		await app.fileManager.processFrontMatter(
			existing,
			(frontmatter: Record<string, unknown>) => {
				if (fields.diary_color_inherit === true && fields.diary_color_id === undefined) delete frontmatter.diary_color_id;
				if (fields.diary_color_inherit === true && fields.color === undefined) delete frontmatter.color;
				for (const [key, value] of Object.entries(fields)) {
					frontmatter[key] = value;
				}
			},
		);
		return "updated";
	}

	const dir = target.path.split("/").slice(0, -1).join("/");
	if (dir && !app.vault.getAbstractFileByPath(dir)) {
		await app.vault.createFolder(dir);
	}

	await app.vault.create(
		target.path,
		`${serializeYamlFrontmatter(fields)}\n# ${target.title}\n\n`,
	);
	return "created";
}

function findExistingSeriesOccurrence(
	app: App,
	plannerFiles: TFile[],
	recurrenceId: string,
	occurrenceDate: string,
): TFile | null {
	for (const file of plannerFiles) {
		const fm = app.metadataCache.getFileCache(file)?.frontmatter;
		if (
			fm?.recurrence_role === "occurrence" &&
			fm.recurrence_id === recurrenceId &&
			fm.recurrence_occurrence_date === occurrenceDate
		) {
			return file;
		}
	}
	return null;
}

function buildOccurrenceFrontmatter(
	app: App,
	source: RecurrenceSourceDefinition,
	occurrenceDate: string,
	target: ReturnType<typeof materializeTargetPath>,
): Record<string, unknown> {
	const sourceFm = app.metadataCache.getFileCache(source.file)?.frontmatter ?? {};
	const fields: Record<string, unknown> = {
		recurrence_id: source.id,
		recurrence_role: "occurrence",
		recurrence_source_path: source.file.path,
		recurrence_occurrence_date: occurrenceDate,
		recurrence_calendar: source.calendar,
		recurrence_rule: source.rule,
		recurrence_anchor_date: source.anchorDate,
		title: target.title,
	};
	const resolvedColor = getPlannerFileColor(app, source.file);
	if (resolvedColor) fields.color = resolvedColor;
	copyFrontmatterValue(sourceFm, fields, "diary_color_id");
	fields.diary_color_inherit = true;
	copyFrontmatterValue(sourceFm, fields, "notify_minutes");
	copyFrontmatterValue(sourceFm, fields, "start_time");
	copyFrontmatterValue(sourceFm, fields, "end_time");
	if (sourceFm.todo === true || sourceFm.todo === "true") {
		fields.todo = true;
		fields.completed = false;
	}
	if (target.rangeEnd) {
		fields.date_start = occurrenceDate;
		fields.date_end = target.rangeEnd;
	}
	return fields;
}

function expandRecurrenceDates(
	source: RecurrenceSourceDefinition,
	range: RecurrenceMaterializeRange,
	getParts: typeof getCalendarDateParts = getCalendarDateParts,
): string[] {
	return expandSimpleRecurrenceDates(
		source,
		range,
		getSimpleRecurrenceFrequency(source.rule),
		getRecurrenceInterval(source.rule),
		getParts,
	);
}

function getStoredAnchorParts(
	fm: Record<string, unknown>,
): CalendarDateParts | null {
	const year = toNumberValue(fm.recurrence_anchor_year);
	const month = toNumberValue(fm.recurrence_anchor_month);
	const day = toNumberValue(fm.recurrence_anchor_day);
	if (!year || !month || !day) return null;
	const era = toStringValue(fm.recurrence_anchor_era) ?? undefined;
	const isLeapMonth =
		fm.recurrence_anchor_is_leap_month === true ? true : undefined;
	return { year, month, day, era, isLeapMonth };
}

export function serializeYamlFrontmatter(fields: Record<string, unknown>): string {
	const lines = ["---"];
	for (const [key, value] of Object.entries(fields)) {
		if (value === undefined || value === null || value === "") continue;
		if (Array.isArray(value)) {
			lines.push(`${key}: [${value.map(formatYamlScalar).join(", ")}]`);
		} else {
			lines.push(`${key}: ${formatYamlScalar(value)}`);
		}
	}
	lines.push("---");
	return lines.join("\n");
}

function formatYamlScalar(value: unknown): string {
	if (typeof value === "number") return String(value);
	if (typeof value === "boolean") return value ? "true" : "false";
	return JSON.stringify(String(value));
}

function parseRulePairs(rule: string): Map<string, string> {
	const pairs = new Map<string, string>();
	for (const part of rule.trim().split(";")) {
		const [rawKey, ...rawValue] = part.split("=");
		const key = rawKey?.trim().toUpperCase();
		const value = rawValue.join("=").trim().toUpperCase();
		if (key && value) pairs.set(key, value);
	}
	return pairs;
}

function normalizeDateList(value: unknown): string[] {
	if (Array.isArray(value)) {
		return value
			.map(toStringValue)
			.filter((date): date is string => Boolean(date && isValidDateString(date)))
			.sort();
	}
	const single = toStringValue(value);
	if (!single) return [];
	return single
		.split(",")
		.map((date) => date.trim())
		.filter(isValidDateString)
		.sort();
}

function frontmatterMatches(
	fm: Record<string, unknown> | undefined,
	fields: Record<string, unknown>,
): boolean {
	if (!fm) return false;
	for (const [key, value] of Object.entries(fields)) {
		if (toComparableFrontmatterValue(fm[key]) !== toComparableFrontmatterValue(value)) {
			return false;
		}
	}
	return true;
}

function toComparableFrontmatterValue(value: unknown): string {
	if (value == null) return "";
	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return String(value);
	}
	if (Array.isArray(value)) {
		return value.map(toComparableFrontmatterValue).join(",");
	}
	return "";
}

function copyFrontmatterValue(
	source: Record<string, unknown>,
	target: Record<string, unknown>,
	key: string,
): void {
	const value = source[key];
	if (value !== undefined && value !== null && value !== "") {
		target[key] = value;
	}
}

function getPlannerTimeLabelFromFrontmatter(
	frontmatter: Record<string, unknown>,
): string | null {
	const normalize = (value: unknown): string | null => {
		if (typeof value !== "string") return null;
		const match = value.trim().match(/^(?:[01]\d|2[0-3]):[0-5]\d$/);
		return match ? match[0] : null;
	};
	const startTime = normalize(frontmatter.start_time);
	if (!startTime) return null;
	const endTime = normalize(frontmatter.end_time);
	return endTime ? `${startTime}–${endTime}` : startTime;
}

function getFallbackTitleFromFile(file: TFile): string {
	return sanitizePlannerBasenameSuffix(file.basename.replace(/\.md$/i, "")) ||
		"recurring-event";
}

function sanitizePlannerBasenameSuffix(raw: string): string {
	return raw
		.replace(/[\\/:*?"<>|#\n\r\t]/g, "")
		.trim();
}

function parseSingleDateBasename(
	basename: string,
): { date: string; suffix?: string; format: string } | null {
	const parsed = parsePlannerBasename(basename);
	return parsed?.kind === "single" ? { date: parsed.start, suffix: parsed.suffix, format: parsed.format } : null;
}

function getPlannerDateFromBasename(basename: string): string | null {
	const clean = basename.replace(/\.md$/i, "");
	const range = parseRangeBasename(clean);
	if (range) return range.start;
	const single = parseSingleDateBasename(clean);
	return single?.date ?? null;
}

function toStringValue(value: unknown): string | null {
	if (typeof value === "string") return value.trim() || null;
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	return null;
}

function toNumberValue(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value === "string" && value.trim()) {
		const n = Number(value);
		if (Number.isFinite(n)) return n;
	}
	return null;
}

function isAlternateCalendarId(value: string): value is AlternateCalendarId {
	return [
		"korean-lunar",
		"chinese",
		"dangi",
		"hebrew",
		"islamic",
		"islamic-civil",
		"islamic-umalqura",
		"persian",
		"indian",
		"buddhist",
		"japanese",
		"roc",
		"coptic",
		"ethiopic",
	].includes(value);
}

export function recurrenceCalendarFromAlternateSelection(
	value: AlternateCalendarSelection,
): RecurrenceCalendarId {
	return value || RECURRENCE_GREGORIAN;
}
