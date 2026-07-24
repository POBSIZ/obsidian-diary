import {
	App,
	Component,
	MarkdownRenderer,
	Modal,
	Notice,
	TFile,
	WorkspaceLeaf,
} from "obsidian";
import { formatDateForLocale, getLocale, t } from "../../i18n";
import {
	ALTERNATE_CALENDAR_OPTIONS,
	getAlternateCalendarOptionText,
} from "../../utils/alternate-calendars";
import {
	getCalendarOverlayLabel,
	type CalendarOverlayConfig,
} from "../../utils/calendar-overlays";
import {
	RECURRENCE_GREGORIAN,
	buildRecurrenceRuleFromForm,
	getRecurrenceInterval,
	getSimpleRecurrenceFrequency,
	getRecurrenceOccurrenceInfo,
	getRecurrenceRole,
	getRecurrenceSourceDefinition,
	normalizeRecurrenceCalendar,
	addRecurrenceExdate,
	applyRecurrenceSourceFrontmatter,
	detachRecurrenceOccurrence as detachRecurrenceOccurrenceFile,
	type RecurrenceFormValue,
} from "../../utils/recurrence";
import {
	getAllFolderPaths,
	getChipColor,
	getNotifyMinutes,
	getPlannerTimeRange,
	isTodoCompleted,
	isTodoFile,
	type PlannerTimeRange,
	type PlannerFileScope,
} from "./file-utils";
import {
	movePlannerFileToLocation,
	parseSingleDateBasename,
	updateFileColor,
	updateFileNotifyMinutes,
	updateFileTimeRange,
	updateFileTodoStatus,
} from "./file-operations";
import { parseRangeBasename } from "../../utils/range";
import type { SelectionBounds } from "./types";
import {
	createUiButton,
	createUiButtonRow,
	createUiColorPresetButton,
	createUiError,
	createUiFieldRow,
	createUiModalActionBar,
	focusUiInputOnDesktop,
} from "../../ui/components";

/** Additional chip color presets (first preset is theme accent, computed at runtime). No duplicates. */
const CHIP_COLOR_PRESETS_EXTRA: readonly { hex: string }[] = [
	{ hex: "#22c55e" }, // green
	{ hex: "#f59e0b" }, // yellow/orange
	{ hex: "#ec4899" }, // pink
	{ hex: "#6b7280" }, // gray
];

/** Resolves var(--interactive-accent) to 6-digit hex. Falls back to #7c3aed if unavailable. */
function getThemeAccentHex(doc: Document = window.document): string {
	const activeWindow = doc.defaultView ?? window;
	const el = doc.body.createDiv();
	el.setCssProps({ color: "var(--interactive-accent)" });
	const computed = activeWindow.getComputedStyle(el).color;
	el.remove();
	const m = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	if (m) {
		const r = parseInt(m[1] ?? "0", 10);
		const g = parseInt(m[2] ?? "0", 10);
		const b = parseInt(m[3] ?? "0", 10);
		return (
			"#" +
			[r, g, b]
				.map((x) =>
					Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"),
				)
				.join("")
		);
	}
	const m2 = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (m2) {
		const r = parseInt(m2[1] ?? "0", 10);
		const g = parseInt(m2[2] ?? "0", 10);
		const b = parseInt(m2[3] ?? "0", 10);
		return (
			"#" +
			[r, g, b]
				.map((x) =>
					Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"),
				)
				.join("")
		);
	}
	if (toHex6(computed)) return toHex6(computed)!;
	return "#7c3aed";
}

/** Chip color presets: first = theme accent, rest = static. Deduplicates by normalized hex. */
function getChipColorPresets(doc: Document = window.document): { hex: string }[] {
	const themeHex = getThemeAccentHex(doc);
	const all = [{ hex: themeHex }, ...CHIP_COLOR_PRESETS_EXTRA];
	const seen = new Set<string>();
	return all.filter((p) => {
		const normalized = (toHex6(p.hex) ?? p.hex).toLowerCase();
		if (seen.has(normalized)) return false;
		seen.add(normalized);
		return true;
	});
}

/** Max lines to show in file preview. */
const FILE_PREVIEW_MAX_LINES = 20;

/** Max chars to show in file preview (fallback). */
const FILE_PREVIEW_MAX_CHARS = 500;

/** Convert 3-digit hex to 6-digit for color picker. */
function toHex6(hex: string): string | null {
	const m = hex.match(/^#([0-9a-fA-F]{3})$/);
	if (m) {
		const c = m[1] ?? "";
		return `#${c[0]}${c[0]}${c[1]}${c[1]}${c[2]}${c[2]}`;
	}
	const m6 = hex.match(/^#([0-9a-fA-F]{6})$/);
	return m6 ? hex : null;
}

/** Normalize any CSS color to 6-digit hex for comparison. Returns null if invalid. */
function normalizeColorToHex(
	cssColor: string,
	doc: Document = window.document,
): string | null {
	const trimmed = cssColor.trim();
	if (!trimmed) return null;
	const hex = toHex6(trimmed);
	if (hex) return hex.toLowerCase();
	const activeWindow = doc.defaultView ?? window;
	const div = doc.body.createDiv();
	div.style.color = trimmed;
	const computed = activeWindow.getComputedStyle(div).color;
	div.remove();
	if (!computed) return null;
	const m = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	if (m) {
		const r = parseInt(m[1] ?? "0", 10);
		const g = parseInt(m[2] ?? "0", 10);
		const b = parseInt(m[3] ?? "0", 10);
		return (
			"#" +
			[r, g, b]
				.map((x) =>
					Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"),
				)
				.join("")
		);
	}
	const m2 = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (m2) {
		const r = parseInt(m2[1] ?? "0", 10);
		const g = parseInt(m2[2] ?? "0", 10);
		const b = parseInt(m2[3] ?? "0", 10);
		return (
			"#" +
			[r, g, b]
				.map((x) =>
					Math.max(0, Math.min(255, x)).toString(16).padStart(2, "0"),
				)
				.join("")
		);
	}
	return toHex6(computed);
}

export type CreateSingleDateFileFn = (basename: string) => Promise<TFile>;

export type CreateSingleDateFileWithFolderFn = (
	folder: string,
	basename: string,
	color?: string,
	todo?: boolean,
	notifyMinutes?: number | null,
	timeRange?: PlannerTimeRange | null,
	recurrence?: RecurrenceFormValue | null,
) => Promise<TFile>;

export type CreateRangeFileWithFolderFn = (
	folder: string,
	basename: string,
	color?: string,
	todo?: boolean,
	notifyMinutes?: number | null,
	timeRange?: PlannerTimeRange | null,
	recurrence?: RecurrenceFormValue | null,
) => Promise<TFile>;

function formatHolidayDate(dateStr: string): string {
	const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return dateStr;
	const [, y, month, day] = m;
	const yearNum = parseInt(y ?? "", 10);
	const monthNum = parseInt(month ?? "1", 10);
	const dayNum = parseInt(day ?? "1", 10);
	return formatDateForLocale(yearNum, monthNum, dayNum, getLocale());
}

export class HolidayInfoModal extends Modal {
	constructor(
		app: App,
		private dateStr: string,
		private holidayNames: string[],
	) {
		super(app);
	}

	onOpen(): void {
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.createEl("h2", { text: t("modal.holidayTitle") });
		this.contentEl.createEl("p", {
			cls: "yearly-planner-holiday-modal-date",
			text: formatHolidayDate(this.dateStr),
		});
		const namesEl = this.contentEl.createEl("p", {
			cls: "yearly-planner-holiday-modal-names",
		});
		for (const name of this.holidayNames) {
			namesEl.createSpan({
				cls: "yearly-planner-holiday-name",
				text: name,
			});
			if (name !== this.holidayNames[this.holidayNames.length - 1]) {
				namesEl.appendText(", ");
			}
		}
	}
}

const pad = (n: number) => String(n).padStart(2, "0");

function notifyMinutesToTimeValue(mins: number | null): string {
	if (mins == null) return "";
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return `${pad(h)}:${pad(m)}`;
}

function parseTimeValueToNotifyMinutes(value: string): number | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const m = trimmed.match(/^(\d{1,2}):(\d{2})$/);
	if (!m) return null;
	const h = parseInt(m[1] ?? "", 10);
	const min = parseInt(m[2] ?? "", 10);
	if (
		isNaN(h) ||
		isNaN(min) ||
		h < 0 ||
		h > 23 ||
		min < 0 ||
		min > 59
	) {
		return null;
	}
	return h * 60 + min;
}

function normalizeTimeValue(value: string): string | null {
	const minutes = parseTimeValueToNotifyMinutes(value);
	return minutes == null ? null : notifyMinutesToTimeValue(minutes);
}

function toDateStr(year: number, month: number, day: number): string {
	return `${year}-${pad(month)}-${pad(day)}`;
}

function parseDateStr(str: string): {
	year: number;
	month: number;
	day: number;
} | null {
	const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!m) return null;
	const year = parseInt(m[1] ?? "", 10);
	const month = parseInt(m[2] ?? "", 10);
	const day = parseInt(m[3] ?? "", 10);
	if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
	return { year, month, day };
}

