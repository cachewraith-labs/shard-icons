import { describe, expect, it } from 'vitest';

import { folderColors } from '../src/icons/folderShape';

describe('folder colors', () => {
	it('keeps a mid-tone brand and pales the emblem', () => {
		const { folder, motive } = folderColors('#039be5');
		expect(folder).toBe('#039be5');
		// The emblem is the brand mixed 70% toward white, so it is lighter than the folder.
		expect(motive).toBe('#b3e1f7');
	});

	it('falls back to blue-grey for near-black and near-white brands', () => {
		expect(folderColors('#000000')).toEqual({ folder: '#546e7a', motive: '#cfd8dc' });
		expect(folderColors('#ffffff')).toEqual({ folder: '#546e7a', motive: '#cfd8dc' });
	});

	it('darkens the emblem on a light brand so it still reads', () => {
		const { folder, motive } = folderColors('#f7df1e');
		expect(folder).toBe('#f7df1e');
		expect(motive).toBe('#5e550b');
	});

	it('accepts a hex with or without the hash', () => {
		expect(folderColors('039be5')).toEqual(folderColors('#039be5'));
	});
});
