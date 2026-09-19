// What the picker offers for a folder and for a file.
//
// Pattern: a Strategy spelled as plain data. The modal is the same for both — search, tabs,
// grid, reset — and only these differ: which tabs, which icon the theme would suggest for the
// name, and how a cell is drawn. A folder/file flag inside the modal would scatter that
// across it instead.

import { FOLDER_ICON_GROUPS } from '../icons/groups';
import type { FolderIcon, FolderIconGroup, IconChoice } from '../icons/icons';
import { folderIconGroup } from '../icons/icons';
import {
	DEFAULT_FILE_ICON,
	DEFAULT_FOLDER_ICON,
	FILE_ICONS,
	fileIconLabel,
	fileIconName,
	folderIconByName,
} from '../icons/material';
import { renderFolderIcon, renderMaterialIcon } from '../icons/render';

export interface PickerTab<T extends IconChoice> {
	readonly id: string;
	readonly label: string;
	readonly hint: string;
	readonly icons: readonly T[];
}

export interface IconCatalog<T extends IconChoice> {
	/** What the dialog calls the thing it is choosing for, in labels. */
	readonly noun: string;
	readonly tabs: readonly PickerTab<T>[];
	/** The tab that holds `id`, so the dialog opens where the current choice is. */
	tabOf(id: string): string;
	/** The icon the theme would give this name on its own; badged and listed first. */
	suggest(name: string): string | null;
	/** The theme's fallback, which is not worth a "match" badge. */
	readonly fallback: string;
	/**
	 * Method syntax on purpose: it lets a folder catalog stand in as an `IconCatalog<IconChoice>`.
	 * Sound here, since the dialog only ever hands back icons from this catalog's own tabs.
	 */
	render(target: HTMLElement, icon: T): boolean;
}

const FOLDER_TABS: { group: FolderIconGroup; label: string; hint: string }[] = [
	{ group: 'theme', label: 'Folders', hint: 'src, images, music…' },
	{ group: 'logo', label: 'Logos', hint: 'fastapi, laravel, godot…' },
	{ group: 'symbol', label: 'Symbols', hint: 'game, document, money…' },
];

export const FOLDER_CATALOG: IconCatalog<FolderIcon> = {
	noun: 'Folder',
	tabs: FOLDER_TABS.map(({ group, label, hint }) => ({
		id: group,
		label,
		hint,
		icons: FOLDER_ICON_GROUPS[group],
	})),
	tabOf: folderIconGroup,
	suggest: (name) => folderIconByName(name),
	fallback: DEFAULT_FOLDER_ICON,
	render: renderFolderIcon,
};

const FILE_CHOICES: readonly IconChoice[] = FILE_ICONS.map((id) => ({ id, label: fileIconLabel(id) }));

export const FILE_CATALOG: IconCatalog<IconChoice> = {
	noun: 'File',
	tabs: [{ id: 'file', label: 'Files', hint: 'typescript, python, markdown…', icons: FILE_CHOICES }],
	tabOf: () => 'file',
	suggest: (name) => fileIconName(name) || null,
	fallback: DEFAULT_FILE_ICON,
	render: (target, icon) => renderMaterialIcon(target, icon.id),
};
