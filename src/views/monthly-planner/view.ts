import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { t } from "../../i18n";
import DiaryObsidian from "../../main";
import { VIEW_TYPE_MONTHLY_PLANNER } from "../../constants";
import type { MonthlyPlannerState } from "./types";
import { getRangeStackIndexMap } from "../yearly-planner/file-utils";
import {
	renderMonthlyPlannerHeader,
	createMonthlyCell,
	getMonthLabel,
	getWeekdayLabels,
} from "./render";
import {
	openDateNote as openDateNoteOp,
	createRangeFile as createRangeFileOp,
	createSingleDateFile as createSingleDateFileOp,
} from "../yearly-planner/file-operations";
import {
	MonthlyInteractionHandler,
	type MonthlyPlannerViewDelegate,
} from "./interactions";
import { CreateFileModal, FileOptionsModal } from "../yearly-planner/modals";
import { getSelectionBounds } from "../yearly-planner/selection";
import { getHolidaysForYear } from "../../utils/holidays";
import { getMonthCalendarCells } from "../../utils/date";

export type { MonthlyPlannerState } from "./types";

export class MonthlyPlannerView
	extends ItemView
	implements MonthlyPlannerViewDelegate
{
	year: number;
	month: number;
	dragState: import("../yearly-planner/types").DragState | null = null;
	private interactionHandler: MonthlyInteractionHandler;

	constructor(
		leaf: WorkspaceLeaf,
		public plugin: DiaryObsidian,
	) {
		super(leaf);
		const now = new Date();
		this.year = now.getFullYear();
		this.month = now.getMonth() + 1;
		this.navigation = false;
		this.interactionHandler = new MonthlyInteractionHandler(this);
	}

	getViewType(): string {
		return VIEW_TYPE_MONTHLY_PLANNER;
	}

	getDisplayText(): string {
		const locale = this.plugin.settings.locale ?? "en";
		const monthLabel = getMonthLabel(locale, this.month);
		return t("view.monthlyDisplayText", {
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
	}

	async onOpen(): Promise<void> {
		this.render();
	}

	async onClose(): Promise<void> {
		this.interactionHandler.clearDragListeners();
	}

	render(): void {
		const { contentEl } = this;
		const scrollEl = contentEl.querySelector<HTMLElement>(
			".monthly-planner-scroll",
		);
		const scrollTop = scrollEl?.scrollTop ?? 0;
		const scrollLeft = scrollEl?.scrollLeft ?? 0;

		contentEl.empty();
		contentEl.addClass("monthly-planner-container");

		const pad = this.plugin.settings.mobileBottomPadding ?? 3.5;
		contentEl.style.setProperty(
			"--monthly-planner-mobile-bottom-padding",
			`${pad}rem`,
		);

		this.renderHeader(contentEl);
		this.renderTable(contentEl);

		const newScrollEl = contentEl.querySelector<HTMLElement>(
			".monthly-planner-scroll",
		);
		if (newScrollEl) {
			newScrollEl.scrollTop = scrollTop;
			newScrollEl.scrollLeft = scrollLeft;
		}
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
					this.render();
				},
				onMonthYearClick: (year, month) => {
					this.year = year;
					this.month = month;
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
			cls: "monthly-planner-scroll",
		});
		scrollContainer.addEventListener(
			"click",
			this.interactionHandler.handlePlannerClick.bind(
				this.interactionHandler,
			),
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"mouseover",
			this.interactionHandler.handleRangeBarMouseOver.bind(
				this.interactionHandler,
			),
			{ capture: true },
		);
		scrollContainer.addEventListener(
			"mouseout",
			this.interactionHandler.handleRangeBarMouseOut.bind(
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

		const table = scrollContainer.createEl("table", {
			cls: "monthly-planner-table",
		});

		const locale = this.plugin.settings.locale ?? "en";
		const weekdayLabels = getWeekdayLabels(locale);

		const thead = table.createEl("thead");
		const headerRow = thead.createEl("tr");
		for (const label of weekdayLabels) {
			headerRow.createEl("th", { text: label });
		}

		const tbody = table.createEl("tbody");
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const { showHolidays, holidayCountry } = this.plugin.settings;
		const holidaysData =
			showHolidays && holidayCountry
				? getHolidaysForYear(holidayCountry, this.year)
				: null;
		const rangeStackMap = getRangeStackIndexMap(this.app, this.year);
		const cellCtx = {
			app: this.app,
			folder,
			dragState: this.dragState,
			holidaysData,
			locale,
			rangeStackMap,
		};

		const cells = getMonthCalendarCells(this.year, this.month);
		let row: HTMLTableRowElement | null = null;
		for (let i = 0; i < cells.length; i++) {
			if (i % 7 === 0) {
				row = tbody.createEl("tr");
			}
			const cellData = cells[i] ?? null;
			const cell = createMonthlyCell(cellData, cellCtx);
			row?.appendChild(cell);
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
	}

	async openDateNote(
		year: number,
		month: number,
		day: number,
	): Promise<void> {
		const folder = this.plugin.settings.plannerFolder || "Planner";
		await openDateNoteOp(this.app, this.leaf, folder, year, month, day);
	}

	openCreateFileModal(
		bounds: import("../yearly-planner/types").SelectionBounds | null,
	): void {
		const defaultFolder = this.plugin.settings.plannerFolder || "Planner";
		new CreateFileModal(this.app, {
			bounds,
			defaultFolder,
			createSingleDateFile: (folder, basename, color) =>
				createSingleDateFileOp(this.app, folder, basename, color),
			createRangeFile: (folder, basename, color) =>
				createRangeFileOp(this.app, folder, basename, color),
			onCreated: () => this.render(),
		}).open();
	}

	openFileOptionsModal(file: TFile): void {
		new FileOptionsModal(this.app, file, this.leaf, () =>
			this.render(),
		).open();
	}
}
