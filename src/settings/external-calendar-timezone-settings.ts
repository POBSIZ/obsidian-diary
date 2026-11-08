import type { Setting } from "obsidian";
import { t } from "../i18n";
import type DiaryObsidian from "../main";
import { getDeviceTimeZone, getExternalCalendarTimeZones } from "../utils/external-calendar-timezone";

/** Shared by the legacy settings tab and Obsidian's searchable setting definitions. */
export function renderExternalCalendarTimeZoneSetting(setting: Setting, plugin: DiaryObsidian): void {
	setting.setName(t("settings.externalCalendarTimeZone"))
		.setDesc(t("settings.externalCalendarTimeZoneDesc"))
		.addDropdown((dropdown) => {
			dropdown.addOption("device", t("settings.timeZoneDevice", { zone: getDeviceTimeZone() }));
			for (const zone of getExternalCalendarTimeZones(plugin.settings.externalCalendarTimeZone)) {
				dropdown.addOption(zone, zone);
			}
			dropdown.setValue(plugin.settings.externalCalendarTimeZone).onChange(async (value) => {
				plugin.settings.externalCalendarTimeZone = value;
				await plugin.saveSettings();
			});
		});
}
