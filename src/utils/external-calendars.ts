import { App, requestUrl, TFile } from "obsidian";
import type { DiaryObsidianSettings } from "../settings";

export interface ExternalCalendarSettings {
	id: string;
	name: string;
	url: string;
	color: string;
	enabled: boolean;
	refreshMinutes: number | null;
	includeDescriptions: boolean;
	showInYearly: boolean;
	showInMonthly: boolean;
	showInMonthlyList: boolean;
	showInSidebar: boolean;
}

export interface ExternalCalendarCache {
	calendarId: string;
	urlHash: string;
	fetchedAt: string;
	etag?: string;
	lastModified?: string;
	events: ExternalCalendarEvent[];
	lastError?: {
		message: string;
		occurredAt: string;
	};
}

export interface ExternalCalendarEvent {
	id: string;
	calendarId: string;
	uid: string;
	instanceId: string;
	title: string;
	start: string;
	end?: string;
	allDay: boolean;
	location?: string;
	descriptionText?: string;
	status?: "confirmed" | "tentative" | "cancelled";
	categories: string[];
	updated?: string;
	color?: string;
	recurrence?: ExternalCalendarRecurrence;
}

interface ExternalCalendarRecurrence {
	freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
	interval: number;
	count?: number;
	untilDate?: string;
	exDates: string[];
	rDates: string[];
}

export type ExternalCalendarViewScope =
	| "yearly"
	| "monthly"
	| "monthlyList"
	| "sidebar";

export interface ExternalCalendarDateEvents {
	singleEvents: ExternalCalendarEvent[];
	rangeEvents: Array<{
		event: ExternalCalendarEvent;
		runPos: { runStart: boolean; runEnd: boolean };
		isFirst: boolean;
	}>;
	summaryEvents: ExternalCalendarEvent[];
}

interface ParsedContentLine {
	name: string;
	params: Map<string, string>;
	value: string;
}

interface ParsedDateValue {
	value: string;
	allDay: boolean;
	date: string;
}

interface MutableEvent {
	uid: string;
	title: string;
	start: ParsedDateValue | null;
	end: ParsedDateValue | null;
	durationDays: number | null;
	location?: string;
	descriptionText?: string;
	status?: "confirmed" | "tentative" | "cancelled";
	categories: string[];
	updated?: string;
	recurrence?: ExternalCalendarRecurrence;
}

const DEFAULT_EXTERNAL_CALENDAR_COLOR = "#3b82f6";
const MAX_ICS_BYTES = 5 * 1024 * 1024;

