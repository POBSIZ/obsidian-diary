import { Modal, Notice, Setting } from "obsidian";
import { getLocale, t } from "../i18n";
import type DiaryObsidian from "../main";
import {
	createUiBadge,
	createUiButton,
	createUiDisclosure,
	createUiError,
	createUiFieldRow,
	createUiModalActionBar,
} from "../ui/components";
import {
	ALTERNATE_CALENDAR_OPTIONS,
	getAlternateCalendarOptionText,
	normalizeAlternateCalendarId,
	type AlternateCalendarOption,
} from "../utils/alternate-calendars";
import {
	createDefaultCustomCalendarProfile,
	formatCustomCalendarFullLabel,
	formatCustomCalendarLabel,
	getCustomCalendarDateParts,
	normalizeCustomCalendarProfile,
	validateCustomCalendarProfile,
	type CustomCalendarLeapRule,
	type CustomCalendarMonth,
	type CustomCalendarProfile,
	type CustomCalendarWeekday,
} from "../utils/custom-calendars";

const OVERLAY_NONE = "";
const OVERLAY_BUILTIN_PREFIX = "builtin:";
const OVERLAY_CUSTOM_PREFIX = "custom:";

type CalendarOverlayRenderState = {
	sectionOpen: boolean | null;
	openProfileIds: Set<string>;
};

export function renderCalendarOverlaySettings(
	containerEl: HTMLElement,
	plugin: DiaryObsidian,
): void {
	const mount = containerEl.createDiv({
		cls: "diary-calendar-overlay-settings-mount",
	});
	const state: CalendarOverlayRenderState = {
		sectionOpen: null,
		openProfileIds: new Set(),
	};
	const rerender = (): void => {
		mount.empty();
		renderCalendarOverlaySettingsContent(mount, plugin, rerender, state);
	};
	rerender();
}