function isValidDateStr(str: string): boolean {
	const parsed = parseDateStr(str);
	if (!parsed) return false;
	const date = new Date(parsed.year, parsed.month - 1, parsed.day);
	return (
		date.getFullYear() === parsed.year &&
		date.getMonth() === parsed.month - 1 &&
		date.getDate() === parsed.day
	);
}

function isValidRecurrenceInterval(value: string): boolean {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 1 && parsed <= 999;
}

function syncAllDayTimeInputs(
	allDayCheckbox: HTMLInputElement,
	startTimeInput: HTMLInputElement,
	endTimeInput: HTMLInputElement,
): void {
	if (allDayCheckbox.checked) {
		startTimeInput.value = "";
		endTimeInput.value = "";
	}
	startTimeInput.disabled = allDayCheckbox.checked;
	endTimeInput.disabled = allDayCheckbox.checked;
}

function formatOverlayPreview(
	dateStr: string,
	calendarOverlay: CalendarOverlayConfig,
): string | null {
	const parsed = parseDateStr(dateStr);
	if (!parsed) return null;
	const label = getCalendarOverlayLabel(
		parsed.year,
		parsed.month,
		parsed.day,
		calendarOverlay,
	);
	return label?.fullText ?? null;
}

function getSingleDateFromFilename(filename: string): string | null {
	const m = filename.match(/^(\d{4}-\d{2}-\d{2})(?:-.+)?$/);
	if (!m) return null;
	return m[1] ?? null;
}

export interface CreateFileModalOptions {
	bounds: SelectionBounds | null;
	defaultFolder: string;
	plannerFileScope: PlannerFileScope;
	calendarOverlay: CalendarOverlayConfig;
	defaultStartTime?: string;
	defaultEndTime?: string;
	createSingleDateFile: CreateSingleDateFileWithFolderFn;
	createRangeFile: CreateRangeFileWithFolderFn;
	onCreated: () => void;
	openCreatedFile?: (file: TFile) => void | Promise<void>;
}

const FOLDER_OTHER = "__other__";

export class CreateFileModal extends Modal {
	private mode: "single" | "range" = "single";
	private folderSelect!: HTMLSelectElement;
	private folderCustomInput!: HTMLInputElement;
	private folderOtherRow!: HTMLElement;
	private startDateInput!: HTMLInputElement;
	private endDateInput!: HTMLInputElement;
	private filenameInput!: HTMLInputElement;
	private colorInput!: HTMLInputElement;
	private colorPickerInput!: HTMLInputElement;
	private colorPresetBtns: HTMLButtonElement[] = [];
	private colorPresets: { hex: string }[] = [];
	private todoCheckbox!: HTMLInputElement;
	private allDayCheckbox!: HTMLInputElement;
	private startTimeInput!: HTMLInputElement;
	private endTimeInput!: HTMLInputElement;
	private notifyTimeInput!: HTMLInputElement;
	private repeatCheckbox!: HTMLInputElement;
	private repeatRows: HTMLElement[] = [];
	private recurrenceCalendarSelect!: HTMLSelectElement;
	private recurrenceFrequencySelect!: HTMLSelectElement;
	private recurrenceIntervalInput!: HTMLInputElement;
	private recurrenceUntilDateInput!: HTMLInputElement;
	private calendarPreviewEl!: HTMLElement;
	private rangeRow!: HTMLElement;
	private singleModeBtn!: HTMLButtonElement;
	private rangeModeBtn!: HTMLButtonElement;
	private createBtn!: HTMLButtonElement;
	private createErrorEl!: HTMLElement;

	constructor(
		app: App,
		private options: CreateFileModalOptions,
	) {
		super(app);
	}

	onOpen(): void {
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.addClass("yearly-planner-modal-create-file");
		const { bounds, defaultFolder } = this.options;
		const today = new Date();

		let startStr: string;
		let endStr: string;
		if (bounds) {
			const count =
				bounds.startYear === bounds.endYear &&
				bounds.startMonth === bounds.endMonth &&
				bounds.startDay === bounds.endDay
					? 1
					: 2;
			this.mode = count === 1 ? "single" : "range";
			startStr = toDateStr(
				bounds.startYear,
				bounds.startMonth,
				bounds.startDay,
			);
			endStr = toDateStr(bounds.endYear, bounds.endMonth, bounds.endDay);
		} else {
			startStr = toDateStr(
				today.getFullYear(),
				today.getMonth() + 1,
				today.getDate(),
			);
			endStr = startStr;
		}

		this.contentEl.createEl("h2", { text: t("modal.createFile") });

		const form = this.contentEl.createDiv({
			cls: "yearly-planner-create-file-modal",
		});

		const modeRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		modeRow.createEl("label", { text: t("modal.mode") });
		const modeBtnsWrap = modeRow.createDiv({
			cls: "yearly-planner-mode-btns",
		});
		this.singleModeBtn = createUiButton(modeBtnsWrap, {
			classes: "yearly-planner-mode-btn",
			text: t("modal.singleDate"),
		});
		this.rangeModeBtn = createUiButton(modeBtnsWrap, {
			classes: "yearly-planner-mode-btn",
			text: t("modal.range"),
		});
		this.singleModeBtn.onclick = () => this.setMode("single");
		this.rangeModeBtn.onclick = () => this.setMode("range");
		if (this.mode === "single") this.singleModeBtn.addClass("is-active");
		else this.rangeModeBtn.addClass("is-active");

		const folderRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		folderRow.createEl("label", { text: t("modal.folder") });
		const folderPaths = getAllFolderPaths(
			this.app,
			defaultFolder || "Planner",
			this.options.plannerFileScope,
		);
		const hasDefault =
			defaultFolder && folderPaths.includes(defaultFolder.trim());
		if (defaultFolder && !hasDefault) {
			folderPaths.push(defaultFolder.trim());
			folderPaths.sort((a, b) => a.localeCompare(b));
		}
		this.folderSelect = folderRow.createEl("select", {
			cls: "yearly-planner-folder-select",
		});
		for (const path of folderPaths) {
			this.folderSelect.createEl("option", {
				value: path,
				text: path || t("modal.root"),
			});
		}
		this.folderSelect.createEl("option", {
			value: FOLDER_OTHER,
			text: t("modal.other"),
		});
		const targetFolder = defaultFolder?.trim() || "Planner";
		const idx = folderPaths.indexOf(targetFolder);
		if (idx >= 0 && folderPaths[idx] !== undefined) {
			this.folderSelect.value = folderPaths[idx];
		} else if (defaultFolder) {
			this.folderSelect.value = defaultFolder.trim();
		} else {
			this.folderSelect.value = folderPaths[0] ?? FOLDER_OTHER;
		}
		this.folderSelect.onchange = () => {
			this.updateFolderOtherVisibility();
			this.updateCreateState();
		};

		this.folderOtherRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-folder-other-row",
		);
		this.folderOtherRow.createEl("label", {
			text: t("modal.customFolderPath"),
		});
		this.folderCustomInput = this.folderOtherRow.createEl("input", {
			type: "text",
			cls: "yearly-planner-folder-input",
		});
		this.folderCustomInput.placeholder =
			"Planner"; /* Default folder name */
		this.folderCustomInput.value = defaultFolder || "";
		this.folderCustomInput.addEventListener("input", () =>
			this.updateCreateState(),
		);
		this.updateFolderOtherVisibility();

		const startRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		startRow.createEl("label", { text: t("modal.startDate") });
		this.startDateInput = startRow.createEl("input", {
			type: "date",
			cls: "yearly-planner-date-input",
		});
		this.startDateInput.value = startStr;
		this.startDateInput.oninput = () => {
			this.syncFilename();
			this.updateCalendarPreview();
			this.updateCreateState();
		};

		this.rangeRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		this.rangeRow.createEl("label", { text: t("modal.endDate") });
		this.endDateInput = this.rangeRow.createEl("input", {
			type: "date",
			cls: "yearly-planner-date-input",
		});
		this.endDateInput.value = endStr;
		this.endDateInput.oninput = () => {
			this.syncFilename();
			this.updateCalendarPreview();
			this.updateCreateState();
		};

