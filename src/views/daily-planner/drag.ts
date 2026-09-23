import { Platform } from "obsidian";
import { MIN_VISUAL_EVENT_DURATION_MINUTES } from "./constants";
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
	/** Move a timed range as one continuous interval, including its date bounds. */
	moveRange?: boolean;
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
	rangeDragOffsetMs: number | null;
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

function getDateAtMinute(dateString: string, minutes: number): Date | null {
	const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	if (![year, month, day].every(Number.isFinite)) return null;
	const date = new Date(year, month - 1, day);
	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month - 1 ||
		date.getDate() !== day
	) {
		return null;
	}
	date.setMinutes(Math.max(0, Math.min(MINUTES_PER_DAY - 1, minutes)));
	return date;
}

function formatDateString(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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

	shouldSuppressClick(): boolean {
		return Date.now() < this.suppressClickUntil;
	}

	bind(element: HTMLElement, item: DailyPlannerDragItem): boolean {
		if (isMobileSurface(this.contentEl.ownerDocument)) return false;
		element.setAttribute("draggable", "false");
		element.addEventListener("mousedown", (event) => {
			if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
			this.reset();
			this.active = {
				element,
				item,
				startX: event.clientX,
				startY: event.clientY,
				rangeDragOffsetMs: this.getRangeDragOffsetMs(
					item,
					element,
					event.clientY,
				),
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
			this.contentEl.ownerDocument.defaultView?.addEventListener(
				"blur",
				this.handleWindowBlur,
			);
		});
		element.addEventListener(
			"click",
			(event) => {
				if (!this.shouldSuppressClick()) return;
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
				if (event.button !== 0 || event.metaKey || event.ctrlKey) return;
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
		if ((event.buttons & 1) === 0) {
			this.reset();
			return;
		}
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
		const active = this.active;
		if (active?.dragging) {
			// A final movement can be coalesced with mouseup, particularly while the
			// three-day viewport is scrolling. Resolve the release point explicitly
			// instead of relying only on the previous mousemove event.
			this.updateDropTarget(event.clientX, event.clientY);
		}
		const drop = active?.dragging ? active.drop : null;
		const dragged = active?.dragging === true;
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
		const targetLayer = this.getLayerAtPoint(
			event.clientX,
			event.clientY,
			true,
		);
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
			String(
				Math.max(
					MIN_VISUAL_EVENT_DURATION_MINUTES,
					active.endMinutes - active.startMinutes,
				),
			),
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
				String(
					Math.max(
						MIN_VISUAL_EVENT_DURATION_MINUTES,
						slice.end - slice.start,
					),
				),
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
			String(
				Math.max(
					MIN_VISUAL_EVENT_DURATION_MINUTES,
					active.originalEnd - active.originalStart,
				),
			),
		);
		const time = active.element.querySelector<HTMLElement>(
			".daily-planner-event-time",
		);
		if (time) time.textContent = active.originalTimeText;
	}

	private updateDropTarget(clientX: number, clientY: number): void {
		const active = this.active;
		if (!active) return;
		const layer = this.getLayerAtPoint(clientX, clientY);
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
		const originalDuration = active.item.moveRange
			? SNAP_MINUTES
			: (active.item.entry.endMinutes ?? 0) -
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
		const movedRange = this.getMovedRangeBounds(
			active.item,
			targetDate,
			startMinutes,
			active.rangeDragOffsetMs,
		);
		active.drop = {
			item: active.item,
			targetDate,
			startMinutes,
			endMinutes,
			...movedRange,
		};
		this.renderPreview(layer, active.drop);
	}

	private getMovedRangeBounds(
		item: DailyPlannerDragItem,
		targetDate: DailyPlannerDragDate,
		targetMinutes: number,
		rangeDragOffsetMs: number | null,
	): Pick<
		DailyPlannerDrop,
		"rangeStartDate" | "rangeEndDate" | "startMinutes" | "endMinutes"
	> | null {
		const { entry } = item;
		if (
			!item.moveRange ||
			!entry.rangeStart ||
			!entry.rangeEnd ||
			entry.rangeStartMinutes == null ||
			entry.rangeEndMinutes == null
		) {
			return null;
		}
		const originalStart = getDateAtMinute(
			entry.rangeStart,
			entry.rangeStartMinutes,
		);
		const originalEnd = getDateAtMinute(
			entry.rangeEnd,
			entry.rangeEndMinutes,
		);
		const targetPoint = getDateAtMinute(targetDate.dateString, targetMinutes);
		if (!originalStart || !originalEnd || !targetPoint) return null;
		const duration = originalEnd.getTime() - originalStart.getTime();
		if (duration <= 0) return null;
		const movedStart = new Date(
			targetPoint.getTime() - (rangeDragOffsetMs ?? 0),
		);
		const movedEnd = new Date(movedStart.getTime() + duration);
		return {
			rangeStartDate: formatDateString(movedStart),
			rangeEndDate: formatDateString(movedEnd),
			startMinutes: movedStart.getHours() * 60 + movedStart.getMinutes(),
			endMinutes: movedEnd.getHours() * 60 + movedEnd.getMinutes(),
		};
	}

	private getRangeDragOffsetMs(
		item: DailyPlannerDragItem,
		element: HTMLElement,
		clientY: number,
	): number | null {
		const { entry } = item;
		if (
			!item.moveRange ||
			!entry.rangeStart ||
			entry.rangeStartMinutes == null
		) {
			return null;
		}
		const layer = element.closest<HTMLElement>(
			".daily-planner-events-layer",
		);
		const sourceDate = layer ? this.readTargetDate(layer) : null;
		if (!layer || !sourceDate) return null;
		const rect = layer.getBoundingClientRect();
		if (rect.height <= 0) return null;
		const rawMinutes = ((clientY - rect.top) / rect.height) * MINUTES_PER_DAY;
		const pointerMinutes = Math.max(
			0,
			Math.min(
				MINUTES_PER_DAY - 1,
				Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES,
			),
		);
		const originalStart = getDateAtMinute(
			entry.rangeStart,
			entry.rangeStartMinutes,
		);
		const pointer = getDateAtMinute(sourceDate.dateString, pointerMinutes);
		if (!originalStart || !pointer) return null;
		return pointer.getTime() - originalStart.getTime();
	}

	private getLayerAtPoint(
		clientX: number,
		clientY: number,
		allowOutsideVerticalBounds = false,
	): HTMLElement | null {
		const direct =
			this.contentEl.ownerDocument
				.elementsFromPoint(clientX, clientY)
				.map((element) =>
					element.closest<HTMLElement>(".daily-planner-events-layer"),
				)
				.find(
					(candidate): candidate is HTMLElement =>
						candidate != null && this.contentEl.contains(candidate),
				) ?? null;
		if (direct) return direct;

		// Previews and column borders can leave elementsFromPoint without a layer
		// under the cursor. Keep resolving from the visible column bounds; range
		// resizing intentionally allows vertical overflow while a drag does not.
		return (
			Array.from(
				this.contentEl.querySelectorAll<HTMLElement>(
					".daily-planner-events-layer",
				),
			).find((layer) => {
				const rect = layer.getBoundingClientRect();
				return (
					clientX >= rect.left &&
					clientX <= rect.right &&
					(allowOutsideVerticalBounds ||
						(clientY >= rect.top && clientY <= rect.bottom))
				);
			}) ?? null
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
		const rangeStartDate = drop.rangeStartDate ?? entry.rangeStart;
		const rangeEndDate = drop.rangeEndDate ?? entry.rangeEnd;
		const layers = isRangeDrop
			? Array.from(
					this.contentEl.querySelectorAll<HTMLElement>(
						".daily-planner-events-layer",
					),
				).filter((candidate) => {
					const date = candidate.dataset.date;
					return (
						date != null &&
						date >= (rangeStartDate ?? "") &&
						date <= (rangeEndDate ?? "")
					);
				})
			: [layer];

		for (const target of layers) {
			const date = target.dataset.date;
			if (!date) continue;
			const slice = isRangeDrop
				? getDailyRangeTimeSlice(
						date,
						rangeStartDate ?? date,
						rangeEndDate ?? date,
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
					isRangeDrop && date !== rangeStartDate && "continues-before",
					isRangeDrop && date !== rangeEndDate && "continues-after",
				]
					.filter(Boolean)
					.join(" "),
			});
			preview.style.setProperty("--daily-start", String(slice.start));
			preview.style.setProperty(
				"--daily-duration",
				String(
					Math.max(
						MIN_VISUAL_EVENT_DURATION_MINUTES,
						slice.end - slice.start,
					),
				),
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
