import { Platform } from "obsidian";

const MAX_SCALE = 1.5;
const DEFAULT_SCALE = 1;

function getTouchDistance(touches: TouchList): number {
	if (touches.length < 2) return 0;
	const a = touches[0]!;
	const b = touches[1]!;
	return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
}

function getTouchCenterInElement(
	touches: TouchList,
	el: HTMLElement,
): { x: number; y: number } {
	if (touches.length < 2) return { x: 0, y: 0 };
	const rect = el.getBoundingClientRect();
	const avgX = (touches[0]!.clientX + touches[1]!.clientX) / 2;
	const avgY = (touches[0]!.clientY + touches[1]!.clientY) / 2;
	/* Content coords: viewport offset + scroll */
	return {
		x: el.scrollLeft + (avgX - rect.left),
		y: el.scrollTop + (avgY - rect.top),
	};
}

export interface PinchZoomOptions {
	scrollContainer: HTMLElement;
	zoomWrapper: HTMLElement;
	zoomInner: HTMLElement;
	tableSelector?: string;
	initialScale?: number;
	onScaleChange?: (scale: number) => void;
	/**
	 * When true, the controller manages sticky header compensation for
	 * position:sticky headers inside the CSS transform.
	 *
	 * How it works:
	 *  - scale == 1: native CSS sticky is in effect (no class, no overrides).
	 *  - scale != 1: adds `.is-zoomed` to zoomInner (CSS overrides position:sticky
	 *    to relative), and a rAF loop updates --sticky-dx / --sticky-dy CSS
	 *    variables on zoomInner so headers stay at the viewport edge.
	 *
	 * The CSS selectors that use these variables must be defined in styles.css.
	 */
	manageStickyHeaders?: boolean;
}

export class PinchZoomController {
	private scrollContainer: HTMLElement;
	private zoomWrapper: HTMLElement;
	private zoomInner: HTMLElement;
	private tableSelector: string;
	private scale = DEFAULT_SCALE;
	private onScaleChange?: (scale: number) => void;

	/** Cached natural (scale=1) dimensions, set once in measureBase() */
	private baseWidth = 0;
	private baseHeight = 0;

	private manageStickyHeaders: boolean;

	private pinchStartDistance = 0;
	private pinchStartScale = 1;
	private pinchCenterX = 0;
	private pinchCenterY = 0;
	private isPinching = false;

	private boundTouchStart: (e: TouchEvent) => void;
	private boundTouchMove: (e: TouchEvent) => void;
	private boundTouchEnd: (e: TouchEvent) => void;
	private boundResize: () => void;

	constructor(options: PinchZoomOptions) {
		this.scrollContainer = options.scrollContainer;
		this.zoomWrapper = options.zoomWrapper;
		this.zoomInner = options.zoomInner;
		this.tableSelector =
			options.tableSelector ?? ".monthly-planner-table";
		this.scale = options.initialScale ?? DEFAULT_SCALE;
		this.onScaleChange = options.onScaleChange;
		this.manageStickyHeaders = options.manageStickyHeaders ?? false;

		this.boundTouchStart = this.handleTouchStart.bind(this);
		this.boundTouchMove = this.handleTouchMove.bind(this);
		this.boundTouchEnd = this.handleTouchEnd.bind(this);
		this.boundResize = this.handleResize.bind(this);
	}

	attach(): void {
		if (!Platform.isMobile) return;

		this.scrollContainer.addEventListener(
			"touchstart",
			this.boundTouchStart,
			{ passive: false, capture: true },
		);
		this.scrollContainer.addEventListener(
			"touchmove",
			this.boundTouchMove,
			{ passive: false, capture: true },
		);
		this.scrollContainer.addEventListener("touchend", this.boundTouchEnd, {
			passive: false,
			capture: true,
		});
		this.scrollContainer.addEventListener(
			"touchcancel",
			this.boundTouchEnd,
			{ passive: false, capture: true },
		);
		window.addEventListener("resize", this.boundResize);

		this.measureBase();
		this.applyScale();
	}

	detach(): void {
		this.scrollContainer.removeEventListener(
			"touchstart",
			this.boundTouchStart,
			{ capture: true },
		);
		this.scrollContainer.removeEventListener(
			"touchmove",
			this.boundTouchMove,
			{ capture: true },
		);
		this.scrollContainer.removeEventListener(
			"touchend",
			this.boundTouchEnd,
			{ capture: true },
		);
		this.scrollContainer.removeEventListener(
			"touchcancel",
			this.boundTouchEnd,
			{ capture: true },
		);
		window.removeEventListener("resize", this.boundResize);
		if (this.manageStickyHeaders) {
			this.zoomInner.classList.remove("is-zoomed");
		}
	}

	getScale(): number {
		return this.scale;
	}

	/**
	 * Minimum scale = viewport width / table base width, capped at 1.
	 * Prevents pinch-out from shrinking the table smaller than viewport width.
	 */
	private getMinScale(): number {
		if (this.baseWidth <= 0) return 0.5;
		const viewportWidth = this.scrollContainer.clientWidth;
		return Math.min(1, viewportWidth / this.baseWidth);
	}

