import {
	ItemView,
	Notice,
	Platform,
	TFile,
	WorkspaceLeaf,
} from "obsidian";
import {
	TODO_CHIP_EMOJI_COMPLETED,
	TODO_CHIP_EMOJI_INCOMPLETE,
	VIEW_TYPE_DAILY_PLANNER,
} from "../../constants";
import { getIntlLocaleTag, t } from "../../i18n";
import DiaryObsidian from "../../main";
import { getCalendarOverlayConfig, getCalendarOverlayLabel } from "../../utils/calendar-overlays";
import {
	getExternalCalendarName,
	getExternalEventsForDate,
	getExternalEventsForRange,
	type ExternalCalendarEvent,
} from "../../utils/external-calendars";
import { getHolidaysForYear } from "../../utils/holidays";
import {
	createRecurrenceOccurrenceFile,
	getRecurrenceVirtualEventsForRange,
	isRecurrenceVirtualEvent,
} from "../../utils/recurrence";
import { ExternalEventModal } from "../external-event-modal";
import { PlannerPeriodModal } from "../planner-period-modal";
import {
	PLANNER_COMPACT_LAYOUT_MAX_WIDTH,
	renderPlannerHeader,
	type PlannerHeaderAction,
	type PlannerViewMode,
} from "../planner-layout";
import {
	createRangeFile as createRangeFileOp,
	createSingleDateFile as createSingleDateFileOp,
	createExternalEventFile,
	moveFileToDate,
	updateFileTimeRange,
} from "../yearly-planner/file-operations";
import {
	getChipColor,
	getFileTitle,
	getFilesForDate,
	getPlannerChipTitle,
	getPlannerMarkdownFiles,
	getPlannerTimeRange,
	isTodoCompleted,
	isTodoFile,
	type PlannerFileScope,
} from "../yearly-planner/file-utils";
import { CreateFileModal, FileOptionsModal } from "../yearly-planner/modals";
import type { SelectionBounds } from "../yearly-planner/types";
import {
	DailyPlannerDragController,
	type DailyPlannerDragDate,
	type DailyPlannerDragItem,
	type DailyPlannerDrop,
} from "./drag";
import { layoutDailyPlannerEntries } from "./layout";
import {
	DailyPlannerTimeSelectionController,
	type DailyPlannerTimeSelection,
} from "./time-selection";
import type { DailyPlannerEntry, DailyPlannerState } from "./types";

const MINUTES_PER_DAY = 24 * 60;
const DEFAULT_DURATION_MINUTES = 60;

export interface DailyPlannerDate {
	year: number;
	month: number;
	day: number;
}

interface VisiblePlannerDay extends DailyPlannerDate {
	dateString: string;
	label: string;
	entries: DailyPlannerEntry[];
}

const pad = (value: number) => String(value).padStart(2, "0");

function toDateString(year: number, month: number, day: number): string {
	return `${year}-${pad(month)}-${pad(day)}`;
}

function addDaysToParts(
	year: number,
	month: number,
	day: number,
	delta: number,
): { year: number; month: number; day: number } {
	const date = new Date(year, month - 1, day + delta);
	return {
		year: date.getFullYear(),
		month: date.getMonth() + 1,
		day: date.getDate(),
	};
}

function timeToMinutes(value: string | null): number | null {
	if (!value) return null;
	const match = value.match(/^(\d{2}):(\d{2})$/);
	if (!match) return null;
	return Number(match[1]) * 60 + Number(match[2]);
}

function minutesToTime(minutes: number): string {
	const normalized = Math.max(0, Math.min(MINUTES_PER_DAY - 1, minutes));
	return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
}

