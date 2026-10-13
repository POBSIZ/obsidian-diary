import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const locales = ["en", "de", "es", "fr", "ja", "zh-CN", "zh-TW", "ko"];
const dictionaries = new Map(await Promise.all(locales.map(async (locale) => [
	locale,
	JSON.parse(await readFile(new URL(`../locales/${locale}.json`, import.meta.url), "utf8")),
])));
const english = dictionaries.get("en");
const keys = Object.keys(english).filter((key) => !key.startsWith("dateFormat."));
const placeholders = (text) => [...text.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
	.map((match) => match[1]).sort();
for (const [locale, dictionary] of dictionaries) {
	for (const key of keys) {
		assert.equal(typeof dictionary[key], "string", `${locale}: missing ${key}`);
		assert.notEqual(dictionary[key].trim(), "", `${locale}: empty ${key}`);
		assert.deepEqual(placeholders(dictionary[key]), placeholders(english[key]),
			`${locale}: placeholder mismatch in ${key}`);
	}
}
console.log(`Verified ${keys.length} message keys and placeholders in ${locales.length} locales.`);
