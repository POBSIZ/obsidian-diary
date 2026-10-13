import { Setting } from "obsidian";
import { t } from "../i18n";
import type DiaryObsidian from "../main";
import { createUiButton, createUiDisclosure } from "../ui/components";
import { getPlannerColorPresetLabel, type PlannerColorPreset } from "../utils/planner-colors";
import { ColorLinksModal } from "./color-links-modal";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function getCurrentPreset(plugin: DiaryObsidian, id: string): PlannerColorPreset | undefined {
	return plugin.settings.colorPalette.find((preset) => preset.id === id);
}

/** Palette identities are retained on archive so linked notes keep their color. */
export function renderPlannerColorSettings(parent: HTMLElement, plugin: DiaryObsidian): void {
	const mount = parent.createDiv({ cls: "diary-settings-colors" });
	const render = (): void => {
		mount.empty();
		const section = createUiDisclosure(mount, { classes: "diary-settings-panel", open: true });
		section.createEl("summary", { text: t("settings.colorPalette") });
		const body = section.createDiv({ cls: "diary-settings-panel-body" });
		body.createEl("p", { text: t("settings.colorPaletteDesc"), cls: "setting-item-description" });
		for (const preset of plugin.settings.colorPalette) renderPreset(body, plugin, preset, render);
		createUiButton(body, {
			text: t("settings.colorPaletteAdd"), icon: "plus",
			onClick: async () => {
				plugin.settings.colorPalette.push({
					id: `color-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
					name: t("settings.colorPaletteNew"), color: "#3b82f6",
				});
				await plugin.saveSettings();
				render();
			},
		});
		renderHolidayColor(body, plugin, render);
	};
	render();
}

function renderPreset(parent: HTMLElement, plugin: DiaryObsidian,
	preset: PlannerColorPreset, rerender: () => void): void {
	const card = parent.createDiv({ cls: "diary-settings-palette-card" });
	const setting = new Setting(card).setName(getPlannerColorPresetLabel(preset));
	if (preset.archived) {
		setting.setDesc(t("settings.colorPaletteArchivedDesc"));
		setting.addButton((button) => button.setButtonText(t("settings.colorPaletteRestore"))
			.onClick(async () => {
				const current = getCurrentPreset(plugin, preset.id);
				if (current) current.archived = false;
				await plugin.saveSettings();
				rerender();
			}));
	} else {
		setting.addText((text) => text.setPlaceholder(getPlannerColorPresetLabel(preset))
			.setValue(preset.name).onChange(async (name) => {
				const current = getCurrentPreset(plugin, preset.id);
				if (!current) return;
				current.name = name.trim();
				setting.setName(getPlannerColorPresetLabel(current));
				await plugin.saveSettings();
			}));
		renderHexColor(card, preset.color, async (color) => {
			const current = getCurrentPreset(plugin, preset.id);
			if (!current) return;
			current.color = color;
			await plugin.saveSettings();
		});
		setting.addButton((button) => button.setButtonText(t("settings.colorPaletteArchive"))
			.onClick(async () => {
				const current = getCurrentPreset(plugin, preset.id);
				if (current) current.archived = true;
				await plugin.saveSettings();
				rerender();
			}));
		createUiButton(card, {
			text: t("settings.linkExistingColors"),
			onClick: () => new ColorLinksModal(plugin, preset.id, "link").open(),
		});
	}
	createUiButton(card, {
		text: t("settings.manageLinkedColors"),
		onClick: () => new ColorLinksModal(plugin, preset.id, "manage").open(),
	});
}

function renderHolidayColor(parent: HTMLElement, plugin: DiaryObsidian, rerender: () => void): void {
	const selection = plugin.settings.holidayColor;
	new Setting(parent).setName(t("settings.holidayColor")).setDesc(t("settings.holidayColorDesc"))
		.addDropdown((dropdown) => {
			dropdown.addOption("theme", t("colors.theme")).addOption("fixed", t("colors.fixed"));
			for (const preset of plugin.settings.colorPalette.filter((entry) => !entry.archived)) {
				dropdown.addOption(preset.id, getPlannerColorPresetLabel(preset));
			}
			if (selection.mode === "palette" &&
				!plugin.settings.colorPalette.some((preset) => preset.id === selection.id && !preset.archived)) {
				const preset = getCurrentPreset(plugin, selection.id);
				dropdown.addOption(selection.id, `${preset ? getPlannerColorPresetLabel(preset) : t("colors.missing")} (${t("colors.archived")})`);
			}
			dropdown.setValue(selection.mode === "palette" ? selection.id : selection.mode).onChange(async (value) => {
				if (value === "theme") plugin.settings.holidayColor = { mode: "theme" };
				else if (value === "fixed") plugin.settings.holidayColor = { mode: "fixed", color: "#e11d48" };
				else {
					const preset = getCurrentPreset(plugin, value);
					if (!preset || preset.archived) return;
					plugin.settings.holidayColor = { mode: "palette", id: preset.id, color: preset.color };
				}
				await plugin.saveSettings();
				rerender();
			});
		});
	if (selection.mode === "fixed") renderHexColor(parent, selection.color, async (color) => {
		plugin.settings.holidayColor = { mode: "fixed", color };
		await plugin.saveSettings();
	});
}

function renderHexColor(parent: HTMLElement, initial: string,
	onChange: (color: string) => Promise<void>): void {
	const setting = new Setting(parent).setName(t("settings.colorValue"));
	const colorInput = setting.controlEl.createEl("input", {
		attr: { type: "color", "aria-label": t("settings.colorValue") },
	});
	colorInput.value = initial;
	setting.addText((text) => {
		text.setValue(initial).setPlaceholder(initial).onChange(async (value) => {
			const valid = HEX_COLOR.test(value.trim());
			text.inputEl.setAttribute("aria-invalid", String(!valid));
			setting.setDesc(valid ? "" : t("colors.invalid"));
			if (!valid) return;
			colorInput.value = value.trim();
			await onChange(value.trim());
		});
		colorInput.addEventListener("change", () => {
			text.setValue(colorInput.value);
			text.inputEl.setAttribute("aria-invalid", "false");
			setting.setDesc("");
			void onChange(colorInput.value);
		});
	});
}
