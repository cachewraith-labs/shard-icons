import { describe, expect, it } from 'vitest';

import {
	DEFAULT_FOLDER_ICON,
	EXTRA_FOLDER_NAMES,
	FILE_ICONS,
	fileIconLabel,
	FOLDER_ICONS,
	fileIconName,
	folderIconByName,
	folderIconLabel,
	iconSvg,
	isFileIcon,
	isFolderIcon,
} from '../src/icons/material';

describe('material icon resolution', () => {
	it('prefers exact file names, case-insensitively', () => {
		expect(fileIconName('package.json')).toBe('nodejs');
		expect(fileIconName('Dockerfile')).toBe('docker');
		expect(fileIconName('.gitignore')).toBe('git');
	});

	it('uses the longest matching extension', () => {
		expect(fileIconName('main.rs')).toBe('rust');
		expect(fileIconName('App.tsx')).toBe('react_ts');
		expect(fileIconName('types.d.ts')).not.toBe(fileIconName('index.ts'));
		expect(fileIconName('backup.tar.gz')).toBe(fileIconName('backup.gz'));
	});

	it('falls back to the generic file icon', () => {
		expect(fileIconName('README')).toBeTruthy();
		expect(fileIconName('mystery.qwertyzxcv')).toBe('file');
	});

	it('knows well-known folders and offers a picker list', () => {
		expect(folderIconByName('src')).toBe('folder-src');
		expect(folderIconByName('SRC')).toBe('folder-src');
		expect(folderIconByName('node_modules')).toBe('folder-node');
		expect(folderIconByName('my-random-folder')).toBeNull();
	});

	it('fills gaps in the theme without overriding it', () => {
		expect(folderIconByName('Task')).toBe('folder-tasks');
		expect(folderIconByName('tasks')).toBe('folder-tasks');
		expect(folderIconByName('Workers')).toBe('folder-job');
		// The theme's own answer stands.
		expect(folderIconByName('Service')).toBe('folder-controller');
		for (const [name, icon] of Object.entries(EXTRA_FOLDER_NAMES)) {
			expect(isFolderIcon(icon), `${name} -> ${icon}`).toBe(true);
			expect(folderIconByName(name)).toBe(icon);
		}
	});

	it('never reads an inherited member as an icon name', () => {
		for (const name of ['constructor', '__proto__', 'toString', 'hasOwnProperty']) {
			expect(folderIconByName(name)).toBeNull();
			expect(folderIconByName(name, true)).toBeNull();
			expect(fileIconName(name)).toBe('file');
			expect(fileIconName(`notes.${name}`)).toBe('file');
		}
		expect(FOLDER_ICONS.length).toBeGreaterThan(100);
		expect(FOLDER_ICONS.every((name) => !name.endsWith('-open'))).toBe(true);
		expect(FOLDER_ICONS.every((name) => !name.endsWith('_light'))).toBe(true);
		expect(DEFAULT_FOLDER_ICON).toBe('folder');
	});

	it('ships markup for every icon it claims to know', () => {
		expect(isFolderIcon('folder-src')).toBe(true);
		expect(isFolderIcon('rust')).toBe(false);
		expect(isFolderIcon('folder-not-a-real-icon')).toBe(false);
		expect(FOLDER_ICONS.every((name) => isFolderIcon(name))).toBe(true);
		expect(iconSvg('folder-src')).toMatch(/^<svg/);
		expect(iconSvg('nope')).toBeNull();
	});

	it('follows aliases to the shared file', () => {
		// `folder-development` reuses another icon's file (`folder-development.clone.svg`).
		expect(iconSvg('folder-development')).toMatch(/^<svg/);
	});

	it('labels icons without their prefix', () => {
		expect(folderIconLabel('folder-node')).toBe('node');
		expect(folderIconLabel('folder-github-actions')).toBe('github actions');
		expect(folderIconLabel('folder')).toBe('folder');
	});
});

describe('file icon choices', () => {
	it('offers every drawable file icon once, and no folders or light substitutes', () => {
		expect(FILE_ICONS.length).toBeGreaterThan(100);
		expect(new Set(FILE_ICONS).size).toBe(FILE_ICONS.length);
		expect(FILE_ICONS).toContain('file');
		expect(FILE_ICONS).toContain('typescript');
		for (const id of FILE_ICONS) {
			expect(isFileIcon(id)).toBe(true);
			expect(id.endsWith('_light')).toBe(false);
		}
	});

	it('refuses folders and unknown ids', () => {
		expect(isFileIcon('folder-src')).toBe(false);
		expect(isFileIcon('not-an-icon')).toBe(false);
		for (const id of ['toString', 'constructor', '__proto__', 'hasOwnProperty']) {
			expect(isFileIcon(id)).toBe(false);
		}
	});

	it('labels ids for the picker', () => {
		expect(fileIconLabel('typescript-def')).toBe('typescript def');
	});
});
