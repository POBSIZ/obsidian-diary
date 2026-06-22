export interface CustomCalendarMonth {
	id: string;
	name: string;
	shortName: string;
	days: number;
}

export interface CustomCalendarWeekday {
	id: string;
	name: string;
	shortName: string;
}

export type CustomCalendarLeapRule =
	| { type: "none" }
	| {
			type: "every-n-years";
			interval: number;
			addDays: number;
			month: number;
			mode: "extend-month" | "after-month";
	  };

export interface CustomCalendarProfile {
	id: string;
	name: string;
	shortName: string;
	revision: number;
	epoch: {
		gregorianDate: string;
		year: number;
		month: number;
		day: number;
		weekday: number;
	};
	months: CustomCalendarMonth[];
	weekdays: CustomCalendarWeekday[];
	leapRule: CustomCalendarLeapRule;
	display: {
		labelFormat: "month-day" | "short-month-day" | "year-month-day";
	};
}

export interface CustomCalendarDateParts {
	year: number;
	month: number;
	day: number;
	weekday: number;
	monthName: string;
	monthShortName: string;
	weekdayName: string;
	weekdayShortName: string;
}

export interface ValidationResult {
	ok: boolean;
	errors: string[];
}

const DAY_MS = 86_400_000;
const DEFAULT_MONTH_COUNT = 13;
const DEFAULT_DAYS_PER_MONTH = 28;
const yearCache = new Map<string, YearInfo>();

interface YearInfo {
	monthLengths: number[];
	yearLength: number;
}

interface ParsedDate {
	year: number;
	month: number;
	day: number;
}

export function createCustomCalendarId(): string {
	const cryptoObj = typeof window !== "undefined" ? window.crypto : null;
	if (cryptoObj?.randomUUID) return `cal_${cryptoObj.randomUUID()}`;
	const random =
		cryptoObj?.getRandomValues != null
			? Array.from(cryptoObj.getRandomValues(new Uint32Array(2)))
					.map((n) => n.toString(36))
					.join("")
			: Math.random().toString(36).slice(2);
	return `cal_${Date.now().toString(36)}_${random}`;
}

export function createDefaultCustomCalendarProfile(
	locale: string,
): CustomCalendarProfile {
	const isKo = locale === "ko";
	const months = Array.from({ length: DEFAULT_MONTH_COUNT }, (_, index) => {
		const month = index + 1;
		return {
			id: `m${month}`,
			name: isKo ? `${month}월` : `Moon ${month}`,
			shortName: isKo ? `${month}월` : `M${month}`,
			days: DEFAULT_DAYS_PER_MONTH,
		};
	});
	const weekdays = (isKo
		? ["첫째", "둘째", "셋째", "넷째", "다섯째", "여섯째", "일곱째"]
		: ["First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh"]
	).map((name, index) => ({
		id: `w${index + 1}`,
		name,
		shortName: isKo ? name.slice(0, 1) : name.slice(0, 3),
	}));
	return {
		id: createCustomCalendarId(),
		name: isKo ? "커스텀 판타지 캘린더" : "Custom fantasy calendar",
		shortName: isKo ? "커스텀" : "Custom",
		revision: 1,
		epoch: {
			gregorianDate: new Date().toISOString().slice(0, 10),
			year: 1,
			month: 1,
			day: 1,
			weekday: 1,
		},
		months,
		weekdays,
		leapRule: { type: "none" },
		display: { labelFormat: "short-month-day" },
	};
}

export function normalizeCustomCalendarProfiles(
	value: unknown,
): CustomCalendarProfile[] {
	if (!Array.isArray(value)) return [];
	return value
		.map(normalizeCustomCalendarProfile)
		.filter((profile): profile is CustomCalendarProfile => profile != null);
}

export function normalizeCustomCalendarProfile(
	value: unknown,
): CustomCalendarProfile | null {
	if (!value || typeof value !== "object") return null;
	const record = value as Record<string, unknown>;
	const months = normalizeMonths(record.months);
	const weekdays = normalizeWeekdays(record.weekdays);
	const epoch = normalizeEpoch(record.epoch, months, weekdays);
	const profile: CustomCalendarProfile = {
		id: toCleanString(record.id) ?? createCustomCalendarId(),
		name: toCleanString(record.name) ?? "Custom calendar",
		shortName: toCleanString(record.shortName) ?? "Custom",
		revision: Math.max(1, toInteger(record.revision) ?? 1),
		epoch,
		months,
		weekdays,
		leapRule: normalizeLeapRule(record.leapRule, months.length),
		display: {
			labelFormat: normalizeLabelFormat(
				(record.display as Record<string, unknown> | undefined)
					?.labelFormat,
			),
		},
	};
	return validateCustomCalendarProfile(profile).ok ? profile : null;
}

