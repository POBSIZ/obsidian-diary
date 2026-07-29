import { t } from "../../i18n";
import { createUiButton } from "../../ui/components";

export interface DailyPlannerAllDaySectionOptions {
	count: number;
	collapsed: boolean;
	contentId: string;
	onToggle: (collapsed: boolean) => void;
}

/** Render the accessible all-day toggle and return its content mount. */
export function renderDailyPlannerAllDaySection(
	parent: HTMLElement,
	options: DailyPlannerAllDaySectionOptions,
): HTMLElement {
	const row = parent.createDiv({ cls: "daily-planner-all-day-row" });
	row.toggleClass("is-collapsed", options.collapsed);
	row.dataset.allDayCount = String(options.count);
	const label = row.createDiv({
		cls: "daily-planner-all-day-label",
	});
	const toggleLabel = t(
		options.collapsed ? "daily.expandAllDay" : "daily.collapseAllDay",
		{ count: options.count },
	);
	const toggle = createUiButton(label, {
		classes: "daily-planner-all-day-toggle",
		icon: options.collapsed ? "chevron-right" : "chevron-down",
		text: t("daily.allDayLane"),
		ariaLabel: toggleLabel,
		title: toggleLabel,
		onClick: () => options.onToggle(!options.collapsed),
	});
	toggle.setAttribute("aria-expanded", String(!options.collapsed));
	toggle.setAttribute("aria-controls", options.contentId);
	toggle.createSpan({
		cls: "daily-planner-all-day-count",
		text: String(options.count),
		attr: { "aria-hidden": "true" },
	});
	const content = row.createDiv({
		cls: "daily-planner-all-day-content",
		attr: { id: options.contentId },
	});
	content.hidden = options.collapsed;
	return content;
}
