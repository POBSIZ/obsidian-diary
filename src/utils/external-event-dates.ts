import type { ExternalCalendarEvent, ExternalCalendarDateEvents } from "./external-calendars";
import { getExternalCalendarDateTime, getExternalCalendarTimeZone } from "./external-calendar-timezone";
import { DateIntervalIndex } from "./date-interval-index";
import { LruCache } from "./lru-cache";

/** One immutable render snapshot. Date conversions and index construction happen once. */
export function createExternalEventDateLookup(events: readonly ExternalCalendarEvent[]): (date: string) => ExternalCalendarDateEvents {
	const entries = events.map((event, order) => ({
		event, order, start: getExternalEventStartDate(event), end: getExternalEventEndDate(event),
	}));
	const index = new DateIntervalIndex(entries, (entry) => entry);
	return (date) => {
		const result: ExternalCalendarDateEvents = { singleEvents: [], rangeEvents: [], summaryEvents: [] };
		// Preserve the caller's ordering when sources and external calendars are combined.
		for (const { event, start, end } of index.query(date).sort((a, b) => a.order - b.order)) {
			result.summaryEvents.push(event);
			if (event.allDay && start < end) {
				result.rangeEvents.push({ event, runPos: { runStart: date === start, runEnd: date === end }, isFirst: date === start });
			} else if (date === start) result.singleEvents.push(event);
		}
		return result;
	};
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
	return getExternalEventDisplayDate(event.start, event);
}

export function getExternalEventEndDate(event: ExternalCalendarEvent): string {
	return getExternalEventDisplayDate(event.end ?? event.start, event);
}

function getExternalEventDisplayDate(value: string, event: ExternalCalendarEvent): string {
	if (event.allDay) return value.slice(0, 10);
	return getExternalCalendarDateTime(value, event.displayTimeZone)?.date ?? value.slice(0, 10);
}

export function getExternalEventMinutes(
	event: ExternalCalendarEvent,
	dateString: string,
): { start: number; end: number } | null {
	if (event.allDay) return null;
	const start = getExternalCalendarDateTime(event.start, event.displayTimeZone);
	if (!start) return null;
	let startMinutes = start.date < dateString ? 0 : start.hour * 60 + start.minute;
	let endMinutes = startMinutes + 60;
	const end = event.end ? getExternalCalendarDateTime(event.end, event.displayTimeZone) : null;
	if (end) endMinutes = end.date > dateString ? 1440 : end.hour * 60 + end.minute;
	startMinutes = Math.max(0, Math.min(1439, startMinutes));
	endMinutes = Math.max(startMinutes + 15, Math.min(1440, endMinutes));
	return { start: startMinutes, end: endMinutes };
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
	const zone = getExternalCalendarTimeZone(event.start, event.displayTimeZone);
	// Read device/floating wall time afresh; cached formatters must not retain an old device zone.
	const displayDate = zone ? start : new Date(Date.UTC(2000, 0, 1, start.getHours(), start.getMinutes()));
	const timeZone = zone ?? "UTC";
	const displayLocale = locale === "ko" ? "ko-KR" : "en-US";
	const key = `${displayLocale}|${timeZone}`;
	let formatter = timeLabelFormatters.get(key);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat(displayLocale, { hour: "2-digit", minute: "2-digit", timeZone });
		timeLabelFormatters.set(key, formatter);
	}
	return formatter.format(displayDate);
}

const timeLabelFormatters = new LruCache<string, Intl.DateTimeFormat>(64);

export function getExternalEventDateRangeLabel(event: ExternalCalendarEvent): string {
	const start = getExternalEventStartDate(event);
	const end = getExternalEventEndDate(event);
	if (start === end) return start;
	return `${start} - ${end}`;
}
