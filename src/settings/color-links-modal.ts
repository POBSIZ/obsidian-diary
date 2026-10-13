import { Modal, Notice, Setting, type TFile } from "obsidian";
import { t } from "../i18n";
import type DiaryObsidian from "../main";
import { configureUiModalSurface, createUiButton, createUiModalActionBar } from "../ui/components";
import {
	findMatchingColorFiles,
	getLinkedColorFiles,
	getPlannerColorPresetLabel,
	linkMatchingColorFiles,
	setFileColorSelection,
} from "../utils/planner-colors";
import { getPlannerMarkdownFiles } from "../views/yearly-planner/file-utils";

/** Shows exact note paths before any bulk frontmatter changes. Nothing is preselected. */
export class ColorLinksModal extends Modal {
	private readonly selected = new Set<TFile>();
	private targetId = "";
	private busy = false;

	constructor(private readonly plugin: DiaryObsidian, private readonly presetId: string,
		private readonly mode: "link" | "manage") {
		super(plugin.app);
	}

	onOpen(): void {
		this.render();
	}

	onClose(): void {
		this.contentEl.empty();
	}

	private render(): void {
		const preset = this.plugin.settings.colorPalette.find((entry) => entry.id === this.presetId);
		if (!preset) return;
		const { contentEl } = this;
		contentEl.empty();
		configureUiModalSurface(contentEl);
		contentEl.createEl("h2", { text: t(this.mode === "link"
			? "settings.linkExistingColors" : "settings.manageLinkedColors") });
		contentEl.createEl("p", { text: t(this.mode === "link"
			? "settings.linkExistingColorsDesc" : "settings.manageLinkedColorsDesc", {
			name: getPlannerColorPresetLabel(preset), color: preset.color,
		}) });
		const candidates = getPlannerMarkdownFiles(this.app,
			this.plugin.settings.plannerFolder, this.plugin.settings.plannerFileScope);
		const files = this.mode === "link"
			? findMatchingColorFiles(this.app, preset.id, candidates)
			: getLinkedColorFiles(this.app, preset.id, candidates);
		this.selected.clear();
		if (this.mode === "manage") {
			new Setting(contentEl).setName(t("settings.colorLinkAction"))
				.addDropdown((dropdown) => {
					dropdown.addOption("", t("settings.colorLinkDisconnect"));
					for (const target of this.plugin.settings.colorPalette) {
						if (!target.archived && target.id !== preset.id) dropdown.addOption(target.id, getPlannerColorPresetLabel(target));
					}
					dropdown.setValue(this.targetId).onChange((id) => { this.targetId = id; });
				});
		}
		if (files.length === 0) contentEl.createEl("p", { text: t("settings.colorLinkEmpty") });
		const list = contentEl.createDiv({ cls: "diary-settings-color-candidates" });
		const checkboxes: HTMLInputElement[] = [];
		let apply: HTMLButtonElement;
		const updateApply = (): void => { apply.disabled = this.busy || this.selected.size === 0; };
		for (const file of files) {
			const label = list.createEl("label", { cls: "diary-settings-color-candidate" });
			const checkbox = label.createEl("input", { attr: { type: "checkbox" } });
			label.createSpan({ text: file.path });
			checkbox.addEventListener("change", () => {
				if (checkbox.checked) this.selected.add(file);
				else this.selected.delete(file);
				updateApply();
			});
			checkboxes.push(checkbox);
		}
		const selectionActions = contentEl.createDiv({ cls: "diary-settings-color-selection-actions" });
		createUiButton(selectionActions, {
			text: t("settings.colorLinkSelectAll"), disabled: files.length === 0,
			onClick: () => {
				files.forEach((file) => this.selected.add(file));
				checkboxes.forEach((checkbox) => { checkbox.checked = true; });
				updateApply();
			},
		});
		createUiButton(selectionActions, {
			text: t("settings.colorLinkClear"), disabled: files.length === 0,
			onClick: () => {
				this.selected.clear();
				checkboxes.forEach((checkbox) => { checkbox.checked = false; });
				updateApply();
			},
		});
		const actions = createUiModalActionBar(contentEl, "diary-settings-color-link-actions");
		createUiButton(actions, { text: t("modal.cancel"), onClick: () => this.close() });
		apply = createUiButton(actions, {
			text: t("settings.colorLinkApply"), variant: "cta", disabled: true,
			onClick: async () => {
				if (this.busy || this.selected.size === 0) return;
				const selected = Array.from(this.selected);
				this.busy = true;
				updateApply();
				let changed = 0;
				let failed = 0;
				try {
					if (this.mode === "link") {
						const result = await linkMatchingColorFiles(this.app, preset.id, selected);
						changed = result.linked;
						failed = result.failed.length;
					} else {
						const target = this.plugin.settings.colorPalette.find((entry) => entry.id === this.targetId && !entry.archived);
						for (const file of selected) {
							try {
								await setFileColorSelection(this.app, file, target
									? { mode: "palette", id: target.id, color: target.color }
									: { mode: "fixed", color: preset.color });
								changed += 1;
							} catch { failed += 1; }
						}
					}
					new Notice(t("settings.colorLinkResult", { changed, failed }));
					this.plugin.refreshYearlyPlannerViews();
					this.plugin.refreshMonthlyPlannerViews();
					this.plugin.refreshMonthlyListPlannerViews();
					this.plugin.refreshDailyPlannerViews();
				} catch {
					new Notice(t("settings.colorLinkResult", { changed, failed: selected.length }));
				} finally {
					this.busy = false;
					this.render();
				}
			},
		});
	}
}
