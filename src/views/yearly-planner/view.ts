import { ItemView, TFile, WorkspaceLeaf } from "obsidian";
import { t } from "../../i18n";
import DiaryObsidian from "../../main";
import { VIEW_TYPE_YEARLY_PLANNER } from "../../constants";
import type { YearlyPlannerState, DragState, SelectionBounds } from "./types";
import {
	renderYearlyPlannerHeader,
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
	getYearNoteFilePath,
} from "./file-utils";
import { renderPlanNotePanel } from "../plan-note-panel";

export type { YearlyPlannerState } from "./types";

export class YearlyPlannerView
	extends ItemView
	implements YearlyPlannerViewDelegate
{
	year: number;
	dragState: DragState | null = null;
	private interactionHandler: PlannerInteractionHandler;

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
		return { year: this.year };
	}

	async setState(
		state: YearlyPlannerState,
		result: { history: boolean },
	): Promise<void> {
		if (state?.year) {
			this.year = state.year;
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
			".yearly-planner-scroll",
		);
		const scrollTop = scrollEl?.scrollTop ?? 0;
		const scrollLeft = scrollEl?.scrollLeft ?? 0;

		contentEl.empty();
		contentEl.addClass("yearly-planner-container");

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
		const notePanelEl = contentEl.createDiv({
			cls: "plan-note-panel-wrapper",
		});
		void this.renderYearNotePanel(notePanelEl);
		this.renderTable(contentEl);

		const newScrollEl = contentEl.querySelector<HTMLElement>(
			".yearly-planner-scroll",
		);
		if (newScrollEl) {
			newScrollEl.scrollTop = scrollTop;
			newScrollEl.scrollLeft = scrollLeft;
		}
	}

	private async renderYearNotePanel(container: HTMLElement): Promise<void> {
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const filePath = getYearNoteFilePath(folder, this.year);
		await renderPlanNotePanel(container, this.app, filePath, this, {
			label: String(this.year),
			onCreate: async () => {
				const dir = filePath.split("/").slice(0, -1).join("/");
				if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
					await this.app.vault.createFolder(dir);
				}
				const newFile = await this.app.vault.create(
					filePath,
					`# ${this.year}\n\n`,
				);
				await this.leaf.openFile(newFile);
				this.render();
			},
			onOpen: (file) => {
				void this.leaf.openFile(file);
			},
		});
	}

	private renderHeader(contentEl: HTMLElement): void {
		const locale = this.plugin.settings.locale ?? "en";
		renderYearlyPlannerHeader(
			contentEl,
			{
				year: this.year,
				monthLabels: getMonthLabels(locale),
				app: this.app,
			},
			{
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

		const tableParent = scrollContainer.createDiv({
			cls: "yearly-planner-table-wrapper",
		});

		const table = tableParent.createEl("table", {
			cls: "yearly-planner-table",
		});

		const monthLabels = getMonthLabels(this.plugin.settings.locale ?? "en");
		const thead = table.createEl("thead");
		const headerRow = thead.createEl("tr");
		headerRow.createEl("th", { cls: "yearly-planner-corner" });
		for (let m = 0; m < 12; m++) {
			headerRow.createEl("th", { text: monthLabels[m] });
		}

		const tbody = table.createEl("tbody");
		const folder = this.plugin.settings.plannerFolder || "Planner";
		const { showHolidays, holidayCountry } = this.plugin.settings;
		const holidaysData =
			showHolidays && holidayCountry
				? getHolidaysForYear(holidayCountry, this.year)
				: null;
		const ranges = getRangesForYear(this.app, this.year);
		const rangeLaneMap = getRangeLaneMap(ranges);
		const cellCtx = {
			year: this.year,
			app: this.app,
			folder,
			dragState: this.dragState,
			holidaysData,
			locale: this.plugin.settings.locale ?? "en",
			rangeLaneMap,
		};

		for (let day = 1; day <= 31; day++) {
			const row = tbody.createEl("tr");
			row.createEl("th", { text: String(day) });
			for (let month = 1; month <= 12; month++) {
				createPlannerCell(row, day, month, cellCtx);
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
		await openDateNoteOp(this.app, this.leaf, folder, year, month, day);
	}

	openCreateFileModal(bounds: SelectionBounds | null): void {
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
