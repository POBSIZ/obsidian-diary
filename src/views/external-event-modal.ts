import { App, Modal, Notice, TFile, setIcon } from "obsidian";
import { t } from "../i18n";
import {
	getExternalEventDateRangeLabel,
	getExternalEventTimeLabel,
	type ExternalCalendarEvent,
} from "../utils/external-calendars";
import { createExternalEventFile } from "./yearly-planner/file-operations";

export interface ExternalEventModalOptions {
	event: ExternalCalendarEvent;
	calendarName: string;
	folder: string;
	locale: string;
	onCreated: (file: TFile) => void | Promise<void>;
	onRefresh?: () => boolean | void | Promise<boolean | void>;
}

export class ExternalEventModal extends Modal {
	constructor(
		app: App,
		private readonly options: ExternalEventModalOptions,
	) {
		super(app);
	}

	onOpen(): void {
		const { event, calendarName, locale } = this.options;
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.addClass("planner-external-event-modal");
		const header = this.contentEl.createDiv({
			cls: "planner-external-event-modal-header",
		});
		const titleBlock = header.createDiv({
			cls: "planner-external-event-modal-title-block",
		});
		const sourceBadge = titleBlock.createDiv({
			cls: "planner-external-event-source-badge",
			text: calendarName,
		});
		if (event.color) {
			sourceBadge.style.setProperty("--external-calendar-color", event.color);
		}
		titleBlock.createEl("h2", { text: event.title });
		this.contentEl.createDiv({
			cls: "yearly-planner-create-file-hint planner-external-event-readonly-hint",
			text: t("externalEvent.readOnlyHint"),
		});

		const details = this.contentEl.createDiv({
			cls: "planner-external-event-details",
		});
		this.createDetail(details, t("externalEvent.calendar"), calendarName);
		this.createDetail(
			details,
			t("externalEvent.date"),
			getExternalEventDateRangeLabel(event),
		);
		const time = getExternalEventTimeLabel(event, locale);
		if (time) this.createDetail(details, t("externalEvent.time"), time);
		if (event.location) {
			this.createDetail(details, t("externalEvent.location"), event.location);
		}
		if (event.descriptionText) {
			this.contentEl.createEl("h3", {
				text: t("externalEvent.description"),
			});
			this.contentEl.createEl("pre", {
				cls: "planner-external-event-description",
				text: event.descriptionText,
			});
		}

		const actions = this.contentEl.createDiv({
			cls: "yearly-planner-modal-actions",
		});
		const createBtn = this.createActionButton(
			actions,
			"file-plus-2",
			t("externalEvent.createMarkdown"),
			{ cta: true },
		);
		createBtn.onclick = () => void this.createMarkdownNote();
		if (this.options.onRefresh) {
			const refreshBtn = this.createActionButton(
				actions,
				"refresh-cw",
				t("externalEvent.refreshCalendar"),
			);
			refreshBtn.onclick = () => void this.refreshCalendar(refreshBtn);
		}
		const copyBtn = this.createActionButton(
			actions,
			"copy",
			t("externalEvent.copyDetails"),
		);
		copyBtn.onclick = () => void this.copyDetails();
		const closeBtn = this.createActionButton(actions, "x", t("modal.cancel"));
		closeBtn.onclick = () => this.close();
	}

	private createActionButton(
		container: HTMLElement,
		icon: string,
		text: string,
		options: { cta?: boolean } = {},
	): HTMLButtonElement {
		const button = container.createEl("button", {
			cls: options.cta ? "mod-cta diary-calendar-action-button" : "diary-calendar-action-button",
			attr: { type: "button" },
		});
		button.ariaLabel = text;
		button.title = text;
		const iconEl = button.createSpan({ cls: "diary-calendar-action-icon" });
		setIcon(iconEl, icon);
		button.createSpan({ cls: "diary-calendar-action-label", text });
		return button;
	}

	private createDetail(container: HTMLElement, label: string, value: string): void {
		const row = container.createDiv({
			cls: "planner-external-event-detail-row",
		});
		row.createSpan({
			cls: "planner-external-event-detail-label",
			text: label,
		});
		row.createSpan({
			cls: "planner-external-event-detail-value",
			text: value,
		});
	}

	private async createMarkdownNote(): Promise<void> {
		try {
			const file = await createExternalEventFile(
				this.app,
				this.options.folder,
				this.options.event,
				this.options.calendarName,
				this.options.locale,
			);
			await this.options.onCreated(file);
			new Notice(t("externalEvent.createSuccess"));
			this.close();
		} catch (error) {
			new Notice(
				t("externalEvent.createFailed", {
					message:
						error instanceof Error
							? error.message
							: t("modal.failedToCreateFile"),
				}),
			);
		}
	}

	private async refreshCalendar(button: HTMLButtonElement): Promise<void> {
		if (!this.options.onRefresh) return;
		button.disabled = true;
		try {
			const ok = await this.options.onRefresh();
			if (typeof ok === "boolean") {
				new Notice(
					ok
						? t("settings.externalCalendarRefreshSuccess")
						: t("settings.externalCalendarRefreshFailed"),
				);
			}
		} finally {
			button.disabled = false;
		}
	}

	private async copyDetails(): Promise<void> {
		const { event, calendarName, locale } = this.options;
		const lines = [
			event.title,
			`${t("externalEvent.calendar")}: ${calendarName}`,
			`${t("externalEvent.date")}: ${getExternalEventDateRangeLabel(event)}`,
		];
		const time = getExternalEventTimeLabel(event, locale);
		if (time) lines.push(`${t("externalEvent.time")}: ${time}`);
		if (event.location) {
			lines.push(`${t("externalEvent.location")}: ${event.location}`);
		}
		if (event.descriptionText) {
			lines.push("", event.descriptionText);
		}
		await navigator.clipboard.writeText(lines.join("\n"));
		new Notice(t("externalEvent.copySuccess"));
	}
}
