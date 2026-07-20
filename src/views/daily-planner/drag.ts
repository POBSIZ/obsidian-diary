import { Platform } from "obsidian";
import type { DailyPlannerEntry } from "./types";
import { getDailyRangeTimeSlice } from "./range-layout";

const MINUTES_PER_DAY = 24 * 60;
const DRAG_THRESHOLD_PX = 5;
const SNAP_MINUTES = 15;
const DEFAULT_DURATION_MINUTES = 60;
const EDGE_SCROLL_ZONE_PX = 36;
const EDGE_SCROLL_STEP_PX = 18;

export interface DailyPlannerDragDate {
	year: number;
	month: number;
	day: number;
	dateString: string;
}

export interface DailyPlannerDragItem {
	entry: DailyPlannerEntry;
	sourceDate: DailyPlannerDragDate;
	/** Keep a range file's existing calendar bounds while assigning its times. */
	preserveDateRange?: boolean;
}

export interface DailyPlannerDrop {
	item: DailyPlannerDragItem;
	targetDate: DailyPlannerDragDate;
	startMinutes: number;
	endMinutes: number;
	resizeEdge?: "start" | "end";
	rangeStartDate?: string;
	rangeEndDate?: string;
}

interface ActiveDrag {
	element: HTMLElement;
	item: DailyPlannerDragItem;
	startX: number;
	startY: number;
	dragging: boolean;
	targetLayer: HTMLElement | null;
	drop: DailyPlannerDrop | null;
}

type ResizeEdge = "start" | "end";

interface ActiveResize {
	element: HTMLElement;
	item: DailyPlannerDragItem;
	edge: ResizeEdge;
	layer: HTMLElement;
	sourceElements: HTMLElement[];
	originalStart: number;
	originalEnd: number;
	originalBoundaryStart: number;
	originalBoundaryEnd: number;
	startMinutes: number;
	endMinutes: number;
	originalTimeText: string;
	originalRangeStartDate: string;
	originalRangeEndDate: string;
	rangeStartDate: string;
	rangeEndDate: string;
	targetDate: DailyPlannerDragDate;
}

const pad = (value: number) => String(value).padStart(2, "0");

function minutesToTime(minutes: number): string {
	if (minutes >= MINUTES_PER_DAY) return "24:00";
	const normalized = Math.max(0, Math.min(MINUTES_PER_DAY - 1, minutes));
	return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
}

function isMobileSurface(activeDocument: Document): boolean {
	return (
		Platform.isMobile ||
		activeDocument.body.classList.contains("is-mobile") ||
		activeDocument.body.classList.contains("-is-mobile")
	);
}

export class DailyPlannerDragController {
	private active: ActiveDrag | null = null;
	private activeResize: ActiveResize | null = null;
	private previews: HTMLElement[] = [];
	private suppressClickUntil = 0;

	constructor(
		private readonly contentEl: HTMLElement,
		private readonly onDrop: (drop: DailyPlannerDrop) => Promise<void> | void,
	) {}

	bind(element: HTMLElement, item: DailyPlannerDragItem): boolean {
		if (isMobileSurface(this.contentEl.ownerDocument)) return false;
		element.setAttribute("draggable", "false");
		element.addEventListener("mousedown", (event) => {
			if (event.button !== 0) return;
			this.reset();
			this.active = {
				element,
				item,
				startX: event.clientX,
				startY: event.clientY,
				dragging: false,
				targetLayer: null,
				drop: null,
			};
			this.contentEl.ownerDocument.addEventListener(
				"mousemove",
				this.handleMouseMove,
				true,
			);
			this.contentEl.ownerDocument.addEventListener(
				"mouseup",
				this.handleMouseUp,
				true,
			);
		});
		element.addEventListener(
			"click",
			(event) => {
				if (Date.now() >= this.suppressClickUntil) return;
				event.preventDefault();
				event.stopImmediatePropagation();
			},
			true,
		);
		return true;
	}

