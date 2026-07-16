export interface PlannerCellPosition {
	year: number;
	month: number;
	day: number;
}

export function getTopmostPlannerElement(
	contentEl: HTMLElement,
	clientX: number,
	clientY: number,
	selectors: readonly string[],
	excludedSelector?: string,
): Element | null {
	for (const element of contentEl.ownerDocument.elementsFromPoint(clientX, clientY)) {
		if (!contentEl.contains(element)) continue;
		const htmlElement = element as HTMLElement;
		if (excludedSelector && htmlElement.closest?.(excludedSelector)) return null;
		if (selectors.some((selector) => htmlElement.closest?.(selector))) {
			return element;
		}
	}
	return null;
}

export function getPlannerPathElementAt(
	contentEl: HTMLElement,
	clientX: number,
	clientY: number,
	selector: string,
): HTMLElement | null {
	for (const element of contentEl.ownerDocument.elementsFromPoint(clientX, clientY)) {
		if (!contentEl.contains(element)) continue;
		const target = (element as HTMLElement).closest?.(selector);
		if (target instanceof HTMLElement && target.dataset.path) return target;
	}
	return null;
}

export function getPlannerCellAtClientPosition(
	contentEl: HTMLElement,
	clientX: number,
	clientY: number,
	invalidSelector: string,
): PlannerCellPosition | null {
	const element = contentEl.ownerDocument.elementFromPoint(clientX, clientY);
	const cell = element?.closest("td[data-year][data-month][data-day]");
	if (!(cell instanceof HTMLElement) || cell.closest(invalidSelector)) return null;
	const year = Number.parseInt(cell.dataset.year ?? "", 10);
	const month = Number.parseInt(cell.dataset.month ?? "", 10);
	const day = Number.parseInt(cell.dataset.day ?? "", 10);
	if (![year, month, day].every(Number.isFinite)) return null;
	return { year, month, day };
}
