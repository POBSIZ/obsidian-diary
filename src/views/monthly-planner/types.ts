import type { DragState, SelectionBounds } from "../yearly-planner/types";

export type { DragState, SelectionBounds };

export interface MonthlyPlannerState extends Record<string, unknown> {
	year: number;
	month: number;
}
