// Generates `src/generated/icons.ts` from the `material-icon-theme` (MIT) and `simple-icons`
// (CC0) packages in node_modules.
//
// An Obsidian plugin ships as one `main.js`, so there is no server and no lazy asset loading:
// every icon the plugin can draw has to be in the bundle. This script is the only place that
// reads node_modules, and it emits exactly what the plugin uses — folder icons always, file
// icons when they are built in, and the curated brand-logo folders it draws itself.
//
// Node runs this file directly with its built-in type stripping, so this file and everything
// it imports must stay erasable: no parameter properties, enums or namespaces.
//
// Pattern: a build-time code generator (the Vite virtual modules of cachewraith-explorer,
// written to disk instead), so the runtime has a plain typed table and no filesystem access.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { FOLDER_PATH, folderColors, MOTIVE_BOX } from '../src/icons/folderShape.ts';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outFile = path.join(repoRoot, 'src/generated/icons.ts');

/** File icons roughly triple the bundle; `SHARD_ICONS_FILE_ICONS=0` builds without them. */
const withFileIcons = process.env['SHARD_ICONS_FILE_ICONS'] !== '0';

/**
 * Brand logos to build folders for, grouped only to keep the list reviewable. Wordmark-only
 * logos (Zoom, Splunk, Intel…) are left out: the letters are unreadable at explorer size.
 */
