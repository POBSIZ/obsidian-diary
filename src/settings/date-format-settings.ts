import { Modal, Setting } from "obsidian";
import { t } from "../i18n";
import type DiaryObsidian from "../main";
import { configureUiModalSurface, createUiButton, createUiDisclosure, createUiModalActionBar } from "../ui/components";
import {
	previewDateFormat,
	recognizePlannerBasename,
	recognizeRepresentativeBasename,
	validateDateFormat,
	type DateFormatKind,
} from "../utils/date-formats";
import { getPlannerMarkdownFiles } from "../views/yearly-planner/file-utils";

/** Shared by the legacy settings tab and Obsidian 1.13+ setting definitions. */
export function renderDateFormatSettings(parent: HTMLElement, plugin: DiaryObsidian): void {
	const mount = parent.createDiv({ cls: "diary-settings-date-formats" });
	const now = new Date();
	const render = (): void => {
		mount.empty();
		const section = createUiDisclosure(mount, {
			classes: "diary-settings-panel",
			open: true,
		});
		section.createEl("summary", { text: t("settings.dateFormats") });
		const body = section.createDiv({ cls: "diary-settings-panel-body" });
		body.createEl("p", { text: t("settings.dateFormatsDesc"), cls: "setting-item-description" });
		const ambiguity = body.createDiv({ cls: "diary-settings-format-ambiguity" });
		const updateAmbiguity = (): void => {
			ambiguity.empty();
			const files = getPlannerMarkdownFiles(plugin.app, plugin.settings.plannerFolder,
				plugin.settings.plannerFileScope).filter((file) =>
					recognizePlannerBasename(file.basename).status === "ambiguous" ||
					recognizeRepresentativeBasename("monthly", file.basename).status === "ambiguous" ||
					recognizeRepresentativeBasename("yearly", file.basename).status === "ambiguous");
			if (files.length === 0) return;
			ambiguity.createEl("p", { text: t("settings.dateFormatAmbiguous", { count: files.length }), attr: { role: "status" } });
			const details = createUiDisclosure(ambiguity, { classes: "diary-settings-format-conflicts" });
			details.createEl("summary", { text: t("settings.dateFormatAmbiguousFiles") });
			const list = details.createEl("ul");
			for (const file of files) list.createEl("li", { text: file.path });
		};
		updateAmbiguity();
		for (const kind of ["daily", "monthly", "yearly"] as const) {
			const group = plugin.settings.dateFormats[kind];
			const groupEl = body.createDiv({ cls: "diary-settings-format-group" });
			groupEl.createEl("h4", { text: t(`settings.dateFormats.${kind}`) });
			new Setting(groupEl)
				.setName(t("settings.dateFormatDefault"))
				.setDesc(t("settings.dateFormatDefaultDesc"))
				.addDropdown((dropdown) => {
					for (const entry of group.formats) dropdown.addOption(entry.id, entry.format);
					dropdown.setValue(group.defaultFormatId).onChange(async (id) => {
						plugin.settings.dateFormats[kind].defaultFormatId = id;
						await plugin.saveSettings();
						plugin.settingTab?.refreshPlanNotePathPreviews();
						render();
					});
				});
			for (const entry of group.formats) {
				const setting = new Setting(groupEl).setName(t("settings.dateFormatRecognized"));
				const updateDescription = (format: string): boolean => {
					const valid = validateDateFormat(format, kind).valid &&
						!plugin.settings.dateFormats[kind].formats.some((other) => other.id !== entry.id && other.format === format);
					const preview = valid ? previewDateFormat(format, kind,
						now.getFullYear(), now.getMonth() + 1, now.getDate()) : null;
					setting.setDesc(valid && preview
						? t("settings.dateFormatPreview", { filename: `${preview}.md` })
						: t("settings.dateFormatInvalid"));
					setting.settingEl.toggleClass("is-invalid", !valid);
					return valid;
				};
				updateDescription(entry.format);
				setting.addText((text) => text.setValue(entry.format).onChange(async (value) => {
					const format = value.trim();
					const valid = updateDescription(format);
					text.inputEl.setAttribute("aria-invalid", String(!valid));
					if (!valid) return;
					const current = plugin.settings.dateFormats[kind].formats.find((other) => other.id === entry.id);
					if (!current) return;
					current.format = format;
					await plugin.saveSettings();
					plugin.settingTab?.refreshPlanNotePathPreviews();
					updateAmbiguity();
					groupEl.querySelectorAll<HTMLOptionElement>("option").forEach((option) => {
						if (option.value === entry.id) option.textContent = format;
					});
				}));
				setting.addButton((button) => button.setButtonText(t("settings.dateFormatRemove"))
					.setDisabled(group.formats.length === 1)
					.onClick(() => {
						const current = plugin.settings.dateFormats[kind];
						if (current.formats.length === 1) return;
						const remove = async (): Promise<void> => {
							const latest = plugin.settings.dateFormats[kind];
							latest.formats = latest.formats.filter((other) => other.id !== entry.id);
							if (latest.defaultFormatId === entry.id) latest.defaultFormatId = latest.formats[0]!.id;
							await plugin.saveSettings();
							plugin.settingTab?.refreshPlanNotePathPreviews();
							render();
						};
						const affected = getPlannerMarkdownFiles(plugin.app, plugin.settings.plannerFolder,
							plugin.settings.plannerFileScope).filter((file) => {
								if (kind === "daily") {
									const result = recognizePlannerBasename(file.basename);
									return result.status === "matched" && result.value.formatId === entry.id;
								}
								const result = recognizeRepresentativeBasename(kind, file.basename);
								return result.status === "matched" && result.formatId === entry.id;
							});
						if (affected.length === 0) { void remove(); return; }
						const modal = new Modal(plugin.app);
						configureUiModalSurface(modal.contentEl);
						modal.contentEl.createEl("h2", { text: t("settings.dateFormatRemove") });
						modal.contentEl.createEl("p", { text: t("settings.dateFormatRemoveAffected", { count: affected.length }) });
						const list = modal.contentEl.createEl("ul", { cls: "diary-settings-color-candidates" });
						for (const file of affected) list.createEl("li", { text: file.path });
						const actions = createUiModalActionBar(modal.contentEl, "diary-settings-format-remove-actions");
						createUiButton(actions, { text: t("modal.cancel"), onClick: () => modal.close() });
						createUiButton(actions, { text: t("settings.dateFormatRemove"), onClick: async () => { await remove(); modal.close(); } });
						modal.open();
					}));
			}
			renderAddFormat(groupEl, plugin, kind, render);
		}
	};
	render();
}

