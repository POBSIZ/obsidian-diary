import {
	App,
	Notice,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";
import {
	LOCALE_OPTIONS,
	normalizeLocale,
	setLocale,
	t,
	type Locale,
} from "./i18n";
import DiaryObsidian from "./main";
import {
	type AlternateCalendarId,
	type AlternateCalendarSelection,
} from "./utils/alternate-calendars";
import type { CustomCalendarProfile } from "./utils/custom-calendars";
import { renderCalendarOverlaySettings } from "./settings/custom-calendar-settings";
import { configureFeedbackSetting } from "./settings/feedback-settings";
import { renderDateFormatSettings } from "./settings/date-format-settings";
import { renderPlannerColorSettings } from "./settings/planner-color-settings";
import { renderExternalCalendarTimeZoneSetting } from "./settings/external-calendar-timezone-settings";
import { DEFAULT_DATE_FORMATS, type DateFormatsConfiguration } from "./utils/date-formats";
import {
	DEFAULT_COLOR_PALETTE,
	DEFAULT_HOLIDAY_COLOR,
	type PlannerColorPreset,
	type PlannerColorSelection,
} from "./utils/planner-colors";
import {
	type ExternalCalendarCache,
	type ExternalCalendarSettings,
} from "./utils/external-calendars";
import { getPlanNotePath, isValidPlanNoteTemplate } from "./utils/plan-note-path";
import type { PlannerFileScope } from "./views/yearly-planner/file-utils";
import { PLANNER_VIEW_OPTIONS, type PlannerViewMode } from "./views/planner-layout";
import { renderExternalCalendarSettings } from "./settings/external-calendar-settings";

export interface DiaryObsidianSettings {
	locale: Locale;
	plannerFolder: string;
	plannerFileScope: PlannerFileScope;
	weekStart: 0 | 1;
	sidebarDefaultView: PlannerViewMode;
	yearlyPlanNotePath: string;
	monthlyPlanNotePath: string;
	yearlyPlanNotePathGrammarVersion?: 1 | 2;
	monthlyPlanNotePathGrammarVersion?: 1 | 2;
	dateFormats: DateFormatsConfiguration;
	colorPalette: PlannerColorPreset[];
	holidayColor: PlannerColorSelection;
	/** Legacy field: retained for migration; creation uses dateFormats defaults. */
	dateFormat: string;
	showHolidays: boolean;
	holidayCountry: string;
	alternateCalendarId: AlternateCalendarSelection;
	customCalendarProfiles: CustomCalendarProfile[];
	selectedCustomCalendarId: string;
	externalCalendars: ExternalCalendarSettings[];
	externalCalendarTimeZone: string;
	externalCalendarCaches: ExternalCalendarCache[];
	externalCalendarAutoRefreshMigrated: boolean;
	externalCalendarYearlyVisibilityMigrated: boolean;
	/** Legacy migration field from an interim multi-calendar toggle build. */
	enabledAlternateCalendars?: AlternateCalendarId[];
	/** Legacy migration field from the earlier single Korean-lunar toggle. */
	showLunarDates?: boolean;
	/** Mobile only: minimum bottom padding (rem), combined with Obsidian navbar clearance. */
	mobileBottomPadding: number;
	/** Mobile only: month cell width (rem). 0 = use default. */
	mobileCellWidth: number;
	/** Whether the plan note panel (document preview) is expanded. Persists across devices via vault sync. */
	planNotePanelExpanded?: boolean;
	/** Mobile-only plan note expanded state. Defaults collapsed until toggled on mobile. */
	mobilePlanNotePanelExpanded?: boolean;
	/** Month columns expanded in the yearly planner. Persists across reloads. */
	yearlyPlannerExpandedMonths: number[];
}

export const DEFAULT_SETTINGS: DiaryObsidianSettings = {
	locale: "en",
	plannerFolder: "Planner",
	plannerFileScope: "vault",
	weekStart: 0,
	sidebarDefaultView: "monthly",
	yearlyPlanNotePath: "",
	monthlyPlanNotePath: "",
	dateFormats: DEFAULT_DATE_FORMATS,
	colorPalette: DEFAULT_COLOR_PALETTE.map((preset) => ({ ...preset })),
	holidayColor: DEFAULT_HOLIDAY_COLOR,
	dateFormat: "YYYY-MM-DD",
	showHolidays: true,
	holidayCountry: "KR",
	alternateCalendarId: "",
	customCalendarProfiles: [],
	selectedCustomCalendarId: "",
	externalCalendars: [],
	externalCalendarTimeZone: "device",
	externalCalendarCaches: [],
	externalCalendarAutoRefreshMigrated: false,
	externalCalendarYearlyVisibilityMigrated: false,
	mobileBottomPadding: 3.5,
	mobileCellWidth: 4.5,
	planNotePanelExpanded: true,
	mobilePlanNotePanelExpanded: false,
	yearlyPlannerExpandedMonths: [],
};

export class DiaryObsidianSettingTab extends PluginSettingTab {
	plugin: DiaryObsidian;
	private readonly planNotePathPreviewUpdaters = new Map<HTMLElement, () => void>();

	constructor(app: App, plugin: DiaryObsidian) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/** Obsidian 1.13+ uses these definitions for rendering and settings search. */
	getSettingDefinitions() {
		return [
			{
				name: t("settings.language"),
				desc: t("settings.languageDesc"),
				control: {
					type: "dropdown",
					key: "locale",
					options: Object.fromEntries(
						LOCALE_OPTIONS.map((option) => [option.value, option.label]),
					),
				},
			},
			{
				name: t("settings.plannerFolder"),
				desc: t("settings.plannerFolderDesc"),
				control: {
					type: "text",
					key: "plannerFolder",
					defaultValue: "Planner",
					placeholder: "Planner",
				},
			},
			{
				name: t("settings.plannerFileScope"),
				desc: t("settings.plannerFileScopeDesc"),
				control: {
					type: "dropdown",
					key: "plannerFileScope",
					defaultValue: "vault",
					options: {
						vault: t("settings.plannerFileScopeVault"),
						plannerFolder: t("settings.plannerFileScopeFolder"),
					},
				},
			},
			{
				name: t("settings.weekStart"),
				desc: t("settings.weekStartDesc"),
				control: {
					type: "dropdown",
					key: "weekStart",
					options: { "0": t("settings.sunday"), "1": t("settings.monday") },
				},
			},
			{
				name: t("settings.sidebarDefaultView"),
				desc: t("settings.sidebarDefaultViewDesc"),
				control: {
					type: "dropdown",
					key: "sidebarDefaultView",
					defaultValue: "monthly",
					options: Object.fromEntries(PLANNER_VIEW_OPTIONS.map((option) => [option.mode, t(option.labelKey)])),
				},
			},
			...(["yearly", "monthly"] as const).map((kind) => ({
				name: t(`settings.${kind}PlanNotePath`),
				desc: t(`settings.${kind}PlanNotePathDesc`),
				render: (setting: Setting) =>
					this.renderPlanNotePathSetting(setting, kind),
			})),
			{
				name: t("settings.dateFormats"),
				desc: t("settings.dateFormatsDesc"),
				render: (setting: Setting) => {
					setting.settingEl.empty();
					renderDateFormatSettings(setting.settingEl, this.plugin);
				},
			},
			{
				name: t("settings.colorPalette"),
				desc: t("settings.colorPaletteDesc"),
				aliases: [t("settings.holidayColor"), t("settings.linkExistingColors")],
				render: (setting: Setting) => {
					setting.settingEl.empty();
					renderPlannerColorSettings(setting.settingEl, this.plugin);
				},
			},
			{
				name: t("settings.showHolidays"),
				desc: t("settings.showHolidaysDesc"),
				control: { type: "toggle", key: "showHolidays" },
			},
			{
				name: t("settings.holidayCountry"),
				desc: t("settings.holidayCountryDesc"),
				control: {
					type: "dropdown",
					key: "holidayCountry",
					options: {
						"": t("country.none"),
						KR: t("country.KR"),
						US: t("country.US"),
						JP: t("country.JP"),
						CN: t("country.CN"),
						GB: t("country.GB"),
						DE: t("country.DE"),
						ES: t("country.ES"),
						FR: t("country.FR"),
						AU: t("country.AU"),
						CA: t("country.CA"),
						TW: t("country.TW"),
					},
				},
			},
			{
				name: t("settings.calendarOverlay"),
				desc: t("settings.calendarOverlayDesc"),
				aliases: [
					t("settings.calendarOverlayMode"),
					t("settings.customCalendars"),
				],
				render: (setting: Setting) => {
					setting.settingEl.empty();
					renderCalendarOverlaySettings(setting.settingEl, this.plugin);
				},
			},
			{
				name: t("settings.externalCalendars"),
				desc: t("settings.externalCalendarsDesc"),
				aliases: [
					t("settings.externalCalendarRefreshAll"),
					t("settings.externalCalendarAdd"),
				],
				render: (setting: Setting) => {
					setting.settingEl.empty();
					this.renderExternalCalendars(setting.settingEl);
				},
			},
			{
				name: t("settings.externalCalendarTimeZone"),
				desc: t("settings.externalCalendarTimeZoneDesc"),
				render: (setting: Setting) => renderExternalCalendarTimeZoneSetting(setting, this.plugin),
			},
			{
				name: t("settings.mobileBottomPadding"),
				desc: t("settings.mobileBottomPaddingDesc"),
				control: {
					type: "slider",
					key: "mobileBottomPadding",
					min: 0,
					max: 8,
					step: 0.5,
				},
			},
			{
				name: t("settings.mobileCellWidth"),
				desc: t("settings.mobileCellWidthDesc"),
				control: {
					type: "slider",
					key: "mobileCellWidth",
					min: 0,
					max: 8,
					step: 0.25,
				},
			},
			{
				name: t("settings.feedback"),
				desc: t("settings.feedbackDesc"),
				aliases: [
					t("settings.shareFeedback"),
					t("settings.reportBug"),
					t("settings.suggestFeature"),
				],
				render: (setting: Setting) => {
					configureFeedbackSetting(setting);
				},
			},
		];
	}

	getControlValue(key: string): unknown {
		return this.plugin.settings[key as keyof DiaryObsidianSettings];
	}

	refreshPlanNotePathPreviews(): void {
		for (const [element, update] of this.planNotePathPreviewUpdaters) {
			if (!element.isConnected) this.planNotePathPreviewUpdaters.delete(element);
			else update();
		}
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		switch (key) {
			case "locale":
				this.plugin.settings.locale = normalizeLocale(String(value));
				setLocale(this.plugin.settings.locale);
				await this.plugin.saveSettings(["locale"]);
				this.update();
				return;
			case "plannerFolder":
				this.plugin.settings.plannerFolder = String(value).trim() || "Planner";
				break;
			case "plannerFileScope":
				this.plugin.settings.plannerFileScope =
					value === "plannerFolder" ? "plannerFolder" : "vault";
				break;
			case "weekStart":
				this.plugin.settings.weekStart = Number(value) === 1 ? 1 : 0;
				break;
			case "sidebarDefaultView":
				await this.plugin.setSidebarDefaultView(value);
				return;
			case "yearlyPlanNotePath":
			case "monthlyPlanNotePath": {
				const kind = key === "yearlyPlanNotePath" ? "yearly" : "monthly";
				const template = String(value).trim();
				if (!isValidPlanNoteTemplate(template, kind)) {
					new Notice(t(`settings.${kind}PlanNotePathError`));
					return;
				}
				this.plugin.settings[key] = template;
				this.plugin.settings[`${kind}PlanNotePathGrammarVersion`] = 2;
				break;
			}
			case "dateFormat":
				this.plugin.settings.dateFormat = String(value).trim() || "YYYY-MM-DD";
				break;
			case "showHolidays":
				this.plugin.settings.showHolidays = Boolean(value);
				break;
			case "holidayCountry":
				this.plugin.settings.holidayCountry = String(value);
				break;
			case "mobileBottomPadding":
				this.plugin.settings.mobileBottomPadding = Number(value);
				break;
			case "mobileCellWidth":
				this.plugin.settings.mobileCellWidth = Number(value);
				break;
			default:
				return;
		}
		const changedKeys: (keyof DiaryObsidianSettings)[] = [key];
		if (key === "yearlyPlanNotePath") changedKeys.push("yearlyPlanNotePathGrammarVersion");
		if (key === "monthlyPlanNotePath") changedKeys.push("monthlyPlanNotePathGrammarVersion");
		await this.plugin.saveSettings(changedKeys);
	}

	private renderPlanNotePathSetting(
		setting: Setting,
		kind: "yearly" | "monthly",
	): void {
		const key = `${kind}PlanNotePath` as const;
		const description = t(`settings.${kind}PlanNotePathDesc`);
		const updateDescription = (template: string, grammarVersion: 1 | 2): boolean => {
			const valid = isValidPlanNoteTemplate(template, kind, grammarVersion);
			const now = new Date();
			const path = getPlanNotePath(kind, this.plugin.settings.plannerFolder, template,
				now.getFullYear(), now.getMonth() + 1, grammarVersion);
			const existing = this.app.vault.getAbstractFileByPath(path);
			setting.setDesc(valid ? `${description} ${t("settings.planNotePathPreview", { path })} ${t(existing instanceof TFile
				? "settings.planNotePathExists" : existing ? "settings.planNotePathBlocked" : "settings.planNotePathNew")}`
				: t(`settings.${kind}PlanNotePathError`));
			return valid;
		};
		setting.settingEl.addClass("diary-plan-note-path-setting");
		setting
			.setName(t(`settings.${kind}PlanNotePath`))
			.setDesc(description)
			.addText((text) => text
				.setPlaceholder(kind === "yearly" ? "Notes/Yearly/YYYY.md" : "Notes/Monthly/YYYY-MM.md")
				.setValue(this.plugin.settings[key] ?? "")
				.onChange(async (value) => {
					const template = value.trim();
					const valid = updateDescription(template, 2);
					setting.settingEl.toggleClass("is-invalid", !valid);
					text.inputEl.setAttribute("aria-invalid", String(!valid));
					if (!valid) return;
					this.plugin.settings[key] = template;
					this.plugin.settings[`${kind}PlanNotePathGrammarVersion`] = 2;
					await this.plugin.saveSettings([key, `${kind}PlanNotePathGrammarVersion`]);
				}));
		updateDescription(this.plugin.settings[key] ?? "", this.plugin.settings[`${kind}PlanNotePathGrammarVersion`] ?? 1);
		this.planNotePathPreviewUpdaters.set(setting.settingEl, () => {
			if (setting.settingEl.querySelector<HTMLInputElement>("input")?.getAttribute("aria-invalid") === "true") return;
			updateDescription(this.plugin.settings[key] ?? "", this.plugin.settings[`${kind}PlanNotePathGrammarVersion`] ?? 1);
		});
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		this.planNotePathPreviewUpdaters.clear();

		new Setting(containerEl)
			.setName(t("settings.language"))
			.setDesc(t("settings.languageDesc"))
			.addDropdown((dropdown) => {
				for (const option of LOCALE_OPTIONS) {
					dropdown.addOption(option.value, option.label);
				}
				return dropdown
					.setValue(normalizeLocale(this.plugin.settings.locale))
					.onChange(async (value) => {
						this.plugin.settings.locale = normalizeLocale(value);
						setLocale(this.plugin.settings.locale);
						await this.plugin.saveSettings(["locale"]);
						this.display();
					});
			});

		new Setting(containerEl)
			.setName(t("settings.plannerFolder"))
			.setDesc(t("settings.plannerFolderDesc"))
			.addText((text) =>
				text
					.setPlaceholder("Planner")
					.setValue(this.plugin.settings.plannerFolder)
					.onChange(async (value) => {
						this.plugin.settings.plannerFolder = value || "Planner";
						await this.plugin.saveSettings(["plannerFolder"]);
					}),
			);

		new Setting(containerEl)
			.setName(t("settings.plannerFileScope"))
			.setDesc(t("settings.plannerFileScopeDesc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("vault", t("settings.plannerFileScopeVault"))
					.addOption(
						"plannerFolder",
						t("settings.plannerFileScopeFolder"),
					)
					.setValue(this.plugin.settings.plannerFileScope ?? "vault")
					.onChange(async (value) => {
						this.plugin.settings.plannerFileScope =
							value === "plannerFolder" ? "plannerFolder" : "vault";
						await this.plugin.saveSettings(["plannerFileScope"]);
					}),
			);

		new Setting(containerEl)
			.setName(t("settings.weekStart"))
			.setDesc(t("settings.weekStartDesc"))
			.addDropdown((dropdown) => dropdown
				.addOption("0", t("settings.sunday"))
				.addOption("1", t("settings.monday"))
				.setValue(String(this.plugin.settings.weekStart ?? 0))
				.onChange(async (value) => {
					this.plugin.settings.weekStart = value === "1" ? 1 : 0;
					await this.plugin.saveSettings(["weekStart"]);
				}));

		new Setting(containerEl)
			.setName(t("settings.sidebarDefaultView"))
			.setDesc(t("settings.sidebarDefaultViewDesc"))
			.addDropdown((dropdown) => {
				for (const option of PLANNER_VIEW_OPTIONS) dropdown.addOption(option.mode, t(option.labelKey));
				return dropdown.setValue(this.plugin.settings.sidebarDefaultView)
					.onChange(async (value) => { await this.setControlValue("sidebarDefaultView", value); });
			});

		for (const kind of ["yearly", "monthly"] as const) {
			this.renderPlanNotePathSetting(new Setting(containerEl), kind);
		}

		renderDateFormatSettings(containerEl, this.plugin);
		renderPlannerColorSettings(containerEl, this.plugin);

		new Setting(containerEl)
			.setName(t("settings.showHolidays"))
			.setDesc(t("settings.showHolidaysDesc"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showHolidays)
					.onChange(async (value) => {
						this.plugin.settings.showHolidays = value;
						await this.plugin.saveSettings(["showHolidays"]);
					}),
			);

		new Setting(containerEl)
			.setName(t("settings.holidayCountry"))
			.setDesc(t("settings.holidayCountryDesc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("", t("country.none"))
					.addOption("KR", t("country.KR"))
					.addOption("US", t("country.US"))
					.addOption("JP", t("country.JP"))
					.addOption("CN", t("country.CN"))
					.addOption("GB", t("country.GB"))
					.addOption("DE", t("country.DE"))
					.addOption("ES", t("country.ES"))
					.addOption("FR", t("country.FR"))
					.addOption("AU", t("country.AU"))
					.addOption("CA", t("country.CA"))
					.addOption("TW", t("country.TW"))
					.setValue(this.plugin.settings.holidayCountry || "")
					.onChange(async (value) => {
						this.plugin.settings.holidayCountry = value;
						await this.plugin.saveSettings(["holidayCountry"]);
					}),
			);

		renderCalendarOverlaySettings(containerEl, this.plugin);
		this.renderExternalCalendars(containerEl);
		renderExternalCalendarTimeZoneSetting(new Setting(containerEl), this.plugin);

		new Setting(containerEl)
			.setName(t("settings.mobileBottomPadding"))
			.setDesc(t("settings.mobileBottomPaddingDesc"))
			.addSlider((slider) =>
				slider
					.setLimits(0, 8, 0.5)
					.setValue(this.plugin.settings.mobileBottomPadding)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.mobileBottomPadding = value;
						await this.plugin.saveSettings(["mobileBottomPadding"]);
					}),
			);

		new Setting(containerEl)
			.setName(t("settings.mobileCellWidth"))
			.setDesc(t("settings.mobileCellWidthDesc"))
			.addSlider((slider) =>
				slider
					.setLimits(0, 8, 0.25)
					.setValue(this.plugin.settings.mobileCellWidth)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.mobileCellWidth = value;
						await this.plugin.saveSettings(["mobileCellWidth"]);
					}),
				);

		configureFeedbackSetting(new Setting(containerEl));
	}

	private renderExternalCalendars(containerEl: HTMLElement): void {
		renderExternalCalendarSettings(containerEl, this.plugin);
	}
}
