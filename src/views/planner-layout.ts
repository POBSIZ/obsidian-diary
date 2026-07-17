import { setIcon } from "obsidian";
import { t } from "../i18n";
import { createUiButton } from "../ui/components";

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

export interface PlannerScrollState {
	top: number;
	left: number;
}

export function capturePlannerScroll(
	contentEl: HTMLElement,
	selector: string,
): PlannerScrollState {
	const element = contentEl.querySelector<HTMLElement>(selector);
	return { top: element?.scrollTop ?? 0, left: element?.scrollLeft ?? 0 };
}

export function restorePlannerScroll(
	contentEl: HTMLElement,
	selector: string,
	state: PlannerScrollState,
): HTMLElement | null {
	const element = contentEl.querySelector<HTMLElement>(selector);
	if (!element) return null;
	const restore = () => {
		element.scrollTop = state.top;
		element.scrollLeft = state.left;
	};
	restore();
	window.requestAnimationFrame(() => {
		window.requestAnimationFrame(restore);
	});
	return element;
}

export function setupPlannerContainer(
	contentEl: HTMLElement,
	options: {
		className: string;
		compactClassName: string;
		compact: boolean;
		mobilePadding: number;
		mobilePaddingProperty: string;
		draggingClassName?: string;
		dragging?: boolean;
	},
): void {
	contentEl.addClass(options.className);
	contentEl.toggleClass("planner-container-compact", options.compact);
	contentEl.toggleClass(options.compactClassName, options.compact);
	if (options.draggingClassName) {
		contentEl.toggleClass(options.draggingClassName, options.dragging ?? false);
	}
	contentEl.style.setProperty(
		options.mobilePaddingProperty,
		`${options.mobilePadding}rem`,
	);
	contentEl.style.setProperty(
		"--planner-mobile-bottom-padding",
		`${options.mobilePadding}rem`,
	);
}

export interface PlannerSegment<T extends string> {
	value: T;
	label: string;
}

/** Render a reusable, accessible single-selection control. */
export function renderPlannerSegmentedControl<T extends string>(
	parent: HTMLElement,
	options: {
		className: string;
		buttonClassName: string;
		label: string;
		items: readonly PlannerSegment<T>[];
		selected: T;
		onSelect: (value: T) => void;
	},
): HTMLElement {
	const control = parent.createDiv({
		cls: `planner-segmented-control ${options.className}`,
		attr: { role: "tablist", "aria-label": options.label },
	});
	for (const item of options.items) {
		const selected = item.value === options.selected;
		const button = createUiButton(control, {
			classes: `planner-segmented-control-item ${options.buttonClassName}`,
			text: item.label,
		});
		button.setAttribute("role", "tab");
		button.setAttribute("aria-selected", selected ? "true" : "false");
		button.toggleClass("is-active", selected);
		button.onclick = () => {
			if (!selected) options.onSelect(item.value);
		};
	}
	return control;
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
	const period = createUiButton(navigation, {
		classes: "planner-header-period-display",
		text: options.period.text,
		ariaLabel: options.period.label,
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
	const button = createUiButton(parent, {
		classes: "planner-header-nav-btn",
		ariaLabel: action.label,
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
		const item = createUiButton(popover, {
			classes: [
				"planner-more-menu-item",
				!action.moreOnly && "planner-more-menu-item-compact-only",
			]
				.filter(Boolean)
				.join(" "),
			ariaLabel: action.label,
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
		const item = createUiButton(popover, {
			classes: [
				"planner-view-switcher-item",
				option.mode === currentMode && "is-active",
			]
				.filter(Boolean)
				.join(" "),
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
