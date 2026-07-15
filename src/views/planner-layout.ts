import { setIcon } from "obsidian";
import { t } from "../i18n";

/** Keep planner header actions consistent when switching between planner views. */
export const PLANNER_COMPACT_LAYOUT_MAX_WIDTH = 768;

export type PlannerViewMode =
	| "yearly"
	| "monthly"
	| "monthlyList"
	| "daily"
	| "threeDay";

const VIEW_OPTIONS: readonly {
	mode: PlannerViewMode;
	icon: string;
	labelKey: string;
	descriptionKey: string;
}[] = [
	{
		mode: "yearly",
		icon: "calendar-range",
		labelKey: "viewSwitcher.yearly",
		descriptionKey: "viewSwitcher.yearlyDesc",
	},
	{
		mode: "monthly",
		icon: "calendar-days",
		labelKey: "viewSwitcher.monthlyGrid",
		descriptionKey: "viewSwitcher.monthlyGridDesc",
	},
	{
		mode: "monthlyList",
		icon: "list-ordered",
		labelKey: "viewSwitcher.monthlyList",
		descriptionKey: "viewSwitcher.monthlyListDesc",
	},
	{
		mode: "daily",
		icon: "clock-3",
		labelKey: "viewSwitcher.daily",
		descriptionKey: "viewSwitcher.dailyDesc",
	},
	{
		mode: "threeDay",
		icon: "columns-3",
		labelKey: "viewSwitcher.threeDay",
		descriptionKey: "viewSwitcher.threeDayDesc",
	},
];

export interface PlannerHeaderAction {
	icon: string;
	label: string;
	onClick: () => void;
	title?: string;
	moreOnly?: boolean;
}

export interface PlannerHeaderOptions {
	mode: PlannerViewMode;
	onSelectView: (mode: PlannerViewMode) => void;
	previous: PlannerHeaderAction;
	next: PlannerHeaderAction;
	period: {
		text: string;
		label: string;
		title?: string;
		onClick: () => void;
	};
	actions?: PlannerHeaderAction[];
}

/** Render the same planner header structure in every planner view. */
export function renderPlannerHeader(
	parent: HTMLElement,
	options: PlannerHeaderOptions,
): HTMLElement {
	const header = parent.createDiv({ cls: "planner-header" });
	renderPlannerViewSwitcher(header, options.mode, options.onSelectView);

	const navigation = header.createDiv({ cls: "planner-header-nav" });
	createPlannerHeaderIconButton(navigation, options.previous);
	const period = navigation.createEl("button", {
		cls: "planner-header-period-display",
		text: options.period.text,
		attr: {
			type: "button",
			"aria-label": options.period.label,
		},
	});
	if (options.period.title) period.title = options.period.title;
	period.onclick = options.period.onClick;
	createPlannerHeaderIconButton(navigation, options.next);
	renderPlannerHeaderActions(navigation, options.actions ?? []);
	return header;
}

export function createPlannerHeaderIconButton(
	parent: HTMLElement,
	action: PlannerHeaderAction,
): HTMLButtonElement {
	const button = parent.createEl("button", {
		cls: "planner-header-nav-btn",
		attr: { type: "button", "aria-label": action.label },
	});
	setIcon(button, action.icon);
	if (action.title) button.title = action.title;
	button.onclick = action.onClick;
	return button;
}

export function renderPlannerHeaderActions(
	parent: HTMLElement,
	actions: PlannerHeaderAction[],
): void {
	if (actions.length === 0) return;
	const inline = parent.createDiv({ cls: "planner-nav-secondary" });
	for (const action of actions.filter((item) => !item.moreOnly)) {
		createPlannerHeaderIconButton(inline, action);
	}

	const moreMenu = parent.createEl("details", {
		cls: [
			"planner-more-menu",
			actions.some((item) => item.moreOnly) && "has-more-only",
		]
			.filter(Boolean)
			.join(" "),
	});
	const trigger = moreMenu.createEl("summary", {
		cls: "planner-header-nav-btn planner-more-menu-trigger",
		attr: {
			"aria-label": t("header.moreActions"),
			role: "button",
		},
	});
	setIcon(trigger, "ellipsis");

	const popover = moreMenu.createDiv({ cls: "planner-more-menu-popover" });
	for (const action of actions) {
		const item = popover.createEl("button", {
			cls: [
				"planner-more-menu-item",
				!action.moreOnly && "planner-more-menu-item-compact-only",
			]
				.filter(Boolean)
				.join(" "),
			attr: { type: "button", "aria-label": action.label },
		});
		const icon = item.createSpan({ cls: "planner-more-menu-item-icon" });
		setIcon(icon, action.icon);
		item.createSpan({ cls: "planner-more-menu-item-label", text: action.label });
		if (action.title) item.title = action.title;
		item.onclick = () => {
			moreMenu.removeAttribute("open");
			action.onClick();
		};
	}
}

export function renderPlannerViewSwitcher(
	parent: HTMLElement,
	currentMode: PlannerViewMode,
	onSelect: (mode: PlannerViewMode) => void,
): HTMLDetailsElement {
	const current =
		VIEW_OPTIONS.find((option) => option.mode === currentMode) ??
		VIEW_OPTIONS[0]!;
	const details = parent.createEl("details", {
		cls: "planner-view-switcher",
	});
	const trigger = details.createEl("summary", {
		cls: "planner-view-switcher-trigger",
		attr: {
			role: "button",
			"aria-label": t("viewSwitcher.open", {
				view: t(current.labelKey),
			}),
		},
	});
	const currentIcon = trigger.createSpan({
		cls: "planner-view-switcher-trigger-icon",
	});
	setIcon(currentIcon, current.icon);
	trigger.createSpan({
		cls: "planner-view-switcher-trigger-label",
		text: t(current.labelKey),
	});
	const chevron = trigger.createSpan({
		cls: "planner-view-switcher-trigger-chevron",
	});
	setIcon(chevron, "chevron-down");

	const popover = details.createDiv({
		cls: "planner-view-switcher-popover",
	});
	popover.createDiv({
		cls: "planner-view-switcher-heading",
		text: t("viewSwitcher.title"),
	});
	for (const option of VIEW_OPTIONS) {
		const item = popover.createEl("button", {
			cls: [
				"planner-view-switcher-item",
				option.mode === currentMode && "is-active",
			]
				.filter(Boolean)
				.join(" "),
			attr: { type: "button" },
		});
		const icon = item.createSpan({ cls: "planner-view-switcher-item-icon" });
		setIcon(icon, option.icon);
		const copy = item.createSpan({ cls: "planner-view-switcher-item-copy" });
		copy.createSpan({
			cls: "planner-view-switcher-item-label",
			text: t(option.labelKey),
		});
		copy.createSpan({
			cls: "planner-view-switcher-item-description",
			text: t(option.descriptionKey),
		});
		if (option.mode === currentMode) {
			const check = item.createSpan({
				cls: "planner-view-switcher-item-check",
			});
			setIcon(check, "check");
		}
		item.onclick = () => {
			details.removeAttribute("open");
			if (option.mode !== currentMode) onSelect(option.mode);
		};
	}
	return details;
}
