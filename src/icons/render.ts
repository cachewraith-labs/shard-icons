// Draws an icon into a DOM element.
//
// Pattern: `switch` over the discriminated union, plus a parsed-SVG cache keyed by icon name.
// Markup only ever comes from `src/generated/icons.ts`, and it is parsed with `DOMParser` and
// cloned — never assigned to `innerHTML` — so nothing from `data.json` can reach the DOM as
// markup (OWASP A05).

import { LOGO_SVG, TOPIC_SVG } from '../generated/icons';
import type { Icon } from './icons';
import { iconSvg } from './material';

/** Icon name -> parsed `<svg>`, cloned per use. Parsing ~300 icons for the picker is not free. */
const parsed = new Map<string, SVGElement | null>();

function parseSvg(markup: string): SVGElement | null {
	const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
	const root = doc.documentElement;
	if (root.nodeName !== 'svg' || doc.getElementsByTagName('parsererror').length > 0) return null;
	// The generated table is the only source, but an icon package is still a dependency:
	// refuse anything scriptable rather than trust the build (OWASP A03/A08).
	if (root.getElementsByTagName('script').length > 0) return null;
	return document.importNode(root, true) as unknown as SVGElement;
}

function materialSvg(name: string): SVGElement | null {
	if (!parsed.has(name)) {
		const markup = iconSvg(name);
		parsed.set(name, markup === null ? null : parseSvg(markup));
	}
	return parsed.get(name)?.cloneNode(true) as SVGElement | null;
}

/** A folder built at build time — a logo or a topic — cached under its id. */
function prebuiltSvg(id: string, markup: string): SVGElement | null {
	if (!parsed.has(id)) parsed.set(id, parseSvg(markup));
	return parsed.get(id)?.cloneNode(true) as SVGElement | null;
}

function buildIcon(icon: Icon): SVGElement | null {
	switch (icon.kind) {
		case 'folder':
		case 'file':
			return materialSvg(icon.name);
		case 'logo':
			return prebuiltSvg(icon.id, LOGO_SVG[icon.slug] ?? '');
		case 'topic':
			return prebuiltSvg(icon.id, TOPIC_SVG[icon.name] ?? '');
	}
}

function place(target: HTMLElement, svg: SVGElement | null): boolean {
	if (!svg) return false;
	target.replaceChildren(svg);
	svg.classList.add('shard-icon-svg');
	return true;
}

/** Replaces `target`'s contents with the icon. `false` means this build cannot draw it. */
export function renderIcon(target: HTMLElement, icon: Icon): boolean {
	return place(target, buildIcon(icon));
}

/** Frees the parsed-SVG cache when the plugin unloads. */
export function clearIconCache(): void {
	parsed.clear();
}
