import KoreanLunarCalendar from "korean-lunar-calendar";
import { CalendarChinese, CalendarKorean } from "date-chinese";
import { CalendarDate, createCalendar, toCalendar } from "@internationalized/date";
import type { AlternateCalendarId } from "../alternate-calendars";
import type { CalendarDateParts, RecurrenceCalendarId } from "../recurrence";
import { parseDateString } from "./date";

const INTL_CALENDAR_IDS = new Set<AlternateCalendarId>([
	"buddhist",
	"hebrew",
	"islamic",
	"islamic-civil",
	"islamic-umalqura",
	"persian",
	"indian",
	"japanese",
	"roc",
	"coptic",
	"ethiopic",
]);

type InternationalizedCalendarId = Parameters<typeof createCalendar>[0];

const INTERNATIONALIZED_DATE_IDS: Partial<
	Record<AlternateCalendarId, InternationalizedCalendarId>
> = {
	buddhist: "buddhist",
	hebrew: "hebrew",
	"islamic-civil": "islamic-civil",
	"islamic-umalqura": "islamic-umalqura",
	persian: "persian",
	indian: "indian",
	japanese: "japanese",
	roc: "roc",
	coptic: "coptic",
	ethiopic: "ethiopic",
};

export function getCalendarDateParts(
	dateStr: string,
	calendar: RecurrenceCalendarId,
): CalendarDateParts | null {
	return convertCalendarDateParts(dateStr, calendar);
}

/** A single expansion/render owns these values; changed settings never reuse stale parts. */
export function createCalendarDatePartsLookup(): typeof getCalendarDateParts {
	const dates = new Map<RecurrenceCalendarId, Map<string, CalendarDateParts | null>>();
	const formatters = new Map<AlternateCalendarId, Intl.DateTimeFormat>();
	return (dateStr, calendar) => {
		let calendarDates = dates.get(calendar);
		if (!calendarDates) {
			calendarDates = new Map();
			dates.set(calendar, calendarDates);
		}
		if (calendarDates.has(dateStr)) return calendarDates.get(dateStr) ?? null;
		const parts = convertCalendarDateParts(dateStr, calendar, formatters);
		calendarDates.set(dateStr, parts);
		return parts;
	};
}

function convertCalendarDateParts(
	dateStr: string,
	calendar: RecurrenceCalendarId,
	formatters?: Map<AlternateCalendarId, Intl.DateTimeFormat>,
): CalendarDateParts | null {
	const gregorian = getGregorianDateParts(dateStr);
	if (!gregorian) return null;
	if (calendar === "gregorian") return gregorian;
	if (calendar === "korean-lunar") return getKoreanLunarParts(gregorian);
	if (calendar === "chinese") return getChineseParts(gregorian, false, formatters);
	if (calendar === "dangi") return getChineseParts(gregorian, true, formatters);

	const intlDateId = INTERNATIONALIZED_DATE_IDS[calendar];
	if (intlDateId) {
		try {
			const converted = toCalendar(
				new CalendarDate(gregorian.year, gregorian.month, gregorian.day),
				createCalendar(intlDateId),
			);
			return {
				year: converted.year,
				month: converted.month,
				day: converted.day,
				era: converted.era,
			};
		} catch {
			return getIntlCalendarParts(gregorian, calendar, formatters);
		}
	}

	return getIntlCalendarParts(gregorian, calendar, formatters);
}

function getGregorianDateParts(dateStr: string): CalendarDateParts | null {
	const parsed = parseDateString(dateStr);
	if (!parsed) return null;
	return parsed;
}

function getKoreanLunarParts(
	gregorian: CalendarDateParts,
): CalendarDateParts | null {
	const calendar = new KoreanLunarCalendar();
	if (!calendar.setSolarDate(gregorian.year, gregorian.month, gregorian.day)) {
		return null;
	}
	const lunar = calendar.getLunarCalendar();
	return {
		year: lunar.year,
		month: lunar.month,
		day: lunar.day,
		isLeapMonth: lunar.intercalation === true,
	};
}

function getChineseParts(
	gregorian: CalendarDateParts,
	useKoreanMeridian: boolean,
	formatters?: Map<AlternateCalendarId, Intl.DateTimeFormat>,
): CalendarDateParts | null {
	try {
		const calendar = useKoreanMeridian
			? new CalendarKorean()
			: new CalendarChinese();
		calendar.fromGregorian(gregorian.year, gregorian.month, gregorian.day);
		const values = calendar.get();
		const month = Number(values[2]);
		const leap = Boolean(values[3]);
		const day = Number(values[4]);
		return {
			year: calendar.yearFromEpochCycle(),
			month,
			day,
			isLeapMonth: leap,
		};
	} catch {
		return getIntlCalendarParts(
			gregorian,
			useKoreanMeridian ? "dangi" : "chinese",
			formatters,
		);
	}
}

function getIntlCalendarParts(
	gregorian: CalendarDateParts,
	calendar: AlternateCalendarId,
	formatters?: Map<AlternateCalendarId, Intl.DateTimeFormat>,
): CalendarDateParts | null {
	if (!INTL_CALENDAR_IDS.has(calendar) && calendar !== "chinese" && calendar !== "dangi") {
		return null;
	}
	try {
		const formatter = formatters?.get(calendar) ?? new Intl.DateTimeFormat(
			`en-US-u-ca-${calendar}-nu-latn`,
			{
				year: "numeric",
				month: "numeric",
				day: "numeric",
			},
		);
		if (formatter.resolvedOptions().calendar !== calendar) return null;
		formatters?.set(calendar, formatter);
		const parts = formatter.formatToParts(
			new Date(gregorian.year, gregorian.month - 1, gregorian.day),
		);
		const year =
			getNumberPart(parts, "relatedYear") ?? getNumberPart(parts, "year");
		const month = getNumberPart(parts, "month");
		const day = getNumberPart(parts, "day");
		if (!year || !month || !day) return null;
		return {
			year,
			month,
			day,
			era: getStringPart(parts, "era") ?? undefined,
		};
	} catch {
		return null;
	}
}

function getNumberPart(
	parts: Intl.DateTimeFormatPart[],
	type: string,
): number | null {
	const part = parts.find((p) => p.type === type);
	if (!part) return null;
	const n = Number(part.value.replace(/[^\d-]/g, ""));
	return Number.isFinite(n) ? n : null;
}

function getStringPart(
	parts: Intl.DateTimeFormatPart[],
	type: string,
): string | null {
	return parts.find((p) => p.type === type)?.value ?? null;
}
