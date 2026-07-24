import { App, TFile, WorkspaceLeaf } from "obsidian";
import { parseRangeBasename } from "../../utils/range";
import { getFilePath, type PlannerTimeRange } from "./file-utils";
import {
	buildRecurrenceSourceFrontmatter,
	serializeYamlFrontmatter,
	type RecurrenceFormValue,
} from "../../utils/recurrence";
import {
	getExternalEventDateRangeLabel,
	getExternalEventEndDate,
	getExternalEventLinkKey,
	getExternalEventStartDate,
	getExternalEventTimeLabel,
	type ExternalCalendarEvent,
} from "../../utils/external-calendars";

const pad = (n: number) => String(n).padStart(2, "0");

/** Parse YYYY-MM-DD from string. */
function parseDateParts(dateStr: string): {
	year: number;
	month: number;
	day: number;
} | null {
	const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return null;
	const year = parseInt(m[1] ?? "", 10);
	const month = parseInt(m[2] ?? "", 10);
	const day = parseInt(m[3] ?? "", 10);
	if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
	return { year, month, day };
}

/** Compute days between two dates (inclusive). */
function daysBetween(start: string, end: string): number {
	const s = parseDateParts(start);
	const e = parseDateParts(end);
	if (!s || !e) return 0;
	const startMs = new Date(s.year, s.month - 1, s.day).getTime();
	const endMs = new Date(e.year, e.month - 1, e.day).getTime();
	return Math.round((endMs - startMs) / 86400000) + 1;
}

/**
 * Move a date file to a new date. Single-date files move to the target date;
 * range files move so the start date is the target, preserving duration.
 * @returns The renamed TFile, or null if target path already exists (conflict).
 */
export async function moveFileToDate(
	app: App,
	file: TFile,
	targetYear: number,
	targetMonth: number,
	targetDay: number,
): Promise<TFile | null> {
	const folder = file.parent?.path ?? "";
	const targetDateStr = `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}`;

	const rangeParsed = parseRangeBasename(file.basename);
	if (rangeParsed) {
		const duration = daysBetween(rangeParsed.start, rangeParsed.end);
		if (duration <= 0) return null;

		const endDate = new Date(targetYear, targetMonth - 1, targetDay);
		endDate.setDate(endDate.getDate() + duration - 1);
		const endYear = endDate.getFullYear();
		const endMonth = endDate.getMonth() + 1;
		const endDay = endDate.getDate();

		const newBasename = `${targetDateStr}--${endYear}-${pad(endMonth)}-${pad(endDay)}${rangeParsed.suffix ? `-${rangeParsed.suffix}` : ""}.md`;
		const fullNewPath = folder ? `${folder}/${newBasename}` : newBasename;

		if (fullNewPath === file.path) return file;
		if (app.vault.getAbstractFileByPath(fullNewPath)) return null;

		await app.vault.rename(file, fullNewPath);
		const renamed = app.vault.getAbstractFileByPath(fullNewPath);
		if (!(renamed instanceof TFile)) return null;
		await app.fileManager.processFrontMatter(
			renamed,
			(fm: Record<string, unknown>) => {
				fm.date_start = targetDateStr;
				fm.date_end = `${endYear}-${pad(endMonth)}-${pad(endDay)}`;
			},
		);
		return renamed;
	}

	const singleParsed = parseSingleDateBasename(file.basename.replace(/\.md$/i, ""));
	if (!singleParsed) return null;

	const newBasename = `${targetDateStr}${singleParsed.suffix ? `-${singleParsed.suffix}` : ""}.md`;
	const fullNewPath = folder ? `${folder}/${newBasename}` : newBasename;

	if (fullNewPath === file.path) return file;
	if (app.vault.getAbstractFileByPath(fullNewPath)) return null;

	await app.vault.rename(file, fullNewPath);
	const renamed = app.vault.getAbstractFileByPath(fullNewPath);
	return renamed instanceof TFile ? renamed : null;
}

/**
 * Move a range file to new start and end dates.
 * @returns The renamed TFile, or null if target path already exists or start > end.
 */
