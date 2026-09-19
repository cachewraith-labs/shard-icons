import { describe, expect, it } from 'vitest';

import { planForFile, planForFolder } from '../src/explorer/resolve';
import { DEFAULT_SETTINGS } from '../src/settings/types';

const settings = DEFAULT_SETTINGS;
const off = { ...DEFAULT_SETTINGS, autoFolderIcons: false };
const withFiles = { ...DEFAULT_SETTINGS, fileIcons: true };

describe('planForFolder', () => {
	it('prefers a chosen icon over the name match', () => {
		const plan = planForFolder('src', { src: 'logo-rust' }, settings, false);
		expect(plan).toMatchObject({ kind: 'folder', key: 'folder:logo-rust' });
	});

	it('falls back to the theme icon for a known folder name', () => {
		expect(planForFolder('Notes/src', {}, settings, false)).toMatchObject({ key: 'folder:folder-src' });
		expect(planForFolder('Notes/whatever', {}, settings, false)).toBeNull();
	});

	it('draws nothing by name when automatic icons are off', () => {
		expect(planForFolder('src', {}, off, false)).toBeNull();
		// A chosen icon is still honoured.
		expect(planForFolder('src', { src: 'symbol-game' }, off, false)).toMatchObject({
			key: 'folder:symbol-game',
		});
	});

	it('shows a plain folder for an id it cannot draw, instead of nothing', () => {
		expect(planForFolder('src', { src: 'logo-from-the-future' }, settings, false)).toMatchObject({
			key: 'folder:folder',
		});
	});
});

describe('planForFile', () => {
	it('is off unless the setting is on', () => {
		expect(planForFile('Notes/main.rs', {}, settings, false)).toBeNull();
	});

	it('uses the theme name and extension rules', () => {
		expect(planForFile('Notes/main.rs', {}, withFiles, false)).toMatchObject({
			kind: 'material',
			name: 'rust',
		});
		expect(planForFile('Notes/note.md', {}, withFiles, false)).toMatchObject({ kind: 'material' });
	});

	it('prefers a chosen icon over the name match', () => {
		expect(planForFile('Notes/main.rs', { 'Notes/main.rs': 'python' }, withFiles, false)).toMatchObject({
			kind: 'material',
			name: 'python',
		});
	});

	it('honours a chosen icon even with automatic file icons off', () => {
		expect(planForFile('todo.md', { 'todo.md': 'docker' }, settings, false)).toMatchObject({
			key: 'material:docker',
		});
	});

	it('shows the generic file icon for an id it cannot draw, instead of nothing', () => {
		for (const id of ['from-the-future', 'folder-src']) {
			expect(planForFile('todo.md', { 'todo.md': id }, settings, false)).toMatchObject({
				key: 'material:file',
			});
		}
	});
});
