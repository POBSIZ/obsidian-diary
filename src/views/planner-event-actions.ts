import type { App, WorkspaceLeaf } from "obsidian";
import type DiaryObsidian from "../main";
import { t } from "../i18n";
import { getExternalCalendarName, type ExternalCalendarEvent } from "../utils/external-calendars";
import { createRecurrenceOccurrenceFile, isRecurrenceVirtualEvent } from "../utils/recurrence";
import { ExternalEventModal } from "./external-event-modal";
import { getPlannerMarkdownFiles } from "./yearly-planner/file-utils";

/** Keep external and virtual-occurrence actions identical across planner views. */
export function openPlannerEventModal(
	app: App,
	plugin: DiaryObsidian,
	leaf: WorkspaceLeaf,
	event: ExternalCalendarEvent,
	render: () => void,
): void {
	const recurrenceEvent = isRecurrenceVirtualEvent(event) ? event : null;
	const plannerFiles = recurrenceEvent
		? getPlannerMarkdownFiles(
				app,
				plugin.settings.plannerFolder || "Planner",
				plugin.settings.plannerFileScope ?? "vault",
			)
		: [];
	new ExternalEventModal(app, {
		event,
		calendarName: recurrenceEvent
			? t("recurrence.virtualSource")
			: getExternalCalendarName(plugin.settings, event.calendarId),
		folder: plugin.settings.plannerFolder || "Planner",
		locale: plugin.settings.locale ?? "en",
		onCreated: async (file) => {
			await plugin.openPlannerFile(leaf, file);
			render();
		},
		createFile: recurrenceEvent
			? () =>
					createRecurrenceOccurrenceFile({
						app,
						sourcePath: recurrenceEvent.recurrenceSourcePath,
						occurrenceDate: recurrenceEvent.recurrenceOccurrenceDate,
						plannerFiles,
					})
			: undefined,
		readOnlyHint: recurrenceEvent
			? t("recurrence.virtualHint")
			: undefined,
		createSuccessMessage: recurrenceEvent
			? t("recurrence.createSuccess")
			: undefined,
		onRefresh: recurrenceEvent
			? undefined
			: async () => {
					const ok = await plugin.refreshExternalCalendar(event.calendarId);
					render();
					return ok;
				},
	}).open();
}