export async function moveRangeFileToNewDates(
	app: App,
	file: TFile,
	startYear: number,
	startMonth: number,
	startDay: number,
	endYear: number,
	endMonth: number,
	endDay: number,
): Promise<TFile | null> {
	const rangeParsed = parseRangeBasename(file.basename);
	if (!rangeParsed) return null;

	const startStr = `${startYear}-${pad(startMonth)}-${pad(startDay)}`;
	const endStr = `${endYear}-${pad(endMonth)}-${pad(endDay)}`;
	if (startStr > endStr) return null;

	const folder = file.parent?.path ?? "";
	const newBasename = `${startStr}--${endStr}${rangeParsed.suffix ? `-${rangeParsed.suffix}` : ""}.md`;
	const fullNewPath = folder ? `${folder}/${newBasename}` : newBasename;

	if (fullNewPath === file.path) return file;
	if (app.vault.getAbstractFileByPath(fullNewPath)) return null;

	await app.vault.rename(file, fullNewPath);
	const renamed = app.vault.getAbstractFileByPath(fullNewPath);
	if (!(renamed instanceof TFile)) return null;
	await app.fileManager.processFrontMatter(
		renamed,
		(fm: Record<string, unknown>) => {
			fm.date_start = startStr;
			fm.date_end = endStr;
		},
	);
	return renamed;
}

/**
 * Move or rename a planner file using the folder and complete date-based
 * basename entered in the file options modal. Range frontmatter is kept in
 * sync when converting between single-date and range files.
 */
export async function movePlannerFileToLocation(
	app: App,
	file: TFile,
	folderRaw: string,
	basenameRaw: string,
): Promise<TFile> {
	const folder = folderRaw.trim().replace(/^\/+|\/+$/g, "");
	const cleanBasename = basenameRaw.trim().replace(/\.md$/i, "");
	if (!cleanBasename || /[\\/]/.test(cleanBasename)) {
		const err = new Error("PLANNER_INVALID_FILENAME");
		(err as Error & { code?: string }).code = "PLANNER_INVALID_FILENAME";
		throw err;
	}

	const filename = `${cleanBasename}.md`;
	const newPath = folder ? `${folder}/${filename}` : filename;
	if (newPath !== file.path && app.vault.getAbstractFileByPath(newPath)) {
		const err = new Error("PLANNER_RENAME_CONFLICT");
		(err as Error & { code?: string }).code = "PLANNER_RENAME_CONFLICT";
		throw err;
	}

	const dir = newPath.split("/").slice(0, -1).join("/");
	if (dir && !app.vault.getAbstractFileByPath(dir)) {
		await app.vault.createFolder(dir);
	}
	if (newPath !== file.path) {
		await app.vault.rename(file, newPath);
	}

	const moved = app.vault.getAbstractFileByPath(newPath);
	if (!(moved instanceof TFile)) {
		throw new Error("PLANNER_RENAME_FAILED");
	}

	const rangeParsed = parseRangeBasename(cleanBasename);
	const singleParsed = rangeParsed
		? null
		: parseSingleDateBasename(cleanBasename);
	if (rangeParsed || singleParsed) {
		await app.fileManager.processFrontMatter(
			moved,
			(frontmatter: Record<string, unknown>) => {
				if (rangeParsed) {
					frontmatter.date_start = rangeParsed.start;
					frontmatter.date_end = rangeParsed.end;
					return;
				}
				delete frontmatter.date_start;
				delete frontmatter.date_end;
			},
		);
	}
	return moved;
}

export async function openDateNote(
	app: App,
	leaf: WorkspaceLeaf,
	folder: string,
	year: number,
	month: number,
	day: number,
): Promise<void> {
	const path = getFilePath(folder, year, month, day);
	const file = app.vault.getAbstractFileByPath(path);

	if (file instanceof TFile) {
		await leaf.openFile(file);
	} else {
		const dir = path.split("/").slice(0, -1).join("/");
		if (dir && !app.vault.getAbstractFileByPath(dir)) {
			await app.vault.createFolder(dir);
		}
		const dateStr = `${year}-${pad(month)}-${pad(day)}`;
		const content = `# ${dateStr}\n\n`;
		const newFile = await app.vault.create(path, content);
		await leaf.openFile(newFile);
	}
}

