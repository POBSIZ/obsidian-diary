import { Notice, Plugin, TAbstractFile, TFile } from "obsidian";
import { t } from "./i18n";
import { getFileTitle } from "./views/yearly-planner/file-utils";
import { onDateFormatsChanged } from "./utils/date-formats";
import { PlannerReminderIndex, type PlannerReminderSettings } from "./reminders/reminder-index";

const pad2 = (n: number) => String(n).padStart(2, "0");

function localDateStr(d: Date): string {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export interface PlannerReminderController {
	/** Rebuild only when the effective note scan scope has changed. */
	refreshScope(): void;
}

/**
 * While Obsidian is open, shows a Notice when local time matches `notify_minutes` on the note's event day.
 */
export function registerPlannerReminders(
	plugin: Plugin & { settings: PlannerReminderSettings },
): PlannerReminderController {
	const index = new PlannerReminderIndex(plugin.app, () => plugin.settings);
	const fired = new Set<string>();
	const pendingFiles = new Set<TFile>();
	const win = plugin.app.workspace.containerEl.ownerDocument.defaultView ?? window;
	let timer: number | null = null;
	let fullRebuild = false;
	let ready = false;
	let disposed = false;

	const flush = (): void => {
		timer = null;
		if (disposed || !ready) return;
		if (fullRebuild) index.rebuild();
		else index.updateFiles(pendingFiles);
		pendingFiles.clear();
		fullRebuild = false;
	};
	const schedule = (): void => {
		if (disposed || !ready) return;
		if (timer !== null) win.clearTimeout(timer);
		timer = win.setTimeout(flush, 200);
	};
	const rebuild = (): void => {
		if (disposed || !ready) return;
		fullRebuild = true;
		schedule();
	};
	const update = (file: TAbstractFile): void => {
		if (disposed || !ready) return;
		// A folder move/deletion can change many descendants without individual file events.
		if (file instanceof TFile) pendingFiles.add(file);
		else fullRebuild = true;
		schedule();
	};

	plugin.register(() => {
		disposed = true;
		if (timer !== null) win.clearTimeout(timer);
		timer = null;
		pendingFiles.clear();
		index.clear();
	});
	plugin.registerEvent(plugin.app.metadataCache.on("changed", update));
	plugin.registerEvent(plugin.app.vault.on("create", update));
	plugin.registerEvent(plugin.app.vault.on("delete", update));
	plugin.registerEvent(plugin.app.vault.on("rename", update));
	plugin.register(onDateFormatsChanged(rebuild));

	const initialize = (): void => {
		if (disposed || ready) return;
		ready = true;
		index.rebuild();
	};
	if (typeof plugin.app.workspace.onLayoutReady === "function") {
		plugin.app.workspace.onLayoutReady(initialize);
	} else {
		initialize();
	}

	plugin.registerInterval(
		win.setInterval(() => {
			if (disposed || !ready) return;
			const now = new Date();
			const todayStr = localDateStr(now);
			const nowMins = now.getHours() * 60 + now.getMinutes();

			for (const k of [...fired]) {
				const datePart = k.split("|")[1];
				if (datePart && datePart < todayStr) fired.delete(k);
			}

			for (const e of index.getDue(todayStr, nowMins)) {
				const key = `${e.file.path}|${e.dateStr}|${e.minutes}`;
				if (fired.has(key)) continue;
				fired.add(key);
				new Notice(
					t("notify.plannerReminder", {
						title: getFileTitle(plugin.app, e.file),
					}),
					12_000,
				);
			}
		}, 15_000),
	);

	return {
		refreshScope: () => {
			if (index.hasScopeChanged()) rebuild();
		},
	};
}
