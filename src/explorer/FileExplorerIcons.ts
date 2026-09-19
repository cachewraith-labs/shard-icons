// Keeps every open file-explorer pane decorated.
//
// Pattern: an Observer over the explorer's own container, coalesced into one animation frame,
// with a full pass only on events that can change many rows at once. The explorer recycles
// rows as you scroll, so polling or rescanning the whole tree per mutation would be the
// expensive way to do this; watching added nodes and reconciling by key is the cheap one.

import type { App } from 'obsidian';
import type { DecorationContext } from './decorate';
import { decorateTree, ICON_CLASS, undecorateTree } from './decorate';

const EXPLORER_VIEW = 'file-explorer';
/** Past this many queued subtrees, one pass over the pane beats visiting each of them. */
const FULL_PASS_THRESHOLD = 64;

export class FileExplorerIcons {
	private readonly observers = new Map<HTMLElement, MutationObserver>();
	private readonly pending = new Set<Element>();
	private frame: number | null = null;
	private stopped = false;

	constructor(
		private readonly app: App,
		private readonly context: () => DecorationContext,
	) {}

	/** Decorates every pane and starts watching the ones not watched yet. */
	refresh(): void {
		if (this.stopped) return;
		const live = new Set<HTMLElement>();
		for (const container of this.containers()) {
			live.add(container);
			this.watch(container);
			decorateTree(container, this.context());
		}
		for (const [container, observer] of this.observers) {
			if (!live.has(container)) {
				observer.disconnect();
				this.observers.delete(container);
			}
		}
	}

	stop(): void {
		this.stopped = true;
		// Every document a pane has lived in, including popout windows; a pane may also have
		// been detached since, so the main document is always swept as well.
		const documents = new Set<Document>([document]);
		for (const [container, observer] of this.observers) {
			documents.add(container.ownerDocument);
			observer.disconnect();
		}
		for (const container of this.containers()) documents.add(container.ownerDocument);
		this.observers.clear();
		this.pending.clear();
		if (this.frame !== null) window.cancelAnimationFrame(this.frame);
		this.frame = null;
		for (const doc of documents) undecorateTree(doc);
	}

	private containers(): HTMLElement[] {
		return this.app.workspace.getLeavesOfType(EXPLORER_VIEW).map((leaf) => leaf.view.containerEl);
	}

	private watch(container: HTMLElement): void {
		if (this.observers.has(container)) return;
		const observer = new MutationObserver((records) => this.onMutations(records));
		observer.observe(container, { childList: true, subtree: true });
		this.observers.set(container, observer);
	}

	private onMutations(records: MutationRecord[]): void {
		for (const record of records) {
			// Ignore the nodes this plugin just drew, so a render cannot feed itself.
			if (record.target.instanceOf(Element) && record.target.closest(`.${ICON_CLASS}`)) continue;
			for (const node of Array.from(record.addedNodes)) {
				if (node.instanceOf(Element) && !node.classList.contains(ICON_CLASS)) this.pending.add(node);
			}
		}
		if (this.pending.size > 0) this.schedule();
	}

	private schedule(): void {
		if (this.frame !== null || this.stopped) return;
		this.frame = window.requestAnimationFrame(() => {
			this.frame = null;
			this.flush();
		});
	}

	private flush(): void {
		if (this.stopped) return;
		const nodes = Array.from(this.pending);
		this.pending.clear();
		if (nodes.length >= FULL_PASS_THRESHOLD) {
			this.refresh();
			return;
		}
		const context = this.context();
		for (const node of nodes) {
			if (node.isConnected) decorateTree(node, context);
		}
	}
}
