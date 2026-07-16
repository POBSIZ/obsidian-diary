import { App, TFile } from "obsidian";
import {
	getMonthLabel as getLocalizedMonthLabel,
	getWeekdayLabels as getLocalizedWeekdayLabels,
	getWeekendLabels,
	t,
} from "../../i18n";
import { getDayOfWeek } from "../../utils/date";
import type { ChipDragState, DragState } from "../yearly-planner/types";
import type { HolidayData } from "../../utils/holidays";
import {
	formatCalendarOverlayAria,
	getCalendarOverlayLabel,
	type CalendarOverlayConfig,
} from "../../utils/calendar-overlays";
import {
	getFilesForDate,
	getChipColor,
	type PlannerFileScope,
} from "../yearly-planner/file-utils";
import { isDateInSelection } from "../yearly-planner/selection";
import {
	makeDateSelectionKey,
	makeFileSelectionKey,
} from "../planner-clipboard";
import type { CalendarCell } from "../../utils/date";
import { PlannerPeriodModal } from "../planner-period-modal";
import type { MonthlyPlannerSelectedDate } from "./types";
import {
	getExternalEventsForDate,
	type ExternalCalendarEvent,
} from "../../utils/external-calendars";
import { isRecurrenceVirtualEvent } from "../../utils/recurrence";
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
	getPlannerFileDisplay,
	makePlannerInteractive,
	PLANNER_UI_CLASSES,
} from "../planner-components";

export interface MonthlyHeaderCallbacks {
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
	onMonthYearClick: (year: number, month: number) => void;
	onAddFile?: () => void;
	onResetZoom?: () => void;
	currentViewMode?: "monthly" | "monthlyList";
	onSelectPlannerView: (mode: PlannerViewMode) => void;
	/** Secondary compatibility action; direct selection is the primary path. */
	onCyclePlannerView?: () => void;
}