export function validateCustomCalendarProfile(
	profile: CustomCalendarProfile,
): ValidationResult {
	const errors: string[] = [];
	if (!profile.name.trim()) errors.push("Name is required.");
	if (!isValidDateString(profile.epoch.gregorianDate)) {
		errors.push("Epoch Gregorian date must use YYYY-MM-DD.");
	}
	if (!Number.isInteger(profile.epoch.year) || profile.epoch.year === 0) {
		errors.push("Epoch year must be a non-zero integer.");
	}
	if (
		!Number.isInteger(profile.epoch.month) ||
		profile.epoch.month < 1 ||
		profile.epoch.month > profile.months.length
	) {
		errors.push("Epoch month is outside the month list.");
	}
	const epochMonth = profile.months[profile.epoch.month - 1];
	if (
		!epochMonth ||
		!Number.isInteger(profile.epoch.day) ||
		profile.epoch.day < 1 ||
		profile.epoch.day > getMonthLength(profile, profile.epoch.year, profile.epoch.month)
	) {
		errors.push("Epoch day is outside the selected month.");
	}
	if (
		!Number.isInteger(profile.epoch.weekday) ||
		profile.epoch.weekday < 1 ||
		profile.epoch.weekday > profile.weekdays.length
	) {
		errors.push("Epoch weekday is outside the weekday list.");
	}
	if (profile.months.length < 1 || profile.months.length > 24) {
		errors.push("Use 1-24 months.");
	}
	for (const month of profile.months) {
		if (!month.name.trim()) errors.push("Each month needs a name.");
		if (!Number.isInteger(month.days) || month.days < 1 || month.days > 99) {
			errors.push("Each month length must be 1-99 days.");
		}
	}
	if (profile.weekdays.length < 1 || profile.weekdays.length > 14) {
		errors.push("Use 1-14 weekdays.");
	}
	for (const weekday of profile.weekdays) {
		if (!weekday.name.trim()) errors.push("Each weekday needs a name.");
	}
	if (profile.leapRule.type === "every-n-years") {
		if (profile.leapRule.interval < 2 || profile.leapRule.interval > 100) {
			errors.push("Leap interval must be 2-100.");
		}
		if (profile.leapRule.addDays < 1 || profile.leapRule.addDays > 30) {
			errors.push("Leap days must be 1-30.");
		}
		if (
			profile.leapRule.month < 1 ||
			profile.leapRule.month > profile.months.length
		) {
			errors.push("Leap month is outside the month list.");
		}
	}
	return { ok: errors.length === 0, errors };
}

export function getCustomCalendarDateParts(
	dateStr: string,
	profile: CustomCalendarProfile,
): CustomCalendarDateParts | null {
	if (!isValidDateString(dateStr)) return null;
	const targetIndex = utcDayIndex(dateStr);
	const epochIndex = utcDayIndex(profile.epoch.gregorianDate);
	if (targetIndex == null || epochIndex == null) return null;
	const offset = targetIndex - epochIndex;
	const epochDayOfYear = customDayOfYear(
		profile,
		profile.epoch.year,
		profile.epoch.month,
		profile.epoch.day,
	);
	if (epochDayOfYear == null) return null;

	let year = profile.epoch.year;
	let dayIndex = epochDayOfYear - 1 + offset;

	while (dayIndex < 0) {
		year = nextCustomYear(year, -1);
		dayIndex += getYearInfo(profile, year).yearLength;
	}
	let yearInfo = getYearInfo(profile, year);
	while (dayIndex >= yearInfo.yearLength) {
		dayIndex -= yearInfo.yearLength;
		year = nextCustomYear(year, 1);
		yearInfo = getYearInfo(profile, year);
	}

	let month = 1;
	let remaining = dayIndex;
	for (let i = 0; i < yearInfo.monthLengths.length; i++) {
		const length = yearInfo.monthLengths[i] ?? 0;
		if (remaining < length) {
			month = i + 1;
			break;
		}
		remaining -= length;
	}

	const monthInfo = profile.months[month - 1];
	const weekdayIndex =
		mod((profile.epoch.weekday - 1) + offset, profile.weekdays.length) + 1;
	const weekdayInfo = profile.weekdays[weekdayIndex - 1];
	if (!monthInfo || !weekdayInfo) return null;
	return {
		year,
		month,
		day: remaining + 1,
		weekday: weekdayIndex,
		monthName: monthInfo.name,
		monthShortName: monthInfo.shortName,
		weekdayName: weekdayInfo.name,
		weekdayShortName: weekdayInfo.shortName,
	};
}

