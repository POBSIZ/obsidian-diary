type ConstructorPrototype<T> = {
	prototype: T;
};

interface DomElementInfo {
	cls?: string | string[];
	text?: string | DocumentFragment;
	attr?: Record<string, string | number | boolean | null>;
	title?: string;
	parent?: Node;
	value?: string;
	type?: string;
	prepend?: boolean;
	placeholder?: string;
	href?: string;
}

interface SvgElementInfo {
	cls?: string | string[];
	attr?: Record<string, string | number | boolean | null>;
	parent?: Node;
	prepend?: boolean;
}

interface Node {
	empty(): void;
	appendText(val: string): void;
	createEl<K extends keyof HTMLElementTagNameMap>(
		tag: K,
		o?: DomElementInfo | string,
		callback?: (el: HTMLElementTagNameMap[K]) => void,
	): HTMLElementTagNameMap[K];
	createDiv(
		o?: DomElementInfo | string,
		callback?: (el: HTMLDivElement) => void,
	): HTMLDivElement;
	createSpan(
		o?: DomElementInfo | string,
		callback?: (el: HTMLSpanElement) => void,
	): HTMLSpanElement;
	createSvg<K extends keyof SVGElementTagNameMap>(
		tag: K,
		o?: SvgElementInfo | string,
		callback?: (el: SVGElementTagNameMap[K]) => void,
	): SVGElementTagNameMap[K];
}

interface Element {
	setText(val: string | DocumentFragment): void;
	addClass(...classes: string[]): void;
	removeClass(...classes: string[]): void;
	toggleClass(classes: string | string[], value: boolean): void;
	setCssProps(props: Record<string, string>): void;
}

interface HTMLElement {
	hide(): void;
	show(): void;
	toggleVisibility(visible: boolean): void;
}

declare module "obsidian" {
	export type EventRef = unknown;

	export interface ViewState {
		type: string;
		state?: Record<string, unknown>;
		active?: boolean;
	}

	export class TAbstractFile {
		path: string;
		name: string;
		parent: TFolder | null;
	}

	export class TFile extends TAbstractFile {
		basename: string;
		extension: string;
	}

	export class TFolder extends TAbstractFile {
		children: TAbstractFile[];
		isRoot(): boolean;
	}

	export interface CachedMetadata {
		frontmatter?: Record<string, unknown>;
		headings?: Array<{ heading: string; level: number; position?: unknown }>;
	}

	export interface MetadataCache {
		getFileCache(file: TFile): CachedMetadata | null;
		on(
			name: "changed",
			callback: (
				file: TFile,
				data: string,
				cache: CachedMetadata,
			) => unknown,
		): EventRef;
	}

	export interface Vault {
		getMarkdownFiles(): TFile[];
		getRoot(): TFolder;
		getAbstractFileByPath(path: string): TAbstractFile | null;
		read(file: TFile): Promise<string>;
		create(path: string, data: string): Promise<TFile>;
		createFolder(path: string): Promise<void>;
		rename(file: TAbstractFile, newPath: string): Promise<void>;
		on(name: "create", callback: (file: TAbstractFile) => unknown): EventRef;
		on(name: "delete", callback: (file: TAbstractFile) => unknown): EventRef;
		on(
			name: "rename",
			callback: (file: TAbstractFile, oldPath: string) => unknown,
		): EventRef;
	}

	export interface FileManager {
		processFrontMatter(
			file: TFile,
			callback: (frontmatter: Record<string, unknown>) => unknown,
		): Promise<void>;
		trashFile(file: TFile): Promise<void>;
	}

	export interface RequestUrlParam {
		url: string;
		method?: string;
		headers?: Record<string, string>;
		body?: string | ArrayBuffer;
		throw?: boolean;
		contentType?: string;
	}

	export interface RequestUrlResponse {
		status: number;
		headers: Record<string, string>;
		text: string;
		arrayBuffer: ArrayBuffer;
		json: unknown;
	}

	export function requestUrl(
		request: RequestUrlParam | string,
	): Promise<RequestUrlResponse>;

	export interface Workspace {
		containerEl: HTMLElement;
		rootSplit: unknown;
		getLeaf(newLeaf?: string | boolean): WorkspaceLeaf;
		getMostRecentLeaf(rootSplit?: unknown): WorkspaceLeaf | null;
		getLeavesOfType(type: string): WorkspaceLeaf[];
		getActiveViewOfType<T extends View>(
			type: ConstructorPrototype<T>,
		): T | null;
		revealLeaf(leaf: WorkspaceLeaf): Promise<void>;
		onLayoutReady(callback: () => unknown): void;
		ensureSideLeaf(
			type: string,
			side: "left" | "right",
			options: {
				active?: boolean;
				reveal?: boolean;
				split?: boolean;
				state?: Record<string, unknown>;
			},
		): Promise<WorkspaceLeaf>;
	}

	export interface App {
		vault: Vault;
		metadataCache: MetadataCache;
		fileManager: FileManager;
		workspace: Workspace;
	}

	export class Component {
		load(): void;
		unload(): void;
		registerEvent(eventRef: EventRef): void;
		registerDomEvent<K extends keyof WindowEventMap>(
			el: Window,
			type: K,
			callback: (evt: WindowEventMap[K]) => unknown,
			options?: boolean | AddEventListenerOptions,
		): void;
		registerDomEvent<K extends keyof DocumentEventMap>(
			el: Document,
			type: K,
			callback: (evt: DocumentEventMap[K]) => unknown,
			options?: boolean | AddEventListenerOptions,
		): void;
		registerDomEvent<K extends keyof HTMLElementEventMap>(
			el: HTMLElement,
			type: K,
			callback: (evt: HTMLElementEventMap[K]) => unknown,
			options?: boolean | AddEventListenerOptions,
		): void;
	}

