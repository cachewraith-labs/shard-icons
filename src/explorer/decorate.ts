// Puts an icon into one file-explorer row, idempotently.
//
// Pattern: reconcile against a key held on the element (`data-shard-icon`), the way a diffing
// renderer does. Explorer rows are recycled as the list scrolls, so every pass has to be safe
// to repeat and must do nothing when the row already shows the right icon.

import { renderIcon } from '../icons/render';
import type { ShardIconsSettings } from '../settings/types';
import type { IconAssignments } from '../store/assignments';
import type { IconPlan } from './resolve';
import { planForFile, planForFolder } from './resolve';

export const ICON_CLASS = 'shard-icon';
/** Set on a row this plugin draws for, so the stylesheet can hide the icon it replaces. */
export const DECORATED_CLASS = 'shard-has-icon';
const KEY_ATTR = 'data-shard-icon';
const TITLE_SELECTOR = '.nav-folder-title[data-path], .nav-file-title[data-path]';

export interface DecorationContext {
	settings: ShardIconsSettings;
	icons: IconAssignments;
	light: boolean;
}

function planFor(title: HTMLElement, path: string, context: DecorationContext): IconPlan | null {
	return title.classList.contains('nav-folder-title')
		? planForFolder(path, context.icons, context.settings, context.light)
		: planForFile(path, context.icons, context.settings, context.light);
}

function existingHost(title: HTMLElement): HTMLElement | null {
	return title.querySelector<HTMLElement>(`:scope > .${ICON_CLASS}`);
}

function createHost(title: HTMLElement): HTMLElement {
	const host = title.createDiv({ cls: ICON_CLASS, attr: { 'aria-hidden': 'true' } });
	const content = title.querySelector(
		':scope > .nav-folder-title-content, :scope > .nav-file-title-content',
	);
	if (content) title.insertBefore(host, content);
	return host;
}

export function decorateTitle(title: HTMLElement, context: DecorationContext): void {
	const path = title.getAttribute('data-path');
	const plan = path ? planFor(title, path, context) : null;
	const host = existingHost(title);

	if (!plan) {
		host?.remove();
		title.classList.remove(DECORATED_CLASS);
		return;
	}
	if (host?.getAttribute(KEY_ATTR) === plan.key) {
		title.classList.add(DECORATED_CLASS);
		return;
	}

	const target = host ?? createHost(title);
	const drawn = renderIcon(target, plan.icon);
	if (drawn) target.setAttribute(KEY_ATTR, plan.key);
	else target.remove();
	title.classList.toggle(DECORATED_CLASS, drawn);
}

/** Decorates every explorer row in `root`, and `root` itself when it is one. */
export function decorateTree(root: Element, context: DecorationContext): void {
	if (root.matches(TITLE_SELECTOR)) decorateTitle(root as HTMLElement, context);
	for (const title of Array.from(root.querySelectorAll<HTMLElement>(TITLE_SELECTOR))) {
		decorateTitle(title, context);
	}
}

/** Takes back everything this plugin injected under `root`. */
export function undecorateTree(root: ParentNode): void {
	for (const host of Array.from(root.querySelectorAll(`.${ICON_CLASS}`))) host.remove();
	for (const title of Array.from(root.querySelectorAll(`.${DECORATED_CLASS}`))) {
		title.classList.remove(DECORATED_CLASS);
	}
}