	bindResize(
		element: HTMLElement,
		item: DailyPlannerDragItem,
		edges: readonly ResizeEdge[] = ["start", "end"],
	): boolean {
		if (isMobileSurface(this.contentEl.ownerDocument)) return false;
		const startMinutes = item.entry.startMinutes;
		const endMinutes = item.entry.endMinutes;
		const layer = element.closest<HTMLElement>(".daily-planner-events-layer");
		if (startMinutes == null || endMinutes == null || !layer) return false;

		for (const edge of edges) {
			const handle = element.createSpan({
				cls: [
					"daily-planner-event-resize-handle",
					`is-${edge}`,
				],
				attr: { "aria-hidden": "true" },
			});
			handle.addEventListener("mousedown", (event) => {
				if (event.button !== 0) return;
				event.preventDefault();
				event.stopPropagation();
				this.reset();
				const time = element.querySelector<HTMLElement>(
					".daily-planner-event-time",
				);
				const rangeStartDate =
					item.entry.rangeStart ?? item.sourceDate.dateString;
				const rangeEndDate = item.entry.rangeEnd ?? item.sourceDate.dateString;
				const boundaryStart = item.preserveDateRange
					? (item.entry.rangeStartMinutes ?? startMinutes)
					: startMinutes;
				const boundaryEnd = item.preserveDateRange
					? (item.entry.rangeEndMinutes ?? endMinutes)
					: endMinutes;
				const sourceElements = item.preserveDateRange
					? Array.from(
							this.contentEl.querySelectorAll<HTMLElement>("[data-range-id]"),
						).filter((candidate) => candidate.dataset.rangeId === item.entry.id)
					: [element];
				this.activeResize = {
					element,
					item,
					edge,
					layer,
					sourceElements,
					originalStart: startMinutes,
					originalEnd: endMinutes,
					originalBoundaryStart: boundaryStart,
					originalBoundaryEnd: boundaryEnd,
					startMinutes: boundaryStart,
					endMinutes: boundaryEnd,
					originalTimeText: time?.textContent ?? "",
					originalRangeStartDate: rangeStartDate,
					originalRangeEndDate: rangeEndDate,
					rangeStartDate,
					rangeEndDate,
					targetDate: item.sourceDate,
				};
				if (item.preserveDateRange) {
					for (const source of sourceElements) {
						source.addClass("is-range-resizing-source");
					}
				}
				element.addClass("is-resizing");
				this.contentEl.addClass("daily-planner-resizing");
				if (item.preserveDateRange) {
					this.renderRangeResizePreviews(this.activeResize);
				}
				this.contentEl.ownerDocument.addEventListener(
					"mousemove",
					this.handleResizeMouseMove,
					true,
				);
				this.contentEl.ownerDocument.addEventListener(
					"mouseup",
					this.handleResizeMouseUp,
					true,
				);
				this.contentEl.ownerDocument.addEventListener(
					"keydown",
					this.handleResizeKeyDown,
					true,
				);
				this.contentEl.ownerDocument.defaultView?.addEventListener(
					"blur",
					this.handleWindowBlur,
				);
			});
		}
		return true;
	}

	reset(): void {
		this.contentEl.ownerDocument.removeEventListener(
			"mousemove",
			this.handleMouseMove,
			true,
		);
		this.contentEl.ownerDocument.defaultView?.removeEventListener(
			"blur",
			this.handleWindowBlur,
		);
		this.contentEl.ownerDocument.removeEventListener(
			"mouseup",
			this.handleMouseUp,
			true,
		);
		this.contentEl.ownerDocument.removeEventListener(
			"mousemove",
			this.handleResizeMouseMove,
			true,
		);
		this.contentEl.ownerDocument.removeEventListener(
			"mouseup",
			this.handleResizeMouseUp,
			true,
		);
		this.contentEl.ownerDocument.removeEventListener(
			"keydown",
			this.handleResizeKeyDown,
			true,
		);
		this.active?.element.removeClass("is-dragging");
		this.contentEl
			.querySelectorAll(".daily-planner-events-layer.is-drop-target")
			.forEach((element) => element.removeClass("is-drop-target"));
		if (this.activeResize) {
			this.restoreResizeElement(this.activeResize);
			this.activeResize.element.removeClass("is-resizing");
			for (const source of this.activeResize.sourceElements) {
				source.removeClass("is-range-resizing-source");
			}
		}
		this.removePreviews();
		this.active = null;
		this.activeResize = null;
		this.contentEl.removeClass("daily-planner-dragging");
		this.contentEl.removeClass("daily-planner-resizing");
	}