export async function createRangeFile(
	app: App,
	folder: string,
	basename: string,
	color?: string,
	todo?: boolean,
	notifyMinutes?: number | null,
	timeRange?: PlannerTimeRange | null,
	recurrence?: RecurrenceFormValue | null,
): Promise<TFile> {
	const cleanBasename = basename.trim().replace(/\.md$/i, "");
	const parsed = parseRangeBasename(cleanBasename);
	if (!parsed) {
		throw new Error(`Invalid range basename: ${cleanBasename}`);
	}
	const { start: startStr, end: endStr, suffix } = parsed;
	const trimmed = (folder || "Planner").trim();
	const filename = cleanBasename.endsWith(".md")
		? cleanBasename
		: `${cleanBasename}.md`;
	const path = trimmed ? `${trimmed}/${filename}` : filename;
	const existing = app.vault.getAbstractFileByPath(path);
	if (existing instanceof TFile) {
		throw new Error(`File already exists: ${path}`);
	}
	const dir = path.split("/").slice(0, -1).join("/");
	if (dir && !app.vault.getAbstractFileByPath(dir)) {
		await app.vault.createFolder(dir);
	}
	const heading = suffix !== undefined ? suffix : `${startStr} ~ ${endStr}`;
	const hasNotify =
		notifyMinutes != null &&
		Number.isFinite(notifyMinutes) &&
		notifyMinutes >= 0 &&
		notifyMinutes <= 1439;
	const frontmatter: Record<string, unknown> = {
		date_start: startStr,
		date_end: endStr,
	};
	if (color?.trim()) frontmatter.color = color.trim();
	if (todo) {
		frontmatter.todo = true;
		frontmatter.completed = false;
	}
	if (hasNotify) frontmatter.notify_minutes = Math.round(notifyMinutes);
	applyPlannerTimeRange(frontmatter, timeRange);
	if (recurrence?.enabled) {
		Object.assign(
			frontmatter,
			buildRecurrenceSourceFrontmatter(recurrence, startStr),
		);
	}
	const content = `${serializeYamlFrontmatter(frontmatter)}\n\n# ${heading}\n\n`;
	return app.vault.create(path, content);
}

/** Extract date and optional suffix from basename (e.g. "2026-02-12" or "2026-02-12-meeting"). */
export function parseSingleDateBasename(
	basename: string,
): { date: string; suffix?: string } | null {
	const m = basename.match(/^(\d{4}-\d{2}-\d{2})(?:-(.+))?$/);
	if (!m) return null;
	return { date: m[1] ?? "", suffix: m[2] ?? undefined };
}

/** First calendar day for planner chips: range start, or single date. */
export function getPlannerEventDateString(file: TFile): string | null {
	const clean = file.basename.replace(/\.md$/i, "");
	const rangeParsed = parseRangeBasename(clean);
	if (rangeParsed) return rangeParsed.start;
	const singleParsed = parseSingleDateBasename(clean);
	return singleParsed?.date ?? null;
}

export async function createSingleDateFile(
	app: App,
	folder: string,
	basename: string,
	color?: string,
	todo?: boolean,
	notifyMinutes?: number | null,
	timeRange?: PlannerTimeRange | null,
	recurrence?: RecurrenceFormValue | null,
): Promise<TFile> {
	const trimmed = (folder || "Planner").trim();
	const cleanBasename = basename.trim().replace(/\.md$/i, "") || "untitled";
	const filename = cleanBasename.endsWith(".md")
		? cleanBasename
		: `${cleanBasename}.md`;
	const path = trimmed ? `${trimmed}/${filename}` : filename;
	const existing = app.vault.getAbstractFileByPath(path);
	if (existing instanceof TFile) {
		throw new Error(`File already exists: ${path}`);
	}
	const dir = path.split("/").slice(0, -1).join("/");
	if (dir && !app.vault.getAbstractFileByPath(dir)) {
		await app.vault.createFolder(dir);
	}
	const parsed = parseSingleDateBasename(cleanBasename);
	const heading =
		parsed?.suffix ?? parsed?.date ?? cleanBasename;
	const hasNotify =
		notifyMinutes != null &&
		Number.isFinite(notifyMinutes) &&
		notifyMinutes >= 0 &&
		notifyMinutes <= 1439;
	const frontmatter: Record<string, unknown> = {};
	if (color?.trim()) frontmatter.color = color.trim();
	if (todo) {
		frontmatter.todo = true;
		frontmatter.completed = false;
	}
	if (hasNotify) frontmatter.notify_minutes = Math.round(notifyMinutes);
	applyPlannerTimeRange(frontmatter, timeRange);
	if (recurrence?.enabled && parsed?.date) {
		Object.assign(
			frontmatter,
			buildRecurrenceSourceFrontmatter(recurrence, parsed.date),
		);
	}
	const hasFrontmatter = Object.keys(frontmatter).length > 0;
	const content = `${
		hasFrontmatter ? `${serializeYamlFrontmatter(frontmatter)}\n\n` : ""
	}# ${heading}\n\n`;
	return app.vault.create(path, content);
}

