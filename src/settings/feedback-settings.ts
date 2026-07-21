import { Setting } from "obsidian";
import { t } from "../i18n";

const FEEDBACK_URLS = {
	feedback:
		"https://github.com/POBSIZ/obsidian-diary/issues/new?template=feedback.yml",
	bug: "https://github.com/POBSIZ/obsidian-diary/issues/new?template=bug_report.yml",
	feature:
		"https://github.com/POBSIZ/obsidian-diary/issues/new?template=feature_request.yml",
} as const;

export function configureFeedbackSetting(setting: Setting): void {
	setting
		.setName(t("settings.feedback"))
		.setDesc(t("settings.feedbackDesc"))
		.addButton((button) =>
			button
				.setButtonText(t("settings.shareFeedback"))
				.onClick(() => openFeedbackUrl(FEEDBACK_URLS.feedback)),
		)
		.addButton((button) =>
			button
				.setButtonText(t("settings.reportBug"))
				.onClick(() => openFeedbackUrl(FEEDBACK_URLS.bug)),
		)
		.addButton((button) =>
			button
				.setButtonText(t("settings.suggestFeature"))
				.onClick(() => openFeedbackUrl(FEEDBACK_URLS.feature)),
		);
}

function openFeedbackUrl(url: string): void {
	void window.open(url, "_blank", "noopener,noreferrer");
}
