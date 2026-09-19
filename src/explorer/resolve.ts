// What icon, if any, a vault path should show.
//
// Pattern: a pure function to a small "plan" value, kept apart from the DOM code that applies
// it. The precedence rules (chosen icon, then the theme's guess, then nothing) are the part
// worth testing, and they need neither Obsidian nor a document.

import type { Icon } from '../icons/icons';
import { parseIcon } from '../icons/icons';
import { DEFAULT_FILE_ICON, DEFAULT_FOLDER_ICON, fileIconName, folderIconByName } from '../icons/material';
import type { ShardIconsSettings } from '../settings/types';
import type { IconAssignments } from '../store/assignments';
import { assignmentFor, basename } from '../store/assignments';

export interface IconPlan {
	key: string;
	icon: Icon;
}

function plan(id: string | null): IconPlan | null {
	const icon = id ? parseIcon(id) : null;
	return icon ? { key: `icon:${icon.id}`, icon } : null;
}

/**
 * A chosen icon wins — a folder, a logo or a file icon; otherwise the theme's guess from the
 * name, when that is on. An id this build cannot draw still shows the plain folder, so the
 * choice stays visible (and the stored id stays untouched) after a downgrade or a sync from a
 * newer version.
 */
export function planForFolder(
	path: string,
	icons: IconAssignments,
	settings: ShardIconsSettings,
	light: boolean,
): IconPlan | null {
	const chosen = assignmentFor(icons, path);
	if (chosen !== null) return plan(chosen) ?? plan(DEFAULT_FOLDER_ICON);
	if (!settings.autoFolderIcons) return null;
	return plan(folderIconByName(basename(path), light));
}

/**
 * The same precedence as folders: a chosen icon wins, even with automatic file icons off;
 * otherwise the theme's guess from the name and extension. An id this build cannot draw shows
 * the generic file icon, so the choice stays visible.
 */
export function planForFile(
	path: string,
	icons: IconAssignments,
	settings: ShardIconsSettings,
	light: boolean,
): IconPlan | null {
	const chosen = assignmentFor(icons, path);
	if (chosen !== null) return plan(chosen) ?? plan(DEFAULT_FILE_ICON);
	if (!settings.fileIcons) return null;
	return plan(fileIconName(basename(path), light));
}
