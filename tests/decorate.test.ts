// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import type { DecorationContext } from '../src/explorer/decorate';
import { decorateTitle, decorateTree, undecorateTree } from '../src/explorer/decorate';
import { DEFAULT_SETTINGS } from '../src/settings/types';
import { installObsidianDom } from './support/obsidianDom';

beforeAll(installObsidianDom);

function folderRow(path: string): HTMLElement {
	document.body.innerHTML = '';
	const row = document.createElement('div');
	row.className = 'nav-folder-title';
	row.setAttribute('data-path', path);
	const indicator = document.createElement('div');
	indicator.className = 'nav-folder-collapse-indicator';
	const content = document.createElement('div');
	content.className = 'nav-folder-title-content';
	content.textContent = path;
	row.append(indicator, content);
	document.body.appendChild(row);
	return row;
}

function context(patch: Partial<DecorationContext> = {}): DecorationContext {
	return { settings: DEFAULT_SETTINGS, icons: {}, light: false, ...patch };
}

describe('decorateTitle', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('inserts one icon before the title content', () => {
		const row = folderRow('src');
		decorateTitle(row, context());
		const icon = row.querySelector('.shard-icon');
		expect(icon).not.toBeNull();
		expect(icon?.nextElementSibling?.className).toBe('nav-folder-title-content');
		expect(icon?.querySelector('svg')).not.toBeNull();
	});

	it('is idempotent: repeated passes neither duplicate nor re-render', () => {
		const row = folderRow('src');
		decorateTitle(row, context());
		const first = row.querySelector('.shard-icon');
		const svg = first?.querySelector('svg');
		for (let i = 0; i < 5; i++) decorateTitle(row, context());
		expect(row.querySelectorAll('.shard-icon')).toHaveLength(1);
		expect(row.querySelector('.shard-icon')).toBe(first);
		// Same key, so the SVG node itself is left alone.
		expect(row.querySelector('.shard-icon svg')).toBe(svg);
	});

	it('swaps the icon in place when the assignment changes', () => {
		const row = folderRow('src');
		decorateTitle(row, context());
		const host = row.querySelector('.shard-icon');
		decorateTitle(row, context({ icons: { src: 'logo-rust' } }));
		expect(row.querySelectorAll('.shard-icon')).toHaveLength(1);
		expect(row.querySelector('.shard-icon')).toBe(host);
		expect(host?.getAttribute('data-shard-icon')).toBe('folder:logo-rust');
	});

	it('removes the icon when nothing should be shown any more', () => {
		const row = folderRow('src');
		decorateTitle(row, context());
		expect(row.querySelector('.shard-icon')).not.toBeNull();
		decorateTitle(row, context({ settings: { ...DEFAULT_SETTINGS, autoFolderIcons: false } }));
		expect(row.querySelector('.shard-icon')).toBeNull();
	});

	it('marks the row, so the stylesheet can hide the icon it replaces', () => {
		const row = folderRow('src');
		decorateTitle(row, context());
		expect(row.classList.contains('shard-has-icon')).toBe(true);
		decorateTitle(row, context({ settings: { ...DEFAULT_SETTINGS, autoFolderIcons: false } }));
		expect(row.classList.contains('shard-has-icon')).toBe(false);
	});

	it('leaves an undecorated row unmarked', () => {
		const row = folderRow('Notify');
		decorateTitle(row, context());
		expect(row.querySelector('.shard-icon')).toBeNull();
		expect(row.classList.contains('shard-has-icon')).toBe(false);
	});

	it('draws a symbol folder from Obsidian’s Lucide icons', () => {
		const row = folderRow('Games');
		decorateTitle(row, context({ icons: { Games: 'symbol-game' } }));
		expect(row.querySelector('.shard-icon svg path')).not.toBeNull();
	});

	it('leaves no host behind when the glyph is missing', () => {
		const row = folderRow('Money');
		decorateTitle(row, context({ icons: { Money: 'symbol-money' } }));
		expect(row.querySelector('.shard-icon')).toBeNull();
	});

	it('never puts markup from the store into the DOM', () => {
		const row = folderRow('Evil');
		decorateTitle(row, context({ icons: { Evil: '<img src=x onerror=alert(1)>' } }));
		// An unknown id falls back to the plain folder; nothing from data.json is parsed.
		expect(row.querySelector('img')).toBeNull();
		expect(row.querySelector('.shard-icon')?.getAttribute('data-shard-icon')).toBe('folder:folder');
	});
});

describe('file rows', () => {
	function fileRow(path: string): HTMLElement {
		document.body.innerHTML = '';
		const row = document.createElement('div');
		row.className = 'nav-file-title';
		row.setAttribute('data-path', path);
		const content = document.createElement('div');
		content.className = 'nav-file-title-content';
		row.appendChild(content);
		document.body.appendChild(row);
		return row;
	}

	it('draws a chosen file icon with automatic file icons off', () => {
		const row = fileRow('Notes/todo.md');
		decorateTitle(row, context());
		expect(row.querySelector('.shard-icon')).toBeNull();
		decorateTitle(row, context({ icons: { 'Notes/todo.md': 'docker' } }));
		expect(row.querySelector('.shard-icon')?.getAttribute('data-shard-icon')).toBe('material:docker');
		expect(row.classList.contains('shard-has-icon')).toBe(true);
	});
});

describe('decorateTree / undecorateTree', () => {
	it('decorates every row under a node and takes them all back', () => {
		document.body.innerHTML = '';
		for (const path of ['src', 'docs', 'images']) document.body.appendChild(folderRowIn(path));
		decorateTree(document.body, context());
		expect(document.querySelectorAll('.shard-icon')).toHaveLength(3);
		undecorateTree(document);
		expect(document.querySelectorAll('.shard-icon')).toHaveLength(0);
		expect(document.querySelectorAll('.shard-has-icon')).toHaveLength(0);
	});
});

function folderRowIn(path: string): HTMLElement {
	const row = document.createElement('div');
	row.className = 'nav-folder-title';
	row.setAttribute('data-path', path);
	const content = document.createElement('div');
	content.className = 'nav-folder-title-content';
	row.appendChild(content);
	return row;
}
