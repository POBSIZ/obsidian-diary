import type { App } from "obsidian";
import type { DiaryObsidianSettings } from "../settings";
import { normalizeLocale, setLocale } from "../i18n";
import { configureDateFormats, normalizeDateFormats } from "../utils/date-formats";
import { configurePlannerColors, normalizeColorPalette, normalizePlannerColorSelection } from "../utils/planner-colors";
import { clearCustomCalendarCaches, normalizeCustomCalendarProfiles } from "../utils/custom-calendars";
import { normalizeExternalCalendarCaches, normalizeExternalCalendarSettings } from "../utils/external-calendars";
import { normalizeExternalCalendarTimeZone } from "../utils/external-calendar-timezone";
import { normalizeSidebarDefaultView } from "../utils/sidebar-planner";

export type SettingsKey = keyof DiaryObsidianSettings;
export type SettingsRefresh = "all" | "panels" | "yearly" | "monthly";

export function normalizeYearlyPlannerExpandedMonths(months: unknown): number[] {
	if (!Array.isArray(months)) return [];
	const normalized = new Set<number>();
	for (const value of months) {
		const month = Number(value);
		if (Number.isInteger(month) && month >= 1 && month <= 12) normalized.add(month);
	}
	return Array.from(normalized).sort((a, b) => a - b);
}

/** Omit keys for external/unknown mutations to retain the complete validation contract. */
export function prepareSettingsSave(app: App, settings: DiaryObsidianSettings, keys?: readonly SettingsKey[]): SettingsRefresh {
	const changed = keys?.length ? new Set(keys) : null;
	const has = (key: SettingsKey): boolean => !changed || changed.has(key);
	if (has("externalCalendarTimeZone")) settings.externalCalendarTimeZone = normalizeExternalCalendarTimeZone(settings.externalCalendarTimeZone);
	if (has("sidebarDefaultView")) settings.sidebarDefaultView = normalizeSidebarDefaultView(settings.sidebarDefaultView);
	if (has("dateFormats")) {
		settings.dateFormats = normalizeDateFormats(settings.dateFormats);
	}
	if (has("colorPalette")) settings.colorPalette = normalizeColorPalette(settings.colorPalette);
	if (has("holidayColor")) settings.holidayColor = normalizePlannerColorSelection(settings.holidayColor);
	if (has("dateFormats")) configureDateFormats(settings.dateFormats);
	if (has("colorPalette") || has("holidayColor")) configurePlannerColors(app, settings);
	if (has("locale")) {
		settings.locale = normalizeLocale(settings.locale);
		setLocale(settings.locale ?? "en");
	}
	if (has("customCalendarProfiles")) {
		settings.customCalendarProfiles = normalizeCustomCalendarProfiles(settings.customCalendarProfiles);
	}
	if (has("externalCalendars")) settings.externalCalendars = normalizeExternalCalendarSettings(settings.externalCalendars);
	if (has("externalCalendars") || has("externalCalendarCaches")) {
		settings.externalCalendarCaches = normalizeExternalCalendarCaches(settings.externalCalendarCaches, settings.externalCalendars);
	}
	if (has("customCalendarProfiles")) clearCustomCalendarCaches();
	if (has("yearlyPlannerExpandedMonths")) settings.yearlyPlannerExpandedMonths = normalizeYearlyPlannerExpandedMonths(settings.yearlyPlannerExpandedMonths);

	if (!changed) return "all";
	const only = (allowed: readonly SettingsKey[]): boolean => [...changed].every((key) => allowed.includes(key));
	if (only(["planNotePanelExpanded", "mobilePlanNotePanelExpanded"])) return "panels";
	if (only(["yearlyPlannerExpandedMonths", "yearlyPlanNotePath", "yearlyPlanNotePathGrammarVersion"])) return "yearly";
	if (only(["monthlyPlanNotePath", "monthlyPlanNotePathGrammarVersion"])) return "monthly";
	return "all";
}