export function getGregorianDateFromCustomParts(
	parts: { year: number; month: number; day: number },
	profile: CustomCalendarProfile,
): string | null {
	if (parts.year === 0 || parts.month < 1 || parts.month > profile.months.length) {
		return null;
	}
	const targetDayOfYear = customDayOfYear(
		profile,
		parts.year,
		parts.month,
		parts.day,
	);
	const epochDayOfYear = customDayOfYear(
		profile,
		profile.epoch.year,
		profile.epoch.month,
		profile.epoch.day,
	);
	if (targetDayOfYear == null || epochDayOfYear == null) return null;

	let offset = targetDayOfYear - epochDayOfYear;
	let year = profile.epoch.year;
	while (year !== parts.year) {
		if (year < parts.year) {
			offset += getYearInfo(profile, year).yearLength;
			year = nextCustomYear(year, 1);
		} else {
			year = nextCustomYear(year, -1);
			offset -= getYearInfo(profile, year).yearLength;
		}
	}
	const epochIndex = utcDayIndex(profile.epoch.gregorianDate);
	if (epochIndex == null) return null;
	return dateFromUtcDayIndex(epochIndex + offset);
}

export function formatCustomCalendarLabel(
	parts: CustomCalendarDateParts,
	profile: CustomCalendarProfile,
): string {
	if (profile.display.labelFormat === "month-day") {
		return `${parts.monthName} ${parts.day}`;
	}
	if (profile.display.labelFormat === "year-month-day") {
		return `${parts.year} ${parts.monthShortName} ${parts.day}`;
	}
	return `${parts.monthShortName} ${parts.day}`;
}

export function formatCustomCalendarFullLabel(
	parts: CustomCalendarDateParts,
): string {
	return `${parts.weekdayName}, ${parts.monthName} ${parts.day}, ${parts.year}`;
}

export function getCustomCalendarProfileHash(
	profile: CustomCalendarProfile,
): string {
	const payload = JSON.stringify({
		name: profile.name,
		epoch: profile.epoch,
		months: profile.months,
		weekdays: profile.weekdays,
		leapRule: profile.leapRule,
		display: profile.display,
	});
	let hash = 0;
	for (let i = 0; i < payload.length; i++) {
		hash = (hash * 31 + payload.charCodeAt(i)) >>> 0;
	}
	return `h${hash.toString(16).padStart(8, "0")}`;
}

export function clearCustomCalendarCaches(): void {
	yearCache.clear();
}

function normalizeMonths(value: unknown): CustomCalendarMonth[] {
	const raw = Array.isArray(value) ? value : [];
	const months = raw
		.map((month, index) => normalizeMonth(month, index))
		.filter((month): month is CustomCalendarMonth => month != null);
	return months.length > 0
		? months.slice(0, 24)
		: createDefaultCustomCalendarProfile("en").months;
}

function normalizeMonth(
	value: unknown,
	index: number,
): CustomCalendarMonth | null {
	if (!value || typeof value !== "object") return null;
	const record = value as Record<string, unknown>;
	const name = toCleanString(record.name);
	const days = toInteger(record.days);
	if (!name || !days) return null;
	return {
		id: toCleanString(record.id) ?? `m${index + 1}`,
		name,
		shortName: toCleanString(record.shortName) ?? name,
		days: clampInteger(days, 1, 99),
	};
}

function normalizeWeekdays(value: unknown): CustomCalendarWeekday[] {
	const raw = Array.isArray(value) ? value : [];
	const weekdays = raw
		.map((weekday, index) => normalizeWeekday(weekday, index))
		.filter((weekday): weekday is CustomCalendarWeekday => weekday != null);
	return weekdays.length > 0
		? weekdays.slice(0, 14)
		: createDefaultCustomCalendarProfile("en").weekdays;
}

function normalizeWeekday(
	value: unknown,
	index: number,
): CustomCalendarWeekday | null {
	if (!value || typeof value !== "object") return null;
	const record = value as Record<string, unknown>;
	const name = toCleanString(record.name);
	if (!name) return null;
	return {
		id: toCleanString(record.id) ?? `w${index + 1}`,
		name,
		shortName: toCleanString(record.shortName) ?? name,
	};
}

