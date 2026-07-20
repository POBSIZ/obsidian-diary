import type { DailyPlannerEntry } from "./types";

export interface DailyPlannerRangeBar {
	entry: DailyPlannerEntry;
	startColumn: number;
	endColumn: number;
	lane: number;
	continuesBefore: boolean;
	continuesAfter: boolean;
}

/** Return the visible slice of one continuous multi-day datetime interval. */
export function getDailyRangeTimeSlice(
	dateString: string,
	rangeStart: string,
	rangeEnd: string,
	startMinutes: number | null,
	endMinutes: number | null,
): { start: number; end: number } | null {
	if (startMinutes == null || endMinutes == null) return null;
	if (rangeStart === rangeEnd) {
		return endMinutes > startMinutes
			? { start: startMinutes, end: endMinutes }
			: null;
	}

	const sliceStart = dateString === rangeStart ? startMinutes : 0;
	const sliceEnd = dateString === rangeEnd ? endMinutes : 24 * 60;
	return sliceEnd > sliceStart ? { start: sliceStart, end: sliceEnd } : null;
}

/**
 * Deduplicate per-day entries and place intersecting date ranges into stable,
 * non-overlapping lanes across the visible daily planner columns.
 */
export function layoutDailyPlannerRanges(
	dates: string[],
	entries: DailyPlannerEntry[],
): DailyPlannerRangeBar[] {
	const firstVisible = dates[0];
	const lastVisible = dates[dates.length - 1];
	if (!firstVisible || !lastVisible) return [];

	const unique = new Map<string, DailyPlannerEntry>();
	for (const entry of entries) {
		if (!entry.rangeStart || !entry.rangeEnd) continue;
		if (entry.rangeEnd < firstVisible || entry.rangeStart > lastVisible) continue;
		unique.set(entry.id, entry);
	}

	const sorted = Array.from(unique.values()).sort((a, b) => {
		const startCompare = (a.rangeStart ?? "").localeCompare(b.rangeStart ?? "");
		if (startCompare !== 0) return startCompare;
		const endCompare = (b.rangeEnd ?? "").localeCompare(a.rangeEnd ?? "");
		return endCompare !== 0 ? endCompare : a.title.localeCompare(b.title);
	});
	const laneEnds: number[] = [];

	return sorted.map((entry) => {
		const rangeStart = entry.rangeStart ?? firstVisible;
		const rangeEnd = entry.rangeEnd ?? lastVisible;
		const startColumn = Math.max(0, dates.findIndex((date) => date >= rangeStart));
		let endColumn = dates.length - 1;
		while (endColumn >= 0 && dates[endColumn]! > rangeEnd) endColumn -= 1;
		if (endColumn < 0) endColumn = dates.length - 1;
		let lane = laneEnds.findIndex((occupiedThrough) => occupiedThrough < startColumn);
		if (lane < 0) lane = laneEnds.length;
		laneEnds[lane] = endColumn;

		return {
			entry,
			startColumn,
			endColumn,
			lane,
			continuesBefore: rangeStart < firstVisible,
			continuesAfter: rangeEnd > lastVisible,
		};
	});
}