	setScale(
		value: number,
		notify = true,
		pinchCenter?: { x: number; y: number },
	): void {
		const minScale = this.getMinScale();
		const clamped = Math.max(minScale, Math.min(MAX_SCALE, value));
		if (this.scale === clamped) return;

		const oldScale = this.scale;
		this.scale = clamped;
		this.applyScale();

		/* Keep pinch center fixed: adjust scroll so point under fingers stays put.
		   px/py are in "scaled scroll space": scrollLeft + viewportOffset.
		   Correct formula: newScroll = px*(ratio-1) + scrollLeft */
		if (pinchCenter && oldScale > 0) {
			const px = pinchCenter.x;
			const py = pinchCenter.y;
			const ratio = clamped / oldScale;
			const newScrollLeft = px * (ratio - 1) + this.scrollContainer.scrollLeft;
			const newScrollTop = py * (ratio - 1) + this.scrollContainer.scrollTop;
			this.scrollContainer.scrollLeft = Math.max(0, newScrollLeft);
			this.scrollContainer.scrollTop = Math.max(0, newScrollTop);
		}

		if (notify) this.onScaleChange?.(this.scale);
	}

	resetScale(notify = true): void {
		this.setScale(DEFAULT_SCALE, notify);
	}

	private handleTouchStart(e: TouchEvent): void {
		if (e.touches.length >= 2) {
			this.isPinching = true;
			this.pinchStartDistance = getTouchDistance(e.touches);
			this.pinchStartScale = this.scale;
			const c = getTouchCenterInElement(e.touches, this.scrollContainer);
			this.pinchCenterX = c.x;
			this.pinchCenterY = c.y;
		}
	}

	private handleTouchMove(e: TouchEvent): void {
		if (this.isPinching && e.touches.length >= 2) {
			e.preventDefault();
			const dist = getTouchDistance(e.touches);
			const c = getTouchCenterInElement(e.touches, this.scrollContainer);
			this.pinchCenterX = c.x;
			this.pinchCenterY = c.y;
			if (this.pinchStartDistance > 0 && dist > 0) {
				const ratio = dist / this.pinchStartDistance;
				this.setScale(this.pinchStartScale * ratio, true, {
					x: this.pinchCenterX,
					y: this.pinchCenterY,
				});
			}
		}
	}

	private handleTouchEnd(e: TouchEvent): void {
		if (e.touches.length < 2) {
			this.isPinching = false;
			this.pinchStartDistance = 0;
		}
	}

	private handleResize(): void {
		const prevScale = this.scale;
		this.refresh();
		if (this.scale !== prevScale) {
			this.onScaleChange?.(this.scale);
		}
	}

	/**
	 * Measure the table's natural (scale=1) dimensions and cache them.
	 * Must be called before applyScale() and after any layout change that
	 * affects the table's natural size (e.g. window resize, re-render).
	 */
	private measureBase(): void {
		const table = this.zoomInner.querySelector(this.tableSelector);
		if (!table) return;

		/* Temporarily clear wrapper/inner size constraints so the table can
		   report its true preferred width at scale=1. */
		const prevWrapperWidth = this.zoomWrapper.style.width;
		const prevWrapperHeight = this.zoomWrapper.style.height;
		const empty = "";
		const fitContent = "fit-content";
		const auto = "auto";
		this.zoomWrapper.style.width = empty;
		this.zoomWrapper.style.height = empty;
		this.zoomInner.style.width = fitContent;
		this.zoomInner.style.height = auto;
		this.zoomInner.style.transform = empty;

		this.baseWidth = (table as HTMLElement).offsetWidth;
		this.baseHeight = (table as HTMLElement).offsetHeight;

		/* Restore scaled wrapper size so the scroll container doesn't jump */
		if (this.baseWidth > 0) {
			this.zoomWrapper.style.width = prevWrapperWidth;
			this.zoomWrapper.style.height = prevWrapperHeight;
		}
	}

	private applyScale(): void {
		if (this.baseWidth === 0 || this.baseHeight === 0) return;

		this.zoomWrapper.style.width = `${this.baseWidth * this.scale}px`;
		this.zoomWrapper.style.height = `${this.baseHeight * this.scale}px`;

		this.zoomInner.style.width = `${this.baseWidth}px`;
		this.zoomInner.style.height = `${this.baseHeight}px`;
		this.zoomInner.style.transform = `scale(${this.scale})`;
		const transformOriginZero = "0 0";
		this.zoomInner.style.transformOrigin = transformOriginZero;

		if (this.manageStickyHeaders) {
			this.zoomInner.classList.toggle(
				"is-zoomed",
				this.scale !== DEFAULT_SCALE,
			);
		}
	}

	/** Call after layout changes (e.g. table reflow) to refresh dimensions */
	refresh(): void {
		this.measureBase();
		const minScale = this.getMinScale();
		if (this.scale < minScale) {
			this.scale = minScale;
		}
		this.applyScale();
	}
}
