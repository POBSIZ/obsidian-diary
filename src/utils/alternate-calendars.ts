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
type AlternateCalendarOverrideLocale = Exclude<Locale, AlternateCalendarTextLocale>;

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

const ALTERNATE_CALENDAR_TEXT_OVERRIDES: Record<
	AlternateCalendarOverrideLocale,
	Record<AlternateCalendarId, CalendarOptionText>
> = {
	es: {
		"korean-lunar": {
			name: "Calendario lunar coreano",
			shortName: "Lunar coreano",
			description: "Calendario lunar coreano basado en datos de KARI.",
		},
		chinese: {
			name: "Calendario lunar chino",
			shortName: "Chino",
			description: "Calendario lunar chino a partir de los datos Intl del navegador.",
		},
		dangi: {
			name: "Dangi",
			shortName: "Dangi",
			description: "Calendario Dangi coreano a partir de los datos Intl del navegador.",
		},
		hebrew: {
			name: "Calendario hebreo",
			shortName: "Hebreo",
			description: "Calendario hebreo a partir de los datos Intl del navegador.",
		},
		islamic: {
			name: "Calendario islámico",
			shortName: "Islámico",
			description: "Calendario islámico a partir de los datos Intl del navegador.",
		},
		"islamic-civil": {
			name: "Calendario islámico civil",
			shortName: "Civil",
			description:
				"Calendario islámico civil tabular a partir de los datos Intl del navegador.",
		},
		"islamic-umalqura": {
			name: "Calendario Umm al-Qura",
			shortName: "Umm al-Qura",
			description: "Calendario Umm al-Qura a partir de los datos Intl del navegador.",
		},
		persian: {
			name: "Calendario persa",
			shortName: "Persa",
			description: "Calendario persa a partir de los datos Intl del navegador.",
		},
		indian: {
			name: "Calendario nacional indio",
			shortName: "Indio",
			description:
				"Calendario nacional indio a partir de los datos Intl del navegador.",
		},
		buddhist: {
			name: "Calendario budista",
			shortName: "Budista",
			description: "Calendario budista a partir de los datos Intl del navegador.",
		},
		japanese: {
			name: "Calendario de era japonesa",
			shortName: "Japonés",
			description:
				"Calendario de era japonesa a partir de los datos Intl del navegador.",
		},
		roc: {
			name: "Calendario Minguo",
			shortName: "Minguo",
			description:
				"Calendario de la República de China a partir de los datos Intl del navegador.",
		},
		coptic: {
			name: "Calendario copto",
			shortName: "Copto",
			description: "Calendario copto a partir de los datos Intl del navegador.",
		},
		ethiopic: {
			name: "Calendario etíope",
			shortName: "Etíope",
			description: "Calendario etíope a partir de los datos Intl del navegador.",
		},
	},
	fr: {
		"korean-lunar": {
			name: "Calendrier lunaire coréen",
			shortName: "Lunaire coréen",
			description: "Calendrier lunaire coréen basé sur les données KARI.",
		},
		chinese: {
			name: "Calendrier lunaire chinois",
			shortName: "Chinois",
			description:
				"Calendrier lunaire chinois issu des données Intl du navigateur.",
		},
		dangi: {
			name: "Dangi",
			shortName: "Dangi",
			description: "Calendrier Dangi coréen issu des données Intl du navigateur.",
		},
		hebrew: {
			name: "Calendrier hébraïque",
			shortName: "Hébraïque",
			description: "Calendrier hébraïque issu des données Intl du navigateur.",
		},
		islamic: {
			name: "Calendrier islamique",
			shortName: "Islamique",
			description: "Calendrier islamique issu des données Intl du navigateur.",
		},
		"islamic-civil": {
			name: "Calendrier islamique civil",
			shortName: "Civil",
			description:
				"Calendrier islamique civil tabulaire issu des données Intl du navigateur.",
		},
		"islamic-umalqura": {
			name: "Calendrier Umm al-Qura",
			shortName: "Umm al-Qura",
			description: "Calendrier Umm al-Qura issu des données Intl du navigateur.",
		},
		persian: {
			name: "Calendrier persan",
			shortName: "Persan",
			description: "Calendrier persan issu des données Intl du navigateur.",
		},
		indian: {
			name: "Calendrier national indien",
			shortName: "Indien",
			description: "Calendrier national indien issu des données Intl du navigateur.",
		},
		buddhist: {
			name: "Calendrier bouddhique",
			shortName: "Bouddhique",
			description: "Calendrier bouddhique issu des données Intl du navigateur.",
		},
		japanese: {
			name: "Calendrier des ères japonaises",
			shortName: "Japonais",
			description:
				"Calendrier des ères japonaises issu des données Intl du navigateur.",
		},
		roc: {
			name: "Calendrier Minguo",
			shortName: "Minguo",
			description:
				"Calendrier de la République de Chine issu des données Intl du navigateur.",
		},
		coptic: {
			name: "Calendrier copte",
			shortName: "Copte",
			description: "Calendrier copte issu des données Intl du navigateur.",
		},
		ethiopic: {
			name: "Calendrier éthiopien",
			shortName: "Éthiopien",
			description: "Calendrier éthiopien issu des données Intl du navigateur.",
		},
	},
	ja: {
		"korean-lunar": {
			name: "韓国の旧暦",
			shortName: "韓国旧暦",
			description: "KARI データに基づく韓国の旧暦です。",
		},
		chinese: {
			name: "中国の旧暦",
			shortName: "中国旧暦",
			description: "ブラウザーの Intl データによる中国の旧暦です。",
		},
		dangi: {
			name: "檀紀",
			shortName: "檀紀",
			description: "ブラウザーの Intl データによる韓国の檀紀暦です。",
		},
		hebrew: {
			name: "ヘブライ暦",
			shortName: "ヘブライ",
			description: "ブラウザーの Intl データによるヘブライ暦です。",
		},
		islamic: {
			name: "イスラム暦",
			shortName: "イスラム",
			description: "ブラウザーの Intl データによるイスラム暦です。",
		},
		"islamic-civil": {
			name: "イスラム常用暦",
			shortName: "常用暦",
			description: "ブラウザーの Intl データによる表形式のイスラム常用暦です。",
		},
		"islamic-umalqura": {
			name: "ウンム・アル＝クラー暦",
			shortName: "ウンム・アル＝クラー",
			description: "ブラウザーの Intl データによるウンム・アル＝クラー暦です。",
		},
		persian: {
			name: "ペルシア暦",
			shortName: "ペルシア",
			description: "ブラウザーの Intl データによるペルシア暦です。",
		},
		indian: {
			name: "インド国定暦",
			shortName: "インド",
			description: "ブラウザーの Intl データによるインド国定暦です。",
		},
		buddhist: {
			name: "仏暦",
			shortName: "仏暦",
			description: "ブラウザーの Intl データによる仏教暦です。",
		},
		japanese: {
			name: "和暦",
			shortName: "和暦",
			description: "ブラウザーの Intl データによる日本の元号暦です。",
		},
		roc: {
			name: "民国暦",
			shortName: "民国",
			description: "ブラウザーの Intl データによる中華民国暦です。",
		},
		coptic: {
			name: "コプト暦",
			shortName: "コプト",
			description: "ブラウザーの Intl データによるコプト暦です。",
		},
		ethiopic: {
			name: "エチオピア暦",
			shortName: "エチオピア",
			description: "ブラウザーの Intl データによるエチオピア暦です。",
		},
	},
	"zh-CN": {
		"korean-lunar": {
			name: "韩国农历",
			shortName: "韩国农历",
			description: "基于韩国天文研究院数据的韩国农历。",
		},
		chinese: {
			name: "中国农历",
			shortName: "农历",
			description: "基于浏览器 Intl 数据的中国农历。",
		},
		dangi: {
			name: "檀纪",
			shortName: "檀纪",
			description: "基于浏览器 Intl 数据的韩国檀纪历。",
		},
		hebrew: {
			name: "希伯来历",
			shortName: "希伯来",
			description: "基于浏览器 Intl 数据的希伯来历。",
		},
		islamic: {
			name: "伊斯兰历",
			shortName: "伊斯兰",
			description: "基于浏览器 Intl 数据的伊斯兰历。",
		},
		"islamic-civil": {
			name: "伊斯兰民用历",
			shortName: "民用历",
			description: "基于浏览器 Intl 数据的表格式伊斯兰民用历。",
		},
		"islamic-umalqura": {
			name: "乌姆库拉历",
			shortName: "乌姆库拉",
			description: "基于浏览器 Intl 数据的乌姆库拉历。",
		},
		persian: {
			name: "波斯历",
			shortName: "波斯",
			description: "基于浏览器 Intl 数据的波斯历。",
		},
		indian: {
			name: "印度国定历",
			shortName: "印度",
			description: "基于浏览器 Intl 数据的印度国定历。",
		},
		buddhist: {
			name: "佛历",
			shortName: "佛历",
			description: "基于浏览器 Intl 数据的佛教历。",
		},
		japanese: {
			name: "日本年号",
			shortName: "日本",
			description: "基于浏览器 Intl 数据的日本年号历。",
		},
		roc: {
			name: "民国纪年",
			shortName: "民国",
			description: "基于浏览器 Intl 数据的中华民国历。",
		},
		coptic: {
			name: "科普特历",
			shortName: "科普特",
			description: "基于浏览器 Intl 数据的科普特历。",
		},
		ethiopic: {
			name: "埃塞俄比亚历",
			shortName: "埃塞俄比亚",
			description: "基于浏览器 Intl 数据的埃塞俄比亚历。",
		},
	},
	"zh-TW": {
		"korean-lunar": {
			name: "韓國農曆",
			shortName: "韓國農曆",
			description: "基於韓國天文研究院資料的韓國農曆。",
		},
		chinese: {
			name: "中國農曆",
			shortName: "農曆",
			description: "基於瀏覽器 Intl 資料的中國農曆。",
		},
		dangi: {
			name: "檀紀",
			shortName: "檀紀",
			description: "基於瀏覽器 Intl 資料的韓國檀紀曆。",
		},
		hebrew: {
			name: "希伯來曆",
			shortName: "希伯來",
			description: "基於瀏覽器 Intl 資料的希伯來曆。",
		},
		islamic: {
			name: "伊斯蘭曆",
			shortName: "伊斯蘭",
			description: "基於瀏覽器 Intl 資料的伊斯蘭曆。",
		},
		"islamic-civil": {
			name: "伊斯蘭民用曆",
			shortName: "民用曆",
			description: "基於瀏覽器 Intl 資料的表格式伊斯蘭民用曆。",
		},
		"islamic-umalqura": {
			name: "烏姆庫拉曆",
			shortName: "烏姆庫拉",
			description: "基於瀏覽器 Intl 資料的烏姆庫拉曆。",
		},
		persian: {
			name: "波斯曆",
			shortName: "波斯",
			description: "基於瀏覽器 Intl 資料的波斯曆。",
		},
		indian: {
			name: "印度國定曆",
			shortName: "印度",
			description: "基於瀏覽器 Intl 資料的印度國定曆。",
		},
		buddhist: {
			name: "佛曆",
			shortName: "佛曆",
			description: "基於瀏覽器 Intl 資料的佛教曆。",
		},
		japanese: {
			name: "日本年號",
			shortName: "日本",
			description: "基於瀏覽器 Intl 資料的日本年號曆。",
		},
		roc: {
			name: "民國紀年",
			shortName: "民國",
			description: "基於瀏覽器 Intl 資料的中華民國曆。",
		},
		coptic: {
			name: "科普特曆",
			shortName: "科普特",
			description: "基於瀏覽器 Intl 資料的科普特曆。",
		},
		ethiopic: {
			name: "衣索比亞曆",
			shortName: "衣索比亞",
			description: "基於瀏覽器 Intl 資料的衣索比亞曆。",
		},
	},
};

