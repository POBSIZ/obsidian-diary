import { App, TFile } from "obsidian";
import { getWeekendLabels, t } from "../../i18n";
import { getDayOfWeek, getDaysInMonth } from "../../utils/date";
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
import {
	getFilesForDate,
	getChipColor,
	type PlannerFileScope,
} from "../yearly-planner/file-utils";
import { getWeekdayLabels } from "../monthly-planner/render";
import {
	applyExternalEventState,
	applyPlannerFileState,
	createAlternateCalendarLabel,
	createExternalEventChip,
	createHolidayBadge,
	createPlannerFileChip,
	getPlannerFileDisplay,
	makePlannerInteractive,
	PLANNER_UI_CLASSES,
} from "../planner-components";

export type MonthlyListFilter = "all" | "withNotes" | "upcoming";

export function renderMonthlyListBody(
	parent: HTMLElement,
	ctx: {
		year: number;
		month: number;
		app: App;
		folder: string;
		plannerFileScope: PlannerFileScope;
		plannerFiles: TFile[];
		locale: string;
		holidaysData: HolidayData | null;
		calendarOverlay: CalendarOverlayConfig;
		externalEvents: ExternalCalendarEvent[];
		filter: MonthlyListFilter;
	},
): void {
	const {
		year,
		month,
		app,
		folder,
		plannerFileScope,
		plannerFiles,
		locale,
		holidaysData,
		calendarOverlay,
		externalEvents,
		filter,
	} = ctx;
	const daysInMonth = getDaysInMonth(year, month);
	const weekdayShort = getWeekdayLabels(locale);
	const weekendL = getWeekendLabels(locale);
	const now = new Date();
	let renderedDays = 0;

	for (let day = 1; day <= daysInMonth; day++) {
		const dayOfWeek = getDayOfWeek(year, month, day);
		const wk = weekdayShort[dayOfWeek];
		const isSaturday = dayOfWeek === 6;
		const isSunday = dayOfWeek === 0;
		const isToday =
			year === now.getFullYear() &&
			month === now.getMonth() + 1 &&
			day === now.getDate();
		const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		const alternateCalendarLabel = getCalendarOverlayLabel(
			year,
			month,
			day,
			calendarOverlay,
		);
		const isHoliday = holidaysData?.dates.has(dateKey) ?? false;
		const holidayNames = holidaysData?.names.get(dateKey) ?? [];
		const { singleFiles, rangeFiles } = getFilesForDate(
			app,
			folder,
			year,
			month,
			day,
			plannerFileScope,
			plannerFiles,
		);
		const externalDateEvents = getExternalEventsForDate(externalEvents, dateKey);
		const hasEntries =
			singleFiles.length > 0 ||
			rangeFiles.length > 0 ||
			externalDateEvents.summaryEvents.length > 0;
		const dateIsUpcoming =
			year > now.getFullYear() ||
			(year === now.getFullYear() && month > now.getMonth() + 1) ||
			(year === now.getFullYear() &&
				month === now.getMonth() + 1 &&
				day >= now.getDate());
		if (filter === "withNotes" && !hasEntries) continue;
		if (filter === "upcoming" && !dateIsUpcoming) continue;
		renderedDays++;

		const dayBlock = parent.createDiv({
			cls: [
				"monthly-list-planner-day",
				isToday && "monthly-list-planner-day-today",
				isHoliday && "monthly-list-planner-day-holiday",
				isSaturday && "monthly-list-planner-day-sat",
				isSunday && "monthly-list-planner-day-sun",
			]
				.filter(Boolean)
				.join(" "),
		});
		dayBlock.dataset.year = String(year);
		dayBlock.dataset.month = String(month);
		dayBlock.dataset.day = String(day);
		dayBlock.tabIndex = 0;
		dayBlock.setAttribute("role", "button");
		dayBlock.ariaLabel = t("a11y.monthlyListDate", {
			date: dateKey,
			calendars: formatCalendarOverlayAria(alternateCalendarLabel),
			notes: singleFiles.length,
			ranges: rangeFiles.length,
			holidays: holidayNames.length,
		});

		const head = dayBlock.createDiv({ cls: "monthly-list-planner-day-header" });
		const dateLine = head.createDiv({ cls: "monthly-list-planner-day-date-line" });
		dateLine.dataset.dailyDate = dateKey;
		dateLine.tabIndex = 0;
		dateLine.setAttribute("role", "button");
		dateLine.ariaLabel = t("daily.openDate", { date: dateKey });
		dateLine.createSpan({
			cls: "monthly-list-planner-day-num",
			text: String(day),
		});
		dateLine.createSpan({
			cls: "monthly-list-planner-day-weekday",
			text: wk,
		});
		if (alternateCalendarLabel) {
			createAlternateCalendarLabel(dateLine, {
				text: alternateCalendarLabel.text,
				containerClass: "monthly-list-planner-alt-calendar-labels",
				labelClass: "monthly-list-planner-alt-calendar-label",
			});
		}
		if (isSaturday || isSunday) {
			dateLine.createSpan({
				cls: "monthly-list-planner-weekend-label",
				text: isSaturday ? weekendL.sat : weekendL.sun,
			});
		}

		const body = dayBlock.createDiv({ cls: "monthly-list-planner-day-body" });
		if (rangeFiles.length > 0) {
			const rangeWrap = body.createDiv({
				cls: `${PLANNER_UI_CLASSES.rangeList} monthly-list-planner-ranges`,
			});
			for (const { file, runPos } of rangeFiles) {
				const barClasses = [
					PLANNER_UI_CLASSES.range,
					"monthly-planner-range-bar",
					"monthly-list-planner-range-bar",
					runPos.runStart && "monthly-planner-range-run-start",
					runPos.runEnd && "monthly-planner-range-run-end",
					!runPos.runStart &&
						!runPos.runEnd &&
						"monthly-planner-range-run-mid",
				]
					.filter(Boolean)
					.join(" ");
				const barEl = rangeWrap.createDiv({
					cls: barClasses,
				});
				makePlannerInteractive(barEl);
				barEl.dataset.path = file.path;
				const chipColor = getChipColor(app, file);
				if (chipColor) {
					barEl.style.setProperty("--range-color", chipColor);
				}
				applyPlannerFileState(barEl, app, file);
				const display = getPlannerFileDisplay(app, file);
				const displayTitle = display.text;
				const labelEl = barEl.createSpan({
					cls: "monthly-planner-range-label",
					text: displayTitle,
				});
				barEl.ariaLabel = t("a11y.openPlannerNote", {
					title: displayTitle,
					path: file.path,
				});
				if (display.completed) {
					labelEl.addClass("monthly-planner-chip-completed");
				}
			}
		}

		if (externalDateEvents.rangeEvents.length > 0) {
			const rangeWrap =
				body.querySelector<HTMLElement>(".monthly-list-planner-ranges") ??
				body.createDiv({
					cls: `${PLANNER_UI_CLASSES.rangeList} monthly-list-planner-ranges`,
				});
			for (const { event, runPos } of externalDateEvents.rangeEvents) {
				const barClasses = [
					PLANNER_UI_CLASSES.range,
					"monthly-planner-range-bar",
					"monthly-list-planner-range-bar",
					"planner-external-event-range",
					runPos.runStart && "monthly-planner-range-run-start",
					runPos.runEnd && "monthly-planner-range-run-end",
					!runPos.runStart &&
						!runPos.runEnd &&
						"monthly-planner-range-run-mid",
				]
					.filter(Boolean)
					.join(" ");
				const barEl = rangeWrap.createDiv({ cls: barClasses });
				makePlannerInteractive(barEl);
				applyExternalEventState(barEl, event);
				barEl.dataset.externalEventId = event.id;
				if (event.color) {
					barEl.style.setProperty("--range-color", event.color);
				}
				barEl.createSpan({
					cls: "monthly-planner-range-label",
					text: event.title,
				});
				barEl.ariaLabel = t("a11y.openExternalEvent", {
					title: event.title,
				});
			}
		}

		if (singleFiles.length > 0) {
			const listEl = body.createDiv({
				cls: `${PLANNER_UI_CLASSES.entryList} monthly-list-planner-files`,
			});
			for (const file of singleFiles) {
				createPlannerFileChip(listEl, {
					app,
					file,
					classes: {
						root: "monthly-planner-cell-file monthly-list-planner-cell-file",
						completed: "monthly-planner-chip-completed",
					},
				});
			}
		}

		if (externalDateEvents.singleEvents.length > 0) {
			const listEl =
				body.querySelector<HTMLElement>(".monthly-list-planner-files") ??
				body.createDiv({
					cls: `${PLANNER_UI_CLASSES.entryList} monthly-list-planner-files`,
				});
			for (const event of externalDateEvents.singleEvents) {
				createExternalEventChip(listEl, {
					event,
					classes:
						"monthly-planner-cell-file monthly-list-planner-cell-file",
				});
			}
		}

		if (isHoliday && holidayNames.length > 0) {
			createHolidayBadge(body, {
				dateKey,
				names: holidayNames,
				containerClass: "monthly-planner-cell-holidays",
				badgeClass: "monthly-planner-cell-holiday-badge",
				labelClass: "monthly-planner-holiday-label",
			});
		}

		if (
			rangeFiles.length === 0 &&
			singleFiles.length === 0 &&
			externalDateEvents.summaryEvents.length === 0 &&
			holidayNames.length === 0
		) {
			body.createDiv({
				cls: "monthly-list-planner-empty",
				text: t("view.monthlyListEmptyDay"),
			});
		}
	}

	if (renderedDays === 0) {
		parent.createDiv({
			cls: "monthly-list-planner-filter-empty",
			text: t("monthlyListFilter.empty"),
		});
	}
}