/**
 * Update todo and completed status in a file's frontmatter.
 * When todo is false/undefined, removes both todo and completed.
 */
export async function updateFileTodoStatus(
	app: App,
	file: TFile,
	todo?: boolean,
	completed?: boolean,
): Promise<void> {
	await app.fileManager.processFrontMatter(
		file,
		(frontmatter: Record<string, unknown>) => {
			if (!todo) {
				delete frontmatter.todo;
				delete frontmatter.completed;
			} else {
				frontmatter.todo = true;
				frontmatter.completed = completed === true;
			}
		},
	);
}

/**
 * Update the color in a file's frontmatter.
 * Uses app.fileManager.processFrontMatter (Obsidian 1.4.4+) to avoid parsing/serialization issues.
 * @param color - New color (hex/rgb/name). If undefined/empty, removes color from frontmatter.
 */
export async function updateFileColor(
	app: App,
	file: TFile,
	color: string | undefined,
): Promise<void> {
	const trimmed = color?.trim();
	await app.fileManager.processFrontMatter(
		file,
		(frontmatter: Record<string, unknown>) => {
			if (trimmed) {
				frontmatter.color = trimmed;
			} else {
				delete frontmatter.color;
			}
		},
	);
}

/** Persist reminder time as minutes from local midnight (0–1439), or remove when null. */
export async function updateFileNotifyMinutes(
	app: App,
	file: TFile,
	minutes: number | null,
): Promise<void> {
	await app.fileManager.processFrontMatter(
		file,
		(frontmatter: Record<string, unknown>) => {
			if (
				minutes == null ||
				!Number.isFinite(minutes) ||
				minutes < 0 ||
				minutes > 1439
			) {
				delete frontmatter.notify_minutes;
			} else {
				frontmatter.notify_minutes = Math.round(minutes);
			}
		},
	);
}

function isValidPlannerTime(value: string | null | undefined): value is string {
	return Boolean(value && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value));
}

function applyPlannerTimeRange(
	frontmatter: Record<string, unknown>,
	timeRange: PlannerTimeRange | null | undefined,
): void {
	if (isValidPlannerTime(timeRange?.startTime)) {
		frontmatter.start_time = timeRange.startTime;
	} else {
		delete frontmatter.start_time;
	}
	if (isValidPlannerTime(timeRange?.endTime)) {
		frontmatter.end_time = timeRange.endTime;
	} else {
		delete frontmatter.end_time;
	}
}

/** Persist the chip schedule without changing reminder metadata. */
export async function updateFileTimeRange(
	app: App,
	file: TFile,
	timeRange: PlannerTimeRange | null,
): Promise<void> {
	await app.fileManager.processFrontMatter(
		file,
		(frontmatter: Record<string, unknown>) => {
			applyPlannerTimeRange(frontmatter, timeRange);
		},
	);
}

