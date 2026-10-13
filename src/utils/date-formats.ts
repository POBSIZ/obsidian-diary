/** Filename formats are independent of display locale and internal ISO dates. */
export type DateFormatKind = "daily" | "monthly" | "yearly";
export interface DateFormatProfile { id: string; format: string }
export interface DateFormatGroup { formats: DateFormatProfile[]; defaultFormatId: string }
export type DateFormatsConfiguration = Record<DateFormatKind, DateFormatGroup>;
type Token = "YYYY" | "MM" | "DD";
type Part = { literal: string } | { token: Token };
interface CompiledFormat { parts: Part[]; pattern: string; tokens: Token[] }
export interface ParsedPlannerBasename {
	kind: "single" | "range";
	start: string;
	end?: string;
	suffix?: string;
	formatId: string;
	format: string;
}
export type PlannerBasenameRecognition =
	| { status: "matched"; value: ParsedPlannerBasename }
	| { status: "none" | "ambiguous" };

export const DEFAULT_DATE_FORMATS: DateFormatsConfiguration = {
	daily: { formats: [{ id: "iso-daily", format: "YYYY-MM-DD" }], defaultFormatId: "iso-daily" },
	monthly: { formats: [{ id: "iso-monthly", format: "YYYY-MM" }], defaultFormatId: "iso-monthly" },
	yearly: { formats: [{ id: "iso-yearly", format: "YYYY" }], defaultFormatId: "iso-yearly" },
};

const KINDS: DateFormatKind[] = ["daily", "monthly", "yearly"];
const compilationCache = new Map<string, CompiledFormat | null>();
let configuration = normalizeDateFormats(undefined);
let revision = 0;
const recognitionCache = new Map<string, PlannerBasenameRecognition>();
const fileRecognitionCache = new WeakMap<object, { basename: string; revision: number; value: ParsedPlannerBasename | null }>();
const changeListeners = new Set<() => void>();
const pad = (n: number): string => String(n).padStart(2, "0");

function record(value: unknown): Record<string, unknown> | null {
	return value != null && typeof value === "object" && !Array.isArray(value)
		? value as Record<string, unknown> : null;
}

/** Existing dormant dateFormat values become recognizers, while ISO remains the creation default. */
export function normalizeDateFormats(value: unknown, legacyDailyFormat?: unknown): DateFormatsConfiguration {
	const input = record(value);
	const result = {} as DateFormatsConfiguration;
	for (const kind of KINDS) {
		const group = record(input?.[kind]);
		const formats: DateFormatProfile[] = [];
		const ids = new Set<string>();
		const patterns = new Set<string>();
		for (const raw of Array.isArray(group?.formats) ? group.formats : []) {
			const item = record(raw);
			if (!item || typeof item.format !== "string" || typeof item.id !== "string") continue;
			const format = item.format.trim();
			const id = item.id.trim();
			if (!id || ids.has(id) || patterns.has(format) || !validateDateFormat(format, kind).valid) continue;
			formats.push({ id, format });
			ids.add(id);
			patterns.add(format);
		}
		const iso = DEFAULT_DATE_FORMATS[kind].formats[0]!;
		if (formats.length === 0) {
			let id = iso.id;
			while (ids.has(id)) id += "-compat";
			formats.push({ id, format: iso.format });
			ids.add(id);
			patterns.add(iso.format);
		}
		if (!group && kind === "daily" && typeof legacyDailyFormat === "string" && legacyDailyFormat &&
			!patterns.has(legacyDailyFormat.trim()) && validateDateFormat(legacyDailyFormat, kind).valid) {
			formats.push({ id: "legacy-daily", format: legacyDailyFormat.trim() });
		}
		const requestedDefault = group?.defaultFormatId;
		const defaultFormatId = typeof requestedDefault === "string" && ids.has(requestedDefault)
			? requestedDefault : formats[0]!.id;
		result[kind] = { formats, defaultFormatId };
	}
	return result;
}

export function configureDateFormats(value: DateFormatsConfiguration): void {
	const next = normalizeDateFormats(value);
	if (JSON.stringify(next) === JSON.stringify(configuration)) return;
	configuration = next;
	revision++;
	recognitionCache.clear();
	for (const listener of changeListeners) listener();
}

export function onDateFormatsChanged(listener: () => void): () => void {
	changeListeners.add(listener);
	return () => changeListeners.delete(listener);
}

export function getDateFormatsRevision(): number { return revision; }
export function getDateFormatProfiles(kind: DateFormatKind): DateFormatProfile[] {
	return configuration[kind].formats.map((profile) => ({ ...profile }));
}
export function getDefaultDateFormat(kind: DateFormatKind): DateFormatProfile {
	const group = configuration[kind];
	return group.formats.find((profile) => profile.id === group.defaultFormatId) ?? group.formats[0]!;
}

