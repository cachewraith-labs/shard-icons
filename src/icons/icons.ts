// Every icon a folder or a file can be given, stored as one string:
// - `folder-…`     a Material Icon Theme folder (`folder-src`);
// - `logo-<slug>`  a folder badged with a framework or app logo (`logo-fastapi`);
// - `topic-<name>` a folder badged with an everyday topic (`topic-school`, `topic-briefcase`);
// - anything else  a Material Icon Theme file icon (`typescript`, `minecraft`).
//
// Any icon can go on either: a file can wear a folder or a logo, a folder a file icon. The
// kind says how it is drawn, not what it may be put on.
//
// Earlier versions also offered `symbol-<id>` folders built from Lucide glyphs. Those ids no
// longer parse, so a row that still has one shows the plain folder or file and keeps the id.
//
// The ids match cachewraith-explorer's, so a vault and that file manager stay compatible.
//
// Pattern: a discriminated union parsed by prefix and rendered with a `switch`. Four fixed
// variants with no behaviour of their own do not need a class per kind, and parsing to `null`
// makes "an id this build does not know" an ordinary value rather than an exception.

import { LOGO_SVG, LOGOS, TOPIC_SVG, TOPICS } from '../generated/icons';
import { fileIconLabel, folderIconLabel, isFileIcon, isFolderIcon } from './material';

export type Icon =
	| { kind: 'folder'; id: string; label: string; name: string }
	| { kind: 'logo'; id: string; label: string; slug: string }
	| { kind: 'topic'; id: string; label: string; name: string; terms: string }
	| { kind: 'file'; id: string; label: string; name: string };

export type IconGroup = Icon['kind'];

const LOGO_PREFIX = 'logo-';
const TOPIC_PREFIX = 'topic-';

const LOGO_TITLES = new Map(LOGOS.map((logo) => [logo.slug, logo.title]));
const TOPIC_TERMS = new Map(TOPICS.map((topic) => [topic.name, topic.terms]));

/**
 * `null` for an id this build does not know — a logo added in a later version, a symbol from an
 * earlier one, a file icon in a build without them, or a corrupted value. Callers fall back to
 * the default folder or file and leave the stored id alone.
 */
export function parseIcon(id: string): Icon | null {
	if (id.startsWith(LOGO_PREFIX)) {
		const slug = id.slice(LOGO_PREFIX.length);
		const title = LOGO_TITLES.get(slug);
		// The SVG table doubles as the allowlist: no markup, no icon.
		return title !== undefined && Object.hasOwn(LOGO_SVG, slug)
			? { kind: 'logo', id, label: title, slug }
			: null;
	}
	if (id.startsWith(TOPIC_PREFIX)) {
		const name = id.slice(TOPIC_PREFIX.length);
		const terms = TOPIC_TERMS.get(name);
		return terms !== undefined && Object.hasOwn(TOPIC_SVG, name)
			? { kind: 'topic', id, label: name.replaceAll('-', ' '), name, terms }
			: null;
	}
	if (isFolderIcon(id)) return { kind: 'folder', id, label: folderIconLabel(id), name: id };
	if (isFileIcon(id)) return { kind: 'file', id, label: fileIconLabel(id), name: id };
	return null;
}

export function isKnownIcon(id: string): boolean {
	return parseIcon(id) !== null;
}

/** The picker tab an id belongs in; an unknown id lands on files, the widest one. */
export function iconGroup(id: string): IconGroup {
	return parseIcon(id)?.kind ?? 'file';
}

/** Anything a picker can offer: a stored id, the name shown under it, and extra search words. */
export interface IconChoice {
	readonly id: string;
	readonly label: string;
	readonly terms?: string;
}

/**
 * Search text: the label, the id and any extra words, so `fastapi`, `FastAPI` and
 * `logo-fastapi` all match, and `education` finds `topic-school`.
 */
export function iconMatches(icon: IconChoice, terms: readonly string[]): boolean {
	const haystack = `${icon.label} ${icon.id} ${icon.terms ?? ''}`.toLowerCase();
	return terms.every((term) => haystack.includes(term));
}

export function searchTerms(query: string): string[] {
	return query.toLowerCase().split(/\s+/).filter(Boolean);
}
