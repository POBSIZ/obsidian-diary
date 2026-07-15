import { App, Modal } from "obsidian";
import { t } from "../i18n";

export type PlannerPeriodGranularity = "year" | "month" | "day";

export interface PlannerPeriodValue {
	year: number;
	month?: number;
	day?: number;
}

export interface PlannerPeriodModalOptions extends PlannerPeriodValue {
	granularity: PlannerPeriodGranularity;
	onSubmit: (value: PlannerPeriodValue) => void;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** Shared year/month/day picker used by every planner header. */
export class PlannerPeriodModal extends Modal {
	constructor(
		app: App,
		private options: PlannerPeriodModalOptions,
	) {
		super(app);
	}

	onOpen(): void {
		this.contentEl.addClass(
			"yearly-planner-modal-content",
			"planner-period-modal",
		);
		this.contentEl.createEl("h2", { text: this.getTitle() });
		const form = this.contentEl.createEl("form", {
			cls: "yearly-planner-create-file-modal planner-period-form",
		});
		const field = form.createDiv({
			cls: "yearly-planner-create-file-row planner-period-field",
		});
		const label = field.createEl("label", {
			text: this.getFieldLabel(),
		});
		const input = field.createEl("input", {
			type: this.getInputType(),
			cls: "yearly-planner-date-input planner-period-input",
		});
		label.htmlFor = input.id = `diary-period-${this.options.granularity}`;
		this.configureInput(input);

		const error = form.createDiv({
			cls: "yearly-planner-modal-error planner-period-error is-hidden",
			attr: { role: "alert", "aria-live": "polite" },
		});
		const actions = form.createDiv({
			cls: "yearly-planner-modal-buttons planner-period-actions",
		});
		const cancel = actions.createEl("button", {
			text: t("modal.cancel"),
			attr: { type: "button" },
		});
		cancel.onclick = () => this.close();
		actions.createEl("button", {
			text: t("modal.apply"),
			cls: "mod-cta",
			attr: { type: "submit" },
		});

		form.onsubmit = (event) => {
			event.preventDefault();
			const value = this.parseValue(input.value);
			if (!value) {
				error.setText(this.getErrorText());
				error.removeClass("is-hidden");
				input.focus();
				return;
			}
			this.options.onSubmit(value);
			this.close();
		};

		input.addEventListener("input", () => {
			error.addClass("is-hidden");
			error.empty();
		});
		input.focus();
		input.select();
	}

	private getTitle(): string {
		if (this.options.granularity === "year") return t("modal.enterYear");
		if (this.options.granularity === "month") {
			return t("modal.enterMonthYear");
		}
		return t("daily.selectDate");
	}

	private getFieldLabel(): string {
		if (this.options.granularity === "year") return t("modal.year");
		if (this.options.granularity === "month") {
			return t("modal.enterMonthYear");
		}
		return t("daily.selectDate");
	}

	private getInputType(): "number" | "month" | "date" {
		if (this.options.granularity === "year") return "number";
		if (this.options.granularity === "month") return "month";
		return "date";
	}

	private configureInput(input: HTMLInputElement): void {
		if (this.options.granularity === "year") {
			input.value = String(this.options.year);
			input.min = "1900";
			input.max = "2100";
			input.step = "1";
			input.inputMode = "numeric";
			return;
		}
		input.min = this.options.granularity === "month" ? "1900-01" : "1900-01-01";
		input.max = this.options.granularity === "month" ? "2100-12" : "2100-12-31";
		const month = this.options.month ?? 1;
		const monthValue = `${this.options.year}-${pad(month)}`;
		input.value =
			this.options.granularity === "day"
				? `${monthValue}-${pad(this.options.day ?? 1)}`
				: monthValue;
	}

	private parseValue(raw: string): PlannerPeriodValue | null {
		if (this.options.granularity === "year") {
			const year = Number(raw);
			return Number.isInteger(year) && year >= 1900 && year <= 2100
				? { year }
				: null;
		}
		const parts = raw.split("-").map(Number);
		const [year, month, day] = parts;
		if (
			!Number.isInteger(year) ||
			year == null ||
			year < 1900 ||
			year > 2100 ||
			!Number.isInteger(month) ||
			month == null ||
			month < 1 ||
			month > 12
		) {
			return null;
		}
		if (this.options.granularity === "month") return { year, month };
		if (!Number.isInteger(day) || day == null || day < 1 || day > 31) {
			return null;
		}
		const date = new Date(year, month - 1, day);
		if (
			date.getFullYear() !== year ||
			date.getMonth() + 1 !== month ||
			date.getDate() !== day
		) {
			return null;
		}
		return { year, month, day };
	}

	private getErrorText(): string {
		if (this.options.granularity === "year") return t("modal.invalidYear");
		if (this.options.granularity === "month") {
			return t("modal.invalidMonthYear");
		}
		return t("modal.invalidDate");
	}
}