function escapeRegex(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/** Alphabetic words stay literal; brackets explicitly protect text adjacent to date tokens. */
export function tokenizeDateTemplate(value: string): Part[] | null {
	const parts: Part[] = [];
	let cursor = 0;
	while (cursor < value.length) {
		const char = value[cursor]!;
		if (char === "[") {
			const end = value.indexOf("]", cursor + 1);
			if (end < 0 || value.slice(cursor + 1, end).includes("[")) return null;
			parts.push({ literal: value.slice(cursor + 1, end) });
			cursor = end + 1;
		} else if (char === "]") {
			return null;
		} else if (/[A-Za-z]/.test(char)) {
			const word = /^[A-Za-z]+/.exec(value.slice(cursor))![0];
			if (/^(?:YYYY|MM|DD)+$/.test(word)) {
				for (const token of word.match(/YYYY|MM|DD/g) ?? []) parts.push({ token: token as Token });
			} else if (/^(?:Y+|M+|D+|W+|Q)$/.test(word)) {
				return null;
			} else {
				parts.push({ literal: word });
			}
			cursor += word.length;
		} else {
			parts.push({ literal: char });
			cursor++;
		}
	}
	return parts;
}

function compile(format: string, kind: DateFormatKind): CompiledFormat | null {
	const key = `${kind}:${format}`;
	if (compilationCache.has(key)) return compilationCache.get(key) ?? null;
	const parts = tokenizeDateTemplate(format);
	const tokens = parts?.flatMap((part) => "token" in part ? [part.token] : []) ?? [];
	const expected: Token[] = kind === "daily" ? ["YYYY", "MM", "DD"] : kind === "monthly" ? ["YYYY", "MM"] : ["YYYY"];
	const valid = Boolean(format) && !/[\\/<>:"|?*\r\n]/.test(format) && !format.includes("--") &&
		!/\.md$/i.test(format) && parts != null && tokens.length === expected.length &&
		expected.every((token) => tokens.filter((found) => found === token).length === 1);
	const result = valid && parts ? {
		parts, tokens,
		pattern: parts.map((part) => "literal" in part ? escapeRegex(part.literal) : part.token === "YYYY" ? "(\\d{4})" : "(\\d{2})").join(""),
	} : null;
	compilationCache.set(key, result);
	return result;
}

export function validateDateFormat(format: string, kind: DateFormatKind): { valid: boolean; error?: string } {
	return compile(format.trim(), kind) ? { valid: true } : { valid: false, error: "invalid-format" };
}

export function isValidIsoDate(value: string): boolean {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return false;
	const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
	const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
	const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	return year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= (days[month - 1] ?? 0);
}

function render(parts: Part[], year: number, month: number, day: number): string {
	return parts.map((part) => "literal" in part ? part.literal :
		part.token === "YYYY" ? String(year).padStart(4, "0") : part.token === "MM" ? pad(month) : pad(day)).join("");
}

export function previewDateFormat(format: string, kind: DateFormatKind, year: number, month = 1, day = 1): string | null {
	const compiled = compile(format.trim(), kind);
	if (!compiled || !isValidIsoDate(`${String(year).padStart(4, "0")}-${pad(month)}-${pad(day)}`)) return null;
	return render(compiled.parts, year, month, day);
}

export function formatDateForFilename(kind: DateFormatKind, year: number, month = 1, day = 1, format?: string): string {
	const output = previewDateFormat(format ?? getDefaultDateFormat(kind).format, kind, year, month, day);
	if (output == null) throw new Error("Invalid planner date format or date");
	return output;
}

function dateFromCaptures(compiled: CompiledFormat, captures: string[]): string | null {
	let year = 0, month = 1, day = 1;
	compiled.tokens.forEach((token, index) => {
		const value = Number(captures[index]);
		if (token === "YYYY") year = value;
		else if (token === "MM") month = value;
		else day = value;
	});
	const iso = `${String(year).padStart(4, "0")}-${pad(month)}-${pad(day)}`;
	return isValidIsoDate(iso) ? iso : null;
}

export function recognizePlannerBasename(basename: string): PlannerBasenameRecognition {
	const clean = basename.replace(/\.md$/i, "");
	const cached = recognitionCache.get(clean);
	if (cached) return cached;
	const candidates: ParsedPlannerBasename[] = [];
	for (const profile of configuration.daily.formats) {
		const compiled = compile(profile.format, "daily");
		if (!compiled) continue;
		const count = compiled.tokens.length;
		const range = new RegExp(`^${compiled.pattern}--${compiled.pattern}(?:-(.+))?$`).exec(clean);
		if (range) {
			const start = dateFromCaptures(compiled, range.slice(1, count + 1));
			const end = dateFromCaptures(compiled, range.slice(count + 1, count * 2 + 1));
			if (start && end && start <= end) candidates.push({ kind: "range", start, end, suffix: range[count * 2 + 1], formatId: profile.id, format: profile.format });
			continue;
		}
		const single = new RegExp(`^${compiled.pattern}(?:-(.+))?$`).exec(clean);
		if (!single || single[count + 1]?.startsWith("-")) continue;
		const start = dateFromCaptures(compiled, single.slice(1, count + 1));
		if (start) candidates.push({ kind: "single", start, suffix: single[count + 1], formatId: profile.id, format: profile.format });
	}
	const identities = new Set(candidates.map((item) => {
		const compiled = compile(item.format, "daily")!;
		return JSON.stringify([item.kind, item.start, item.end, item.suffix, compiled.pattern, compiled.tokens]);
	}));
	const result: PlannerBasenameRecognition = identities.size > 1 ? { status: "ambiguous" } :
		candidates[0] ? { status: "matched", value: candidates[0] } : { status: "none" };
	if (recognitionCache.size >= 10000) recognitionCache.clear();
	recognitionCache.set(clean, result);
	return result;
}

export function parsePlannerBasename(basename: string): ParsedPlannerBasename | null {
	const result = recognizePlannerBasename(basename);
	return result.status === "matched" ? result.value : null;
}

/** File objects keep their parsed result across cell renders; rename/settings changes invalidate it. */
export function parsePlannerFile(file: { basename: string }): ParsedPlannerBasename | null {
	const cached = fileRecognitionCache.get(file);
	if (cached?.basename === file.basename && cached.revision === revision) return cached.value;
	const value = parsePlannerBasename(file.basename);
	fileRecognitionCache.set(file, { basename: file.basename, revision, value });
	return value;
}

export function formatPlannerBasename(start: string, suffix?: string, end?: string, sourceFormat?: string): string {
	const formatOne = (iso: string): string => {
		if (!isValidIsoDate(iso)) throw new Error("Invalid planner date");
		const [year, month, day] = iso.split("-").map(Number);
		return formatDateForFilename("daily", year!, month, day, sourceFormat);
	};
	return `${formatOne(start)}${end ? `--${formatOne(end)}` : ""}${suffix ? `-${suffix}` : ""}`;
}

/** A generated name must remain unambiguous to every configured input format. */
export function isPlannerBasenameForDates(basename: string, start: string, end?: string): boolean {
	const parsed = parsePlannerBasename(basename);
	return parsed?.start === start && parsed.end === end;
}

/** Exact candidates for representative notes, never event suffix prefix matches. */
export function getRepresentativeBasenames(kind: DateFormatKind, year: number, month = 1, day = 1): string[] {
	return [...new Set(configuration[kind].formats.map((profile) => formatDateForFilename(kind, year, month, day, profile.format)))];
}

/** Period notes match the whole basename; daily event suffixes never enter this parser. */
export function recognizeRepresentativeBasename(kind: DateFormatKind, basename: string):
	{ status: "matched"; date: string; formatId: string; format: string } | { status: "none" | "ambiguous" } {
	const clean = basename.replace(/\.md$/i, "");
	const candidates: Array<{ date: string; structure: string; profile: DateFormatProfile }> = [];
	for (const profile of configuration[kind].formats) {
		const compiled = compile(profile.format, kind)!;
		const match = new RegExp(`^${compiled.pattern}$`).exec(clean);
		if (!match) continue;
		const date = dateFromCaptures(compiled, match.slice(1));
		if (date) candidates.push({ date, structure: JSON.stringify([compiled.pattern, compiled.tokens]), profile });
	}
	const identities = new Set(candidates.map((candidate) => `${candidate.date}:${candidate.structure}`));
	return identities.size > 1 ? { status: "ambiguous" } : candidates[0]
		? { status: "matched", date: candidates[0].date, formatId: candidates[0].profile.id, format: candidates[0].profile.format } : { status: "none" };
}

export function isRepresentativeBasenameForPeriod(kind: DateFormatKind, basename: string, year: number, month = 1, day = 1): boolean {
	const result = recognizeRepresentativeBasename(kind, basename);
	const expected = `${String(year).padStart(4, "0")}-${pad(kind === "yearly" ? 1 : month)}-${pad(kind === "daily" ? day : 1)}`;
	return result.status === "matched" && result.date === expected;
}
