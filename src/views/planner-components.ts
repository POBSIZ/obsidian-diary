import type { App, TFile } from "obsidian";
import {
	TODO_CHIP_EMOJI_COMPLETED,
	TODO_CHIP_EMOJI_INCOMPLETE,
} from "../constants";
import { t } from "../i18n";
import { createUiButton } from "../ui/components";
import type { ExternalCalendarEvent } from "../utils/external-calendars";
import { isRecurrenceVirtualEvent } from "../utils/recurrence";
import {
	getChipColor,
	getFileTitle,
	isRecurrenceOccurrenceFile,
	isRecurrenceSourceFile,
	isTodoCompleted,
	isTodoFile,
} from "./yearly-planner/file-utils";

export const PLANNER_UI_CLASSES = {
	interactive: "planner-interactive",
	entry: "planner-entry",
	entryList: "planner-entry-list",
	range: "planner-range",
	rangeList: "planner-range-list",
	holiday: "planner-holiday-badge",
	alternateCalendar: "planner-alt-calendar-label",
} as const;

export interface PlannerEntryClasses {
	root: string;
	completed: string;
	selected?: string;
}

export interface PlannerChipOptions {
	text?: string;
	classes: string;
	color?: string | null;
	ariaLabel?: string;
	title?: string;
	tag?: "div" | "button";
	variant?: "default" | "timeline" | "all-day";
	renderContent?: (chip: HTMLElement) => void;
	onClick?: () => void;
}

export function makePlannerInteractive(element: HTMLElement): void {
	element.tabIndex = 0;
	element.setAttribute("role", "button");
	element.addClass(PLANNER_UI_CLASSES.interactive);
}

export function createPlannerButton(
	parent: HTMLElement,
	options: { classes: string; text?: string; ariaLabel?: string },
): HTMLButtonElement {
	const button = createUiButton(parent, {
		classes: options.classes,
		text: options.text,
		ariaLabel: options.ariaLabel,
	});
	makePlannerInteractive(button);
	return button;
}

/** Base chip component used by file, external-event, holiday, and summary chips. */
export function createPlannerChip(
	parent: HTMLElement,
	options: PlannerChipOptions,
): HTMLElement {
	const variant = options.variant ?? "default";
	const classes = [
		PLANNER_UI_CLASSES.entry,
		"planner-chip",
		`planner-chip-${variant}`,
		options.classes,
	]
		.filter(Boolean)
		.join(" ");
	const chip =
		options.tag === "button"
			? createUiButton(parent, {
					classes,
					text: options.renderContent ? undefined : options.text,
					ariaLabel: options.ariaLabel,
					title: options.title,
					onClick: options.onClick,
				})
			: parent.createDiv({
					cls: classes,
					text: options.renderContent ? undefined : options.text,
				});
	makePlannerInteractive(chip);
	options.renderContent?.(chip);
	if (options.ariaLabel) chip.ariaLabel = options.ariaLabel;
	if (options.title) chip.title = options.title;
	if (options.color) chip.style.borderLeftColor = options.color;
	if (options.tag !== "button" && options.onClick) chip.onclick = options.onClick;
	return chip;
}

export function applyPlannerFileState(
	element: HTMLElement,
	app: App,
	file: TFile,
): void {
	if (isRecurrenceSourceFile(app, file)) {
		element.addClass("planner-recurrence-source");
	} else if (isRecurrenceOccurrenceFile(app, file)) {
		element.addClass("planner-recurrence-occurrence");
	}
}

export function applyExternalEventState(
	element: HTMLElement,
	event: ExternalCalendarEvent,
): void {
	if (isRecurrenceVirtualEvent(event)) {
		element.addClass("planner-recurrence-virtual");
	}
}

export function getPlannerFileDisplay(
	app: App,
	file: TFile,
): { title: string; text: string; completed: boolean } {
	const title = getFileTitle(app, file);
	const completed = isTodoCompleted(app, file);
	return {
		title,
		completed,
		text: completed
			? `${TODO_CHIP_EMOJI_COMPLETED} ${title}`
			: isTodoFile(app, file)
				? `${TODO_CHIP_EMOJI_INCOMPLETE} ${title}`
				: title,
	};
}

export function createPlannerFileChip(
	parent: HTMLElement,
	options: {
		app: App;
		file: TFile;
		classes: PlannerEntryClasses;
		selected?: boolean;
		tag?: "div" | "button";
		onClick?: () => void;
		onCreated?: (element: HTMLElement, color: string | null) => void;
	},
): HTMLElement {
	const { app, file, classes } = options;
	const display = getPlannerFileDisplay(app, file);
	const color = getChipColor(app, file);
	const chip = createPlannerChip(parent, {
		classes: classes.root,
		text: display.text,
		title: file.path,
		ariaLabel: t("a11y.openPlannerNote", {
			title: display.title,
			path: file.path,
		}),
		color,
		tag: options.tag,
		onClick: options.onClick,
	});
	chip.dataset.path = file.path;
	if (display.completed) {
		chip.addClass("planner-chip-completed");
		chip.addClass(classes.completed);
	}
	applyPlannerFileState(chip, app, file);
	if (options.selected && classes.selected) chip.addClass(classes.selected);
	options.onCreated?.(chip, color);
	return chip;
}

export function createExternalEventChip(
	parent: HTMLElement,
	options: {
		event: ExternalCalendarEvent;
		classes: string;
		showTitle?: boolean;
		tag?: "div" | "button";
		onClick?: () => void;
	},
): HTMLElement {
	const { event } = options;
	const chip = createPlannerChip(parent, {
		classes: `${options.classes} planner-external-event-chip`,
		text: event.title,
		title: options.showTitle ? event.title : undefined,
		ariaLabel: t("a11y.openExternalEvent", { title: event.title }),
		color: event.color,
		tag: options.tag,
		onClick: options.onClick,
	});
	applyExternalEventState(chip, event);
	chip.dataset.externalEventId = event.id;
	return chip;
}

export function createHolidayBadge(
	parent: HTMLElement,
	options: {
		dateKey: string;
		names: string[];
		containerClass: string;
		badgeClass: string;
		labelClass: string;
	},
): HTMLElement {
	const container = parent.createDiv({ cls: options.containerClass });
	const badge = container.createDiv({
		cls: `${PLANNER_UI_CLASSES.holiday} ${options.badgeClass}`,
	});
	makePlannerInteractive(badge);
	badge.createSpan({
		cls: options.labelClass,
		text: options.names.join(", "),
	});
	badge.ariaLabel = t("a11y.openHoliday", {
		date: options.dateKey,
		names: options.names.join(", "),
	});
	badge.dataset.holidayDate = options.dateKey;
	badge.dataset.holidayNames = JSON.stringify(options.names);
	return badge;
}

export function createAlternateCalendarLabel(
	parent: HTMLElement,
	options: { text: string; containerClass: string; labelClass: string },
): HTMLElement {
	const container = parent.createSpan({ cls: options.containerClass });
	container.setAttribute("aria-hidden", "true");
	container.createSpan({
		cls: `${PLANNER_UI_CLASSES.alternateCalendar} ${options.labelClass}`,
		text: options.text,
	});
	return container;
}
