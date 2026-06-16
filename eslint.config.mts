import tseslint, { type InfiniteDepthConfigWithExtends } from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";
import { fileURLToPath } from "node:url";

const obsidianRecommendedConfig = Array.from(
	(obsidianmd.configs?.recommended ?? []) as Iterable<InfiniteDepthConfigWithExtends>,
);

export default tseslint.config(
	{
		languageOptions: {
			globals: {
				...globals.browser,
			},
			parserOptions: {
				projectService: {
					allowDefaultProject: ["eslint.config.mts", "manifest.json"],
				},
				project: ["./tsconfig.json"],
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
				extraFileExtensions: [".json"],
			},
		},
	},
	...obsidianRecommendedConfig,
	globalIgnores([
		"node_modules",
		"dist",
		"esbuild.config.mjs",
		"eslint.config.js",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
);