function getExternalEventMinutes(
	event: ExternalCalendarEvent,
	dateString: string,
): { start: number; end: number } | null {
	if (event.allDay) return null;
	const start = new Date(event.start);
	if (Number.isNaN(start.getTime())) return null;
	const startDate = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
	let startMinutes = startDate < dateString ? 0 : start.getHours() * 60 + start.getMinutes();
	let endMinutes = startMinutes + DEFAULT_DURATION_MINUTES;
	if (event.end) {
		const end = new Date(event.end);
		if (!Number.isNaN(end.getTime())) {
			const endDate = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
			endMinutes = endDate > dateString ? MINUTES_PER_DAY : end.getHours() * 60 + end.getMinutes();
		}
	}
	startMinutes = Math.max(0, Math.min(MINUTES_PER_DAY - 1, startMinutes));
	endMinutes = Math.max(startMinutes + 15, Math.min(MINUTES_PER_DAY, endMinutes));
	return { start: startMinutes, end: endMinutes };
}

export class DailyPlannerView extends ItemView {
	year: number;
	month: number;
	day: number;
	navigation = false;
	private compactLayout = Platform.isMobile;
	private resizeObserver: ResizeObserver | null = null;
	private pendingInitialScroll = true;
	private readonly dragController: DailyPlannerDragController;
	private readonly timeSelectionController: DailyPlannerTimeSelectionController;

	constructor(
		leaf: WorkspaceLeaf,
		public plugin: DiaryObsidian,
	) {
		super(leaf);
		const now = new Date();
		this.year = now.getFullYear();
		this.month = now.getMonth() + 1;
		this.day = now.getDate();
		this.dragController = new DailyPlannerDragController(
			this.contentEl,
			(drop) => this.handlePlannerDrop(drop),
		);
		this.timeSelectionController = new DailyPlannerTimeSelectionController(
			this.contentEl,
			(selection) => this.openTimeSelectionModal(selection),
		);
	}

	getViewType(): string {
		return VIEW_TYPE_DAILY_PLANNER;
	}

	getDisplayText(): string {
		return t("view.dailyDisplayText", {
			date: this.formatCurrentDate(),
		});
	}

	getIcon(): string {
		return "clock-3";
	}

	protected getVisibleDayCount(): number {
		return 1;
	}

	protected getPlannerViewMode(): PlannerViewMode {
		return "daily";
	}

	protected getContainerClass(): string {
		return "daily-planner-single-container";
	}

	getState(): DailyPlannerState {
		return { year: this.year, month: this.month, day: this.day };
	}

	async setState(
		state: DailyPlannerState,
		result: { history: boolean },
	): Promise<void> {
		if (state?.year && state?.month && state?.day) {
			this.year = state.year;
			this.month = state.month;
			this.day = state.day;
			this.pendingInitialScroll = true;
			this.render();
		}
		await super.setState(state, result);
	}

	onOpen(): Promise<void> {
		this.attachResizeObserver();
		this.render();
		return Promise.resolve();
	}

	onClose(): Promise<void> {
		this.dragController.reset();
		this.timeSelectionController.reset();
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		return Promise.resolve();
	}

	render(): void {
		this.dragController.reset();
		this.timeSelectionController.reset();
		const previousScroll = this.contentEl.querySelector<HTMLElement>(
			".daily-planner-timeline-scroll",
		)?.scrollTop;
		this.compactLayout =
			Platform.isMobile ||
			this.getAvailableLayoutWidth() <= PLANNER_COMPACT_LAYOUT_MAX_WIDTH;
		this.contentEl.empty();
		this.contentEl.addClass("daily-planner-container");
		this.contentEl.addClass(this.getContainerClass());
		this.contentEl.toggleClass("planner-container-compact", this.compactLayout);
		this.renderHeader();
		const days = this.getVisibleDays();
		this.renderTimeline(days);
		const entries = days.flatMap((day) => day.entries);
		const scroll = this.contentEl.querySelector<HTMLElement>(
			".daily-planner-timeline-scroll",
		);
		if (scroll) {
			if (!this.pendingInitialScroll && previousScroll != null) {
				scroll.scrollTop = previousScroll;
			} else {
				this.pendingInitialScroll = false;
				this.queueInitialScroll(scroll, entries);
			}
		}
	}