	private readonly handleMouseMove = (event: MouseEvent): void => {
		const active = this.active;
		if (!active) return;
		if (!active.dragging) {
			const distance = Math.hypot(
				event.clientX - active.startX,
				event.clientY - active.startY,
			);
			if (distance < DRAG_THRESHOLD_PX) return;
			active.dragging = true;
			active.element.addClass("is-dragging");
			this.contentEl.addClass("daily-planner-dragging");
		}
		event.preventDefault();
		this.autoScroll(event.clientX, event.clientY);
		this.updateDropTarget(event.clientX, event.clientY);
	};

	private readonly handleMouseUp = (event: MouseEvent): void => {
		const drop = this.active?.dragging ? this.active.drop : null;
		const dragged = this.active?.dragging === true;
		this.reset();
		if (!dragged) return;
		event.preventDefault();
		event.stopPropagation();
		this.suppressClickUntil = Date.now() + 250;
		if (drop) void this.onDrop(drop);
	};

	private readonly handleResizeMouseMove = (event: MouseEvent): void => {
		const active = this.activeResize;
		if (!active) return;
		if ((event.buttons & 1) === 0) {
			this.reset();
			return;
		}
		event.preventDefault();
		this.autoScroll(event.clientX, event.clientY);
		const targetLayer = this.getLayerAtPoint(event.clientX, event.clientY);
		const targetDate = targetLayer ? this.readTargetDate(targetLayer) : null;
		if (active.item.preserveDateRange && (!targetLayer || !targetDate)) return;
		const layer = targetLayer ?? active.layer;
		const rect = layer.getBoundingClientRect();
		const rawMinutes = ((event.clientY - rect.top) / rect.height) * MINUTES_PER_DAY;
		const snappedMinutes = Math.max(
			0,
			Math.min(
				MINUTES_PER_DAY - 1,
				Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES,
			),
		);
		if (active.item.preserveDateRange && targetDate) {
			const rangeStartDate =
				active.edge === "start"
					? targetDate.dateString
					: (active.item.entry.rangeStart ?? active.rangeStartDate);
			const rangeEndDate =
				active.edge === "end"
					? targetDate.dateString
					: (active.item.entry.rangeEnd ?? active.rangeEndDate);
			const startMinutes =
				active.edge === "start"
					? snappedMinutes
					: (active.item.entry.rangeStartMinutes ?? active.startMinutes);
			const endMinutes =
				active.edge === "end"
					? snappedMinutes
					: (active.item.entry.rangeEndMinutes ?? active.endMinutes);
			if (
				rangeStartDate > rangeEndDate ||
				(rangeStartDate === rangeEndDate && startMinutes >= endMinutes)
			) {
				return;
			}
			active.rangeStartDate = rangeStartDate;
			active.rangeEndDate = rangeEndDate;
			active.startMinutes = startMinutes;
			active.endMinutes = endMinutes;
			active.targetDate = targetDate;
			this.renderRangeResizePreviews(active);
			return;
		}
		if (active.edge === "start") {
			active.startMinutes = Math.max(
				0,
				Math.min(active.endMinutes - SNAP_MINUTES, snappedMinutes),
			);
		} else {
			active.endMinutes = Math.min(
				MINUTES_PER_DAY - 1,
				Math.max(active.startMinutes + SNAP_MINUTES, snappedMinutes),
			);
		}
		this.renderResizeElement(active);
	};

	private readonly handleResizeMouseUp = (event: MouseEvent): void => {
		const active = this.activeResize;
		if (!active) return;
		const changed =
			active.rangeStartDate !== active.originalRangeStartDate ||
			active.rangeEndDate !== active.originalRangeEndDate ||
			active.startMinutes !== active.originalBoundaryStart ||
			active.endMinutes !== active.originalBoundaryEnd;
		const drop: DailyPlannerDrop = {
			item: active.item,
			targetDate: active.targetDate,
			startMinutes: active.startMinutes,
			endMinutes: active.endMinutes,
			resizeEdge: active.edge,
			rangeStartDate: active.rangeStartDate,
			rangeEndDate: active.rangeEndDate,
		};
		this.reset();
		event.preventDefault();
		event.stopPropagation();
		this.suppressClickUntil = Date.now() + 250;
		if (changed) void this.onDrop(drop);
	};

	private readonly handleWindowBlur = (): void => {
		this.reset();
	};

