import { App, Modal } from "obsidian";
import { t } from "../../i18n";

export class MonthYearInputModal extends Modal {
	constructor(
		app: App,
		currentYear: number,
		currentMonth: number,
		private onSubmit: (year: number, month: number) => void,
	) {
		super(app);
		this.contentEl.addClass("yearly-planner-modal-content");
		this.contentEl.createEl("h2", { text: t("modal.enterMonthYear") });

		const form = this.contentEl.createDiv({
			cls: "yearly-planner-year-modal",
		});

		const monthRow = form.createDiv({ cls: "monthly-planner-modal-row" });
		monthRow.createEl("label", { text: t("modal.month") });
		const monthInput = monthRow.createEl("input", {
			type: "number",
			cls: "yearly-planner-year-input",
		});
		monthInput.value = String(currentMonth);
		monthInput.min = "1";
		monthInput.max = "12";
		monthInput.placeholder = "1-12";

		const yearRow = form.createDiv({ cls: "monthly-planner-modal-row" });
		yearRow.createEl("label", { text: t("modal.year") });
		const yearInput = yearRow.createEl("input", {
			type: "number",
			cls: "yearly-planner-year-input",
		});
		yearInput.value = String(currentYear);
		yearInput.min = "1900";
		yearInput.max = "2100";
		yearInput.placeholder = "1900-2100";

		const btn = form.createEl("button", {
			text: t("modal.apply"),
			cls: "mod-cta",
		});
		btn.onclick = () => {
			const month = parseInt(monthInput.value, 10);
			const year = parseInt(yearInput.value, 10);
			if (
				!isNaN(month) &&
				month >= 1 &&
				month <= 12 &&
				!isNaN(year) &&
				year >= 1900 &&
				year <= 2100
			) {
				this.onSubmit(year, month);
				this.close();
			}
		};
	}
}