		this.calendarPreviewEl = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-calendar-preview-row",
		);

		const filenameRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row",
		);
		filenameRow.createEl("label", { text: t("modal.fileName") });
		this.filenameInput = filenameRow.createEl("input", {
			type: "text",
			cls: "yearly-planner-filename-input",
		});
		this.filenameInput.placeholder = t("modal.fileNamePlaceholder");
		this.filenameInput.oninput = () => {
			if (this.mode === "range") this.syncDatesFromFilename();
			this.updateCreateState();
		};
		const filenameHint = filenameRow.createDiv({
			cls: "yearly-planner-create-file-hint",
		});
		filenameHint.appendText(t("modal.suffixAsTitle"));
		filenameHint.appendText(" ");
		filenameHint.appendText(t("modal.suffixExample"));

		this.colorPresets = getChipColorPresets(this.contentEl.ownerDocument);
		const defaultColor = this.colorPresets[0]!.hex;
		const colorRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		colorRow.createEl("label", { text: t("modal.color") });
		const colorPresetsWrap = colorRow.createDiv({
			cls: "yearly-planner-color-row",
		});
		const presetsEl = colorPresetsWrap.createDiv({
			cls: "yearly-planner-color-presets",
		});
		this.colorPresets.forEach((preset) => {
			const label = t("modal.colorPresetLabel", { color: preset.hex });
			const btn = createUiColorPresetButton(presetsEl, {
				classes: "yearly-planner-color-preset-btn",
				color: preset.hex,
				label,
				onClick: () => this.setColorFromPreset(preset.hex),
			});
			this.colorPresetBtns.push(btn);
		});
		this.colorPickerInput = colorPresetsWrap.createEl("input", {
			type: "color",
			cls: "yearly-planner-color-picker",
		});
		this.colorPickerInput.value = defaultColor;
		this.colorPickerInput.title = t("modal.pickColor");
		this.colorPickerInput.oninput = () => {
			this.colorInput.value = this.colorPickerInput.value;
			this.updateColorPresetActive();
		};
		this.colorInput = colorRow.createEl("input", {
			type: "text",
			cls: "yearly-planner-filename-input",
		});
		this.colorInput.value = defaultColor;
		this.colorInput.placeholder = defaultColor;
		this.colorInput.title = t("modal.chipColorTitle");
		this.colorInput.oninput = () => this.syncColorFromText();
		this.updateColorPresetActive();

		const todoRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		this.todoCheckbox = todoRow.createEl("input", {
			type: "checkbox",
			cls: "yearly-planner-todo-checkbox",
		});
		const todoLabel = todoRow.createEl("label");
		todoLabel.appendChild(this.todoCheckbox);
		todoLabel.appendText(` ${t("modal.todoFile")}`);

		const allDayRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row",
		);
		this.allDayCheckbox = allDayRow.createEl("input", {
			type: "checkbox",
			cls: "yearly-planner-all-day-checkbox",
		});
		this.allDayCheckbox.checked = !(
			this.options.defaultStartTime || this.options.defaultEndTime
		);
		const allDayLabel = allDayRow.createEl("label");
		allDayLabel.appendChild(this.allDayCheckbox);
		allDayLabel.appendText(` ${t("modal.allDay")}`);
		allDayRow.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: t("modal.allDayDesc"),
		});

		const startTimeRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row",
		);
		startTimeRow.createEl("label", { text: t("modal.startTime") });
		this.startTimeInput = startTimeRow.createEl("input", {
			type: "time",
			cls: "yearly-planner-date-input",
		});
		this.startTimeInput.value = this.options.defaultStartTime ?? "";
		this.startTimeInput.addEventListener("input", () =>
			this.updateCreateState(),
		);

		const endTimeRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row",
		);
		endTimeRow.createEl("label", { text: t("modal.endTime") });
		this.endTimeInput = endTimeRow.createEl("input", {
			type: "time",
			cls: "yearly-planner-date-input",
		});
		this.endTimeInput.value = this.options.defaultEndTime ?? "";
		this.endTimeInput.addEventListener("input", () =>
			this.updateCreateState(),
		);
		this.allDayCheckbox.onchange = () => {
			syncAllDayTimeInputs(
				this.allDayCheckbox,
				this.startTimeInput,
				this.endTimeInput,
			);
			this.updateCreateState();
		};
		syncAllDayTimeInputs(
			this.allDayCheckbox,
			this.startTimeInput,
			this.endTimeInput,
		);
		endTimeRow.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: t("modal.eventTimeDesc"),
		});

		const notifyRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		notifyRow.createEl("label", { text: t("modal.notifyTime") });
		this.notifyTimeInput = notifyRow.createEl("input", {
			type: "time",
			cls: "yearly-planner-date-input",
		});
		this.notifyTimeInput.title = t("modal.notifyTimeDesc");
		notifyRow.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: t("modal.notifyTimeDesc"),
		});

		this.createRecurrenceControls(form);

		this.syncFilename();
		this.updateCalendarPreview();
		this.updateModeUI();
		this.createErrorEl = createUiError(
			this.contentEl,
			"yearly-planner-modal-error",
		);

		const actions = createUiModalActionBar(
			this.contentEl,
			"yearly-planner-modal-buttons yearly-planner-create-file-actions",
		);
		this.createBtn = createUiButton(actions, {
			text: t("modal.create"),
			variant: "cta",
		});
		this.createBtn.onclick = () => void this.handleCreate();
		this.contentEl.addEventListener("keydown", (e) => {
			if (e.key !== "Enter" || e.isComposing) return;
			if (e.target instanceof HTMLTextAreaElement) return;
			if (this.createBtn.disabled) return;
			e.preventDefault();
			void this.handleCreate();
		});
		this.updateCreateState();
		focusUiInputOnDesktop(this.filenameInput, true);
	}

	private updateFolderOtherVisibility(): void {
		const isOther = this.folderSelect.value === FOLDER_OTHER;
		this.folderOtherRow.toggleClass("is-hidden", !isOther);
		if (isOther && !this.folderCustomInput.value) {
			this.folderCustomInput.focus();
		}
	}

	private updateCreateState(): void {
		const error = this.getCreateValidationError();
		if (this.createBtn) this.createBtn.disabled = Boolean(error);
		if (!this.createErrorEl) return;
		this.createErrorEl.setText(error ?? "");
		this.createErrorEl.toggleClass("is-hidden", !error);
	}

	private updateCalendarPreview(): void {
		if (!this.calendarPreviewEl) return;
		const startLabel = formatOverlayPreview(
			this.startDateInput.value,
			this.options.calendarOverlay,
		);
		const endLabel =
			this.mode === "range"
				? formatOverlayPreview(
						this.endDateInput.value,
						this.options.calendarOverlay,
					)
				: null;
		const text = endLabel
			? `${t("modal.calendarPreview")}: ${startLabel ?? "-"} → ${endLabel}`
			: startLabel
				? `${t("modal.calendarPreview")}: ${startLabel}`
				: "";
		this.calendarPreviewEl.setText(text);
		this.calendarPreviewEl.toggleClass("is-hidden", !text);
	}

	private getCreateValidationError(): string | null {
		const folder = this.getFolderValue();
		const filename = this.filenameInput.value.trim().replace(/\.md$/i, "");
		if (!folder) return t("modal.folderRequired");
		if (!filename) return t("modal.fileNameRequired");
		const timeError = this.getTimeRangeValidationError();
		if (timeError) return timeError;
		if (
			this.repeatCheckbox?.checked &&
			!isValidRecurrenceInterval(this.recurrenceIntervalInput?.value ?? "")
		) {
			return t("modal.repeatIntervalInvalid");
		}
		if (
			this.repeatCheckbox?.checked &&
			this.recurrenceUntilDateInput?.value &&
			this.recurrenceUntilDateInput.value < this.startDateInput.value
		) {
			return t("modal.repeatUntilBeforeStart");
		}
		if (this.mode === "single") {
			const dateStr = getSingleDateFromFilename(filename);
			if (!dateStr || !isValidDateStr(dateStr)) {
				return t("modal.invalidDateFileName");
			}
			return null;
		}
		const range = parseRangeBasename(filename);
		if (!range || !isValidDateStr(range.start) || !isValidDateStr(range.end)) {
			return t("modal.invalidRangeFileName");
		}
		return null;
	}

	private getTimeRangeValidationError(): string | null {
		const startTime = normalizeTimeValue(this.startTimeInput?.value ?? "");
		const endTime = normalizeTimeValue(this.endTimeInput?.value ?? "");
		if (endTime && !startTime) return t("modal.endTimeRequiresStart");
		if (this.mode === "range" && startTime && !endTime) {
			return t("modal.rangeEndTimeRequired");
		}
		const isSameDay =
			this.mode === "single" ||
			this.startDateInput.value === this.endDateInput.value;
		if (isSameDay && startTime && endTime && endTime < startTime) {
			return t("modal.endTimeBeforeStart");
		}
		return null;
	}

	private getTimeRangeValue(): PlannerTimeRange | null {
		const startTime = normalizeTimeValue(this.startTimeInput.value);
		const endTime = normalizeTimeValue(this.endTimeInput.value);
		return startTime || endTime ? { startTime, endTime } : null;
	}

	private createRecurrenceControls(form: HTMLElement): void {
		const repeatRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-row",
		);
		this.repeatCheckbox = repeatRow.createEl("input", {
			type: "checkbox",
			cls: "yearly-planner-repeat-checkbox",
		});
		const repeatLabel = repeatRow.createEl("label");
		repeatLabel.appendChild(this.repeatCheckbox);
		repeatLabel.appendText(` ${t("modal.repeatEvent")}`);
		this.repeatCheckbox.onchange = () => {
			this.updateRecurrenceVisibility();
			this.updateCreateState();
		};

		this.recurrenceCalendarSelect = this.createRecurrenceSelectRow(
			form,
			t("modal.repeatCalendar"),
			(select) => {
				select.createEl("option", {
					value: RECURRENCE_GREGORIAN,
					text: t("modal.repeatCalendarGregorian"),
				});
				const locale = getLocale();
					for (const option of ALTERNATE_CALENDAR_OPTIONS) {
						select.createEl("option", {
							value: option.id,
							text: getAlternateCalendarOptionText(option, locale).name,
						});
					}
				select.value = RECURRENCE_GREGORIAN;
			},
		);
		this.recurrenceFrequencySelect = this.createRecurrenceSelectRow(
			form,
			t("modal.repeatFrequency"),
			(select) => {
				for (const value of ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) {
					select.createEl("option", {
						value,
						text: t(`modal.repeatFreq${value}`),
					});
				}
				select.value = "YEARLY";
			},
		);
		this.recurrenceIntervalInput = this.createRecurrenceNumberRow(
			form,
			t("modal.repeatInterval"),
		);
		this.recurrenceUntilDateInput = this.createRecurrenceDateRow(
			form,
			t("modal.repeatUntilDate"),
		);

		const hintRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-control-row",
		);
		hintRow.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: t("modal.repeatDesc"),
		});
		this.repeatRows.push(hintRow);
		this.updateRecurrenceVisibility();
	}

	private createRecurrenceSelectRow(
		form: HTMLElement,
		label: string,
		configure: (select: HTMLSelectElement) => void,
	): HTMLSelectElement {
		const row = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-control-row",
		);
		row.createEl("label", { text: label });
		const select = row.createEl("select", {
			cls: "yearly-planner-repeat-select",
		});
		configure(select);
		this.repeatRows.push(row);
		return select;
	}

	private createRecurrenceDateRow(
		form: HTMLElement,
		label: string,
	): HTMLInputElement {
		const row = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-control-row",
		);
		row.createEl("label", { text: label });
		const input = row.createEl("input", {
			type: "date",
			cls: "yearly-planner-date-input",
		});
		input.title = t("modal.repeatUntilDateDesc");
		input.addEventListener("input", () => this.updateCreateState());
		this.repeatRows.push(row);
		return input;
	}

	private createRecurrenceNumberRow(
		form: HTMLElement,
		label: string,
	): HTMLInputElement {
		const row = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-control-row",
		);
		row.createEl("label", { text: label });
		const input = row.createEl("input", {
			type: "number",
			cls: "yearly-planner-year-input",
		});
		input.min = "1";
		input.max = "999";
		input.step = "1";
		input.value = "1";
		input.title = t("modal.repeatIntervalDesc");
		input.addEventListener("input", () => this.updateCreateState());
		this.repeatRows.push(row);
		return input;
	}

	private updateRecurrenceVisibility(): void {
		const enabled = this.repeatCheckbox?.checked ?? false;
		for (const row of this.repeatRows) {
			row.toggleClass("is-hidden", !enabled);
		}
	}

	private getRecurrenceValue(): RecurrenceFormValue | null {
		if (!this.repeatCheckbox.checked) return null;
		return {
			enabled: true,
			calendar: normalizeRecurrenceCalendar(
				this.recurrenceCalendarSelect.value,
			),
			untilDate: this.recurrenceUntilDateInput.value || null,
			rule: buildRecurrenceRuleFromForm({
				frequency: this.recurrenceFrequencySelect.value,
				interval: this.recurrenceIntervalInput.value,
			}),
		};
	}

	private setColorFromPreset(hex: string): void {
		this.colorInput.value = hex;
		this.colorPickerInput.value = toHex6(hex) ?? hex;
		this.updateColorPresetActive();
	}

	private syncColorFromText(): void {
		const hex = toHex6(this.colorInput.value.trim());
		if (hex) {
			this.colorPickerInput.value = hex;
		}
		this.updateColorPresetActive();
	}

	private updateColorPresetActive(): void {
		const val = this.colorInput.value.trim();
		const normalizedVal =
			normalizeColorToHex(val, this.contentEl.ownerDocument) ??
			val.toLowerCase();
		this.colorPresets.forEach((preset, i) => {
			const btn = this.colorPresetBtns[i];
			const presetHex = (toHex6(preset.hex) ?? preset.hex).toLowerCase();
			btn?.toggleClass("is-active", normalizedVal === presetHex);
		});
	}

	private getFolderValue(): string {
		if (this.folderSelect.value === FOLDER_OTHER) {
			return this.folderCustomInput.value.trim() || "Planner";
		}
		return this.folderSelect.value || "Planner";
	}

	private setMode(mode: "single" | "range"): void {
		this.mode = mode;
		this.updateModeUI();
		this.syncFilename();
		this.updateCalendarPreview();
		this.updateCreateState();
	}

	private updateModeUI(): void {
		this.rangeRow.toggleClass("is-hidden", this.mode === "single");
		this.singleModeBtn.toggleClass("is-active", this.mode === "single");
		this.rangeModeBtn.toggleClass("is-active", this.mode === "range");
	}

	private syncFilename(): void {
		const start = this.startDateInput.value;
		const end = this.endDateInput.value;
		if (this.mode === "single") {
			this.filenameInput.value = start || "";
		} else {
			this.filenameInput.value = start && end ? `${start}--${end}` : "";
		}
		this.filenameInput.readOnly = false;
	}

	private syncDatesFromFilename(): void {
		const m = this.filenameInput.value.match(
			/^(\d{4}-\d{2}-\d{2})--(\d{4}-\d{2}-\d{2})(?:-.+)?$/,
		);
		if (m) {
			this.startDateInput.value = m[1] ?? "";
			this.endDateInput.value = m[2] ?? "";
			this.updateCalendarPreview();
		}
	}

	private async handleCreate(): Promise<void> {
		const validationError = this.getCreateValidationError();
		if (validationError) {
			this.updateCreateState();
			new Notice(validationError);
			return;
		}
		const folder = this.getFolderValue();
		const filename = this.filenameInput.value.trim().replace(/\.md$/i, "");

		try {
			if (this.mode === "single") {
				const rawColor = this.colorInput.value.trim();
				const themeHex = getThemeAccentHex(
					this.contentEl.ownerDocument,
				).toLowerCase();
				const color =
					rawColor &&
					(toHex6(rawColor) ?? rawColor).toLowerCase() !== themeHex
						? rawColor
						: undefined;
				const todo = this.todoCheckbox.checked;
				const notifyMinutes = parseTimeValueToNotifyMinutes(
					this.notifyTimeInput.value,
				);
				const file = await this.options.createSingleDateFile(
					folder,
					filename,
					color,
					todo,
					notifyMinutes,
					this.getTimeRangeValue(),
					this.getRecurrenceValue(),
				);
				this.options.onCreated();
				this.close();
				await this.openCreatedFile(file);
			} else {
				if (!filename) return;
				const rawColor = this.colorInput.value.trim();
				const themeHex = getThemeAccentHex(
					this.contentEl.ownerDocument,
				).toLowerCase();
				const color =
					rawColor &&
					(toHex6(rawColor) ?? rawColor).toLowerCase() !== themeHex
						? rawColor
						: undefined;
				const todo = this.todoCheckbox.checked;
				const notifyMinutes = parseTimeValueToNotifyMinutes(
					this.notifyTimeInput.value,
				);
				const file = await this.options.createRangeFile(
					folder,
					filename,
					color,
					todo,
					notifyMinutes,
					this.getTimeRangeValue(),
					this.getRecurrenceValue(),
				);
				this.options.onCreated();
				this.close();
				await this.openCreatedFile(file);
			}
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: t("modal.failedToCreateFile");
			new Notice(msg);
		}
	}

	private async openCreatedFile(file: TFile): Promise<void> {
		if (this.options.openCreatedFile) {
			await this.options.openCreatedFile(file);
			return;
		}
		await this.app.workspace.getLeaf().openFile(file);
	}
}