	private readonly handleResizeKeyDown = (event: KeyboardEvent): void => {
		if (event.key !== "Escape" || !this.activeResize) return;
		event.preventDefault();
		event.stopPropagation();
		this.reset();
	};

	private renderResizeElement(active: ActiveResize): void {
		active.element.style.setProperty(
			"--daily-start",
			String(active.startMinutes),
		);
		active.element.style.setProperty(
			"--daily-duration",
			String(Math.max(30, active.endMinutes - active.startMinutes)),
		);
		const time = active.element.querySelector<HTMLElement>(
			".daily-planner-event-time",
		);
		if (time) {
			time.textContent = `${minutesToTime(active.startMinutes)}–${minutesToTime(active.endMinutes)}`;
		}
	}

	private renderRangeResizePreviews(active: ActiveResize): void {
		this.removePreviews();
		const layers = Array.from(
			this.contentEl.querySelectorAll<HTMLElement>(
				".daily-planner-events-layer",
			),
		).filter((layer) => {
			const date = layer.dataset.date;
			return (
				date != null &&
				date >= active.rangeStartDate &&
				date <= active.rangeEndDate
			);
		});
		for (const layer of layers) {
			const date = layer.dataset.date;
			if (!date) continue;
			const slice = getDailyRangeTimeSlice(
				date,
				active.rangeStartDate,
				active.rangeEndDate,
				active.startMinutes,
				active.endMinutes,
			);
			if (!slice) continue;
			const preview = layer.createDiv({
				cls: [
					"daily-planner-drag-preview",
					"daily-planner-range-drag-preview",
					"daily-planner-range-resize-preview",
					date !== active.rangeStartDate && "continues-before",
					date !== active.rangeEndDate && "continues-after",
				]
					.filter(Boolean)
					.join(" "),
			});
			preview.style.setProperty("--daily-start", String(slice.start));
			preview.style.setProperty(
				"--daily-duration",
				String(Math.max(30, slice.end - slice.start)),
			);
			preview.createSpan({
				cls: "daily-planner-drag-preview-time",
				text: `${minutesToTime(slice.start)}–${minutesToTime(slice.end)}`,
			});
			preview.createSpan({
				cls: "daily-planner-drag-preview-title",
				text: active.item.entry.title,
			});
			this.previews.push(preview);
		}
	}

	private restoreResizeElement(active: ActiveResize): void {
		active.element.style.setProperty("--daily-start", String(active.originalStart));
		active.element.style.setProperty(
			"--daily-duration",
			String(Math.max(30, active.originalEnd - active.originalStart)),
		);
		const time = active.element.querySelector<HTMLElement>(
			".daily-planner-event-time",
		);
		if (time) time.textContent = active.originalTimeText;
	}

	private updateDropTarget(clientX: number, clientY: number): void {
		const active = this.active;
		if (!active) return;
		const layer = this.contentEl.ownerDocument
			.elementsFromPoint(clientX, clientY)
			.map((element) => element.closest<HTMLElement>(".daily-planner-events-layer"))
			.find(
				(candidate): candidate is HTMLElement =>
					candidate != null && this.contentEl.contains(candidate),
			);
		if (active.targetLayer !== layer) {
			this.contentEl
				.querySelectorAll(".daily-planner-events-layer.is-drop-target")
				.forEach((element) => element.removeClass("is-drop-target"));
			active.targetLayer = layer ?? null;
		}
		if (!layer) {
			active.drop = null;
			this.removePreviews();
			return;
		}
		const targetDate = this.readTargetDate(layer);
		if (!targetDate) {
			active.drop = null;
			return;
		}
		const rect = layer.getBoundingClientRect();
		const rawMinutes = ((clientY - rect.top) / rect.height) * MINUTES_PER_DAY;
		const originalDuration =
			(active.item.entry.endMinutes ?? 0) -
			(active.item.entry.startMinutes ?? 0);
		const duration = Math.max(
			SNAP_MINUTES,
			originalDuration || DEFAULT_DURATION_MINUTES,
		);
		const maxStart = Math.max(
			0,
			Math.floor((MINUTES_PER_DAY - duration) / SNAP_MINUTES) * SNAP_MINUTES,
		);
		const startMinutes = Math.max(
			0,
			Math.min(maxStart, Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES),
		);
		const endMinutes = Math.min(
			MINUTES_PER_DAY - 1,
			startMinutes + duration,
		);
		active.drop = {
			item: active.item,
			targetDate,
			startMinutes,
			endMinutes,
		};
		this.renderPreview(layer, active.drop);
	}

