import { App, TFile } from "obsidian";
import {
	getMonthLabels as getLocalizedMonthLabels,
	getWeekendLabels,
	t,
} from "../../i18n";
import { getDaysInMonth, getDayOfWeek } from "../../utils/date";
import type { ChipDragState, DragState } from "./types";
import type { HolidayData } from "../../utils/holidays";
import {
	formatCalendarOverlayAria,
	getCalendarOverlayLabel,
	type CalendarOverlayConfig,
} from "../../utils/calendar-overlays";
import {
	getExternalEventsForDate,
	type ExternalCalendarEvent,
} from "../../utils/external-calendars";
import { PlannerPeriodModal } from "../planner-period-modal";
import {
	getFilesForDate,
	getFileTitle,
	getChipColor,
	type PlannerFileScope,
} from "./file-utils";
import { parseRangeBasename } from "../../utils/range";
import { isDateInSelection } from "./selection";
import {
	makeDateSelectionKey,
	makeFileSelectionKey,
} from "../planner-clipboard";
import {
	renderPlannerHeader,
	type PlannerHeaderAction,
	type PlannerViewMode,
} from "../planner-layout";
import {
	applyPlannerFileState,
	applyExternalEventState,
	createAlternateCalendarLabel,
	createExternalEventChip,
	createHolidayBadge,
	createPlannerFileChip,
	makePlannerInteractive,
	PLANNER_UI_CLASSES,
} from "../planner-components";
import { createUiButton } from "../../ui/components";

export interface HeaderCallbacks {
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
	onYearClick: (year: number) => void;
	onAddFile?: () => void;
	onSelectPlannerView: (mode: PlannerViewMode) => void;
	/** Secondary compatibility action; direct selection is the primary path. */
	onCyclePlannerView?: () => void;
	hasExpandedMonthCells?: boolean;
	onToggleAllCellWidths?: () => void;
}

export function renderYearlyPlannerHeader(
	contentEl: HTMLElement,
	ctx: {
		year: number;
		app: App;
	},
	callbacks: HeaderCallbacks,
): void {
	const openYearModal = () => {
		new PlannerPeriodModal(ctx.app, {
			granularity: "year",
			year: ctx.year,
			onSubmit: ({ year }) => callbacks.onYearClick(year),
		}).open();
	};
	const secondaryActions: PlannerHeaderAction[] = [
		{
			icon: "calendar",
			label: t("header.goToCurrentYear"),
			onClick: callbacks.onToday,
		},
	];

	if (callbacks.onAddFile) {
		secondaryActions.push({
			icon: "file-plus",
			label: t("header.addFile"),
			onClick: callbacks.onAddFile,
		});
	}

	if (callbacks.onToggleAllCellWidths) {
		const expanded = callbacks.hasExpandedMonthCells ?? false;
		secondaryActions.push({
			icon: expanded ? "minimize-2" : "maximize-2",
			label: expanded
				? t("header.collapseYearlyCells")
				: t("header.expandYearlyCells"),
			title: expanded
				? t("header.collapseYearlyCellsHint")
				: t("header.expandYearlyCellsHint"),
			onClick: callbacks.onToggleAllCellWidths,
		});
	}

	if (callbacks.onCyclePlannerView) {
		secondaryActions.push({
			icon: "repeat",
			label: t("header.cyclePlannerView"),
			title: t("header.cyclePlannerViewHint"),
			onClick: callbacks.onCyclePlannerView,
			moreOnly: true,
		});
	}

	renderPlannerHeader(contentEl, {
		mode: "yearly",
		onSelectView: callbacks.onSelectPlannerView,
		previous: {
			icon: "chevron-left",
			label: t("header.prevYear"),
			onClick: callbacks.onPrev,
		},
		next: {
			icon: "chevron-right",
			label: t("header.nextYear"),
			onClick: callbacks.onNext,
		},
		period: {
			text: String(ctx.year),
			label: t("header.clickToEnterYear"),
			title: t("header.clickToEnterYear"),
			onClick: openYearModal,
		},
		actions: secondaryActions,
	});
}

export interface MonthHeaderOptions {
	widthRem?: number;
	isExpanded?: boolean;
	onOpenMonth?: (month: number) => void;
	onToggleWidth?: (month: number) => void;
}

export function createMonthHeaderCell(
	row: HTMLTableRowElement,
	month: number,
	label: string,
	options: MonthHeaderOptions,
): HTMLTableCellElement {
	const th = row.createEl("th", {
		cls: [
			"yearly-planner-month-header",
			options.isExpanded && "yearly-planner-month-header-expanded",
		]
			.filter(Boolean)
			.join(" "),
	});
	th.dataset.month = String(month);
	if (typeof options.widthRem === "number") {
		th.style.minWidth = `${options.widthRem}rem`;
		th.style.width = `${options.widthRem}rem`;
	}

	const content = th.createDiv({
		cls: "yearly-planner-month-header-content",
	});
	const monthLabel = content.createEl(
		options.onOpenMonth ? "button" : "span",
		{
			cls: "yearly-planner-month-header-label",
			text: label,
			...(options.onOpenMonth
				? { attr: { type: "button", title: t("viewSwitcher.monthlyGrid") } }
				: {}),
		},
	);
	if (options.onOpenMonth) {
		monthLabel.addEventListener("click", (event) => {
			event.stopPropagation();
			options.onOpenMonth?.(month);
		});
	}

	if (!options.onToggleWidth) return th;

	const controls = content.createDiv({
		cls: "yearly-planner-month-width-controls",
	});
	const expanded = options.isExpanded ?? false;
	createMonthWidthButton(controls, {
		icon: expanded ? "minimize-2" : "maximize-2",
		label: expanded
			? t("header.collapseMonthCellWidth", { month: label })
			: t("header.expandMonthCellWidth", { month: label }),
		onClick: () => options.onToggleWidth?.(month),
	});

	return th;
}