function sanitizePlannerBasenameSuffix(raw: string): string {
	return raw
		.replace(/[\\/:*?"<>|#\n\r\t]/g, "")
		.trim();
}

export async function createExternalEventFile(
	app: App,
	folder: string,
	event: ExternalCalendarEvent,
	calendarName: string,
	locale: string,
): Promise<TFile> {
	const trimmed = (folder || "Planner").trim();
	const startDate = getExternalEventStartDate(event);
	const endDate = getExternalEventEndDate(event);
	const suffix = sanitizePlannerBasenameSuffix(event.title) || "external";
	const isRange = event.allDay && startDate < endDate;
	const baseName = isRange
		? `${startDate}--${endDate}-${suffix}`
		: `${startDate}-${suffix}`;
	const path = await getAvailableExternalEventPath(app, trimmed, baseName);
	const dir = path.split("/").slice(0, -1).join("/");
	if (dir && !app.vault.getAbstractFileByPath(dir)) {
		await app.vault.createFolder(dir);
	}
	const frontmatter: Record<string, unknown> = {
		diary_external_calendar: event.calendarId,
		diary_external_event_uid: event.uid,
		diary_external_event_instance: event.instanceId,
		diary_external_event_source: getExternalEventLinkKey(event),
		diary_external_event_linked_at: new Date().toISOString(),
		title: event.title,
		color: event.color,
	};
	if (isRange) {
		frontmatter.date_start = startDate;
		frontmatter.date_end = endDate;
	}
	const content = `${serializeYamlFrontmatter(frontmatter)}\n\n# ${event.title}\n\n${formatExternalEventBody(
		event,
		calendarName,
		locale,
	)}`;
	return app.vault.create(path, content);
}

async function getAvailableExternalEventPath(
	app: App,
	folder: string,
	baseName: string,
): Promise<string> {
	let candidate = folder ? `${folder}/${baseName}.md` : `${baseName}.md`;
	let counter = 2;
	while (app.vault.getAbstractFileByPath(candidate)) {
		candidate = folder
			? `${folder}/${baseName}-${counter}.md`
			: `${baseName}-${counter}.md`;
		counter++;
	}
	return candidate;
}

function formatExternalEventBody(
	event: ExternalCalendarEvent,
	calendarName: string,
	locale: string,
): string {
	const lines = [
		`- Source calendar: ${calendarName}`,
		`- Date: ${getExternalEventDateRangeLabel(event)}`,
	];
	const time = getExternalEventTimeLabel(event, locale);
	if (time) lines.push(`- Time: ${time}`);
	if (event.location) lines.push(`- Location: ${event.location}`);
	if (event.descriptionText) {
		lines.push("", "## External description", "", event.descriptionText);
	}
	return `${lines.join("\n")}\n`;
}

/**
 * Update display title. Planner date or range file names: renames the file so the
 * suffix (after the date) matches; other files: set or clear frontmatter `title`.
 * @returns The file to use going forward (renamed TFile or the same file).
 */
export async function updateFileTitle(
	app: App,
	file: TFile,
	newTitleRaw: string,
): Promise<TFile> {
	const newTitle = newTitleRaw.trim();
	const cleanBase = file.basename.replace(/\.md$/i, "");
	const rangeParsed = parseRangeBasename(cleanBase);
	const singleParsed = !rangeParsed
		? parseSingleDateBasename(cleanBase)
		: null;

	if (rangeParsed) {
		const suffix = newTitle ? sanitizePlannerBasenameSuffix(newTitle) : "";
		const newBasename = `${rangeParsed.start}--${rangeParsed.end}${
			suffix ? `-${suffix}` : ""
		}.md`;
		return await renamePlannerFileIfNeeded(app, file, newBasename);
	}

	if (singleParsed) {
		const suffix = newTitle ? sanitizePlannerBasenameSuffix(newTitle) : "";
		const newBasename = `${singleParsed.date}${
			suffix ? `-${suffix}` : ""
		}.md`;
		return await renamePlannerFileIfNeeded(app, file, newBasename);
	}

	await app.fileManager.processFrontMatter(
		file,
		(frontmatter: Record<string, unknown>) => {
			if (newTitle) {
				frontmatter.title = newTitle;
			} else {
				delete frontmatter.title;
			}
		},
	);
	return file;
}

async function renamePlannerFileIfNeeded(
	app: App,
	file: TFile,
	newBasename: string,
): Promise<TFile> {
	const folder = file.parent?.path ?? "";
	const newPath = folder ? `${folder}/${newBasename}` : newBasename;
	if (newPath === file.path) return file;
	if (app.vault.getAbstractFileByPath(newPath) && newPath !== file.path) {
		const err = new Error("PLANNER_RENAME_CONFLICT");
		(err as Error & { code?: string }).code = "PLANNER_RENAME_CONFLICT";
		throw err;
	}
	await app.vault.rename(file, newPath);
	const next = app.vault.getAbstractFileByPath(newPath);
	if (!(next instanceof TFile)) {
		throw new Error("PLANNER_RENAME_FAILED");
	}
	return next;
}
