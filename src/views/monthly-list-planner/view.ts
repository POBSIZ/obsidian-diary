import { ItemView, Platform, TFile, WorkspaceLeaf } from "obsidian";
import { t } from "../../i18n";
import DiaryObsidian from "../../main";
import { VIEW_TYPE_MONTHLY_LIST_PLANNER } from "../../constants";
import type { MonthlyPlannerState } from "../monthly-planner/types";
import {
	getMonthLabel,
	renderMonthlyPlannerHeader,
} from "../monthly-planner/render";
import {
	getMonthNoteFilePath,
	getPlannerMarkdownFiles,
} from "../yearly-planner/file-utils";
import {
	detachReusablePlanNotePanel,
	mountPlanNotePanel,
	renderPlanNotePanel,
} from "../plan-note-panel";
import { getHolidaysForYear } from "../../utils/holidays";
import {
	CreateFileModal,
	FileOptionsModal,
	HolidayInfoModal,
} from "../yearly-planner/modals";
import type { SelectionBounds } from "../yearly-planner/types";
import {
	createRangeFile as createRangeFileOp,
	createSingleDateFile as createSingleDateFileOp,
} from "../yearly-planner/file-operations";
import {
	type MonthlyListFilter,
	renderMonthlyListBody,
} from "./render-list";
import { getDaysInMonth } from "../../utils/date";
import {
	createRecurrenceOccurrenceFile,
	getRecurrenceVirtualEventsForRange,
	isRecurrenceVirtualEvent,
} from "../../utils/recurrence";
import { getCalendarOverlayConfig } from "../../utils/calendar-overlays";
import {
	getExternalCalendarName,
	getExternalEventsForRange,
	type ExternalCalendarEvent,
} from "../../utils/external-calendars";
import { ExternalEventModal } from "../external-event-modal";
import {
	PLANNER_COMPACT_LAYOUT_MAX_WIDTH,
	renderPlannerSegmentedControl,
	setupPlannerContainer,
} from "../planner-layout";

export class MonthlyListPlannerView extends ItemView {
	year: number;
	month: number;
	navigation = false;
	private touchStartPos: { x: number; y: number } | null = null;
	/** After header "go to current month" (today), scroll list to today's row. */
	private pendingScrollToToday = false;
	/** After opening the list view, scroll to today once (applied after final layout; see queue). */
	private pendingScrollToTodayOnOpen = false;
	private initialScrollToTodayHandle: number | null = null;
	private listFilter: MonthlyListFilter = "all";
	private compactLayout = Platform.isMobile;
	private resizeObserver: ResizeObserver | null = null;
	private visibleExternalEventsById = new Map<string, ExternalCalendarEvent>();

	constructor(
		leaf: WorkspaceLeaf,
		public plugin: DiaryObsidian,
	) {
		super(leaf);
		const now = new Date();
		this.year = now.getFullYear();
		this.month = now.getMonth() + 1;
	}

	getViewType(): string {
		return VIEW_TYPE_MONTHLY_LIST_PLANNER;
	}

	getDisplayText(): string {
		const locale = this.plugin.settings.locale ?? "en";
		const monthLabel = getMonthLabel(locale, this.month);
		return t("view.monthlyListDisplayText", {
			year: this.year,
			month: monthLabel,
		});
	}

	getState(): MonthlyPlannerState {
		return { year: this.year, month: this.month };
	}

	async setState(
		state: MonthlyPlannerState,
		result: { history: boolean },
	): Promise<void> {
		if (state?.year && state?.month) {
			this.year = state.year;
			this.month = state.month;
			this.render();
		}
		await super.setState(state, result);
		/* Workspace may apply state after the first onOpen render; schedule scroll after that paint. */
		this.queueInitialScrollToToday();
	}

	onOpen(): Promise<void> {
		this.pendingScrollToTodayOnOpen = true;
		this.attachResizeObserver();
		this.render();
		this.queueInitialScrollToToday();
		return Promise.resolve();
	}

	onClose(): Promise<void> {
		this.touchStartPos = null;
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		this.clearInitialScrollToToday();
		return Promise.resolve();
	}

