import { Platform } from "obsidian";
import type { DailyPlannerEntry } from "./types";

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
}

export interface DailyPlannerDrop {
	item: DailyPlannerDragItem;
	targetDate: DailyPlannerDragDate;
	startMinutes: number;
	endMinutes: number;
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
	originalStart: number;
	originalEnd: number;
	startMinutes: number;
	endMinutes: number;
	originalTimeText: string;
}

const pad = (value: number) => String(value).padStart(2, "0");

function minutesToTime(minutes: number): string {
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
	private preview: HTMLElement | null = null;
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

	bindResize(element: HTMLElement, item: DailyPlannerDragItem): boolean {
		if (isMobileSurface(this.contentEl.ownerDocument)) return false;
		const startMinutes = item.entry.startMinutes;
		const endMinutes = item.entry.endMinutes;
		const layer = element.closest<HTMLElement>(".daily-planner-events-layer");
		if (startMinutes == null || endMinutes == null || !layer) return false;

		for (const edge of ["start", "end"] as const) {
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
				this.activeResize = {
					element,
					item,
					edge,
					layer,
					originalStart: startMinutes,
					originalEnd: endMinutes,
					startMinutes,
					endMinutes,
					originalTimeText: time?.textContent ?? "",
				};
				element.addClass("is-resizing");
				this.contentEl.addClass("daily-planner-resizing");
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
		this.active?.element.removeClass("is-dragging");
		this.active?.targetLayer?.removeClass("is-drop-target");
		if (this.activeResize) {
			this.restoreResizeElement(this.activeResize);
			this.activeResize.element.removeClass("is-resizing");
		}
		this.preview?.remove();
		this.preview = null;
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
		event.preventDefault();
		this.autoScroll(event.clientX, event.clientY);
		const rect = active.layer.getBoundingClientRect();
		const rawMinutes = ((event.clientY - rect.top) / rect.height) * MINUTES_PER_DAY;
		const snappedMinutes = Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES;
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
			active.startMinutes !== active.originalStart ||
			active.endMinutes !== active.originalEnd;
		const drop: DailyPlannerDrop = {
			item: active.item,
			targetDate: active.item.sourceDate,
			startMinutes: active.startMinutes,
			endMinutes: active.endMinutes,
		};
		this.reset();
		event.preventDefault();
		event.stopPropagation();
		this.suppressClickUntil = Date.now() + 250;
		if (changed) void this.onDrop(drop);
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
			active.targetLayer?.removeClass("is-drop-target");
			active.targetLayer = layer ?? null;
			active.targetLayer?.addClass("is-drop-target");
		}
		if (!layer) {
			active.drop = null;
			this.preview?.remove();
			this.preview = null;
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

	private readTargetDate(layer: HTMLElement): DailyPlannerDragDate | null {
		const year = Number(layer.dataset.year);
		const month = Number(layer.dataset.month);
		const day = Number(layer.dataset.day);
		const dateString = layer.dataset.date;
		if (!year || !month || !day || !dateString) return null;
		return { year, month, day, dateString };
	}

	private renderPreview(layer: HTMLElement, drop: DailyPlannerDrop): void {
		if (this.preview?.parentElement !== layer) {
			this.preview?.remove();
			this.preview = layer.createDiv({ cls: "daily-planner-drag-preview" });
			this.preview.createSpan({ cls: "daily-planner-drag-preview-time" });
			this.preview.createSpan({ cls: "daily-planner-drag-preview-title" });
		}
		this.preview.style.setProperty("--daily-start", String(drop.startMinutes));
		this.preview.style.setProperty(
			"--daily-duration",
			String(Math.max(30, drop.endMinutes - drop.startMinutes)),
		);
		const time = this.preview.querySelector<HTMLElement>(
			".daily-planner-drag-preview-time",
		);
		const title = this.preview.querySelector<HTMLElement>(
			".daily-planner-drag-preview-title",
		);
		if (time) {
			time.textContent = `${minutesToTime(drop.startMinutes)}–${minutesToTime(drop.endMinutes)}`;
		}
		if (title) title.textContent = drop.item.entry.title;
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
