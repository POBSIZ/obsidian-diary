import { App, Modal, Notice, PluginSettingTab, Setting, setIcon } from "obsidian";
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
	DEFAULT_EXTERNAL_CALENDAR_REFRESH_MINUTES,
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
	externalCalendarAutoRefreshMigrated: boolean;
	externalCalendarYearlyVisibilityMigrated: boolean;
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
	externalCalendarAutoRefreshMigrated: false,
	externalCalendarYearlyVisibilityMigrated: false,
	mobileBottomPadding: 3.5,
	mobileCellWidth: 4.5,
	planNotePanelExpanded: true,
	mobilePlanNotePanelExpanded: false,
	yearlyPlannerExpandedMonths: [],
};

type ExternalCalendarRenderState = {
	sectionOpen: boolean | null;
	openCalendarIds: Set<string>;
};

const EXTERNAL_CALENDAR_REFRESH_OPTIONS: Array<{
	value: string;
	labelKey: string;
	minutes: number | null;
}> = [
	{
		value: "manual",
		labelKey: "settings.externalCalendarRefreshManual",
		minutes: null,
	},
	{ value: "15", labelKey: "settings.externalCalendarRefresh15m", minutes: 15 },
	{ value: "30", labelKey: "settings.externalCalendarRefresh30m", minutes: 30 },
	{ value: "60", labelKey: "settings.externalCalendarRefresh1h", minutes: 60 },
	{ value: "360", labelKey: "settings.externalCalendarRefresh6h", minutes: 360 },
	{
		value: "1440",
		labelKey: "settings.externalCalendarRefreshDaily",
		minutes: 1440,
	},
];

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
		const mount = containerEl.createDiv({
			cls: "diary-external-calendar-settings-mount",
		});
		const state: ExternalCalendarRenderState = {
			sectionOpen: null,
			openCalendarIds: new Set(),
		};
		const rerender = (): void => {
			mount.empty();
			this.renderExternalCalendarContent(mount, rerender, state);
		};
		rerender();
	}

	private renderExternalCalendarContent(
		containerEl: HTMLElement,
		rerender: () => void,
		state: ExternalCalendarRenderState,
	): void {
		const calendars = this.plugin.settings.externalCalendars;
		const enabledCount = calendars.filter((calendar) => calendar.enabled).length;
		const autoRefreshCount = calendars.filter(
			(calendar) => calendar.enabled && calendar.refreshMinutes != null,
		).length;
		const errorCount = calendars.filter(
			(calendar) =>
				getExternalCalendarCache(this.plugin.settings, calendar.id)
					?.lastError,
		).length;
		const section = containerEl.createEl("details", {
			cls: "diary-calendar-settings-panel diary-external-calendar-settings",
		});
		section.open = state.sectionOpen ?? (calendars.length === 0 || errorCount > 0);
		section.addEventListener("toggle", (event) => {
			if (event.target === section) state.sectionOpen = section.open;
		});

		const summary = section.createEl("summary", {
			cls: "diary-calendar-settings-summary diary-external-calendar-settings-summary",
		});
		const titleBlock = summary.createSpan({
			cls: "diary-calendar-settings-title-block diary-external-calendar-settings-title-block",
		});
		titleBlock.createSpan({
			cls: "diary-calendar-settings-title diary-external-calendar-settings-title",
			text: t("settings.externalCalendars"),
		});
		titleBlock.createSpan({
			cls: "diary-calendar-settings-desc diary-external-calendar-settings-desc",
			text: t("settings.externalCalendarsDesc"),
		});

		const meta = summary.createSpan({
			cls: "diary-calendar-settings-meta diary-external-calendar-settings-meta",
		});
		meta.createSpan({
			cls: "diary-calendar-settings-pill diary-external-calendar-settings-pill",
			text: t("settings.externalCalendarCount", {
				count: calendars.length,
			}),
		});
		if (enabledCount > 0) {
			meta.createSpan({
				cls: "diary-calendar-settings-pill diary-external-calendar-settings-pill",
				text: t("settings.externalCalendarEnabledCount", {
					count: enabledCount,
				}),
			});
		}
		if (autoRefreshCount > 0) {
			meta.createSpan({
				cls: "diary-calendar-settings-pill diary-external-calendar-settings-pill",
				text: t("settings.externalCalendarAutoRefreshCount", {
					count: autoRefreshCount,
				}),
			});
		}
		if (errorCount > 0) {
			meta.createSpan({
				cls: "diary-calendar-settings-pill diary-calendar-settings-pill-error diary-external-calendar-settings-pill diary-external-calendar-settings-pill-error",
				text: t("settings.externalCalendarHasError"),
			});
		}

		const body = section.createDiv({
			cls: "diary-calendar-settings-body diary-external-calendar-settings-body",
		});
		body.createDiv({
			cls: "diary-calendar-settings-note",
			text: t("settings.externalCalendarReadOnlyNote"),
		});
		if (calendars.length === 0) {
			body.createDiv({
				cls: "diary-setting-description",
				text: t("settings.externalCalendarsEmpty"),
			});
		}

		for (const calendar of calendars) {
			this.renderExternalCalendarRow(body, calendar, rerender, state);
		}

		new Setting(body)
			.setName(t("settings.externalCalendarRefreshAll"))
			.setDesc(t("settings.externalCalendarRefreshAllDesc"))
			.addButton((button) =>
				button
					.setButtonText(t("settings.externalCalendarRefreshAll"))
					.setDisabled(enabledCount === 0)
					.onClick(async () => {
						button.setDisabled(true);
						const result = await this.plugin.refreshAllExternalCalendars();
						new Notice(
							t("settings.externalCalendarRefreshAllResult", {
								count: result.refreshed,
								failed: result.failed,
							}),
						);
						rerender();
					}),
			);

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
								const ok = await this.plugin.refreshExternalCalendar(
									calendar.id,
								);
								if (!ok) {
									new Notice(t("settings.externalCalendarRefreshFailed"));
								}
								state.openCalendarIds.add(calendar.id);
								rerender();
							},
						).open(),
					),
			);
	}

	private renderExternalCalendarRow(
		containerEl: HTMLElement,
		calendar: ExternalCalendarSettings,
		rerender: () => void,
		state: ExternalCalendarRenderState,
	): void {
		const cache = getExternalCalendarCache(this.plugin.settings, calendar.id);
		const refreshLabel = formatExternalCalendarRefreshInterval(
			calendar.refreshMinutes,
		);
		const refreshTiming = formatExternalCalendarRefreshTiming(calendar, cache);
		const cacheStatus = cache?.lastError
			? t("settings.externalCalendarError", {
					message: cache.lastError.message,
				})
			: cache?.fetchedAt
				? t("settings.externalCalendarFetched", {
						date: cache.fetchedAt.slice(0, 16).replace("T", " "),
						count: cache.events.length,
					})
				: t("settings.externalCalendarNotFetched");
		const status = refreshTiming
			? `${cacheStatus} ${refreshTiming}`
			: cacheStatus;
		const item = containerEl.createEl("details", {
			cls: "diary-calendar-profile-card diary-external-calendar-feed",
		});
		item.open = state.openCalendarIds.has(calendar.id) || Boolean(cache?.lastError);
		item.toggleClass("is-disabled", !calendar.enabled);
		item.toggleClass("has-error", Boolean(cache?.lastError));
		item.addEventListener("toggle", (event) => {
			if (event.target !== item) return;
			if (item.open) {
				state.openCalendarIds.add(calendar.id);
			} else {
				state.openCalendarIds.delete(calendar.id);
			}
		});

		const summary = item.createEl("summary", {
			cls: "diary-calendar-profile-summary diary-external-calendar-feed-summary",
		});
		const swatch = summary.createSpan({
			cls: "diary-external-calendar-feed-swatch",
		});
		swatch.style.backgroundColor = calendar.color;

		const titleBlock = summary.createSpan({
			cls: "diary-calendar-profile-title-block diary-external-calendar-feed-title-block",
		});
		titleBlock.createSpan({
			cls: "diary-calendar-profile-title diary-external-calendar-feed-title",
			text: calendar.name,
		});
		titleBlock.createSpan({
			cls: "diary-calendar-profile-desc diary-external-calendar-feed-status",
			text: status,
		});
		const meta = summary.createSpan({
			cls: "diary-calendar-settings-meta",
		});
		meta.createSpan({
			cls: cache?.lastError
				? "diary-calendar-settings-pill diary-calendar-settings-pill-error"
				: calendar.enabled
					? "diary-calendar-settings-pill is-active"
					: "diary-calendar-settings-pill",
			text: cache?.lastError
				? t("settings.externalCalendarHasError")
				: calendar.enabled
					? t("settings.externalCalendarEnabled")
					: t("settings.externalCalendarDisabled"),
		});
		meta.createSpan({
			cls: "diary-calendar-settings-pill",
			text: refreshLabel,
		});
		meta.createSpan({
			cls:
				getExternalCalendarVisibilityCount(calendar) > 0
					? "diary-calendar-settings-pill"
					: "diary-calendar-settings-pill is-muted",
			text: formatExternalCalendarVisibilitySummary(calendar),
		});

		const body = item.createDiv({
			cls: "diary-calendar-profile-body diary-external-calendar-feed-body",
		});
		const urlBlock = body.createDiv({
			cls: "diary-calendar-profile-preview diary-external-calendar-feed-url",
		});
		urlBlock.createDiv({
			cls: "diary-external-calendar-feed-url-label",
			text: t("settings.externalCalendarUrl"),
		});
		urlBlock.createDiv({
			cls: "diary-external-calendar-feed-url-text",
			text: calendar.url,
		});
		createExternalCalendarVisibilityPills(body, calendar);
		const actions = body.createDiv({
			cls: "diary-calendar-profile-actions diary-external-calendar-feed-actions",
		});
		actions.createDiv({
			cls: "diary-calendar-profile-actions-label",
			text: t("settings.externalCalendarFeedActions"),
		});
		const controlsEl = actions.createDiv({
			cls: "diary-calendar-profile-actions-controls diary-external-calendar-feed-controls",
		});

		createExternalCalendarActionButton(
			controlsEl,
			calendar.enabled
				? t("settings.externalCalendarDisable")
				: t("settings.externalCalendarEnable"),
			{
				cta: !calendar.enabled,
				icon: "power",
				onClick: async () => {
					calendar.enabled = !calendar.enabled;
					await this.plugin.saveSettings();
					rerender();
				},
			},
		);
		let refreshButton: HTMLButtonElement;
		refreshButton = createExternalCalendarActionButton(
			controlsEl,
			t("settings.externalCalendarRefresh"),
			{
				icon: "refresh-cw",
				onClick: async () => {
					refreshButton.disabled = true;
					const ok = await this.plugin.refreshExternalCalendar(calendar.id);
					new Notice(
						ok
							? t("settings.externalCalendarRefreshSuccess")
						: t("settings.externalCalendarRefreshFailed"),
					);
					rerender();
				},
			},
		);
		createExternalCalendarActionButton(
			controlsEl,
			t("settings.externalCalendarEdit"),
			{
				icon: "pencil",
				onClick: () =>
					new ExternalCalendarFeedModal(
						this.app,
						calendar,
						async (next) => {
							this.plugin.settings.externalCalendars =
								this.plugin.settings.externalCalendars.map((item) =>
									item.id === next.id ? next : item,
								);
							if (next.enabled) {
								await this.plugin.refreshExternalCalendar(next.id);
							} else {
								await this.plugin.saveSettings();
							}
							state.openCalendarIds.add(next.id);
							rerender();
						},
					).open(),
			},
		);
		createExternalCalendarActionButton(
			controlsEl,
			t("settings.externalCalendarRemove"),
			{
				icon: "trash-2",
				warning: true,
				onClick: async () => {
					this.plugin.settings.externalCalendars =
						this.plugin.settings.externalCalendars.filter(
							(item) => item.id !== calendar.id,
						);
					this.plugin.settings.externalCalendarCaches =
						this.plugin.settings.externalCalendarCaches.filter(
							(item) => item.calendarId !== calendar.id,
						);
					await this.plugin.saveSettings();
					state.openCalendarIds.delete(calendar.id);
					rerender();
				},
			},
		);
	}
}

