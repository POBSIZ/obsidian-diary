import type DiaryObsidian from "./main";

export function refreshAllPlannerViews(plugin: DiaryObsidian): void {
	plugin.refreshYearlyPlannerViews();
	plugin.refreshMonthlyPlannerViews();
	plugin.refreshMonthlyListPlannerViews();
	plugin.refreshDailyPlannerViews();
}

/** Coalesce file events after startup enumeration and cancel pending work on unload. */
export function registerPlannerRefresh(plugin: DiaryObsidian): void {
	let ready = false;
	let disposed = false;
	let timeout: number | null = null;
	plugin.register(() => {
		disposed = true;
		if (timeout !== null) window.clearTimeout(timeout);
	});
	const requestRefresh = (): void => {
		if (!ready || disposed) return;
		if (timeout !== null) window.clearTimeout(timeout);
		timeout = window.setTimeout(() => {
			timeout = null;
			if (!disposed) refreshAllPlannerViews(plugin);
		}, 150);
	};
	plugin.app.workspace.onLayoutReady(() => {
		if (disposed) return;
		ready = true;
		// Views restored during startup need one refresh after enumeration finishes.
		requestRefresh();
	});
	plugin.registerEvent(plugin.app.vault.on("create", requestRefresh));
	plugin.registerEvent(plugin.app.vault.on("delete", requestRefresh));
	plugin.registerEvent(plugin.app.vault.on("rename", requestRefresh));
	plugin.registerEvent(plugin.app.metadataCache.on("changed", requestRefresh));

	let lastCheckedDate = new Date().toDateString();
	plugin.registerInterval(window.setInterval(() => {
		const today = new Date().toDateString();
		if (!disposed && today !== lastCheckedDate) {
			lastCheckedDate = today;
			refreshAllPlannerViews(plugin);
		}
	}, 60_000));
}
