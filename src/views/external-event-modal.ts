import { App, Modal, Notice, TFile } from "obsidian";
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
	onRefresh?: () => void | Promise<void>;
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
		this.contentEl.createEl("h2", { text: event.title });
		this.contentEl.createDiv({
			cls: "yearly-planner-create-file-hint",
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
		const createBtn = actions.createEl("button", {
			cls: "mod-cta",
			text: t("externalEvent.createMarkdown"),
			attr: { type: "button" },
		});
		createBtn.onclick = () => void this.createMarkdownNote();
		if (this.options.onRefresh) {
			const refreshBtn = actions.createEl("button", {
				text: t("externalEvent.refreshCalendar"),
				attr: { type: "button" },
			});
			refreshBtn.onclick = () => void this.options.onRefresh?.();
		}
		const copyBtn = actions.createEl("button", {
			text: t("externalEvent.copyDetails"),
			attr: { type: "button" },
		});
		copyBtn.onclick = () => void this.copyDetails();
		const closeBtn = actions.createEl("button", {
			text: t("modal.cancel"),
			attr: { type: "button" },
		});
		closeBtn.onclick = () => this.close();
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