function createExternalCalendarActionButton(
	containerEl: HTMLElement,
	text: string,
	options: {
		cta?: boolean;
		icon?: string;
		warning?: boolean;
		onClick: () => void | Promise<void>;
	},
): HTMLButtonElement {
	const classes = options.cta
		? "mod-cta"
		: options.warning
			? "mod-warning"
			: "";
	const button = containerEl.createEl("button", {
		cls: classes,
		attr: { type: "button" },
	});
	button.ariaLabel = text;
	button.title = text;
	if (options.icon) {
		const iconEl = button.createSpan({ cls: "diary-calendar-action-icon" });
		setIcon(iconEl, options.icon);
	}
	button.createSpan({ cls: "diary-calendar-action-label", text });
	button.onclick = () => void options.onClick();
	return button;
}

function getExternalCalendarVisibilityItems(calendar: ExternalCalendarSettings): Array<{
	enabled: boolean;
	label: string;
}> {
	return [
		{
			enabled: calendar.showInYearly,
			label: t("settings.externalCalendarVisibilityYearly"),
		},
		{
			enabled: calendar.showInMonthly,
			label: t("settings.externalCalendarVisibilityMonthly"),
		},
		{
			enabled: calendar.showInMonthlyList,
			label: t("settings.externalCalendarVisibilityList"),
		},
		{
			enabled: calendar.showInSidebar,
			label: t("settings.externalCalendarVisibilitySidebar"),
		},
	];
}

