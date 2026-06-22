import { App, Modal, Notice, PluginSettingTab, Setting } from "obsidian";
import { setLocale, t } from "./i18n";
import DiaryObsidian from "./main";
import {
	type AlternateCalendarId,
	type AlternateCalendarSelection,
} from "./utils/alternate-calendars";
import type { CustomCalendarProfile } from "./utils/custom-calendars";
import { renderCalendarOverlaySettings } from "./settings/custom-calendar-settings";
import {
	createExternalCalendarId,
	getDefaultExternalCalendarColor,
	getExternalCalendarCache,
	type ExternalCalendarCache,
	type ExternalCalendarSettings,
} from "./utils/external-calendars";
import type { PlannerFileScope } from "./views/yearly-planner/file-utils";

export interface DiaryObsidianSettings {
	locale: "en" | "ko";
	plannerFolder: string;
	plannerFileScope: PlannerFileScope;
	dateFormat: string;
	showHolidays: boolean;
	holidayCountry: string;
	alternateCalendarId: AlternateCalendarSelection;
	customCalendarProfiles: CustomCalendarProfile[];
	selectedCustomCalendarId: string;
	externalCalendars: ExternalCalendarSettings[];
	externalCalendarCaches: ExternalCalendarCache[];
	/** Legacy migration field from an interim multi-calendar toggle build. */
	enabledAlternateCalendars?: AlternateCalendarId[];
	/** Legacy migration field from the earlier single Korean-lunar toggle. */
	showLunarDates?: boolean;
	/** Mobile only: bottom padding (rem) so table isn't covered by Obsidian tools tab. 0 = use default. */
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
	dateFormat: "YYYY-MM-DD",
	showHolidays: true,
	holidayCountry: "KR",
	alternateCalendarId: "",
	customCalendarProfiles: [],
	selectedCustomCalendarId: "",
	externalCalendars: [],
	externalCalendarCaches: [],
	mobileBottomPadding: 3.5,
	mobileCellWidth: 4.5,
	planNotePanelExpanded: true,
	mobilePlanNotePanelExpanded: false,
	yearlyPlannerExpandedMonths: [],
};

export class DiaryObsidianSettingTab extends PluginSettingTab {
	plugin: DiaryObsidian;

	constructor(app: App, plugin: DiaryObsidian) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName(t("settings.language"))
			.setDesc(t("settings.languageDesc"))
			.addDropdown((dropdown) =>
				dropdown
					.addOption("en", "English")
					.addOption("ko", "한국어")
					.setValue(this.plugin.settings.locale ?? "en")
					.onChange(async (value) => {
						this.plugin.settings.locale =
							value === "ko" ? "ko" : "en";
						setLocale(this.plugin.settings.locale);
						await this.plugin.saveSettings();
						this.display();
					}),
			);

