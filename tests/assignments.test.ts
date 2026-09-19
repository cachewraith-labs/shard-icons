import { describe, expect, it } from 'vitest';

import {
	assignmentFor,
	basename,
	deleteAssignments,
	parentPath,
	parseAssignments,
	renameAssignments,
	setAssignment,
} from '../src/store/assignments';

describe('path helpers', () => {
	it('splits vault paths', () => {
		expect(basename('Notes/Projects/Shard')).toBe('Shard');
		expect(basename('Shard')).toBe('Shard');
		expect(parentPath('Notes/Projects/Shard')).toBe('Notes/Projects');
		expect(parentPath('Shard')).toBe('');
	});
});

describe('assignments', () => {
	const icons = { Projects: 'folder-src', 'Projects/Api': 'logo-fastapi', Archive: 'symbol-archive' };

	it('sets and clears without touching the original', () => {
		const added = setAssignment(icons, 'Notes', 'folder-docs');
		expect(added['Notes']).toBe('folder-docs');
		expect(icons).not.toHaveProperty('Notes');

		const cleared = setAssignment(icons, 'Archive', null);
		expect(cleared).not.toHaveProperty('Archive');
		expect(Object.keys(cleared)).toHaveLength(2);
	});

	it('returns the same object when nothing changed', () => {
		expect(setAssignment(icons, 'Projects', 'folder-src')).toBe(icons);
		expect(setAssignment(icons, 'Nothing', null)).toBe(icons);
		expect(renameAssignments(icons, 'Projects', 'Projects')).toBe(icons);
		expect(renameAssignments(icons, 'Elsewhere', 'Somewhere')).toBe(icons);
		expect(deleteAssignments(icons, 'Elsewhere')).toBe(icons);
	});

	it('carries descendants through a rename', () => {
		const moved = renameAssignments(icons, 'Projects', 'Work/Projects');
		expect(moved).toEqual({
			'Work/Projects': 'folder-src',
			'Work/Projects/Api': 'logo-fastapi',
			Archive: 'symbol-archive',
		});
	});

	it('renames a descendant without touching its parent', () => {
		expect(renameAssignments(icons, 'Projects/Api', 'Projects/Backend')).toEqual({
			Projects: 'folder-src',
			'Projects/Backend': 'logo-fastapi',
			Archive: 'symbol-archive',
		});
	});

	it('does not treat a same-prefix sibling as a descendant', () => {
		const siblings = { Project: 'folder-src', 'Projects/Api': 'logo-fastapi' };
		expect(renameAssignments(siblings, 'Project', 'Renamed')).toEqual({
			Renamed: 'folder-src',
			'Projects/Api': 'logo-fastapi',
		});
		expect(deleteAssignments(siblings, 'Project')).toEqual({ 'Projects/Api': 'logo-fastapi' });
	});

	it('drops a folder and everything under it on delete', () => {
		expect(deleteAssignments(icons, 'Projects')).toEqual({ Archive: 'symbol-archive' });
	});
});

describe('parseAssignments', () => {
	it('keeps string pairs only', () => {
		expect(parseAssignments({ a: 'folder-src', b: 7, c: null, d: '', '': 'folder-src' })).toEqual({
			a: 'folder-src',
		});
	});

	it('falls back to empty for anything that is not an object', () => {
		for (const bad of [null, undefined, 'nope', 42, [1, 2], true]) {
			expect(parseAssignments(bad)).toEqual({});
		}
	});

	it('keeps ids this build cannot draw, so a newer version does not lose them', () => {
		expect(parseAssignments({ a: 'logo-from-the-future' })).toEqual({ a: 'logo-from-the-future' });
	});

	it('refuses keys that would write through to the prototype', () => {
		const parsed = parseAssignments(JSON.parse('{"__proto__":"folder-src","constructor":"folder-src"}'));
		expect(parsed).toEqual({});
		expect(({} as Record<string, unknown>)['folder-src']).toBeUndefined();
	});

	it('never reads an inherited member as an assignment', () => {
		expect(assignmentFor({}, 'toString')).toBeNull();
		expect(assignmentFor({}, 'constructor')).toBeNull();
		expect(assignmentFor({ toString: 'folder-src' }, 'toString')).toBe('folder-src');
	});
});
