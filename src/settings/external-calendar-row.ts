import { Notice } from "obsidian";
import type DiaryObsidian from "../main";
import { t } from "../i18n";
import { createUiBadge, createUiButton, createUiDisclosure } from "../ui/components";
import { getExternalCalendarCache, type ExternalCalendarSettings } from "../utils/external-calendars";
import { ExternalCalendarFeedModal } from "./external-calendar-feed-modal";
import {
	createExternalCalendarVisibilityPills,
	formatExternalCalendarRefreshInterval,
	formatExternalCalendarRefreshTiming,
	formatExternalCalendarVisibilitySummary,
	getExternalCalendarVisibilityCount,
} from "./external-calendar-presentation";

export type ExternalCalendarRenderState = {
	sectionOpen: boolean | null;
	openCalendarIds: Set<string>;
};

export function renderExternalCalendarRow(
	containerEl: HTMLElement,
	plugin: DiaryObsidian,
	calendar: ExternalCalendarSettings,
	rerender: () => void,
	state: ExternalCalendarRenderState,
): void {
	const cache = getExternalCalendarCache(plugin.settings, calendar.id);
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
	const item = createUiDisclosure(containerEl, {
		classes: "diary-calendar-profile-card diary-external-calendar-feed",
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
	createUiBadge(meta, {
		classes: cache?.lastError
			? "diary-calendar-settings-pill diary-calendar-settings-pill-error"
			: calendar.enabled
				? "diary-calendar-settings-pill is-active"
				: "diary-calendar-settings-pill",
		text: cache?.lastError
			? t("settings.externalCalendarHasError")
			: calendar.enabled
				? t("settings.externalCalendarEnabled")
				: t("settings.externalCalendarDisabled"),
		tag: "span",
	});
	createUiBadge(meta, {
		classes: "diary-calendar-settings-pill",
		text: refreshLabel,
		tag: "span",
	});
	createUiBadge(meta, {
		classes:
			getExternalCalendarVisibilityCount(calendar) > 0
				? "diary-calendar-settings-pill"
				: "diary-calendar-settings-pill is-muted",
		text: formatExternalCalendarVisibilitySummary(calendar),
		tag: "span",
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
				await plugin.saveSettings();
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
				const ok = await plugin.refreshExternalCalendar(calendar.id);
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
					plugin.app,
					calendar,
					async (next) => {
						plugin.settings.externalCalendars =
							plugin.settings.externalCalendars.map((item) =>
								item.id === next.id ? next : item,
							);
						if (next.enabled) {
							await plugin.refreshExternalCalendar(next.id);
						} else {
							await plugin.saveSettings();
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
				plugin.settings.externalCalendars =
					plugin.settings.externalCalendars.filter(
						(item) => item.id !== calendar.id,
					);
				plugin.settings.externalCalendarCaches =
					plugin.settings.externalCalendarCaches.filter(
						(item) => item.calendarId !== calendar.id,
					);
				await plugin.saveSettings();
				state.openCalendarIds.delete(calendar.id);
				rerender();
			},
		},
	);
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
	return createUiButton(containerEl, {
		variant: options.cta ? "cta" : options.warning ? "warning" : "default",
		icon: options.icon,
		text,
		ariaLabel: text,
		title: text,
		iconClass: "diary-calendar-action-icon",
		labelClass: "diary-calendar-action-label",
		onClick: options.onClick,
	});
}
