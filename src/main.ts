import { Platform, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { normalizeLocale, setLocale, t } from "./i18n";
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
	DEFAULT_EXTERNAL_CALENDAR_REFRESH_MINUTES,
	fetchExternalCalendarCache,
	getExternalCalendarCache,
	normalizeExternalCalendarCaches,
	normalizeExternalCalendarSettings,
	type ExternalCalendarSettings,
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
	private readonly externalCalendarRefreshInFlight = new Set<string>();
	private didRefreshExternalCalendarsOnStartup = false;

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
			void this.refreshExternalCalendarsOnStartup();
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
		this.registerInterval(
			window.setInterval(() => {
				void this.refreshDueExternalCalendars();
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
		this.settings.locale = normalizeLocale(this.settings.locale);
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
		const shouldMigrateExternalCalendarRefresh =
			this.settings.externalCalendarAutoRefreshMigrated !== true;
		const shouldMigrateExternalCalendarYearlyVisibility =
			this.settings.externalCalendarYearlyVisibilityMigrated !== true;
		this.settings.externalCalendars = normalizeExternalCalendarSettings(
			this.settings.externalCalendars,
			{
				defaultRefreshMinutes: shouldMigrateExternalCalendarRefresh
					? DEFAULT_EXTERNAL_CALENDAR_REFRESH_MINUTES
					: null,
			},
		);
		if (shouldMigrateExternalCalendarYearlyVisibility) {
			this.settings.externalCalendars =
				this.settings.externalCalendars.map((calendar) => ({
					...calendar,
					showInYearly: true,
				}));
		}
		this.settings.externalCalendarAutoRefreshMigrated = true;
		this.settings.externalCalendarYearlyVisibilityMigrated = true;
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
		this.settings.locale = normalizeLocale(this.settings.locale);
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
		const results = await this.refreshExternalCalendars([calendarId]);
		return results.get(calendarId) ?? false;
	}

	async refreshAllExternalCalendars(): Promise<{
		refreshed: number;
		failed: number;
	}> {
		const enabledIds = this.settings.externalCalendars
			.filter((calendar) => calendar.enabled)
			.map((calendar) => calendar.id);
		const results = await this.refreshExternalCalendars(enabledIds);
		return Array.from(results.values()).reduce(
			(counts, ok) => {
				if (ok) counts.refreshed += 1;
				else counts.failed += 1;
				return counts;
			},
			{ refreshed: 0, failed: 0 },
		);
	}

	private async refreshDueExternalCalendars(): Promise<void> {
		const now = Date.now();
		const dueIds = this.settings.externalCalendars
			.filter((calendar) => this.isExternalCalendarRefreshDue(calendar, now))
			.map((calendar) => calendar.id);
		if (dueIds.length === 0) return;
		await this.refreshExternalCalendars(dueIds);
	}

	private async refreshExternalCalendarsOnStartup(): Promise<void> {
		if (this.didRefreshExternalCalendarsOnStartup) return;
		this.didRefreshExternalCalendarsOnStartup = true;
		const startupIds = this.settings.externalCalendars
			.filter(
				(calendar) =>
					calendar.enabled &&
					calendar.refreshMinutes != null,
			)
			.map((calendar) => calendar.id);
		if (startupIds.length === 0) return;
		await this.refreshExternalCalendars(startupIds);
	}

	private isExternalCalendarRefreshDue(
		calendar: ExternalCalendarSettings,
		now: number,
	): boolean {
		if (!calendar.enabled || calendar.refreshMinutes == null) return false;
		if (this.externalCalendarRefreshInFlight.has(calendar.id)) return false;
		const cache = getExternalCalendarCache(this.settings, calendar.id);
		if (!cache) return true;
		const lastAttempt =
			cache.lastError?.occurredAt ?? cache.fetchedAt;
		const lastAttemptMs = Date.parse(lastAttempt);
		if (!Number.isFinite(lastAttemptMs)) return true;
		return now - lastAttemptMs >= calendar.refreshMinutes * 60_000;
	}

	private async refreshExternalCalendars(
		calendarIds: string[],
	): Promise<Map<string, boolean>> {
		const results = new Map<string, boolean>();
		const requestedIds = Array.from(new Set(calendarIds));
		const calendars = requestedIds
			.map((id) =>
				this.settings.externalCalendars.find((calendar) => calendar.id === id),
			)
			.filter((calendar): calendar is ExternalCalendarSettings =>
				Boolean(calendar),
			)
			.filter((calendar) => !this.externalCalendarRefreshInFlight.has(calendar.id));
		if (calendars.length === 0) return results;
		for (const calendar of calendars) {
			this.externalCalendarRefreshInFlight.add(calendar.id);
		}
		const caches = await Promise.all(
			calendars.map(async (calendar) => {
				try {
					return {
						calendarId: calendar.id,
						cache: await fetchExternalCalendarCache(
							calendar,
							getExternalCalendarCache(this.settings, calendar.id),
						),
					};
				} finally {
					this.externalCalendarRefreshInFlight.delete(calendar.id);
				}
			}),
		);
		const refreshedIds = new Set(caches.map((item) => item.calendarId));
		this.settings.externalCalendarCaches = [
			...this.settings.externalCalendarCaches.filter(
				(item) => !refreshedIds.has(item.calendarId),
			),
			...caches.map((item) => item.cache),
		];
		for (const item of caches) {
			results.set(item.calendarId, !item.cache.lastError);
		}
		await this.saveSettings();
		return results;
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
