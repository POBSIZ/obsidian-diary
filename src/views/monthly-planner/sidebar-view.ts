import { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER } from "../../constants";
import { t } from "../../i18n";
import DiaryObsidian from "../../main";
import { MonthlyPlannerView } from "./view";

export class MonthlySidebarPlannerView extends MonthlyPlannerView {
	constructor(leaf: WorkspaceLeaf, plugin: DiaryObsidian) {
		super(leaf, plugin);
	}

	getViewType(): string {
		return VIEW_TYPE_MONTHLY_SIDEBAR_PLANNER;
	}

	getDisplayText(): string {
		return t("view.monthlySidebarTitle");
	}

	isRangeBarInteractionEnabled(): boolean {
		return false;
	}

	render(): void {
		super.render();
		this.contentEl.addClass("monthly-sidebar-planner-container");
	}
}
