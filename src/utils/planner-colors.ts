import { App, TFile } from "obsidian";
import { t } from "../i18n";
import { parsePlannerBasename } from "./date-formats";

export interface PlannerColorPreset {
	id: string;
	name: string;
	color: string;
	/** Archived colors remain available to existing references. */
	archived?: boolean;
}

export type PlannerColorSelection =
	| { mode: "theme" }
	| { mode: "fixed"; color: string }
	| { mode: "palette"; id: string; color: string };

export type PlannerNoteColorSelection =
	| PlannerColorSelection
	| { mode: "inherit" };

export interface PlannerColorConfiguration {
	colorPalette: PlannerColorPreset[];
	holidayColor: PlannerColorSelection;
}

export const DEFAULT_COLOR_PALETTE: readonly PlannerColorPreset[] = [
	{ id: "diary-green", name: "", color: "#22c55e" },
	{ id: "diary-yellow", name: "", color: "#f59e0b" },
	{ id: "diary-pink", name: "", color: "#ec4899" },
	{ id: "diary-gray", name: "", color: "#6b7280" },
];

export const DEFAULT_HOLIDAY_COLOR: PlannerColorSelection = { mode: "theme" };
const configurations = new WeakMap<App, PlannerColorConfiguration>();
const recurrenceSources = new WeakMap<App, Map<string, TFile>>();

export function normalizeHexColor(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const text = value.trim().toLowerCase();
	const short = /^#([\da-f])([\da-f])([\da-f])$/.exec(text);
	if (short) return `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`;
	return /^#[\da-f]{6}$/.test(text) ? text : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function normalizeColorPalette(value: unknown): PlannerColorPreset[] {
	if (!Array.isArray(value)) return DEFAULT_COLOR_PALETTE.map((preset) => ({ ...preset }));
	const result: PlannerColorPreset[] = [];
	const ids = new Set<string>();
	for (const raw of value as unknown[]) {
		if (!isRecord(raw)) continue;
		const id = typeof raw.id === "string" ? raw.id.trim() : "";
		const color = normalizeHexColor(raw.color);
		if (!id || !color || ids.has(id) || id.length > 128) continue;
		ids.add(id);
		result.push({
			id,
			name: typeof raw.name === "string" ? raw.name.trim().slice(0, 80) : "",
			color,
			...(raw.archived === true ? { archived: true } : {}),
		});
	}
	// An intentional empty palette still leaves the theme and fixed-color options.
	return value.length > 0 && result.length === 0 ? DEFAULT_COLOR_PALETTE.map((preset) => ({ ...preset })) : result;
}

export function normalizePlannerColorSelection(value: unknown): PlannerColorSelection {
	if (!isRecord(value)) return { mode: "theme" };
	const color = normalizeHexColor(value.color);
	if (value.mode === "fixed" && color) return { mode: "fixed", color };
	if (value.mode === "palette" && typeof value.id === "string" && value.id.trim() && color) {
		return { mode: "palette", id: value.id.trim(), color };
	}
	return { mode: "theme" };
}

export function configurePlannerColors(app: App, configuration: PlannerColorConfiguration): void {
	configurations.set(app, {
		colorPalette: normalizeColorPalette(configuration.colorPalette),
		holidayColor: normalizePlannerColorSelection(configuration.holidayColor),
	});
}

export function getPlannerColorPalette(app: App): readonly PlannerColorPreset[] {
	return configurations.get(app)?.colorPalette ?? DEFAULT_COLOR_PALETTE;
}

export function getPlannerColorPresetLabel(preset: PlannerColorPreset): string {
	if (preset.name) return preset.name;
	switch (preset.id) {
		case "diary-green": return t("colors.defaultGreen");
		case "diary-yellow": return t("colors.defaultYellow");
		case "diary-pink": return t("colors.defaultPink");
		case "diary-gray": return t("colors.defaultGray");
		default: return preset.color;
	}
}

