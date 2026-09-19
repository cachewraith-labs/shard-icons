import { describe, expect, it } from 'vitest';

import { ICON_GROUPS } from '../src/icons/groups';
import { iconGroup, iconMatches, isKnownIcon, parseIcon, searchTerms } from '../src/icons/icons';

describe('custom icons', () => {
	it('parses theme folders, logos and file icons', () => {
		expect(parseIcon('folder-src')).toMatchObject({ kind: 'folder', name: 'folder-src' });
		expect(parseIcon('logo-fastapi')).toMatchObject({
			kind: 'logo',
			label: 'FastAPI',
			slug: 'fastapi',
		});
		expect(parseIcon('logo-laravel')).toMatchObject({ kind: 'logo', label: 'Laravel' });
		expect(parseIcon('minecraft')).toMatchObject({ kind: 'file', name: 'minecraft' });
		expect(parseIcon('logo-counterstrike')).toMatchObject({ kind: 'logo', label: 'Counter-Strike' });
		expect(parseIcon('topic-school')).toMatchObject({ kind: 'topic', name: 'school', label: 'school' });
	});

	it('ignores ids this build does not know', () => {
		for (const unknown of [
			'logo-nope',
			// Symbols were removed; a stored one must not parse any more.
			'symbol-game',
			'symbol-nope',
			'logo-constructor',
			'logo-__proto__',
			'topic-nope',
			'topic-constructor',
			'topic-',
			'constructor',
			'folder-nope',
			'',
		]) {
			expect(parseIcon(unknown)).toBeNull();
			expect(isKnownIcon(unknown)).toBe(false);
		}
	});

	it('groups and searches every choice', () => {
		expect(ICON_GROUPS.folder.length).toBeGreaterThan(100);
		expect(ICON_GROUPS.logo.length).toBeGreaterThan(100);
		expect(ICON_GROUPS.file.length).toBeGreaterThan(100);
		expect(ICON_GROUPS.topic.length).toBeGreaterThan(100);
		expect(iconGroup('topic-briefcase')).toBe('topic');
		expect(iconGroup('logo-django')).toBe('logo');
		expect(iconGroup('folder-docs')).toBe('folder');
		expect(iconGroup('typescript')).toBe('file');
		expect(iconGroup('symbol-game')).toBe('file');
	});

	it('every offered choice parses back', () => {
		for (const [group, icons] of Object.entries(ICON_GROUPS)) {
			for (const icon of icons) expect(parseIcon(icon.id)?.kind).toBe(group);
		}
	});

	it('matches on label and id', () => {
		const fastapi = parseIcon('logo-fastapi');
		expect(fastapi && iconMatches(fastapi, ['fast'])).toBe(true);
		expect(fastapi && iconMatches(fastapi, ['logo-fast'])).toBe(true);
		expect(fastapi && iconMatches(fastapi, ['laravel'])).toBe(false);
		expect(fastapi && iconMatches(fastapi, [])).toBe(true);
		expect(searchTerms('  Fast  API ')).toEqual(['fast', 'api']);
	});

	it('finds topics by their group and upstream aliases', () => {
		const school = parseIcon('topic-school');
		const cash = parseIcon('topic-cash');
		expect(school && iconMatches(school, ['education'])).toBe(true);
		expect(cash && iconMatches(cash, ['money'])).toBe(true);
		expect(cash && iconMatches(cash, ['education'])).toBe(false);
	});
});
