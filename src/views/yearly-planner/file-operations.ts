import { App, TFile, WorkspaceLeaf } from "obsidian";
import { parseRangeBasename } from "../../utils/range";
import { getFilePath } from "./file-utils";

const pad = (n: number) => String(n).padStart(2, "0");

export async function openDateNote(
	app: App,
	leaf: WorkspaceLeaf,
	folder: string,
	year: number,
	month: number,
	day: number,
): Promise<void> {
	const path = getFilePath(folder, year, month, day);
	const file = app.vault.getAbstractFileByPath(path);

	if (file instanceof TFile) {
		await leaf.openFile(file);
	} else {
		const dir = path.split("/").slice(0, -1).join("/");
		if (dir && !app.vault.getAbstractFileByPath(dir)) {
			await app.vault.createFolder(dir);
		}
		const dateStr = `${year}-${pad(month)}-${pad(day)}`;
		const content = `# ${dateStr}\n\n`;
		const newFile = await app.vault.create(path, content);
		await leaf.openFile(newFile);
	}
}

export async function createRangeFile(
	app: App,
	folder: string,
	basename: string,
	color?: string,
): Promise<TFile> {
	const cleanBasename = basename.trim().replace(/\.md$/i, "");
	const parsed = parseRangeBasename(cleanBasename);
	if (!parsed) {
		throw new Error(`Invalid range basename: ${cleanBasename}`);
	}
	const { start: startStr, end: endStr, suffix } = parsed;
	const trimmed = (folder || "Planner").trim();
	const filename = cleanBasename.endsWith(".md")
		? cleanBasename
		: `${cleanBasename}.md`;
	const path = trimmed ? `${trimmed}/${filename}` : filename;
	const existing = app.vault.getAbstractFileByPath(path);
	if (existing instanceof TFile) {
		throw new Error(`File already exists: ${path}`);
	}
	const dir = path.split("/").slice(0, -1).join("/");
	if (dir && !app.vault.getAbstractFileByPath(dir)) {
		await app.vault.createFolder(dir);
	}
	const heading = suffix !== undefined ? suffix : `${startStr} ~ ${endStr}`;
	const colorLine = color?.trim()
		? `color: "${color.trim().replace(/"/g, '\\"')}"\n`
		: "";
	const content = `---
date_start: ${startStr}
date_end: ${endStr}
${colorLine}
---

# ${heading}

`;
	return app.vault.create(path, content);
}

/** Extract date and optional suffix from basename (e.g. "2026-02-12" or "2026-02-12-meeting"). */
function parseSingleDateBasename(
	basename: string,
): { date: string; suffix?: string } | null {
	const m = basename.match(/^(\d{4}-\d{2}-\d{2})(?:-(.+))?$/);
	if (!m) return null;
	return { date: m[1] ?? "", suffix: m[2] ?? undefined };
}

export async function createSingleDateFile(
	app: App,
	folder: string,
	basename: string,
	color?: string,
): Promise<TFile> {
	const trimmed = (folder || "Planner").trim();
	const cleanBasename = basename.trim().replace(/\.md$/i, "") || "untitled";
	const filename = cleanBasename.endsWith(".md")
		? cleanBasename
		: `${cleanBasename}.md`;
	const path = trimmed ? `${trimmed}/${filename}` : filename;
	const existing = app.vault.getAbstractFileByPath(path);
	if (existing instanceof TFile) {
		throw new Error(`File already exists: ${path}`);
	}
	const dir = path.split("/").slice(0, -1).join("/");
	if (dir && !app.vault.getAbstractFileByPath(dir)) {
		await app.vault.createFolder(dir);
	}
	const parsed = parseSingleDateBasename(cleanBasename);
	const heading =
		parsed?.suffix ?? parsed?.date ?? cleanBasename;
	const colorBlock = color?.trim()
		? `---
color: "${color.trim().replace(/"/g, '\\"')}"
---

`
		: "";
	const content = `${colorBlock}# ${heading}\n\n`;
	return app.vault.create(path, content);
}

/**
 * Update the color in a file's frontmatter.
 * Uses app.fileManager.processFrontMatter (Obsidian 1.4.4+) to avoid parsing/serialization issues.
 * @param color - New color (hex/rgb/name). If undefined/empty, removes color from frontmatter.
 */
export async function updateFileColor(
	app: App,
	file: TFile,
	color: string | undefined,
): Promise<void> {
	const trimmed = color?.trim();
	await app.fileManager.processFrontMatter(
		file,
		(frontmatter: Record<string, unknown>) => {
			if (trimmed) {
				frontmatter.color = trimmed;
			} else {
				delete frontmatter.color;
			}
		},
	);
}
