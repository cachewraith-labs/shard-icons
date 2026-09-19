// Settings and the on-disk shape of data.json, with the validation that guards both.
//
// Pattern: a parse-don't-validate boundary — one total function from `unknown` to a fully
// populated value, per field, never throwing. `data.json` sits in the vault where anything can
// edit or corrupt it, and a plugin that throws in `onload()` never loads at all.

import { HAS_FILE_ICONS } from '../generated/icons';
import type { IconAssignments } from '../store/assignments';
import { parseAssignments } from '../store/assignments';

export interface ShardIconsSettings {
	/** Folders with no chosen icon get the one the Material Icon Theme gives their name. */
	autoFolderIcons: boolean;
	/** Files get an icon by name and extension, the same way. */
	fileIcons: boolean;
	/** Rendered icon size in pixels. */
	iconSize: number;
}

export const MIN_ICON_SIZE = 12;
export const MAX_ICON_SIZE = 28;

export const DEFAULT_SETTINGS: ShardIconsSettings = {
	autoFolderIcons: true,
	fileIcons: false,
	iconSize: 16,
};

export interface PluginData {
	settings: ShardIconsSettings;
	icons: IconAssignments;
}

function boolean(raw: unknown, fallback: boolean): boolean {
	return typeof raw === 'boolean' ? raw : fallback;
}

function clampedSize(raw: unknown, fallback: number): number {
	if (typeof raw !== 'number' || !Number.isFinite(raw)) return fallback;
	return Math.min(MAX_ICON_SIZE, Math.max(MIN_ICON_SIZE, Math.round(raw)));
}

export function parseSettings(raw: unknown): ShardIconsSettings {
	const object = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
	return {
		autoFolderIcons: boolean(object['autoFolderIcons'], DEFAULT_SETTINGS.autoFolderIcons),
		// A build without file icons cannot honour the setting, whatever is stored.
		fileIcons: HAS_FILE_ICONS && boolean(object['fileIcons'], DEFAULT_SETTINGS.fileIcons),
		iconSize: clampedSize(object['iconSize'], DEFAULT_SETTINGS.iconSize),
	};
}

/** Anything unreadable falls back to defaults; it never throws and never clears what it can read. */
export function parsePluginData(raw: unknown): PluginData {
	const object = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
	return {
		settings: parseSettings(object['settings']),
		icons: parseAssignments(object['icons']),
	};
}