	protected isRangeBarInteractionEnabled(): boolean {
		return true;
	}

	/** Defer: setState can re-render after onOpen, which would reset scroll if we scrolled in render(). */
	private queueInitialScrollToToday(): void {
		if (!this.pendingScrollToTodayOnOpen) return;
		if (this.initialScrollToTodayHandle != null) {
			window.clearTimeout(this.initialScrollToTodayHandle);
		}
		this.initialScrollToTodayHandle = window.setTimeout(() => {
			this.initialScrollToTodayHandle = null;
			this.applyInitialScrollToToday();
		}, 0);
	}

	private clearInitialScrollToToday(): void {
		if (this.initialScrollToTodayHandle != null) {
			window.clearTimeout(this.initialScrollToTodayHandle);
			this.initialScrollToTodayHandle = null;
		}
		this.pendingScrollToTodayOnOpen = false;
	}

	private applyInitialScrollToToday(): void {
		if (!this.pendingScrollToTodayOnOpen) return;
		const now = new Date();
		if (
			this.year !== now.getFullYear() ||
			this.month !== now.getMonth() + 1
		) {
			this.pendingScrollToTodayOnOpen = false;
			return;
		}
		window.requestAnimationFrame(() => {
			window.requestAnimationFrame(() => {
				if (!this.pendingScrollToTodayOnOpen) return;
				const newScroll = this.contentEl.querySelector<HTMLElement>(
					".monthly-list-planner-scroll",
				);
				const todayRow = newScroll?.querySelector<HTMLElement>(
					".monthly-list-planner-day-today",
				);
				this.pendingScrollToTodayOnOpen = false;
				if (todayRow) {
					todayRow.scrollIntoView({ block: "center", behavior: "auto" });
				}
			});
		});
	}