/** Preserve valid legacy CSS values, including named colors and theme variables. */
export function isValidPlannerColor(value: unknown, doc: Document = window.document): value is string {
	if (typeof value !== "string" || !value.trim()) return false;
	if (normalizeHexColor(value)) return true;
	const span = doc.body.createSpan();
	span.style.color = value.trim();
	const valid = span.style.color !== "";
	span.remove();
	return valid;
}

export function resolvePlannerColorSelection(
	selection: PlannerColorSelection,
	palette: readonly PlannerColorPreset[],
	themeColor: string | null = null,
): string | null {
	if (selection.mode === "theme") return themeColor;
	if (selection.mode === "palette") {
		return palette.find((preset) => preset.id === selection.id)?.color ?? selection.color;
	}
	return selection.color;
}

export function getHolidayColor(app: App): string {
	const configuration = configurations.get(app);
	return resolvePlannerColorSelection(
		configuration?.holidayColor ?? DEFAULT_HOLIDAY_COLOR,
		getPlannerColorPalette(app),
		"var(--text-accent)",
	) ?? "var(--text-accent)";
}

export function getHolidayColorSelection(app: App): PlannerColorSelection {
	return { ...(configurations.get(app)?.holidayColor ?? DEFAULT_HOLIDAY_COLOR) };
}

export function applyHolidayColor(element: HTMLElement, app: App): void {
	const color = getHolidayColor(app);
	element.style.setProperty("--diary-holiday-color", color);
	// Custom pale colors remain visible as borders and dots; text uses the theme's readable foreground.
	element.style.setProperty("--diary-holiday-text-color", color === "var(--text-accent)" ? color : "var(--text-normal)");
}

function getFrontmatter(app: App, file: TFile): Record<string, unknown> {
	const frontmatter: unknown = app.metadataCache.getFileCache(file)?.frontmatter;
	return isRecord(frontmatter) ? frontmatter : {};
}

function rawFileSelection(app: App, file: TFile): PlannerColorSelection {
	const fm = getFrontmatter(app, file);
	const color = isValidPlannerColor(fm.color) ? fm.color.trim() : "";
	const id = typeof fm.diary_color_id === "string" ? fm.diary_color_id.trim() : "";
	if (id) return { mode: "palette", id, color };
	return color ? { mode: "fixed", color } : { mode: "theme" };
}

export function getFileColorSelection(app: App, file: TFile): PlannerNoteColorSelection {
	const fm = getFrontmatter(app, file);
	if (fm.recurrence_role === "occurrence" && fm.diary_color_inherit === true) {
		return { mode: "inherit" };
	}
	return rawFileSelection(app, file);
}

/** Resolve one level of recurrence inheritance, avoiding cycles in malformed notes. */
export function getPlannerFileColor(app: App, file: TFile): string | null {
	const selection = getEffectiveFileColorSelection(app, file);
	const resolved = resolvePlannerColorSelection(selection, getPlannerColorPalette(app));
	return resolved && isValidPlannerColor(resolved) ? resolved : null;
}

function getEffectiveFileColorSelection(app: App, file: TFile): PlannerColorSelection {
	const fm = getFrontmatter(app, file);
	let selection = rawFileSelection(app, file);
	if (fm.recurrence_role === "occurrence" && fm.diary_color_inherit === true) {
		const source = getColorRecurrenceSource(app, file, fm);
		if (source) selection = rawFileSelection(app, source);
	}
	return selection;
}

function getColorRecurrenceSource(app: App, file: TFile, fm: Record<string, unknown>): TFile | null {
	const sourcePath = typeof fm.recurrence_source_path === "string" ? fm.recurrence_source_path : "";
	const id = typeof fm.recurrence_id === "string" ? fm.recurrence_id : "";
	const direct = app.vault.getAbstractFileByPath(sourcePath);
	const isSource = (candidate: TFile): boolean => {
		const sourceFm = getFrontmatter(app, candidate);
		return candidate.path !== file.path && sourceFm.recurrence_role === "source" && (!id || sourceFm.recurrence_id === id);
	};
	if (direct instanceof TFile && isSource(direct)) return direct;
	if (!id) return null;
	let cache = recurrenceSources.get(app);
	if (!cache) {
		cache = new Map();
		recurrenceSources.set(app, cache);
	}
	const cached = cache.get(id);
	if (cached && app.vault.getAbstractFileByPath(cached.path) === cached && isSource(cached)) return cached;
	const candidates = app.vault.getMarkdownFiles().filter((candidate) => isSource(candidate) && getFrontmatter(app, candidate).recurrence_id === id);
	if (candidates.length !== 1) return null;
	const found = candidates[0]!;
	cache.set(id, found);
	return found;
}

