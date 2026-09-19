// The Material Icon Theme's lookup rules, over the table `scripts/build-icons.ts` generated.
//
// Pattern: pure functions over a frozen table, no Obsidian API, so the rules are unit-testable
// and the same ids the cachewraith-explorer app stores resolve here too.

import { ICON_SVG, MATERIAL } from '../generated/icons';

/**
 * Picks an icon the way VS Code's Material Icon Theme does: exact file name first
 * (`package.json`, `Dockerfile`), then the longest known extension (`d.ts` before `ts`),
 * then the generic file icon. Matching is case-insensitive. Light themes get the theme's
 * light variants where it has them.
 */
export function fileIconName(fileName: string, light = false): string {
	const name = fileName.toLowerCase();
	const byName = (light && MATERIAL.light.fileNames[name]) || MATERIAL.fileNames[name];
	if (byName) return byName;

	for (let dot = name.indexOf('.'); dot !== -1; dot = name.indexOf('.', dot + 1)) {
		const extension = name.slice(dot + 1);
		const byExtension =
			(light && MATERIAL.light.fileExtensions[extension]) || MATERIAL.fileExtensions[extension];
		if (byExtension) return byExtension;
	}
	return MATERIAL.file;
}

/** The theme's icon for a well-known folder name (`src`, `node_modules`…), or `null`. */
export function folderIconByName(folderName: string, light = false): string | null {
	const name = folderName.toLowerCase();
	return (light && MATERIAL.light.folderNames[name]) || MATERIAL.folderNames[name] || null;
}

export const DEFAULT_FOLDER_ICON = MATERIAL.folder;

/** The generic file icon; empty in a build without file icons. */
export const DEFAULT_FILE_ICON = MATERIAL.file;

/** Every folder icon, sorted, for the picker. */
export const FOLDER_ICONS: readonly string[] = MATERIAL.folderIcons;

/** Every file icon, sorted, for the picker; empty in a build without file icons. */
export const FILE_ICONS: readonly string[] = MATERIAL.fileIcons;

/**
 * The markup for an icon name, following aliases; `null` for anything not built in. Own
 * properties only: a stored id such as `toString` must not resolve to an inherited member.
 */
export function iconSvg(name: string): string | null {
	const key = Object.hasOwn(MATERIAL.aliases, name) ? (MATERIAL.aliases[name] ?? name) : name;
	return Object.hasOwn(ICON_SVG, key) ? (ICON_SVG[key] ?? null) : null;
}

/**
 * A folder icon this build can draw. Deliberately wider than `FOLDER_ICONS`: the theme's
 * `_light` substitutes are valid ids too, they are just not offered as separate choices.
 */
export function isFolderIcon(name: string): boolean {
	return name.startsWith('folder') && iconSvg(name) !== null;
}

/** `folder-node` -> `node`, for labels. */
export function folderIconLabel(icon: string): string {
	return icon === DEFAULT_FOLDER_ICON ? 'folder' : icon.replace(/^folder-/, '').replaceAll('-', ' ');
}

/**
 * A file icon this build can draw — any non-folder icon with markup, `_light` substitutes
 * included, so an id stored by a build with file icons still resolves in one with them.
 */
export function isFileIcon(name: string): boolean {
	return !name.startsWith('folder') && iconSvg(name) !== null;
}

/** `typescript-def` -> `typescript def`, for labels. */
export function fileIconLabel(icon: string): string {
	return icon.replaceAll('-', ' ');
}
