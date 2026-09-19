// The Material Icon Theme's lookup rules, over the table `scripts/build-icons.ts` generated.
//
// Pattern: pure functions over a frozen table, no Obsidian API, so the rules are unit-testable
// and the same ids the cachewraith-explorer app stores resolve here too.

import { ICON_SVG, MATERIAL } from '../generated/icons';

/**
 * A lookup in one of the theme's name tables. Own properties only: the tables are plain
 * objects, and a folder called `constructor` or `__proto__` would otherwise read an inherited
 * member instead of `undefined` — a function where an icon name belongs, which then throws.
 */
function lookup(table: Readonly<Record<string, string>>, key: string): string | undefined {
	return Object.hasOwn(table, key) ? table[key] : undefined;
}

/**
 * Folder names the theme leaves unmatched that have an obvious icon among its own — mostly
 * the singular or plural it does not list (`task` next to its `tasks`). The theme's table
 * wins wherever it has an entry; these only fill gaps, and only point at the theme's icons.
 */
export const EXTRA_FOLDER_NAMES: Readonly<Record<string, string>> = {
	task: 'folder-tasks',
	todo: 'folder-tasks',
	todos: 'folder-tasks',
	'to-do': 'folder-tasks',
	worker: 'folder-job',
	workers: 'folder-job',
	cron: 'folder-job',
	cronjobs: 'folder-job',
	scheduler: 'folder-job',
	microservice: 'folder-server',
	microservices: 'folder-server',
};

/**
 * Picks an icon the way VS Code's Material Icon Theme does: exact file name first
 * (`package.json`, `Dockerfile`), then the longest known extension (`d.ts` before `ts`),
 * then the generic file icon. Matching is case-insensitive. Light themes get the theme's
 * light variants where it has them.
 */
export function fileIconName(fileName: string, light = false): string {
	const name = fileName.toLowerCase();
	const byName = (light && lookup(MATERIAL.light.fileNames, name)) || lookup(MATERIAL.fileNames, name);
	if (byName) return byName;

	for (let dot = name.indexOf('.'); dot !== -1; dot = name.indexOf('.', dot + 1)) {
		const extension = name.slice(dot + 1);
		const byExtension =
			(light && lookup(MATERIAL.light.fileExtensions, extension)) ||
			lookup(MATERIAL.fileExtensions, extension);
		if (byExtension) return byExtension;
	}
	return MATERIAL.file;
}

/** The theme's icon for a well-known folder name (`src`, `node_modules`, `task`…), or `null`. */
export function folderIconByName(folderName: string, light = false): string | null {
	const name = folderName.toLowerCase();
	return (
		(light && lookup(MATERIAL.light.folderNames, name)) ||
		lookup(MATERIAL.folderNames, name) ||
		lookup(EXTRA_FOLDER_NAMES, name) ||
		null
	);
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
