import type { TFile } from "obsidian";
import type { CalendarCell } from "../../utils/date";
import { getHolidaysForYear, type HolidayData } from "../../utils/holidays";
import { getPlannerRangesForPeriod, type RangeForYear } from "../yearly-planner/file-utils";

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
	return getPlannerRangesForPeriod(files, visibleRange);
}