export function getFileColorValues(app: App, file: TFile, selection: PlannerNoteColorSelection): {
	color?: string;
	colorId?: string;
	inherit?: boolean;
} {
	const isOccurrence = getFrontmatter(app, file).recurrence_role === "occurrence";
	if (selection.mode === "inherit") {
		const fm = getFrontmatter(app, file);
		const source = getColorRecurrenceSource(app, file, fm);
		const inherited = source ? rawFileSelection(app, source) : rawFileSelection(app, file);
		return {
			color: resolvePlannerColorSelection(inherited, getPlannerColorPalette(app)) ?? undefined,
			colorId: inherited.mode === "palette" ? inherited.id : undefined,
			inherit: true,
		};
	}
	return {
		color: resolvePlannerColorSelection(selection, getPlannerColorPalette(app)) ?? undefined,
		colorId: selection.mode === "palette" ? selection.id : undefined,
		inherit: isOccurrence ? false : undefined,
	};
}

export async function setFileColorSelection(app: App, file: TFile, selection: PlannerNoteColorSelection): Promise<void> {
	const values = getFileColorValues(app, file, selection);
	await app.fileManager.processFrontMatter(file, (fm: Record<string, unknown>) => {
		if (values.color) fm.color = values.color;
		else delete fm.color;
		if (values.colorId) fm.diary_color_id = values.colorId;
		else delete fm.diary_color_id;
		if (values.inherit !== undefined) fm.diary_color_inherit = values.inherit;
	});
}

/** Compare CSS representations only when a document is available. */
export function normalizeCssColor(value: string, doc: Document = window.document): string | null {
	const hex = normalizeHexColor(value);
	if (hex) return hex;
	if (!isValidPlannerColor(value, doc)) return null;
	const span = doc.body.createSpan();
	span.style.color = value;
	const computed = (doc.defaultView ?? window).getComputedStyle(span).color;
	span.remove();
	const rgb = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/.exec(computed);
	if (!rgb || (rgb[4] !== undefined && Number(rgb[4]) !== 1)) return null;
	return `#${[rgb[1], rgb[2], rgb[3]].map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, "0")).join("")}`;
}

export function getLinkedColorFiles(app: App, id: string, files: readonly TFile[] = app.vault.getMarkdownFiles()): TFile[] {
	return files.filter((file) => {
		const selection = getEffectiveFileColorSelection(app, file);
		return selection.mode === "palette" && selection.id === id;
	});
}

export function findMatchingColorFiles(app: App, id: string, files: readonly TFile[] = app.vault.getMarkdownFiles()): TFile[] {
	const preset = getPlannerColorPalette(app).find((entry) => entry.id === id);
	if (!preset) return [];
	return files.filter((file) => {
		const fm = getFrontmatter(app, file);
		return parsePlannerBasename(file.basename) !== null && !fm.diary_color_id && typeof fm.color === "string" && normalizeCssColor(fm.color) === preset.color;
	});
}

export async function linkMatchingColorFiles(app: App, id: string, files?: readonly TFile[]): Promise<{ linked: number; failed: string[] }> {
	const preset = getPlannerColorPalette(app).find((entry) => entry.id === id);
	const result = { linked: 0, failed: [] as string[] };
	if (!preset) return result;
	for (const file of findMatchingColorFiles(app, id, files)) {
		try {
			await setFileColorSelection(app, file, { mode: "palette", id, color: preset.color });
			result.linked += 1;
		} catch {
			result.failed.push(file.path);
		}
	}
	return result;
}