function renderAddFormat(parent: HTMLElement, plugin: DiaryObsidian,
	kind: DateFormatKind, rerender: () => void): void {
	let draft = "";
	const setting = new Setting(parent).setName(t("settings.dateFormatAdd"));
	const add = createUiButton(setting.controlEl, {
		text: t("settings.dateFormatAdd"), disabled: true,
		onClick: async () => {
			const group = plugin.settings.dateFormats[kind];
			if (!validateDateFormat(draft, kind).valid || group.formats.some((entry) => entry.format === draft)) return;
			group.formats.push({ id: `format-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, format: draft });
			await plugin.saveSettings();
			plugin.settingTab?.refreshPlanNotePathPreviews();
			rerender();
		},
	});
	setting.addText((text) => text
		.setPlaceholder(kind === "daily" ? "YYYY-[M]MM-DD" : kind === "monthly" ? "YYYY-[M]MM" : "YYYY-[Year]")
		.onChange((value) => {
			draft = value.trim();
			const valid = validateDateFormat(draft, kind).valid &&
				!plugin.settings.dateFormats[kind].formats.some((entry) => entry.format === draft);
			add.disabled = !valid;
			text.inputEl.setAttribute("aria-invalid", String(Boolean(draft) && !valid));
			setting.setDesc(draft && !valid ? t("settings.dateFormatInvalid") : "");
		}));
	setting.controlEl.appendChild(add);
}
