import { Platform } from "obsidian";
import type { DailyPlannerDragDate } from "./drag";
import { getDailyRangeTimeSlice } from "./range-layout";

const MINUTES_PER_DAY = 24 * 60;
const SNAP_MINUTES = 15;
const DRAG_THRESHOLD_PX = 5;
const EDGE_SCROLL_ZONE_PX = 36;
const EDGE_SCROLL_STEP_PX = 18;

export interface DailyPlannerTimeSelection {
	startDate: DailyPlannerDragDate;
	endDate: DailyPlannerDragDate;
	startMinutes: number;
	endMinutes: number;
}

interface ActiveSelection {
	startLayer: HTMLElement;
	startDate: DailyPlannerDragDate;
	startMinute: number;
	startX: number;
	startY: number;
	selecting: boolean;
	selection: DailyPlannerTimeSelection | null;
}

const pad = (value: number) => String(value).padStart(2, "0");

function minutesToTime(minutes: number): string {
	if (minutes >= MINUTES_PER_DAY) return "24:00";
	const normalized = Math.max(0, Math.min(MINUTES_PER_DAY - 1, minutes));
	return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
}

function compareDateTime(
	a: { date: DailyPlannerDragDate; minute: number },
	b: { date: DailyPlannerDragDate; minute: number },
): number {
	const dateCompare = a.date.dateString.localeCompare(b.date.dateString);
	return dateCompare !== 0 ? dateCompare : a.minute - b.minute;
}

function isMobileSurface(activeDocument: Document): boolean {
	return (
		Platform.isMobile ||
		activeDocument.body.classList.contains("is-mobile") ||
		activeDocument.body.classList.contains("-is-mobile")
	);
}

export class DailyPlannerTimeSelectionController {
	private active: ActiveSelection | null = null;
	private suppressClickUntil = 0;

	constructor(
		private readonly contentEl: HTMLElement,
		private readonly onSelect: (
			selection: DailyPlannerTimeSelection,
		) => void,
	) {}

	bind(layer: HTMLElement): boolean {
		if (isMobileSurface(this.contentEl.ownerDocument)) return false;
		layer.addEventListener("mousedown", (event) => {
			if (
				event.button !== 0 ||
				event.metaKey ||
				event.ctrlKey ||
				event.target !== layer
			) return;
			const startDate = this.readDate(layer);
			if (!startDate) return;
			this.reset();
			this.active = {
				startLayer: layer,
				startDate,
				startMinute: this.getSnappedMinute(layer, event.clientY),
				startX: event.clientX,
				startY: event.clientY,
				selecting: false,
				selection: null,
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
		layer.addEventListener(
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
		this.contentEl
			.querySelectorAll(".daily-planner-time-selection-preview")
			.forEach((element) => element.remove());
		this.contentEl
			.querySelectorAll(".is-time-selection-target")
			.forEach((element) => element.removeClass("is-time-selection-target"));
		this.contentEl.removeClass("daily-planner-time-selecting");
		this.active = null;
	}

	private readonly handleMouseMove = (event: MouseEvent): void => {
		const active = this.active;
		if (!active) return;
		if (!active.selecting) {
			const distance = Math.hypot(
				event.clientX - active.startX,
				event.clientY - active.startY,
			);
			if (distance < DRAG_THRESHOLD_PX) return;
			active.selecting = true;
			this.contentEl.addClass("daily-planner-time-selecting");
		}
		event.preventDefault();
		this.autoScroll(event.clientX, event.clientY);
		const targetLayer = this.getLayerAtPoint(event.clientX, event.clientY);
		if (!targetLayer) return;
		const targetDate = this.readDate(targetLayer);
		if (!targetDate) return;
		const currentMinute = this.getSnappedMinute(targetLayer, event.clientY);
		const origin = { date: active.startDate, minute: active.startMinute };
		const current = { date: targetDate, minute: currentMinute };
		const [start, end] =
			compareDateTime(origin, current) <= 0
				? [origin, current]
				: [current, origin];
		const samePoint = compareDateTime(start, end) === 0;
		active.selection = {
			startDate: start.date,
			endDate: end.date,
			startMinutes: start.minute,
			endMinutes: samePoint
				? Math.min(MINUTES_PER_DAY - 1, end.minute + SNAP_MINUTES)
				: end.minute,
		};
		this.renderSelection(active.selection);
	};

	private readonly handleMouseUp = (event: MouseEvent): void => {
		const selection = this.active?.selecting ? this.active.selection : null;
		const selected = this.active?.selecting === true;
		this.reset();
		if (!selected) return;
		event.preventDefault();
		event.stopPropagation();
		this.suppressClickUntil = Date.now() + 250;
		if (selection) this.onSelect(selection);
	};

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

	private getSnappedMinute(layer: HTMLElement, clientY: number): number {
		const rect = layer.getBoundingClientRect();
		const rawMinutes = ((clientY - rect.top) / rect.height) * MINUTES_PER_DAY;
		return Math.max(
			0,
			Math.min(
				MINUTES_PER_DAY - 1,
				Math.round(rawMinutes / SNAP_MINUTES) * SNAP_MINUTES,
			),
		);
	}

	private readDate(layer: HTMLElement): DailyPlannerDragDate | null {
		const year = Number(layer.dataset.year);
		const month = Number(layer.dataset.month);
		const day = Number(layer.dataset.day);
		const dateString = layer.dataset.date;
		if (!year || !month || !day || !dateString) return null;
		return { year, month, day, dateString };
	}

	private renderSelection(selection: DailyPlannerTimeSelection): void {
		this.contentEl
			.querySelectorAll(".daily-planner-time-selection-preview")
			.forEach((element) => element.remove());
		this.contentEl
			.querySelectorAll(".is-time-selection-target")
			.forEach((element) => element.removeClass("is-time-selection-target"));
		const layers = Array.from(
			this.contentEl.querySelectorAll<HTMLElement>(
				".daily-planner-events-layer",
			),
		).filter((layer) => {
			const date = layer.dataset.date;
			return (
				date != null &&
				date >= selection.startDate.dateString &&
				date <= selection.endDate.dateString
			);
		});
		for (const layer of layers) {
			const date = layer.dataset.date;
			if (!date) continue;
			const slice = getDailyRangeTimeSlice(
				date,
				selection.startDate.dateString,
				selection.endDate.dateString,
				selection.startMinutes,
				selection.endMinutes,
			);
			if (!slice) continue;
			layer.addClass("is-time-selection-target");
			const preview = layer.createDiv({
				cls: [
					"daily-planner-time-selection-preview",
					date !== selection.startDate.dateString && "continues-before",
					date !== selection.endDate.dateString && "continues-after",
				]
					.filter(Boolean)
					.join(" "),
			});
			preview.style.setProperty(
				"--daily-start",
				String(slice.start),
			);
			preview.style.setProperty(
				"--daily-duration",
				String(Math.max(SNAP_MINUTES, slice.end - slice.start)),
			);
			preview.createSpan({
				cls: "daily-planner-time-selection-preview-time",
				text: `${minutesToTime(slice.start)}–${minutesToTime(slice.end)}`,
			});
			preview.createSpan({
				cls: "daily-planner-time-selection-preview-range",
				text: `${selection.startDate.dateString} ${minutesToTime(
					selection.startMinutes,
				)} → ${selection.endDate.dateString} ${minutesToTime(
					selection.endMinutes,
				)}`,
			});
		}
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