function renderCalendarOverlaySettingsContent(
	containerEl: HTMLElement,
	plugin: DiaryObsidian,
	rerender: () => void,
	state: CalendarOverlayRenderState,
): void {
	const locale = plugin.settings.locale ?? getLocale();
	const profiles = plugin.settings.customCalendarProfiles;
	const selectedCustomProfile = profiles.find(
		(profile) => profile.id === plugin.settings.selectedCustomCalendarId,
	);
	const selectedBuiltin = plugin.settings.alternateCalendarId
		? ALTERNATE_CALENDAR_OPTIONS.find(
				(option) => option.id === plugin.settings.alternateCalendarId,
			)
		: undefined;
	const section = createUiDisclosure(containerEl, {
		classes: "diary-calendar-settings-panel diary-calendar-overlay-settings",
	});
	section.open =
		state.sectionOpen ?? (profiles.length === 0 || Boolean(selectedCustomProfile));
	section.addEventListener("toggle", (event) => {
		if (event.target === section) state.sectionOpen = section.open;
	});

	const summary = section.createEl("summary", {
		cls: "diary-calendar-settings-summary",
	});
	const titleBlock = summary.createSpan({
		cls: "diary-calendar-settings-title-block",
	});
	titleBlock.createSpan({
		cls: "diary-calendar-settings-title",
		text: t("settings.calendarOverlay"),
	});
	titleBlock.createSpan({
		cls: "diary-calendar-settings-desc",
		text: t("settings.calendarOverlayDesc"),
	});
	const meta = summary.createSpan({
		cls: "diary-calendar-settings-meta",
	});
	createUiBadge(meta, {
		classes: "diary-calendar-settings-pill",
		text: getOverlaySummaryText(selectedCustomProfile, selectedBuiltin, locale),
		tag: "span",
	});
	createUiBadge(meta, {
		classes: "diary-calendar-settings-pill",
		text: t("settings.customCalendarCount", { count: profiles.length }),
		tag: "span",
	});

	const body = section.createDiv({
		cls: "diary-calendar-settings-body",
	});
	body.createDiv({
		cls: "diary-calendar-settings-note",
		text: t("settings.customCalendarFilesStayGregorian"),
	});

	new Setting(body)
		.setName(t("settings.calendarOverlayMode"))
		.setDesc(t("settings.calendarOverlayModeDesc"))
		.addDropdown((dropdown) => {
			dropdown.addOption(OVERLAY_NONE, t("settings.alternateCalendarNone"));
			for (const option of ALTERNATE_CALENDAR_OPTIONS) {
				dropdown.addOption(
					`${OVERLAY_BUILTIN_PREFIX}${option.id}`,
					getAlternateCalendarOptionText(option, locale).name,
				);
			}
			for (const profile of plugin.settings.customCalendarProfiles) {
				dropdown.addOption(
					`${OVERLAY_CUSTOM_PREFIX}${profile.id}`,
					`${t("settings.customCalendarGroup")}: ${profile.name}`,
				);
			}
			return dropdown
				.setValue(getOverlaySettingValue(plugin))
				.onChange(async (value) => {
					if (value.startsWith(OVERLAY_BUILTIN_PREFIX)) {
						plugin.settings.alternateCalendarId =
							normalizeAlternateCalendarId(
								value.slice(OVERLAY_BUILTIN_PREFIX.length),
							);
						plugin.settings.selectedCustomCalendarId = "";
					} else if (value.startsWith(OVERLAY_CUSTOM_PREFIX)) {
						plugin.settings.selectedCustomCalendarId = value.slice(
							OVERLAY_CUSTOM_PREFIX.length,
						);
						plugin.settings.alternateCalendarId = "";
					} else {
						plugin.settings.alternateCalendarId = "";
						plugin.settings.selectedCustomCalendarId = "";
					}
					await plugin.saveSettings();
					rerender();
				});
		});

	if (selectedBuiltin) {
		const text = getAlternateCalendarOptionText(selectedBuiltin, locale);
		body.createDiv({
			cls: "diary-calendar-settings-note",
			text: t("settings.calendarOverlayBuiltinDesc", {
				name: text.name,
				description: text.description,
			}),
		});
	}

	new Setting(body)
		.setName(t("settings.customCalendars"))
		.setDesc(t("settings.customCalendarsDesc"))
		.addButton((button) =>
			button
				.setButtonText(t("settings.customCalendarCreate"))
				.setCta()
				.onClick(() => {
					new CustomCalendarProfileModal(plugin, null, () => {
						if (plugin.settings.selectedCustomCalendarId) {
							state.openProfileIds.add(plugin.settings.selectedCustomCalendarId);
						}
						rerender();
					}).open();
				}),
		);

	if (profiles.length === 0) {
		body.createDiv({
			cls: "diary-setting-description",
			text: t("settings.customCalendarEmpty"),
		});
	}

	for (const profile of profiles) {
		renderCustomCalendarProfileCard(body, plugin, profile, rerender, state);
	}
}

function getOverlaySettingValue(plugin: DiaryObsidian): string {
	if (plugin.settings.selectedCustomCalendarId) {
		return `${OVERLAY_CUSTOM_PREFIX}${plugin.settings.selectedCustomCalendarId}`;
	}
	if (plugin.settings.alternateCalendarId) {
		return `${OVERLAY_BUILTIN_PREFIX}${plugin.settings.alternateCalendarId}`;
	}
	return OVERLAY_NONE;
}

function formatProfileDescription(profile: CustomCalendarProfile): string {
	return t("settings.customCalendarProfileSummary", {
		shortName: profile.shortName,
		months: profile.months.length,
		weekdays: profile.weekdays.length,
		date: profile.epoch.gregorianDate,
	});
}

function getOverlaySummaryText(
	selectedCustomProfile: CustomCalendarProfile | undefined,
	selectedBuiltin: AlternateCalendarOption | undefined,
	locale: string,
): string {
	if (selectedCustomProfile) {
		return `${t("settings.calendarOverlayCustomPill")}: ${selectedCustomProfile.name}`;
	}
	if (selectedBuiltin) {
		return `${t("settings.calendarOverlayBuiltinPill")}: ${
			getAlternateCalendarOptionText(selectedBuiltin, locale).name
		}`;
	}
	return t("settings.calendarOverlayNonePill");
}