function normalizeEpoch(
	value: unknown,
	months: CustomCalendarMonth[],
	weekdays: CustomCalendarWeekday[],
): CustomCalendarProfile["epoch"] {
	const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
	const month = clampInteger(toInteger(record.month) ?? 1, 1, months.length);
	return {
		gregorianDate:
			toCleanString(record.gregorianDate) ??
			new Date().toISOString().slice(0, 10),
		year: toInteger(record.year) ?? 1,
		month,
		day: clampInteger(
			toInteger(record.day) ?? 1,
			1,
			months[month - 1]?.days ?? 1,
		),
		weekday: clampInteger(
			toInteger(record.weekday) ?? 1,
			1,
			weekdays.length,
		),
	};
}

function normalizeLeapRule(
	value: unknown,
	monthCount: number,
): CustomCalendarLeapRule {
	if (!value || typeof value !== "object") return { type: "none" };
	const record = value as Record<string, unknown>;
	if (record.type !== "every-n-years") return { type: "none" };
	const mode =
		record.mode === "after-month" || record.mode === "extend-month"
			? record.mode
			: "extend-month";
	return {
		type: "every-n-years",
		interval: clampInteger(toInteger(record.interval) ?? 4, 2, 100),
		addDays: clampInteger(toInteger(record.addDays) ?? 1, 1, 30),
		month: clampInteger(toInteger(record.month) ?? monthCount, 1, monthCount),
		mode,
	};
}

function normalizeLabelFormat(value: unknown): CustomCalendarProfile["display"]["labelFormat"] {
	return value === "month-day" || value === "year-month-day"
		? value
		: "short-month-day";
}

function getYearInfo(profile: CustomCalendarProfile, year: number): YearInfo {
	const key = `${profile.id}|${profile.revision}|${year}`;
	const cached = yearCache.get(key);
	if (cached) return cached;
	const monthLengths = profile.months.map((month) => month.days);
	if (profile.leapRule.type === "every-n-years" && isLeapYear(profile, year)) {
		const index = profile.leapRule.month - 1;
		monthLengths[index] =
			(monthLengths[index] ?? 0) + profile.leapRule.addDays;
	}
	const yearLength = monthLengths.reduce((sum, days) => sum + days, 0);
	const info = { monthLengths, yearLength };
	yearCache.set(key, info);
	return info;
}

function isLeapYear(profile: CustomCalendarProfile, year: number): boolean {
	if (profile.leapRule.type !== "every-n-years") return false;
	return mod(year - profile.epoch.year, profile.leapRule.interval) === 0;
}

function getMonthLength(
	profile: CustomCalendarProfile,
	year: number,
	month: number,
): number {
	return getYearInfo(profile, year).monthLengths[month - 1] ?? 0;
}

function customDayOfYear(
	profile: CustomCalendarProfile,
	year: number,
	month: number,
	day: number,
): number | null {
	const info = getYearInfo(profile, year);
	if (month < 1 || month > info.monthLengths.length) return null;
	const monthLength = info.monthLengths[month - 1] ?? 0;
	if (day < 1 || day > monthLength) return null;
	let total = day;
	for (let i = 0; i < month - 1; i++) {
		total += info.monthLengths[i] ?? 0;
	}
	return total;
}

function nextCustomYear(year: number, direction: 1 | -1): number {
	const next = year + direction;
	if (next === 0) return direction > 0 ? 1 : -1;
	return next;
}

function parseDateString(dateStr: string): ParsedDate | null {
	const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
		return null;
	}
	const date = new Date(Date.UTC(year, month - 1, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	) {
		return null;
	}
	return { year, month, day };
}

function isValidDateString(dateStr: string): boolean {
	return parseDateString(dateStr) != null;
}

function utcDayIndex(dateStr: string): number | null {
	const parsed = parseDateString(dateStr);
	if (!parsed) return null;
	return Math.floor(
		Date.UTC(parsed.year, parsed.month - 1, parsed.day) / DAY_MS,
	);
}

function dateFromUtcDayIndex(dayIndex: number): string {
	const date = new Date(dayIndex * DAY_MS);
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function toCleanString(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed || null;
}

function toInteger(value: unknown): number | null {
	const numberValue =
		typeof value === "number"
			? value
			: typeof value === "string"
				? Number(value.trim())
				: NaN;
	return Number.isInteger(numberValue) ? numberValue : null;
}

function clampInteger(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function mod(value: number, divisor: number): number {
	return ((value % divisor) + divisor) % divisor;
}
