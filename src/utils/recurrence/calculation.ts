import type {
	CalendarDateParts,
	RecurrenceCalendarId,
	RecurrenceMaterializeRange,
	RecurrenceSourceDefinition,
	SimpleRecurrenceFrequency,
} from "../recurrence";
import { addDays, daysBetween } from "./date";

export function expandSimpleRecurrenceDates(
	source: RecurrenceSourceDefinition,
	range: RecurrenceMaterializeRange,
	frequency: SimpleRecurrenceFrequency,
	interval: number,
	getParts: (date: string, calendar: RecurrenceCalendarId) => CalendarDateParts | null,
): string[] {
	if (range.end < source.anchorDate) return [];
	const start = range.start > source.anchorDate ? range.start : source.anchorDate;
	const end =
		source.untilDate && source.untilDate < range.end
			? source.untilDate
			: range.end;
	if (end < start) return [];

	const matches: string[] = [];
	// Daily and weekly series are Gregorian day intervals regardless of display calendar.
	// Start at the first candidate on the original anchor's interval, then skip non-matches.
	const step = frequency === "DAILY" ? interval : frequency === "WEEKLY" ? 7 * interval : 1;
	const remainder = daysBetween(source.anchorDate, start) % step;
	let cursor = remainder === 0 ? start : addDays(start, step - remainder);
	while (cursor <= end) {
		if (
			!source.exdates.includes(cursor) &&
			(frequency === "DAILY" || frequency === "WEEKLY" || matchesCalendarRecurrenceDate(source, frequency, interval, cursor, getParts))
		) {
			matches.push(cursor);
		}
		cursor = addDays(cursor, step);
	}

	return matches;
}

function matchesCalendarRecurrenceDate(
	source: RecurrenceSourceDefinition,
	frequency: "MONTHLY" | "YEARLY",
	interval: number,
	dateStr: string,
	getParts: (date: string, calendar: RecurrenceCalendarId) => CalendarDateParts | null,
): boolean {
	const parts = getParts(dateStr, source.calendar);
	if (!parts) return false;
	if (
		source.anchorParts.isLeapMonth !== undefined &&
		parts.isLeapMonth !== source.anchorParts.isLeapMonth
	) {
		return false;
	}
	if (frequency === "MONTHLY") {
		const months = monthsBetween(source.anchorParts, parts);
		return (
			months >= 0 &&
			months % interval === 0 &&
			parts.day === source.anchorParts.day
		);
	}
	if (frequency === "YEARLY") {
		const years = parts.year - source.anchorParts.year;
		return (
			years >= 0 &&
			years % interval === 0 &&
			parts.month === source.anchorParts.month &&
			parts.day === source.anchorParts.day
		);
	}
	return false;
}

function monthsBetween(start: CalendarDateParts, end: CalendarDateParts): number {
	return (end.year - start.year) * 12 + (end.month - start.month);
}
