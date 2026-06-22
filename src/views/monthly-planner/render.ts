import { App, TFile, setIcon } from "obsidian";
import { t } from "../../i18n";
import {
	MONTH_LABELS_KO,
	MONTH_LABELS_EN,
	WEEKDAY_LABELS_KO,
	WEEKDAY_LABELS_EN,
	WEEKEND_LABELS_KO,
	WEEKEND_LABELS_EN,
	TODO_CHIP_EMOJI_COMPLETED,
	TODO_CHIP_EMOJI_INCOMPLETE,
} from "../../constants";
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
	getFileTitle,
	getChipColor,
	isRecurrenceOccurrenceFile,
	isRecurrenceSourceFile,
	isTodoCompleted,
	isTodoFile,
	type PlannerFileScope,
} from "../yearly-planner/file-utils";
import { isDateInSelection } from "../yearly-planner/selection";
import {
	makeDateSelectionKey,
	makeFileSelectionKey,
} from "../planner-clipboard";
import type { CalendarCell } from "../../utils/date";
import { MonthYearInputModal } from "./modals";
import type { MonthlyPlannerSelectedDate } from "./types";
import {
	getExternalEventTimeLabel,
	getExternalEventsForDate,
	type ExternalCalendarEvent,
} from "../../utils/external-calendars";

export interface MonthlyHeaderCallbacks {
	onPrev: () => void;
	onNext: () => void;
	onToday: () => void;
	onMonthYearClick: (year: number, month: number) => void;
	onAddFile?: () => void;
	onResetZoom?: () => void;
	/** Yearly → monthly grid → list → yearly */
	onCyclePlannerView?: () => void;
}

export function renderMonthlyPlannerHeader(
	contentEl: HTMLElement,
	ctx: {
		year: number;
		month: number;
		monthLabel: string;
		app: App;
		/** Overrides default monthly planner title (e.g. list view) */
		viewTitle?: string;
	},
	callbacks: MonthlyHeaderCallbacks,
): void {
	const header = contentEl.createDiv({ cls: "monthly-planner-header" });
	header.createEl("h1", {
		text: ctx.viewTitle ?? t("view.monthlyTitle"),
		cls: "monthly-planner-title",
	});

	const navWrapper = header.createDiv({
		cls: "monthly-planner-nav-wrapper",
	});

	createHeaderIconButton(navWrapper, "monthly-planner-nav-btn", {
		icon: "chevron-left",
		label: t("header.prevMonth"),
		onClick: callbacks.onPrev,
	});

	const monthYearDisplay = navWrapper.createSpan({
		cls: "monthly-planner-month-year-display",
		text: `${ctx.monthLabel} ${ctx.year}`,
	});
	const openMonthYearModal = () => {
		new MonthYearInputModal(
			ctx.app,
			ctx.year,
			ctx.month,
			callbacks.onMonthYearClick,
		).open();
	};
	monthYearDisplay.onclick = openMonthYearModal;
	monthYearDisplay.tabIndex = 0;
	monthYearDisplay.setAttribute("role", "button");
	monthYearDisplay.onkeydown = (e) => {
		if (e.key !== "Enter" && e.key !== " ") return;
		e.preventDefault();
		openMonthYearModal();
	};
	monthYearDisplay.title = t("header.clickToEnterMonthYear");

	createHeaderIconButton(navWrapper, "monthly-planner-nav-btn", {
		icon: "chevron-right",
		label: t("header.nextMonth"),
		onClick: callbacks.onNext,
	});

	const secondaryActions: HeaderAction[] = [
		{
			icon: "calendar",
			label: t("header.goToCurrentMonth"),
			onClick: callbacks.onToday,
		},
	];

	if (callbacks.onCyclePlannerView) {
		secondaryActions.push({
			icon: "repeat",
			label: t("header.cyclePlannerView"),
			title: t("header.cyclePlannerViewHint"),
			onClick: callbacks.onCyclePlannerView,
			extraClass: "monthly-planner-nav-btn--cycle-view",
		});
	}

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
			extraClass: "monthly-planner-reset-zoom-btn",
		});
	}

	renderSecondaryHeaderActions(
		navWrapper,
		"monthly-planner-nav-btn",
		secondaryActions,
	);
}

interface HeaderAction {
	icon: string;
	label: string;
	onClick: () => void;
	title?: string;
	extraClass?: string;
}

function createHeaderIconButton(
	parent: HTMLElement,
	baseClass: string,
	action: HeaderAction,
): HTMLButtonElement {
	const btn = parent.createEl("button", {
		cls: [baseClass, action.extraClass].filter(Boolean).join(" "),
		attr: { type: "button" },
	});
	setIcon(btn, action.icon);
	btn.ariaLabel = action.label;
	if (action.title) btn.title = action.title;
	btn.onclick = action.onClick;
	return btn;
}

