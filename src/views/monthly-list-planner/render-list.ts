import { App, TFile } from "obsidian";
import {
	TODO_CHIP_EMOJI_COMPLETED,
	TODO_CHIP_EMOJI_INCOMPLETE,
	WEEKEND_LABELS_EN,
	WEEKEND_LABELS_KO,
} from "../../constants";
import { t } from "../../i18n";
import { getDayOfWeek, getDaysInMonth } from "../../utils/date";
import type { HolidayData } from "../../utils/holidays";
import {
	formatCalendarOverlayAria,
	getCalendarOverlayLabel,
	type CalendarOverlayConfig,
} from "../../utils/calendar-overlays";
import {
	getExternalEventTimeLabel,
	getExternalEventsForDate,
	type ExternalCalendarEvent,
} from "../../utils/external-calendars";
import {
	getFileTitle,
	getFilesForDate,
	getChipColor,
	isRecurrenceOccurrenceFile,
	isRecurrenceSourceFile,
	isTodoCompleted,
	isTodoFile,
	type PlannerFileScope,
} from "../yearly-planner/file-utils";
import { getWeekdayLabels } from "../monthly-planner/render";

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
	const weekendL = locale === "ko" ? WEEKEND_LABELS_KO : WEEKEND_LABELS_EN;
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
		const hasNotes = singleFiles.length > 0 || rangeFiles.length > 0;
		const dateIsUpcoming =
			year > now.getFullYear() ||
			(year === now.getFullYear() && month > now.getMonth() + 1) ||
			(year === now.getFullYear() &&
				month === now.getMonth() + 1 &&
				day >= now.getDate());
		if (filter === "withNotes" && !hasNotes) continue;
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
		dateLine.createSpan({
			cls: "monthly-list-planner-day-num",
			text: String(day),
		});
		dateLine.createSpan({
			cls: "monthly-list-planner-day-weekday",
			text: wk,
		});
		if (alternateCalendarLabel) {
			const labelsEl = dateLine.createSpan({
				cls: "monthly-list-planner-alt-calendar-labels",
			});
			labelsEl.setAttribute("aria-hidden", "true");
			labelsEl.createSpan({
				cls: "monthly-list-planner-alt-calendar-label",
				text: alternateCalendarLabel.text,
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
			const rangeWrap = body.createDiv({ cls: "monthly-list-planner-ranges" });
			for (const { file, runPos } of rangeFiles) {
				const barClasses = [
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
				barEl.tabIndex = 0;
				barEl.setAttribute("role", "button");
				barEl.dataset.path = file.path;
				const chipColor = getChipColor(app, file);
				if (chipColor) {
					barEl.style.setProperty("--range-color", chipColor);
				}
				if (isRecurrenceSourceFile(app, file)) {
					barEl.addClass("planner-recurrence-source");
				} else if (isRecurrenceOccurrenceFile(app, file)) {
					barEl.addClass("planner-recurrence-occurrence");
				}
				const title = getFileTitle(app, file);
				const displayTitle = isTodoCompleted(app, file)
					? `${TODO_CHIP_EMOJI_COMPLETED} ${title}`
					: isTodoFile(app, file)
						? `${TODO_CHIP_EMOJI_INCOMPLETE} ${title}`
						: title;
				const labelEl = barEl.createSpan({
					cls: "monthly-planner-range-label",
					text: displayTitle,
				});
				barEl.ariaLabel = t("a11y.openPlannerNote", {
					title: displayTitle,
					path: file.path,
				});
				if (isTodoCompleted(app, file)) {
					labelEl.addClass("monthly-planner-chip-completed");
				}
			}
		}

		if (externalDateEvents.rangeEvents.length > 0) {
			const rangeWrap =
				body.querySelector<HTMLElement>(".monthly-list-planner-ranges") ??
				body.createDiv({ cls: "monthly-list-planner-ranges" });
			for (const { event, runPos } of externalDateEvents.rangeEvents) {
				const barClasses = [
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
				barEl.tabIndex = 0;
				barEl.setAttribute("role", "button");
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
			const listEl = body.createDiv({ cls: "monthly-list-planner-files" });
			for (const file of singleFiles) {
				const linkEl = listEl.createEl("div", {
					cls: "monthly-planner-cell-file monthly-list-planner-cell-file",
				});
				linkEl.tabIndex = 0;
				linkEl.setAttribute("role", "button");
				const title = getFileTitle(app, file);
				if (isTodoCompleted(app, file)) {
					linkEl.addClass("monthly-planner-chip-completed");
					linkEl.textContent = `${TODO_CHIP_EMOJI_COMPLETED} ${title}`;
				} else if (isTodoFile(app, file)) {
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
				const chipColor = getChipColor(app, file);
				if (chipColor) {
					linkEl.style.borderLeftColor = chipColor;
				}
				if (isRecurrenceSourceFile(app, file)) {
					linkEl.addClass("planner-recurrence-source");
				} else if (isRecurrenceOccurrenceFile(app, file)) {
					linkEl.addClass("planner-recurrence-occurrence");
				}
			}
		}

		if (externalDateEvents.singleEvents.length > 0) {
			const listEl =
				body.querySelector<HTMLElement>(".monthly-list-planner-files") ??
				body.createDiv({ cls: "monthly-list-planner-files" });
			for (const event of externalDateEvents.singleEvents) {
				const chipEl = listEl.createDiv({
					cls: "monthly-planner-cell-file monthly-list-planner-cell-file planner-external-event-chip",
				});
				chipEl.tabIndex = 0;
				chipEl.setAttribute("role", "button");
				chipEl.dataset.externalEventId = event.id;
				const timeLabel = getExternalEventTimeLabel(
					event,
					calendarOverlay.locale,
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

		if (isHoliday && holidayNames.length > 0) {
			const holidaysContainer = body.createDiv({
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