	private renderHeader(): void {
		const dayCount = this.getVisibleDayCount();
		const openDateModal = () => {
			new PlannerPeriodModal(this.app, {
				granularity: "day",
				year: this.year,
				month: this.month,
				day: this.day,
				onSubmit: ({ year, month, day }) => {
					if (month != null && day != null) this.setDate(year, month, day);
				},
			}).open();
		};
		const actions: PlannerHeaderAction[] = [
			{
				icon: "calendar",
				label: t("daily.today"),
				onClick: () => {
					const now = new Date();
					this.setDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
				},
			},
			{
				icon: "file-plus",
				label: t("header.addFile"),
				onClick: () => this.openCreateFileModal(null),
			},
			{
				icon: "repeat",
				label: t("header.cyclePlannerView"),
				title: t("header.cyclePlannerViewHint"),
				onClick: () => void this.plugin.cyclePlannerView(this.leaf),
				moreOnly: true,
			},
		];
		renderPlannerHeader(this.contentEl, {
			mode: this.getPlannerViewMode(),
			onSelectView: (mode) => {
				void this.plugin.selectPlannerView(this.leaf, mode, this.getState());
			},
			previous: {
				icon: "chevron-left",
				label: t(dayCount > 1 ? "threeDay.prevRange" : "daily.prevDay"),
				onClick: () => this.moveDate(-dayCount),
			},
			next: {
				icon: "chevron-right",
				label: t(dayCount > 1 ? "threeDay.nextRange" : "daily.nextDay"),
				onClick: () => this.moveDate(dayCount),
			},
			period: {
				text: this.formatHeaderDate(),
				label: t("daily.selectDate"),
				title: t("daily.selectDate"),
				onClick: openDateModal,
			},
			actions,
		});
	}

	private getVisibleDays(): VisiblePlannerDay[] {
		const days: VisiblePlannerDay[] = [];
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const scope = this.plugin.settings.plannerFileScope ?? "vault";
		const plannerFiles = getPlannerMarkdownFiles(this.app, folder, scope);
		for (let offset = 0; offset < this.getVisibleDayCount(); offset++) {
			const date = addDaysToParts(this.year, this.month, this.day, offset);
			days.push({
				...date,
				dateString: toDateString(date.year, date.month, date.day),
				label: this.formatDayColumnDate(date),
				entries: this.getEntries(date, folder, scope, plannerFiles),
			});
		}
		return days;
	}

