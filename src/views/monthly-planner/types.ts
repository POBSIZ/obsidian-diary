import type { DragState, SelectionBounds } from "../yearly-planner/types";

export type { DragState, SelectionBounds };

export interface MonthlyPlannerSelectedDate {
	year: number;
	month: number;
	day: number;
}

export interface MonthlyPlannerState extends Record<string, unknown> {
	year: number;
	month: number;
	selectedDate?: MonthlyPlannerSelectedDate | null;
	daySummaryOpen?: boolean;
}
