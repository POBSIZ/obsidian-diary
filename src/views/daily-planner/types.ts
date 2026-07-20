import type { TFile } from "obsidian";
import type { ExternalCalendarEvent } from "../../utils/external-calendars";

export interface DailyPlannerState extends Record<string, unknown> {
	year: number;
	month: number;
	day: number;
}

export interface DailyPlannerEntry {
	id: string;
	title: string;
	color: string | null;
	startMinutes: number | null;
	endMinutes: number | null;
	file?: TFile;
	externalEvent?: ExternalCalendarEvent;
	kind: "note" | "range" | "external" | "holiday";
	/** Inclusive calendar bounds when this entry should render as a range bar. */
	rangeStart?: string;
	rangeEnd?: string;
	/** Original datetime boundary times, before this entry is sliced per day. */
	rangeStartMinutes?: number;
	rangeEndMinutes?: number;
}

export interface PositionedDailyPlannerEntry extends DailyPlannerEntry {
	column: number;
	columnCount: number;
}