export function createExternalCalendarId(): string {
	return `ext_${Date.now().toString(36)}_${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}

export function getDefaultExternalCalendarColor(): string {
	return DEFAULT_EXTERNAL_CALENDAR_COLOR;
}

export function normalizeExternalCalendarSettings(value: unknown): ExternalCalendarSettings[] {
	if (!Array.isArray(value)) return [];
	const normalized: ExternalCalendarSettings[] = [];
	const seen = new Set<string>();
	for (const item of value) {
		if (!isRecord(item)) continue;
		const id = normalizeString(item.id);
		const name = normalizeString(item.name);
		const url = normalizeString(item.url);
		if (!id || !url || seen.has(id)) continue;
		seen.add(id);
		normalized.push({
			id,
			name: name || "External calendar",
			url,
			color: normalizeString(item.color) || DEFAULT_EXTERNAL_CALENDAR_COLOR,
			enabled: item.enabled !== false,
			refreshMinutes: normalizeRefreshMinutes(item.refreshMinutes),
			includeDescriptions: item.includeDescriptions === true,
			showInYearly: item.showInYearly === true,
			showInMonthly: item.showInMonthly !== false,
			showInMonthlyList: item.showInMonthlyList !== false,
			showInSidebar: item.showInSidebar !== false,
		});
	}
	return normalized;
}

export function normalizeExternalCalendarCaches(
	value: unknown,
	calendars: ExternalCalendarSettings[],
): ExternalCalendarCache[] {
	if (!Array.isArray(value)) return [];
	const validIds = new Set(calendars.map((calendar) => calendar.id));
	const normalized: ExternalCalendarCache[] = [];
	for (const item of value) {
		if (!isRecord(item)) continue;
		const calendarId = normalizeString(item.calendarId);
		if (!calendarId || !validIds.has(calendarId)) continue;
		const urlHash = normalizeString(item.urlHash);
		const fetchedAt = normalizeString(item.fetchedAt);
		const events = normalizeExternalEvents(item.events, calendarId);
		normalized.push({
			calendarId,
			urlHash,
			fetchedAt,
			etag: normalizeString(item.etag) || undefined,
			lastModified: normalizeString(item.lastModified) || undefined,
			events,
			lastError: normalizeLastError(item.lastError),
		});
	}
	return normalized;
}

export function getExternalCalendarCache(
	settings: DiaryObsidianSettings,
	calendarId: string,
): ExternalCalendarCache | null {
	return (
		settings.externalCalendarCaches.find(
			(cache) => cache.calendarId === calendarId,
		) ?? null
	);
}

export async function fetchExternalCalendarCache(
	calendar: ExternalCalendarSettings,
	existingCache?: ExternalCalendarCache | null,
): Promise<ExternalCalendarCache> {
	const fetchedAt = new Date().toISOString();
	try {
		const url = normalizeExternalCalendarUrl(calendar.url);
		const headers: Record<string, string> = {};
		if (existingCache?.etag) headers["If-None-Match"] = existingCache.etag;
		if (existingCache?.lastModified) {
			headers["If-Modified-Since"] = existingCache.lastModified;
		}
		const response = await requestUrl({
			url,
			method: "GET",
			headers,
			throw: false,
			contentType: "text/calendar",
		});
		if (response.status === 304 && existingCache) {
			return {
				...existingCache,
				fetchedAt,
				lastError: undefined,
			};
		}
		if (response.status < 200 || response.status >= 300) {
			throw new Error(`HTTP ${response.status}`);
		}
		const text = response.text;
		if (text.length > MAX_ICS_BYTES) {
			throw new Error("Calendar feed is too large.");
		}
		const events = parseIcsEvents(text, calendar);
		return {
			calendarId: calendar.id,
			urlHash: hashString(url),
			fetchedAt,
			etag: response.headers["etag"],
			lastModified: response.headers["last-modified"],
			events,
			lastError: undefined,
		};
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Failed to refresh calendar.";
		return {
			calendarId: calendar.id,
			urlHash: existingCache?.urlHash ?? hashString(calendar.url),
			fetchedAt: existingCache?.fetchedAt ?? fetchedAt,
			etag: existingCache?.etag,
			lastModified: existingCache?.lastModified,
			events: existingCache?.events ?? [],
			lastError: {
				message,
				occurredAt: fetchedAt,
			},
		};
	}
}

export function getExternalEventsForRange(
	app: App,
	settings: DiaryObsidianSettings,
	range: { start: string; end: string },
	scope: ExternalCalendarViewScope,
	plannerFiles: TFile[],
): ExternalCalendarEvent[] {
	const linkedKeys = getLinkedExternalEventKeys(app, plannerFiles);
	const events: ExternalCalendarEvent[] = [];
	for (const calendar of settings.externalCalendars) {
		if (!calendar.enabled || !isCalendarVisibleInScope(calendar, scope)) {
			continue;
		}
		const cache = getExternalCalendarCache(settings, calendar.id);
		if (!cache || cache.lastError || cache.urlHash !== hashString(calendar.url)) {
			continue;
		}
		for (const event of cache.events) {
			if (event.status === "cancelled") continue;
			for (const instance of expandExternalEvent(event, range)) {
				if (linkedKeys.has(getExternalEventLinkKey(instance))) continue;
				events.push({
					...instance,
					color: instance.color ?? calendar.color,
				});
			}
		}
	}
	return events.sort((a, b) => {
		const dateCompare = getExternalEventStartDate(a).localeCompare(
			getExternalEventStartDate(b),
		);
		if (dateCompare !== 0) return dateCompare;
		return a.title.localeCompare(b.title);
	});
}

export function getExternalEventsForDate(
	events: ExternalCalendarEvent[],
	dateStr: string,
): ExternalCalendarDateEvents {
	const singleEvents: ExternalCalendarEvent[] = [];
	const rangeEvents: ExternalCalendarDateEvents["rangeEvents"] = [];
	const summaryEvents: ExternalCalendarEvent[] = [];
	for (const event of events) {
		const startDate = getExternalEventStartDate(event);
		const endDate = getExternalEventEndDate(event);
		if (dateStr < startDate || dateStr > endDate) continue;
		summaryEvents.push(event);
		if (isExternalRangeEvent(event)) {
			rangeEvents.push({
				event,
				runPos: {
					runStart: dateStr === startDate,
					runEnd: dateStr === endDate,
				},
				isFirst: dateStr === startDate,
			});
		} else if (dateStr === startDate) {
			singleEvents.push(event);
		}
	}
	return { singleEvents, rangeEvents, summaryEvents };
}

export function getExternalEventStartDate(event: ExternalCalendarEvent): string {
	return event.start.slice(0, 10);
}

export function getExternalEventEndDate(event: ExternalCalendarEvent): string {
	return (event.end ?? event.start).slice(0, 10);
}

export function isExternalRangeEvent(event: ExternalCalendarEvent): boolean {
	return event.allDay && getExternalEventStartDate(event) < getExternalEventEndDate(event);
}

export function getExternalEventLinkKey(event: ExternalCalendarEvent): string {
	return `${event.calendarId}|${event.uid}|${event.instanceId}`;
}

export function getExternalEventTimeLabel(event: ExternalCalendarEvent, locale: string): string {
	if (event.allDay) return "";
	const start = new Date(event.start);
	if (Number.isNaN(start.getTime())) return "";
	const formatter = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return formatter.format(start);
}

export function getExternalCalendarName(
	settings: DiaryObsidianSettings,
	calendarId: string,
): string {
	return (
		settings.externalCalendars.find((calendar) => calendar.id === calendarId)
			?.name ?? "External calendar"
	);
}

export function getExternalCalendarColor(
	settings: DiaryObsidianSettings,
	calendarId: string,
): string {
	return (
		settings.externalCalendars.find((calendar) => calendar.id === calendarId)
			?.color ?? DEFAULT_EXTERNAL_CALENDAR_COLOR
	);
}

export function getExternalEventDateRangeLabel(event: ExternalCalendarEvent): string {
	const start = getExternalEventStartDate(event);
	const end = getExternalEventEndDate(event);
	if (start === end) return start;
	return `${start} - ${end}`;
}

function parseIcsEvents(
	text: string,
	calendar: ExternalCalendarSettings,
): ExternalCalendarEvent[] {
	const lines = unfoldIcsLines(text);
	const events: ExternalCalendarEvent[] = [];
	let current: MutableEvent | null = null;
	for (const rawLine of lines) {
		const line = parseContentLine(rawLine);
		if (!line) continue;
		if (line.name === "BEGIN" && line.value.toUpperCase() === "VEVENT") {
			current = {
				uid: "",
				title: "",
				start: null,
				end: null,
				durationDays: null,
				categories: [],
			};
			continue;
		}
		if (line.name === "END" && line.value.toUpperCase() === "VEVENT") {
			if (current) {
				const event = normalizeParsedEvent(current, calendar);
				if (event) events.push(event);
			}
			current = null;
			continue;
		}
		if (!current) continue;
		applyContentLineToEvent(current, line, calendar.includeDescriptions);
	}
	return events;
}

function unfoldIcsLines(text: string): string[] {
	const source = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
	const lines: string[] = [];
	for (const line of source) {
		if ((line.startsWith(" ") || line.startsWith("\t")) && lines.length > 0) {
			lines[lines.length - 1] = `${lines[lines.length - 1] ?? ""}${line.slice(1)}`;
		} else {
			lines.push(line);
		}
	}
	return lines;
}

function parseContentLine(line: string): ParsedContentLine | null {
	const sep = line.indexOf(":");
	if (sep < 0) return null;
	const head = line.slice(0, sep);
	const value = unescapeIcsText(line.slice(sep + 1));
	const [nameRaw, ...paramParts] = head.split(";");
	if (!nameRaw) return null;
	const params = new Map<string, string>();
	for (const part of paramParts) {
		const eq = part.indexOf("=");
		if (eq <= 0) continue;
		params.set(part.slice(0, eq).toUpperCase(), part.slice(eq + 1));
	}
	return { name: nameRaw.toUpperCase(), params, value };
}

function applyContentLineToEvent(
	event: MutableEvent,
	line: ParsedContentLine,
	includeDescriptions: boolean,
): void {
	switch (line.name) {
		case "UID":
			event.uid = line.value;
			break;
		case "SUMMARY":
			event.title = line.value;
			break;
		case "DTSTART":
			event.start = parseIcsDateValue(line);
			break;
		case "DTEND":
			event.end = parseIcsDateValue(line);
			break;
		case "DURATION":
			event.durationDays = parseDurationDays(line.value);
			break;
		case "LOCATION":
			event.location = line.value;
			break;
		case "DESCRIPTION":
			if (includeDescriptions) event.descriptionText = line.value;
			break;
		case "STATUS":
			event.status = normalizeStatus(line.value);
			break;
		case "CATEGORIES":
			event.categories.push(
				...line.value
					.split(",")
					.map((category) => category.trim())
					.filter(Boolean),
			);
			break;
		case "LAST-MODIFIED":
			event.updated = parseIcsDateValue(line)?.value;
			break;
		case "RRULE":
			{
				const recurrence = parseRRule(line.value);
				if (recurrence) {
					event.recurrence = {
						...recurrence,
						exDates: event.recurrence?.exDates ?? [],
						rDates: event.recurrence?.rDates ?? [],
					};
				}
			}
			break;
		case "EXDATE":
			addRecurrenceDate(event, line, "exDates");
			break;
		case "RDATE":
			addRecurrenceDate(event, line, "rDates");
			break;
	}
}

function normalizeParsedEvent(
	event: MutableEvent,
	calendar: ExternalCalendarSettings,
): ExternalCalendarEvent | null {
	if (!event.start) return null;
	const uid = event.uid || `${calendar.id}-${event.start.value}-${event.title}`;
	const startDate = event.start.date;
	let endValue = event.end?.value;
	if (!endValue && event.durationDays != null && event.durationDays > 0) {
		endValue = event.start.allDay
			? addDaysToDate(startDate, event.durationDays - 1)
			: addDaysToDateTime(event.start.value, event.durationDays);
	}
	if (!endValue) endValue = event.start.value;
	if (event.start.allDay && event.end?.allDay) {
		endValue = addDaysToDate(event.end.date, -1);
	}
	const instanceId = event.start.value;
	return {
		id: `${calendar.id}:${uid}:${instanceId}`,
		calendarId: calendar.id,
		uid,
		instanceId,
		title: event.title || "(Untitled event)",
		start: event.start.value,
		end: endValue,
		allDay: event.start.allDay,
		location: event.location,
		descriptionText: event.descriptionText,
		status: event.status ?? "confirmed",
		categories: event.categories,
		updated: event.updated,
		color: calendar.color,
		recurrence: event.recurrence,
	};
}

function parseIcsDateValue(line: ParsedContentLine): ParsedDateValue | null {
	const value = line.value.trim();
	const isDateValue =
		line.params.get("VALUE")?.toUpperCase() === "DATE" ||
		/^\d{8}$/.test(value);
	if (isDateValue) {
		const date = compactDateToIso(value);
		return date ? { value: date, allDay: true, date } : null;
	}
	const parsed = parseIcsDateTime(value);
	if (!parsed) return null;
	return { value: parsed, allDay: false, date: parsed.slice(0, 10) };
}

function parseIcsDateTime(value: string): string | null {
	const match = value.match(
		/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/,
	);
	if (!match) return null;
	const [, y, mo, d, h, mi, s, z] = match;
	if (!y || !mo || !d || !h || !mi || !s) return null;
	if (z === "Z") {
		const date = new Date(
			Date.UTC(
				Number(y),
				Number(mo) - 1,
				Number(d),
				Number(h),
				Number(mi),
				Number(s),
			),
		);
		return date.toISOString();
	}
	return `${y}-${mo}-${d}T${h}:${mi}:${s}`;
}

function compactDateToIso(value: string): string | null {
	const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
	if (!match) return null;
	const [, y, m, d] = match;
	if (!y || !m || !d) return null;
	return `${y}-${m}-${d}`;
}

function parseDurationDays(value: string): number | null {
	const match = value.match(/^P(?:(\d+)W)?(?:(\d+)D)?/);
	if (!match) return null;
	const weeks = Number(match[1] ?? 0);
	const days = Number(match[2] ?? 0);
	const total = weeks * 7 + days;
	return total > 0 ? total : null;
}

function parseRRule(value: string): ExternalCalendarRecurrence | undefined {
	const parts = new Map<string, string>();
	for (const part of value.split(";")) {
		const [key, val] = part.split("=");
		if (key && val) parts.set(key.toUpperCase(), val);
	}
	const freq = parts.get("FREQ");
	if (
		freq !== "DAILY" &&
		freq !== "WEEKLY" &&
		freq !== "MONTHLY" &&
		freq !== "YEARLY"
	) {
		return undefined;
	}
	const interval = Number(parts.get("INTERVAL") ?? 1);
	const countRaw = parts.get("COUNT");
	const untilRaw = parts.get("UNTIL");
	return {
		freq,
		interval: Number.isFinite(interval) && interval > 0 ? interval : 1,
		count:
			countRaw && Number.isFinite(Number(countRaw))
				? Number(countRaw)
				: undefined,
		untilDate: untilRaw
			? (compactDateToIso(untilRaw) ?? parseIcsDateTime(untilRaw)?.slice(0, 10))
			: undefined,
		exDates: [],
		rDates: [],
	};
}

function addRecurrenceDate(
	event: MutableEvent,
	line: ParsedContentLine,
	key: "exDates" | "rDates",
): void {
	const dates = line.value
		.split(",")
		.map((value) => parseIcsDateValue({ ...line, value: value.trim() })?.date)
		.filter((date): date is string => Boolean(date));
	if (dates.length === 0) return;
	event.recurrence = event.recurrence ?? {
		freq: "DAILY",
		interval: 1,
		exDates: [],
		rDates: [],
	};
	event.recurrence[key].push(...dates);
}

function expandExternalEvent(
	event: ExternalCalendarEvent,
	range: { start: string; end: string },
): ExternalCalendarEvent[] {
	if (!event.recurrence) {
		return eventIntersectsRange(event, range) ? [event] : [];
	}
	const instances: ExternalCalendarEvent[] = [];
	const durationDays =
		daysBetween(getExternalEventStartDate(event), getExternalEventEndDate(event));
	let occurrenceDate = getExternalEventStartDate(event);
	const excluded = new Set(event.recurrence.exDates);
	let generated = 0;
	let guard = 0;
	while (occurrenceDate <= range.end && guard < 10000) {
		guard++;
		generated++;
		if (event.recurrence.count && generated > event.recurrence.count) break;
		if (event.recurrence.untilDate && occurrenceDate > event.recurrence.untilDate) {
			break;
		}
		if (!excluded.has(occurrenceDate)) {
			const instance = moveEventToDate(event, occurrenceDate, durationDays);
			if (eventIntersectsRange(instance, range)) instances.push(instance);
		}
		occurrenceDate = addInterval(
			occurrenceDate,
			event.recurrence.freq,
			event.recurrence.interval,
		);
	}
	for (const rDate of event.recurrence.rDates) {
		const instance = moveEventToDate(event, rDate, durationDays);
		if (eventIntersectsRange(instance, range)) instances.push(instance);
	}
	return instances;
}

function moveEventToDate(
	event: ExternalCalendarEvent,
	startDate: string,
	durationDays: number,
): ExternalCalendarEvent {
	const endDate = addDaysToDate(startDate, Math.max(0, durationDays));
	const start = replaceDatePart(event.start, startDate);
	const end = event.end ? replaceDatePart(event.end, endDate) : undefined;
	const instanceId = start;
	return {
		...event,
		id: `${event.calendarId}:${event.uid}:${instanceId}`,
		instanceId,
		start,
		end,
		recurrence: undefined,
	};
}

function eventIntersectsRange(
	event: ExternalCalendarEvent,
	range: { start: string; end: string },
): boolean {
	const start = getExternalEventStartDate(event);
	const end = getExternalEventEndDate(event);
	return end >= range.start && start <= range.end;
}

function addInterval(
	dateStr: string,
	freq: ExternalCalendarRecurrence["freq"],
	interval: number,
): string {
	const date = parseIsoDateAsUtc(dateStr);
	if (!date) return dateStr;
	switch (freq) {
		case "DAILY":
			date.setUTCDate(date.getUTCDate() + interval);
			break;
		case "WEEKLY":
			date.setUTCDate(date.getUTCDate() + interval * 7);
			break;
		case "MONTHLY":
			date.setUTCMonth(date.getUTCMonth() + interval);
			break;
		case "YEARLY":
			date.setUTCFullYear(date.getUTCFullYear() + interval);
			break;
	}
	return formatUtcDate(date);
}

function replaceDatePart(value: string, dateStr: string): string {
	if (value.length <= 10) return dateStr;
	return `${dateStr}${value.slice(10)}`;
}

function addDaysToDateTime(value: string, days: number): string {
	return replaceDatePart(value, addDaysToDate(value.slice(0, 10), days));
}

function addDaysToDate(dateStr: string, days: number): string {
	const date = parseIsoDateAsUtc(dateStr);
	if (!date) return dateStr;
	date.setUTCDate(date.getUTCDate() + days);
	return formatUtcDate(date);
}

function daysBetween(start: string, end: string): number {
	const s = parseIsoDateAsUtc(start);
	const e = parseIsoDateAsUtc(end);
	if (!s || !e) return 0;
	return Math.max(0, Math.round((e.getTime() - s.getTime()) / 86400000));
}

function parseIsoDateAsUtc(dateStr: string): Date | null {
	const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;
	const [, y, m, d] = match;
	if (!y || !m || !d) return null;
	return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

function formatUtcDate(date: Date): string {
	return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
		2,
		"0",
	)}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function normalizeExternalEvents(
	value: unknown,
	calendarId: string,
): ExternalCalendarEvent[] {
	if (!Array.isArray(value)) return [];
	const events: ExternalCalendarEvent[] = [];
	for (const item of value) {
		if (!isRecord(item)) continue;
		const uid = normalizeString(item.uid);
		const instanceId = normalizeString(item.instanceId);
		const title = normalizeString(item.title);
		const start = normalizeString(item.start);
		if (!uid || !instanceId || !title || !start) continue;
		events.push({
			id: normalizeString(item.id) || `${calendarId}:${uid}:${instanceId}`,
			calendarId,
			uid,
			instanceId,
			title,
			start,
			end: normalizeString(item.end) || undefined,
			allDay: item.allDay === true,
			location: normalizeString(item.location) || undefined,
			descriptionText: normalizeString(item.descriptionText) || undefined,
			status: normalizeStatus(normalizeString(item.status)) ?? "confirmed",
			categories: Array.isArray(item.categories)
				? item.categories
						.map((category) => normalizeString(category))
						.filter((category): category is string => Boolean(category))
				: [],
			updated: normalizeString(item.updated) || undefined,
			color: normalizeString(item.color) || undefined,
			recurrence: normalizeRecurrence(item.recurrence),
		});
	}
	return events;
}

function normalizeRecurrence(value: unknown): ExternalCalendarRecurrence | undefined {
	if (!isRecord(value)) return undefined;
	const freq = normalizeString(value.freq);
	if (
		freq !== "DAILY" &&
		freq !== "WEEKLY" &&
		freq !== "MONTHLY" &&
		freq !== "YEARLY"
	) {
		return undefined;
	}
	const interval = Number(value.interval ?? 1);
	const count = Number(value.count);
	return {
		freq,
		interval: Number.isFinite(interval) && interval > 0 ? interval : 1,
		count: Number.isFinite(count) && count > 0 ? count : undefined,
		untilDate: normalizeString(value.untilDate) || undefined,
		exDates: normalizeStringArray(value.exDates),
		rDates: normalizeStringArray(value.rDates),
	};
}

function normalizeStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => normalizeString(item))
		.filter((item): item is string => Boolean(item));
}

function normalizeLastError(value: unknown): ExternalCalendarCache["lastError"] {
	if (!isRecord(value)) return undefined;
	const message = normalizeString(value.message);
	const occurredAt = normalizeString(value.occurredAt);
	return message && occurredAt ? { message, occurredAt } : undefined;
}

function normalizeRefreshMinutes(value: unknown): number | null {
	if (value == null) return null;
	const minutes = Number(value);
	if (!Number.isFinite(minutes) || minutes < 5 || minutes > 1440) return null;
	return Math.round(minutes);
}

function normalizeExternalCalendarUrl(value: string): string {
	const trimmed = value.trim();
	const normalized = trimmed.startsWith("webcal://")
		? `https://${trimmed.slice("webcal://".length)}`
		: trimmed;
	let url: URL;
	try {
		url = new URL(normalized);
	} catch {
		throw new Error("Enter a valid webcal:// or https:// URL.");
	}
	if (url.protocol !== "https:") {
		throw new Error("Only webcal:// and https:// calendar URLs are supported.");
	}
	if (isBlockedHostname(url.hostname)) {
		throw new Error("Local and private network calendar URLs are not supported.");
	}
	return url.toString();
}

