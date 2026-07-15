import { ItemView, Notice, Platform, TFile, WorkspaceLeaf } from "obsidian";
import { t } from "../../i18n";
import DiaryObsidian from "../../main";
import { VIEW_TYPE_YEARLY_PLANNER } from "../../constants";
import type {
	ChipDragState,
	YearlyPlannerState,
	DragState,
	SelectionBounds,
} from "./types";
import {
	renderYearlyPlannerHeader,
	createMonthHeaderCell,
	createPlannerCell,
	getMonthLabels,
} from "./render";
import {
	openDateNote as openDateNoteOp,
	createRangeFile as createRangeFileOp,
	createSingleDateFile as createSingleDateFileOp,
} from "./file-operations";
import {
	PlannerInteractionHandler,
	type YearlyPlannerViewDelegate,
} from "./interactions";
import { CreateFileModal, FileOptionsModal } from "./modals";
import { getSelectionBounds } from "./selection";
import { getHolidaysForYear } from "../../utils/holidays";
import {
	getRangesForYear,
	getRangeLaneMap,
	getPlannerMarkdownFiles,
	getYearNoteFilePath,
} from "./file-utils";
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
	renderPlanNotePanel,
	syncPlanNotePanelExpandedState,
} from "../plan-note-panel";
import {
	copyPlannerSelectionToClipboard,
	isPrimaryMod,
	openPlannerClipboardSelectionTrashModal,
	PLANNER_CLIPBOARD_BUSY_CLASS,
	PLANNER_CLIPBOARD_ERROR_NOTICE_MS,
	PLANNER_CLIPBOARD_SUCCESS_NOTICE_MS,
	pastePlannerClipboard,
	resolveClipboardSelectionToFiles,
	shouldDeferPlannerClipboardToNative,
	undoPlannerPasteBatch,
} from "../planner-clipboard";
import { PLANNER_COMPACT_LAYOUT_MAX_WIDTH } from "../planner-layout";

export type { YearlyPlannerState } from "./types";

const YEARLY_PLANNER_EXPANDED_CELL_WIDTH_REM = 11;
const YEARLY_PLANNER_DEFAULT_DESKTOP_CELL_WIDTH_REM = 5.25;
const YEARLY_PLANNER_DAY_COLUMN_WIDTH_REM = 3;

