import de from "../locales/de.json";
import en from "../locales/en.json";
import es from "../locales/es.json";
import fr from "../locales/fr.json";
import ja from "../locales/ja.json";
import ko from "../locales/ko.json";
import zhCn from "../locales/zh-CN.json";
import zhTw from "../locales/zh-TW.json";

export const SUPPORTED_LOCALES = [
	"en",
	"de",
	"es",
	"fr",
	"ja",
	"zh-CN",
	"zh-TW",
	"ko",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_OPTIONS: readonly { value: Locale; label: string }[] = [
	{ value: "en", label: "English" },
	{ value: "de", label: "Deutsch" },
	{ value: "es", label: "Español" },
	{ value: "fr", label: "Français" },
	{ value: "ja", label: "日本語" },
	{ value: "zh-CN", label: "简体中文" },
	{ value: "zh-TW", label: "繁體中文" },
	{ value: "ko", label: "한국어" },
];

const LOCALES: Record<Locale, Record<string, string>> = {
	en,
	de,
	es,
	fr,
	ja,
	"zh-CN": zhCn,
	"zh-TW": zhTw,
	ko,
};

const SUPPORTED_LOCALE_SET = new Set<string>(SUPPORTED_LOCALES);

const LOCALE_LABELS: Record<
	Locale,
	{
		intlLocale: string;
		months: readonly string[];
		weekdays: readonly string[];
		weekend: { sat: string; sun: string };
	}
> = {
	en: {
		intlLocale: "en-US",
		months: [
			"Jan", "Feb", "Mar", "Apr", "May", "Jun",
			"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		],
		weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		weekend: { sat: "Sat", sun: "Sun" },
	},
	de: {
		intlLocale: "de-DE",
		months: [
			"Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
			"Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
		],
		weekdays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
		weekend: { sat: "Sa", sun: "So" },
	},
	es: {
		intlLocale: "es-ES",
		months: [
			"Ene", "Feb", "Mar", "Abr", "May", "Jun",
			"Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
		],
		weekdays: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
		weekend: { sat: "Sáb", sun: "Dom" },
	},
	fr: {
		intlLocale: "fr-FR",
		months: [
			"janv.", "févr.", "mars", "avr.", "mai", "juin",
			"juil.", "août", "sept.", "oct.", "nov.", "déc.",
		],
		weekdays: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
		weekend: { sat: "sam.", sun: "dim." },
	},
	ja: {
		intlLocale: "ja-JP",
		months: [
			"1月", "2月", "3月", "4月", "5月", "6月",
			"7月", "8月", "9月", "10月", "11月", "12月",
		],
		weekdays: ["日", "月", "火", "水", "木", "金", "土"],
		weekend: { sat: "土", sun: "日" },
	},
	"zh-CN": {
		intlLocale: "zh-CN",
		months: [
			"1月", "2月", "3月", "4月", "5月", "6月",
			"7月", "8月", "9月", "10月", "11月", "12月",
		],
		weekdays: ["日", "一", "二", "三", "四", "五", "六"],
		weekend: { sat: "六", sun: "日" },
	},
	"zh-TW": {
		intlLocale: "zh-TW",
		months: [
			"1月", "2月", "3月", "4月", "5月", "6月",
			"7月", "8月", "9月", "10月", "11月", "12月",
		],
		weekdays: ["日", "一", "二", "三", "四", "五", "六"],
		weekend: { sat: "六", sun: "日" },
	},
	ko: {
		intlLocale: "ko-KR",
		months: [
			"1", "2", "3", "4", "5", "6",
			"7", "8", "9", "10", "11", "12",
		],
		weekdays: ["일", "월", "화", "수", "목", "금", "토"],
		weekend: { sat: "토", sun: "일" },
	},
};

let currentLocale: Locale = "en";

export function normalizeLocale(locale: unknown): Locale {
	return typeof locale === "string" && SUPPORTED_LOCALE_SET.has(locale)
		? (locale as Locale)
		: "en";
}

export function setLocale(locale: string): void {
	currentLocale = normalizeLocale(locale);
}

export function getLocale(): Locale {
	return currentLocale;
}

export function t(
	key: string,
	params?: Record<string, string | number>,
): string {
	const dict = LOCALES[currentLocale];
	const fallback = LOCALES.en[key] ?? key;
	let value = dict[key] ?? fallback;

	if (params) {
		value = interpolate(value, params);
	}

	return value;
}

export function getIntlLocaleTag(locale: string): string {
	return LOCALE_LABELS[normalizeLocale(locale)].intlLocale;
}

export function getMonthLabel(locale: string, month: number): string {
	const labels = getMonthLabels(locale);
	return labels[month - 1] ?? String(month);
}

export function getMonthLabels(locale: string): readonly string[] {
	return LOCALE_LABELS[normalizeLocale(locale)].months;
}

export function getWeekdayLabels(locale: string): readonly string[] {
	return LOCALE_LABELS[normalizeLocale(locale)].weekdays;
}

export function getWeekendLabels(locale: string): { sat: string; sun: string } {
	return LOCALE_LABELS[normalizeLocale(locale)].weekend;
}

export function formatDateForLocale(
	year: number,
	month: number,
	day: number,
	locale: string = currentLocale,
): string {
	const normalized = normalizeLocale(locale);
	const dict = LOCALES[normalized];
	const template =
		dict[`dateFormat.${normalized}`] ??
		LOCALES.en["dateFormat.en"] ??
		"{month}/{day}/{year}";
	return interpolate(template, { year, month, day });
}

function interpolate(
	value: string,
	params: Record<string, string | number>,
): string {
	let next = value;
	for (const [k, v] of Object.entries(params)) {
		next = next.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
	}
	return next;
}
