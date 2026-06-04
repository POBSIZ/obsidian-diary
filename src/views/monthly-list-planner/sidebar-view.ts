import { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER } from "../../constants";
import { t } from "../../i18n";
import DiaryObsidian from "../../main";
import { MonthlyListPlannerView } from "./view";

export class MonthlyListSidebarPlannerView extends MonthlyListPlannerView {
	constructor(leaf: WorkspaceLeaf, plugin: DiaryObsidian) {
		super(leaf, plugin);
	}

	getViewType(): string {
		return VIEW_TYPE_MONTHLY_LIST_SIDEBAR_PLANNER;
	}

	getDisplayText(): string {
		return t("view.monthlySidebarTitle");
	}

	getIcon(): string {
		return "calendar-days";
	}

	protected isRangeBarInteractionEnabled(): boolean {
		return false;
	}

	render(): void {
		super.render();
		this.contentEl.addClass("monthly-list-sidebar-planner-container");
	}
}