	private getEntries(
		date: DailyPlannerDate,
		folder: string,
		scope: PlannerFileScope,
		plannerFiles: TFile[],
	): DailyPlannerEntry[] {
		const dateString = toDateString(date.year, date.month, date.day);
		const { singleFiles, rangeFiles } = getFilesForDate(
			this.app,
			folder,
			date.year,
			date.month,
			date.day,
			scope,
			plannerFiles,
		);
		const entries: DailyPlannerEntry[] = [];
		for (const file of singleFiles) {
			const range = getPlannerTimeRange(this.app, file);
			const start = timeToMinutes(range.startTime);
			const end = timeToMinutes(range.endTime);
			const title = this.getTodoTitle(file, start == null);
			entries.push({
				id: `file:${file.path}`,
				title,
				color: getChipColor(this.app, file),
				startMinutes: start,
				endMinutes:
					start == null
						? null
						: Math.min(
								MINUTES_PER_DAY,
								end != null && end > start
									? end
									: start + DEFAULT_DURATION_MINUTES,
							),
				file,
				kind: "note",
			});
		}
		for (const { file } of rangeFiles) {
			const range = getPlannerTimeRange(this.app, file);
			const start = timeToMinutes(range.startTime);
			const end = timeToMinutes(range.endTime);
			entries.push({
				id: `range:${file.path}`,
				title: this.getTodoTitle(file, start == null),
				color: getChipColor(this.app, file),
				startMinutes: start,
				endMinutes:
					start == null
						? null
						: Math.min(
								MINUTES_PER_DAY,
								end != null && end > start
									? end
									: start + DEFAULT_DURATION_MINUTES,
							),
				file,
				kind: "range",
			});
		}

		const externalEvents = getExternalEventsForRange(
			this.app,
			this.plugin.settings,
			{ start: dateString, end: dateString },
			"monthly",
			plannerFiles,
		);
		const recurrenceEvents = getRecurrenceVirtualEventsForRange({
			app: this.app,
			plannerFiles,
			range: { start: dateString, end: dateString },
		});
		const overlayEvents = [...externalEvents, ...recurrenceEvents];
		for (const event of getExternalEventsForDate(
			overlayEvents,
			dateString,
		).summaryEvents) {
			let minutes = getExternalEventMinutes(event, dateString);
			if (isRecurrenceVirtualEvent(event)) {
				const source = this.app.vault.getAbstractFileByPath(
					event.recurrenceSourcePath,
				);
				if (source instanceof TFile) {
					const range = getPlannerTimeRange(this.app, source);
					const start = timeToMinutes(range.startTime);
					const end = timeToMinutes(range.endTime);
					if (start != null) {
						minutes = {
							start,
							end:
								end != null && end > start
									? end
									: Math.min(MINUTES_PER_DAY, start + DEFAULT_DURATION_MINUTES),
						};
					}
				}
			}
			entries.push({
				id: `external:${event.id}`,
				title: minutes
					? event.title.replace(/^\d{2}:\d{2}(?:–\d{2}:\d{2})?\s+/, "")
					: event.title,
				color: event.color ?? null,
				startMinutes: minutes?.start ?? null,
				endMinutes: minutes?.end ?? null,
				externalEvent: event,
				kind: "external",
			});
		}

		if (this.plugin.settings.showHolidays && this.plugin.settings.holidayCountry) {
			const names =
				getHolidaysForYear(
					this.plugin.settings.holidayCountry,
					date.year,
				).names.get(dateString) ?? [];
			for (const name of names) {
				entries.push({
					id: `holiday:${name}`,
					title: name,
					color: "var(--text-accent)",
					startMinutes: null,
					endMinutes: null,
					kind: "holiday",
				});
			}
		}
		return entries;
	}

	private renderUntimedList(
		parent: HTMLElement,
		entries: DailyPlannerEntry[],
		day: VisiblePlannerDay,
	): void {
		const list = parent.createDiv({ cls: "daily-planner-untimed-list" });
		if (entries.length === 0) {
			list.createDiv({
				cls: "daily-planner-empty",
				text: "—",
				attr: {
					"aria-label": t("daily.noUntimed"),
					title: t("daily.noUntimed"),
				},
			});
			return;
		}
		for (const entry of entries) {
			const isVirtualRecurrence = Boolean(
				entry.externalEvent && isRecurrenceVirtualEvent(entry.externalEvent),
			);
			const chip = list.createEl("button", {
				cls: [
					"daily-planner-untimed-chip",
					entry.kind === "external" && "planner-external-event-chip",
					isVirtualRecurrence && "planner-recurrence-virtual",
					entry.kind === "holiday" && "daily-planner-holiday-chip",
				]
					.filter(Boolean)
					.join(" "),
				text: entry.title,
				attr: { type: "button" },
			});
			if (entry.color) chip.style.borderLeftColor = entry.color;
			chip.onclick = () => this.openEntry(entry);
			this.bindEntryDrag(chip, entry, day);
		}
	}