// prettier-ignore
const SLUGS = [
	// Web and backend frameworks
	'fastapi', 'flask', 'django', 'laravel', 'symfony', 'codeigniter', 'cakephp', 'spring', 'springboot',
	'rubyonrails', 'express', 'nestjs', 'nextdotjs', 'nuxt', 'react', 'vuedotjs', 'angular', 'svelte', 'astro',
	'remix', 'gatsby', 'solid', 'qwik', 'phoenixframework', 'wordpress', 'drupal', 'shopify', 'strapi',
	'bootstrap', 'tailwindcss', 'sass', 'jquery', 'redux', 'zod', 'reactquery',
	// Apps and mobile
	'tauri', 'electron', 'flutter', 'ionic', 'capacitor', 'expo', 'android', 'androidstudio', 'apple', 'xcode',
	'jetpackcompose',
	// Languages and runtimes
	'python', 'rust', 'go', 'php', 'ruby', 'openjdk', 'kotlin', 'swift', 'dart', 'dotnet', 'cplusplus', 'c',
	'typescript', 'javascript', 'html5', 'css', 'nodedotjs', 'deno', 'bun', 'elixir', 'haskell', 'scala',
	'clojure', 'lua', 'zig', 'nim', 'julia', 'r', 'perl', 'gnubash',
	// Data, AI and cloud
	'postgresql', 'mysql', 'mariadb', 'mongodb', 'redis', 'sqlite', 'prisma', 'graphql', 'supabase', 'firebase',
	'googlecloud', 'vercel', 'netlify', 'cloudflare', 'docker', 'kubernetes', 'nginx', 'apache', 'ansible',
	'terraform', 'jenkins', 'githubactions', 'gradle', 'jupyter', 'pytorch', 'tensorflow', 'numpy', 'pandas',
	'scikitlearn', 'opencv', 'huggingface', 'ollama', 'anthropic', 'claude',
	// Tools
	'git', 'github', 'gitlab', 'npm', 'pnpm', 'yarn', 'vite', 'webpack', 'esbuild', 'babel', 'eslint', 'prettier',
	'vitest', 'jest', 'cypress', 'storybook', 'vim', 'neovim', 'jetbrains', 'intellijidea', 'pycharm', 'phpstorm',
	'figma', 'gimp', 'inkscape', 'blender', 'obsidian', 'notion', 'markdown', 'latex',
	// Games and media
	'godotengine', 'unity', 'unrealengine', 'steam', 'steamdeck', 'epicgames', 'playstation', 'itchdotio',
	'roblox', 'discord', 'telegram', 'youtube', 'spotify', 'twitch',
	// Systems and hardware
	'linux', 'archlinux', 'ubuntu', 'debian', 'fedora', 'raspberrypi', 'arduino', 'homeassistant',
	// Messaging and queues
	'apachekafka', 'rabbitmq', 'mqtt', 'apachepulsar', 'socketdotio',
	// Monitoring and logging
	'grafana', 'prometheus', 'elasticsearch', 'kibana', 'logstash', 'opentelemetry', 'jaeger', 'sentry',
	'datadog', 'newrelic', 'elastic', 'influxdb', 'pagerduty', 'uptimekuma',
	// Infrastructure and containers
	'helm', 'argo', 'istio', 'envoyproxy', 'traefikproxy', 'consul', 'vault', 'hashicorp', 'podman', 'portainer',
	'rancher', 'k3s', 'caddy', 'kong',
	// Hosting and cloud
	'digitalocean', 'hetzner', 'render', 'railway', 'flydotio', 'ovh',
	// Databases and data pipelines
	'apachecassandra', 'couchbase', 'neo4j', 'clickhouse', 'snowflake', 'duckdb', 'cockroachlabs', 'timescale',
	'apachespark', 'apacheairflow', 'minio', 'typeorm', 'sequelize', 'drizzle', 'mongoose',
	// APIs, auth and payments
	'swagger', 'openapiinitiative', 'postman', 'insomnia', 'trpc', 'apollographql', 'hasura', 'keycloak',
	'auth0', 'okta', 'stripe', 'paypal', 'mailgun', 'resend', 'clerk',
	// Tasks, planning and docs
	'jira', 'trello', 'asana', 'linear', 'clickup', 'todoist', 'basecamp', 'ticktick', 'things', 'confluence',
	'miro', 'airtable', 'calendly', 'googlecalendar',
	// Chat and email
	'whatsapp', 'signal', 'gmail', 'zulip', 'mattermost', 'element', 'matrix',
	// Editors and terminals
	'cursor', 'zedindustries', 'sublimetext', 'gnuemacs', 'tmux', 'zsh', 'fishshell', 'iterm2', 'alacritty',
	'wezterm', 'warp',
	// CI, code hosting and security
	'circleci', 'travisci', 'githubcopilot', 'gitea', 'forgejo', 'bitbucket', 'dependabot', 'snyk', 'codecov',
	// Frontend libraries
	'threedotjs', 'd3', 'chartdotjs', 'mui', 'chakraui', 'shadcnui', 'radixui', 'antdesign', 'framer',
	'greensock', 'htmx', 'alpinedotjs', 'lit', 'preact', 'emberdotjs', 'backbonedotjs', 'vuetify', 'quasar',
	// More languages
	'fsharp', 'ocaml', 'erlang', 'gleam', 'crystal', 'v', 'fortran', 'assemblyscript', 'webassembly', 'solidity',
	'odin',
	// AI
	'googlegemini', 'mistralai', 'langchain', 'perplexity', 'nvidia',
	// Operating systems
	'freebsd', 'nixos', 'alpinelinux', 'manjaro', 'linuxmint', 'gentoo', 'kalilinux', 'redhat',
	'centos', 'opensuse', 'popos',
	// Media, creative and social
	'obsstudio', 'audacity', 'davinciresolve', 'krita', 'netflix', 'soundcloud', 'reddit', 'x', 'mastodon',
	'bluesky', 'instagram', 'facebook', 'tiktok',
	// Games
	'riotgames', 'gogdotcom', 'battledotnet', 'ea', 'ubisoft',
	// Hardware and home lab
	'esphome', 'espressif', 'stmicroelectronics', 'qualcomm', 'proxmox', 'truenas',
	'pihole', 'openwrt', 'tailscale', 'wireguard',
	// Storage, passwords and notes
	'googledrive', 'dropbox', 'nextcloud', 'bitwarden', '1password', 'keepassxc', 'zotero', 'anki', 'logseq',
	'excalidraw',
];