function isBlockedHostname(hostname: string): boolean {
	const lower = hostname.toLowerCase();
	if (lower === "localhost" || lower.endsWith(".local")) return true;
	const ipv4 = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
	if (!ipv4) return false;
	const a = Number(ipv4[1]);
	const b = Number(ipv4[2]);
	return (
		a === 10 ||
		a === 127 ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && b === 168)
	);
}

function isCalendarVisibleInScope(
	calendar: ExternalCalendarSettings,
	scope: ExternalCalendarViewScope,
): boolean {
	if (scope === "yearly") return calendar.showInYearly;
	if (scope === "monthly") return calendar.showInMonthly;
	if (scope === "monthlyList") return calendar.showInMonthlyList;
	return calendar.showInSidebar;
}

function getLinkedExternalEventKeys(app: App, plannerFiles: TFile[]): Set<string> {
	const keys = new Set<string>();
	for (const file of plannerFiles) {
		const fm = app.metadataCache.getFileCache(file)?.frontmatter;
		if (!fm) continue;
		const calendarId = normalizeString(fm.diary_external_calendar);
		const uid = normalizeString(fm.diary_external_event_uid);
		const instanceId = normalizeString(fm.diary_external_event_instance);
		if (calendarId && uid && instanceId) {
			keys.add(`${calendarId}|${uid}|${instanceId}`);
		}
	}
	return keys;
}

function normalizeStatus(
	value: string | undefined,
): ExternalCalendarEvent["status"] | undefined {
	const normalized = value?.trim().toLowerCase();
	if (normalized === "cancelled") return "cancelled";
	if (normalized === "tentative") return "tentative";
	if (normalized === "confirmed") return "confirmed";
	return undefined;
}

function unescapeIcsText(value: string): string {
	return value
		.replace(/\\n/gi, "\n")
		.replace(/\\,/g, ",")
		.replace(/\\;/g, ";")
		.replace(/\\\\/g, "\\");
}

function hashString(value: string): string {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return `fnv1a:${(hash >>> 0).toString(16)}`;
}

function normalizeString(value: unknown): string {
	if (typeof value === "string") return value.trim();
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	return "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
