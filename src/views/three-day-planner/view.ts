import type { WorkspaceLeaf } from "obsidian";
import { VIEW_TYPE_THREE_DAY_PLANNER } from "../../constants";
import { t } from "../../i18n";
import type DiaryObsidian from "../../main";
import { DailyPlannerView } from "../daily-planner/view";
import type { PlannerViewMode } from "../planner-layout";

export class ThreeDayPlannerView extends DailyPlannerView {
	constructor(leaf: WorkspaceLeaf, plugin: DiaryObsidian) {
		super(leaf, plugin);
	}

	getViewType(): string {
		return VIEW_TYPE_THREE_DAY_PLANNER;
	}

	getDisplayText(): string {
		return t("view.threeDayDisplayText", { date: this.formatHeaderDate() });
	}

	getIcon(): string {
		return "columns-3";
	}

	protected getVisibleDayCount(): number {
		return 3;
	}

	protected getPlannerViewMode(): PlannerViewMode {
		return "threeDay";
	}

	protected getContainerClass(): string {
		return "three-day-planner-container";
	}
}
