// Plugin lifecycle and wiring only: everything with behaviour lives in icons/, explorer/,
// picker/, settings/ and store/. Keeping this file thin is what makes the rest testable
// without Obsidian.

import type { Menu, TAbstractFile } from 'obsidian';
import { Plugin, TFile, TFolder } from 'obsidian';
import type { DecorationContext } from './explorer/decorate';
import { FileExplorerIcons } from './explorer/FileExplorerIcons';
import { FILE_ICONS } from './icons/material';
import { clearIconCache } from './icons/render';
import type { IconChoice } from './icons/icons';
import type { IconCatalog } from './picker/catalogs';
import { FILE_CATALOG, FOLDER_CATALOG } from './picker/catalogs';
import { IconPickerModal } from './picker/IconPickerModal';
import { ShardIconsSettingTab } from './settings/SettingsTab';
import { IconStore } from './store/IconStore';

const SIZE_VARIABLE = '--shard-icon-size';

export default class ShardIconsPlugin extends Plugin {
	private store!: IconStore;
	private explorer!: FileExplorerIcons;

	override async onload(): Promise<void> {
		this.store = new IconStore(this);
		await this.store.load();

		this.explorer = new FileExplorerIcons(this.app, () => this.decorationContext());
		this.register(
			this.store.onChange(() => {
				this.applyIconSize();
				this.explorer.refresh();
			}),
		);

		this.addSettingTab(new ShardIconsSettingTab(this.app, this, this.store));
		this.registerEvent(this.app.workspace.on('file-menu', (menu, file) => this.addMenuItems(menu, file)));

		this.addCommand({
			id: 'change-folder-icon',
			name: "Change icon of the active file's folder",
			checkCallback: (checking) => {
				const folder = this.app.workspace.getActiveFile()?.parent;
				// The vault root has no row in the explorer, so an icon on it would be invisible.
				if (!folder || folder.isRoot()) return false;
				if (!checking) this.openPicker(folder);
				return true;
			},
		});

		this.addCommand({
			id: 'change-file-icon',
			name: 'Change icon of the active file',
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (!file || this.catalogFor(file) === null) return false;
				if (!checking) this.openPicker(file);
				return true;
			},
		});

		// Moving a folder carries its icon, and every descendant's; deleting drops them.
		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => void this.store.handleRename(oldPath, file.path)),
		);
		this.registerEvent(this.app.vault.on('delete', (file) => void this.store.handleDelete(file.path)));

		this.registerEvent(this.app.workspace.on('layout-change', () => this.explorer.refresh()));
		// Theme switches change which light/dark icon variant applies.
		this.registerEvent(this.app.workspace.on('css-change', () => this.explorer.refresh()));

		this.app.workspace.onLayoutReady(() => {
			this.applyIconSize();
			this.explorer.refresh();
		});
	}

	override onunload(): void {
		this.explorer.stop();
		clearIconCache();
		document.body.style.removeProperty(SIZE_VARIABLE);
	}

	private decorationContext(): DecorationContext {
		return {
			settings: this.store.settings,
			icons: this.store.icons,
			light: document.body.hasClass('theme-light'),
		};
	}

	private applyIconSize(): void {
		document.body.style.setProperty(SIZE_VARIABLE, `${this.store.settings.iconSize}px`);
	}

	/** `null` when there is nothing to offer: a build without file icons, or the vault root. */
	private catalogFor(file: TAbstractFile): IconCatalog<IconChoice> | null {
		if (file instanceof TFolder) return file.isRoot() ? null : FOLDER_CATALOG;
		if (file instanceof TFile) return FILE_ICONS.length > 0 ? FILE_CATALOG : null;
		return null;
	}

	private addMenuItems(menu: Menu, file: TAbstractFile): void {
		if (this.catalogFor(file) === null) return;
		menu.addItem((item) =>
			item
				.setTitle('Change icon…')
				.setIcon('image')
				.onClick(() => this.openPicker(file)),
		);
		if (this.store.iconFor(file.path) !== null) {
			menu.addItem((item) =>
				item
					.setTitle('Reset icon to default')
					.setIcon('rotate-ccw')
					.onClick(() => void this.store.setIcon(file.path, null)),
			);
		}
	}

	private openPicker(file: TAbstractFile): void {
		const catalog = this.catalogFor(file);
		if (!catalog) return;
		const { path } = file;
		new IconPickerModal(this.app, catalog, path, this.store.iconFor(path), (icon) => {
			void this.store.setIcon(path, icon);
		}).open();
	}
}
