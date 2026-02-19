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

/**
 * Returns a flat array of calendar cells for the month grid.
 * Includes leading empty slots (null) for days before the 1st.
 * Uses 6 rows × 7 columns = 42 cells.
 */
export function getMonthCalendarCells(
	year: number,
	month: number,
): (CalendarCell | null)[] {
	const firstDay = getFirstDayOfMonth(year, month);
	const daysInMonth = getDaysInMonth(year, month);
	const totalSlots = 6 * 7;
	const cells: (CalendarCell | null)[] = [];

	for (let i = 0; i < firstDay; i++) {
		cells.push(null);
	}
	for (let day = 1; day <= daysInMonth; day++) {
		cells.push({ year, month, day });
	}
	while (cells.length < totalSlots) {
		cells.push(null);
	}
	return cells;
}
