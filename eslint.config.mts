import tsparser from "@typescript-eslint/parser";
import json from "@eslint/json";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";
import { fileURLToPath } from "node:url";

const obsidianRecommendedConfig = Array.from(
	obsidianmd.configs?.recommended ?? [],
);

const typedObsidianRules = {
	"obsidianmd/no-plugin-as-component": "off",
	"obsidianmd/no-unsupported-api": "off",
	"obsidianmd/no-view-references-in-plugin": "off",
	"obsidianmd/prefer-file-manager-trash-file": "off",
	"obsidianmd/prefer-instanceof": "off",
};

export default defineConfig([
	globalIgnores([
		"node_modules",
		"dist",
		".git.broken",
		"data.json",
		"esbuild.config.mjs",
		"eslint.config.*",
		"version-bump.mjs",
		"versions.json",
		"main.js",
	]),
	...obsidianRecommendedConfig,
	{
		files: ["**/*.ts"],
		languageOptions: {
			parser: tsparser,
			globals: {
				...globals.browser,
			},
			parserOptions: {
				project: ["./tsconfig.json"],
				tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
			},
		},
	},
	{
		files: ["**/*.json"],
		language: "json/json",
		plugins: {
			json,
		},
		rules: {
			...typedObsidianRules,
			"no-irregular-whitespace": "off",
		},
	},
]);