	private handleListClickAt(
		clientX: number,
		clientY: number,
		e: Event,
	): void {
		const elements = this.contentEl.ownerDocument.elementsFromPoint(
			clientX,
			clientY,
		);
		for (const el of elements) {
			if (!this.contentEl.contains(el)) continue;
			const h = el as HTMLElement;
			const dailyDate = h.closest?.("[data-daily-date]");
			if (dailyDate instanceof HTMLElement) {
				const parts = dailyDate.dataset.dailyDate?.split("-").map(Number);
				if (parts?.[0] && parts[1] && parts[2]) {
					e.preventDefault();
					e.stopPropagation();
					this.openDailyPlanner(parts[0], parts[1], parts[2]);
				}
				return;
			}

			const externalEventEl = h.closest?.("[data-external-event-id]");
			if (externalEventEl) {
				const eventId = (externalEventEl as HTMLElement).dataset
					.externalEventId;
				if (eventId) {
					e.preventDefault();
					this.openExternalEventModal(eventId);
				}
				return;
			}

			const rangeBar = h.closest?.(".monthly-planner-range-bar[data-path]");
			if (rangeBar && !this.isRangeBarInteractionEnabled()) {
				const dayBlock = (rangeBar as HTMLElement).closest(
					".monthly-list-planner-day[data-year][data-month][data-day]",
				);
				if (dayBlock instanceof HTMLElement) {
					const year = parseInt(dayBlock.dataset.year ?? "", 10);
					const month = parseInt(dayBlock.dataset.month ?? "", 10);
					const day = parseInt(dayBlock.dataset.day ?? "", 10);
					if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
						e.preventDefault();
						e.stopPropagation();
						e.stopImmediatePropagation();
						this.openCreateFileModal({
							startYear: year,
							startMonth: month,
							startDay: day,
							endYear: year,
							endMonth: month,
							endDay: day,
						});
					}
				}
				return;
			}
			if (rangeBar) {
				const path = (rangeBar as HTMLElement).dataset.path;
				if (path) {
					e.preventDefault();
					const file = this.app.vault.getAbstractFileByPath(path);
					if (file instanceof TFile) {
						this.openFileOptionsModal(file);
					}
				}
				return;
			}

			const cellFile = h.closest?.(".monthly-planner-cell-file[data-path]");
			if (cellFile) {
				const path = (cellFile as HTMLElement).dataset.path;
				if (path) {
					e.preventDefault();
					const file = this.app.vault.getAbstractFileByPath(path);
					if (file instanceof TFile) {
						this.openFileOptionsModal(file);
					}
				}
				return;
			}

			const holidayBadge = h.closest?.(".monthly-planner-cell-holiday-badge");
			if (holidayBadge) {
				const dateStr = (holidayBadge as HTMLElement).dataset.holidayDate;
				const namesJson = (holidayBadge as HTMLElement).dataset
					.holidayNames;
				if (dateStr) {
					e.preventDefault();
					let names: string[] = [];
					try {
						if (namesJson) names = JSON.parse(namesJson) as string[];
					} catch {
						// ignore
					}
					new HolidayInfoModal(this.app, dateStr, names).open();
				}
				return;
			}

			const dayBlock = h.closest?.(
				".monthly-list-planner-day[data-year][data-month][data-day]",
			);
			if (dayBlock) {
				const year = parseInt(
					(dayBlock as HTMLElement).dataset.year ?? "",
					10,
				);
				const month = parseInt(
					(dayBlock as HTMLElement).dataset.month ?? "",
					10,
				);
				const day = parseInt(
					(dayBlock as HTMLElement).dataset.day ?? "",
					10,
				);
				if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
					e.preventDefault();
					this.openCreateFileModal({
						startYear: year,
						startMonth: month,
						startDay: day,
						endYear: year,
						endMonth: month,
						endDay: day,
					});
				}
				return;
			}
		}
	}

	private handleListKeyDown(e: KeyboardEvent): void {
		if (e.key !== "Enter" && e.key !== " ") return;
		const target = e.target;
		if (!(target instanceof HTMLElement)) return;
		const dailyTarget = target.closest<HTMLElement>("[data-daily-date]");
		if (dailyTarget?.dataset.dailyDate) {
			const [year, month, day] = dailyTarget.dataset.dailyDate
				.split("-")
				.map(Number);
			if (year == null || month == null || day == null) return;
			e.preventDefault();
			this.openDailyPlanner(year, month, day);
			return;
		}
		const directTarget = target.closest(
			".monthly-planner-cell-file, .monthly-planner-range-bar, .monthly-planner-cell-holiday-badge, .planner-external-event-chip, .planner-external-event-range",
		);
		if (directTarget instanceof HTMLElement) {
			const rect = directTarget.getBoundingClientRect();
			e.preventDefault();
			this.handleListClickAt(
				rect.left + rect.width / 2,
				rect.top + rect.height / 2,
				e,
			);
			return;
		}
		const dayBlock = target.closest(
			".monthly-list-planner-day[data-year][data-month][data-day]",
		);
		if (!(dayBlock instanceof HTMLElement)) return;
		const rect = dayBlock.getBoundingClientRect();
		e.preventDefault();
		this.handleListClickAt(
			rect.left + rect.width / 2,
			rect.top + rect.height / 2,
			e,
		);
	}

	render(): void {
		const { contentEl } = this;
		this.compactLayout = this.shouldUseCompactLayout();
		const shouldScrollToToday = this.pendingScrollToToday;
		this.pendingScrollToToday = false;
		/* Open-scroll runs via queueInitialScrollToToday, not here (avoids setState re-render reset). */
		const wantScrollToToday = shouldScrollToToday;
		const scrollEl = contentEl.querySelector<HTMLElement>(
			".monthly-list-planner-scroll",
		);
		const scrollTop = shouldScrollToToday
			? 0
			: (scrollEl?.scrollTop ?? 0);

		const planNoteWrapper = detachReusablePlanNotePanel(contentEl, {
			year: this.year,
			month: this.month,
		});

		contentEl.empty();
		const pad = this.plugin.settings.mobileBottomPadding ?? 3.5;
		setupPlannerContainer(contentEl, {
			className: "monthly-list-planner-container",
			compactClassName: "monthly-list-planner-container-compact",
			compact: this.compactLayout,
			mobilePadding: pad,
			mobilePaddingProperty: "--monthly-list-planner-mobile-bottom-padding",
		});

		this.renderHeader(contentEl);
		mountPlanNotePanel(contentEl, {
			period: { year: this.year, month: this.month },
			preserved: planNoteWrapper,
			expanded: this.plugin.isPlanNotePanelExpanded(),
			render: (container) => this.renderMonthNotePanel(container),
		});
		this.renderListFilters(contentEl);
		this.renderList(contentEl);

		const newScroll = contentEl.querySelector<HTMLElement>(
			".monthly-list-planner-scroll",
		);
		if (newScroll) {
			if (wantScrollToToday) {
				newScroll.scrollTop = 0;
				window.requestAnimationFrame(() => {
					window.requestAnimationFrame(() => {
						const todayRow = newScroll.querySelector<HTMLElement>(
							".monthly-list-planner-day-today",
						);
						if (todayRow) {
							todayRow.scrollIntoView({
								block: "center",
								behavior: shouldScrollToToday ? "smooth" : "auto",
							});
						}
					});
				});
			} else {
				newScroll.scrollTop = scrollTop;
				window.requestAnimationFrame(() => {
					window.requestAnimationFrame(() => {
						newScroll.scrollTop = scrollTop;
					});
				});
			}
		}
	}

	private async renderMonthNotePanel(container: HTMLElement): Promise<void> {
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const filePath = getMonthNoteFilePath(folder, this.year, this.month);
		const locale = this.plugin.settings.locale ?? "en";
		const monthLabel = getMonthLabel(locale, this.month);
		const label = `${monthLabel} ${this.year}`;
		await renderPlanNotePanel(container, this.app, filePath, this, {
			label,
			expanded: this.plugin.isPlanNotePanelExpanded(),
			onToggle: () => void this.plugin.togglePlanNotePanelExpanded(),
			onCreate: async () => {
				const dir = filePath.split("/").slice(0, -1).join("/");
				if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
					await this.app.vault.createFolder(dir);
				}
				const newFile = await this.app.vault.create(
					filePath,
					`# ${label}\n\n`,
				);
				await this.plugin.openPlannerFile(this.leaf, newFile);
				this.render();
			},
			onOpen: (file) => {
				void this.plugin.openPlannerFile(this.leaf, file);
			},
		});
	}

	private renderListFilters(contentEl: HTMLElement): void {
		const options: { value: MonthlyListFilter; label: string }[] = [
			{ value: "all", label: t("monthlyListFilter.all") },
			{ value: "withNotes", label: t("monthlyListFilter.withNotes") },
			{ value: "upcoming", label: t("monthlyListFilter.upcoming") },
		];
		renderPlannerSegmentedControl(contentEl, {
			className: "monthly-list-planner-filter-bar",
			buttonClassName: "monthly-list-planner-filter-btn",
			label: t("monthlyListFilter.label"),
			items: options,
			selected: this.listFilter,
			onSelect: (value) => {
				this.listFilter = value;
				this.render();
			},
		});
	}

	private renderHeader(contentEl: HTMLElement): void {
		const locale = this.plugin.settings.locale ?? "en";
		const monthLabel = getMonthLabel(locale, this.month);
		renderMonthlyPlannerHeader(
			contentEl,
			{
				year: this.year,
				month: this.month,
				monthLabel,
				app: this.app,
			},
			{
				currentViewMode: "monthlyList",
				onSelectPlannerView: (mode) => {
					const now = new Date();
					void this.plugin.selectPlannerView(this.leaf, mode, {
						year: this.year,
						month: this.month,
						day:
							this.year === now.getFullYear() &&
							this.month === now.getMonth() + 1
								? now.getDate()
								: 1,
					});
				},
				onPrev: () => {
					if (this.month === 1) {
						if (this.year > 1900) {
							this.year--;
							this.month = 12;
						}
					} else {
						this.month--;
					}
					this.render();
				},
				onNext: () => {
					if (this.month === 12) {
						if (this.year < 2100) {
							this.year++;
							this.month = 1;
						}
					} else {
						this.month++;
					}
					this.render();
				},
				onToday: () => {
					const now = new Date();
					this.year = now.getFullYear();
					this.month = now.getMonth() + 1;
					this.pendingScrollToToday = true;
					this.render();
				},
				onMonthYearClick: (year, month) => {
					this.year = year;
					this.month = month;
					this.render();
				},
				onAddFile: () => {
					this.openCreateFileModal(null);
				},
				onCyclePlannerView: () => {
					void this.plugin.cyclePlannerView(this.leaf);
				},
			},
		);
	}

	private openCreateFileModal(bounds: SelectionBounds | null): void {
		const defaultFolder = this.plugin.settings.plannerFolder || "Planner";
		new CreateFileModal(this.app, {
			bounds,
			defaultFolder,
			plannerFileScope: this.plugin.settings.plannerFileScope ?? "vault",
			calendarOverlay: getCalendarOverlayConfig(this.plugin.settings),
			createSingleDateFile: (
				folder,
				basename,
				color,
				todo,
				notifyMinutes,
				timeRange,
				recurrence,
			) =>
				createSingleDateFileOp(
					this.app,
					folder,
					basename,
					color,
					todo,
					notifyMinutes,
					timeRange,
					recurrence,
				),
			createRangeFile: (
				folder,
				basename,
				color,
				todo,
				notifyMinutes,
				timeRange,
				recurrence,
			) =>
				createRangeFileOp(
					this.app,
					folder,
					basename,
					color,
					todo,
					notifyMinutes,
					timeRange,
					recurrence,
				),
			onCreated: () => this.render(),
			openCreatedFile: (file) =>
				this.plugin.openPlannerFile(this.leaf, file),
		}).open();
	}

	private openDailyPlanner(year: number, month: number, day: number): void {
		void this.plugin.selectPlannerView(this.leaf, "daily", {
			year,
			month,
			day,
		});
	}

	private openFileOptionsModal(file: TFile): void {
		new FileOptionsModal(
			this.app,
			file,
			this.leaf,
			() => this.render(),
			(openFile) => this.plugin.openPlannerFile(this.leaf, openFile),
			getCalendarOverlayConfig(this.plugin.settings),
		).open();
	}

	private openExternalEventModal(eventId: string): void {
		const event =
			this.visibleExternalEventsById.get(eventId) ??
			this.getVisibleExternalEvents().find((item) => item.id === eventId);
		if (!event) return;
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
			readOnlyHint: recurrenceEvent
				? t("recurrence.virtualHint")
				: undefined,
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

	private renderList(contentEl: HTMLElement): void {
		const scrollContainer = contentEl.createDiv({
			cls: "monthly-list-planner-scroll",
		});
		scrollContainer.addEventListener(
			"click",
			(e: MouseEvent) => {
				if (Platform.isMobile) return;
				this.handleListClickAt(e.clientX, e.clientY, e);
			},
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"touchstart",
			(e: TouchEvent) => {
				if (!Platform.isMobile) return;
				if (e.touches.length >= 2) {
					this.touchStartPos = null;
					return;
				}
				const t = e.touches[0];
				if (t) {
					this.touchStartPos = { x: t.clientX, y: t.clientY };
				}
			},
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"touchcancel",
			() => {
				this.touchStartPos = null;
			},
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"touchend",
			(e: TouchEvent) => {
				if (!Platform.isMobile) return;
				const t = e.changedTouches[0];
				if (!t) return;
				if (!this.touchStartPos) return;
				const dx = t.clientX - this.touchStartPos.x;
				const dy = t.clientY - this.touchStartPos.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				this.touchStartPos = null;
				if (dist > 15) return;
				e.preventDefault();
				this.handleListClickAt(t.clientX, t.clientY, e);
			},
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"keydown",
			(e: KeyboardEvent) => this.handleListKeyDown(e),
			{ capture: true },
		);

		const inner = scrollContainer.createDiv({ cls: "monthly-list-planner-inner" });
		const locale = this.plugin.settings.locale ?? "en";
		const { showHolidays, holidayCountry } = this.plugin.settings;
		const holidaysData =
			showHolidays && holidayCountry
				? getHolidaysForYear(holidayCountry, this.year)
				: null;
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const plannerFileScope = this.plugin.settings.plannerFileScope ?? "vault";
		const plannerFiles = getPlannerMarkdownFiles(
			this.app,
			folder,
			plannerFileScope,
		);
		const externalEvents = getExternalEventsForRange(
			this.app,
			this.plugin.settings,
			this.getVisibleRange(),
			this.compactLayout ? "sidebar" : "monthlyList",
			plannerFiles,
		);
		const recurrenceEvents = getRecurrenceVirtualEventsForRange({
			app: this.app,
			plannerFiles,
			range: this.getVisibleRange(),
		});
		const overlayEvents = [...externalEvents, ...recurrenceEvents];
		this.visibleExternalEventsById = createExternalEventLookup(overlayEvents);
		renderMonthlyListBody(inner, {
			year: this.year,
			month: this.month,
			app: this.app,
			folder,
			plannerFileScope,
			plannerFiles,
			locale,
			holidaysData,
			calendarOverlay: getCalendarOverlayConfig(this.plugin.settings),
			externalEvents: overlayEvents,
			filter: this.listFilter,
		});
	}

	private getVisibleExternalEvents(): ExternalCalendarEvent[] {
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const plannerFileScope = this.plugin.settings.plannerFileScope ?? "vault";
		const plannerFiles = getPlannerMarkdownFiles(
			this.app,
			folder,
			plannerFileScope,
		);
		const range = this.getVisibleRange();
		return [
			...getExternalEventsForRange(
				this.app,
				this.plugin.settings,
				range,
				this.compactLayout ? "sidebar" : "monthlyList",
				plannerFiles,
			),
			...getRecurrenceVirtualEventsForRange({
				app: this.app,
				plannerFiles,
				range,
			}),
		];
	}

	private getVisibleRange(): { start: string; end: string } {
		return {
			start: `${this.year}-${String(this.month).padStart(2, "0")}-01`,
			end: `${this.year}-${String(this.month).padStart(2, "0")}-${String(
				getDaysInMonth(this.year, this.month),
			).padStart(2, "0")}`,
		};
	}

	private shouldUseCompactLayout(): boolean {
		if (Platform.isMobile) return true;
		if (this.isInSidebar()) return true;
		const width = this.getAvailableLayoutWidth();
		if (width <= 0) return this.compactLayout;
		return width <= PLANNER_COMPACT_LAYOUT_MAX_WIDTH;
	}

	private isInSidebar(): boolean {
		return Boolean(
			this.contentEl.closest(".mod-left-split, .mod-right-split"),
		);
	}

	private getAvailableLayoutWidth(): number {
		const leafEl = this.contentEl.closest(".workspace-leaf");
		const widths = [
			this.contentEl.clientWidth,
			this.contentEl.parentElement?.clientWidth ?? 0,
			leafEl instanceof HTMLElement ? leafEl.clientWidth : 0,
		];
		return widths.find((width) => width > 0) ?? 0;
	}

	private attachResizeObserver(): void {
		if (this.resizeObserver) return;
		const ResizeObserverCtor =
			this.contentEl.ownerDocument.defaultView?.ResizeObserver;
		if (!ResizeObserverCtor) return;

		this.resizeObserver = new ResizeObserverCtor(() => {
			const nextCompactLayout = this.shouldUseCompactLayout();
			if (nextCompactLayout === this.compactLayout) return;
			this.compactLayout = nextCompactLayout;
			this.render();
		});
		this.resizeObserver.observe(this.contentEl);
		const leafEl = this.contentEl.closest(".workspace-leaf");
		if (leafEl instanceof HTMLElement) {
			this.resizeObserver.observe(leafEl);
		}
	}
}

function createExternalEventLookup(
	events: ExternalCalendarEvent[],
): Map<string, ExternalCalendarEvent> {
	return new Map(events.map((event) => [event.id, event]));
}