interface Manifest {
	iconDefinitions: Record<string, { iconPath: string }>;
	file: string;
	folder: string;
	fileNames: Record<string, string>;
	fileExtensions: Record<string, string>;
	folderNames: Record<string, string>;
	light: {
		fileNames?: Record<string, string>;
		fileExtensions?: Record<string, string>;
		folderNames?: Record<string, string>;
	};
}

interface SimpleIcon {
	title: string;
	slug: string;
	hex: string;
}

function packageVersion(dir: string): string {
	return (JSON.parse(readFileSync(path.join(dir, 'package.json'), 'utf8')) as { version: string }).version;
}

/** The files ship minified already; this only guards against stray whitespace. */
function minify(svg: string): string {
	return svg
		.replace(/<\?xml[^>]*\?>/g, '')
		.replace(/>\s+</g, '><')
		.trim();
}

/** A Material-style folder with a Simple Icons logo's single 24x24 path as its emblem. */
function logoFolderSvg(logoSvg: string, hex: string): string {
	const d = /<path d="([^"]+)"/.exec(logoSvg)?.[1];
	if (!d) throw new Error('build-icons: expected a single-path Simple Icons SVG');
	const { folder, motive } = folderColors(hex);
	const { x, y, size } = MOTIVE_BOX;
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">` +
		`<path fill="${folder}" d="${FOLDER_PATH}"/>` +
		`<path fill="${motive}" transform="translate(${x} ${y}) scale(${size / 24})" d="${d}"/>` +
		`</svg>`
	);
}

function buildMaterial() {
	const dir = path.dirname(require.resolve('material-icon-theme/package.json'));
	const iconsDir = path.join(dir, 'icons');
	const manifest = JSON.parse(readFileSync(path.join(dir, 'dist/material-icons.json'), 'utf8')) as Manifest;

	// Icon name -> SVG file. Most match (`rust` -> `rust.svg`); some reuse another file.
	const files = new Map(
		Object.entries(manifest.iconDefinitions).map(([name, def]) => [
			name,
			path.basename(def.iconPath, '.svg'),
		]),
	);

	const isFolder = (name: string) =>
		name.startsWith('folder') && !name.endsWith('-open') && !name.startsWith('folder-root');
	// `_light` folders are light-theme substitutes, not separate choices in the picker.
	const folderIcons = [...files.keys()].filter((n) => isFolder(n) && !n.endsWith('_light')).sort();
	const shipped = new Set([...files.keys()].filter(isFolder));

	if (withFileIcons) {
		const light = manifest.light;
		const maps = [
			manifest.fileNames,
			manifest.fileExtensions,
			light.fileNames ?? {},
			light.fileExtensions ?? {},
		];
		shipped.add(manifest.file);
		for (const map of maps) for (const name of Object.values(map)) shipped.add(name);
	}
	// Same rule as folders: `_light` file icons are substitutes, not separate choices.
	const fileIcons = withFileIcons
		? [...shipped].filter((n) => !isFolder(n) && !n.endsWith('_light')).sort()
		: [];

	// Several icon names can point at one file (`latex` -> `latex.clone.svg`); store the SVG
	// once and remember the non-obvious names.
	const svg: Record<string, string> = {};
	const aliases: Record<string, string> = {};
	for (const name of [...shipped].sort()) {
		const file = files.get(name);
		if (!file) throw new Error(`build-icons: no icon definition for "${name}"`);
		svg[file] ??= minify(readFileSync(path.join(iconsDir, `${file}.svg`), 'utf8'));
		if (file !== name) aliases[name] = file;
	}

	const empty: Record<string, string> = {};
	const table = {
		file: withFileIcons ? manifest.file : '',
		folder: manifest.folder,
		fileNames: withFileIcons ? manifest.fileNames : empty,
		fileExtensions: withFileIcons ? manifest.fileExtensions : empty,
		folderNames: manifest.folderNames,
		light: {
			fileNames: withFileIcons ? (manifest.light.fileNames ?? empty) : empty,
			fileExtensions: withFileIcons ? (manifest.light.fileExtensions ?? empty) : empty,
			folderNames: manifest.light.folderNames ?? empty,
		},
		folderIcons,
		fileIcons,
		aliases,
	};

	return {
		table,
		svg,
		version: packageVersion(dir),
		license: readFileSync(path.join(dir, 'LICENSE'), 'utf8'),
	};
}

