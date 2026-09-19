// What the picker offers for a folder and for a file.
//
// Pattern: a Strategy spelled as plain data. The modal is the same for both — search, tabs,
// grid, reset — and so are the icons on offer; only these differ: which tab comes first, which
// icon the theme would suggest for the name, and which icon is the plain fallback. A
// folder/file flag inside the modal would scatter that across it instead.

import { ICON_GROUPS } from '../icons/groups';
import type { Icon, IconGroup } from '../icons/icons';
import { iconGroup } from '../icons/icons';
import { DEFAULT_FILE_ICON, DEFAULT_FOLDER_ICON, fileIconName, folderIconByName } from '../icons/material';

export interface PickerTab {
	readonly id: IconGroup;
	readonly label: string;
	readonly hint: string;
	readonly icons: readonly Icon[];
}

export interface IconCatalog {
	/** What the dialog calls the thing it is choosing for, in labels. */
	readonly noun: string;
	readonly tabs: readonly PickerTab[];
	/** The tab that holds `id`, so the dialog opens where the current choice is. */
	tabOf(id: string): IconGroup;
	/** The icon the theme would give this name on its own; badged and listed first. */
	suggest(name: string): string | null;
	/** The theme's fallback, which is not worth a "match" badge. */
	readonly fallback: string;
}

const TAB_TEXT: Record<IconGroup, { label: string; hint: string }> = {
	folder: { label: 'Folders', hint: 'src, images, music…' },
	logo: { label: 'Logos', hint: 'fastapi, kafka, godot…' },
	topic: { label: 'Topics', hint: 'education, work, money, travel…' },
	file: { label: 'Files', hint: 'typescript, python, minecraft…' },
};

/** Tabs in this order, leaving out any that are empty — files, in a build without them. */
function tabs(order: readonly IconGroup[]): readonly PickerTab[] {
	return order
		.map((id) => ({ id, ...TAB_TEXT[id], icons: ICON_GROUPS[id] }))
		.filter((tab) => tab.icons.length > 0);
}

export const FOLDER_CATALOG: IconCatalog = {
	noun: 'Folder',
	tabs: tabs(['folder', 'topic', 'logo', 'file']),
	tabOf: iconGroup,
	suggest: (name) => folderIconByName(name),
	fallback: DEFAULT_FOLDER_ICON,
};

export const FILE_CATALOG: IconCatalog = {
	noun: 'File',
	tabs: tabs(['file', 'folder', 'topic', 'logo']),
	tabOf: iconGroup,
	suggest: (name) => fileIconName(name) || null,
	fallback: DEFAULT_FILE_ICON,
};
