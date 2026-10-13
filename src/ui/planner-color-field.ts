import { App, TFile } from "obsidian";
import { t } from "../i18n";
import {
	getFileColorSelection,
	getFileColorValues,
	getPlannerColorPalette,
	getPlannerColorPresetLabel,
	isValidPlannerColor,
	normalizeCssColor,
	resolvePlannerColorSelection,
	type PlannerNoteColorSelection,
} from "../utils/planner-colors";
import { createUiColorPresetButton, createUiFieldRow } from "./components";

/** The same color choices are used in creation and editing, including pop-out windows. */
export class PlannerColorField {
	private selection: PlannerNoteColorSelection;
	private readonly select: HTMLSelectElement;
	private readonly text: HTMLInputElement;
	private readonly picker: HTMLInputElement;
	private readonly description: HTMLElement;
	private readonly buttons: { id: string; button: HTMLButtonElement }[] = [];
	private readonly doc: Document;

	constructor(
		parent: HTMLElement,
		private readonly app: App,
		private readonly file?: TFile,
		private readonly onChange?: () => void,
	) {
		this.doc = parent.ownerDocument;
		this.selection = file ? getFileColorSelection(app, file) : { mode: "theme" };
		const row = createUiFieldRow(parent, "yearly-planner-create-file-row");
		row.createEl("label", { text: t("modal.color") });
		this.select = row.createEl("select", { cls: "diary-color-selection" });
		this.select.ariaLabel = t("colors.selectionLabel");
		this.select.createEl("option", { value: "theme", text: t("colors.theme") });
		const fm: unknown = file ? app.metadataCache.getFileCache(file)?.frontmatter?.recurrence_role : undefined;
		if (fm === "occurrence") this.select.createEl("option", { value: "inherit", text: t("colors.inherit") });
		const palette = getPlannerColorPalette(app);
		for (const preset of palette) {
			if (preset.archived && !(this.selection.mode === "palette" && this.selection.id === preset.id)) continue;
			const name = getPlannerColorPresetLabel(preset);
			this.select.createEl("option", {
				value: `palette:${preset.id}`,
				text: preset.archived ? `${name} (${t("colors.archived")})` : name,
			});
		}
		if (this.selection.mode === "palette") {
			const selection = this.selection;
			if (!palette.some((preset) => preset.id === selection.id)) {
				this.select.createEl("option", { value: `palette:${selection.id}`, text: t("colors.missing") });
			}
		}
		this.select.createEl("option", { value: "fixed", text: t("colors.fixed") });
		const wrap = row.createDiv({ cls: "yearly-planner-color-row" });
		const presets = wrap.createDiv({ cls: "yearly-planner-color-presets" });
		this.buttons.push({
			id: "theme",
			button: createUiColorPresetButton(presets, {
				classes: "yearly-planner-color-preset-btn diary-color-theme-button",
				color: "var(--interactive-accent)",
				label: t("colors.theme"),
				onClick: () => this.setSelection({ mode: "theme" }),
			}),
		});
		for (const preset of palette.filter((preset) => !preset.archived)) {
			this.buttons.push({
				id: `palette:${preset.id}`,
				button: createUiColorPresetButton(presets, {
					classes: "yearly-planner-color-preset-btn",
					color: preset.color,
					label: `${getPlannerColorPresetLabel(preset)} (${preset.color})`,
					onClick: () => this.setSelection({ mode: "palette", id: preset.id, color: preset.color }),
				}),
			});
		}
		this.picker = wrap.createEl("input", { type: "color", cls: "yearly-planner-color-picker" });
		this.picker.title = t("modal.pickColor");
		this.picker.ariaLabel = t("modal.pickColor");
		this.text = row.createEl("input", { type: "text", cls: "yearly-planner-filename-input diary-color-value" });
		this.text.title = t("modal.chipColorTitle");
		this.text.ariaLabel = t("modal.chipColorTitle");
		this.description = row.createDiv({ cls: "yearly-planner-create-file-hint diary-color-description" });
		this.picker.oninput = () => this.setSelection({ mode: "fixed", color: this.picker.value });
		this.text.oninput = () => {
			this.selection = { mode: "fixed", color: this.text.value.trim() };
			this.sync(false);
			this.onChange?.();
		};
		this.select.onchange = () => {
			const value = this.select.value;
			if (value === "inherit") this.setSelection({ mode: "inherit" });
			else if (value === "theme") this.setSelection({ mode: "theme" });
			else if (value === "fixed") this.setSelection({ mode: "fixed", color: normalizeCssColor(this.effectiveColor(), this.doc) ?? this.effectiveColor() });
			else {
				const preset = palette.find((entry) => `palette:${entry.id}` === value);
				if (preset) this.setSelection({ mode: "palette", id: preset.id, color: preset.color });
			}
		};
		this.sync();
	}

	getSelection(): PlannerNoteColorSelection {
		return { ...this.selection };
	}

	getValidationError(): string | null {
		return this.selection.mode === "fixed" && !isValidPlannerColor(this.selection.color, this.doc)
			? t("colors.invalid") : null;
	}

	getValues(): { color?: string; colorId?: string; inherit?: boolean } {
		if (this.file) return getFileColorValues(this.app, this.file, this.selection);
		if (this.selection.mode === "inherit") return {};
		return {
			color: resolvePlannerColorSelection(this.selection, getPlannerColorPalette(this.app)) ?? undefined,
			colorId: this.selection.mode === "palette" ? this.selection.id : undefined,
		};
	}

	private effectiveColor(): string {
		if (this.selection.mode === "inherit") return this.file ? getFileColorValues(this.app, this.file, this.selection).color ?? "var(--interactive-accent)" : "var(--interactive-accent)";
		return resolvePlannerColorSelection(this.selection, getPlannerColorPalette(this.app), "var(--interactive-accent)") ?? "var(--interactive-accent)";
	}

	private setSelection(selection: PlannerNoteColorSelection): void {
		this.selection = selection;
		this.sync();
		this.onChange?.();
	}

	private sync(updateText = true): void {
		const mode = this.selection.mode;
		const value = mode === "palette" ? `palette:${this.selection.id}` : mode;
		this.select.value = value;
		const color = this.effectiveColor();
		if (updateText) this.text.value = normalizeCssColor(color, this.doc) ?? color;
		this.picker.value = normalizeCssColor(color, this.doc) ?? "#7c3aed";
		for (const { id, button } of this.buttons) {
			const active = id === value;
			button.toggleClass("is-active", active);
			button.setAttribute("aria-pressed", String(active));
		}
		this.description.setText(mode === "palette" ? t("colors.linkedDescription") : mode === "inherit" ? t("colors.inheritDescription") : mode === "fixed" ? t("colors.fixedDescription") : t("colors.theme"));
	}
}