		new Setting(containerEl)
			.setName(t("settings.plannerFolder"))
			.setDesc(t("settings.plannerFolderDesc"))
			.addText((text) =>
				text
					.setPlaceholder("Planner")
					.setValue(this.plugin.settings.plannerFolder)
					.onChange(async (value) => {
						this.plugin.settings.plannerFolder = value || "Planner";
						await this.plugin.saveSettings();
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
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t("settings.dateFormat"))
			.setDesc(t("settings.dateFormatDesc"))
			.addText((text) =>
				text
					.setPlaceholder("2000-01-15")
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value || "YYYY-MM-DD";
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName(t("settings.showHolidays"))
			.setDesc(t("settings.showHolidaysDesc"))
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.showHolidays)
					.onChange(async (value) => {
						this.plugin.settings.showHolidays = value;
						await this.plugin.saveSettings();
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
					.addOption("FR", t("country.FR"))
					.addOption("AU", t("country.AU"))
					.addOption("CA", t("country.CA"))
					.addOption("TW", t("country.TW"))
					.setValue(this.plugin.settings.holidayCountry || "")
					.onChange(async (value) => {
						this.plugin.settings.holidayCountry = value;
						await this.plugin.saveSettings();
					}),
			);

		renderCalendarOverlaySettings(containerEl, this.plugin);
		this.renderExternalCalendars(containerEl);

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
						await this.plugin.saveSettings();
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
						await this.plugin.saveSettings();
					}),
				);
	}

	private renderExternalCalendars(containerEl: HTMLElement): void {
		const calendars = this.plugin.settings.externalCalendars;
		const enabledCount = calendars.filter((calendar) => calendar.enabled).length;
		const errorCount = calendars.filter(
			(calendar) =>
				getExternalCalendarCache(this.plugin.settings, calendar.id)
					?.lastError,
		).length;
		const section = containerEl.createEl("details", {
			cls: "diary-external-calendar-settings",
		});
		section.open = calendars.length === 0 || errorCount > 0;

		const summary = section.createEl("summary", {
			cls: "diary-external-calendar-settings-summary",
		});
		const titleBlock = summary.createSpan({
			cls: "diary-external-calendar-settings-title-block",
		});
		titleBlock.createSpan({
			cls: "diary-external-calendar-settings-title",
			text: t("settings.externalCalendars"),
		});
		titleBlock.createSpan({
			cls: "diary-external-calendar-settings-desc",
			text: t("settings.externalCalendarsDesc"),
		});

		const meta = summary.createSpan({
			cls: "diary-external-calendar-settings-meta",
		});
		meta.createSpan({
			cls: "diary-external-calendar-settings-pill",
			text: t("settings.externalCalendarCount", {
				count: calendars.length,
			}),
		});
		if (enabledCount > 0) {
			meta.createSpan({
				cls: "diary-external-calendar-settings-pill",
				text: t("settings.externalCalendarEnabledCount", {
					count: enabledCount,
				}),
			});
		}
		if (errorCount > 0) {
			meta.createSpan({
				cls: "diary-external-calendar-settings-pill diary-external-calendar-settings-pill-error",
				text: t("settings.externalCalendarHasError"),
			});
		}

		const body = section.createDiv({
			cls: "diary-external-calendar-settings-body",
		});
		if (calendars.length === 0) {
			body.createDiv({
				cls: "diary-setting-description",
				text: t("settings.externalCalendarsEmpty"),
			});
		}

		for (const calendar of calendars) {
			this.renderExternalCalendarRow(body, calendar);
		}

		new Setting(body)
			.setName(t("settings.externalCalendarAdd"))
			.setDesc(t("settings.externalCalendarAddDesc"))
			.addButton((button) =>
				button
					.setButtonText(t("settings.externalCalendarAdd"))
					.setCta()
					.onClick(() =>
						new ExternalCalendarFeedModal(
							this.app,
							null,
							async (calendar) => {
								this.plugin.settings.externalCalendars = [
									...this.plugin.settings.externalCalendars,
									calendar,
								];
								await this.plugin.saveSettings();
								this.display();
							},
						).open(),
					),
			);
	}

	private renderExternalCalendarRow(
		containerEl: HTMLElement,
		calendar: ExternalCalendarSettings,
	): void {
		const cache = getExternalCalendarCache(this.plugin.settings, calendar.id);
		const status = cache?.lastError
			? t("settings.externalCalendarError", {
					message: cache.lastError.message,
				})
			: cache?.fetchedAt
				? t("settings.externalCalendarFetched", {
						date: cache.fetchedAt.slice(0, 16).replace("T", " "),
						count: cache.events.length,
					})
				: t("settings.externalCalendarNotFetched");
		const item = containerEl.createEl("details", {
			cls: "diary-external-calendar-feed",
		});
		item.open = Boolean(cache?.lastError);
		item.toggleClass("is-disabled", !calendar.enabled);
		item.toggleClass("has-error", Boolean(cache?.lastError));

		const summary = item.createEl("summary", {
			cls: "diary-external-calendar-feed-summary",
		});
		const swatch = summary.createSpan({
			cls: "diary-external-calendar-feed-swatch",
		});
		swatch.style.backgroundColor = calendar.color;

		const titleBlock = summary.createSpan({
			cls: "diary-external-calendar-feed-title-block",
		});
		titleBlock.createSpan({
			cls: "diary-external-calendar-feed-title",
			text: calendar.name,
		});
		titleBlock.createSpan({
			cls: "diary-external-calendar-feed-status",
			text: status,
		});
		summary.createSpan({
			cls: "diary-external-calendar-feed-state",
			text: calendar.enabled
				? t("settings.externalCalendarEnabled")
				: t("settings.externalCalendarDisabled"),
		});

		const body = item.createDiv({
			cls: "diary-external-calendar-feed-body",
		});
		body.createDiv({
			cls: "diary-external-calendar-feed-url",
			text: calendar.url,
		});
		const controlsEl = body.createDiv({
			cls: "diary-external-calendar-feed-controls",
		});

		new Setting(controlsEl)
			.setName(t("settings.externalCalendarFeedEnabled"))
			.addToggle((toggle) =>
				toggle.setValue(calendar.enabled).onChange(async (value) => {
					calendar.enabled = value;
					await this.plugin.saveSettings();
					this.display();
				}),
			)
			.addButton((button) =>
				button
					.setButtonText(t("settings.externalCalendarRefresh"))
					.onClick(async () => {
						button.setDisabled(true);
						const ok = await this.plugin.refreshExternalCalendar(calendar.id);
						new Notice(
							ok
								? t("settings.externalCalendarRefreshSuccess")
								: t("settings.externalCalendarRefreshFailed"),
						);
						this.display();
					}),
			)
			.addButton((button) =>
				button
					.setButtonText(t("settings.externalCalendarEdit"))
					.onClick(() =>
						new ExternalCalendarFeedModal(
							this.app,
							calendar,
							async (next) => {
								this.plugin.settings.externalCalendars =
									this.plugin.settings.externalCalendars.map((item) =>
										item.id === next.id ? next : item,
									);
								await this.plugin.saveSettings();
								this.display();
							},
						).open(),
					),
			)
			.addButton((button) =>
				button
					.setButtonText(t("settings.externalCalendarRemove"))
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.externalCalendars =
							this.plugin.settings.externalCalendars.filter(
								(item) => item.id !== calendar.id,
							);
						this.plugin.settings.externalCalendarCaches =
							this.plugin.settings.externalCalendarCaches.filter(
								(item) => item.calendarId !== calendar.id,
							);
						await this.plugin.saveSettings();
						this.display();
					}),
			);
	}
}