export class YearlyPlannerView
	extends ItemView
	implements YearlyPlannerViewDelegate
{
	year: number;
	dragState: DragState | null = null;
	chipDragState: ChipDragState | null = null;
	clipboardSelection = new Set<string>();
	private monthCellWidths = new Map<number, number>();
	private interactionHandler: PlannerInteractionHandler;
	private clipboardKeydownRegistered = false;
	private compactLayout = Platform.isMobile;
	private resizeObserver: ResizeObserver | null = null;
	private visibleExternalEventsById = new Map<string, ExternalCalendarEvent>();
	/** LIFO stack of paths created by each Cmd/Ctrl+V paste (for Cmd/Ctrl+Z undo). */
	private pasteUndoBatches: string[][] = [];
	private boundClipboardKeydown = (e: KeyboardEvent) => {
		this.handleClipboardKeydown(e);
	};

	constructor(
		leaf: WorkspaceLeaf,
		public plugin: DiaryObsidian,
	) {
		super(leaf);
		this.year = new Date().getFullYear();
		this.navigation = false;
		this.interactionHandler = new PlannerInteractionHandler(this);
	}

	getViewType(): string {
		return VIEW_TYPE_YEARLY_PLANNER;
	}

	getDisplayText(): string {
		return t("view.displayText", { year: this.year });
	}

	getState(): YearlyPlannerState {
		return {
			year: this.year,
			cellWidthExpanded: this.areAllMonthCellWidthsExpanded(),
			monthCellWidths: this.serializeMonthCellWidths(),
		};
	}

	async setState(
		state: YearlyPlannerState,
		result: { history: boolean },
	): Promise<void> {
		if (state?.year) {
			this.year = state.year;
		}
		this.syncMonthCellWidthsFromSettings();
		this.render();
		await super.setState(state, result);
	}

	onOpen(): Promise<void> {
		if (!this.clipboardKeydownRegistered) {
			this.registerDomEvent(window, "keydown", this.boundClipboardKeydown, {
				capture: true,
			});
			this.clipboardKeydownRegistered = true;
		}
		this.attachResizeObserver();
		this.render();
		return Promise.resolve();
	}

	onClose(): Promise<void> {
		this.interactionHandler.clearDragListeners();
		this.resizeObserver?.disconnect();
		this.resizeObserver = null;
		this.clipboardSelection.clear();
		this.pasteUndoBatches.length = 0;
		return Promise.resolve();
	}

	isRangeBarInteractionEnabled(): boolean {
		return true;
	}

	private hasExpandedMonthCells(): boolean {
		return this.monthCellWidths.size > 0;
	}

	private syncMonthCellWidthsFromSettings(): void {
		this.monthCellWidths = this.normalizeMonthCellWidths(
			this.plugin.getYearlyPlannerExpandedMonths(),
		);
	}

	private areAllMonthCellWidthsExpanded(): boolean {
		if (this.monthCellWidths.size !== 12) return false;
		for (let month = 1; month <= 12; month++) {
			if (
				this.monthCellWidths.get(month) !==
				YEARLY_PLANNER_EXPANDED_CELL_WIDTH_REM
			) {
				return false;
			}
		}
		return true;
	}

	private serializeMonthCellWidths(): Record<string, number> | undefined {
		if (this.monthCellWidths.size === 0) return undefined;
		const state: Record<string, number> = {};
		for (const [month, width] of this.monthCellWidths.entries()) {
			state[String(month)] = width;
		}
		return state;
	}

	private normalizeMonthCellWidths(value: unknown): Map<number, number> {
		const widths = new Map<number, number>();
		if (Array.isArray(value)) {
			for (const monthValue of value) {
				const month = Number(monthValue);
				if (Number.isInteger(month) && month >= 1 && month <= 12) {
					widths.set(month, YEARLY_PLANNER_EXPANDED_CELL_WIDTH_REM);
				}
			}
			return widths;
		}
		if (!value || typeof value !== "object") return widths;
		for (const [monthKey, widthValue] of Object.entries(value)) {
			const month = Number(monthKey);
			const width = Number(widthValue);
			if (
				Number.isInteger(month) &&
				month >= 1 &&
				month <= 12 &&
				Number.isFinite(width)
			) {
				widths.set(month, YEARLY_PLANNER_EXPANDED_CELL_WIDTH_REM);
			}
		}
		return widths;
	}

	private setAllMonthCellWidths(width: number): void {
		for (let month = 1; month <= 12; month++) {
			this.monthCellWidths.set(month, width);
		}
	}

	private getExpandedMonths(): number[] {
		return Array.from(this.monthCellWidths.keys()).sort((a, b) => a - b);
	}

	private persistMonthCellWidths(): void {
		void this.plugin.setYearlyPlannerExpandedMonths(this.getExpandedMonths());
	}

	private toggleAllMonthCellWidths(): void {
		if (this.hasExpandedMonthCells()) {
			this.monthCellWidths.clear();
		} else {
			this.setAllMonthCellWidths(YEARLY_PLANNER_EXPANDED_CELL_WIDTH_REM);
		}
		this.persistMonthCellWidths();
		this.render();
	}

	private toggleMonthCellWidth(month: number): void {
		if (month < 1 || month > 12) return;
		if (this.monthCellWidths.has(month)) {
			this.monthCellWidths.delete(month);
		} else {
			this.monthCellWidths.set(month, YEARLY_PLANNER_EXPANDED_CELL_WIDTH_REM);
		}
		this.persistMonthCellWidths();
		this.render();
	}

	private getBaseMonthCellWidthRem(): number {
		if (!this.compactLayout) return YEARLY_PLANNER_DEFAULT_DESKTOP_CELL_WIDTH_REM;
		const configured = this.plugin.settings.mobileCellWidth ?? 0;
		return configured > 0 ? configured : 4.5;
	}

	private getEffectiveMonthCellWidths(): number[] | null {
		if (!this.hasExpandedMonthCells()) return null;
		const base = this.getBaseMonthCellWidthRem();
		return Array.from({ length: 12 }, (_, index) => {
			const month = index + 1;
			return this.monthCellWidths.get(month) ?? base;
		});
	}

	private applyCellWidth(el: HTMLElement, widthRem: number): void {
		el.style.minWidth = `${widthRem}rem`;
		el.style.width = `${widthRem}rem`;
	}

	/** Update chip-drag state without full render: add chip-dragging class and drop-target. */
	updateChipDragDropTarget(): void {
		if (this.chipDragState) {
			this.contentEl.addClass("yearly-planner-chip-dragging");
			const { currentYear, currentMonth, currentDay } = this.chipDragState;
			const cells = this.contentEl.querySelectorAll(
				"td[data-year][data-month][data-day]:not(.yearly-planner-cell-invalid)",
			);
			for (const cell of Array.from(cells)) {
				const y = parseInt(cell.getAttribute("data-year") ?? "", 10);
				const m = parseInt(cell.getAttribute("data-month") ?? "", 10);
				const d = parseInt(cell.getAttribute("data-day") ?? "", 10);
				(cell as HTMLElement).toggleClass(
					"yearly-planner-cell-drop-target",
					y === currentYear && m === currentMonth && d === currentDay,
				);
			}
		} else {
			this.contentEl.removeClass("yearly-planner-chip-dragging");
			this.contentEl
				.querySelectorAll(".yearly-planner-cell-drop-target")
				.forEach((el) =>
					(el as HTMLElement).removeClass("yearly-planner-cell-drop-target"),
				);
		}
	}

	render(): void {
		const { contentEl } = this;
		this.compactLayout = this.shouldUseCompactLayout();
		this.syncMonthCellWidthsFromSettings();
		const scrollEl = contentEl.querySelector<HTMLElement>(
			".yearly-planner-scroll",
		);
		const scrollTop = scrollEl?.scrollTop ?? 0;
		const scrollLeft = scrollEl?.scrollLeft ?? 0;

		const planNoteWrapper = contentEl.querySelector<HTMLElement>(
			".plan-note-panel-wrapper",
		);
		const preservePlanNote =
			planNoteWrapper &&
			planNoteWrapper.hasChildNodes() &&
			planNoteWrapper.dataset.year === String(this.year);
		if (preservePlanNote) planNoteWrapper.remove();

		contentEl.empty();
		contentEl.addClass("yearly-planner-container");
		contentEl.toggleClass("planner-container-compact", this.compactLayout);
		contentEl.toggleClass(
			"yearly-planner-container-compact",
			this.compactLayout,
		);
		contentEl.toggleClass(
			"yearly-planner-has-expanded-months",
			this.hasExpandedMonthCells(),
		);
		if (this.chipDragState) {
			contentEl.addClass("yearly-planner-chip-dragging");
		} else {
			contentEl.removeClass("yearly-planner-chip-dragging");
		}

		const pad = this.plugin.settings.mobileBottomPadding ?? 3.5;
		contentEl.style.setProperty(
			"--yearly-planner-mobile-bottom-padding",
			`${pad}rem`,
		);

		const cellWidth = this.plugin.settings.mobileCellWidth ?? 0;
		if (cellWidth > 0) {
			contentEl.style.setProperty(
				"--yearly-planner-mobile-cell-width",
				`${cellWidth}rem`,
			);
		} else {
			contentEl.style.removeProperty(
				"--yearly-planner-mobile-cell-width",
			);
		}

		this.renderHeader(contentEl);
		if (preservePlanNote && planNoteWrapper) {
			contentEl.appendChild(planNoteWrapper);
			syncPlanNotePanelExpandedState(
				planNoteWrapper,
				this.plugin.isPlanNotePanelExpanded(),
			);
		} else {
			const notePanelEl = contentEl.createDiv({
				cls: "plan-note-panel-wrapper",
			});
			notePanelEl.dataset.year = String(this.year);
			void this.renderYearNotePanel(notePanelEl);
		}
		this.renderTable(contentEl);

		const newScrollEl = contentEl.querySelector<HTMLElement>(
			".yearly-planner-scroll",
		);
		if (newScrollEl) {
			newScrollEl.scrollTop = scrollTop;
			newScrollEl.scrollLeft = scrollLeft;
			window.requestAnimationFrame(() => {
				window.requestAnimationFrame(() => {
					newScrollEl.scrollTop = scrollTop;
					newScrollEl.scrollLeft = scrollLeft;
				});
			});
		}
	}

	private async renderYearNotePanel(container: HTMLElement): Promise<void> {
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const filePath = getYearNoteFilePath(folder, this.year);
		await renderPlanNotePanel(container, this.app, filePath, this, {
			label: String(this.year),
			expanded: this.plugin.isPlanNotePanelExpanded(),
			onToggle: () => void this.plugin.togglePlanNotePanelExpanded(),
			onCreate: async () => {
				const dir = filePath.split("/").slice(0, -1).join("/");
				if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
					await this.app.vault.createFolder(dir);
				}
				const newFile = await this.app.vault.create(
					filePath,
					`# ${this.year}\n\n`,
				);
				await this.plugin.openPlannerFile(this.leaf, newFile);
				this.render();
			},
			onOpen: (file) => {
				void this.plugin.openPlannerFile(this.leaf, file);
			},
		});
	}

	private renderHeader(contentEl: HTMLElement): void {
		renderYearlyPlannerHeader(
			contentEl,
			{
				year: this.year,
				app: this.app,
			},
			{
				onSelectPlannerView: (mode) => {
					const now = new Date();
					void this.plugin.selectPlannerView(this.leaf, mode, {
						year: this.year,
						month: now.getFullYear() === this.year ? now.getMonth() + 1 : 1,
						day: now.getFullYear() === this.year ? now.getDate() : 1,
					});
				},
				onPrev: () => {
					if (this.year > 1900) {
						this.year--;
						this.render();
					}
				},
				onNext: () => {
					if (this.year < 2100) {
						this.year++;
						this.render();
					}
				},
				onToday: () => {
					this.year = new Date().getFullYear();
					this.render();
				},
				onCyclePlannerView: () => {
					void this.plugin.cyclePlannerView(this.leaf);
				},
				hasExpandedMonthCells: this.hasExpandedMonthCells(),
				onToggleAllCellWidths: () => this.toggleAllMonthCellWidths(),
				onYearClick: (year) => {
					this.year = year;
					this.render();
				},
				onAddFile: () => {
					this.openCreateFileModal(
						getSelectionBounds(this.dragState),
					);
				},
			},
		);
	}

	private renderTable(contentEl: HTMLElement): void {
		const scrollContainer = contentEl.createDiv({
			cls: "yearly-planner-scroll",
		});
		scrollContainer.addEventListener(
			"click",
			this.interactionHandler.handlePlannerClick.bind(
				this.interactionHandler,
			),
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"touchend",
			this.interactionHandler.handlePlannerTouchEnd.bind(
				this.interactionHandler,
			),
			{ capture: true, passive: false },
		);
		scrollContainer.addEventListener(
			"touchcancel",
			this.interactionHandler.handlePlannerTouchCancel.bind(
				this.interactionHandler,
			),
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"keydown",
			this.interactionHandler.handlePlannerKeyDown.bind(
				this.interactionHandler,
			),
			{ capture: true },
		);

		const tableParent = scrollContainer.createDiv({
			cls: "yearly-planner-table-wrapper",
		});

		const table = tableParent.createEl("table", {
			cls: "yearly-planner-table",
		});
		const monthCellWidths = this.getEffectiveMonthCellWidths();
		if (monthCellWidths) {
			const tableWidth =
				YEARLY_PLANNER_DAY_COLUMN_WIDTH_REM +
				monthCellWidths.reduce((sum, width) => sum + width, 0);
			table.style.width = `${tableWidth}rem`;
			table.style.minWidth = `${tableWidth}rem`;
		}

		const monthLabels = getMonthLabels(this.plugin.settings.locale ?? "en");
		const thead = table.createEl("thead");
		const headerRow = thead.createEl("tr");
		const corner = headerRow.createEl("th", { cls: "yearly-planner-corner" });
		if (monthCellWidths) {
			this.applyCellWidth(corner, YEARLY_PLANNER_DAY_COLUMN_WIDTH_REM);
		}
		for (let m = 0; m < 12; m++) {
			const month = m + 1;
			const monthLabel = monthLabels[m] ?? String(month);
			createMonthHeaderCell(headerRow, month, monthLabel, {
				widthRem: monthCellWidths?.[m],
				isExpanded: this.monthCellWidths.has(month),
				onOpenMonth: (targetMonth) => {
					void this.plugin.selectPlannerView(this.leaf, "monthly", {
						year: this.year,
						month: targetMonth,
						day: 1,
					});
				},
				onToggleWidth: (targetMonth) =>
					this.toggleMonthCellWidth(targetMonth),
			});
		}

		const tbody = table.createEl("tbody");
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const { showHolidays, holidayCountry } = this.plugin.settings;
		const holidaysData =
			showHolidays && holidayCountry
				? getHolidaysForYear(holidayCountry, this.year)
				: null;
		const plannerFileScope = this.plugin.settings.plannerFileScope ?? "vault";
		const plannerFiles = getPlannerMarkdownFiles(
			this.app,
			folder,
			plannerFileScope,
		);
		const visibleRange = {
			start: `${this.year}-01-01`,
			end: `${this.year}-12-31`,
		};
		const externalEvents = getExternalEventsForRange(
			this.app,
			this.plugin.settings,
			visibleRange,
			"yearly",
			plannerFiles,
		);
		const recurrenceEvents = getRecurrenceVirtualEventsForRange({
			app: this.app,
			plannerFiles,
			range: visibleRange,
		});
		const overlayEvents = [...externalEvents, ...recurrenceEvents];
		this.visibleExternalEventsById = createExternalEventLookup(overlayEvents);
		const ranges = getRangesForYear(
			this.app,
			this.year,
			folder,
			plannerFileScope,
			plannerFiles,
		);
		const rangeLaneMap = getRangeLaneMap(ranges);
		const cellCtx = {
			year: this.year,
			app: this.app,
			folder,
			plannerFileScope,
			plannerFiles,
			dragState: this.dragState,
			chipDragState: this.chipDragState,
			clipboardSelection: this.clipboardSelection,
			holidaysData,
			calendarOverlay: getCalendarOverlayConfig(this.plugin.settings),
			externalEvents: overlayEvents,
			rangeLaneMap,
		};

		for (let day = 1; day <= 31; day++) {
			const row = tbody.createEl("tr");
			const dayHeader = row.createEl("th", { text: String(day) });
			if (monthCellWidths) {
				this.applyCellWidth(
					dayHeader,
					YEARLY_PLANNER_DAY_COLUMN_WIDTH_REM,
				);
			}
			for (let month = 1; month <= 12; month++) {
				const cell = createPlannerCell(row, day, month, cellCtx);
				if (monthCellWidths) {
					const monthWidth =
						monthCellWidths[month - 1] ?? this.getBaseMonthCellWidthRem();
					this.applyCellWidth(cell, monthWidth);
				}
			}
		}
		scrollContainer.addEventListener(
			"mousedown",
			this.interactionHandler.handlePlannerMouseDown.bind(
				this.interactionHandler,
			),
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"touchstart",
			this.interactionHandler.handlePlannerTouchStart.bind(
				this.interactionHandler,
			),
			{ capture: true, passive: false },
		);

		this.interactionHandler.registerRangeHoverListeners(scrollContainer);
	}

	async openDateNote(
		year: number,
		month: number,
		day: number,
	): Promise<void> {
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const leaf = this.plugin.getPlannerFileOpenLeaf(this.leaf);
		await openDateNoteOp(this.app, leaf, folder, year, month, day);
		if (leaf !== this.leaf) {
			await this.app.workspace.revealLeaf(leaf);
		}
	}

	openCreateFileModal(bounds: SelectionBounds | null): void {
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

	openFileOptionsModal(file: TFile): void {
		new FileOptionsModal(
			this.app,
			file,
			this.leaf,
			() => this.render(),
			(openFile) => this.plugin.openPlannerFile(this.leaf, openFile),
			getCalendarOverlayConfig(this.plugin.settings),
		).open();
	}

	openExternalEventModal(eventId: string): void {
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

	private getVisibleExternalEvents(): ExternalCalendarEvent[] {
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const plannerFileScope = this.plugin.settings.plannerFileScope ?? "vault";
		const plannerFiles = getPlannerMarkdownFiles(
			this.app,
			folder,
			plannerFileScope,
		);
		const range = {
			start: `${this.year}-01-01`,
			end: `${this.year}-12-31`,
		};
		return [
			...getExternalEventsForRange(
				this.app,
				this.plugin.settings,
				range,
				"yearly",
				plannerFiles,
			),
			...getRecurrenceVirtualEventsForRange({
				app: this.app,
				plannerFiles,
				range,
			}),
		];
	}

	private handleClipboardKeydown(e: KeyboardEvent): void {
		if (!isPrimaryMod(e) || e.shiftKey) return;
		if (shouldDeferPlannerClipboardToNative(e)) return;
		if (this.app.workspace.getActiveViewOfType(YearlyPlannerView) !== this)
			return;

		const k = e.key.toLowerCase();

		if (k === "backspace" || k === "delete") {
			if (this.clipboardSelection.size === 0) return;
			e.preventDefault();
			openPlannerClipboardSelectionTrashModal(
				this.app,
				resolveClipboardSelectionToFiles(
					this.app,
					this.plugin.settings.plannerFolder || "Planner",
					this.plugin.settings.plannerFileScope ?? "vault",
					this.clipboardSelection,
				),
				this.clipboardSelection,
				() => this.render(),
			);
			return;
		}

		if (k === "z") {
			if (this.pasteUndoBatches.length === 0) {
				new Notice(t("plannerClipboard.undoNothing"));
				e.preventDefault();
				return;
			}
			e.preventDefault();
			const batch = this.pasteUndoBatches.pop()!;
			this.contentEl.addClass(PLANNER_CLIPBOARD_BUSY_CLASS);
			void (async () => {
				try {
					const u = await undoPlannerPasteBatch(this.app, batch);
					this.render();
					if (!u.ok) {
						this.pasteUndoBatches.push(batch);
						new Notice(
							t(u.errorKey, { path: u.path }),
							PLANNER_CLIPBOARD_ERROR_NOTICE_MS,
						);
					} else if (u.trashedCount === 0) {
						new Notice(
							t("plannerClipboard.undoMissingFiles"),
							PLANNER_CLIPBOARD_ERROR_NOTICE_MS,
						);
					} else {
						new Notice(
							t("plannerClipboard.undoSuccess", {
								count: u.trashedCount,
							}),
							PLANNER_CLIPBOARD_SUCCESS_NOTICE_MS,
						);
					}
				} finally {
					this.contentEl.removeClass(PLANNER_CLIPBOARD_BUSY_CLASS);
				}
			})();
			return;
		}

		if (k !== "c" && k !== "v") return;

		if (k === "c") {
			const files = resolveClipboardSelectionToFiles(
				this.app,
				this.plugin.settings.plannerFolder || "Planner",
				this.plugin.settings.plannerFileScope ?? "vault",
				this.clipboardSelection,
			);
			if (files.length === 0) {
				new Notice(t("plannerClipboard.emptyCopy"));
				e.preventDefault();
				return;
			}
			e.preventDefault();
			this.contentEl.addClass(PLANNER_CLIPBOARD_BUSY_CLASS);
			void (async () => {
				try {
					const r = await copyPlannerSelectionToClipboard(
						this.app,
						files,
					);
					if (!r.ok) {
						new Notice(
							t(r.errorKey),
							PLANNER_CLIPBOARD_ERROR_NOTICE_MS,
						);
					} else {
						new Notice(
							t("plannerClipboard.copySuccess", {
								count: r.noteCount,
							}),
							PLANNER_CLIPBOARD_SUCCESS_NOTICE_MS,
						);
					}
				} finally {
					this.contentEl.removeClass(PLANNER_CLIPBOARD_BUSY_CLASS);
				}
			})();
			return;
		}

		if (this.clipboardSelection.size === 0) return;
		e.preventDefault();
		this.contentEl.addClass(PLANNER_CLIPBOARD_BUSY_CLASS);
		void (async () => {
			try {
				const r = await pastePlannerClipboard(
					this.app,
					this.plugin.settings.plannerFolder || "Planner",
					this.clipboardSelection,
				);
				if (r.ok) {
					this.pasteUndoBatches.push(r.createdPaths);
					this.render();
					new Notice(
						t("plannerClipboard.pasteSuccess", {
							count: r.fileCount,
						}),
						PLANNER_CLIPBOARD_SUCCESS_NOTICE_MS,
					);
				} else {
					new Notice(t(r.errorKey), PLANNER_CLIPBOARD_ERROR_NOTICE_MS);
				}
			} catch {
				new Notice(
					t("plannerClipboard.pasteFailed"),
					PLANNER_CLIPBOARD_ERROR_NOTICE_MS,
				);
			} finally {
				this.contentEl.removeClass(PLANNER_CLIPBOARD_BUSY_CLASS);
			}
		})();
	}
}

function createExternalEventLookup(
	events: ExternalCalendarEvent[],
): Map<string, ExternalCalendarEvent> {
	return new Map(events.map((event) => [event.id, event]));
}
