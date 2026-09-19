// The picker's tabs, built once from the generated table.
//
// Split from `icons.ts` so the parser stays cheap to import: building these arrays walks every
// folder icon, logo, topic and file icon, which only the picker needs.

import { LOGOS, TOPICS } from '../generated/icons';
import type { Icon, IconGroup } from './icons';
import { parseIcon } from './icons';
import { FILE_ICONS, FOLDER_ICONS } from './material';

function parseAll(ids: readonly string[]): readonly Icon[] {
	return ids.map(parseIcon).filter((icon): icon is Icon => icon !== null);
}

/** Every choice for the picker, by tab, in display order. `file` is empty without file icons. */
export const ICON_GROUPS: Record<IconGroup, readonly Icon[]> = {
	folder: parseAll(FOLDER_ICONS),
	logo: parseAll(LOGOS.map((logo) => `logo-${logo.slug}`)),
	topic: parseAll(TOPICS.map((topic) => `topic-${topic.name}`)),
	file: parseAll(FILE_ICONS),
};
