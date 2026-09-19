// A stand-in for the `obsidian` module, which ships types only and cannot be imported at
// runtime. vitest.config.ts aliases `obsidian` here so the modules that touch the API can be
// exercised without Obsidian.
//
// It deliberately knows only a few Lucide names: the renderer has to cope with a glyph the
// running Obsidian does not have.

const KNOWN_GLYPHS = new Set(['gamepad-2', 'search', 'check', 'image', 'rotate-ccw']);

export function getIcon(name: string): SVGSVGElement | null {
	if (!KNOWN_GLYPHS.has(name)) return null;
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
	return svg;
}
