import { describe, expect, it } from 'vitest';

import { FOLDER_ICON_GROUPS } from '../src/icons/groups';
import {
	folderIconGroup,
	iconMatches,
	isKnownFolderIcon,
	parseFolderIcon,
	searchTerms,
} from '../src/icons/icons';

describe('custom folder icons', () => {
	it('parses theme folders, logos and symbols', () => {
		expect(parseFolderIcon('folder-src')).toMatchObject({ kind: 'theme', name: 'folder-src' });
		expect(parseFolderIcon('logo-fastapi')).toMatchObject({
			kind: 'logo',
			label: 'FastAPI',
			slug: 'fastapi',
		});
		expect(parseFolderIcon('logo-laravel')).toMatchObject({ kind: 'logo', label: 'Laravel' });
		expect(parseFolderIcon('symbol-game')).toMatchObject({ kind: 'symbol', label: 'game' });
	});

	it('ignores ids this build does not know', () => {
		for (const unknown of [
			'logo-nope',
			'symbol-nope',
			'symbol-toString',
			'logo-constructor',
			'rust',
			'',
		]) {
			expect(parseFolderIcon(unknown)).toBeNull();
			expect(isKnownFolderIcon(unknown)).toBe(false);
		}
	});

	it('groups and searches every choice', () => {
		expect(FOLDER_ICON_GROUPS.theme.length).toBeGreaterThan(100);
		expect(FOLDER_ICON_GROUPS.logo.length).toBeGreaterThan(100);
		expect(FOLDER_ICON_GROUPS.symbol.length).toBeGreaterThan(50);
		expect(folderIconGroup('logo-django')).toBe('logo');
		expect(folderIconGroup('symbol-game')).toBe('symbol');
		expect(folderIconGroup('folder-docs')).toBe('theme');
	});

	it('every offered choice parses back', () => {
		for (const group of Object.values(FOLDER_ICON_GROUPS)) {
			for (const icon of group) expect(parseFolderIcon(icon.id)).not.toBeNull();
		}
	});

	it('matches on label and id', () => {
		const fastapi = parseFolderIcon('logo-fastapi');
		expect(fastapi && iconMatches(fastapi, ['fast'])).toBe(true);
		expect(fastapi && iconMatches(fastapi, ['logo-fast'])).toBe(true);
		expect(fastapi && iconMatches(fastapi, ['laravel'])).toBe(false);
		expect(fastapi && iconMatches(fastapi, [])).toBe(true);
		expect(searchTerms('  Fast  API ')).toEqual(['fast', 'api']);
	});
});
