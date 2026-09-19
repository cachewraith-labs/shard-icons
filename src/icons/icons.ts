// Every icon a folder can be given, stored as one string:
// - `folder-…`     a Material Icon Theme folder (`folder-src`);
// - `logo-<slug>`  a folder badged with a framework or app logo (`logo-fastapi`);
// - `symbol-<id>`  a folder with a generic Lucide symbol inside (`symbol-game`).
//
// The ids match cachewraith-explorer's, so a vault and that file manager stay compatible.
//
// Pattern: a discriminated union parsed by prefix and rendered with a `switch`. Three fixed
// variants with no behaviour of their own do not need a class per kind, and parsing to `null`
// makes "an id this build does not know" an ordinary value rather than an exception.

import { LOGO_SVG, LOGOS } from '../generated/icons';
import { folderIconLabel, isFolderIcon } from './material';
import { symbolGlyphs } from './symbols';

export type FolderIcon =
	| { kind: 'theme'; id: string; label: string; name: string }
	| { kind: 'logo'; id: string; label: string; slug: string }
	| { kind: 'symbol'; id: string; label: string; glyphs: readonly string[] };

export type FolderIconGroup = 'theme' | 'logo' | 'symbol';

const LOGO_PREFIX = 'logo-';
const SYMBOL_PREFIX = 'symbol-';

const LOGO_TITLES = new Map(LOGOS.map((logo) => [logo.slug, logo.title]));

/**
 * `null` for an id this build does not know — a logo or symbol added in a later version, or a
 * corrupted value. Callers fall back to the default folder and leave the stored id alone.
 */
export function parseFolderIcon(id: string): FolderIcon | null {
	if (id.startsWith(LOGO_PREFIX)) {
		const slug = id.slice(LOGO_PREFIX.length);
		const title = LOGO_TITLES.get(slug);
		// The SVG table doubles as the allowlist: no markup, no icon.
		return title !== undefined && LOGO_SVG[slug] ? { kind: 'logo', id, label: title, slug } : null;
	}
	if (id.startsWith(SYMBOL_PREFIX)) {
		const symbol = id.slice(SYMBOL_PREFIX.length);
		const glyphs = symbolGlyphs(symbol);
		return glyphs ? { kind: 'symbol', id, label: symbol, glyphs } : null;
	}
	return isFolderIcon(id) ? { kind: 'theme', id, label: folderIconLabel(id), name: id } : null;
}

export function isKnownFolderIcon(id: string): boolean {
	return parseFolderIcon(id) !== null;
}

export function folderIconGroup(id: string): FolderIconGroup {
	if (id.startsWith(LOGO_PREFIX)) return 'logo';
	if (id.startsWith(SYMBOL_PREFIX)) return 'symbol';
	return 'theme';
}

/** Anything a picker can offer: a stored id and the name shown under it. */
export interface IconChoice {
	readonly id: string;
	readonly label: string;
}

/** Search text: the label plus the id, so `fastapi`, `FastAPI` and `logo-fastapi` all match. */
export function iconMatches(icon: IconChoice, terms: readonly string[]): boolean {
	const haystack = `${icon.label} ${icon.id}`.toLowerCase();
	return terms.every((term) => haystack.includes(term));
}

export function searchTerms(query: string): string[] {
	return query.toLowerCase().split(/\s+/).filter(Boolean);
}