function getExternalCalendarVisibilityCount(
	calendar: ExternalCalendarSettings,
): number {
	return getExternalCalendarVisibilityItems(calendar).filter((item) => item.enabled)
		.length;
}

function formatExternalCalendarVisibilitySummary(
	calendar: ExternalCalendarSettings,
): string {
	const count = getExternalCalendarVisibilityCount(calendar);
	if (count === 0) return t("settings.externalCalendarVisibilityHidden");
	return t("settings.externalCalendarVisibilityCount", { count });
}

function createExternalCalendarVisibilityPills(
	containerEl: HTMLElement,
	calendar: ExternalCalendarSettings,
): void {
	const wrapper = containerEl.createDiv({
		cls: "diary-external-calendar-visibility",
	});
	wrapper.createDiv({
		cls: "diary-external-calendar-visibility-label",
		text: t("settings.externalCalendarVisibility"),
	});
	const pills = wrapper.createDiv({
		cls: "diary-external-calendar-visibility-pills",
	});
	for (const item of getExternalCalendarVisibilityItems(calendar)) {
		pills.createSpan({
			cls: item.enabled
				? "diary-calendar-settings-pill is-active"
				: "diary-calendar-settings-pill is-muted",
			text: item.label,
		});
	}
}

function formatExternalCalendarRefreshInterval(minutes: number | null): string {
	const option = EXTERNAL_CALENDAR_REFRESH_OPTIONS.find(
		(item) => item.minutes === minutes,
	);
	if (option) return t(option.labelKey);
	if (minutes == null) return t("settings.externalCalendarRefreshManual");
	return t("settings.externalCalendarRefreshEvery", { minutes });
}

