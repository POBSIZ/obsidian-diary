import { Notice, Setting } from "obsidian";
import type DiaryObsidian from "../main";
import { t } from "../i18n";
import { createUiBadge, createUiDisclosure } from "../ui/components";
import { getExternalCalendarCache } from "../utils/external-calendars";
import { ExternalCalendarFeedModal } from "./external-calendar-feed-modal";
import { renderExternalCalendarRow, type ExternalCalendarRenderState } from "./external-calendar-row";

export function renderExternalCalendarSettings(containerEl: HTMLElement, plugin: DiaryObsidian): void {
	const mount = containerEl.createDiv({
		cls: "diary-external-calendar-settings-mount",
	});
	const state: ExternalCalendarRenderState = {
		sectionOpen: null,
		openCalendarIds: new Set(),
	};
	const rerender = (): void => {
		mount.empty();
		renderExternalCalendarContent(mount, plugin, rerender, state);
	};
	rerender();
}

function renderExternalCalendarContent(
	containerEl: HTMLElement,
	plugin: DiaryObsidian,
	rerender: () => void,
	state: ExternalCalendarRenderState,
): void {
	const calendars = plugin.settings.externalCalendars;
	const enabledCount = calendars.filter((calendar) => calendar.enabled).length;
	const autoRefreshCount = calendars.filter(
		(calendar) => calendar.enabled && calendar.refreshMinutes != null,
	).length;
	const errorCount = calendars.filter(
		(calendar) =>
			getExternalCalendarCache(plugin.settings, calendar.id)
				?.lastError,
	).length;
	const section = createUiDisclosure(containerEl, {
		classes: "diary-calendar-settings-panel diary-external-calendar-settings",
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
	createUiBadge(meta, {
		classes: "diary-calendar-settings-pill diary-external-calendar-settings-pill",
		text: t("settings.externalCalendarCount", {
			count: calendars.length,
		}),
		tag: "span",
	});
	if (enabledCount > 0) {
		createUiBadge(meta, {
			classes: "diary-calendar-settings-pill diary-external-calendar-settings-pill",
			text: t("settings.externalCalendarEnabledCount", {
				count: enabledCount,
			}),
			tag: "span",
		});
	}
	if (autoRefreshCount > 0) {
		createUiBadge(meta, {
			classes: "diary-calendar-settings-pill diary-external-calendar-settings-pill",
			text: t("settings.externalCalendarAutoRefreshCount", {
				count: autoRefreshCount,
			}),
			tag: "span",
		});
	}
	if (errorCount > 0) {
		createUiBadge(meta, {
			classes: "diary-calendar-settings-pill diary-calendar-settings-pill-error diary-external-calendar-settings-pill diary-external-calendar-settings-pill-error",
			text: t("settings.externalCalendarHasError"),
			tag: "span",
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
		renderExternalCalendarRow(body, plugin, calendar, rerender, state);
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
					const result = await plugin.refreshAllExternalCalendars();
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
						plugin.app,
						null,
						async (calendar) => {
							plugin.settings.externalCalendars = [
								...plugin.settings.externalCalendars,
								calendar,
							];
							const ok = await plugin.refreshExternalCalendar(
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
