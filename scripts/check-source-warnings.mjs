import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

async function collectFiles(directory, extension) {
	const entries = await readdir(directory, { withFileTypes: true });
	const files = [];
	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectFiles(path, extension)));
		} else if (extname(entry.name) === extension) {
			files.push(path);
		}
	}
	return files;
}

const checks = [
	{
		files: await collectFiles("src", ".ts"),
		pattern:
			/\b(?:document|activeDocument|(?:[\w$]+\.)*ownerDocument)\.(?:createElement(?:NS)?|createDocumentFragment)\s*\(/g,
		message: "Use Obsidian createEl helpers instead of native DOM factories.",
	},
	{
		files: ["styles.css"],
		pattern: /:has\s*\(/g,
		message: "Avoid :has selectors; use an explicit state class instead.",
	},
];

const violations = [];
for (const check of checks) {
	for (const file of check.files) {
		const source = await readFile(file, "utf8");
		for (const match of source.matchAll(check.pattern)) {
			const line = source.slice(0, match.index).split("\n").length;
			violations.push(`${file}:${line}: ${check.message}`);
		}
	}
}

if (violations.length > 0) {
	console.error(violations.join("\n"));
	process.exitCode = 1;
}
