import { t } from "../i18n";
import { createUiBadge } from "../ui/components";
import type { ExternalCalendarCache, ExternalCalendarSettings } from "../utils/external-calendars";

export const EXTERNAL_CALENDAR_REFRESH_OPTIONS: Array<{
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

export function getExternalCalendarVisibilityCount(
	calendar: ExternalCalendarSettings,
): number {
	return getExternalCalendarVisibilityItems(calendar).filter((item) => item.enabled)
		.length;
}

export function formatExternalCalendarVisibilitySummary(
	calendar: ExternalCalendarSettings,
): string {
	const count = getExternalCalendarVisibilityCount(calendar);
	if (count === 0) return t("settings.externalCalendarVisibilityHidden");
	return t("settings.externalCalendarVisibilityCount", { count });
}

export function createExternalCalendarVisibilityPills(
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
		createUiBadge(pills, {
			classes: item.enabled
				? "diary-calendar-settings-pill is-active"
				: "diary-calendar-settings-pill is-muted",
			text: item.label,
			tag: "span",
		});
	}
}

export function formatExternalCalendarRefreshInterval(minutes: number | null): string {
	const option = EXTERNAL_CALENDAR_REFRESH_OPTIONS.find(
		(item) => item.minutes === minutes,
	);
	if (option) return t(option.labelKey);
	if (minutes == null) return t("settings.externalCalendarRefreshManual");
	return t("settings.externalCalendarRefreshEvery", { minutes });
}

export function getExternalCalendarRefreshOptionValue(minutes: number | null): string {
	const option = EXTERNAL_CALENDAR_REFRESH_OPTIONS.find(
		(item) => item.minutes === minutes,
	);
	return option?.value ?? (minutes == null ? "manual" : String(minutes));
}

export function formatExternalCalendarRefreshTiming(
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
