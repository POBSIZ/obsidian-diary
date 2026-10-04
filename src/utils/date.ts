export function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Returns day of week: 0=Sunday, 6=Saturday */
export function getDayOfWeek(year: number, month: number, day: number): number {
	return new Date(year, month - 1, day).getDay();
}

export function getDaysInMonth(year: number, month: number): number {
	if (month === 2) {
		return isLeapYear(year) ? 29 : 28;
	}
	if ([4, 6, 9, 11].includes(month)) {
		return 30;
	}
	return 31;
}

/** Returns day of week for the 1st of the month: 0=Sunday, 6=Saturday */
export function getFirstDayOfMonth(year: number, month: number): number {
	return new Date(year, month - 1, 1).getDay();
}

export interface CalendarCell {
	year: number;
	month: number;
	day: number;
}

/** Returns six complete weeks, including dates from adjacent months. */
export function getMonthCalendarCells(
	year: number,
	month: number,
	weekStart: 0 | 1 = 0,
): CalendarCell[] {
	const firstDay = (getFirstDayOfMonth(year, month) - weekStart + 7) % 7;
	return Array.from({ length: 42 }, (_, index) => {
		const date = new Date(year, month - 1, 1 - firstDay + index);
		return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
	});
}

export function getCalendarDateKey(date: CalendarCell): string {
	return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function getMonthCalendarRange(year: number, month: number, weekStart: 0 | 1 = 0): { start: string; end: string } {
	const cells = getMonthCalendarCells(year, month, weekStart);
	return { start: getCalendarDateKey(cells[0]!), end: getCalendarDateKey(cells[41]!) };
}

export function isDateInMonthCalendar(date: CalendarCell, year: number, month: number, weekStart: 0 | 1 = 0): boolean {
	return getMonthCalendarCells(year, month, weekStart).some(
		(cell) => cell.year === date.year && cell.month === date.month && cell.day === date.day,
	);
}
