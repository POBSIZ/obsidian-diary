import { App, TFile, TFolder } from "obsidian";

export type PlanNoteKind = "yearly" | "monthly";

/** Empty templates retain the original Planner/YYYY[-MM].md location. */
export function isValidPlanNoteTemplate(template: string, kind: PlanNoteKind): boolean {
	if (!template.trim()) return true;
	if (!template.includes("YYYY") || (kind === "monthly" && !template.includes("MM"))) return false;
	if (kind === "yearly" && template.includes("MM")) return false;
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
	return template.trim()
		.replace(/YYYY/g, String(year))
		.replace(/MM/g, String(month).padStart(2, "0"));
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