	private getLayerAtPoint(clientX: number, clientY: number): HTMLElement | null {
		return (
			this.contentEl.ownerDocument
				.elementsFromPoint(clientX, clientY)
				.map((element) =>
					element.closest<HTMLElement>(".daily-planner-events-layer"),
				)
				.find(
					(candidate): candidate is HTMLElement =>
						candidate != null && this.contentEl.contains(candidate),
				) ?? null
		);
	}

	private readTargetDate(layer: HTMLElement): DailyPlannerDragDate | null {
		const year = Number(layer.dataset.year);
		const month = Number(layer.dataset.month);
		const day = Number(layer.dataset.day);
		const dateString = layer.dataset.date;
		if (!year || !month || !day || !dateString) return null;
		return { year, month, day, dateString };
	}

	private renderPreview(layer: HTMLElement, drop: DailyPlannerDrop): void {
		this.removePreviews();
		const { entry } = drop.item;
		const isRangeDrop = Boolean(
			drop.item.preserveDateRange && entry.rangeStart && entry.rangeEnd,
		);
		const layers = isRangeDrop
			? Array.from(
					this.contentEl.querySelectorAll<HTMLElement>(
						".daily-planner-events-layer",
					),
				).filter((candidate) => {
					const date = candidate.dataset.date;
					return (
						date != null &&
						date >= (entry.rangeStart ?? "") &&
						date <= (entry.rangeEnd ?? "")
					);
				})
			: [layer];

		for (const target of layers) {
			const date = target.dataset.date;
			if (!date) continue;
			const slice = isRangeDrop
				? getDailyRangeTimeSlice(
						date,
						entry.rangeStart ?? date,
						entry.rangeEnd ?? date,
						drop.startMinutes,
						drop.endMinutes,
					)
				: { start: drop.startMinutes, end: drop.endMinutes };
			if (!slice) continue;
			if (!isRangeDrop) target.addClass("is-drop-target");
			const preview = target.createDiv({
				cls: [
					"daily-planner-drag-preview",
					isRangeDrop && "daily-planner-range-drag-preview",
					isRangeDrop && date !== entry.rangeStart && "continues-before",
					isRangeDrop && date !== entry.rangeEnd && "continues-after",
				]
					.filter(Boolean)
					.join(" "),
			});
			preview.style.setProperty("--daily-start", String(slice.start));
			preview.style.setProperty(
				"--daily-duration",
				String(Math.max(30, slice.end - slice.start)),
			);
			preview.createSpan({
				cls: "daily-planner-drag-preview-time",
				text: `${minutesToTime(slice.start)}–${minutesToTime(slice.end)}`,
			});
			preview.createSpan({
				cls: "daily-planner-drag-preview-title",
				text: entry.title,
			});
			this.previews.push(preview);
		}
	}

	private removePreviews(): void {
		for (const preview of this.previews) preview.remove();
		this.previews = [];
	}

	private autoScroll(clientX: number, clientY: number): void {
		const vertical = this.contentEl.querySelector<HTMLElement>(
			".daily-planner-timeline-scroll",
		);
		if (vertical) {
			const rect = vertical.getBoundingClientRect();
			if (clientY < rect.top + EDGE_SCROLL_ZONE_PX) {
				vertical.scrollTop -= EDGE_SCROLL_STEP_PX;
			} else if (clientY > rect.bottom - EDGE_SCROLL_ZONE_PX) {
				vertical.scrollTop += EDGE_SCROLL_STEP_PX;
			}
		}
		const horizontal = this.contentEl.querySelector<HTMLElement>(
			".daily-planner-days-viewport",
		);
		if (!horizontal || horizontal.scrollWidth <= horizontal.clientWidth) return;
		const rect = horizontal.getBoundingClientRect();
		if (clientX < rect.left + EDGE_SCROLL_ZONE_PX) {
			horizontal.scrollLeft -= EDGE_SCROLL_STEP_PX;
		} else if (clientX > rect.right - EDGE_SCROLL_ZONE_PX) {
			horizontal.scrollLeft += EDGE_SCROLL_STEP_PX;
		}
	}
}