export class DeleteConfirmModal extends Modal {
	constructor(
		app: App,
		private titleText: string,
		private desc: string,
		private onConfirm: () => void,
	) {
		super(app);
	}

	onOpen(): void {
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.createEl("h2", { text: this.titleText });
		this.contentEl.createEl("p", {
			cls: "yearly-planner-delete-desc",
			text: this.desc,
		});
		const btnRow = createUiModalActionBar(
			this.contentEl,
			"yearly-planner-modal-buttons",
		);
		const cancelBtn = createUiButton(btnRow, {
			text: t("modal.cancel"),
		});
		cancelBtn.onclick = () => this.close();
		const deleteBtn = createUiButton(btnRow, {
			text: t("modal.delete"),
			variant: "danger",
		});
		deleteBtn.onclick = () => {
			this.onConfirm();
			this.close();
		};
	}
}

export class FileOptionsModal extends Modal {
	private mode: "single" | "range" = "single";
	private folderSelect!: HTMLSelectElement;
	private folderCustomInput!: HTMLInputElement;
	private folderOtherRow!: HTMLElement;
	private filenameInput!: HTMLInputElement;
	private rangeRow!: HTMLElement;
	private singleModeBtn!: HTMLButtonElement;
	private rangeModeBtn!: HTMLButtonElement;
	private colorInput!: HTMLInputElement;
	private colorPickerInput!: HTMLInputElement;
	private colorPresetBtns: HTMLButtonElement[] = [];
	private colorPresets: { hex: string }[] = [];
	private todoCheckbox!: HTMLInputElement;
	private allDayCheckbox!: HTMLInputElement;
	private startTimeInput!: HTMLInputElement;
	private endTimeInput!: HTMLInputElement;
	private notifyTimeInput!: HTMLInputElement;
	private completedCheckbox!: HTMLInputElement;
	private completedRow!: HTMLElement;
	private sourceRepeatCheckbox?: HTMLInputElement;
	private sourceRecurrenceCalendarSelect?: HTMLSelectElement;
	private sourceRecurrenceFrequencySelect?: HTMLSelectElement;
	private sourceRecurrenceIntervalInput?: HTMLInputElement;
	private sourceRecurrenceUntilDateInput?: HTMLInputElement;
	private previewComponent: Component | null = null;
	private startDateInput?: HTMLInputElement;
	private endDateInput?: HTMLInputElement;
	private calendarPreviewEl?: HTMLElement;
	private applyBtn!: HTMLButtonElement;
	private fileOptionsErrorEl!: HTMLElement;

