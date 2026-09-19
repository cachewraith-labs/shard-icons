// The picker's folder tabs, built once from the generated table.
//
// Split from `icons.ts` so the parser stays cheap to import: building these arrays walks every
// folder icon and logo, which only the picker needs.

import { LOGOS } from '../generated/icons';
import type { FolderIcon, FolderIconGroup } from './icons';
import { parseFolderIcon } from './icons';
import { FOLDER_ICONS } from './material';

function parseAll(ids: readonly string[]): readonly FolderIcon[] {
	return ids.map(parseFolderIcon).filter((icon): icon is FolderIcon => icon !== null);
}

/** Every choice for the picker, by tab, in display order. */
export const FOLDER_ICON_GROUPS: Record<FolderIconGroup, readonly FolderIcon[]> = {
	theme: parseAll(FOLDER_ICONS),
	logo: parseAll(LOGOS.map((logo) => `logo-${logo.slug}`)),
};
