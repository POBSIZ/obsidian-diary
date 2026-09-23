import { App, TFile, TFolder } from "obsidian";

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
export function isValidPlanNoteTemplate(template: string, kind: PlanNoteKind): boolean {
	if (!template.trim()) return true;
	const tokens = getDateTokenParts(template);
	if (!tokens.year || (kind === "monthly" && !tokens.month)) return false;
	if (kind === "yearly" && tokens.month) return false;
	if (UNSUPPORTED_DATE_TOKEN.test(template)) return false;
	if (!template.endsWith(".md") || template.startsWith("/") || template.includes("\\")) return false;
	if (/\{[^}]*\}/.test(template)) return false;
	return template.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

export function getPlanNotePath(
	kind: PlanNoteKind,
	folder: string,
	template: string,
	year: number,
	month?: number,
): string {
	const filename = kind === "yearly"
		? `${year}.md`
		: `${year}-${String(month).padStart(2, "0")}.md`;
	const base = (folder || "Planner").trim().replace(/^\/+|\/+$/g, "");
	const fallback = base ? `${base}/${filename}` : filename;
	if (!template.trim()) return fallback;
	if (!isValidPlanNoteTemplate(template, kind)) return fallback;
	const paddedMonth = String(month).padStart(2, "0");
	return template.trim().replace(DATE_TOKEN, (token, index: number, source: string) => {
		const before = source[index - 1] ?? "";
		const after = source[index + token.length] ?? "";
		if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) return token;
		return token.replace("YYYY", String(year)).replace("MM", paddedMonth);
	});
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
