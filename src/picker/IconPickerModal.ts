// The "Change icon…" dialog: search, three tabs, a grid, and a reset.
//
// Pattern: one Modal subclass holding view state (query, tab, active cell) and rebuilding the
// grid from it — the same shape as the React picker in cachewraith-explorer, minus React.
// Focus stays in the search box and the arrow keys drive a virtual cursor, so the dialog is
// fully keyboard-driven without a roving tabindex across several hundred buttons.

import type { App } from 'obsidian';
import { Modal, setIcon } from 'obsidian';
import { FOLDER_ICON_GROUPS } from '../icons/groups';
import type { FolderIcon, FolderIconGroup } from '../icons/icons';
import { folderIconGroup, folderIconMatches, searchTerms } from '../icons/icons';
import { DEFAULT_FOLDER_ICON, folderIconByName } from '../icons/material';
import { renderFolderIcon } from '../icons/render';
import { basename } from '../store/assignments';

const TABS: { group: FolderIconGroup; label: string; hint: string }[] = [
	{ group: 'theme', label: 'Folders', hint: 'src, images, music…' },
	{ group: 'logo', label: 'Logos', hint: 'fastapi, laravel, godot…' },
	{ group: 'symbol', label: 'Symbols', hint: 'game, document, money…' },
];

export class IconPickerModal extends Modal {
	private query = '';
	private tab: FolderIconGroup;
	private active = 0;
	private matches: readonly FolderIcon[] = [];

	private searchEl!: HTMLInputElement;
	private gridEl!: HTMLElement;
	private resetEl!: HTMLButtonElement;
	private readonly cells: HTMLElement[] = [];
	private readonly suggested: string | null;

	constructor(
		app: App,
		private readonly folderPath: string,
		private readonly current: string | null,
		private readonly onChoose: (icon: string | null) => void,
	) {
		super(app);
		this.tab = current ? folderIconGroup(current) : 'theme';
		this.suggested = folderIconByName(basename(folderPath));
	}

	override onOpen(): void {
		this.modalEl.addClass('shard-picker');
		this.titleEl.setText(`Icon for "${basename(this.folderPath)}"`);

		const search = this.contentEl.createDiv({ cls: 'shard-picker-search' });
		setIcon(search.createSpan({ cls: 'shard-picker-search-icon' }), 'search');
		this.searchEl = search.createEl('input', {
			type: 'text',
			attr: { 'aria-label': 'Search icons', spellcheck: 'false' },
		});
		this.searchEl.addEventListener('input', () => {
			this.query = this.searchEl.value;
			this.active = 0;
			this.renderGrid();
		});
		this.searchEl.addEventListener('keydown', (event) => this.onKeyDown(event));

		const tabs = this.contentEl.createDiv({ cls: 'shard-picker-tabs', attr: { role: 'tablist' } });
		for (const { group, label } of TABS) {
			const button = tabs.createEl('button', {
				cls: 'shard-picker-tab',
				attr: { type: 'button', role: 'tab' },
			});
			button.createSpan({ text: label });
			button.createSpan({ cls: 'shard-picker-count', text: String(FOLDER_ICON_GROUPS[group].length) });
			button.toggleClass('is-active', this.tab === group);
			button.setAttribute('aria-selected', String(this.tab === group));
			button.addEventListener('click', () => this.selectTab(group, tabs));
		}

		this.gridEl = this.contentEl.createDiv({
			cls: 'shard-picker-grid',
			attr: { role: 'listbox', 'aria-label': 'Folder icons' },
		});

		const footer = this.contentEl.createDiv({ cls: 'shard-picker-footer' });
		this.resetEl = footer.createEl('button', {
			cls: 'shard-picker-reset',
			text: 'Reset to default',
			attr: { type: 'button' },
		});
		this.resetEl.disabled = this.current === null;
		this.resetEl.addEventListener('click', () => this.choose(null));
		const cancel = footer.createEl('button', { text: 'Cancel', attr: { type: 'button' } });
		cancel.addEventListener('click', () => this.close());

		this.renderGrid();
		this.searchEl.focus();
	}