	private renderTimeline(days: VisiblePlannerDay[]): void {
		const section = this.contentEl.createDiv({ cls: "daily-planner-timeline" });
		section.createDiv({
			cls: "daily-planner-section-heading",
			text: t("daily.timeline"),
		});
		const viewport = section.createDiv({ cls: "daily-planner-days-viewport" });
		const inner = viewport.createDiv({
			cls: [
				"daily-planner-days-inner",
				days.length > 1 && "is-multi-day",
			]
				.filter(Boolean)
				.join(" "),
		});
		inner.style.setProperty("--daily-planner-day-count", String(days.length));
		const headings = inner.createDiv({ cls: "daily-planner-day-headings" });
		for (const day of days) {
			const heading = headings.createDiv({ cls: "daily-planner-day-heading" });
			heading.createSpan({ text: day.label });
			const overlay = getCalendarOverlayLabel(
				day.year,
				day.month,
				day.day,
				getCalendarOverlayConfig(this.plugin.settings),
			);
			if (overlay) {
				heading.createSpan({
					cls: "daily-planner-alt-calendar",
					text: overlay.fullText,
				});
			}
		}
		this.renderAllDayRow(inner, days);
		const scroll = inner.createDiv({ cls: "daily-planner-timeline-scroll" });
		const canvas = scroll.createDiv({ cls: "daily-planner-timeline-canvas" });
		const labels = canvas.createDiv({ cls: "daily-planner-time-labels" });
		for (let hour = 0; hour < 24; hour++) {
			labels.createSpan({
				cls: "daily-planner-time-label",
				text: `${pad(hour)}:00`,
				attr: { style: `--daily-minute:${hour * 60}` },
			});
		}
		const columns = canvas.createDiv({ cls: "daily-planner-day-columns" });
		for (const day of days) this.renderTimelineDay(columns, day);
		this.updateTimelineGeometry(scroll);
	}

	private renderAllDayRow(parent: HTMLElement, days: VisiblePlannerDay[]): void {
		const row = parent.createDiv({ cls: "daily-planner-all-day-row" });
		row.createDiv({
			cls: "daily-planner-all-day-label",
			text: t("daily.allDayLane"),
		});
		const columns = row.createDiv({ cls: "daily-planner-all-day-columns" });
		for (const day of days) {
			const cell = columns.createDiv({ cls: "daily-planner-all-day-cell" });
			this.renderUntimedList(
				cell,
				day.entries.filter((entry) => entry.startMinutes == null),
				day,
			);
		}
	}

	private updateTimelineGeometry(scroll: HTMLElement): void {
		const style = window.getComputedStyle(scroll);
		const borderWidth =
			Number.parseFloat(style.borderLeftWidth) +
			Number.parseFloat(style.borderRightWidth);
		const scrollbarWidth = Math.max(
			0,
			scroll.offsetWidth - scroll.clientWidth - borderWidth,
		);
		this.contentEl.style.setProperty(
			"--daily-planner-scrollbar-width",
			`${scrollbarWidth}px`,
		);
	}

	private renderTimelineDay(
		columns: HTMLElement,
		day: VisiblePlannerDay,
	): void {
		const layer = columns.createDiv({ cls: "daily-planner-events-layer" });
		layer.dataset.year = String(day.year);
		layer.dataset.month = String(day.month);
		layer.dataset.day = String(day.day);
		layer.dataset.date = day.dateString;
		layer.tabIndex = 0;
		layer.ariaLabel = t("threeDay.timelineForDate", { date: day.label });
		layer.onclick = (event) => {
			if (event.target !== layer) return;
			const rect = layer.getBoundingClientRect();
			const minute = Math.max(
				0,
				Math.min(
					MINUTES_PER_DAY - 30,
					Math.round(((event.clientY - rect.top) / rect.height) * 48) * 30,
				),
			);
			this.openCreateFileModal({ start: minute, end: minute + 60 }, day);
		};
		this.timeSelectionController.bind(layer);
		for (const entry of layoutDailyPlannerEntries(
			day.entries.filter((entry) => entry.startMinutes != null),
		)) {
			const isVirtualRecurrence = Boolean(
				entry.externalEvent && isRecurrenceVirtualEvent(entry.externalEvent),
			);
			const block = layer.createEl("button", {
				cls: [
					"daily-planner-event",
					entry.kind === "external" && "planner-external-event-chip",
					isVirtualRecurrence && "planner-recurrence-virtual",
				]
					.filter(Boolean)
					.join(" "),
				attr: { type: "button" },
			});
			block.style.setProperty("--daily-start", String(entry.startMinutes));
			block.style.setProperty(
				"--daily-duration",
				String(Math.max(30, (entry.endMinutes ?? 0) - (entry.startMinutes ?? 0))),
			);
			block.style.setProperty("--daily-column", String(entry.column));
			block.style.setProperty("--daily-column-count", String(entry.columnCount));
			if (entry.color) block.style.setProperty("--daily-event-color", entry.color);
			block.createSpan({
				cls: "daily-planner-event-time",
				text: `${minutesToTime(entry.startMinutes ?? 0)}–${minutesToTime(
					Math.min(MINUTES_PER_DAY - 1, entry.endMinutes ?? 0),
				)}`,
			});
			block.createSpan({ cls: "daily-planner-event-title", text: entry.title });
			block.onclick = (event) => {
				event.stopPropagation();
				this.openEntry(entry);
			};
			this.bindEntryDrag(block, entry, day);
		}
		const now = new Date();
		if (
			day.year === now.getFullYear() &&
			day.month === now.getMonth() + 1 &&
			day.day === now.getDate()
		) {
			const line = layer.createDiv({ cls: "daily-planner-now-line" });
			line.style.setProperty(
				"--daily-now",
				String(now.getHours() * 60 + now.getMinutes()),
			);
		}
	}

