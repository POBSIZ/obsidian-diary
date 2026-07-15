import type {
	DailyPlannerEntry,
	PositionedDailyPlannerEntry,
} from "./types";

/** Assign overlapping timed entries to side-by-side columns. */
export function layoutDailyPlannerEntries(
	entries: DailyPlannerEntry[],
): PositionedDailyPlannerEntry[] {
	const timed = entries
		.filter(
			(entry): entry is DailyPlannerEntry & {
				startMinutes: number;
				endMinutes: number;
			} => entry.startMinutes != null && entry.endMinutes != null,
		)
		.sort((a, b) =>
			a.startMinutes !== b.startMinutes
				? a.startMinutes - b.startMinutes
				: b.endMinutes - a.endMinutes,
		);

	const result: PositionedDailyPlannerEntry[] = [];
	let group: PositionedDailyPlannerEntry[] = [];
	let groupEnd = -1;
	let columnEnds: number[] = [];

	const finishGroup = () => {
		const count = Math.max(1, columnEnds.length);
		for (const item of group) item.columnCount = count;
		group = [];
		columnEnds = [];
		groupEnd = -1;
	};

	for (const entry of timed) {
		if (group.length > 0 && entry.startMinutes >= groupEnd) finishGroup();
		let column = columnEnds.findIndex((end) => end <= entry.startMinutes);
		if (column < 0) column = columnEnds.length;
		columnEnds[column] = entry.endMinutes;
		groupEnd = Math.max(groupEnd, entry.endMinutes);
		const positioned: PositionedDailyPlannerEntry = {
			...entry,
			column,
			columnCount: 1,
		};
		group.push(positioned);
		result.push(positioned);
	}
	finishGroup();
	return result;
}
