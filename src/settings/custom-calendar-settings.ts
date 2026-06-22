import { Modal, Notice, Setting } from "obsidian";
import { getLocale, t } from "../i18n";
import type DiaryObsidian from "../main";
import {
	ALTERNATE_CALENDAR_OPTIONS,
	normalizeAlternateCalendarId,
} from "../utils/alternate-calendars";
import {
	createDefaultCustomCalendarProfile,
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

export function renderCalendarOverlaySettings(
	containerEl: HTMLElement,
	plugin: DiaryObsidian,
): void {
	new Setting(containerEl)
		.setName(t("settings.calendarOverlay"))
		.setDesc(t("settings.calendarOverlayDesc"))
		.addDropdown((dropdown) => {
			dropdown.addOption(OVERLAY_NONE, t("settings.alternateCalendarNone"));
			const locale = plugin.settings.locale ?? getLocale();
			for (const option of ALTERNATE_CALENDAR_OPTIONS) {
				dropdown.addOption(
					`${OVERLAY_BUILTIN_PREFIX}${option.id}`,
					option.text[locale].name,
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
					plugin.settingTab?.display();
				});
		});

	new Setting(containerEl)
		.setName(t("settings.customCalendars"))
		.setDesc(t("settings.customCalendarsDesc"))
		.addButton((button) =>
			button
				.setButtonText(t("settings.customCalendarCreate"))
				.setCta()
				.onClick(() => {
					new CustomCalendarProfileModal(plugin, null).open();
				}),
		);

	for (const profile of plugin.settings.customCalendarProfiles) {
		new Setting(containerEl)
			.setName(profile.name)
			.setDesc(formatProfileDescription(profile))
			.addButton((button) =>
				button
					.setButtonText(t("settings.customCalendarEdit"))
					.onClick(() => {
						new CustomCalendarProfileModal(plugin, profile).open();
					}),
			)
			.addButton((button) =>
				button
					.setButtonText(t("settings.customCalendarDuplicate"))
					.onClick(async () => {
						const copy = {
							...profile,
							id: createDefaultCustomCalendarProfile(
								plugin.settings.locale ?? getLocale(),
							).id,
							name: `${profile.name} copy`,
							revision: 1,
						};
						plugin.settings.customCalendarProfiles = [
							...plugin.settings.customCalendarProfiles,
							copy,
						];
						await plugin.saveSettings();
						plugin.settingTab?.display();
					}),
			)
			.addButton((button) =>
				button
					.setButtonText(t("settings.customCalendarDelete"))
					.setWarning()
					.onClick(async () => {
						plugin.settings.customCalendarProfiles =
							plugin.settings.customCalendarProfiles.filter(
								(item) => item.id !== profile.id,
							);
						if (plugin.settings.selectedCustomCalendarId === profile.id) {
							plugin.settings.selectedCustomCalendarId = "";
						}
						await plugin.saveSettings();
						plugin.settingTab?.display();
					}),
			);
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
	return `${profile.shortName} · ${profile.months.length} months · ${profile.weekdays.length} weekdays · epoch ${profile.epoch.gregorianDate}`;
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
	private previewEl!: HTMLElement;
	private errorEl!: HTMLElement;
	private saveBtn!: HTMLButtonElement;
	private working: CustomCalendarProfile;

	constructor(
		private plugin: DiaryObsidian,
		profile: CustomCalendarProfile | null,
	) {
		super(plugin.app);
		this.working = profile
			? cloneProfile(profile)
			: createDefaultCustomCalendarProfile(plugin.settings.locale ?? getLocale());
	}

	onOpen(): void {
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.createEl("h2", {
			text: this.working.name || t("settings.customCalendarCreate"),
		});
		const form = this.contentEl.createDiv({
			cls: "yearly-planner-create-file-modal",
		});

		this.nameInput = this.createTextRow(form, t("settings.customCalendarName"));
		this.nameInput.value = this.working.name;
		this.shortNameInput = this.createTextRow(
			form,
			t("settings.customCalendarShortName"),
		);
		this.shortNameInput.value = this.working.shortName;
		this.epochDateInput = this.createTextRow(
			form,
			t("settings.customCalendarEpochDate"),
			"date",
		);
		this.epochDateInput.value = this.working.epoch.gregorianDate;
		this.epochYearInput = this.createTextRow(
			form,
			t("settings.customCalendarEpochYear"),
			"number",
		);
		this.epochYearInput.value = String(this.working.epoch.year);
		this.epochMonthInput = this.createTextRow(
			form,
			t("settings.customCalendarEpochMonth"),
			"number",
		);
		this.epochMonthInput.value = String(this.working.epoch.month);
		this.epochDayInput = this.createTextRow(
			form,
			t("settings.customCalendarEpochDay"),
			"number",
		);
		this.epochDayInput.value = String(this.working.epoch.day);
		this.epochWeekdayInput = this.createTextRow(
			form,
			t("settings.customCalendarEpochWeekday"),
			"number",
		);
		this.epochWeekdayInput.value = String(this.working.epoch.weekday);

		this.monthsInput = this.createTextareaRow(
			form,
			t("settings.customCalendarMonths"),
			t("settings.customCalendarMonthsDesc"),
		);
		this.monthsInput.value = serializeMonths(this.working.months);
		this.weekdaysInput = this.createTextareaRow(
			form,
			t("settings.customCalendarWeekdays"),
			t("settings.customCalendarWeekdaysDesc"),
		);
		this.weekdaysInput.value = serializeWeekdays(this.working.weekdays);

		this.leapTypeSelect = this.createSelectRow(
			form,
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
			form,
			t("settings.customCalendarLeapInterval"),
			"number",
		);
		this.leapIntervalInput.value = String(leapRule?.interval ?? 4);
		this.leapAddDaysInput = this.createTextRow(
			form,
			t("settings.customCalendarLeapAddDays"),
			"number",
		);
		this.leapAddDaysInput.value = String(leapRule?.addDays ?? 1);
		this.leapMonthInput = this.createTextRow(
			form,
			t("settings.customCalendarLeapMonth"),
			"number",
		);
		this.leapMonthInput.value = String(leapRule?.month ?? this.working.months.length);

		this.displaySelect = this.createSelectRow(
			form,
			t("settings.customCalendarLabelFormat"),
			[
				["short-month-day", t("settings.customCalendarLabelShort")],
				["month-day", t("settings.customCalendarLabelMonth")],
				["year-month-day", t("settings.customCalendarLabelYear")],
			],
		);
		this.displaySelect.value = this.working.display.labelFormat;

		this.previewEl = form.createDiv({
			cls: "yearly-planner-create-file-hint",
		});
		this.errorEl = this.contentEl.createDiv({
			cls: "yearly-planner-modal-error",
			attr: { "aria-live": "polite" },
		});

		this.saveBtn = this.contentEl.createEl("button", {
			text: t("modal.apply"),
			cls: "mod-cta",
			attr: { type: "button" },
		});
		this.saveBtn.onclick = () => void this.handleSave();
		this.contentEl.addEventListener("input", () => this.updateState());
		this.leapTypeSelect.addEventListener("change", () => this.updateState());
		this.updateState();
		this.nameInput.focus();
	}

	private createTextRow(
		form: HTMLElement,
		label: string,
		type = "text",
	): HTMLInputElement {
		const row = form.createDiv({ cls: "yearly-planner-create-file-row" });
		row.createEl("label", { text: label });
		return row.createEl("input", {
			type,
			cls: "yearly-planner-filename-input",
		});
	}

	private createTextareaRow(
		form: HTMLElement,
		label: string,
		description: string,
	): HTMLTextAreaElement {
		const row = form.createDiv({ cls: "yearly-planner-create-file-row" });
		row.createEl("label", { text: label });
		const textarea = row.createEl("textarea", {
			cls: "yearly-planner-filename-input",
			attr: { rows: "5" },
		});
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
		const row = form.createDiv({ cls: "yearly-planner-create-file-row" });
		row.createEl("label", { text: label });
		const select = row.createEl("select", {
			cls: "yearly-planner-repeat-select",
		});
		for (const [value, text] of options) {
			select.createEl("option", { value, text });
		}
		return select;
	}

	private updateState(): void {
		const profile = this.readProfile();
		const result = profile
			? validateCustomCalendarProfile(profile)
			: { ok: false, errors: [t("settings.customCalendarInvalid")] };
		this.saveBtn.disabled = !result.ok;
		this.errorEl.setText(result.errors.join("\n"));
		this.errorEl.toggleClass("is-hidden", result.ok);
		this.previewEl.setText(
			profile
				? `${t("modal.preview")}: ${profile.months[0]?.shortName ?? ""} ${profile.epoch.day} · ${profile.months.length} months`
				: "",
		);
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
			leapRule: this.readLeapRule(months.length),
			display: {
				labelFormat: this.displaySelect
					.value as CustomCalendarProfile["display"]["labelFormat"],
			},
		};
		return normalizeCustomCalendarProfile(base);
	}

	private readLeapRule(monthCount: number): CustomCalendarLeapRule {
		if (this.leapTypeSelect.value !== "every-n-years") return { type: "none" };
		return {
			type: "every-n-years",
			interval: Number(this.leapIntervalInput.value),
			addDays: Number(this.leapAddDaysInput.value),
			month: Math.min(Number(this.leapMonthInput.value), monthCount),
			mode: "extend-month",
		};
	}

	private async handleSave(): Promise<void> {
		const profile = this.readProfile();
		if (!profile) {
			new Notice(t("settings.customCalendarInvalid"));
			return;
		}
		const others = this.plugin.settings.customCalendarProfiles.filter(
			(item) => item.id !== this.working.id,
		);
		this.plugin.settings.customCalendarProfiles = [...others, profile].sort(
			(a, b) => a.name.localeCompare(b.name),
		);
		this.plugin.settings.selectedCustomCalendarId = profile.id;
		this.plugin.settings.alternateCalendarId = "";
		await this.plugin.saveSettings();
		this.plugin.settingTab?.display();
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