class ExternalCalendarFeedModal extends Modal {
	private nameInput!: HTMLInputElement;
	private urlInput!: HTMLInputElement;
	private colorInput!: HTMLInputElement;
	private includeDescriptions = false;
	private showInYearly = false;
	private showInMonthly = true;
	private showInMonthlyList = true;
	private showInSidebar = true;
	private errorEl!: HTMLElement;
	private saveButton!: HTMLButtonElement;

	constructor(
		app: App,
		private readonly calendar: ExternalCalendarSettings | null,
		private readonly onSave: (calendar: ExternalCalendarSettings) => Promise<void>,
	) {
		super(app);
	}

	onOpen(): void {
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.createEl("h2", {
			text: this.calendar
				? t("settings.externalCalendarEdit")
				: t("settings.externalCalendarAdd"),
		});
		this.contentEl.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: t("settings.externalCalendarPrivacy"),
		});

		new Setting(this.contentEl)
			.setName(t("settings.externalCalendarName"))
			.addText((text) => {
				this.nameInput = text.inputEl;
				text
					.setPlaceholder(t("settings.externalCalendarDefaultName"))
					.setValue(this.calendar?.name ?? "")
					.onChange(() => this.updateState());
			});

		new Setting(this.contentEl)
			.setName(t("settings.externalCalendarUrl"))
			.setDesc(t("settings.externalCalendarUrlDesc"))
				.addText((text) => {
					this.urlInput = text.inputEl;
					text
						.setPlaceholder("Webcal://...")
						.setValue(this.calendar?.url ?? "")
						.onChange(() => this.updateState());
				});

		new Setting(this.contentEl)
			.setName(t("settings.externalCalendarColor"))
			.addText((text) => {
				this.colorInput = text.inputEl;
				text
					.setPlaceholder(getDefaultExternalCalendarColor())
					.setValue(
						this.calendar?.color ?? getDefaultExternalCalendarColor(),
					)
					.onChange(() => this.updateState());
			});

		this.includeDescriptions = this.calendar?.includeDescriptions ?? false;
		this.showInMonthly = this.calendar?.showInMonthly ?? true;
		this.showInMonthlyList = this.calendar?.showInMonthlyList ?? true;
		this.showInSidebar = this.calendar?.showInSidebar ?? true;
		this.showInYearly = this.calendar?.showInYearly ?? false;

		this.addToggleSetting(
			t("settings.externalCalendarIncludeDescriptions"),
			this.includeDescriptions,
			(value) => {
				this.includeDescriptions = value;
			},
		);
		this.addToggleSetting(
			t("settings.externalCalendarShowMonthly"),
			this.showInMonthly,
			(value) => {
				this.showInMonthly = value;
			},
		);
		this.addToggleSetting(
			t("settings.externalCalendarShowMonthlyList"),
			this.showInMonthlyList,
			(value) => {
				this.showInMonthlyList = value;
			},
		);
		this.addToggleSetting(
			t("settings.externalCalendarShowSidebar"),
			this.showInSidebar,
			(value) => {
				this.showInSidebar = value;
			},
		);
		this.addToggleSetting(
			t("settings.externalCalendarShowYearly"),
			this.showInYearly,
			(value) => {
				this.showInYearly = value;
			},
		);

		this.errorEl = this.contentEl.createDiv({
			cls: "yearly-planner-modal-error",
			attr: { "aria-live": "polite" },
		});
		const actions = this.contentEl.createDiv({
			cls: "yearly-planner-modal-actions",
		});
		this.saveButton = actions.createEl("button", {
			cls: "mod-cta",
			text: t("modal.apply"),
			attr: { type: "button" },
		});
		this.saveButton.onclick = () => void this.handleSave();
		const cancelButton = actions.createEl("button", {
			text: t("modal.cancel"),
			attr: { type: "button" },
		});
		cancelButton.onclick = () => this.close();
		this.updateState();
		this.nameInput.focus();
	}

	private addToggleSetting(
		name: string,
		value: boolean,
		onChange: (value: boolean) => void,
	): void {
		new Setting(this.contentEl).setName(name).addToggle((toggle) => {
			toggle.setValue(value).onChange((next) => {
				onChange(next);
				this.updateState();
			});
		});
	}

	private updateState(): void {
		const error = this.getValidationError();
		if (this.errorEl) {
			this.errorEl.setText(error ?? "");
			this.errorEl.toggleClass("is-hidden", !error);
		}
		if (this.saveButton) this.saveButton.disabled = Boolean(error);
	}

	private getValidationError(): string | null {
		if (!this.urlInput?.value.trim()) {
			return t("settings.externalCalendarUrlRequired");
		}
		const url = this.urlInput.value.trim();
		if (!url.startsWith("webcal://") && !url.startsWith("https://")) {
			return t("settings.externalCalendarUrlInvalid");
		}
		return null;
	}

	private async handleSave(): Promise<void> {
		const error = this.getValidationError();
		if (error) {
			this.updateState();
			return;
		}
		await this.onSave({
			id: this.calendar?.id ?? createExternalCalendarId(),
			name:
				this.nameInput.value.trim() ||
				this.calendar?.name ||
				t("settings.externalCalendarDefaultName"),
			url: this.urlInput.value.trim(),
			color:
				this.colorInput.value.trim() ||
				this.calendar?.color ||
				getDefaultExternalCalendarColor(),
			enabled: this.calendar?.enabled ?? true,
			refreshMinutes: this.calendar?.refreshMinutes ?? null,
			includeDescriptions: this.includeDescriptions,
			showInYearly: this.showInYearly,
			showInMonthly: this.showInMonthly,
			showInMonthlyList: this.showInMonthlyList,
			showInSidebar: this.showInSidebar,
		});
		this.close();
	}
}
