import { App, Component, MarkdownRenderer, setIcon, TFile } from "obsidian";
import { t } from "../i18n";
import { createUiButton } from "../ui/components";

export interface PlanNotePanelOptions {
	/** Human-readable label shown in the header (e.g. "2026" or "February 2026"). */
	label: string;
	/** Whether the panel body is expanded. Required when file exists. */
	expanded?: boolean;
	/** Called when the user toggles expand/collapse. Required when file exists. */
	onToggle?: () => void;
	onCreate: () => Promise<void>;
	onOpen: (file: TFile) => void;
}

export interface PlanNotePeriod {
	year: number;
	month?: number;
}

/** Detach a matching rendered panel so a view refresh can reuse its markdown DOM. */
export function detachReusablePlanNotePanel(
	contentEl: HTMLElement,
	period: PlanNotePeriod,
): HTMLElement | null {
	const wrapper = contentEl.querySelector<HTMLElement>(
		".plan-note-panel-wrapper",
	);
	if (
		!wrapper?.hasChildNodes() ||
		wrapper.dataset.year !== String(period.year) ||
		(period.month != null && wrapper.dataset.month !== String(period.month))
	) {
		return null;
	}
	wrapper.remove();
	return wrapper;
}

/** Reattach a preserved plan note or create and render a new shared panel slot. */
export function mountPlanNotePanel(
	contentEl: HTMLElement,
	options: {
		period: PlanNotePeriod;
		preserved: HTMLElement | null;
		expanded: boolean;
		render: (container: HTMLElement) => Promise<void>;
	},
): HTMLElement {
	if (options.preserved) {
		contentEl.appendChild(options.preserved);
		syncPlanNotePanelExpandedState(options.preserved, options.expanded);
		return options.preserved;
	}
	const wrapper = contentEl.createDiv({ cls: "plan-note-panel-wrapper" });
	wrapper.dataset.year = String(options.period.year);
	if (options.period.month != null) {
		wrapper.dataset.month = String(options.period.month);
	}
	void options.render(wrapper);
	return wrapper;
}

/**
 * Renders a plan note panel into `container`.
 * - If `filePath` exists: renders the file's markdown content with an open button.
 * - If `filePath` is absent: renders an empty state with a create button.
 */
export async function renderPlanNotePanel(
	container: HTMLElement,
	app: App,
	filePath: string,
	component: Component,
	opts: PlanNotePanelOptions,
): Promise<void> {
	const panel = container.createDiv({ cls: "plan-note-panel" });
	const file = app.vault.getAbstractFileByPath(filePath);

	if (file instanceof TFile) {
		const header = panel.createDiv({ cls: "plan-note-panel-header" });
		const expanded = opts.expanded ?? true;
		panel.toggleClass("is-collapsed", !expanded);
		if (opts.onToggle) {
			const toggleBtn = createUiButton(header, {
				classes: "plan-note-panel-toggle-btn clickable-icon",
				ariaLabel: expanded
					? t("planNote.collapse")
					: t("planNote.expand"),
			});
			setIcon(toggleBtn, expanded ? "chevron-down" : "chevron-right");
			toggleBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				opts.onToggle!();
			});
		}
		header.createSpan({
			cls: "plan-note-panel-title",
			text: opts.label,
		});
		const openBtn = createUiButton(header, {
			classes: "plan-note-panel-open-btn clickable-icon",
			ariaLabel: t("planNote.openButton"),
		});
		setIcon(openBtn, "external-link");
		openBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			opts.onOpen(file);
		});

		const body = panel.createDiv({
			cls: expanded
				? "plan-note-panel-body"
				: "plan-note-panel-body is-collapsed",
		});
		const content = await app.vault.read(file);
		if (content.trim()) {
			await MarkdownRenderer.render(
				app,
				content,
				body,
				file.path,
				component,
			);
		} else {
			body.createEl("p", {
				cls: "plan-note-panel-empty-content",
				text: t("planNote.emptyContent"),
			});
		}

		body.addEventListener("click", () => opts.onOpen(file));
	} else {
		const emptyEl = panel.createDiv({ cls: "plan-note-panel-empty" });
		emptyEl.createSpan({
			cls: "plan-note-panel-empty-hint",
			text: t("planNote.emptyHint", { label: opts.label }),
		});
		const createBtn = createUiButton(emptyEl, {
			classes: "plan-note-panel-create-btn",
			text: t("planNote.createButton"),
		});
		createBtn.addEventListener("click", () => void opts.onCreate());
	}
}

/**
 * Syncs the expanded state to an existing plan note panel DOM (e.g. when preserved during re-render).
 * Call this when reusing a preserved plan note wrapper so the toggle reflects current settings.
 */
export function syncPlanNotePanelExpandedState(
	wrapper: HTMLElement,
	expanded: boolean,
): void {
	const body = wrapper.querySelector<HTMLElement>(".plan-note-panel-body");
	const toggleBtn = wrapper.querySelector<HTMLElement>(
		".plan-note-panel-toggle-btn",
	);
	if (body) {
		body.toggleClass("is-collapsed", !expanded);
	}
	wrapper.toggleClass("is-collapsed", !expanded);
	if (toggleBtn) {
		setIcon(toggleBtn, expanded ? "chevron-down" : "chevron-right");
		toggleBtn.setAttribute(
			"aria-label",
			expanded ? t("planNote.collapse") : t("planNote.expand"),
		);
	}
}
