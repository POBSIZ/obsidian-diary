import { App, TFile, TFolder } from "obsidian";
import {
	getNotifyMinutes,
	getPlannerMarkdownFiles,
	type PlannerFileScope,
} from "../views/yearly-planner/file-utils";
import { getPlannerEventDateString } from "../views/yearly-planner/file-operations";

export interface PlannerReminderSettings {
	plannerFolder?: string;
	plannerFileScope?: PlannerFileScope;
}

interface ReminderEntry {
	file: TFile;
	dateStr: string;
	minutes: number;
}

/** Stores reminder metadata by file identity; only broad invalidations enumerate the vault. */
export class PlannerReminderIndex {
	private readonly entries = new Map<TFile, ReminderEntry>();
	private indexedScope = "";

	constructor(
		private readonly app: App,
		private readonly getSettings: () => PlannerReminderSettings,
	) {}

	private getScope(): { folder: string; scope: PlannerFileScope; key: string } {
		const settings = this.getSettings();
		const folder = (settings.plannerFolder || "Planner").trim().replace(/^\/+|\/+$/g, "");
		const scope = settings.plannerFileScope ?? "vault";
		return { folder, scope, key: scope === "vault" ? "vault" : `folder:${folder}` };
	}

	hasScopeChanged(): boolean {
		return this.getScope().key !== this.indexedScope;
	}

	private readEntry(file: TFile): ReminderEntry | null {
		const minutes = getNotifyMinutes(this.app, file);
		if (minutes === null) return null;
		const dateStr = getPlannerEventDateString(file);
		return dateStr ? { file, dateStr, minutes } : null;
	}

	rebuild(): void {
		const { scope, key } = this.getScope();
		this.entries.clear();
		for (const file of getPlannerMarkdownFiles(this.app, this.getSettings().plannerFolder || "Planner", scope)) {
			const entry = this.readEntry(file);
			if (entry) this.entries.set(file, entry);
		}
		this.indexedScope = key;
	}

	updateFiles(files: Iterable<TFile>): void {
		const { folder, scope } = this.getScope();
		const root = scope === "vault" ? null : folder
			? this.app.vault.getAbstractFileByPath(folder)
			: this.app.vault.getRoot();
		const updated: TFile[] = [];
		for (const file of files) {
			const inScope = scope === "vault" || root instanceof TFolder &&
				(!folder || file.path.startsWith(`${folder}/`));
			const exists = this.app.vault.getAbstractFileByPath(file.path) === file;
			const entry = inScope && exists && file.extension.toLowerCase() === "md"
				? this.readEntry(file) : null;
			if (entry) {
				this.entries.set(file, entry);
				updated.push(file);
			} else this.entries.delete(file);
		}
		// localeCompare can equate distinct Unicode paths. Preserve the original
		// vault/tree traversal order for those ties instead of relying on update order.
		for (const file of updated) {
			for (const other of this.entries.keys()) {
				if (other !== file && file.path.localeCompare(other.path) === 0) {
					this.rebuild();
					return;
				}
			}
		}
	}

	getDue(dateStr: string, minutes: number): ReminderEntry[] {
		return [...this.entries.values()]
			.filter((entry) => entry.dateStr === dateStr && entry.minutes === minutes)
			.sort((a, b) => a.file.path.localeCompare(b.file.path));
	}

	clear(): void {
		this.entries.clear();
	}
}
