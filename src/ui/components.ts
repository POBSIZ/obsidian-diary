import { setIcon } from "obsidian";

export type UiButtonVariant = "default" | "cta" | "danger" | "warning";

export interface UiButtonOptions {
	text?: string;
	classes?: string;
	ariaLabel?: string;
	title?: string;
	icon?: string;
	iconClass?: string;
	labelClass?: string;
	variant?: UiButtonVariant;
	type?: "button" | "submit";
	disabled?: boolean;
	onClick?: (event: MouseEvent) => void | Promise<void>;
}

const BUTTON_VARIANT_CLASS: Record<UiButtonVariant, string> = {
	default: "",
	cta: "mod-cta",
	danger: "mod-danger",
	warning: "mod-warning",
};

const MODAL_ACTION_BAR_CLASS = "diary-ui-modal-action-bar";
const MODAL_ACTION_BAR_THREE_BUTTONS_CLASS =
	"diary-ui-modal-action-bar-three-buttons";

function updateModalActionBarState(parent: HTMLElement): void {
	if (!parent.classList.contains(MODAL_ACTION_BAR_CLASS)) return;
	parent.classList.toggle(
		MODAL_ACTION_BAR_THREE_BUTTONS_CLASS,
		parent.childElementCount === 3,
	);
}

/** Single button factory for planner views, modals, and settings surfaces. */
export function createUiButton(
	parent: HTMLElement,
	options: UiButtonOptions,
): HTMLButtonElement {
	const classes = [
		"diary-ui-button",
		BUTTON_VARIANT_CLASS[options.variant ?? "default"],
		options.classes,
	]
		.filter(Boolean)
		.join(" ");
	const button = parent.createEl("button", {
		cls: classes,
		attr: { type: options.type ?? "button" },
	});
	if (options.ariaLabel) button.ariaLabel = options.ariaLabel;
	if (options.title) button.title = options.title;
	button.disabled = options.disabled ?? false;
	if (options.icon) {
		const icon = button.createSpan({
			cls: `diary-ui-button-icon ${options.iconClass ?? ""}`.trim(),
		});
		setIcon(icon, options.icon);
	}
	if (options.text) {
		button.createSpan({
			cls: `diary-ui-button-label ${options.labelClass ?? ""}`.trim(),
			text: options.text,
		});
	}
	if (options.onClick) {
		button.onclick = (event) => void options.onClick?.(event);
	}
	updateModalActionBarState(parent);
	return button;
}

export function createUiButtonRow(
	parent: HTMLElement,
	classes: string,
): HTMLElement {
	return parent.createDiv({ cls: `diary-ui-button-row ${classes}` });
}

/**
 * Creates an action bar outside the modal's scrollable body.
 *
 * Call this after rendering the modal body. Existing children are moved into a
 * dedicated scroll region so the action bar always reserves its own space and
 * never covers form fields or preview content on small screens.
 */
export function createUiModalActionBar(
	parent: HTMLElement,
	classes: string,
): HTMLElement {
	const actions = createUiButtonRow(
		parent,
		`${MODAL_ACTION_BAR_CLASS} ${classes}`,
	);
	const scrollRegion = parent.createDiv({
		cls: "diary-ui-modal-scroll-region",
	});
	parent.insertBefore(scrollRegion, actions);
	while (parent.firstChild && parent.firstChild !== scrollRegion) {
		scrollRegion.appendChild(parent.firstChild);
	}
	parent.addClass("diary-ui-modal-with-actions");
	return actions;
}

export function createUiFieldRow(
	parent: HTMLElement,
	classes: string,
): HTMLElement {
	return parent.createDiv({ cls: `diary-ui-field-row ${classes}` });
}

export function createUiError(
	parent: HTMLElement,
	classes: string,
): HTMLElement {
	return parent.createDiv({
		cls: `diary-ui-error ${classes}`,
		attr: { role: "alert", "aria-live": "polite" },
	});
}

export function createUiDisclosure(
	parent: HTMLElement,
	options: { classes: string; open?: boolean },
): HTMLDetailsElement {
	const details = parent.createEl("details", {
		cls: `diary-ui-disclosure ${options.classes}`,
	});
	details.open = options.open ?? false;
	return details;
}

export function createUiBadge(
	parent: HTMLElement,
	options: {
		text: string;
		classes?: string;
		color?: string | null;
		colorProperty?: string;
		tag?: "div" | "span";
	},
): HTMLElement {
	const elementOptions = {
		cls: `diary-ui-badge ${options.classes ?? ""}`.trim(),
		text: options.text,
	};
	const badge =
		options.tag === "span"
			? parent.createSpan(elementOptions)
			: parent.createDiv(elementOptions);
	if (options.color) {
		badge.style.setProperty(options.colorProperty ?? "--diary-ui-color", options.color);
	}
	return badge;
}

export function createUiColorPresetButton(
	parent: HTMLElement,
	options: {
		color: string;
		label: string;
		classes?: string;
		onClick: () => void;
	},
): HTMLButtonElement {
	const button = createUiButton(parent, {
		classes: `diary-ui-color-preset ${options.classes ?? ""}`.trim(),
		ariaLabel: options.label,
		title: options.label,
		onClick: options.onClick,
	});
	button.style.backgroundColor = options.color;
	button.style.setProperty("--diary-ui-color", options.color);
	return button;
}

export function attachUiPressFeedback(button: HTMLButtonElement): void {
	let releaseTimer: number | null = null;
	const press = () => {
		if (button.disabled) return;
		if (releaseTimer != null) window.clearTimeout(releaseTimer);
		releaseTimer = null;
		button.addClass("is-pressed");
	};
	const release = () => {
		if (releaseTimer != null) window.clearTimeout(releaseTimer);
		releaseTimer = window.setTimeout(() => {
			button.removeClass("is-pressed");
			releaseTimer = null;
		}, 120);
	};
	button.addEventListener("pointerdown", press);
	button.addEventListener("pointerup", release);
	button.addEventListener("pointercancel", release);
	button.addEventListener("pointerleave", release);
	button.addEventListener("keydown", (event) => {
		if (event.key === "Enter" || event.key === " ") press();
	});
	button.addEventListener("keyup", release);
	button.addEventListener("blur", () => {
		if (releaseTimer != null) window.clearTimeout(releaseTimer);
		releaseTimer = null;
		button.removeClass("is-pressed");
	});
}
