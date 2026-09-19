// What icon, if any, a vault path should show.
//
// Pattern: a pure function to a small "plan" value, kept apart from the DOM code that applies
// it. The precedence rules (chosen icon, then the theme's guess, then nothing) are the part
// worth testing, and they need neither Obsidian nor a document.

import type { FolderIcon } from '../icons/icons';
import { parseFolderIcon } from '../icons/icons';
import {
	DEFAULT_FILE_ICON,
	DEFAULT_FOLDER_ICON,
	fileIconName,
	folderIconByName,
	isFileIcon,
} from '../icons/material';
import type { ShardIconsSettings } from '../settings/types';
import type { IconAssignments } from '../store/assignments';
import { assignmentFor, basename } from '../store/assignments';

export type IconPlan =
	{ key: string; kind: 'folder'; icon: FolderIcon } | { key: string; kind: 'material'; name: string };

function folderPlan(icon: FolderIcon | null): IconPlan | null {
	return icon ? { key: `folder:${icon.id}`, kind: 'folder', icon } : null;
}

function materialPlan(name: string | null): IconPlan | null {
	return name ? { key: `material:${name}`, kind: 'material', name } : null;
}

/**
 * A chosen icon wins; otherwise the theme's guess from the folder name, when that is on.
 * An id this build cannot draw still shows the plain folder, so the choice stays visible
 * (and the stored id stays untouched) after a downgrade or a sync from a newer version.
 */
export function planForFolder(
	path: string,
	icons: IconAssignments,
	settings: ShardIconsSettings,
	light: boolean,
): IconPlan | null {
	const chosen = assignmentFor(icons, path);
	if (chosen !== null) {
		return folderPlan(parseFolderIcon(chosen) ?? parseFolderIcon(DEFAULT_FOLDER_ICON));
	}
	if (!settings.autoFolderIcons) return null;
	const byName = folderIconByName(basename(path), light);
	return byName ? folderPlan(parseFolderIcon(byName)) : null;
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
	if (chosen !== null) return materialPlan(isFileIcon(chosen) ? chosen : DEFAULT_FILE_ICON || null);
	if (!settings.fileIcons) return null;
	return materialPlan(fileIconName(basename(path), light) || null);
}
