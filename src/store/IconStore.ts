// The plugin's state: settings plus the path -> icon map, persisted through Obsidian.
//
// Pattern: a small Observer. The picker, the settings tab and the vault event handlers all
// mutate this one place and everything that draws subscribes, so no component has to know who
// else needs repainting. The transforms themselves live in `assignments.ts`, unaware of
// Obsidian; this class only owns loading, saving and notifying.

import type { Plugin } from 'obsidian';
import type { PluginData, ShardIconsSettings } from '../settings/types';
import { parsePluginData } from '../settings/types';
import type { IconAssignments } from './assignments';
import { assignmentFor, deleteAssignments, renameAssignments, setAssignment } from './assignments';

type Listener = () => void;

export class IconStore {
	private data: PluginData = parsePluginData(null);
	private readonly listeners = new Set<Listener>();

	constructor(private readonly plugin: Plugin) {}

	/** Never throws: an unreadable `data.json` yields defaults rather than a plugin that fails to load. */
	async load(): Promise<void> {
		let raw: unknown = null;
		try {
			raw = await this.plugin.loadData();
		} catch (error) {
			console.error('Shard Icons: could not read data.json, starting from defaults', error);
		}
		this.data = parsePluginData(raw);
	}

	get settings(): ShardIconsSettings {
		return this.data.settings;
	}

	get icons(): IconAssignments {
		return this.data.icons;
	}

	iconFor(path: string): string | null {
		return assignmentFor(this.data.icons, path);
	}

	onChange(listener: Listener): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	setIcon(path: string, icon: string | null): Promise<void> {
		return this.commit({ icons: setAssignment(this.data.icons, path, icon) });
	}

	/** A renamed or moved folder keeps its icon, and so does everything under it. */
	handleRename(from: string, to: string): Promise<void> {
		return this.commit({ icons: renameAssignments(this.data.icons, from, to) });
	}

	handleDelete(path: string): Promise<void> {
		return this.commit({ icons: deleteAssignments(this.data.icons, path) });
	}

	clearIcons(): Promise<void> {
		return this.commit({ icons: {} });
	}

	updateSettings(patch: Partial<ShardIconsSettings>): Promise<void> {
		return this.commit({ settings: { ...this.data.settings, ...patch } });
	}

	private async commit(patch: Partial<PluginData>): Promise<void> {
		const next = { ...this.data, ...patch };
		if (next.icons === this.data.icons && next.settings === this.data.settings) return;
		this.data = next;
		for (const listener of this.listeners) listener();
		try {
			await this.plugin.saveData(this.data);
		} catch (error) {
			console.error('Shard Icons: could not save data.json', error);
		}
	}
}
