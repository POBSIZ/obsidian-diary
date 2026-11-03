import {
	VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
	VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
	VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
	VIEW_TYPE_DAILY_PLANNER,
	VIEW_TYPE_THREE_DAY_PLANNER,
} from "../constants";
import type { PlannerViewMode } from "../views/planner-layout";

export function normalizeSidebarDefaultView(value: unknown): PlannerViewMode {
	switch (value) {
		case "yearly":
		case "monthly":
		case "monthlyList":
		case "daily":
		case "threeDay":
			return value;
		default:
			return "monthly";
	}
}

/** Reuse a restored view's date; clamp the day when its state only supplies a month. */
export function getSidebarPlannerViewState(mode: PlannerViewMode, previous?: unknown, now = new Date()) {
	const source = typeof previous === "object" && previous !== null ? previous as Record<string, unknown> : {};
	const year = typeof source.year === "number" && Number.isInteger(source.year) && source.year >= 1 && source.year <= 9999 ? source.year : now.getFullYear();
	const month = typeof source.month === "number" && Number.isInteger(source.month) && source.month >= 1 && source.month <= 12 ? source.month : now.getMonth() + 1;
	const candidateDay = typeof source.day === "number" && Number.isInteger(source.day) && source.day >= 1 ? source.day : now.getDate();
	const day = Math.min(candidateDay, new Date(year, month, 0).getDate());
	const type = {
		yearly: VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
		monthly: VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
		monthlyList: VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
		daily: VIEW_TYPE_DAILY_PLANNER,
		threeDay: VIEW_TYPE_THREE_DAY_PLANNER,
	}[mode];
	const state = mode === "yearly" ? { year } : mode === "monthly" || mode === "monthlyList" ? { year, month } : { year, month, day };
	return { type, state };
}