	private bindEntryDrag(
		element: HTMLElement,
		entry: DailyPlannerEntry,
		day: VisiblePlannerDay,
	): void {
		if (!entry.file && !entry.externalEvent && entry.kind !== "holiday") return;
		if (entry.file) element.dataset.path = entry.file.path;
		if (entry.externalEvent) {
			element.dataset.externalEventId = entry.externalEvent.id;
		}
		const sourceDate: DailyPlannerDragDate = {
			year: day.year,
			month: day.month,
			day: day.day,
			dateString: day.dateString,
		};
		const item: DailyPlannerDragItem = { entry, sourceDate };
		if (this.dragController.bind(element, item)) {
			element.addClass("is-draggable");
		}
		if (
			entry.startMinutes != null &&
			entry.endMinutes != null &&
			this.dragController.bindResize(element, item)
		) {
			element.addClass("is-resizable");
		}
	}

	private async handlePlannerDrop(drop: DailyPlannerDrop): Promise<void> {
		const sameDate =
			drop.item.sourceDate.dateString === drop.targetDate.dateString;
		const sameTime =
			drop.item.entry.startMinutes === drop.startMinutes &&
			drop.item.entry.endMinutes === drop.endMinutes;
		if (drop.item.entry.file && sameDate && sameTime) return;

		try {
			let file = await this.materializeDragItem(drop.item);
			if (!sameDate) {
				const moved = await moveFileToDate(
					this.app,
					file,
					drop.targetDate.year,
					drop.targetDate.month,
					drop.targetDate.day,
				);
				if (!moved) {
					new Notice(t("chipDrag.targetExists"));
					return;
				}
				file = moved;
			}
			await updateFileTimeRange(this.app, file, {
				startTime: minutesToTime(drop.startMinutes),
				endTime: minutesToTime(drop.endMinutes),
			});
			this.render();
		} catch (error) {
			console.error("Failed to move daily planner entry", error);
			new Notice(error instanceof Error ? error.message : String(error));
		}
	}

	private async materializeDragItem(item: DailyPlannerDragItem): Promise<TFile> {
		if (item.entry.file) return item.entry.file;
		if (item.entry.externalEvent) {
			const event = item.entry.externalEvent;
			if (isRecurrenceVirtualEvent(event)) {
				return createRecurrenceOccurrenceFile({
					app: this.app,
					sourcePath: event.recurrenceSourcePath,
					occurrenceDate: event.recurrenceOccurrenceDate,
					plannerFiles: getPlannerMarkdownFiles(
						this.app,
						this.plugin.settings.plannerFolder || "Planner",
						this.plugin.settings.plannerFileScope ?? "vault",
					),
				});
			}
			return createExternalEventFile(
				this.app,
				this.plugin.settings.plannerFolder || "Planner",
				event,
				getExternalCalendarName(this.plugin.settings, event.calendarId),
				this.plugin.settings.locale ?? "en",
			);
		}
		return this.createHolidayMarkdown(item);
	}