function renderCustomCalendarProfileCard(
	containerEl: HTMLElement,
	plugin: DiaryObsidian,
	profile: CustomCalendarProfile,
	rerender: () => void,
	state: CalendarOverlayRenderState,
): void {
	const isSelected = plugin.settings.selectedCustomCalendarId === profile.id;
	const card = createUiDisclosure(containerEl, {
		classes: "diary-calendar-profile-card",
	});
	card.open = state.openProfileIds.has(profile.id) || isSelected;
	card.toggleClass("is-selected", isSelected);
	card.addEventListener("toggle", (event) => {
		if (event.target !== card) return;
		if (card.open) {
			state.openProfileIds.add(profile.id);
		} else {
			state.openProfileIds.delete(profile.id);
		}
	});

	const summary = card.createEl("summary", {
		cls: "diary-calendar-profile-summary",
	});
	const titleBlock = summary.createSpan({
		cls: "diary-calendar-profile-title-block",
	});
	titleBlock.createSpan({
		cls: "diary-calendar-profile-title",
		text: profile.name,
	});
	titleBlock.createSpan({
		cls: "diary-calendar-profile-desc",
		text: formatProfileDescription(profile),
	});
	const meta = summary.createSpan({
		cls: "diary-calendar-settings-meta",
	});
	if (isSelected) {
		createUiBadge(meta, {
			classes: "diary-calendar-settings-pill is-active",
			text: t("settings.calendarOverlayActive"),
			tag: "span",
		});
	}
	createUiBadge(meta, {
		classes: "diary-calendar-settings-pill",
		text: t("settings.customCalendarYearLength", {
			days: getBaseYearLength(profile),
		}),
		tag: "span",
	});

	const body = card.createDiv({
		cls: "diary-calendar-profile-body",
	});
	const preview = getProfileTodayPreview(profile);
	body.createDiv({
		cls: "diary-calendar-profile-preview",
		text: preview ?? t("settings.customCalendarPreviewUnavailable"),
	});
	const actions = body.createDiv({
		cls: "diary-calendar-profile-actions",
	});
	actions.createDiv({
		cls: "diary-calendar-profile-actions-label",
		text: t("settings.customCalendarProfileActions"),
	});
	const controls = actions.createDiv({
		cls: "diary-calendar-profile-actions-controls",
	});
	if (!isSelected) {
		createProfileActionButton(controls, t("settings.customCalendarUse"), {
			cta: true,
			onClick: async () => {
				plugin.settings.selectedCustomCalendarId = profile.id;
				plugin.settings.alternateCalendarId = "";
				await plugin.saveSettings();
				state.openProfileIds.add(profile.id);
				rerender();
			},
		});
	}
	createProfileActionButton(controls, t("settings.customCalendarEdit"), {
		onClick: () => {
			new CustomCalendarProfileModal(plugin, profile, () => {
				state.openProfileIds.add(profile.id);
				rerender();
			}).open();
		},
	});
	createProfileActionButton(controls, t("settings.customCalendarDuplicate"), {
		onClick: async () => {
			const copy = {
				...profile,
				id: createDefaultCustomCalendarProfile(
					plugin.settings.locale ?? getLocale(),
				).id,
				name: t("settings.customCalendarCopyName", {
					name: profile.name,
				}),
				revision: 1,
			};
			plugin.settings.customCalendarProfiles = [
				...plugin.settings.customCalendarProfiles,
				copy,
			];
			await plugin.saveSettings();
			state.openProfileIds.add(copy.id);
			rerender();
		},
	});
	createProfileActionButton(controls, t("settings.customCalendarDelete"), {
		warning: true,
		onClick: async () => {
			plugin.settings.customCalendarProfiles =
				plugin.settings.customCalendarProfiles.filter(
					(item) => item.id !== profile.id,
				);
			if (plugin.settings.selectedCustomCalendarId === profile.id) {
				plugin.settings.selectedCustomCalendarId = "";
			}
			await plugin.saveSettings();
			state.openProfileIds.delete(profile.id);
			rerender();
		},
	});
}

