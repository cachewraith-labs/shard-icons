// The picker's three tabs, built once from the generated table.
//
// Split from `icons.ts` so the parser stays cheap to import: building these arrays walks every
// folder icon, logo and symbol, which only the picker needs.

import { LOGOS } from '../generated/icons';
import type { FolderIcon, FolderIconGroup } from './icons';
import { parseFolderIcon } from './icons';
import { FOLDER_ICONS } from './material';
import { SYMBOLS } from './symbols';

function parseAll(ids: readonly string[]): readonly FolderIcon[] {
	return ids.map(parseFolderIcon).filter((icon): icon is FolderIcon => icon !== null);
}

/** Every choice for the picker, by tab, in display order. */
export const FOLDER_ICON_GROUPS: Record<FolderIconGroup, readonly FolderIcon[]> = {
	theme: parseAll(FOLDER_ICONS),
	logo: parseAll(LOGOS.map((logo) => `logo-${logo.slug}`)),
	symbol: parseAll(Object.keys(SYMBOLS).map((id) => `symbol-${id}`)),
};
