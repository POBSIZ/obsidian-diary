import type DiaryObsidian from "./main";
import { t } from "./i18n";
import * as types from "./constants";
import { YearlyPlannerView } from "./views/yearly-planner/view";
import { YearlySidebarPlannerView } from "./views/yearly-planner/sidebar-view";
import { MonthlyPlannerView } from "./views/monthly-planner/view";
import { MonthlySidebarPlannerView } from "./views/monthly-planner/sidebar-view";
import { MonthlyListPlannerView } from "./views/monthly-list-planner/view";
import { MonthlyListSidebarPlannerView } from "./views/monthly-list-planner/sidebar-view";
import { DailyPlannerView } from "./views/daily-planner/view";
import { ThreeDayPlannerView } from "./views/three-day-planner/view";
import { syncPlanNotePanelExpandedState } from "./views/plan-note-panel";

export function registerPlannerViews(plugin: DiaryObsidian): void {
	plugin.registerView(
		types.VIEW_TYPE_YEARLY_PLANNER,
		(leaf) => new YearlyPlannerView(leaf, plugin),
	);
	plugin.registerView(
		types.VIEW_TYPE_DAILY_PLANNER,
		(leaf) => new DailyPlannerView(leaf, plugin),
	);
	plugin.registerView(
		types.VIEW_TYPE_THREE_DAY_PLANNER,
		(leaf) => new ThreeDayPlannerView(leaf, plugin),
	);
	plugin.registerView(
		types.VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
		(leaf) => new YearlySidebarPlannerView(leaf, plugin),
	);
	plugin.registerView(
		types.VIEW_TYPE_MONTHLY_PLANNER,
		(leaf) => new MonthlyPlannerView(leaf, plugin),
	);
	plugin.registerView(
		types.VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
		(leaf) => new MonthlySidebarPlannerView(leaf, plugin),
	);
	plugin.registerView(
		types.VIEW_TYPE_MONTHLY_LIST_PLANNER,
		(leaf) => new MonthlyListPlannerView(leaf, plugin),
	);
	plugin.registerView(
		types.VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
		(leaf) => new MonthlyListSidebarPlannerView(leaf, plugin),
	);

	plugin.addRibbonIcon(
		"calendar-range",
		t("ribbon.openYearlyPlanner"),
		() => {
			void plugin.activateYearlyPlanner();
		},
	);
	plugin.addRibbonIcon(
		"calendar-days",
		t("command.openMonthlyPlanner"),
		() => {
			void plugin.activateMonthlyPlanner();
		},
	);
	plugin.addRibbonIcon(
		"list-ordered",
		t("ribbon.openMonthlyListPlanner"),
		() => {
			void plugin.activateMonthlyListPlanner();
		},
	);

	plugin.addCommand({
		id: "open-yearly-planner",
		name: t("command.openYearlyPlanner"),
		callback: () => void plugin.activateYearlyPlanner(),
	});
	plugin.addCommand({
		id: "open-daily-planner",
		name: t("command.openDailyPlanner"),
		callback: () => void plugin.activateDailyPlanner(),
	});
	plugin.addCommand({
		id: "open-three-day-planner",
		name: t("command.openThreeDayPlanner"),
		callback: () => void plugin.activateThreeDayPlanner(),
	});
	plugin.addCommand({
		id: "open-monthly-planner",
		name: t("command.openMonthlyPlanner"),
		callback: () => void plugin.activateMonthlyPlanner(),
	});
	plugin.addCommand({
		id: "open-monthly-planner-in-sidebar",
		name: t("command.openMonthlyPlannerInSidebar"),
		callback: () => void plugin.activateMonthlyPlannerInSidebar(),
	});
	plugin.addCommand({
		id: "open-monthly-list-planner",
		name: t("command.openMonthlyListPlanner"),
		callback: () => void plugin.activateMonthlyListPlanner(),
	});
}

const groups = {
	yearly: { types: [types.VIEW_TYPE_YEARLY_PLANNER, types.VIEW_TYPE_YEARLY_SIDEBAR_PLANNER], View: YearlyPlannerView },
	monthly: { types: [types.VIEW_TYPE_MONTHLY_PLANNER, types.VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER], View: MonthlyPlannerView },
	monthlyList: { types: [types.VIEW_TYPE_MONTHLY_LIST_PLANNER, types.VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER], View: MonthlyListPlannerView },
	daily: { types: [types.VIEW_TYPE_DAILY_PLANNER, types.VIEW_TYPE_THREE_DAY_PLANNER], View: DailyPlannerView },
};

export function refreshPlannerViewGroup(plugin: DiaryObsidian, mode: keyof typeof groups): void {
	const group = groups[mode];
	for (const type of group.types) {
		for (const leaf of plugin.app.workspace.getLeavesOfType(type)) {
			if (leaf.view instanceof group.View) leaf.view.render();
		}
	}
}

/** Expanding a preview changes its presentation, not the calendar's data or grid. */
export function syncPlannerPlanNotePanels(plugin: DiaryObsidian): void {
	const expanded = plugin.isPlanNotePanelExpanded();
	for (const group of Object.values(groups)) {
		for (const type of group.types) {
			for (const leaf of plugin.app.workspace.getLeavesOfType(type)) {
				if (!(leaf.view instanceof group.View)) continue;
				const wrapper = leaf.view.contentEl.querySelector<HTMLElement>(".plan-note-panel-wrapper");
				if (wrapper) syncPlanNotePanelExpandedState(wrapper, expanded);
			}
		}
	}
}
