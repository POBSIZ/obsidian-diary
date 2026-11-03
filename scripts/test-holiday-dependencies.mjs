import assert from "node:assert/strict";
import { createRequire } from "node:module";
import Holidays from "date-holidays";

// Resolve the merge implementation used by the holiday parser, including its npm override.
const parserRequire = createRequire(import.meta.resolve("date-holidays-parser"));
const merge = parserRequire("deepmerge");
for (const [target, source] of [
	[JSON.parse('{"__proto__":{"injected":true}}'), {}],
	[{}, JSON.parse('{"__proto__":{"injected":true}}')],
]) {
	const result = merge(target, source);
	assert.equal(Object.getPrototypeOf(result), Object.prototype);
	assert.equal(result.injected, undefined);
	assert.equal(Object.hasOwn(result, "__proto__"), false);
}
assert.deepEqual(merge.all([{ names: ["first"], nested: { a: 1 } }, { names: ["second"], nested: { b: 2 } }]),
	{ names: ["first", "second"], nested: { a: 1, b: 2 } });
for (const country of ["KR", "US", "GB", "DE", "ES", "FR", "JP", "CN", "TW"]) {
	const holidays = new Holidays(country).getHolidays(2026);
	assert.ok(holidays.some((holiday) => holiday.date.startsWith("2026-01-01") && holiday.type === "public"), country);
	assert.ok(holidays.every((holiday) => holiday.start instanceof Date && holiday.end > holiday.start), country);
}
console.log("Holiday dependency regressions passed (prototype poisoning, merge compatibility, nine country calendars).");