function createProfileActionButton(
	containerEl: HTMLElement,
	text: string,
	options: {
		cta?: boolean;
		disabled?: boolean;
		warning?: boolean;
		onClick: () => void | Promise<void>;
	},
): HTMLButtonElement {
	return createUiButton(containerEl, {
		text,
		variant: options.cta ? "cta" : options.warning ? "warning" : "default",
		disabled: options.disabled,
		onClick: options.onClick,
	});
}

function getProfileTodayPreview(profile: CustomCalendarProfile): string | null {
	const parts = getCustomCalendarDateParts(getLocalDateString(), profile);
	if (!parts) return null;
	return t("settings.customCalendarTodayPreview", {
		label: formatCustomCalendarLabel(parts, profile),
		full: formatCustomCalendarFullLabel(parts),
	});
}

function getLocalDateString(): string {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function getBaseYearLength(profile: CustomCalendarProfile): number {
	return profile.months.reduce((sum, month) => sum + month.days, 0);
}

class CustomCalendarProfileModal extends Modal {
	private nameInput!: HTMLInputElement;
	private shortNameInput!: HTMLInputElement;
	private epochDateInput!: HTMLInputElement;
	private epochYearInput!: HTMLInputElement;
	private epochMonthInput!: HTMLInputElement;
	private epochDayInput!: HTMLInputElement;
	private epochWeekdayInput!: HTMLInputElement;
	private monthsInput!: HTMLTextAreaElement;
	private weekdaysInput!: HTMLTextAreaElement;
	private leapTypeSelect!: HTMLSelectElement;
	private leapIntervalInput!: HTMLInputElement;
	private leapAddDaysInput!: HTMLInputElement;
	private leapMonthInput!: HTMLInputElement;
	private displaySelect!: HTMLSelectElement;
	private leapIntervalRow!: HTMLElement;
	private leapAddDaysRow!: HTMLElement;
	private leapMonthRow!: HTMLElement;
	private previewEl!: HTMLElement;
	private errorEl!: HTMLElement;
	private saveBtn!: HTMLButtonElement;
	private working: CustomCalendarProfile;
	private readonly isNewProfile: boolean;

	constructor(
		private plugin: DiaryObsidian,
		profile: CustomCalendarProfile | null,
		private readonly onSave?: () => void,
	) {
		super(plugin.app);
		this.isNewProfile = profile == null;
		this.working = profile
			? cloneProfile(profile)
			: createDefaultCustomCalendarProfile(plugin.settings.locale ?? getLocale());
	}

	onOpen(): void {
		this.contentEl.parentElement?.addClass(
			"diary-custom-calendar-modal-shell",
		);
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.createEl("h2", {
			text: this.isNewProfile
				? t("settings.customCalendarCreate")
				: t("settings.customCalendarEditTitle"),
		});
		const form = this.contentEl.createDiv({
			cls: "yearly-planner-create-file-modal diary-custom-calendar-modal",
		});

		const identitySection = this.createSection(
			form,
			t("settings.customCalendarIdentity"),
		);
		this.nameInput = this.createTextRow(
			identitySection,
			t("settings.customCalendarName"),
			"text",
			{
				placeholder: t("settings.customCalendarNamePlaceholder"),
			},
		);
		this.nameInput.value = this.working.name;
		this.shortNameInput = this.createTextRow(
			identitySection,
			t("settings.customCalendarShortName"),
			"text",
			{
				description: t("settings.customCalendarShortNameDesc"),
				placeholder: this.working.shortName,
			},
		);
		this.shortNameInput.value = this.working.shortName;

		const epochSection = this.createSection(
			form,
			t("settings.customCalendarEpochSection"),
			t("settings.customCalendarEpochSectionDesc"),
		);
		this.epochDateInput = this.createTextRow(
			epochSection,
			t("settings.customCalendarEpochDate"),
			"date",
			{
				description: t("settings.customCalendarEpochDateDesc"),
				fullWidth: true,
			},
		);
		this.epochDateInput.value = this.working.epoch.gregorianDate;
		this.epochYearInput = this.createTextRow(
			epochSection,
			t("settings.customCalendarEpochYear"),
			"number",
			{ min: "-9999", max: "9999" },
		);
		this.epochYearInput.value = String(this.working.epoch.year);
		this.epochMonthInput = this.createTextRow(
			epochSection,
			t("settings.customCalendarEpochMonth"),
			"number",
			{ min: "1", max: String(this.working.months.length) },
		);
		this.epochMonthInput.value = String(this.working.epoch.month);
		this.epochDayInput = this.createTextRow(
			epochSection,
			t("settings.customCalendarEpochDay"),
			"number",
			{ min: "1", max: "99" },
		);
		this.epochDayInput.value = String(this.working.epoch.day);
		this.epochWeekdayInput = this.createTextRow(
			epochSection,
			t("settings.customCalendarEpochWeekday"),
			"number",
			{
				description: t("settings.customCalendarEpochWeekdayDesc"),
				min: "1",
				max: String(this.working.weekdays.length),
			},
		);
		this.epochWeekdayInput.value = String(this.working.epoch.weekday);

		const structureSection = this.createSection(
			form,
			t("settings.customCalendarStructure"),
			t("settings.customCalendarStructureDesc"),
		);
		this.monthsInput = this.createTextareaRow(
			structureSection,
			t("settings.customCalendarMonths"),
			t("settings.customCalendarMonthsDesc"),
			serializeMonths(this.working.months),
		);
		this.monthsInput.value = serializeMonths(this.working.months);
		this.weekdaysInput = this.createTextareaRow(
			structureSection,
			t("settings.customCalendarWeekdays"),
			t("settings.customCalendarWeekdaysDesc"),
			serializeWeekdays(this.working.weekdays),
		);
		this.weekdaysInput.value = serializeWeekdays(this.working.weekdays);

		const ruleSection = this.createSection(
			form,
			t("settings.customCalendarDisplayAndLeap"),
		);
		this.leapTypeSelect = this.createSelectRow(
			ruleSection,
			t("settings.customCalendarLeapRule"),
			[
				["none", t("settings.customCalendarLeapNone")],
				["every-n-years", t("settings.customCalendarLeapEveryN")],
			],
		);
		this.leapTypeSelect.value = this.working.leapRule.type;
		const leapRule =
			this.working.leapRule.type === "every-n-years"
				? this.working.leapRule
				: null;
		this.leapIntervalInput = this.createTextRow(
			ruleSection,
			t("settings.customCalendarLeapInterval"),
			"number",
			{ min: "2", max: "100" },
		);
		this.leapIntervalRow = this.leapIntervalInput.parentElement as HTMLElement;
		this.leapIntervalInput.value = String(leapRule?.interval ?? 4);
		this.leapAddDaysInput = this.createTextRow(
			ruleSection,
			t("settings.customCalendarLeapAddDays"),
			"number",
			{ min: "1", max: "30" },
		);
		this.leapAddDaysRow = this.leapAddDaysInput.parentElement as HTMLElement;
		this.leapAddDaysInput.value = String(leapRule?.addDays ?? 1);
		this.leapMonthInput = this.createTextRow(
			ruleSection,
			t("settings.customCalendarLeapMonth"),
			"number",
			{ min: "1", max: String(this.working.months.length) },
		);
		this.leapMonthRow = this.leapMonthInput.parentElement as HTMLElement;
		this.leapMonthInput.value = String(leapRule?.month ?? this.working.months.length);

		this.displaySelect = this.createSelectRow(
			ruleSection,
			t("settings.customCalendarLabelFormat"),
			[
				["short-month-day", t("settings.customCalendarLabelShort")],
				["month-day", t("settings.customCalendarLabelMonth")],
				["year-month-day", t("settings.customCalendarLabelYear")],
			],
		);
		this.displaySelect.value = this.working.display.labelFormat;

		this.previewEl = form.createDiv({
			cls: "diary-custom-calendar-preview",
		});
		this.errorEl = createUiError(
			this.contentEl,
			"yearly-planner-modal-error",
		);

		const actions = createUiModalActionBar(
			this.contentEl,
			"yearly-planner-modal-actions diary-custom-calendar-modal-actions",
		);
		this.saveBtn = createUiButton(actions, {
			text: t("modal.apply"),
			variant: "cta",
		});
		this.saveBtn.onclick = () => void this.handleSave();
		const cancelButton = createUiButton(actions, {
			text: t("modal.cancel"),
		});
		cancelButton.onclick = () => this.close();
		this.contentEl.addEventListener("input", () => this.updateState());
		this.leapTypeSelect.addEventListener("change", () => this.updateState());
		this.updateState();
		this.nameInput.focus();
	}

	private createTextRow(
		form: HTMLElement,
		label: string,
		type = "text",
		options: {
			description?: string;
			fullWidth?: boolean;
			placeholder?: string;
			min?: string;
			max?: string;
		} = {},
	): HTMLInputElement {
		const row = createUiFieldRow(form, "yearly-planner-create-file-row");
		if (options.fullWidth) row.addClass("diary-custom-calendar-full-row");
		row.createEl("label", { text: label });
		const input = row.createEl("input", {
			type,
			cls: "yearly-planner-filename-input",
		});
		if (options.placeholder) input.placeholder = options.placeholder;
		if (options.min) input.min = options.min;
		if (options.max) input.max = options.max;
		if (options.description) {
			row.createDiv({
				cls: "yearly-planner-create-file-hint",
				text: options.description,
			});
		}
		return input;
	}

	private createTextareaRow(
		form: HTMLElement,
		label: string,
		description: string,
		placeholder: string,
	): HTMLTextAreaElement {
		const row = createUiFieldRow(form, "yearly-planner-create-file-row");
		row.addClass("diary-custom-calendar-full-row");
		row.createEl("label", { text: label });
		const textarea = row.createEl("textarea", {
			cls: "yearly-planner-filename-input diary-custom-calendar-textarea",
			attr: { rows: "5" },
		});
		textarea.placeholder = placeholder;
		row.createDiv({
			cls: "yearly-planner-create-file-hint",
			text: description,
		});
		return textarea;
	}

	private createSelectRow(
		form: HTMLElement,
		label: string,
		options: Array<[string, string]>,
	): HTMLSelectElement {
		const row = createUiFieldRow(form, "yearly-planner-create-file-row");
		row.createEl("label", { text: label });
		const select = row.createEl("select", {
			cls: "yearly-planner-repeat-select",
		});
		for (const [value, text] of options) {
			select.createEl("option", { value, text });
		}
		return select;
	}

	private createSection(
		form: HTMLElement,
		title: string,
		description?: string,
	): HTMLElement {
		const section = form.createDiv({
			cls: "diary-custom-calendar-modal-section",
		});
		section.createEl("h3", {
			cls: "diary-custom-calendar-modal-section-title",
			text: title,
		});
		if (description) {
			section.createDiv({
				cls: "yearly-planner-create-file-hint",
				text: description,
			});
		}
		return section;
	}

	private updateState(): void {
		const profile = this.readProfile();
		const result = profile
			? validateCustomCalendarProfile(profile)
			: { ok: false, errors: [t("settings.customCalendarInvalid")] };
		const showLeap = this.leapTypeSelect.value === "every-n-years";
		this.leapMonthInput.max = String(
			Math.max(1, profile?.months.length ?? this.working.months.length),
		);
		this.leapIntervalRow.toggleClass("is-hidden", !showLeap);
		this.leapAddDaysRow.toggleClass("is-hidden", !showLeap);
		this.leapMonthRow.toggleClass("is-hidden", !showLeap);
		this.saveBtn.disabled = !result.ok;
		this.errorEl.setText(result.errors.join("\n"));
		this.errorEl.toggleClass("is-hidden", result.ok);
		this.renderPreview(profile, result.ok);
	}

	private renderPreview(
		profile: CustomCalendarProfile | null,
		isValid: boolean,
	): void {
		this.previewEl.empty();
		if (!profile || !isValid) {
			this.previewEl.setText(t("settings.customCalendarPreviewUnavailable"));
			return;
		}
		const preview = getProfileTodayPreview(profile);
		this.previewEl.createDiv({
			cls: "diary-custom-calendar-preview-title",
			text: t("settings.customCalendarPreview"),
		});
		this.previewEl.createDiv({
			cls: "diary-custom-calendar-preview-line",
			text: preview ?? t("settings.customCalendarPreviewUnavailable"),
		});
		this.previewEl.createDiv({
			cls: "diary-custom-calendar-preview-line",
			text: t("settings.customCalendarProfileSummary", {
				shortName: profile.shortName,
				months: profile.months.length,
				weekdays: profile.weekdays.length,
				date: profile.epoch.gregorianDate,
			}),
		});
	}

	private readProfile(): CustomCalendarProfile | null {
		const months = parseMonths(this.monthsInput.value);
		const weekdays = parseWeekdays(this.weekdaysInput.value);
		const base: CustomCalendarProfile = {
			...this.working,
			name: this.nameInput.value.trim(),
			shortName: this.shortNameInput.value.trim() || this.nameInput.value.trim(),
			revision: this.working.revision + 1,
			epoch: {
				gregorianDate: this.epochDateInput.value,
				year: Number(this.epochYearInput.value),
				month: Number(this.epochMonthInput.value),
				day: Number(this.epochDayInput.value),
				weekday: Number(this.epochWeekdayInput.value),
			},
			months,
			weekdays,
			leapRule: this.readLeapRule(),
			display: {
				labelFormat: this.displaySelect
					.value as CustomCalendarProfile["display"]["labelFormat"],
			},
		};
		return base;
	}

	private readLeapRule(): CustomCalendarLeapRule {
		if (this.leapTypeSelect.value !== "every-n-years") return { type: "none" };
		return {
			type: "every-n-years",
			interval: Number(this.leapIntervalInput.value),
			addDays: Number(this.leapAddDaysInput.value),
			month: Number(this.leapMonthInput.value),
			mode: "extend-month",
		};
	}

	private async handleSave(): Promise<void> {
		const profile = this.readProfile();
		if (!profile || !validateCustomCalendarProfile(profile).ok) {
			new Notice(t("settings.customCalendarInvalid"));
			return;
		}
		const normalizedProfile = normalizeCustomCalendarProfile(profile);
		if (!normalizedProfile) {
			new Notice(t("settings.customCalendarInvalid"));
			return;
		}
		const others = this.plugin.settings.customCalendarProfiles.filter(
			(item) => item.id !== this.working.id,
		);
		this.plugin.settings.customCalendarProfiles = [
			...others,
			normalizedProfile,
		].sort(
			(a, b) => a.name.localeCompare(b.name),
		);
		this.plugin.settings.selectedCustomCalendarId = normalizedProfile.id;
		this.plugin.settings.alternateCalendarId = "";
		await this.plugin.saveSettings();
		this.onSave?.();
		this.close();
	}
}

function cloneProfile(profile: CustomCalendarProfile): CustomCalendarProfile {
	return JSON.parse(JSON.stringify(profile)) as CustomCalendarProfile;
}

function serializeMonths(months: readonly CustomCalendarMonth[]): string {
	return months
		.map((month) => `${month.name}|${month.shortName}|${month.days}`)
		.join("\n");
}

function serializeWeekdays(weekdays: readonly CustomCalendarWeekday[]): string {
	return weekdays
		.map((weekday) => `${weekday.name}|${weekday.shortName}`)
		.join("\n");
}

function parseMonths(value: string): CustomCalendarMonth[] {
	return value
		.split(/\r?\n/)
		.map((line, index) => {
			const parts = splitLine(line);
			const name = parts[0]?.trim();
			const shortName = parts[1]?.trim() || name;
			const days = Number(parts[2]?.trim());
			if (!name || !Number.isInteger(days)) return null;
			return {
				id: `m${index + 1}`,
				name,
				shortName: shortName ?? name,
				days,
			};
		})
		.filter((month): month is CustomCalendarMonth => month != null);
}

function parseWeekdays(value: string): CustomCalendarWeekday[] {
	return value
		.split(/\r?\n/)
		.map((line, index) => {
			const parts = splitLine(line);
			const name = parts[0]?.trim();
			const shortName = parts[1]?.trim() || name;
			if (!name) return null;
			return {
				id: `w${index + 1}`,
				name,
				shortName: shortName ?? name,
			};
		})
		.filter((weekday): weekday is CustomCalendarWeekday => weekday != null);
}

function splitLine(line: string): string[] {
	return line.includes("|") ? line.split("|") : line.split(",");
}
