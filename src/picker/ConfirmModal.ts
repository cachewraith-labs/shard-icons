// A yes/no dialog. Small enough to be a plain Modal subclass taking a callback; the one place
// that needs it (clearing every icon) is destructive and irreversible.

import type { App } from 'obsidian';
import { Modal, Setting } from 'obsidian';

export class ConfirmModal extends Modal {
	constructor(
		app: App,
		private readonly title: string,
		private readonly message: string,
		private readonly confirmLabel: string,
		private readonly onConfirm: () => void,
	) {
		super(app);
	}

	override onOpen(): void {
		this.titleEl.setText(this.title);
		this.contentEl.createEl('p', { text: this.message });
		new Setting(this.contentEl)
			.addButton((button) => button.setButtonText('Cancel').onClick(() => this.close()))
			.addButton((button) =>
				button
					.setButtonText(this.confirmLabel)
					.setWarning()
					.onClick(() => {
						this.close();
						this.onConfirm();
					}),
			);
	}

	override onClose(): void {
		this.contentEl.empty();
	}
}
