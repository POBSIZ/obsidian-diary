import { App, SuggestModal, TFile } from "obsidian";
import { t } from "../i18n";

/** Multiple period notes require a choice; never silently create another one. */
export function chooseRepresentativeNote(app: App, files: TFile[], onChoose: (file: TFile) => void): void {
	class NoteChoice extends SuggestModal<TFile> {
		getSuggestions(query: string): TFile[] {
			return files.filter((file) => file.path.toLowerCase().includes(query.toLowerCase()));
		}
		renderSuggestion(file: TFile, el: HTMLElement): void { el.setText(file.path); }
		onChooseSuggestion(file: TFile): void { onChoose(file); }
	}
	const modal = new NoteChoice(app);
	modal.setPlaceholder(t("planNote.chooseExisting"));
	modal.open();
}
