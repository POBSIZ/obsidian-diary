const DEVICE_TIME_ZONE = "device";
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const normalizedTimeZones = new Map<string, string>();

export function normalizeExternalCalendarTimeZone(value: unknown): string {
	if (typeof value !== "string" || !value.trim() || value === DEVICE_TIME_ZONE) return DEVICE_TIME_ZONE;
	const name = value.trim();
	const cached = normalizedTimeZones.get(name);
	if (cached) return cached;
	try {
		const normalized = new Intl.DateTimeFormat("en", { timeZone: name }).resolvedOptions().timeZone;
		normalizedTimeZones.set(name, normalized);
		return normalized;
	} catch {
		return DEVICE_TIME_ZONE;
	}
}

export function getDeviceTimeZone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getExternalCalendarTimeZones(current: string): string[] {
	const intl = Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] };
	const zones = intl.supportedValuesOf?.("timeZone") ?? [
		"Asia/Seoul", "Asia/Tokyo", "Asia/Shanghai", "Asia/Taipei", "Asia/Singapore",
		"Asia/Kolkata", "Asia/Dubai", "Europe/London", "Europe/Paris", "Europe/Berlin",
		"America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
		"America/Sao_Paulo", "Africa/Johannesburg", "Australia/Sydney", "Pacific/Auckland",
	];
	return [...new Set(["UTC", getDeviceTimeZone(), current, ...zones])]
		.filter((zone) => normalizeExternalCalendarTimeZone(zone) !== DEVICE_TIME_ZONE)
		.sort();
}

/** Floating times have no instant to convert and retain their written wall-clock time. */
export function getExternalCalendarTimeZone(value: string, preference?: string): string | undefined {
	if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) return undefined;
	const zone = normalizeExternalCalendarTimeZone(preference);
	return zone === DEVICE_TIME_ZONE ? undefined : zone;
}

export function getExternalCalendarDateTime(value: string, preference?: string): {
	date: string; hour: number; minute: number;
} | null {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	const timeZone = getExternalCalendarTimeZone(value, preference);
	if (!timeZone) {
		return {
			date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
			hour: date.getHours(), minute: date.getMinutes(),
		};
	}
	let formatter = dateTimeFormatters.get(timeZone);
	if (!formatter) {
		formatter = new Intl.DateTimeFormat("en-GB", {
			timeZone, year: "numeric", month: "2-digit", day: "2-digit",
			hour: "2-digit", minute: "2-digit", hourCycle: "h23",
		});
		dateTimeFormatters.set(timeZone, formatter);
	}
	const parts = new Map(formatter.formatToParts(date).map((part) => [part.type, part.value]));
	return {
		date: `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`,
		hour: Number(parts.get("hour")), minute: Number(parts.get("minute")),
	};
}
