import KoreanLunarCalendar from "korean-lunar-calendar";
import { getIntlLocaleTag, normalizeLocale } from "../i18n";
import type { Locale } from "../i18n";

export type AlternateCalendarId =
	| "korean-lunar"
	| "chinese"
	| "dangi"
	| "hebrew"
	| "islamic"
	| "islamic-civil"
	| "islamic-umalqura"
	| "persian"
	| "indian"
	| "buddhist"
	| "japanese"
	| "roc"
	| "coptic"
	| "ethiopic";

export type AlternateCalendarSelection = AlternateCalendarId | "";

interface CalendarOptionText {
	name: string;
	shortName: string;
	description: string;
}

type AlternateCalendarTextLocale = "en" | "ko" | "de";

export interface AlternateCalendarOption {
	id: AlternateCalendarId;
	intlCalendar?: string;
	text: Record<AlternateCalendarTextLocale, CalendarOptionText>;
}

export interface AlternateCalendarLabel {
	id: AlternateCalendarId;
	name: string;
	text: string;
}

interface KoreanLunarDate {
	year: number;
	month: number;
	day: number;
	isLeapMonth: boolean;
}

const MIN_SUPPORTED_KOREAN_LUNAR_SOLAR = 10000213;
const MAX_SUPPORTED_KOREAN_LUNAR_SOLAR = 20501231;

