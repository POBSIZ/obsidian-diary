import {
	getPlannerCellAtClientPosition,
	getPlannerPathElementAt,
	getTopmostPlannerElement,
} from "../planner-dom";

/** Get topmost planner-relevant element at coords; skips scroll/table wrappers. */
export function getTopmostPlannerElementAt(
	contentEl: HTMLElement,
	clientX: number,
	clientY: number,
): Element | null {
	return getTopmostPlannerElement(
		contentEl,
		clientX,
		clientY,
		[
			"[data-external-event-id]",
			".planner-entry[data-path]",
			".planner-range[data-path]",
			".planner-holiday-badge",
			"td[data-year][data-month][data-day]",
		],
		".yearly-planner-table th",
	);
}

/** Get chip or range bar element at coords that has data-path (for chip drag). */
export function getChipOrBarAt(
	contentEl: HTMLElement,
	clientX: number,
	clientY: number,
): HTMLElement | null {
	return getPlannerPathElementAt(
		contentEl,
		clientX,
		clientY,
		".planner-entry[data-path], .planner-range[data-path]",
	);
}

export function getCellAtClientPos(
	contentEl: HTMLElement,
	clientX: number,
	clientY: number,
): {
	year: number;
	month: number;
	day: number;
} | null {
	return getPlannerCellAtClientPosition(
		contentEl,
		clientX,
		clientY,
		".yearly-planner-cell-invalid",
	);
}
