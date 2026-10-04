import type { TFile } from "obsidian";
import type { CalendarCell } from "../../utils/date";
import { getHolidaysForYear, type HolidayData } from "../../utils/holidays";
import { parseRangeBasename } from "../../utils/range";
import type { RangeForYear } from "../yearly-planner/file-utils";

export function getCalendarHolidays(country: string, cells: CalendarCell[]): HolidayData {
	const result: HolidayData = { dates: new Set(), names: new Map() };
	for (const year of new Set(cells.map((cell) => cell.year))) {
		const holidays = getHolidaysForYear(country, year);
		for (const date of holidays.dates) result.dates.add(date);
		for (const [date, names] of holidays.names) result.names.set(date, names);
	}
	return result;
}

/** Scan the existing file snapshot once, including ranges across year boundaries. */
export function getCalendarRanges(files: TFile[], visibleRange: { start: string; end: string }): RangeForYear[] {
	const ranges: RangeForYear[] = [];
	for (const file of files) {
		const range = parseRangeBasename(file.basename);
		if (range && range.end >= visibleRange.start && range.start <= visibleRange.end) {
			ranges.push({ file, start: range.start, end: range.end });
		}
	}
	return ranges.sort((a, b) => a.start.localeCompare(b.start));
}
