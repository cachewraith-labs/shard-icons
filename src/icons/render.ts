// Draws an icon into a DOM element.
//
// Pattern: `switch` over the discriminated union, plus a parsed-SVG cache keyed by icon name.
// Markup only ever comes from `src/generated/icons.ts`, and it is parsed with `DOMParser` and
// cloned — never assigned to `innerHTML` — so nothing from `data.json` can reach the DOM as
// markup (OWASP A05). Symbol folders are assembled from Obsidian's own Lucide glyphs, which is
// why this is the one icon module that imports `obsidian`.

import { getIcon } from 'obsidian';

import { LOGO_SVG } from '../generated/icons';
import { FOLDER_PATH, folderColors, MOTIVE_BOX, symbolColor } from './folderShape';
import type { FolderIcon } from './icons';
import { iconSvg } from './material';

const SVG_NS = 'http://www.w3.org/2000/svg';

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

function logoSvg(slug: string, markup: string): SVGElement | null {
	const key = `logo-${slug}`;
	if (!parsed.has(key)) parsed.set(key, parseSvg(markup));
	return parsed.get(key)?.cloneNode(true) as SVGElement | null;
}

/**
 * The theme's folder shape with a Lucide glyph as its emblem, drawn here because Obsidian
 * already ships Lucide and bundling it again would be dead weight.
 */
function symbolSvg(id: string, glyphs: readonly string[]): SVGElement | null {
	let glyph: SVGSVGElement | null = null;
	for (const name of glyphs) {
		glyph = getIcon(name) ?? getIcon(`lucide-${name}`);
		if (glyph) break;
	}
	if (!glyph) return null;

	const { folder, motive } = folderColors(symbolColor(id));
	const { x, y, size } = MOTIVE_BOX;

	const svg = document.createElementNS(SVG_NS, 'svg');
	svg.setAttribute('xmlns', SVG_NS);
	svg.setAttribute('viewBox', '0 0 16 16');

	const shape = document.createElementNS(SVG_NS, 'path');
	shape.setAttribute('fill', folder);
	shape.setAttribute('d', FOLDER_PATH);
	svg.appendChild(shape);

	const group = document.createElementNS(SVG_NS, 'g');
	group.setAttribute('transform', `translate(${x} ${y}) scale(${size / 24})`);
	group.setAttribute('fill', 'none');
	group.setAttribute('stroke-width', '2.6');
	group.setAttribute('stroke-linecap', 'round');
	group.setAttribute('stroke-linejoin', 'round');
	// Lucide strokes with `currentColor`, so the emblem color rides on `color`.
	group.style.color = motive;
	for (const child of Array.from(glyph.childNodes)) group.appendChild(child);
	svg.appendChild(group);

	return svg;
}

function buildFolderIcon(icon: FolderIcon): SVGElement | null {
	switch (icon.kind) {
		case 'theme':
			return materialSvg(icon.name);
		case 'logo':
			return logoSvg(icon.slug, LOGO_SVG[icon.slug] ?? '');
		case 'symbol':
			return symbolSvg(icon.id, icon.glyphs);
	}
}

function place(target: HTMLElement, svg: SVGElement | null): boolean {
	if (!svg) return false;
	target.replaceChildren(svg);
	svg.classList.add('shard-icon-svg');
	return true;
}

/** Replaces `target`'s contents with the icon. `false` means this build cannot draw it. */
export function renderFolderIcon(target: HTMLElement, icon: FolderIcon): boolean {
	return place(target, buildFolderIcon(icon));
}

/** Renders a Material Icon Theme icon by name — how file icons are drawn. */
export function renderMaterialIcon(target: HTMLElement, name: string): boolean {
	return place(target, materialSvg(name));
}

/** Frees the parsed-SVG cache when the plugin unloads. */
export function clearIconCache(): void {
	parsed.clear();
}