function createMonthWidthButton(
	parent: HTMLElement,
	action: PlannerHeaderAction,
): HTMLButtonElement {
	const btn = createUiButton(parent, {
		classes: "yearly-planner-month-width-btn",
		ariaLabel: action.label,
		title: action.label,
		icon: action.icon,
	});
	btn.onclick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		action.onClick();
	};
	return btn;
}
export interface CreateCellContext {
	year: number;
	app: App;
	folder: string;
	plannerFileScope: PlannerFileScope;
	plannerFiles: TFile[];
	dragState: DragState | null;
	chipDragState: ChipDragState | null;
	clipboardSelection: Set<string>;
	holidaysData: HolidayData | null;
	calendarOverlay: CalendarOverlayConfig;
	externalEvents: ExternalCalendarEvent[];
	rangeLaneMap: Map<string, number>;
}

export function createPlannerCell(
	row: HTMLTableRowElement,
	day: number,
	month: number,
	ctx: CreateCellContext,
): HTMLTableCellElement {
	const daysInMonth = getDaysInMonth(ctx.year, month);
	const isValid = day <= daysInMonth;
	const isSelected = isDateInSelection(ctx.year, month, day, ctx.dragState);
	const isDropTarget =
		ctx.chipDragState &&
		ctx.chipDragState.currentYear === ctx.year &&
		ctx.chipDragState.currentMonth === month &&
		ctx.chipDragState.currentDay === day;
	const dateKey = `${ctx.year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	const isClipboardDate = ctx.clipboardSelection.has(
		makeDateSelectionKey(dateKey),
	);
	const isHoliday = ctx.holidaysData?.dates.has(dateKey) ?? false;
	const dayOfWeek = getDayOfWeek(ctx.year, month, day);
	const isSaturday = dayOfWeek === 6;
	const isSunday = dayOfWeek === 0;
	const now = new Date();
	const isToday =
		isValid &&
		ctx.year === now.getFullYear() &&
		month === now.getMonth() + 1 &&
		day === now.getDate();

	const cell = row.createEl("td", {
		cls: [
			"yearly-planner-cell",
			isValid ? "" : "yearly-planner-cell-invalid",
			isSelected && "yearly-planner-cell-selected",
			isClipboardDate && "yearly-planner-cell-clipboard-selected",
			isDropTarget && "yearly-planner-cell-drop-target",
			isHoliday && "yearly-planner-cell-holiday",
			isSaturday && "yearly-planner-cell-saturday",
			isSunday && "yearly-planner-cell-sunday",
			isToday && "yearly-planner-cell-today",
		]
			.filter(Boolean)
			.join(" "),
	});

	if (!isValid) return cell;

	cell.dataset.year = String(ctx.year);
	cell.dataset.month = String(month);
	cell.dataset.day = String(day);
	cell.tabIndex = 0;
	cell.setAttribute("role", "button");
	const alternateCalendarLabel = getCalendarOverlayLabel(
		ctx.year,
		month,
		day,
		ctx.calendarOverlay,
	);

	const { singleFiles, rangeFiles } = getFilesForDate(
		ctx.app,
		ctx.folder,
		ctx.year,
		month,
		day,
		ctx.plannerFileScope,
		ctx.plannerFiles,
	);
	const externalDateEvents = getExternalEventsForDate(
		ctx.externalEvents,
		dateKey,
	);
	const holidayNames =
		isHoliday && ctx.holidaysData?.names.has(dateKey)
			? (ctx.holidaysData.names.get(dateKey) ?? [])
			: [];

	if (externalDateEvents.summaryEvents.length > 0) {
		cell.dataset.hasExternal = "true";
	}

	if (rangeFiles.length > 0 || externalDateEvents.rangeEvents.length > 0) {
		const basenames = rangeFiles.map((r) => r.file.basename);
		if (basenames.length > 0) {
			cell.dataset.rangeBasenames = basenames.join(",");
			cell.dataset.rangeLanes = rangeFiles
				.map((r) => ctx.rangeLaneMap.get(r.file.basename) ?? 0)
				.join(",");
		}

		const barsContainer = cell.createDiv({
			cls: `${PLANNER_UI_CLASSES.rangeList} yearly-planner-cell-range-bars`,
		});
		for (const { file } of rangeFiles) {
			const lane = ctx.rangeLaneMap.get(file.basename) ?? 0;
			const bar = barsContainer.createDiv({
				cls: `${PLANNER_UI_CLASSES.range} yearly-planner-cell-range-bar`,
			});
			makePlannerInteractive(bar);
			bar.dataset.lane = String(lane);
			bar.dataset.path = file.path;
			bar.ariaLabel = t("a11y.openPlannerNote", {
				title: getFileTitle(ctx.app, file),
				path: file.path,
			});
			(bar as HTMLElement).style.right = `${lane * 4}px`;
			bar.dataset.basename = file.basename;
			const chipColor = getChipColor(ctx.app, file);
			if (chipColor) {
				bar.style.borderRightColor = chipColor;
			}
			applyPlannerFileState(bar, ctx.app, file);
			if (ctx.clipboardSelection.has(makeFileSelectionKey(file.path))) {
				bar.addClass("yearly-planner-cell-clipboard-selected");
			}
		}
		const laneIndices = rangeFiles.map(
			({ file }) => ctx.rangeLaneMap.get(file.basename) ?? 0,
		);
		const maxLane = laneIndices.length > 0 ? Math.max(...laneIndices) : -1;
		const externalStartLane = maxLane + 1;
		externalDateEvents.rangeEvents.forEach(({ event }, index) => {
			const lane = externalStartLane + index;
			const bar = barsContainer.createDiv({
				cls: [
					PLANNER_UI_CLASSES.range,
					"yearly-planner-cell-range-bar",
					"planner-external-event-range",
					"yearly-planner-external-event-range",
				]
					.filter(Boolean)
					.join(" "),
			});
			makePlannerInteractive(bar);
			applyExternalEventState(bar, event);
			bar.dataset.lane = String(lane);
			bar.dataset.externalEventId = event.id;
			bar.ariaLabel = t("a11y.openExternalEvent", {
				title: event.title,
			});
			bar.title = event.title;
			(bar as HTMLElement).style.right = `${lane * 4}px`;
			if (event.color) {
				bar.style.borderRightColor = event.color;
				bar.style.setProperty("--range-color", event.color);
			}
		});
	}

	if (isHoliday && ctx.holidaysData?.names.has(dateKey)) {
		cell.dataset.hasHoliday = "true";
	}

	const startDateRangeFiles = rangeFiles.filter((r) => r.isFirst).map((r) => r.file);
	const allFiles = [...singleFiles, ...startDateRangeFiles];
	cell.ariaLabel = t("a11y.yearlyDateCell", {
		date: dateKey,
		calendars: formatCalendarOverlayAria(alternateCalendarLabel),
		notes: allFiles.length + externalDateEvents.singleEvents.length,
		ranges: rangeFiles.length + externalDateEvents.rangeEvents.length,
		holidays: holidayNames.length,
	});

	if (alternateCalendarLabel) {
		cell.addClass("yearly-planner-cell-has-alt-calendar");
		createAlternateCalendarLabel(cell, {
			text: alternateCalendarLabel.text,
			containerClass: "yearly-planner-alt-calendar-labels",
			labelClass: "yearly-planner-alt-calendar-label",
		});
	}

	if (allFiles.length > 0 || externalDateEvents.singleEvents.length > 0) {
		const listEl = cell.createDiv({
			cls: `${PLANNER_UI_CLASSES.entryList} yearly-planner-cell-files`,
		});
		for (const file of allFiles) {
			createPlannerFileChip(listEl, {
				app: ctx.app,
				file,
				classes: {
					root: "yearly-planner-cell-file",
					completed: "yearly-planner-chip-completed",
					selected: "yearly-planner-cell-clipboard-selected",
				},
				selected: ctx.clipboardSelection.has(makeFileSelectionKey(file.path)),
				onCreated: (element, color) => {
					if (!parseRangeBasename(file.basename)) return;
					element.dataset.rangeBasename = file.basename;
					if (color) element.dataset.rangeColor = color;
				},
			});
		}
		for (const event of externalDateEvents.singleEvents) {
			createExternalEventChip(listEl, {
				event,
				classes:
					"yearly-planner-cell-file yearly-planner-external-event-chip",
				showTitle: true,
			});
		}
	}

	if (isHoliday && ctx.holidaysData?.names.has(dateKey)) {
		createHolidayBadge(cell, {
			dateKey,
			names: holidayNames,
			containerClass: "yearly-planner-cell-holidays",
			badgeClass: "yearly-planner-cell-holiday-badge",
			labelClass: "yearly-planner-holiday-label",
		});
	}

	if (isValid && (isSaturday || isSunday)) {
		const weekendLabels = getWeekendLabels(ctx.calendarOverlay.locale);
		const label = isSaturday ? weekendLabels.sat : weekendLabels.sun;
		const labelEl = cell.createSpan({
			cls: "yearly-planner-weekend-label",
			text: label,
		});
		labelEl.dataset.weekend = isSaturday ? "sat" : "sun";
	}

	return cell;
}

export function getMonthLabels(locale: string): readonly string[] {
	return getLocalizedMonthLabels(locale);
}