	constructor(
		app: App,
		private file: TFile,
		private leaf: WorkspaceLeaf,
		private onClosed: () => void,
		private openFile?: (file: TFile) => void | Promise<void>,
		private calendarOverlay?: CalendarOverlayConfig,
	) {
		super(app);
	}

	onOpen(): void {
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.createEl("h2", { text: t("modal.fileOptions") });

		const form = this.contentEl.createDiv({
			cls: "yearly-planner-create-file-modal yearly-planner-file-options-form",
		});

		const rangeParsed = parseRangeBasename(this.file.basename);
		const singleParsed = rangeParsed
			? null
			: parseSingleDateBasename(this.file.basename.replace(/\.md$/i, ""));
		this.mode = rangeParsed ? "range" : "single";

		const modeRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		modeRow.createEl("label", { text: t("modal.mode") });
		const modeBtnsWrap = modeRow.createDiv({
			cls: "yearly-planner-mode-btns",
		});
		this.singleModeBtn = createUiButton(modeBtnsWrap, {
			classes: "yearly-planner-mode-btn",
			text: t("modal.singleDate"),
		});
		this.rangeModeBtn = createUiButton(modeBtnsWrap, {
			classes: "yearly-planner-mode-btn",
			text: t("modal.range"),
		});
		this.singleModeBtn.onclick = () => this.setFileOptionsMode("single");
		this.rangeModeBtn.onclick = () => this.setFileOptionsMode("range");

		const currentFolder = this.file.parent?.path ?? "";
		const folderRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		folderRow.createEl("label", { text: t("modal.folder") });
		const folderPaths = getAllFolderPaths(this.app, currentFolder, "vault");
		this.folderSelect = folderRow.createEl("select", {
			cls: "yearly-planner-folder-select",
		});
		for (const path of folderPaths) {
			this.folderSelect.createEl("option", {
				value: path,
				text: path || t("modal.root"),
			});
		}
		this.folderSelect.createEl("option", {
			value: FOLDER_OTHER,
			text: t("modal.other"),
		});
		this.folderSelect.value = folderPaths.includes(currentFolder)
			? currentFolder
			: FOLDER_OTHER;
		this.folderSelect.onchange = () => {
			this.updateFileOptionsFolderVisibility();
			this.updateFileOptionsState();
		};

		this.folderOtherRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-folder-other-row",
		);
		this.folderOtherRow.createEl("label", {
			text: t("modal.customFolderPath"),
		});
		this.folderCustomInput = this.folderOtherRow.createEl("input", {
			type: "text",
			cls: "yearly-planner-folder-input",
		});
		this.folderCustomInput.value = currentFolder;
		this.folderCustomInput.placeholder = "Planner";
		this.folderCustomInput.addEventListener("input", () =>
			this.updateFileOptionsState(),
		);
		this.updateFileOptionsFolderVisibility();

		if (rangeParsed || singleParsed) {
			const startRow = createUiFieldRow(
				form,
				"yearly-planner-create-file-row",
			);
			startRow.createEl("label", { text: t("modal.startDate") });
			this.startDateInput = startRow.createEl("input", {
				type: "date",
				cls: "yearly-planner-date-input",
			});
			this.startDateInput.value =
				rangeParsed?.start ?? singleParsed?.date ?? "";
			this.startDateInput.addEventListener("input", () => {
				this.syncFileOptionsFilename();
				this.updateDateRelatedFileOptionsState();
			});

			this.rangeRow = createUiFieldRow(
				form,
				"yearly-planner-create-file-row",
			);
			this.rangeRow.createEl("label", { text: t("modal.endDate") });
			this.endDateInput = this.rangeRow.createEl("input", {
				type: "date",
				cls: "yearly-planner-date-input",
			});
			this.endDateInput.value =
				rangeParsed?.end ?? singleParsed?.date ?? "";
			this.endDateInput.addEventListener("input", () => {
				this.syncFileOptionsFilename();
				this.updateDateRelatedFileOptionsState();
			});

			this.calendarPreviewEl = createUiFieldRow(
				form,
				"yearly-planner-create-file-row yearly-planner-calendar-preview-row",
			);
			this.updateCalendarPreview();
		}

