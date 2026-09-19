import { describe, expect, it } from 'vitest';

import {
	DEFAULT_SETTINGS,
	MAX_ICON_SIZE,
	MIN_ICON_SIZE,
	parsePluginData,
	parseSettings,
} from '../src/settings/types';

describe('settings validation', () => {
	it('fills in every missing field', () => {
		expect(parseSettings(undefined)).toEqual(DEFAULT_SETTINGS);
		expect(parseSettings({})).toEqual(DEFAULT_SETTINGS);
		expect(parseSettings('garbage')).toEqual(DEFAULT_SETTINGS);
	});

	it('ignores values of the wrong type', () => {
		expect(parseSettings({ autoFolderIcons: 'yes', iconSize: 'big' })).toEqual(DEFAULT_SETTINGS);
	});

	it('clamps and rounds the icon size', () => {
		expect(parseSettings({ iconSize: 0 }).iconSize).toBe(MIN_ICON_SIZE);
		expect(parseSettings({ iconSize: 999 }).iconSize).toBe(MAX_ICON_SIZE);
		expect(parseSettings({ iconSize: 18.6 }).iconSize).toBe(19);
		expect(parseSettings({ iconSize: Number.NaN }).iconSize).toBe(DEFAULT_SETTINGS.iconSize);
	});

	it('keeps values it can use', () => {
		expect(parseSettings({ autoFolderIcons: false, fileIcons: true, iconSize: 20 })).toEqual({
			autoFolderIcons: false,
			fileIcons: true,
			iconSize: 20,
		});
	});
});

describe('data.json parsing', () => {
	it('survives a malformed file without losing what it can read', () => {
		expect(parsePluginData(null)).toEqual({ settings: DEFAULT_SETTINGS, icons: {} });
		expect(parsePluginData({ icons: 'corrupt', settings: 42 })).toEqual({
			settings: DEFAULT_SETTINGS,
			icons: {},
		});
		expect(parsePluginData({ settings: { iconSize: 24 }, icons: { Notes: 'folder-docs' } })).toEqual({
			settings: { ...DEFAULT_SETTINGS, iconSize: 24 },
			icons: { Notes: 'folder-docs' },
		});
	});
});