export const ALTERNATE_CALENDAR_OPTIONS: readonly AlternateCalendarOption[] = [
	{
		id: "korean-lunar",
		text: {
			en: {
				name: "Korean lunar",
				shortName: "K lunar",
				description: "Korean lunar calendar based on KARI data.",
			},
			ko: {
				name: "한국식 음력",
				shortName: "음력",
				description: "한국천문연구원 기준의 한국식 음력입니다.",
			},
			de: {
				name: "Koreanischer Mondkalender",
				shortName: "Koreanisch",
				description: "Koreanischer Mondkalender auf Basis der KARI-Daten.",
			},
		},
	},
	{
		id: "chinese",
		intlCalendar: "chinese",
		text: {
			en: {
				name: "Chinese lunar",
				shortName: "Chinese",
				description: "Chinese lunar calendar from the browser Intl data.",
			},
			ko: {
				name: "중국식 음력",
				shortName: "중국",
				description: "브라우저 Intl 데이터의 중국식 음력입니다.",
			},
			de: {
				name: "Chinesischer Mondkalender",
				shortName: "Chinesisch",
				description: "Chinesischer Mondkalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "dangi",
		intlCalendar: "dangi",
		text: {
			en: {
				name: "Dangi",
				shortName: "Dangi",
				description: "Korean Dangi calendar from the browser Intl data.",
			},
			ko: {
				name: "단기",
				shortName: "단기",
				description: "브라우저 Intl 데이터의 단기 달력입니다.",
			},
			de: {
				name: "Dangi",
				shortName: "Dangi",
				description: "Koreanischer Dangi-Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "hebrew",
		intlCalendar: "hebrew",
		text: {
			en: {
				name: "Hebrew",
				shortName: "Hebrew",
				description: "Hebrew calendar from the browser Intl data.",
			},
			ko: {
				name: "히브리력",
				shortName: "히브리",
				description: "브라우저 Intl 데이터의 히브리력입니다.",
			},
			de: {
				name: "Hebräisch",
				shortName: "Hebräisch",
				description: "Hebräischer Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "islamic",
		intlCalendar: "islamic",
		text: {
			en: {
				name: "Islamic",
				shortName: "Islamic",
				description: "Islamic calendar from the browser Intl data.",
			},
			ko: {
				name: "이슬람력",
				shortName: "이슬람",
				description: "브라우저 Intl 데이터의 이슬람력입니다.",
			},
			de: {
				name: "Islamisch",
				shortName: "Islamisch",
				description: "Islamischer Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "islamic-civil",
		intlCalendar: "islamic-civil",
		text: {
			en: {
				name: "Islamic civil",
				shortName: "Civil",
				description: "Tabular Islamic civil calendar from the browser Intl data.",
			},
			ko: {
				name: "이슬람 시민력",
				shortName: "시민력",
				description: "브라우저 Intl 데이터의 표 형식 이슬람 시민력입니다.",
			},
			de: {
				name: "Islamischer Zivilkalender",
				shortName: "Zivil",
				description:
					"Tabellarischer islamischer Zivilkalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "islamic-umalqura",
		intlCalendar: "islamic-umalqura",
		text: {
			en: {
				name: "Islamic Umm al-Qura",
				shortName: "Umm al-Qura",
				description: "Umm al-Qura calendar from the browser Intl data.",
			},
			ko: {
				name: "이슬람 움 알쿠라력",
				shortName: "움알쿠라",
				description: "브라우저 Intl 데이터의 움 알쿠라력입니다.",
			},
			de: {
				name: "Islamisch Umm al-Qura",
				shortName: "Umm al-Qura",
				description: "Umm-al-Qura-Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "persian",
		intlCalendar: "persian",
		text: {
			en: {
				name: "Persian",
				shortName: "Persian",
				description: "Persian calendar from the browser Intl data.",
			},
			ko: {
				name: "페르시아력",
				shortName: "페르시아",
				description: "브라우저 Intl 데이터의 페르시아력입니다.",
			},
			de: {
				name: "Persisch",
				shortName: "Persisch",
				description: "Persischer Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "indian",
		intlCalendar: "indian",
		text: {
			en: {
				name: "Indian national",
				shortName: "Indian",
				description: "Indian national calendar from the browser Intl data.",
			},
			ko: {
				name: "인도 국민력",
				shortName: "인도",
				description: "브라우저 Intl 데이터의 인도 국민력입니다.",
			},
			de: {
				name: "Indischer Nationalkalender",
				shortName: "Indisch",
				description:
					"Indischer Nationalkalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "buddhist",
		intlCalendar: "buddhist",
		text: {
			en: {
				name: "Buddhist",
				shortName: "Buddhist",
				description: "Buddhist calendar from the browser Intl data.",
			},
			ko: {
				name: "불기",
				shortName: "불기",
				description: "브라우저 Intl 데이터의 불교 달력입니다.",
			},
			de: {
				name: "Buddhistisch",
				shortName: "Buddhistisch",
				description: "Buddhistischer Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "japanese",
		intlCalendar: "japanese",
		text: {
			en: {
				name: "Japanese era",
				shortName: "Japanese",
				description: "Japanese era calendar from the browser Intl data.",
			},
			ko: {
				name: "일본 연호",
				shortName: "일본",
				description: "브라우저 Intl 데이터의 일본 연호 달력입니다.",
			},
			de: {
				name: "Japanische Ära",
				shortName: "Japanisch",
				description:
					"Japanischer Ära-Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "roc",
		intlCalendar: "roc",
		text: {
			en: {
				name: "Minguo",
				shortName: "Minguo",
				description: "Republic of China calendar from the browser Intl data.",
			},
			ko: {
				name: "민국력",
				shortName: "민국",
				description: "브라우저 Intl 데이터의 중화민국 달력입니다.",
			},
			de: {
				name: "Minguo",
				shortName: "Minguo",
				description:
					"Kalender der Republik China aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "coptic",
		intlCalendar: "coptic",
		text: {
			en: {
				name: "Coptic",
				shortName: "Coptic",
				description: "Coptic calendar from the browser Intl data.",
			},
			ko: {
				name: "콥트력",
				shortName: "콥트",
				description: "브라우저 Intl 데이터의 콥트력입니다.",
			},
			de: {
				name: "Koptisch",
				shortName: "Koptisch",
				description: "Koptischer Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
	{
		id: "ethiopic",
		intlCalendar: "ethiopic",
		text: {
			en: {
				name: "Ethiopic",
				shortName: "Ethiopic",
				description: "Ethiopic calendar from the browser Intl data.",
			},
			ko: {
				name: "에티오피아력",
				shortName: "에티오피아",
				description: "브라우저 Intl 데이터의 에티오피아력입니다.",
			},
			de: {
				name: "Äthiopisch",
				shortName: "Äthiopisch",
				description: "Äthiopischer Kalender aus den Intl-Daten des Browsers.",
			},
		},
	},
];

const alternateCalendarIds = new Set(
	ALTERNATE_CALENDAR_OPTIONS.map((option) => option.id),
);
const optionsById = new Map(
	ALTERNATE_CALENDAR_OPTIONS.map((option) => [option.id, option]),
);
const koreanLunarCache = new Map<string, KoreanLunarDate | null>();
const intlLabelCache = new Map<string, string | null>();
const formatterCache = new Map<string, Intl.DateTimeFormat | null>();

export function normalizeAlternateCalendarId(
	id: unknown,
	legacyIds?: unknown,
	legacyShowLunarDates?: boolean,
): AlternateCalendarSelection {
	if (
		typeof id === "string" &&
		alternateCalendarIds.has(id as AlternateCalendarId)
	) {
		return id as AlternateCalendarId;
	}
	return normalizeAlternateCalendarIds(legacyIds, legacyShowLunarDates)[0] ?? "";
}

function normalizeAlternateCalendarIds(
	ids: unknown,
	legacyShowLunarDates?: boolean,
): AlternateCalendarId[] {
	const normalized: AlternateCalendarId[] = [];
	if (Array.isArray(ids)) {
		for (const id of ids) {
			if (
				typeof id === "string" &&
				alternateCalendarIds.has(id as AlternateCalendarId) &&
				!normalized.includes(id as AlternateCalendarId)
			) {
				normalized.push(id as AlternateCalendarId);
			}
		}
	}
	if (normalized.length === 0 && legacyShowLunarDates === true) {
		normalized.push("korean-lunar");
	}
	return normalized;
}

export function getAlternateCalendarLabel(
	year: number,
	month: number,
	day: number,
	id: AlternateCalendarSelection | undefined,
	locale: string,
): AlternateCalendarLabel | null {
	if (!id) return null;
	const resolvedLocale = resolveLocale(locale);
	const textLocale = resolveTextLocale(resolvedLocale);
	const option = optionsById.get(id);
	if (!option) return null;
	const text =
		id === "korean-lunar"
			? formatKoreanLunarLabel(getKoreanLunarDate(year, month, day))
			: formatIntlCalendarLabel(option, year, month, day, resolvedLocale);
	if (!text) return null;
	return {
		id,
		name: option.text[textLocale].name,
		text,
	};
}

export function getAlternateCalendarOptionText(
	option: AlternateCalendarOption,
	locale: string,
): CalendarOptionText {
	return option.text[resolveTextLocale(locale)];
}

export function formatAlternateCalendarAria(
	label: AlternateCalendarLabel | null,
): string {
	if (!label) return "";
	return ` (${label.name}: ${label.text})`;
}

function getKoreanLunarDate(
	year: number,
	month: number,
	day: number,
): KoreanLunarDate | null {
	const key = `${year}-${month}-${day}`;
	if (koreanLunarCache.has(key)) return koreanLunarCache.get(key) ?? null;

	const lunar = resolveKoreanLunarDate(year, month, day);
	koreanLunarCache.set(key, lunar);
	return lunar;
}

function formatKoreanLunarLabel(lunar: KoreanLunarDate | null): string {
	if (!lunar) return "";
	const prefix = lunar.isLeapMonth ? "윤" : "음";
	return `${prefix} ${lunar.month}.${lunar.day}`;
}

function resolveKoreanLunarDate(
	year: number,
	month: number,
	day: number,
): KoreanLunarDate | null {
	if (!isSupportedKoreanLunarSolarDate(year, month, day)) return null;

	const calendar = new KoreanLunarCalendar();
	if (!calendar.setSolarDate(year, month, day)) return null;

	const lunar = calendar.getLunarCalendar();
	return {
		year: lunar.year,
		month: lunar.month,
		day: lunar.day,
		isLeapMonth: lunar.intercalation === true,
	};
}

function formatIntlCalendarLabel(
	option: AlternateCalendarOption,
	year: number,
	month: number,
	day: number,
	locale: Locale,
): string {
	if (!option.intlCalendar) return "";
	if (!isValidSolarDate(year, month, day)) return "";

	const cacheKey = `${locale}|${option.id}|${year}-${month}-${day}`;
	if (intlLabelCache.has(cacheKey)) return intlLabelCache.get(cacheKey) ?? "";

	const formatter = getFormatter(locale, option.intlCalendar);
	const date = new Date(year, month - 1, day);
	const textLocale = resolveTextLocale(locale);
	const label = formatter
		? `${option.text[textLocale].shortName} ${normalizeFormattedDate(formatter.format(date))}`
		: "";
	intlLabelCache.set(cacheKey, label || null);
	return label;
}

function getFormatter(
	locale: Locale,
	intlCalendar: string,
): Intl.DateTimeFormat | null {
	const localeTag = getIntlLocaleTag(locale);
	const cacheKey = `${localeTag}|${intlCalendar}`;
	if (formatterCache.has(cacheKey)) return formatterCache.get(cacheKey) ?? null;

	let formatter: Intl.DateTimeFormat | null = null;
	try {
		const next = new Intl.DateTimeFormat(`${localeTag}-u-ca-${intlCalendar}`, {
			year: "numeric",
			month: "numeric",
			day: "numeric",
		});
		if (next.resolvedOptions().calendar === intlCalendar) {
			formatter = next;
		}
	} catch {
		formatter = null;
	}
	formatterCache.set(cacheKey, formatter);
	return formatter;
}

function normalizeFormattedDate(formatted: string): string {
	return formatted
		.replace(/\s+/g, " ")
		.replace(/\.\s*/g, ".")
		.replace(/\.$/, "")
		.trim();
}

function resolveLocale(locale: string): Locale {
	return normalizeLocale(locale);
}

function resolveTextLocale(locale: string): AlternateCalendarTextLocale {
	if (locale === "ko" || locale === "de") return locale;
	return "en";
}

function isSupportedKoreanLunarSolarDate(
	year: number,
	month: number,
	day: number,
): boolean {
	if (!isValidSolarDate(year, month, day)) return false;
	const value = year * 10000 + month * 100 + day;
	return (
		value >= MIN_SUPPORTED_KOREAN_LUNAR_SOLAR &&
		value <= MAX_SUPPORTED_KOREAN_LUNAR_SOLAR
	);
}

function isValidSolarDate(year: number, month: number, day: number): boolean {
	if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
		return false;
	}
	const date = new Date(year, month - 1, day);
	return (
		date.getFullYear() === year &&
		date.getMonth() === month - 1 &&
		date.getDate() === day
	);
}