function buildLogos() {
	// The package exports no `package.json`; its main entry sits at the package root.
	const dir = path.dirname(require.resolve('simple-icons'));
	const data = JSON.parse(readFileSync(path.join(dir, 'data/simple-icons.json'), 'utf8')) as SimpleIcon[];
	const bySlug = new Map(data.map((icon) => [icon.slug, icon]));

	const logos: { slug: string; title: string }[] = [];
	const svg: Record<string, string> = {};
	for (const slug of SLUGS) {
		const icon = bySlug.get(slug);
		if (!icon) throw new Error(`build-icons: simple-icons has no "${slug}"`);
		logos.push({ slug, title: icon.title });
		svg[slug] = logoFolderSvg(readFileSync(path.join(dir, 'icons', `${slug}.svg`), 'utf8'), icon.hex);
	}
	return {
		logos,
		svg,
		version: packageVersion(dir),
		license: readFileSync(path.join(dir, 'LICENSE.md'), 'utf8'),
	};
}

const material = buildMaterial();
const logos = buildLogos();

const source = `// GENERATED by scripts/build-icons.ts — do not edit, and do not commit.
// Material Icon Theme ${material.version} (MIT) and Simple Icons ${logos.version} (CC0-1.0).
// See licenses/ for the notices these icons ship under.

export interface MaterialTable {
	/** Icon name for a file with no better match; empty when file icons are not built in. */
	readonly file: string;
	readonly folder: string;
	readonly fileNames: Readonly<Record<string, string>>;
	readonly fileExtensions: Readonly<Record<string, string>>;
	readonly folderNames: Readonly<Record<string, string>>;
	readonly light: {
		readonly fileNames: Readonly<Record<string, string>>;
		readonly fileExtensions: Readonly<Record<string, string>>;
		readonly folderNames: Readonly<Record<string, string>>;
	};
	/** Every folder icon offered in the picker, sorted. */
	readonly folderIcons: readonly string[];
	/** Every file icon offered in the picker, sorted; empty when file icons are not built in. */
	readonly fileIcons: readonly string[];
	/** Icon name -> SVG key, only where they differ. */
	readonly aliases: Readonly<Record<string, string>>;
}

export interface BrandLogo {
	readonly slug: string;
	readonly title: string;
}

export const MATERIAL: MaterialTable = ${JSON.stringify(material.table)};

/** SVG key -> markup. The only SVG source the plugin ever renders. */
export const ICON_SVG: Readonly<Record<string, string>> = ${JSON.stringify(material.svg)};

export const LOGOS: readonly BrandLogo[] = ${JSON.stringify(logos.logos)};

/** Logo slug -> a Material-style folder in the brand color, built at build time. */
export const LOGO_SVG: Readonly<Record<string, string>> = ${JSON.stringify(logos.svg)};

export const HAS_FILE_ICONS: boolean = ${String(withFileIcons)};

export const SOURCES = {
	materialIconTheme: ${JSON.stringify(material.version)},
	simpleIcons: ${JSON.stringify(logos.version)},
} as const;
`;

mkdirSync(path.dirname(outFile), { recursive: true });
writeFileSync(outFile, source);

// Keep the shipped notices in step with the versions the icons came from.
const licenses = path.join(repoRoot, 'licenses');
mkdirSync(licenses, { recursive: true });
writeFileSync(path.join(licenses, 'material-icon-theme-LICENSE.txt'), material.license);
writeFileSync(path.join(licenses, 'simple-icons-LICENSE.md'), logos.license);

const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;
console.log(
	`build-icons: ${material.table.folderIcons.length} folder icons, ${logos.logos.length} logos, ` +
		`file icons ${withFileIcons ? 'on' : 'off'} -> src/generated/icons.ts (${kb(source.length)})`,
);