	private async createHolidayMarkdown(item: DailyPlannerDragItem): Promise<TFile> {
		const folder = (this.plugin.settings.plannerFolder || "Planner")
			.trim()
			.replace(/^\/+|\/+$/g, "");
		const suffix =
			item.entry.title
				.replace(/[\\/:*?"<>|#\n\r\t]/g, "")
				.trim() || "holiday";
		let attempt = 1;
		while (attempt < 1000) {
			const numberedSuffix = attempt === 1 ? suffix : `${suffix}-${attempt}`;
			const basename = `${item.sourceDate.dateString}-${numberedSuffix}`;
			const path = folder ? `${folder}/${basename}.md` : `${basename}.md`;
			if (!this.app.vault.getAbstractFileByPath(path)) {
				return createSingleDateFileOp(
					this.app,
					folder,
					basename,
					item.entry.color ?? undefined,
				);
			}
			attempt += 1;
		}
		throw new Error("Could not create a unique holiday note.");
	}

	private getTodoTitle(file: TFile, includeTime: boolean): string {
		const title = includeTime
			? getPlannerChipTitle(this.app, file)
			: getFileTitle(this.app, file);
		if (isTodoCompleted(this.app, file)) {
			return `${TODO_CHIP_EMOJI_COMPLETED} ${title}`;
		}
		if (isTodoFile(this.app, file)) {
			return `${TODO_CHIP_EMOJI_INCOMPLETE} ${title}`;
		}
		return title;
	}

	private openEntry(entry: DailyPlannerEntry): void {
		if (entry.file) {
			new FileOptionsModal(
				this.app,
				entry.file,
				this.leaf,
				() => this.render(),
				(file) => this.plugin.openPlannerFile(this.leaf, file),
				getCalendarOverlayConfig(this.plugin.settings),
			).open();
			return;
		}
		if (entry.externalEvent) this.openExternalEventModal(entry.externalEvent);
	}

	private openExternalEventModal(event: ExternalCalendarEvent): void {
		const recurrenceEvent = isRecurrenceVirtualEvent(event) ? event : null;
		const plannerFiles = recurrenceEvent
			? getPlannerMarkdownFiles(
					this.app,
					this.plugin.settings.plannerFolder || "Planner",
					this.plugin.settings.plannerFileScope ?? "vault",
				)
			: [];
		new ExternalEventModal(this.app, {
			event,
			calendarName: recurrenceEvent
				? t("recurrence.virtualSource")
				: getExternalCalendarName(this.plugin.settings, event.calendarId),
			folder: this.plugin.settings.plannerFolder || "Planner",
			locale: this.plugin.settings.locale ?? "en",
			onCreated: async (file) => {
				await this.plugin.openPlannerFile(this.leaf, file);
				this.render();
			},
			createFile: recurrenceEvent
				? () =>
						createRecurrenceOccurrenceFile({
							app: this.app,
							sourcePath: recurrenceEvent.recurrenceSourcePath,
							occurrenceDate: recurrenceEvent.recurrenceOccurrenceDate,
							plannerFiles,
						})
				: undefined,
			readOnlyHint: recurrenceEvent ? t("recurrence.virtualHint") : undefined,
			createSuccessMessage: recurrenceEvent
				? t("recurrence.createSuccess")
				: undefined,
			onRefresh: recurrenceEvent
				? undefined
				: async () => {
						const ok = await this.plugin.refreshExternalCalendar(event.calendarId);
						this.render();
						return ok;
					},
		}).open();
	}

	private openCreateFileModal(
		timeRange: { start: number; end: number } | null,
		startDate: DailyPlannerDate = this.getState(),
		endDate: DailyPlannerDate = startDate,
	): void {
		const bounds: SelectionBounds = {
			startYear: startDate.year,
			startMonth: startDate.month,
			startDay: startDate.day,
			endYear: endDate.year,
			endMonth: endDate.month,
			endDay: endDate.day,
		};
		new CreateFileModal(this.app, {
			bounds,
			defaultFolder: this.plugin.settings.plannerFolder || "Planner",
			plannerFileScope: this.plugin.settings.plannerFileScope ?? "vault",
			calendarOverlay: getCalendarOverlayConfig(this.plugin.settings),
			defaultStartTime: timeRange ? minutesToTime(timeRange.start) : undefined,
			defaultEndTime: timeRange ? minutesToTime(timeRange.end) : undefined,
			createSingleDateFile: (
				folder,
				basename,
				color,
				todo,
				notifyMinutes,
				plannerTimeRange,
				recurrence,
			) =>
				createSingleDateFileOp(
					this.app,
					folder,
					basename,
					color,
					todo,
					notifyMinutes,
					plannerTimeRange,
					recurrence,
				),
			createRangeFile: (
				folder,
				basename,
				color,
				todo,
				notifyMinutes,
				plannerTimeRange,
				recurrence,
			) =>
				createRangeFileOp(
					this.app,
					folder,
					basename,
					color,
					todo,
					notifyMinutes,
					plannerTimeRange,
					recurrence,
				),
			onCreated: () => this.render(),
			openCreatedFile: (file) => this.plugin.openPlannerFile(this.leaf, file),
		}).open();
	}

	private openTimeSelectionModal(
		selection: DailyPlannerTimeSelection,
	): void {
		this.openCreateFileModal(
			{ start: selection.startMinutes, end: selection.endMinutes },
			selection.startDate,
			selection.endDate,
		);
	}

	private setDate(year: number, month: number, day: number): void {
		this.year = year;
		this.month = month;
		this.day = day;
		this.pendingInitialScroll = true;
		this.render();
	}

	private moveDate(delta: number): void {
		const next = addDaysToParts(this.year, this.month, this.day, delta);
		this.setDate(next.year, next.month, next.day);
	}

	private getDateString(): string {
		return toDateString(this.year, this.month, this.day);
	}

	private formatCurrentDate(): string {
		return new Intl.DateTimeFormat(
			getIntlLocaleTag(this.plugin.settings.locale ?? "en"),
			{ year: "numeric", month: "long", day: "numeric", weekday: "short" },
		).format(new Date(this.year, this.month - 1, this.day));
	}

	private formatDayColumnDate(date: DailyPlannerDate): string {
		return new Intl.DateTimeFormat(
			getIntlLocaleTag(this.plugin.settings.locale ?? "en"),
			{ month: "short", day: "numeric", weekday: "short" },
		).format(new Date(date.year, date.month - 1, date.day));
	}

	protected formatHeaderDate(): string {
		if (this.getVisibleDayCount() === 1) return this.formatCurrentDate();
		const end = addDaysToParts(
			this.year,
			this.month,
			this.day,
			this.getVisibleDayCount() - 1,
		);
		const locale = getIntlLocaleTag(this.plugin.settings.locale ?? "en");
		const startDate = new Date(this.year, this.month - 1, this.day);
		const endDate = new Date(end.year, end.month - 1, end.day);
		const formatter = new Intl.DateTimeFormat(locale, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
		return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
	}

	private queueInitialScroll(
		scroll: HTMLElement,
		entries: DailyPlannerEntry[],
	): void {
		const now = new Date();
		const firstTimed = entries
			.map((entry) => entry.startMinutes)
			.filter((value): value is number => value != null)
			.sort((a, b) => a - b)[0];
		const anchor =
			this.year === now.getFullYear() &&
			this.month === now.getMonth() + 1 &&
			this.day === now.getDate()
				? now.getHours() * 60 + now.getMinutes()
				: (firstTimed ?? 8 * 60);
		window.requestAnimationFrame(() => {
			scroll.scrollTop = Math.max(0, anchor - 90);
		});
	}

	private attachResizeObserver(): void {
		this.resizeObserver?.disconnect();
		this.resizeObserver = new ResizeObserver((entries) => {
			const width = entries[0]?.contentRect.width ?? 0;
			const compact = Platform.isMobile || width <= PLANNER_COMPACT_LAYOUT_MAX_WIDTH;
			if (compact === this.compactLayout) return;
			this.compactLayout = compact;
			this.render();
		});
		this.resizeObserver.observe(this.contentEl);
	}

	private getAvailableLayoutWidth(): number {
		return this.contentEl.getBoundingClientRect().width || window.innerWidth;
	}
}
