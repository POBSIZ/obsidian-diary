import { Platform, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { setLocale, t } from "./i18n";
import {
	DEFAULT_SETTINGS,
	DiaryObsidianSettings,
	DiaryObsidianSettingTab,
} from "./settings";
import { normalizeAlternateCalendarId } from "./utils/alternate-calendars";
import {
	clearCustomCalendarCaches,
	normalizeCustomCalendarProfiles,
} from "./utils/custom-calendars";
import {
	fetchExternalCalendarCache,
	getExternalCalendarCache,
	normalizeExternalCalendarCaches,
	normalizeExternalCalendarSettings,
} from "./utils/external-calendars";
import {
	VIEW_TYPE_YEARLY_PLANNER,
	VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
	VIEW_TYPE_MONTHLY_PLANNER,
	VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
	VIEW_TYPE_MONTHLY_LIST_PLANNER,
	VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
} from "./constants";
import { YearlyPlannerView } from "./views/yearly-planner/view";
import { YearlySidebarPlannerView } from "./views/yearly-planner/sidebar-view";
import { MonthlyPlannerView } from "./views/monthly-planner/view";
import { MonthlySidebarPlannerView } from "./views/monthly-planner/sidebar-view";
import { MonthlyListPlannerView } from "./views/monthly-list-planner/view";
import { MonthlyListSidebarPlannerView } from "./views/monthly-list-planner/sidebar-view";
import { registerPlannerReminders } from "./planner-reminders";

const SIDEBAR_PLANNER_VIEW_TYPES = [
	VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
	VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
	VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
] as const;

function normalizeYearlyPlannerExpandedMonths(months: unknown): number[] {
	if (!Array.isArray(months)) return [];
	const normalized = new Set<number>();
	for (const value of months) {
		const month = Number(value);
		if (Number.isInteger(month) && month >= 1 && month <= 12) {
			normalized.add(month);
		}
	}
	return Array.from(normalized).sort((a, b) => a - b);
}

export default class DiaryObsidian extends Plugin {
	settings: DiaryObsidianSettings;
	settingTab?: DiaryObsidianSettingTab;

	async onload() {
		await this.loadSettings();
		setLocale(this.settings.locale ?? "en");

		this.registerView(
			VIEW_TYPE_YEARLY_PLANNER,
			(leaf) => new YearlyPlannerView(leaf, this),
		);
		this.registerView(
			VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
			(leaf) => new YearlySidebarPlannerView(leaf, this),
		);
		this.registerView(
			VIEW_TYPE_MONTHLY_PLANNER,
			(leaf) => new MonthlyPlannerView(leaf, this),
		);
		this.registerView(
			VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
			(leaf) => new MonthlySidebarPlannerView(leaf, this),
		);
		this.registerView(
			VIEW_TYPE_MONTHLY_LIST_PLANNER,
			(leaf) => new MonthlyListPlannerView(leaf, this),
		);
		this.registerView(
			VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
			(leaf) => new MonthlyListSidebarPlannerView(leaf, this),
		);

		this.addRibbonIcon(
			"calendar-range",
			t("ribbon.openYearlyPlanner"),
			() => {
				void this.activateYearlyPlanner();
			},
		);
		this.addRibbonIcon(
			"calendar-days",
			t("command.openMonthlyPlannerInSidebar"),
			() => {
				void this.activateMonthlyPlannerInSidebar();
			},
		);
		this.addRibbonIcon(
			"list-ordered",
			t("ribbon.openMonthlyListPlanner"),
			() => {
				void this.activateMonthlyListPlanner();
			},
		);

		this.addCommand({
			id: "open-yearly-planner",
			name: t("command.openYearlyPlanner"),
			callback: () => void this.activateYearlyPlanner(),
		});
		this.addCommand({
			id: "open-monthly-planner",
			name: t("command.openMonthlyPlanner"),
			callback: () => void this.activateMonthlyPlanner(),
		});
		this.addCommand({
			id: "open-monthly-planner-in-sidebar",
			name: t("command.openMonthlyPlannerInSidebar"),
			callback: () => void this.activateMonthlyPlannerInSidebar(),
		});
		this.addCommand({
			id: "open-monthly-list-planner",
			name: t("command.openMonthlyListPlanner"),
			callback: () => void this.activateMonthlyListPlanner(),
		});

		this.app.workspace.onLayoutReady(() => {
			void this.ensureMonthlyPlannerSidebarLeaf({
				active: false,
				reveal: false,
			});
		});

		this.settingTab = new DiaryObsidianSettingTab(this.app, this);
		this.addSettingTab(this.settingTab);

		registerPlannerReminders(this);

		const debouncedRefresh = this.debounce(() => {
			this.refreshYearlyPlannerViews();
			this.refreshMonthlyPlannerViews();
			this.refreshMonthlyListPlannerViews();
		}, 150);

		this.registerEvent(
			this.app.vault.on("create", debouncedRefresh),
		);
		this.registerEvent(
			this.app.vault.on("delete", debouncedRefresh),
		);
		this.registerEvent(
			this.app.vault.on("rename", debouncedRefresh),
		);
		this.registerEvent(
			this.app.metadataCache.on("changed", debouncedRefresh),
		);

		let lastCheckedDate = new Date().toDateString();
		this.registerInterval(
			window.setInterval(() => {
				const today = new Date().toDateString();
				if (today !== lastCheckedDate) {
					lastCheckedDate = today;
					this.refreshYearlyPlannerViews();
					this.refreshMonthlyPlannerViews();
					this.refreshMonthlyListPlannerViews();
				}
			}, 60_000),
		);
	}

	onunload() {}

	async activateYearlyPlanner(): Promise<void> {
		const { workspace } = this.app;
		const year = new Date().getFullYear();
		const leaf = workspace.getLeaf();
		await leaf.setViewState({
			type: VIEW_TYPE_YEARLY_PLANNER,
			state: { year },
		});
		await workspace.revealLeaf(leaf);
	}

	async activateMonthlyPlanner(): Promise<void> {
		const { workspace } = this.app;
		const now = new Date();
		const leaf = workspace.getLeaf();
		await leaf.setViewState({
			type: VIEW_TYPE_MONTHLY_PLANNER,
			state: { year: now.getFullYear(), month: now.getMonth() + 1 },
		});
		await workspace.revealLeaf(leaf);
	}

	async activateMonthlyPlannerInSidebar(
		year?: number,
		month?: number,
	): Promise<void> {
		await this.ensureMonthlyPlannerSidebarLeaf({
			year,
			month,
			active: true,
			reveal: true,
		});
	}

	getPlannerFileOpenLeaf(sourceLeaf: WorkspaceLeaf): WorkspaceLeaf {
		if (!this.isSidebarLeaf(sourceLeaf)) return sourceLeaf;
		return (
			this.app.workspace.getMostRecentLeaf(this.app.workspace.rootSplit) ??
			this.app.workspace.getLeaf("tab")
		);
	}

	async openPlannerFile(
		sourceLeaf: WorkspaceLeaf,
		file: TFile,
	): Promise<void> {
		const targetLeaf = this.getPlannerFileOpenLeaf(sourceLeaf);
		await targetLeaf.openFile(file);
		if (targetLeaf !== sourceLeaf) {
			await this.app.workspace.revealLeaf(targetLeaf);
		}
	}

	async activateMonthlyListPlanner(): Promise<void> {
		const { workspace } = this.app;
		const now = new Date();
		const leaf = workspace.getLeaf();
		await leaf.setViewState({
			type: VIEW_TYPE_MONTHLY_LIST_PLANNER,
			state: { year: now.getFullYear(), month: now.getMonth() + 1 },
		});
		await workspace.revealLeaf(leaf);
	}

	/** Switch leaf to monthly planner. Reuses the same leaf. */
	async switchToMonthly(
		leaf: WorkspaceLeaf,
		year: number,
		month: number,
	): Promise<void> {
		await leaf.setViewState({
			type: VIEW_TYPE_MONTHLY_PLANNER,
			state: { year, month },
		});
		await this.app.workspace.revealLeaf(leaf);
	}

	async switchToMonthlySidebar(
		leaf: WorkspaceLeaf,
		year: number,
		month: number,
	): Promise<void> {
		await leaf.setViewState({
			type: VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
			state: { year, month },
		});
		await this.app.workspace.revealLeaf(leaf);
	}

	/** Switch leaf to monthly list planner. Reuses the same leaf. */
	async switchToMonthlyList(
		leaf: WorkspaceLeaf,
		year: number,
		month: number,
	): Promise<void> {
		await leaf.setViewState({
			type: VIEW_TYPE_MONTHLY_LIST_PLANNER,
			state: { year, month },
		});
		await this.app.workspace.revealLeaf(leaf);
	}

	async switchToMonthlyListSidebar(
		leaf: WorkspaceLeaf,
		year: number,
		month: number,
	): Promise<void> {
		await leaf.setViewState({
			type: VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
			state: { year, month },
		});
		await this.app.workspace.revealLeaf(leaf);
	}

	/** Switch leaf to yearly planner. Reuses the same leaf. */
	async switchToYearly(leaf: WorkspaceLeaf, year: number): Promise<void> {
		await leaf.setViewState({
			type: VIEW_TYPE_YEARLY_PLANNER,
			state: { year },
		});
		await this.app.workspace.revealLeaf(leaf);
	}

	async switchToYearlySidebar(
		leaf: WorkspaceLeaf,
		year: number,
	): Promise<void> {
		await leaf.setViewState({
			type: VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
			state: { year },
		});
		await this.app.workspace.revealLeaf(leaf);
	}

	/**
	 * Single control: yearly → monthly grid → monthly list → yearly.
	 * Preserves year/month between the two monthly modes.
	 */
	async cyclePlannerView(leaf: WorkspaceLeaf): Promise<void> {
		const { view } = leaf;
		if (view instanceof YearlyPlannerView) {
			const y = view.year;
			const now = new Date();
			const m =
				now.getFullYear() === y ? now.getMonth() + 1 : 1;
			if (view instanceof YearlySidebarPlannerView) {
				await this.switchToMonthlySidebar(leaf, y, m);
			} else {
				await this.switchToMonthly(leaf, y, m);
			}
		} else if (view instanceof MonthlySidebarPlannerView) {
			await this.switchToMonthlyListSidebar(
				leaf,
				view.year,
				view.month,
			);
		} else if (view instanceof MonthlyPlannerView) {
			await this.switchToMonthlyList(leaf, view.year, view.month);
		} else if (view instanceof MonthlyListSidebarPlannerView) {
			await this.switchToYearlySidebar(leaf, view.year);
		} else if (view instanceof MonthlyListPlannerView) {
			await this.switchToYearly(leaf, view.year);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<DiaryObsidianSettings>,
		);
		const legacyEnabledAlternateCalendars =
			this.settings.enabledAlternateCalendars;
		const legacyShowLunarDates = this.settings.showLunarDates;
		this.settings.alternateCalendarId = normalizeAlternateCalendarId(
			this.settings.alternateCalendarId,
			legacyEnabledAlternateCalendars,
			legacyShowLunarDates,
		);
		this.settings.customCalendarProfiles = normalizeCustomCalendarProfiles(
			this.settings.customCalendarProfiles,
		);
		if (
			this.settings.selectedCustomCalendarId &&
			!this.settings.customCalendarProfiles.some(
				(profile) => profile.id === this.settings.selectedCustomCalendarId,
			)
		) {
			this.settings.selectedCustomCalendarId = "";
		}
			if (this.settings.selectedCustomCalendarId) {
				this.settings.alternateCalendarId = "";
			}
			this.settings.externalCalendars = normalizeExternalCalendarSettings(
				this.settings.externalCalendars,
			);
			this.settings.externalCalendarCaches = normalizeExternalCalendarCaches(
				this.settings.externalCalendarCaches,
				this.settings.externalCalendars,
			);
			this.settings.yearlyPlannerExpandedMonths =
				normalizeYearlyPlannerExpandedMonths(
					this.settings.yearlyPlannerExpandedMonths,
			);
		delete this.settings.enabledAlternateCalendars;
		delete this.settings.showLunarDates;
	}

	async saveSettings() {
		setLocale(this.settings.locale ?? "en");
		this.settings.customCalendarProfiles = normalizeCustomCalendarProfiles(
			this.settings.customCalendarProfiles,
		);
		this.settings.externalCalendars = normalizeExternalCalendarSettings(
			this.settings.externalCalendars,
		);
		this.settings.externalCalendarCaches = normalizeExternalCalendarCaches(
			this.settings.externalCalendarCaches,
			this.settings.externalCalendars,
		);
		clearCustomCalendarCaches();
		this.settings.yearlyPlannerExpandedMonths =
			normalizeYearlyPlannerExpandedMonths(
				this.settings.yearlyPlannerExpandedMonths,
			);
		await this.saveData(this.settings);
		this.refreshYearlyPlannerViews();
		this.refreshMonthlyPlannerViews();
		this.refreshMonthlyListPlannerViews();
	}

	async refreshExternalCalendar(calendarId: string): Promise<boolean> {
		const calendar = this.settings.externalCalendars.find(
			(item) => item.id === calendarId,
		);
		if (!calendar) return false;
		const cache = await fetchExternalCalendarCache(
			calendar,
			getExternalCalendarCache(this.settings, calendar.id),
		);
		this.settings.externalCalendarCaches = [
			...this.settings.externalCalendarCaches.filter(
				(item) => item.calendarId !== calendar.id,
			),
			cache,
		];
		await this.saveSettings();
		return !cache.lastError;
	}

	/** Toggle plan note panel expanded state and persist. */
	async togglePlanNotePanelExpanded(): Promise<void> {
		const next = !this.isPlanNotePanelExpanded();
		if (Platform.isMobile) {
			this.settings.mobilePlanNotePanelExpanded = next;
		} else {
			this.settings.planNotePanelExpanded = next;
		}
		await this.saveSettings();
	}

	isPlanNotePanelExpanded(): boolean {
		if (Platform.isMobile) {
			return this.settings.mobilePlanNotePanelExpanded ?? false;
		}
		return this.settings.planNotePanelExpanded ?? true;
	}

	getYearlyPlannerExpandedMonths(): number[] {
		return normalizeYearlyPlannerExpandedMonths(
			this.settings.yearlyPlannerExpandedMonths,
		);
	}

	async setYearlyPlannerExpandedMonths(months: Iterable<number>): Promise<void> {
		this.settings.yearlyPlannerExpandedMonths =
			normalizeYearlyPlannerExpandedMonths(Array.from(months));
		await this.saveSettings();
	}

	refreshYearlyPlannerViews(): void {
		const leaves = [
			...this.app.workspace.getLeavesOfType(
				VIEW_TYPE_YEARLY_PLANNER,
			),
			...this.app.workspace.getLeavesOfType(
				VIEW_TYPE_YEARLY_SIDEBAR_PLANNER,
			),
		];
		for (const leaf of leaves) {
			const view = leaf.view;
			if (view instanceof YearlyPlannerView) {
				view.render();
			}
		}
	}

	refreshMonthlyPlannerViews(): void {
		const leaves = [
			...this.app.workspace.getLeavesOfType(
				VIEW_TYPE_MONTHLY_PLANNER,
			),
			...this.app.workspace.getLeavesOfType(
				VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
			),
		];
		for (const leaf of leaves) {
			const view = leaf.view;
			if (view instanceof MonthlyPlannerView) {
				view.render();
			}
		}
	}

	refreshMonthlyListPlannerViews(): void {
		const leaves = [
			...this.app.workspace.getLeavesOfType(
				VIEW_TYPE_MONTHLY_LIST_PLANNER,
			),
			...this.app.workspace.getLeavesOfType(
				VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER,
			),
		];
		for (const leaf of leaves) {
			const view = leaf.view;
			if (view instanceof MonthlyListPlannerView) {
				view.render();
			}
		}
	}

	private async ensureMonthlyPlannerSidebarLeaf(options: {
		year?: number;
		month?: number;
		active: boolean;
		reveal: boolean;
	}): Promise<WorkspaceLeaf> {
		const now = new Date();
		const hasExplicitDate =
			options.year !== undefined || options.month !== undefined;
		const existingLeaf = this.findPlannerSidebarLeaf();
		const legacyLeaf = this.findMonthlyPlannerLeafInRightSidebar();
		const legacyState = this.getMonthlyPlannerLeafState(legacyLeaf);
		const state =
			hasExplicitDate || !existingLeaf
				? {
						year: options.year ?? legacyState?.year ?? now.getFullYear(),
						month: options.month ?? legacyState?.month ?? now.getMonth() + 1,
					}
				: null;

		if (existingLeaf) {
			if (state) {
				await existingLeaf.setViewState({
					type: VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
					state,
					active: options.active,
				});
			}
			if (options.reveal) {
				await this.app.workspace.revealLeaf(existingLeaf);
			}
			this.detachDuplicateMonthlySidebarPlannerLeaves(existingLeaf);
			this.detachLegacyRightMonthlyPlannerLeaves();
			return existingLeaf;
		}

		const sideLeafOptions: {
			active: boolean;
			reveal: boolean;
			split: boolean;
			state?: { year: number; month: number };
		} = {
			active: options.active,
			reveal: options.reveal,
			split: false,
		};
		if (state) {
			sideLeafOptions.state = state;
		}

		const leaf = await this.app.workspace.ensureSideLeaf(
			VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER,
			"right",
			sideLeafOptions,
		);
		this.detachDuplicateMonthlySidebarPlannerLeaves(leaf);
		this.detachLegacyRightMonthlyPlannerLeaves();
		return leaf;
	}

	private findPlannerSidebarLeaf(): WorkspaceLeaf | null {
		const leaves = SIDEBAR_PLANNER_VIEW_TYPES.flatMap((type) =>
			this.app.workspace.getLeavesOfType(type),
		);
		for (const leaf of leaves) {
			if (leaf.view.containerEl.closest(".mod-right-split")) {
				return leaf;
			}
		}
		return leaves[0] ?? null;
	}

	private findMonthlyPlannerLeafInRightSidebar(): WorkspaceLeaf | null {
		const leaves = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_MONTHLY_PLANNER,
		);
		for (const leaf of leaves) {
			if (
				leaf.view instanceof MonthlyPlannerView &&
				leaf.view.containerEl.closest(".mod-right-split")
			) {
				return leaf;
			}
		}
		return null;
	}

	private getMonthlyPlannerLeafState(
		leaf: WorkspaceLeaf | null,
	): { year: number; month: number } | null {
		if (!(leaf?.view instanceof MonthlyPlannerView)) return null;
		return { year: leaf.view.year, month: leaf.view.month };
	}

	private detachLegacyRightMonthlyPlannerLeaves(): void {
		const leaves = this.app.workspace.getLeavesOfType(
			VIEW_TYPE_MONTHLY_PLANNER,
		);
		for (const leaf of leaves) {
			if (leaf.view.containerEl.closest(".mod-right-split")) {
				leaf.detach();
			}
		}
	}

	private detachDuplicateMonthlySidebarPlannerLeaves(
		keepLeaf: WorkspaceLeaf,
	): void {
		const leaves = SIDEBAR_PLANNER_VIEW_TYPES.flatMap((type) =>
			this.app.workspace.getLeavesOfType(type),
		);
		for (const leaf of leaves) {
			if (leaf !== keepLeaf) {
				leaf.detach();
			}
		}
	}

	private isSidebarLeaf(leaf: WorkspaceLeaf): boolean {
		return Boolean(
			leaf.view.containerEl.closest(".mod-left-split, .mod-right-split"),
		);
	}

	private debounce(fn: () => void, delayMs: number): () => void {
		let timeout: number | null = null;
		return () => {
			if (timeout !== null) window.clearTimeout(timeout);
			timeout = window.setTimeout(() => {
				timeout = null;
				fn();
			}, delayMs);
		};
	}
}
