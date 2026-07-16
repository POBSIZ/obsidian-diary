import { App, Modal, Notice, TFile } from "obsidian";
import { t } from "../i18n";
import {
	attachUiPressFeedback,
	createUiBadge,
	createUiButton,
	createUiButtonRow,
} from "../ui/components";
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
	createFile?: () => Promise<TFile>;
	readOnlyHint?: string;
	createSuccessMessage?: string;
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
		createUiBadge(titleBlock, {
			classes: "planner-external-event-source-badge",
			text: calendarName,
			color: event.color,
			colorProperty: "--external-calendar-color",
		});
		titleBlock.createEl("h2", { text: event.title });
		this.contentEl.createDiv({
			cls: "yearly-planner-create-file-hint planner-external-event-readonly-hint",
			text: this.options.readOnlyHint ?? t("externalEvent.readOnlyHint"),
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

		const actions = createUiButtonRow(
			this.contentEl,
			"yearly-planner-modal-actions",
		);
		const createBtn = this.createActionButton(
			actions,
			"file-plus-2",
			t("externalEvent.createMarkdown"),
			{ cta: true },
		);
		createBtn.onclick = () => void this.createMarkdownNote(createBtn);
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
		copyBtn.onclick = () => void this.copyDetails(copyBtn);
		const closeBtn = this.createActionButton(actions, "x", t("modal.cancel"));
		closeBtn.onclick = () => this.close();
	}

	private createActionButton(
		container: HTMLElement,
		icon: string,
		text: string,
		options: { cta?: boolean } = {},
	): HTMLButtonElement {
		const button = createUiButton(container, {
			classes: "diary-calendar-action-button",
			variant: options.cta ? "cta" : "default",
			icon,
			text,
			ariaLabel: text,
			title: text,
			iconClass: "diary-calendar-action-icon",
			labelClass: "diary-calendar-action-label",
		});
		attachUiPressFeedback(button);
		return button;
	}

	private setButtonBusy(button: HTMLButtonElement, busy: boolean): void {
		button.disabled = busy;
		button.toggleClass("is-loading", busy);
		if (busy) {
			button.removeClass("is-complete");
			button.setAttribute("aria-busy", "true");
		} else {
			button.removeAttribute("aria-busy");
		}
	}

	private markButtonComplete(button: HTMLButtonElement): void {
		for (const el of Array.from(
			this.contentEl.querySelectorAll(".diary-calendar-action-button.is-complete"),
		)) {
			el.removeClass("is-complete");
		}
		button.addClass("is-complete");
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

	private async createMarkdownNote(button: HTMLButtonElement): Promise<void> {
		this.setButtonBusy(button, true);
		try {
			const file = this.options.createFile
				? await this.options.createFile()
				: await createExternalEventFile(
						this.app,
						this.options.folder,
						this.options.event,
						this.options.calendarName,
						this.options.locale,
					);
			await this.options.onCreated(file);
			new Notice(
				this.options.createSuccessMessage ?? t("externalEvent.createSuccess"),
			);
			this.close();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: t("modal.failedToCreateFile");
			new Notice(
				t("externalEvent.createFailed", {
					message,
				}),
			);
		} finally {
			this.setButtonBusy(button, false);
		}
	}

	private async refreshCalendar(button: HTMLButtonElement): Promise<void> {
		if (!this.options.onRefresh) return;
		this.setButtonBusy(button, true);
		try {
			const ok = await this.options.onRefresh();
			if (typeof ok === "boolean") {
				if (ok) this.markButtonComplete(button);
				new Notice(
					ok
						? t("settings.externalCalendarRefreshSuccess")
						: t("settings.externalCalendarRefreshFailed"),
				);
			}
		} finally {
			this.setButtonBusy(button, false);
		}
	}

	private async copyDetails(button: HTMLButtonElement): Promise<void> {
		this.setButtonBusy(button, true);
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
		try {
			await navigator.clipboard.writeText(lines.join("\n"));
			this.markButtonComplete(button);
			new Notice(t("externalEvent.copySuccess"));
		} catch {
			// Press/busy state is the only in-modal feedback for this action.
		} finally {
			this.setButtonBusy(button, false);
		}
	}
}
