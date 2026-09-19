// jsdom has no `createDiv`/`createSpan`: those come from Obsidian's DOM extensions. This adds
// just enough of them for the explorer decoration tests to exercise the real module.

interface CreateOptions {
	cls?: string;
	text?: string;
	attr?: Record<string, string>;
}

function create(parent: Element, tag: string, options: CreateOptions = {}): HTMLElement {
	const el = parent.ownerDocument.createElement(tag);
	if (options.cls) el.className = options.cls;
	if (options.text) el.textContent = options.text;
	for (const [name, value] of Object.entries(options.attr ?? {})) el.setAttribute(name, value);
	parent.appendChild(el);
	return el;
}

export function installObsidianDom(): void {
	const proto = globalThis.Element.prototype as unknown as Record<string, unknown>;
	proto['createDiv'] = function (this: Element, options?: CreateOptions) {
		return create(this, 'div', options);
	};
	proto['createSpan'] = function (this: Element, options?: CreateOptions) {
		return create(this, 'span', options);
	};
}
