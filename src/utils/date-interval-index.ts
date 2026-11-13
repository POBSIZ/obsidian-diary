interface Entry<T> {
	value: T;
	start: string;
	end: string;
	maxEnd: string;
}

/** A balanced index over inclusive ISO date intervals, without expanding long ranges into days. */
export class DateIntervalIndex<T> {
	private readonly entries: Entry<T>[];

	constructor(values: readonly T[], getRange: (value: T) => { start: string; end: string }) {
		this.entries = values.map((value) => ({ value, ...getRange(value), maxEnd: "" }));
		this.entries.sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
		this.build(0, this.entries.length);
	}

	private build(low: number, high: number): string {
		if (low >= high) return "";
		const middle = Math.floor((low + high) / 2);
		const entry = this.entries[middle]!;
		entry.maxEnd = [entry.end, this.build(low, middle), this.build(middle + 1, high)]
			.reduce((max, end) => end > max ? end : max, "");
		return entry.maxEnd;
	}

	/** Results retain start-date order, including stable ties from the input snapshot. */
	query(start: string, end = start): T[] {
		const results: T[] = [];
		const visit = (low: number, high: number): void => {
			if (low >= high) return;
			const middle = Math.floor((low + high) / 2);
			const entry = this.entries[middle]!;
			if (entry.maxEnd < start) return;
			visit(low, middle);
			if (entry.start > end) return;
			if (entry.end >= start) results.push(entry.value);
			visit(middle + 1, high);
		};
		if (start <= end) visit(0, this.entries.length);
		return results;
	}
}
