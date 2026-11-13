import { App, Modal, Setting } from "obsidian";
import { t } from "../i18n";
import {
	createExternalCalendarId,
	DEFAULT_EXTERNAL_CALENDAR_REFRESH_MINUTES,
	getDefaultExternalCalendarColor,
	type ExternalCalendarSettings,
} from "../utils/external-calendars";
import {
	createUiButton,
	createUiError,
	createUiModalActionBar,
	configureUiModalSurface,
	focusUiInputOnDesktop,
} from "../ui/components";
import {
	EXTERNAL_CALENDAR_REFRESH_OPTIONS,
	getExternalCalendarRefreshOptionValue,
} from "./external-calendar-presentation";

export class ExternalCalendarFeedModal extends Modal {
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
		configureUiModalSurface(this.contentEl, [
			"diary-external-calendar-modal-shell",
		]);
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

		this.errorEl = createUiError(
			this.contentEl,
			"yearly-planner-modal-error",
		);
		const actions = createUiModalActionBar(
			this.contentEl,
			"yearly-planner-modal-actions",
		);
		this.saveButton = createUiButton(actions, {
			variant: "cta",
			text: t("modal.apply"),
		});
		this.saveButton.onclick = () => void this.handleSave();
		const cancelButton = createUiButton(actions, {
			text: t("modal.cancel"),
		});
		cancelButton.onclick = () => this.close();
		this.updateState();
		focusUiInputOnDesktop(this.nameInput);
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