		const filenameRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row",
		);
		filenameRow.createEl("label", { text: t("modal.fileName") });
		this.filenameInput = filenameRow.createEl("input", {
			type: "text",
			cls: "yearly-planner-filename-input",
		});
		this.filenameInput.value = this.file.basename;
		this.filenameInput.placeholder = t("modal.fileNamePlaceholder");
		this.filenameInput.addEventListener("input", () => {
			this.syncFileOptionsDatesFromFilename();
			this.updateFileOptionsState();
		});
		const filenameHint = filenameRow.createDiv({
			cls: "yearly-planner-create-file-hint",
		});
		filenameHint.appendText(t("modal.suffixAsTitle"));
		filenameHint.appendText(" ");
		filenameHint.appendText(t("modal.suffixExample"));
		this.updateFileOptionsModeUI();

		this.colorPresets = getChipColorPresets(this.contentEl.ownerDocument);
		const defaultColor = this.colorPresets[0]!.hex;
		const colorRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		colorRow.createEl("label", { text: t("modal.color") });
		const colorPresetsWrap = colorRow.createDiv({
			cls: "yearly-planner-color-row",
		});
		const presetsEl = colorPresetsWrap.createDiv({
			cls: "yearly-planner-color-presets",
		});
		const currentColor = getChipColor(this.app, this.file) ?? defaultColor;
		this.colorPresets.forEach((preset) => {
			const label = t("modal.colorPresetLabel", { color: preset.hex });
			const btn = createUiColorPresetButton(presetsEl, {
				classes: "yearly-planner-color-preset-btn",
				color: preset.hex,
				label,
				onClick: () => this.setColorFromPreset(preset.hex),
			});
			this.colorPresetBtns.push(btn);
		});
		this.colorPickerInput = colorPresetsWrap.createEl("input", {
			type: "color",
			cls: "yearly-planner-color-picker",
		});
		this.colorPickerInput.value =
			toHex6(currentColor) ?? currentColor ?? defaultColor;
		this.colorPickerInput.title = t("modal.pickColor");
		this.colorPickerInput.oninput = () => {
			this.colorInput.value = this.colorPickerInput.value;
			this.updateColorPresetActive();
		};
		this.colorInput = colorRow.createEl("input", {
			type: "text",
			cls: "yearly-planner-filename-input",
		});
		this.colorInput.value = currentColor;
		this.colorInput.placeholder = defaultColor;
		this.colorInput.title = t("modal.chipColorTitle");
		this.colorInput.oninput = () => this.syncColorFromText();
		this.updateColorPresetActive();

		const todoRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		this.todoCheckbox = todoRow.createEl("input", {
			type: "checkbox",
			cls: "yearly-planner-todo-checkbox",
		});
		this.todoCheckbox.checked = isTodoFile(this.app, this.file);
		const todoLabel = todoRow.createEl("label");
		todoLabel.appendChild(this.todoCheckbox);
		todoLabel.appendText(` ${t("modal.todoFile")}`);
		this.todoCheckbox.onchange = () => this.updateCompletedRowVisibility();

		this.completedRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-completed-row",
		);
		this.completedCheckbox = this.completedRow.createEl("input", {
			type: "checkbox",
			cls: "yearly-planner-completed-checkbox",
		});
		this.completedCheckbox.checked = isTodoCompleted(this.app, this.file);
		const completedLabel = this.completedRow.createEl("label");
		completedLabel.appendChild(this.completedCheckbox);
		completedLabel.appendText(` ${t("modal.completed")}`);
		this.updateCompletedRowVisibility();

		const existingTimeRange = getPlannerTimeRange(this.app, this.file);
		const allDayRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row",
		);
		this.allDayCheckbox = allDayRow.createEl("input", {
			type: "checkbox",
			cls: "yearly-planner-all-day-checkbox",
		});
		this.allDayCheckbox.checked = !(
			existingTimeRange.startTime || existingTimeRange.endTime
		);
		const allDayLabel = allDayRow.createEl("label");
		allDayLabel.appendChild(this.allDayCheckbox);
		allDayLabel.appendText(` ${t("modal.allDay")}`);
		allDayRow.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: t("modal.allDayDesc"),
		});
		const startTimeRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row",
		);
		startTimeRow.createEl("label", { text: t("modal.startTime") });
		this.startTimeInput = startTimeRow.createEl("input", {
			type: "time",
			cls: "yearly-planner-date-input",
		});
		this.startTimeInput.value = existingTimeRange.startTime ?? "";
		this.startTimeInput.addEventListener("input", () =>
			this.updateFileOptionsState(),
		);

		const endTimeRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row",
		);
		endTimeRow.createEl("label", { text: t("modal.endTime") });
		this.endTimeInput = endTimeRow.createEl("input", {
			type: "time",
			cls: "yearly-planner-date-input",
		});
		this.endTimeInput.value = existingTimeRange.endTime ?? "";
		this.endTimeInput.addEventListener("input", () =>
			this.updateFileOptionsState(),
		);
		this.allDayCheckbox.onchange = () => {
			syncAllDayTimeInputs(
				this.allDayCheckbox,
				this.startTimeInput,
				this.endTimeInput,
			);
			this.updateFileOptionsState();
		};
		syncAllDayTimeInputs(
			this.allDayCheckbox,
			this.startTimeInput,
			this.endTimeInput,
		);
		endTimeRow.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: t("modal.eventTimeDesc"),
		});

		const notifyRow = createUiFieldRow(form, "yearly-planner-create-file-row");
		notifyRow.createEl("label", { text: t("modal.notifyTime") });
		this.notifyTimeInput = notifyRow.createEl("input", {
			type: "time",
			cls: "yearly-planner-date-input",
		});
		this.notifyTimeInput.title = t("modal.notifyTimeDesc");
		const existingNotify = getNotifyMinutes(this.app, this.file);
		this.notifyTimeInput.value = notifyMinutesToTimeValue(existingNotify);
		notifyRow.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: t("modal.notifyTimeDesc"),
		});

		this.createFileOptionsRecurrenceSection(form);

		const previewWrap = this.contentEl.createDiv({
			cls: "yearly-planner-file-preview-wrap",
		});
		previewWrap.createEl("label", { text: t("modal.preview") });
		const previewEl = previewWrap.createDiv({
			cls: "yearly-planner-file-preview",
		});
		previewEl.createSpan({
			text: t("modal.previewLoading"),
			cls: "yearly-planner-file-preview-loading",
		});
		void this.loadPreview(previewEl);
		this.fileOptionsErrorEl = createUiError(
			this.contentEl,
			"yearly-planner-modal-error",
		);

		const btnRow = createUiModalActionBar(
			this.contentEl,
			"yearly-planner-file-options-buttons",
		);
		const openBtn = createUiButton(btnRow, {
			text: t("modal.openFile"),
		});
		openBtn.onclick = () => {
			void this.openPlannerFile();
			this.close();
		};
		this.applyBtn = createUiButton(btnRow, {
			text: t("modal.applyChange"),
			variant: "cta",
		});
		this.applyBtn.onclick = () => void this.handleApplyChange();
		const deleteBtn = createUiButton(btnRow, {
			text: t("modal.delete"),
			variant: "danger",
		});
		deleteBtn.onclick = () => this.handleDelete();
		this.contentEl.addEventListener("keydown", (e) => {
			if (e.key !== "Enter" || e.isComposing) return;
			if (e.target instanceof HTMLTextAreaElement) return;
			if (this.applyBtn.disabled) return;
			e.preventDefault();
			void this.handleApplyChange();
		});
		this.updateFileOptionsState();
		focusUiInputOnDesktop(this.filenameInput, true);
	}

	private updateFileOptionsFolderVisibility(): void {
		const isOther = this.folderSelect.value === FOLDER_OTHER;
		this.folderOtherRow.toggleClass("is-hidden", !isOther);
	}

	private getFileOptionsFolderValue(): string {
		const value =
			this.folderSelect.value === FOLDER_OTHER
				? this.folderCustomInput.value
				: this.folderSelect.value;
		return value.trim().replace(/^\/+|\/+$/g, "");
	}

	private setFileOptionsMode(mode: "single" | "range"): void {
		this.mode = mode;
		if (
			mode === "range" &&
			this.endDateInput &&
			!this.endDateInput.value
		) {
			this.endDateInput.value = this.startDateInput?.value ?? "";
		}
		this.updateFileOptionsModeUI();
		this.syncFileOptionsFilename();
		this.updateDateRelatedFileOptionsState();
	}

	private updateFileOptionsModeUI(): void {
		this.singleModeBtn.toggleClass("is-active", this.mode === "single");
		this.rangeModeBtn.toggleClass("is-active", this.mode === "range");
		this.rangeRow?.toggleClass("is-hidden", this.mode === "single");
	}

	private getFileOptionsFilenameSuffix(): string | undefined {
		const filename = this.filenameInput.value.trim().replace(/\.md$/i, "");
		const range = parseRangeBasename(filename);
		if (range) return range.suffix;
		return parseSingleDateBasename(filename)?.suffix;
	}

	private syncFileOptionsFilename(): void {
		if (!this.startDateInput) return;
		const start = this.startDateInput.value;
		const end = this.endDateInput?.value ?? "";
		const suffix = this.getFileOptionsFilenameSuffix();
		const suffixText = suffix ? `-${suffix}` : "";
		this.filenameInput.value =
			this.mode === "range"
				? start && end
					? `${start}--${end}${suffixText}`
					: ""
				: start
					? `${start}${suffixText}`
					: "";
	}

	private syncFileOptionsDatesFromFilename(): void {
		const filename = this.filenameInput.value.trim().replace(/\.md$/i, "");
		const range = parseRangeBasename(filename);
		if (range && this.startDateInput && this.endDateInput) {
			this.mode = "range";
			this.startDateInput.value = range.start;
			this.endDateInput.value = range.end;
			this.updateFileOptionsModeUI();
			this.updateCalendarPreview();
			return;
		}
		const single = parseSingleDateBasename(filename);
		if (single && this.startDateInput) {
			this.mode = "single";
			this.startDateInput.value = single.date;
			if (this.endDateInput) this.endDateInput.value = single.date;
			this.updateFileOptionsModeUI();
			this.updateCalendarPreview();
		}
	}

	private updateDateRelatedFileOptionsState(): void {
		this.updateCalendarPreview();
		this.updateFileOptionsState();
	}

	private updateCalendarPreview(): void {
		if (!this.calendarPreviewEl || !this.calendarOverlay) return;
		const startValue = this.startDateInput?.value ?? "";
		const startLabel = formatOverlayPreview(startValue, this.calendarOverlay);
		const endLabel =
			this.mode === "range" && this.endDateInput
				? formatOverlayPreview(this.endDateInput.value, this.calendarOverlay)
				: null;
		const text = endLabel
			? `${t("modal.calendarPreview")}: ${startLabel ?? "-"} → ${endLabel}`
			: startLabel
				? `${t("modal.calendarPreview")}: ${startLabel}`
				: "";
		this.calendarPreviewEl.setText(text);
		this.calendarPreviewEl.toggleClass("is-hidden", !text);
	}

	private async openPlannerFile(): Promise<void> {
		if (this.openFile) {
			await this.openFile(this.file);
			return;
		}
		await this.leaf.openFile(this.file);
	}

	private setColorFromPreset(hex: string): void {
		this.colorInput.value = hex;
		this.colorPickerInput.value = toHex6(hex) ?? hex;
		this.updateColorPresetActive();
	}

	private syncColorFromText(): void {
		const hex = toHex6(this.colorInput.value.trim());
		if (hex) {
			this.colorPickerInput.value = hex;
		}
		this.updateColorPresetActive();
	}

	private updateColorPresetActive(): void {
		const val = this.colorInput.value.trim();
		const normalizedVal =
			normalizeColorToHex(val, this.contentEl.ownerDocument) ??
			val.toLowerCase();
		this.colorPresets.forEach((preset, i) => {
			const btn = this.colorPresetBtns[i];
			const presetHex = (toHex6(preset.hex) ?? preset.hex).toLowerCase();
			btn?.toggleClass("is-active", normalizedVal === presetHex);
		});
	}

	private updateCompletedRowVisibility(): void {
		this.completedRow.toggleClass("is-hidden", !this.todoCheckbox.checked);
	}

	private createFileOptionsRecurrenceSection(form: HTMLElement): void {
		const role = getRecurrenceRole(this.app, this.file);
		if (role === "occurrence") {
			this.createOccurrenceActionSection(form);
			return;
		}
		const source = getRecurrenceSourceDefinition(this.app, this.file);
		const section = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-row yearly-planner-file-options-repeat-row",
		);
		this.sourceRepeatCheckbox = section.createEl("input", {
			type: "checkbox",
			cls: "yearly-planner-repeat-checkbox",
		});
		this.sourceRepeatCheckbox.checked = Boolean(source);
		const label = section.createEl("label");
		label.appendChild(this.sourceRepeatCheckbox);
		label.appendText(` ${t("modal.repeatEvent")}`);

		const calendarRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-control-row",
		);
		calendarRow.createEl("label", { text: t("modal.repeatCalendar") });
		this.sourceRecurrenceCalendarSelect = calendarRow.createEl("select", {
			cls: "yearly-planner-repeat-select",
		});
		this.sourceRecurrenceCalendarSelect.createEl("option", {
			value: RECURRENCE_GREGORIAN,
			text: t("modal.repeatCalendarGregorian"),
		});
		const locale = getLocale();
			for (const option of ALTERNATE_CALENDAR_OPTIONS) {
				this.sourceRecurrenceCalendarSelect.createEl("option", {
					value: option.id,
					text: getAlternateCalendarOptionText(option, locale).name,
				});
			}
		this.sourceRecurrenceCalendarSelect.value =
			source?.calendar ?? RECURRENCE_GREGORIAN;

		const frequencyRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-control-row",
		);
		frequencyRow.createEl("label", { text: t("modal.repeatFrequency") });
		this.sourceRecurrenceFrequencySelect = frequencyRow.createEl("select", {
			cls: "yearly-planner-repeat-select",
		});
		for (const value of ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]) {
			this.sourceRecurrenceFrequencySelect.createEl("option", {
				value,
				text: t(`modal.repeatFreq${value}`),
			});
		}
		this.sourceRecurrenceFrequencySelect.value = source
			? getSimpleRecurrenceFrequency(source.rule)
			: "YEARLY";

		const intervalRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-control-row",
		);
		intervalRow.createEl("label", { text: t("modal.repeatInterval") });
		this.sourceRecurrenceIntervalInput = intervalRow.createEl("input", {
			type: "number",
			cls: "yearly-planner-year-input",
		});
		this.sourceRecurrenceIntervalInput.min = "1";
		this.sourceRecurrenceIntervalInput.max = "999";
		this.sourceRecurrenceIntervalInput.step = "1";
		this.sourceRecurrenceIntervalInput.value = String(
			source ? getRecurrenceInterval(source.rule) : 1,
		);
		this.sourceRecurrenceIntervalInput.title = t(
			"modal.repeatIntervalDesc",
		);
		this.sourceRecurrenceIntervalInput.addEventListener("input", () =>
			this.updateFileOptionsState(),
		);

		const untilRow = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-repeat-control-row",
		);
		untilRow.createEl("label", { text: t("modal.repeatUntilDate") });
		this.sourceRecurrenceUntilDateInput = untilRow.createEl("input", {
			type: "date",
			cls: "yearly-planner-date-input",
		});
		this.sourceRecurrenceUntilDateInput.value = source?.untilDate ?? "";
		this.sourceRecurrenceUntilDateInput.title = t(
			"modal.repeatUntilDateDesc",
		);
		this.sourceRecurrenceUntilDateInput.addEventListener("input", () =>
			this.updateFileOptionsState(),
		);

		const toggleRows = () => {
			const enabled = this.sourceRepeatCheckbox?.checked ?? false;
			calendarRow.toggleClass("is-hidden", !enabled);
			frequencyRow.toggleClass("is-hidden", !enabled);
			intervalRow.toggleClass("is-hidden", !enabled);
			untilRow.toggleClass("is-hidden", !enabled);
			this.updateFileOptionsState();
		};
		this.sourceRepeatCheckbox.onchange = toggleRows;
		toggleRows();
	}

	private createOccurrenceActionSection(form: HTMLElement): void {
		const info = getRecurrenceOccurrenceInfo(this.app, this.file);
		const section = createUiFieldRow(
			form,
			"yearly-planner-create-file-row yearly-planner-file-options-repeat-actions",
		);
		section.createEl("label", { text: t("modal.repeatSeries") });
		const actions = createUiButtonRow(
			section,
			"yearly-planner-file-options-repeat-action-buttons",
		);
		const openSourceBtn = createUiButton(actions, {
			text: t("modal.openRepeatSource"),
			disabled: !info?.sourcePath,
		});
		openSourceBtn.onclick = () => void this.openRecurrenceSource();

		const skipBtn = createUiButton(actions, {
			text: t("modal.skipRepeatOccurrence"),
			disabled: !info?.sourcePath || !info?.occurrenceDate,
		});
		skipBtn.onclick = () => void this.skipRecurrenceOccurrence();

		const detachBtn = createUiButton(actions, {
			text: t("modal.detachRepeatOccurrence"),
		});
		detachBtn.onclick = () => void this.detachRecurrenceOccurrence();
	}

	private getRecurrenceFormValue(): RecurrenceFormValue | null {
		if (!this.sourceRepeatCheckbox?.checked) return null;
		return {
			enabled: true,
			calendar: normalizeRecurrenceCalendar(
				this.sourceRecurrenceCalendarSelect?.value,
			),
			untilDate: this.sourceRecurrenceUntilDateInput?.value || null,
			rule: buildRecurrenceRuleFromForm({
				frequency: this.sourceRecurrenceFrequencySelect?.value ?? "YEARLY",
				interval: this.sourceRecurrenceIntervalInput?.value ?? "1",
			}),
		};
	}

	private getRecurrenceAnchorDate(file: TFile): string | null {
		if (this.startDateInput?.value) return this.startDateInput.value;
		return (
			getRecurrenceSourceDefinition(this.app, file)?.anchorDate ??
			getSingleDateFromFilename(file.basename)
		);
	}

	private async openRecurrenceSource(): Promise<void> {
		const info = getRecurrenceOccurrenceInfo(this.app, this.file);
		if (!info?.sourcePath) return;
		const source = this.app.vault.getAbstractFileByPath(info.sourcePath);
		if (source instanceof TFile) {
			if (this.openFile) await this.openFile(source);
			else await this.leaf.openFile(source);
		}
		this.close();
	}

	private async skipRecurrenceOccurrence(): Promise<void> {
		const info = getRecurrenceOccurrenceInfo(this.app, this.file);
		if (!info?.sourcePath || !info.occurrenceDate) return;
		const source = this.app.vault.getAbstractFileByPath(info.sourcePath);
		if (!(source instanceof TFile)) return;
		await addRecurrenceExdate(this.app, source, info.occurrenceDate);
		await this.app.fileManager.trashFile(this.file);
		this.close();
		this.onClosed();
	}

	private async detachRecurrenceOccurrence(): Promise<void> {
		await detachRecurrenceOccurrenceFile(this.app, this.file);
		this.close();
		this.onClosed();
	}

	private updateFileOptionsState(): void {
		const error = this.getFileOptionsValidationError();
		if (this.applyBtn) this.applyBtn.disabled = Boolean(error);
		if (!this.fileOptionsErrorEl) return;
		this.fileOptionsErrorEl.setText(error ?? "");
		this.fileOptionsErrorEl.toggleClass("is-hidden", !error);
	}

	private getFileOptionsValidationError(): string | null {
		if (
			this.folderSelect.value === FOLDER_OTHER &&
			!this.folderCustomInput.value.trim()
		) {
			return t("modal.folderRequired");
		}
		const filename = this.filenameInput.value.trim().replace(/\.md$/i, "");
		if (!filename) return t("modal.fileNameRequired");
		if (/[\\/]/.test(filename)) return t("modal.fileNameNoPathSeparators");
		if (this.mode === "single") {
			const dateStr = getSingleDateFromFilename(filename);
			if (!dateStr || !isValidDateStr(dateStr)) {
				return t("modal.invalidDateFileName");
			}
		} else {
			const range = parseRangeBasename(filename);
			if (
				!range ||
				!isValidDateStr(range.start) ||
				!isValidDateStr(range.end)
			) {
				return t("modal.invalidRangeFileName");
			}
			if (range.start > range.end) return t("modal.invalidDateRange");
		}
		const folder = this.getFileOptionsFolderValue();
		const targetPath = folder ? `${folder}/${filename}.md` : `${filename}.md`;
		const target = this.app.vault.getAbstractFileByPath(targetPath);
		if (target && target.path !== this.file.path) {
			return t("modal.fileMoveConflict");
		}

		const startTime = normalizeTimeValue(this.startTimeInput?.value ?? "");
		const endTime = normalizeTimeValue(this.endTimeInput?.value ?? "");
		if (endTime && !startTime) return t("modal.endTimeRequiresStart");
		if (this.mode === "range" && startTime && !endTime) {
			return t("modal.rangeEndTimeRequired");
		}
		const isSameDay =
			this.mode === "single" ||
			this.startDateInput?.value === this.endDateInput?.value;
		if (isSameDay && startTime && endTime && endTime < startTime) {
			return t("modal.endTimeBeforeStart");
		}
		if (
			this.sourceRepeatCheckbox?.checked &&
			!isValidRecurrenceInterval(
				this.sourceRecurrenceIntervalInput?.value ?? "",
			)
		) {
			return t("modal.repeatIntervalInvalid");
		}
		const recurrenceAnchor = this.startDateInput?.value ?? "";
		if (
			this.sourceRepeatCheckbox?.checked &&
			this.sourceRecurrenceUntilDateInput?.value &&
			recurrenceAnchor &&
			this.sourceRecurrenceUntilDateInput.value < recurrenceAnchor
		) {
			return t("modal.repeatUntilBeforeStart");
		}
		if (this.startDateInput) {
			const start = this.startDateInput.value;
			const end =
				this.mode === "range" ? (this.endDateInput?.value ?? "") : start;
			if (!isValidDateStr(start) || !isValidDateStr(end)) {
				return t("modal.invalidDate");
			}
			if (start > end) return t("modal.invalidDateRange");
		}
		return null;
	}

	private async handleApplyChange(): Promise<void> {
		const validationError = this.getFileOptionsValidationError();
		if (validationError) {
			this.updateFileOptionsState();
			new Notice(validationError);
			return;
		}
		let fileToUpdate: TFile = this.file;

		try {
			fileToUpdate = await movePlannerFileToLocation(
				this.app,
				this.file,
				this.getFileOptionsFolderValue(),
				this.filenameInput.value,
			);
			this.file = fileToUpdate;
			const rawColor = this.colorInput.value.trim();
			const themeHex = getThemeAccentHex(
				this.contentEl.ownerDocument,
			).toLowerCase();
			const color =
				rawColor &&
				(toHex6(rawColor) ?? rawColor).toLowerCase() !== themeHex
					? rawColor
					: undefined;
			const todo = this.todoCheckbox.checked;
			const completed = this.completedCheckbox.checked;
			await updateFileColor(this.app, fileToUpdate, color);
			await updateFileTodoStatus(this.app, fileToUpdate, todo, completed);
			await updateFileNotifyMinutes(
				this.app,
				fileToUpdate,
				parseTimeValueToNotifyMinutes(this.notifyTimeInput.value),
			);
			await updateFileTimeRange(this.app, fileToUpdate, {
				startTime: normalizeTimeValue(this.startTimeInput.value),
				endTime: normalizeTimeValue(this.endTimeInput.value),
			});
			if (this.sourceRepeatCheckbox) {
				const existingSource = getRecurrenceSourceDefinition(
					this.app,
					fileToUpdate,
				);
				const anchorDate = this.getRecurrenceAnchorDate(fileToUpdate);
				if (anchorDate) {
					await this.app.fileManager.processFrontMatter(
						fileToUpdate,
						(frontmatter: Record<string, unknown>) => {
							applyRecurrenceSourceFrontmatter(
								frontmatter,
								this.getRecurrenceFormValue(),
								anchorDate,
								existingSource?.id,
							);
						},
					);
				}
			}
			this.onClosed();
			this.close();
		} catch (err) {
			if (
				(err as Error & { code?: string }).code ===
				"PLANNER_RENAME_CONFLICT"
			) {
				new Notice(t("modal.fileMoveConflict"));
				return;
			}
			if (
				(err as Error & { code?: string }).code ===
				"PLANNER_INVALID_FILENAME"
			) {
				new Notice(t("modal.fileNameNoPathSeparators"));
				return;
			}
			const msg =
				err instanceof Error
					? err.message
					: t("modal.failedToCreateFile");
			new Notice(msg);
		}
	}

	private handleDelete(): void {
		new DeleteConfirmModal(
			this.app,
			t("modal.deleteConfirm"),
			t("modal.deleteConfirmDesc", { path: this.file.path }),
			() => {
				void (async () => {
					await this.app.fileManager.trashFile(this.file);
					this.close();
					this.onClosed();
				})();
			},
		).open();
	}

	onClose(): void {
		this.previewComponent?.unload();
		this.previewComponent = null;
	}

	private async loadPreview(containerEl: HTMLElement): Promise<void> {
		try {
			const content = await this.app.vault.read(this.file);
			containerEl.empty();

			const lines = content.split("\n");
			const truncated =
				lines.length > FILE_PREVIEW_MAX_LINES
					? lines.slice(0, FILE_PREVIEW_MAX_LINES).join("\n") + "\n…"
					: content.length > FILE_PREVIEW_MAX_CHARS
						? content.slice(0, FILE_PREVIEW_MAX_CHARS) + "…"
						: content;

			if (!truncated.trim()) {
				containerEl.createSpan({
					text: t("modal.previewEmpty"),
					cls: "yearly-planner-file-preview-empty",
				});
				return;
			}

			const ext = (this.file.extension ?? "").toLowerCase();
			if (ext === "md" || ext === "markdown") {
				this.previewComponent = new Component();
				this.previewComponent.load();
				const inner = containerEl.createDiv("markdown-preview-view");
				await MarkdownRenderer.render(
					this.app,
					truncated,
					inner,
					this.file.path,
					this.previewComponent,
				);
			} else {
				const pre = containerEl.createEl("pre", {
					cls: "yearly-planner-file-preview-plain",
				});
				pre.setText(truncated);
			}
		} catch {
			containerEl.empty();
			containerEl.createSpan({
				text: t("modal.previewFailed"),
				cls: "yearly-planner-file-preview-error",
			});
		}
	}
}
