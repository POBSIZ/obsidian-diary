const pad = (n: number): string => String(n).padStart(2, "0");
const DAY_MS = 86_400_000;

export function parseDateString(
	dateStr: string,
): { year: number; month: number; day: number } | null {
	const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return null;
	const year = Number(m[1]);
	const month = Number(m[2]);
	const day = Number(m[3]);
	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
		return null;
	}
	return { year, month, day };
}

export function isValidDateString(dateStr: string): boolean {
	const parsed = parseDateString(dateStr);
	if (!parsed) return false;
	const date = new Date(parsed.year, parsed.month - 1, parsed.day);
	return (
		date.getFullYear() === parsed.year &&
		date.getMonth() === parsed.month - 1 &&
		date.getDate() === parsed.day
	);
}

function dateStringToUtcDate(dateStr: string): Date {
	const parsed = parseDateString(dateStr);
	if (!parsed) return new Date(Date.UTC(1970, 0, 1));
	return new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
}

function utcDateToDateString(date: Date): string {
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
		date.getUTCDate(),
	)}`;
}

export function addDays(dateStr: string, days: number): string {
	const date = dateStringToUtcDate(dateStr);
	date.setUTCDate(date.getUTCDate() + days);
	return utcDateToDateString(date);
}

export function daysBetween(start: string, end: string): number {
	return Math.round(
		(dateStringToUtcDate(end).getTime() - dateStringToUtcDate(start).getTime()) /
			DAY_MS,
	);
}
