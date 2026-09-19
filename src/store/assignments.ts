// Which vault path has which icon, as plain immutable data.
//
// Pattern: pure transforms returning a new record, not a mutable store object. Every rule that
// is easy to get wrong — a rename has to carry every descendant, a delete has to drop them —
// is then a function with no Obsidian API in sight, so the tests cover it directly.

/** Keys that would write through to `Object.prototype` instead of the record. */
const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

/** Vault-relative path -> icon id. Ids are kept verbatim, including ones this build cannot draw. */
export type IconAssignments = Readonly<Record<string, string>>;

/**
 * Reads an assignment. Always via `Object.hasOwn`, never a bare index: a folder called
 * `toString` or `constructor` would otherwise pick up an inherited member of the record.
 */
export function assignmentFor(icons: IconAssignments, path: string): string | null {
	return Object.hasOwn(icons, path) ? (icons[path] ?? null) : null;
}

/** The part after the last slash; vault paths always use `/`. */
export function basename(path: string): string {
	const slash = path.lastIndexOf('/');
	return slash === -1 ? path : path.slice(slash + 1);
}

export function parentPath(path: string): string {
	const slash = path.lastIndexOf('/');
	return slash === -1 ? '' : path.slice(0, slash);
}

/** `null` clears the assignment. Returns the same object when nothing changed. */
export function setAssignment(icons: IconAssignments, path: string, icon: string | null): IconAssignments {
	if (icon === null) {
		if (!Object.hasOwn(icons, path)) return icons;
		const next = { ...icons };
		delete next[path];
		return next;
	}
	if (assignmentFor(icons, path) === icon) return icons;
	return { ...icons, [path]: icon };
}

function isUnder(path: string, folder: string): boolean {
	return path.startsWith(`${folder}/`);
}

/** Moves or renames `from` and everything under it, so a whole tree keeps its icons. */
export function renameAssignments(icons: IconAssignments, from: string, to: string): IconAssignments {
	if (from === to) return icons;
	let changed = false;
	const next: Record<string, string> = {};
	for (const [path, icon] of Object.entries(icons)) {
		if (path === from) {
			next[to] = icon;
			changed = true;
		} else if (isUnder(path, from)) {
			next[`${to}${path.slice(from.length)}`] = icon;
			changed = true;
		} else {
			next[path] = icon;
		}
	}
	return changed ? next : icons;
}

/** Drops `path` and everything under it. */
export function deleteAssignments(icons: IconAssignments, path: string): IconAssignments {
	const doomed = Object.keys(icons).filter((key) => key === path || isUnder(key, path));
	if (doomed.length === 0) return icons;
	const next = { ...icons };
	for (const key of doomed) delete next[key];
	return next;
}

/**
 * Keeps the string->string pairs of an untrusted value and nothing else. Unknown icon ids
 * survive on purpose: a vault synced from a newer version must not lose its icons here.
 */
export function parseAssignments(raw: unknown): IconAssignments {
	if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
	const icons: Record<string, string> = {};
	for (const [path, icon] of Object.entries(raw as Record<string, unknown>)) {
		if (path === '' || UNSAFE_KEYS.has(path)) continue;
		if (typeof icon === 'string' && icon !== '') icons[path] = icon;
	}
	return icons;
}