function getExternalCalendarRefreshOptionValue(minutes: number | null): string {
	const option = EXTERNAL_CALENDAR_REFRESH_OPTIONS.find(
		(item) => item.minutes === minutes,
	);
	return option?.value ?? (minutes == null ? "manual" : String(minutes));
}

function formatExternalCalendarRefreshTiming(
	calendar: ExternalCalendarSettings,
	cache: ExternalCalendarCache | null,
): string | null {
	if (!calendar.enabled || calendar.refreshMinutes == null) return null;
	const lastAttempt = cache?.lastError?.occurredAt ?? cache?.fetchedAt;
	if (!lastAttempt) return t("settings.externalCalendarRefreshQueued");
	const lastAttemptMs = Date.parse(lastAttempt);
	if (!Number.isFinite(lastAttemptMs)) {
		return t("settings.externalCalendarRefreshQueued");
	}
	const nextRefresh = new Date(
		lastAttemptMs + calendar.refreshMinutes * 60_000,
	);
	if (Date.now() >= nextRefresh.getTime()) {
		return t("settings.externalCalendarRefreshDue");
	}
	return t("settings.externalCalendarNextRefresh", {
		date: nextRefresh.toISOString().slice(0, 16).replace("T", " "),
	});
}

class ExternalCalendarFeedModal extends Modal {
	private nameInput!: HTMLInputElement;
	private urlInput!: HTMLInputElement;
	private colorInput!: HTMLInputElement;
	private refreshMinutes: number | null =
		DEFAULT_EXTERNAL_CALENDAR_REFRESH_MINUTES;
	private includeDescriptions = false;
	private showInYearly = true;
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
		this.contentEl.parentElement?.addClass(
			"diary-external-calendar-modal-shell",
		);
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.createEl("h2", {
			text: this.calendar
				? t("settings.externalCalendarEdit")
				: t("settings.externalCalendarAdd"),
		});
		this.contentEl.createDiv({
			cls: "diary-calendar-settings-note diary-external-calendar-modal-note",
			text: t("settings.externalCalendarPrivacy"),
		});
		const form = this.contentEl.createDiv({
			cls: "yearly-planner-create-file-modal diary-external-calendar-modal",
		});
		const connectionSection = this.createSection(
			form,
			t("settings.externalCalendarConnectionSection"),
			t("settings.externalCalendarConnectionSectionDesc"),
		);

