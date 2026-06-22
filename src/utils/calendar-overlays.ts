import {
	getAlternateCalendarLabel,
	type AlternateCalendarSelection,
} from "./alternate-calendars";
import {
	formatCustomCalendarFullLabel,
	formatCustomCalendarLabel,
	getCustomCalendarDateParts,
	type CustomCalendarProfile,
} from "./custom-calendars";

export interface CalendarOverlayConfig {
	alternateCalendarId: AlternateCalendarSelection;
	customCalendarProfiles: readonly CustomCalendarProfile[];
	selectedCustomCalendarId: string;
	locale: string;
}

export interface CalendarOverlayLabel {
	id: string;
	name: string;
	text: string;
	fullText: string;
}

export function getCalendarOverlayLabel(
	year: number,
	month: number,
	day: number,
	config: CalendarOverlayConfig,
): CalendarOverlayLabel | null {
	if (config.selectedCustomCalendarId) {
		const profile = config.customCalendarProfiles.find(
			(item) => item.id === config.selectedCustomCalendarId,
		);
		if (!profile) return null;
		const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
		const parts = getCustomCalendarDateParts(dateStr, profile);
		if (!parts) return null;
		return {
			id: `custom:${profile.id}`,
			name: profile.name,
			text: formatCustomCalendarLabel(parts, profile),
			fullText: formatCustomCalendarFullLabel(parts),
		};
	}

	const alternate = getAlternateCalendarLabel(
		year,
		month,
		day,
		config.alternateCalendarId,
		config.locale,
	);
	if (!alternate) return null;
	return {
		id: alternate.id,
		name: alternate.name,
		text: alternate.text,
		fullText: alternate.text,
	};
}

export function formatCalendarOverlayAria(
	label: CalendarOverlayLabel | null,
): string {
	if (!label) return "";
	return ` (${label.name}: ${label.fullText})`;
}

export function getCalendarOverlayConfig(settings: {
	alternateCalendarId?: AlternateCalendarSelection;
	customCalendarProfiles?: readonly CustomCalendarProfile[];
	selectedCustomCalendarId?: string;
	locale?: string;
}): CalendarOverlayConfig {
	return {
		alternateCalendarId: settings.alternateCalendarId ?? "",
		customCalendarProfiles: settings.customCalendarProfiles ?? [],
		selectedCustomCalendarId: settings.selectedCustomCalendarId ?? "",
		locale: settings.locale ?? "en",
	};
}