	override onClose(): void {
		this.contentEl.empty();
	}

	private selectTab(group: FolderIconGroup, tabs: HTMLElement): void {
		this.tab = group;
		this.active = 0;
		for (const [index, button] of Array.from(tabs.children).entries()) {
			const selected = TABS[index]?.group === group;
			button.toggleClass('is-active', selected);
			button.setAttribute('aria-selected', String(selected));
		}
		this.renderGrid();
		this.searchEl.focus();
	}

	/** The icon the theme would pick for this folder's name comes first. */
	private computeMatches(): readonly FolderIcon[] {
		const terms = searchTerms(this.query);
		const matches = FOLDER_ICON_GROUPS[this.tab].filter((icon) => folderIconMatches(icon, terms));
		const suggested = matches.find((icon) => icon.id === this.suggested);
		return suggested ? [suggested, ...matches.filter((icon) => icon !== suggested)] : matches;
	}

	private renderGrid(): void {
		this.matches = this.computeMatches();
		this.cells.length = 0;
		this.gridEl.empty();

		const hint = TABS.find((tab) => tab.group === this.tab)?.hint ?? '';
		this.searchEl.placeholder = `Search ${FOLDER_ICON_GROUPS[this.tab].length} icons: ${hint}`;

		if (this.matches.length === 0) {
			this.gridEl.createDiv({ cls: 'shard-picker-empty', text: `No icons match "${this.query}"` });
			return;
		}

		for (const icon of this.matches) {
			const cell = this.gridEl.createEl('button', {
				cls: 'shard-picker-cell',
				attr: { type: 'button', role: 'option', title: icon.label, tabindex: '-1' },
			});
			renderFolderIcon(cell.createDiv({ cls: 'shard-picker-cell-icon' }), icon);
			cell.createDiv({ cls: 'shard-picker-cell-label', text: icon.label });
			if (icon.id === this.current) {
				cell.addClass('is-selected');
				setIcon(cell.createSpan({ cls: 'shard-picker-check' }), 'check');
			} else if (icon.id === this.suggested && icon.id !== DEFAULT_FOLDER_ICON) {
				cell.createSpan({ cls: 'shard-picker-badge', text: 'match' });
			}
			cell.setAttribute('aria-selected', String(icon.id === this.current));
			cell.addEventListener('click', () => this.choose(icon.id));
			this.cells.push(cell);
		}
		this.setActive(Math.min(this.active, this.cells.length - 1));
	}

	private columns(): number {
		const template = window.getComputedStyle(this.gridEl).gridTemplateColumns;
		return Math.max(1, template.split(' ').filter(Boolean).length);
	}

	private setActive(index: number): void {
		const clamped = Math.max(0, Math.min(index, this.cells.length - 1));
		this.cells[this.active]?.removeClass('is-active');
		this.active = clamped;
		const cell = this.cells[clamped];
		cell?.addClass('is-active');
		cell?.scrollIntoView({ block: 'nearest' });
	}

	private onKeyDown(event: KeyboardEvent): void {
		const step = (delta: number) => {
			event.preventDefault();
			this.setActive(this.active + delta);
		};
		switch (event.key) {
			case 'ArrowRight':
				return step(1);
			case 'ArrowLeft':
				return step(-1);
			case 'ArrowDown':
				return step(this.columns());
			case 'ArrowUp':
				return step(-this.columns());
			case 'Home':
				return step(-this.active);
			case 'End':
				return step(this.cells.length);
			case 'Enter': {
				const icon = this.matches[this.active];
				if (icon) {
					event.preventDefault();
					this.choose(icon.id);
				}
				return;
			}
			default:
				return;
		}
	}

	private choose(icon: string | null): void {
		this.onChoose(icon);
		this.close();
	}
}