function renderSecondaryHeaderActions(
	parent: HTMLElement,
	baseClass: string,
	actions: HeaderAction[],
): void {
	if (actions.length === 0) return;
	const inline = parent.createDiv({ cls: "planner-nav-secondary" });
	for (const action of actions) {
		createHeaderIconButton(inline, baseClass, action);
	}

	const moreMenu = parent.createEl("details", { cls: "planner-more-menu" });
	const trigger = moreMenu.createEl("summary", {
		cls: `${baseClass} planner-more-menu-trigger`,
		attr: {
			"aria-label": t("header.moreActions"),
			role: "button",
		},
	});
	setIcon(trigger, "ellipsis");

	const popover = moreMenu.createDiv({ cls: "planner-more-menu-popover" });
	for (const action of actions) {
		const item = popover.createEl("button", {
			cls: "planner-more-menu-item",
			attr: { type: "button" },
		});
		const icon = item.createSpan({ cls: "planner-more-menu-item-icon" });
		setIcon(icon, action.icon);
		item.createSpan({ cls: "planner-more-menu-item-label", text: action.label });
		item.ariaLabel = action.label;
		if (action.title) item.title = action.title;
		item.onclick = () => {
			moreMenu.removeAttribute("open");
			action.onClick();
		};
	}
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
	const alternateCalendarLabel = getCalendarOverlayLabel(
		year,
		month,
		day,
		ctx.calendarOverlay,
	);
	if (alternateCalendarLabel) {
		const labelsEl = inner.createDiv({
			cls: "monthly-planner-alt-calendar-labels",
		});
		labelsEl.setAttribute("aria-hidden", "true");
		labelsEl.createSpan({
			cls: "monthly-planner-alt-calendar-label",
			text: alternateCalendarLabel.text,
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
			barEl.tabIndex = 0;
			barEl.setAttribute("role", "button");
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
			if (isRecurrenceSourceFile(ctx.app, file)) {
				barEl.addClass("planner-recurrence-source");
			} else if (isRecurrenceOccurrenceFile(ctx.app, file)) {
				barEl.addClass("planner-recurrence-occurrence");
			}
			if (ctx.clipboardSelection.has(makeFileSelectionKey(file.path))) {
				barEl.addClass("monthly-planner-cell-clipboard-selected");
			}
			if (isFirst) {
				const title = getFileTitle(ctx.app, file);
				const displayTitle = isTodoCompleted(ctx.app, file)
					? `${TODO_CHIP_EMOJI_COMPLETED} ${title}`
					: isTodoFile(ctx.app, file)
						? `${TODO_CHIP_EMOJI_INCOMPLETE} ${title}`
						: title;
				barEl.ariaLabel = t("a11y.openPlannerNote", {
					title: displayTitle,
					path: file.path,
				});
				const labelEl = barEl.createSpan({
					cls: "monthly-planner-range-label",
					text: displayTitle,
				});
				if (isTodoCompleted(ctx.app, file)) {
					labelEl.addClass("monthly-planner-chip-completed");
				}
			} else {
				barEl.ariaLabel = t("a11y.openPlannerNote", {
					title: getFileTitle(ctx.app, file),
					path: file.path,
				});
			}
		});
		externalDateEvents.rangeEvents.forEach(
			({ event, runPos, isFirst }, index) => {
				const barClasses = [
					"monthly-planner-range-bar",
					"planner-external-event-range",
					runPos.runStart && "monthly-planner-range-run-start",
					runPos.runEnd && "monthly-planner-range-run-end",
					!runPos.runStart &&
						!runPos.runEnd &&
						"monthly-planner-range-run-mid",
				]
					.filter(Boolean)
					.join(" ");
				const barEl = rangeContainer.createDiv({ cls: barClasses });
				barEl.tabIndex = 0;
				barEl.setAttribute("role", "button");
				if (isCompactLayout) {
					barEl.addClass("monthly-planner-range-bar-mobile");
				}
				barEl.dataset.externalEventId = event.id;
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

	if (singleFiles.length > 0 && isCompactLayout) {
		createMobileSingleFileSummary(inner, ctx.app, singleFiles);
	}
	if (externalDateEvents.singleEvents.length > 0 && isCompactLayout) {
		createMobileExternalSummary(inner, externalDateEvents.singleEvents);
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
		const listEl = inner.createDiv({ cls: "monthly-planner-cell-files" });
		for (const file of singleFiles) {
			const linkEl = listEl.createDiv({
				cls: "monthly-planner-cell-file",
			});
			linkEl.tabIndex = 0;
			linkEl.setAttribute("role", "button");
			const title = getFileTitle(ctx.app, file);
			if (isTodoCompleted(ctx.app, file)) {
				linkEl.addClass("monthly-planner-chip-completed");
				linkEl.textContent = `${TODO_CHIP_EMOJI_COMPLETED} ${title}`;
			} else if (isTodoFile(ctx.app, file)) {
				linkEl.textContent = `${TODO_CHIP_EMOJI_INCOMPLETE} ${title}`;
			} else {
				linkEl.textContent = title;
			}
			linkEl.title = file.path;
			linkEl.ariaLabel = t("a11y.openPlannerNote", {
				title,
				path: file.path,
			});
			linkEl.dataset.path = file.path;
			const chipColor = getChipColor(ctx.app, file);
			if (chipColor) {
				linkEl.style.borderLeftColor = chipColor;
			}
			if (isRecurrenceSourceFile(ctx.app, file)) {
				linkEl.addClass("planner-recurrence-source");
			} else if (isRecurrenceOccurrenceFile(ctx.app, file)) {
				linkEl.addClass("planner-recurrence-occurrence");
			}
			if (ctx.clipboardSelection.has(makeFileSelectionKey(file.path))) {
				linkEl.addClass("monthly-planner-cell-clipboard-selected");
			}
		}
	}

	if (externalDateEvents.singleEvents.length > 0 && !isCompactLayout) {
		const listEl =
			inner.querySelector<HTMLElement>(".monthly-planner-cell-files") ??
			inner.createDiv({ cls: "monthly-planner-cell-files" });
		for (const event of externalDateEvents.singleEvents) {
			const chipEl = listEl.createDiv({
				cls: "monthly-planner-cell-file planner-external-event-chip",
			});
			chipEl.tabIndex = 0;
			chipEl.setAttribute("role", "button");
			chipEl.dataset.externalEventId = event.id;
			const timeLabel = getExternalEventTimeLabel(
				event,
				ctx.calendarOverlay.locale,
			);
			chipEl.textContent = timeLabel
				? `${timeLabel} ${event.title}`
				: event.title;
			chipEl.ariaLabel = t("a11y.openExternalEvent", {
				title: event.title,
			});
			if (event.color) {
				chipEl.style.borderLeftColor = event.color;
			}
		}
	}

	if (isHoliday && ctx.holidaysData?.names.has(dateKey) && isCompactLayout) {
		createMobileHolidaySummary(inner, holidayNames);
	}

	if (isHoliday && ctx.holidaysData?.names.has(dateKey) && !isCompactLayout) {
		const holidaysContainer = inner.createDiv({
			cls: "monthly-planner-cell-holidays",
		});
		const badge = holidaysContainer.createDiv({
			cls: "monthly-planner-cell-holiday-badge",
		});
		badge.tabIndex = 0;
		badge.setAttribute("role", "button");
		badge.createSpan({
			cls: "monthly-planner-holiday-label",
			text: holidayNames.join(", "),
		});
		badge.ariaLabel = t("a11y.openHoliday", {
			date: dateKey,
			names: holidayNames.join(", "),
		});
		badge.dataset.holidayDate = dateKey;
		badge.dataset.holidayNames = JSON.stringify(holidayNames);
	}

	if (isSaturday || isSunday) {
		const weekendLabels =
			ctx.calendarOverlay.locale === "ko" ? WEEKEND_LABELS_KO : WEEKEND_LABELS_EN;
		const label = isSaturday ? weekendLabels.sat : weekendLabels.sun;
		const labelEl = inner.createSpan({
			cls: "monthly-planner-weekend-label",
			text: label,
		});
		labelEl.dataset.weekend = isSaturday ? "sat" : "sun";
	}

	return cell;
}

function createMobileSingleFileSummary(
	inner: HTMLElement,
	app: App,
	singleFiles: TFile[],
): void {
	const summaryEl = getOrCreateMobileSummaryContainer(inner);
	const groupedByColor = new Map<string, { color: string | null; count: number }>();
	for (const file of singleFiles) {
		const color = getChipColor(app, file);
		const colorKey = color ?? "__default__";
		const prev = groupedByColor.get(colorKey);
		if (prev) {
			prev.count += 1;
			continue;
		}
		groupedByColor.set(colorKey, { color, count: 1 });
	}

	for (const { color, count } of groupedByColor.values()) {
		const groupEl = summaryEl.createDiv({
			cls: "monthly-planner-mobile-single-group",
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
}

function createMobileExternalSummary(
	inner: HTMLElement,
	events: ExternalCalendarEvent[],
): void {
	const summaryEl = getOrCreateMobileSummaryContainer(inner);
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
	const labels = locale === "ko" ? MONTH_LABELS_KO : MONTH_LABELS_EN;
	return labels[month - 1] ?? String(month);
}

export function getWeekdayLabels(locale: string): readonly string[] {
	return locale === "ko" ? [...WEEKDAY_LABELS_KO] : [...WEEKDAY_LABELS_EN];
}