const ALTERNATE_CALENDAR_OVERRIDE_LOCALES = new Set<Locale>(
	Object.keys(
		ALTERNATE_CALENDAR_TEXT_OVERRIDES,
	) as AlternateCalendarOverrideLocale[],
);

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
	const option = optionsById.get(id);
	if (!option) return null;
	const optionText = getAlternateCalendarOptionText(option, resolvedLocale);
	const text =
		id === "korean-lunar"
			? formatKoreanLunarLabel(getKoreanLunarDate(year, month, day))
			: formatIntlCalendarLabel(option, year, month, day, resolvedLocale);
	if (!text) return null;
	return {
		id,
		name: optionText.name,
		text,
	};
}

export function getAlternateCalendarOptionText(
	option: AlternateCalendarOption,
	locale: string,
): CalendarOptionText {
	const normalized = normalizeLocale(locale);
	if (isAlternateCalendarOverrideLocale(normalized)) {
		return ALTERNATE_CALENDAR_TEXT_OVERRIDES[normalized][option.id];
	}
	return option.text[resolveTextLocale(normalized)];
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
	const optionText = getAlternateCalendarOptionText(option, locale);
	const label = formatter
		? `${optionText.shortName} ${normalizeFormattedDate(formatter.format(date))}`
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

function isAlternateCalendarOverrideLocale(
	locale: Locale,
): locale is AlternateCalendarOverrideLocale {
	return ALTERNATE_CALENDAR_OVERRIDE_LOCALES.has(locale);
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
