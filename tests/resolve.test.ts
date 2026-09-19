import { describe, expect, it } from 'vitest';

import { planForFile, planForFolder } from '../src/explorer/resolve';
import { DEFAULT_SETTINGS } from '../src/settings/types';

const settings = DEFAULT_SETTINGS;
const off = { ...DEFAULT_SETTINGS, autoFolderIcons: false };
const withFiles = { ...DEFAULT_SETTINGS, fileIcons: true };

describe('planForFolder', () => {
	it('prefers a chosen icon over the name match', () => {
		const plan = planForFolder('src', { src: 'logo-rust' }, settings, false);
		expect(plan).toMatchObject({ key: 'icon:logo-rust', icon: { kind: 'logo' } });
	});

	it('falls back to the theme icon for a known folder name', () => {
		expect(planForFolder('Notes/src', {}, settings, false)).toMatchObject({ key: 'icon:folder-src' });
		expect(planForFolder('Notes/whatever', {}, settings, false)).toBeNull();
	});

	it('draws nothing by name when automatic icons are off', () => {
		expect(planForFolder('src', {}, off, false)).toBeNull();
		// A chosen icon is still honoured.
		expect(planForFolder('src', { src: 'logo-rust' }, off, false)).toMatchObject({
			key: 'icon:logo-rust',
		});
	});

	it('does not trip over a folder named after an object member', () => {
		for (const name of ['constructor', '__proto__']) {
			expect(() => planForFolder(`Notes/${name}`, {}, settings, false)).not.toThrow();
			expect(planForFolder(`Notes/${name}`, {}, settings, false)).toBeNull();
		}
	});

	it('lets a folder wear a file icon', () => {
		expect(
			planForFolder('Games/Minecraft', { 'Games/Minecraft': 'minecraft' }, off, false),
		).toMatchObject({
			key: 'icon:minecraft',
			icon: { kind: 'file' },
		});
	});

	it('matches a Minecraft folder to the Minecraft icon', () => {
		expect(planForFolder('Games/Minecraft', {}, settings, false)).toMatchObject({
			key: 'icon:minecraft',
		});
	});

	it('matches a Task folder to the tasks icon', () => {
		expect(planForFolder('Work/Task', {}, settings, false)).toMatchObject({ key: 'icon:folder-tasks' });
	});

	it('shows a plain folder for an id it cannot draw, instead of nothing', () => {
		expect(planForFolder('src', { src: 'logo-from-the-future' }, settings, false)).toMatchObject({
			key: 'icon:folder',
		});
	});
});

describe('planForFile', () => {
	it('is off unless the setting is on', () => {
		expect(planForFile('Notes/main.rs', {}, settings, false)).toBeNull();
	});

	it('uses the theme name and extension rules', () => {
		expect(planForFile('Notes/main.rs', {}, withFiles, false)).toMatchObject({ key: 'icon:rust' });
		expect(planForFile('Notes/note.md', {}, withFiles, false)).toMatchObject({ icon: { kind: 'file' } });
	});

	it('prefers a chosen icon over the name match', () => {
		expect(planForFile('Notes/main.rs', { 'Notes/main.rs': 'python' }, withFiles, false)).toMatchObject({
			key: 'icon:python',
		});
	});

	it('lets a file wear a folder icon or a logo', () => {
		expect(planForFile('todo.md', { 'todo.md': 'folder-tasks' }, settings, false)).toMatchObject({
			icon: { kind: 'folder' },
		});
		expect(planForFile('mods.md', { 'mods.md': 'logo-curseforge' }, settings, false)).toMatchObject({
			icon: { kind: 'logo' },
		});
	});

	it('honours a chosen icon even with automatic file icons off', () => {
		expect(planForFile('todo.md', { 'todo.md': 'docker' }, settings, false)).toMatchObject({
			key: 'icon:docker',
		});
	});

	it('shows the generic file icon for an id it cannot draw, instead of nothing', () => {
		for (const id of ['from-the-future', 'symbol-game']) {
			expect(planForFile('todo.md', { 'todo.md': id }, settings, false)).toMatchObject({
				key: 'icon:file',
			});
		}
	});
});
