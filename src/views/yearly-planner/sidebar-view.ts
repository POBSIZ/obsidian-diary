import { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_YEARLY_SIDEBAR_PLANNER } from "../../constants";
import { t } from "../../i18n";
import DiaryObsidian from "../../main";
import { YearlyPlannerView } from "./view";

export class YearlySidebarPlannerView extends YearlyPlannerView {
	constructor(leaf: WorkspaceLeaf, plugin: DiaryObsidian) {
		super(leaf, plugin);
	}

	getViewType(): string {
		return VIEW_TYPE_YEARLY_SIDEBAR_PLANNER;
	}

	getDisplayText(): string {
		return t("view.monthlySidebarTitle");
	}

	getIcon(): string {
		return "calendar-days";
	}

	isRangeBarInteractionEnabled(): boolean {
		return false;
	}

	render(): void {
		super.render();
		this.contentEl.addClass("yearly-sidebar-planner-container");
	}
}