		new Setting(connectionSection)
			.setName(t("settings.externalCalendarName"))
			.addText((text) => {
				this.nameInput = text.inputEl;
				text
					.setPlaceholder(t("settings.externalCalendarDefaultName"))
					.setValue(this.calendar?.name ?? "")
					.onChange(() => this.updateState());
			});

		new Setting(connectionSection)
			.setName(t("settings.externalCalendarUrl"))
			.setDesc(t("settings.externalCalendarUrlDesc"))
			.addText((text) => {
				this.urlInput = text.inputEl;
				text
					.setPlaceholder("Webcal://...")
					.setValue(this.calendar?.url ?? "")
					.onChange(() => this.updateState());
			});

		new Setting(connectionSection)
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
		this.refreshMinutes =
			this.calendar?.refreshMinutes ??
			DEFAULT_EXTERNAL_CALENDAR_REFRESH_MINUTES;
		this.showInMonthly = this.calendar?.showInMonthly ?? true;
		this.showInMonthlyList = this.calendar?.showInMonthlyList ?? true;
		this.showInSidebar = this.calendar?.showInSidebar ?? true;
		this.showInYearly = this.calendar?.showInYearly ?? true;

		const syncSection = this.createSection(
			form,
			t("settings.externalCalendarSyncSection"),
			t("settings.externalCalendarSyncSectionDesc"),
		);
		this.addToggleSetting(
			syncSection,
			t("settings.externalCalendarIncludeDescriptions"),
			this.includeDescriptions,
			(value) => {
				this.includeDescriptions = value;
			},
		);
		new Setting(syncSection)
			.setName(t("settings.externalCalendarAutoRefresh"))
			.setDesc(t("settings.externalCalendarAutoRefreshDesc"))
			.addDropdown((dropdown) => {
				for (const option of EXTERNAL_CALENDAR_REFRESH_OPTIONS) {
					dropdown.addOption(option.value, t(option.labelKey));
				}
				return dropdown
					.setValue(
						getExternalCalendarRefreshOptionValue(this.refreshMinutes),
					)
					.onChange((value) => {
						const option = EXTERNAL_CALENDAR_REFRESH_OPTIONS.find(
							(item) => item.value === value,
						);
						this.refreshMinutes = option?.minutes ?? null;
						this.updateState();
					});
			});
		const displaySection = this.createSection(
			form,
			t("settings.externalCalendarDisplaySection"),
			t("settings.externalCalendarDisplaySectionDesc"),
		);
		this.addToggleSetting(
			displaySection,
			t("settings.externalCalendarShowMonthly"),
			this.showInMonthly,
			(value) => {
				this.showInMonthly = value;
			},
		);
		this.addToggleSetting(
			displaySection,
			t("settings.externalCalendarShowMonthlyList"),
			this.showInMonthlyList,
			(value) => {
				this.showInMonthlyList = value;
			},
		);
		this.addToggleSetting(
			displaySection,
			t("settings.externalCalendarShowSidebar"),
			this.showInSidebar,
			(value) => {
				this.showInSidebar = value;
			},
		);
		this.addToggleSetting(
			displaySection,
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
		containerEl: HTMLElement,
		name: string,
		value: boolean,
		onChange: (value: boolean) => void,
	): void {
		new Setting(containerEl).setName(name).addToggle((toggle) => {
			toggle.setValue(value).onChange((next) => {
				onChange(next);
				this.updateState();
			});
		});
	}

	private createSection(
		form: HTMLElement,
		title: string,
		description: string,
	): HTMLElement {
		const section = form.createDiv({
			cls: "diary-custom-calendar-modal-section diary-external-calendar-modal-section",
		});
		section.createEl("h3", {
			cls: "diary-custom-calendar-modal-section-title",
			text: title,
		});
		section.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: description,
		});
		return section;
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
			refreshMinutes: this.refreshMinutes,
			includeDescriptions: this.includeDescriptions,
			showInYearly: this.showInYearly,
			showInMonthly: this.showInMonthly,
			showInMonthlyList: this.showInMonthlyList,
			showInSidebar: this.showInSidebar,
		});
		this.close();
	}
}