export function renderMonthlyPlannerHeader(
	contentEl: HTMLElement,
	ctx: {
		year: number;
		month: number;
		monthLabel: string;
		app: App;
	},
	callbacks: MonthlyHeaderCallbacks,
): void {
	const openMonthYearModal = () => {
		new PlannerPeriodModal(ctx.app, {
			granularity: "month",
			year: ctx.year,
			month: ctx.month,
			onSubmit: ({ year, month }) => {
				if (month != null) callbacks.onMonthYearClick(year, month);
			},
		}).open();
	};
	const secondaryActions: PlannerHeaderAction[] = [
		{
			icon: "calendar",
			label: t("header.goToCurrentMonth"),
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

	if (callbacks.onResetZoom) {
		secondaryActions.push({
			icon: "rotate-ccw",
			label: t("header.resetZoom"),
			onClick: callbacks.onResetZoom,
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
		mode: callbacks.currentViewMode ?? "monthly",
		onSelectView: callbacks.onSelectPlannerView,
		previous: {
			icon: "chevron-left",
			label: t("header.prevMonth"),
			onClick: callbacks.onPrev,
		},
		next: {
			icon: "chevron-right",
			label: t("header.nextMonth"),
			onClick: callbacks.onNext,
		},
		period: {
			text: `${ctx.monthLabel} ${ctx.year}`,
			label: t("header.clickToEnterMonthYear"),
			title: t("header.clickToEnterMonthYear"),
			onClick: openMonthYearModal,
		},
		actions: secondaryActions,
	});
}

export interface CreateMonthlyCellContext {
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
	selectedDate: MonthlyPlannerSelectedDate | null;
	isCompactLayout: boolean;
}

export function createMonthlyCell(
	cellData: CalendarCell | null,
	ctx: CreateMonthlyCellContext,
): HTMLTableCellElement {
	const cell = ctx.app.workspace.containerEl.ownerDocument.createElement("td");

	if (!cellData) {
		cell.addClass("monthly-planner-cell-invalid");
		cell.createDiv({ cls: "monthly-planner-cell-inner" });
		return cell;
	}

	const { year, month, day } = cellData;
	const isSelected = isDateInSelection(year, month, day, ctx.dragState);
	const isDropTarget =
		ctx.chipDragState &&
		ctx.chipDragState.currentYear === year &&
		ctx.chipDragState.currentMonth === month &&
		ctx.chipDragState.currentDay === day;
	const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	const isClipboardDate = ctx.clipboardSelection.has(
		makeDateSelectionKey(dateKey),
	);
	const isHoliday = ctx.holidaysData?.dates.has(dateKey) ?? false;
	const dayOfWeek = getDayOfWeek(year, month, day);
	const isSaturday = dayOfWeek === 6;
	const isSunday = dayOfWeek === 0;
	const now = new Date();
	const isToday =
		year === now.getFullYear() &&
		month === now.getMonth() + 1 &&
		day === now.getDate();
	const isActiveDate =
		ctx.selectedDate?.year === year &&
		ctx.selectedDate?.month === month &&
		ctx.selectedDate?.day === day;

	cell.className = [
		"monthly-planner-cell",
		isSelected && "monthly-planner-cell-selected",
		isClipboardDate && "monthly-planner-cell-clipboard-selected",
		isDropTarget && "monthly-planner-cell-drop-target",
		isHoliday && "monthly-planner-cell-holiday",
		isSaturday && "monthly-planner-cell-saturday",
		isSunday && "monthly-planner-cell-sunday",
		isToday && "monthly-planner-cell-today",
		isActiveDate && "monthly-planner-cell-active-date",
	]
		.filter(Boolean)
		.join(" ");

	cell.dataset.year = String(year);
	cell.dataset.month = String(month);
	cell.dataset.day = String(day);
	cell.tabIndex = 0;
	cell.setAttribute("role", "button");

	const inner = cell.createDiv({ cls: "monthly-planner-cell-inner" });
	const dayNumEl = inner.createDiv({ cls: "monthly-planner-cell-day" });
	dayNumEl.textContent = String(day);
	dayNumEl.dataset.dailyDate = dateKey;
	dayNumEl.tabIndex = 0;
	dayNumEl.setAttribute("role", "button");
	dayNumEl.ariaLabel = t("daily.openDate", { date: dateKey });
	const alternateCalendarLabel = getCalendarOverlayLabel(
		year,
		month,
		day,
		ctx.calendarOverlay,
	);
	if (alternateCalendarLabel) {
		createAlternateCalendarLabel(inner, {
			text: alternateCalendarLabel.text,
			containerClass: "monthly-planner-alt-calendar-labels",
			labelClass: "monthly-planner-alt-calendar-label",
		});
	}

	const { singleFiles, rangeFiles } = getFilesForDate(
		ctx.app,
		ctx.folder,
		year,
		month,
		day,
		ctx.plannerFileScope,
		ctx.plannerFiles,
	);
	const externalDateEvents = getExternalEventsForDate(
		ctx.externalEvents,
		dateKey,
	);
	const isCompactLayout = ctx.isCompactLayout;
	const holidayNames =
		isHoliday && ctx.holidaysData?.names.has(dateKey)
			? (ctx.holidaysData.names.get(dateKey) ?? [])
			: [];
	cell.ariaLabel = t("a11y.monthlyDateCell", {
		date: dateKey,
		calendars: formatCalendarOverlayAria(alternateCalendarLabel),
		notes: singleFiles.length,
		ranges: rangeFiles.length,
		holidays: holidayNames.length,
	});

	if (
		(rangeFiles.length + externalDateEvents.rangeEvents.length > 0) &&
		(singleFiles.length + externalDateEvents.singleEvents.length > 0)
	) {
		cell.dataset.hasBoth = "true";
	}
	if (isHoliday && ctx.holidaysData?.names.has(dateKey)) {
		cell.dataset.hasHoliday = "true";
	}

	/* Range bars: lane index from getRangeLaneMap (overlap-based, same as yearly); data-range-stack holds lane 0–9 */
	if (rangeFiles.length > 0 || externalDateEvents.rangeEvents.length > 0) {
		const rangeContainer = inner.createDiv({
			cls: "monthly-planner-range-bars",
		});
		if (isCompactLayout) {
			rangeContainer.addClass("monthly-planner-range-bars-mobile");
		}
		const laneIndices = rangeFiles.map(
			({ file }) => ctx.rangeLaneMap.get(file.basename) ?? 0,
		);
		const maxLane = Math.max(0, ...laneIndices);
		const externalStartLane = rangeFiles.length > 0 ? maxLane + 1 : 0;
		const requiredSlots =
			externalStartLane + externalDateEvents.rangeEvents.length;
		rangeContainer.dataset.rangeCount = String(
			Math.min(
				Math.max(
					requiredSlots,
					rangeFiles.length + externalDateEvents.rangeEvents.length,
				),
				10,
			),
		);
		rangeFiles.forEach(({ file, runPos, isFirst }) => {
			const barClasses = [
				PLANNER_UI_CLASSES.range,
				"monthly-planner-range-bar",
				runPos.runStart && "monthly-planner-range-run-start",
				runPos.runEnd && "monthly-planner-range-run-end",
				!runPos.runStart &&
					!runPos.runEnd &&
					"monthly-planner-range-run-mid",
			]
				.filter(Boolean)
				.join(" ");
			const barEl = rangeContainer.createDiv({
				cls: barClasses,
			});
			makePlannerInteractive(barEl);
			if (isCompactLayout) {
				barEl.addClass("monthly-planner-range-bar-mobile");
			}
			const laneIdx = ctx.rangeLaneMap.get(file.basename) ?? 0;
			barEl.dataset.rangeStack = String(Math.min(laneIdx, 9));
			barEl.dataset.path = file.path;
			const chipColor = getChipColor(ctx.app, file);
			if (chipColor) {
				barEl.style.setProperty("--range-color", chipColor);
			}
			applyPlannerFileState(barEl, ctx.app, file);
			if (ctx.clipboardSelection.has(makeFileSelectionKey(file.path))) {
				barEl.addClass("monthly-planner-cell-clipboard-selected");
			}
			if (isFirst) {
				const display = getPlannerFileDisplay(ctx.app, file);
				const displayTitle = display.text;
				barEl.ariaLabel = t("a11y.openPlannerNote", {
					title: displayTitle,
					path: file.path,
				});
				const labelEl = barEl.createSpan({
					cls: "monthly-planner-range-label",
					text: displayTitle,
				});
				if (display.completed) {
					labelEl.addClass("monthly-planner-chip-completed");
				}
			} else {
				barEl.ariaLabel = t("a11y.openPlannerNote", {
					title: getPlannerFileDisplay(ctx.app, file).title,
					path: file.path,
				});
			}
		});
		externalDateEvents.rangeEvents.forEach(
			({ event, runPos, isFirst }, index) => {
				const isVirtualRecurrence = isRecurrenceVirtualEvent(event);
				const barClasses = [
					PLANNER_UI_CLASSES.range,
					"monthly-planner-range-bar",
					"planner-external-event-range",
					isVirtualRecurrence && "planner-recurrence-virtual",
					runPos.runStart && "monthly-planner-range-run-start",
					runPos.runEnd && "monthly-planner-range-run-end",
					!runPos.runStart &&
						!runPos.runEnd &&
						"monthly-planner-range-run-mid",
				]
					.filter(Boolean)
					.join(" ");
				const barEl = rangeContainer.createDiv({ cls: barClasses });
				if (!isCompactLayout || !isVirtualRecurrence) {
					makePlannerInteractive(barEl);
					applyExternalEventState(barEl, event);
					barEl.dataset.externalEventId = event.id;
				}
				if (isCompactLayout) {
					barEl.addClass("monthly-planner-range-bar-mobile");
				}
				barEl.dataset.rangeStack = String(
					Math.min(externalStartLane + index, 9),
				);
				if (event.color) {
					barEl.style.setProperty("--range-color", event.color);
				}
				if (isFirst) {
					barEl.createSpan({
						cls: "monthly-planner-range-label",
						text: event.title,
					});
				}
				barEl.ariaLabel = t("a11y.openExternalEvent", {
					title: event.title,
				});
			},
		);
	}

	if (
		isCompactLayout &&
		(singleFiles.length > 0 || externalDateEvents.singleEvents.length > 0)
	) {
		createMobileSingleSummary(
			inner,
			ctx.app,
			singleFiles,
			externalDateEvents.singleEvents,
		);
	}
	if (isCompactLayout) {
		createMobileEntryCount(
			inner,
			singleFiles.length +
				rangeFiles.length +
				externalDateEvents.singleEvents.length +
				externalDateEvents.rangeEvents.length +
				holidayNames.length,
		);
	}

	if (singleFiles.length > 0 && !isCompactLayout) {
		const listEl = inner.createDiv({
			cls: `${PLANNER_UI_CLASSES.entryList} monthly-planner-cell-files`,
		});
		for (const file of singleFiles) {
			createPlannerFileChip(listEl, {
				app: ctx.app,
				file,
				classes: {
					root: "monthly-planner-cell-file",
					completed: "monthly-planner-chip-completed",
					selected: "monthly-planner-cell-clipboard-selected",
				},
				selected: ctx.clipboardSelection.has(makeFileSelectionKey(file.path)),
			});
		}
	}

	if (externalDateEvents.singleEvents.length > 0 && !isCompactLayout) {
		const listEl =
			inner.querySelector<HTMLElement>(".monthly-planner-cell-files") ??
			inner.createDiv({
				cls: `${PLANNER_UI_CLASSES.entryList} monthly-planner-cell-files`,
			});
		for (const event of externalDateEvents.singleEvents) {
			createExternalEventChip(listEl, {
				event,
				classes: "monthly-planner-cell-file",
			});
		}
	}

	if (isHoliday && ctx.holidaysData?.names.has(dateKey) && isCompactLayout) {
		createMobileHolidaySummary(inner, holidayNames);
	}

	if (isHoliday && ctx.holidaysData?.names.has(dateKey) && !isCompactLayout) {
		createHolidayBadge(inner, {
			dateKey,
			names: holidayNames,
			containerClass: "monthly-planner-cell-holidays",
			badgeClass: "monthly-planner-cell-holiday-badge",
			labelClass: "monthly-planner-holiday-label",
		});
	}

	if (isSaturday || isSunday) {
		const weekendLabels = getWeekendLabels(ctx.calendarOverlay.locale);
		const label = isSaturday ? weekendLabels.sat : weekendLabels.sun;
		const labelEl = inner.createSpan({
			cls: "monthly-planner-weekend-label",
			text: label,
		});
		labelEl.dataset.weekend = isSaturday ? "sat" : "sun";
	}

	return cell;
}

function createMobileSingleSummary(
	inner: HTMLElement,
	app: App,
	singleFiles: TFile[],
	events: ExternalCalendarEvent[],
): void {
	const summaryEl = getOrCreateMobileSummaryContainer(inner);
	const groupedPlannerEntries = new Map<
		string,
		{ color: string | null; count: number; hasVirtualRecurrence: boolean }
	>();
	for (const file of singleFiles) {
		const color = getChipColor(app, file);
		const colorKey = color ?? "__default__";
		const prev = groupedPlannerEntries.get(colorKey);
		if (prev) {
			prev.count += 1;
			continue;
		}
		groupedPlannerEntries.set(colorKey, {
			color,
			count: 1,
			hasVirtualRecurrence: false,
		});
	}

	const externalEvents: ExternalCalendarEvent[] = [];
	for (const event of events) {
		if (!isRecurrenceVirtualEvent(event)) {
			externalEvents.push(event);
			continue;
		}
		const color = event.color ?? null;
		const colorKey = color ?? "__default__";
		const prev = groupedPlannerEntries.get(colorKey);
		if (prev) {
			prev.count += 1;
			prev.hasVirtualRecurrence = true;
			continue;
		}
		groupedPlannerEntries.set(colorKey, {
			color,
			count: 1,
			hasVirtualRecurrence: true,
		});
	}

	for (const { color, count, hasVirtualRecurrence } of groupedPlannerEntries.values()) {
		const groupEl = summaryEl.createDiv({
			cls: [
				"monthly-planner-mobile-single-group",
				hasVirtualRecurrence && "monthly-planner-mobile-recurrence-group",
			]
				.filter(Boolean)
				.join(" "),
		});
		const dotEl = groupEl.createSpan({
			cls: "monthly-planner-mobile-single-dot",
		});
		if (color) {
			dotEl.style.setProperty("--monthly-mobile-dot-color", color);
		}
		if (count > 1) {
			groupEl.createSpan({
				cls: "monthly-planner-mobile-single-plus",
				text: `+${count - 1}`,
			});
		}
	}

	createMobileExternalSummary(summaryEl, externalEvents);
}

function createMobileExternalSummary(
	summaryEl: HTMLElement,
	events: ExternalCalendarEvent[],
): void {
	const groupedByColor = new Map<
		string,
		{ color: string | null; count: number; event: ExternalCalendarEvent }
	>();
	for (const event of events) {
		const color = event.color ?? null;
		const colorKey = color ?? "__external__";
		const prev = groupedByColor.get(colorKey);
		if (prev) {
			prev.count += 1;
			continue;
		}
		groupedByColor.set(colorKey, { color, count: 1, event });
	}

	for (const { color, count, event } of groupedByColor.values()) {
		const groupEl = summaryEl.createDiv({
			cls: "monthly-planner-mobile-single-group planner-external-event-mobile-group",
		});
		groupEl.tabIndex = 0;
		groupEl.setAttribute("role", "button");
		groupEl.dataset.externalEventId = event.id;
		groupEl.ariaLabel = t("a11y.openExternalEvent", {
			title: event.title,
		});
		const dotEl = groupEl.createSpan({
			cls: "monthly-planner-mobile-single-dot planner-external-event-mobile-dot",
		});
		if (color) {
			dotEl.style.setProperty("--monthly-mobile-dot-color", color);
		}
		if (count > 1) {
			groupEl.createSpan({
				cls: "monthly-planner-mobile-single-plus",
				text: `+${count - 1}`,
			});
		}
	}
}

function createMobileHolidaySummary(inner: HTMLElement, holidayNames: string[]): void {
	if (holidayNames.length === 0) return;
	const summaryEl = getOrCreateMobileSummaryContainer(inner);
	const groupEl = summaryEl.createDiv({
		cls: "monthly-planner-mobile-single-group monthly-planner-mobile-single-group-holiday",
	});
	const dotEl = groupEl.createSpan({
		cls: "monthly-planner-mobile-single-dot",
	});
	dotEl.setCssProps({
		"--monthly-mobile-dot-color": "var(--text-accent)",
	});
	groupEl.title = holidayNames.join(", ");
	if (holidayNames.length > 1) {
		groupEl.createSpan({
			cls: "monthly-planner-mobile-single-plus",
			text: `+${holidayNames.length - 1}`,
		});
	}
}

function createMobileEntryCount(inner: HTMLElement, count: number): void {
	if (count <= 1) return;
	inner.createSpan({
		cls: "monthly-planner-mobile-entry-count",
		text: String(count),
		attr: { "aria-hidden": "true" },
	});
}

function getOrCreateMobileSummaryContainer(inner: HTMLElement): HTMLElement {
	const existing = inner.querySelector<HTMLElement>(
		".monthly-planner-mobile-single-summary",
	);
	if (existing) return existing;
	return inner.createDiv({
		cls: "monthly-planner-mobile-single-summary",
	});
}

export function getMonthLabel(locale: string, month: number): string {
	return getLocalizedMonthLabel(locale, month);
}

export function getWeekdayLabels(locale: string): readonly string[] {
	return getLocalizedWeekdayLabels(locale);
}
