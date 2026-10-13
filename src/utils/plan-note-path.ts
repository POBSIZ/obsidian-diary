import { App, TFile, TFolder } from "obsidian";
import { formatDateForFilename, getRepresentativeBasenames, isRepresentativeBasenameForPeriod, tokenizeDateTemplate } from "./date-formats";

export type PlanNoteKind = "yearly" | "monthly";

const DATE_TOKEN = /YYYYMM|MMYYYY|YYYY|MM/g;
const UNSUPPORTED_DATE_TOKEN = /(^|[^A-Za-z])(MMMM|MMM|YY|DD|D|WW|W|Q|M)(?=$|[^A-Za-z])/;

function getDateTokenParts(template: string): { year: boolean; month: boolean } {
	let year = false;
	let month = false;
	for (const match of template.matchAll(DATE_TOKEN)) {
		const token = match[0];
		const index = match.index ?? 0;
		const before = template[index - 1] ?? "";
		const after = template[index + token.length] ?? "";
		if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) continue;
		if (token.includes("YYYY")) year = true;
		if (token.includes("MM")) month = true;
	}
	return { year, month };
}

/** Empty templates retain the original Planner/YYYY[-MM].md location. */
export function isValidPlanNoteTemplate(template: string, kind: PlanNoteKind, grammarVersion: 1 | 2 = 2): boolean {
	if (!template.trim()) return true;
	if (grammarVersion === 2) {
		const parts = tokenizeDateTemplate(template.trim());
		if (!parts) return false;
		const tokens = parts.flatMap((part) => "token" in part ? [part.token] : []);
		if (!tokens.includes("YYYY") || tokens.includes("DD") ||
			(kind === "monthly" ? !tokens.includes("MM") : tokens.includes("MM"))) return false;
		const rendered = parts.map((part) => "literal" in part ? part.literal : part.token === "YYYY" ? "2026" : "10").join("");
		return isSafePlanNotePath(rendered);
	}
	const tokens = getDateTokenParts(template);
	if (!tokens.year || (kind === "monthly" && !tokens.month)) return false;
	if (kind === "yearly" && tokens.month) return false;
	if (UNSUPPORTED_DATE_TOKEN.test(template)) return false;
	return isSafePlanNotePath(template);
}

function isSafePlanNotePath(path: string): boolean {
	if (!path.endsWith(".md") || path.startsWith("/") || /[\\\r\n]/.test(path)) return false;
	if (/\{[^}]*\}/.test(path)) return false;
	return path.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

export function getPlanNotePath(
	kind: PlanNoteKind,
	folder: string,
	template: string,
	year: number,
	month?: number,
	grammarVersion: 1 | 2 = 1,
): string {
	const filename = `${formatDateForFilename(kind, year, month ?? 1)}.md`;
	const base = (folder || "Planner").trim().replace(/^\/+|\/+$/g, "");
	const fallback = base ? `${base}/${filename}` : filename;
	if (!template.trim()) return fallback;
	if (!isValidPlanNoteTemplate(template, kind, grammarVersion)) return fallback;
	const paddedMonth = String(month).padStart(2, "0");
	if (grammarVersion === 2) {
		return tokenizeDateTemplate(template.trim())!.map((part) => "literal" in part ? part.literal :
			part.token === "YYYY" ? String(year) : paddedMonth).join("");
	}
	return template.trim().replace(DATE_TOKEN, (token, index: number, source: string) => {
		const before = source[index - 1] ?? "";
		const after = source[index + token.length] ?? "";
		if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) return token;
		return token.replace("YYYY", String(year)).replace("MM", paddedMonth);
	});
}

/** Look up all configured exact filenames before allowing a new period note. */
export function resolvePlanNote(
	app: App, kind: PlanNoteKind, folder: string, template: string,
	year: number, month?: number, grammarVersion: 1 | 2 = 1,
): { path: string; candidates: TFile[]; ambiguous: boolean } {
	const path = getPlanNotePath(kind, folder, template, year, month, grammarVersion);
	const parent = path.slice(0, path.lastIndexOf("/") + 1);
	const paths = new Set([path, ...getRepresentativeBasenames(kind, year, month ?? 1).map((name) => `${parent}${name}.md`)]);
	const candidates = [...paths].map((candidate) => app.vault.getAbstractFileByPath(candidate))
		.filter((candidate): candidate is TFile => candidate instanceof TFile);
	const hasOverride = Boolean(template.trim()) && isValidPlanNoteTemplate(template, kind, grammarVersion);
	const ambiguous = candidates.some((candidate) => !(hasOverride && candidate.path === path) &&
		!isRepresentativeBasenameForPeriod(kind, candidate.basename, year, month ?? 1)) ||
		(candidates.length === 0 && !hasOverride && !isRepresentativeBasenameForPeriod(kind, path.split("/").pop()!, year, month ?? 1));
	return { path: candidates.length === 1 ? candidates[0]!.path : path, candidates, ambiguous };
}

export async function createPlanNoteFile(app: App, path: string, content: string): Promise<TFile> {
	const segments = path.split("/");
	segments.pop();
	let parent = "";
	for (const segment of segments) {
		parent = parent ? `${parent}/${segment}` : segment;
		const existing = app.vault.getAbstractFileByPath(parent);
		if (existing && !(existing instanceof TFolder)) {
			throw new Error(`A file blocks the plan note folder: ${parent}`);
		}
		if (!existing) await app.vault.createFolder(parent);
	}
	const existing = app.vault.getAbstractFileByPath(path);
	if (existing instanceof TFile) return existing;
	if (existing) throw new Error(`A folder already uses the plan note path: ${path}`);
	return app.vault.create(path, content);
}
