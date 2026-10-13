import { parsePlannerBasename } from "./date-formats";

export interface ParsedRange {
	start: string;
	end: string;
	suffix?: string;
	format: string;
	formatId: string;
}

export function parseRangeBasename(basename: string): ParsedRange | null {
	const parsed = parsePlannerBasename(basename);
	if (!parsed || parsed.kind !== "range" || !parsed.end) return null;
	return { start: parsed.start, end: parsed.end, suffix: parsed.suffix, format: parsed.format, formatId: parsed.formatId };
}

export function isDateInRange(
	dateStr: string,
	start: string,
	end: string,
): boolean {
	return dateStr >= start && dateStr <= end;
}