	export class View extends Component {
		app: App;
		leaf: WorkspaceLeaf;
		containerEl: HTMLElement;
		contentEl: HTMLElement;
		navigation: boolean;
		getViewType(): string;
		getDisplayText(): string;
		onOpen(): Promise<void>;
		onClose(): Promise<void>;
		setState(state: Record<string, unknown>, result: unknown): Promise<void>;
	}

	export class ItemView extends View {
		constructor(leaf: WorkspaceLeaf);
	}

	export interface WorkspaceLeaf {
		view: View;
		setViewState(state: ViewState): Promise<void>;
		openFile(file: TFile): Promise<void>;
		detach(): void;
	}

	export interface Command {
		id: string;
		name: string;
		callback?: () => unknown;
		checkCallback?: (checking: boolean) => boolean | void;
	}

	export class Plugin extends Component {
		app: App;
		loadData(): Promise<unknown>;
		saveData(data: unknown): Promise<void>;
		registerView(type: string, viewCreator: (leaf: WorkspaceLeaf) => View): void;
		addRibbonIcon(
			icon: string,
			title: string,
			callback: (evt: MouseEvent) => unknown,
		): HTMLElement;
		addCommand(command: Command): void;
		addSettingTab(tab: PluginSettingTab): void;
		registerInterval(id: number): number;
	}

	export class PluginSettingTab {
		app: App;
		plugin: Plugin;
		containerEl: HTMLElement;
		constructor(app: App, plugin: Plugin);
		update(): void;
		getControlValue(key: string): unknown;
		setControlValue(key: string, value: unknown): void | Promise<void>;
		display(): void;
	}

	export class Setting {
		settingEl: HTMLElement;
		constructor(containerEl: HTMLElement);
		setName(name: string | DocumentFragment): this;
		setDesc(desc: string | DocumentFragment): this;
		setHeading(): this;
		addButton(callback: (button: ButtonComponent) => unknown): this;
		addDropdown(callback: (dropdown: DropdownComponent) => unknown): this;
		addText(callback: (text: TextComponent) => unknown): this;
		addToggle(callback: (toggle: ToggleComponent) => unknown): this;
		addSlider(callback: (slider: SliderComponent) => unknown): this;
	}

	export class ButtonComponent {
		buttonEl: HTMLButtonElement;
		setButtonText(text: string): this;
		setCta(): this;
		setWarning(): this;
		setDisabled(disabled: boolean): this;
		onClick(callback: (evt: MouseEvent) => unknown): this;
	}

	export class DropdownComponent {
		selectEl: HTMLSelectElement;
		addOption(value: string, display: string): this;
		setValue(value: string): this;
		onChange(callback: (value: string) => unknown): this;
	}

	export class TextComponent {
		inputEl: HTMLInputElement;
		setPlaceholder(placeholder: string): this;
		setValue(value: string): this;
		onChange(callback: (value: string) => unknown): this;
	}

	export class ToggleComponent {
		toggleEl: HTMLInputElement;
		setValue(value: boolean): this;
		onChange(callback: (value: boolean) => unknown): this;
	}

	export class SliderComponent {
		setLimits(min: number, max: number, step: number): this;
		setValue(value: number): this;
		setDynamicTooltip(): this;
		onChange(callback: (value: number) => unknown): this;
	}

	export class Modal {
		app: App;
		contentEl: HTMLElement;
		constructor(app: App);
		open(): void;
		close(): void;
		onOpen(): void;
		onClose(): void;
	}

	export class Notice {
		constructor(message: string | DocumentFragment, timeout?: number);
	}

	export class Platform {
		static readonly isMobile: boolean;
		static readonly isDesktop: boolean;
		static readonly isMacOS: boolean;
	}

	export class MarkdownRenderer {
		static render(
			app: App,
			markdown: string,
			el: HTMLElement,
			sourcePath: string,
			component: Component,
		): Promise<void>;
	}

	export function setIcon(parent: HTMLElement, iconId: string): void;
}

declare module "korean-lunar-calendar" {
	export interface CalendarData {
		year: number;
		month: number;
		day: number;
		intercalation?: boolean;
	}

	export default class KoreanLunarCalendar {
		setSolarDate(
			solarYear: number,
			solarMonth: number,
			solarDay: number,
		): boolean;
		getLunarCalendar(): CalendarData;
	}
}

declare module "date-chinese" {
	export class CalendarChinese {
		constructor();
		fromGregorian(year: number, month: number, day: number): this;
		get(): number[];
		yearFromEpochCycle(): number;
	}

	export class CalendarKorean extends CalendarChinese {}
}

declare module "@internationalized/date" {
	export interface Calendar {
		identifier: string;
	}

	export class CalendarDate {
		readonly year: number;
		readonly month: number;
		readonly day: number;
		readonly era?: string;
		constructor(year: number, month: number, day: number);
	}

	export function createCalendar(identifier: string): Calendar;
	export function toCalendar(date: CalendarDate, calendar: Calendar): CalendarDate;
}

declare module "date-holidays" {
	export namespace HolidaysTypes {
		export type HolidayType =
			| "public"
			| "bank"
			| "school"
			| "optional"
			| "observance";

		export interface Options {
			languages?: string | string[];
			timezone?: string;
			types?: HolidayType[];
		}

		export interface Holiday {
			date: string;
			start: Date;
			end: Date;
			name: string;
			type: HolidayType;
			rule: string;
			substitute?: boolean;
		}
	}

	export default class Holidays {
		constructor(country?: string, opts?: HolidaysTypes.Options);
		getHolidays(
			year?: string | number | Date,
			lang?: string,
		): HolidaysTypes.Holiday[];
	}
}
