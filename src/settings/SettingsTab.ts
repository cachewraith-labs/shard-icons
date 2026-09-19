// The Settings → Shard Icons pane.
//
// `display()` and `setWarning()` are deprecated in favour of APIs added in Obsidian 1.13.0;
// this plugin supports 1.5.0, so it builds the pane the old way (see eslint.config.mjs).
//
// Pattern: a thin view over `IconStore`. Every control writes through the store and the store
// notifies whoever redraws, so this file holds no state of its own.

import type { App, Plugin } from 'obsidian';
import { Notice, PluginSettingTab, Setting } from 'obsidian';
import { HAS_FILE_ICONS, SOURCES } from '../generated/icons';
import { ConfirmModal } from '../picker/ConfirmModal';
import type { IconStore } from '../store/IconStore';
import { MAX_ICON_SIZE, MIN_ICON_SIZE } from './types';

export class ShardIconsSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		plugin: Plugin,
		private readonly store: IconStore,
	) {
		super(app, plugin);
	}

	override display(): void {
		const { containerEl, store } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName('Automatic folder icons')
			.setDesc('Folders with no chosen icon get an icon matched from their name.')
			.addToggle((toggle) =>
				toggle
					.setValue(store.settings.autoFolderIcons)
					.onChange((value) => void store.updateSettings({ autoFolderIcons: value })),
			);

		const fileIcons = new Setting(containerEl)
			.setName('File icons')
			.setDesc('Files with no chosen icon get an icon matched from their name and extension.')
			.addToggle((toggle) =>
				toggle
					.setValue(store.settings.fileIcons)
					.setDisabled(!HAS_FILE_ICONS)
					.onChange((value) => void store.updateSettings({ fileIcons: value })),
			);
		if (!HAS_FILE_ICONS) fileIcons.setDesc('This build of the plugin ships without file icons.');

		new Setting(containerEl)
			.setName('Icon size')
			.setDesc('Pixel size of the icons in the file explorer.')
			.addSlider((slider) =>
				slider
					.setLimits(MIN_ICON_SIZE, MAX_ICON_SIZE, 1)
					.setValue(store.settings.iconSize)
					.onChange((value) => void store.updateSettings({ iconSize: value })),
			);

		const count = Object.keys(store.icons).length;
		const items = count === 1 ? '1 file or folder' : `${count} files and folders`;
		new Setting(containerEl)
			.setName('Clear all custom icons')
			.setDesc(
				count === 0
					? 'No file or folder has a custom icon.'
					: `${items} ${count === 1 ? 'has' : 'have'} a custom icon.`,
			)
			.addButton((button) =>
				button
					.setButtonText('Clear')
					.setWarning()
					.setDisabled(count === 0)
					.onClick(() => {
						new ConfirmModal(
							this.app,
							'Clear all custom icons',
							`This removes the icon chosen for ${items}. It cannot be undone.`,
							'Clear',
							() => {
								void store.clearIcons();
								new Notice('Cleared all custom icons');
								this.display();
							},
						).open();
					}),
			);

		containerEl.createEl('p', {
			cls: 'shard-settings-credit',
			text:
				`Icons from Material Icon Theme ${SOURCES.materialIconTheme} (MIT), ` +
				`Simple Icons ${SOURCES.simpleIcons} (CC0-1.0) ` +
				`and Material Design Icons ${SOURCES.materialDesignIcons} (Apache-2.0).`,
		});
	}
}
