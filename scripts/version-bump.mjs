// `npm version <x.y.z>` runs this: package.json is already bumped, so copy that version into
// manifest.json and record the minimum Obsidian version in versions.json. Obsidian's updater
// reads both from the repository root.

import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const write = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const pkg = read('package.json');
const manifest = read('manifest.json');
const { version } = pkg;

// Plain x.y.z only. npm accepts `0.2.0clear` as the prerelease `0.2.0-clear`, but Obsidian's
// manifest has no notion of one and release.yml only triggers on [0-9]+.[0-9]+.[0-9]+, so a
// typo like that would bump every file and then never be releasable.
if (!/^\d+\.\d+\.\d+$/.test(version)) {
	// npm has already written package.json and package-lock.json and has not committed yet;
	// manifest.json still holds the previous version, so putting it back leaves no trace.
	pkg.version = manifest.version;
	write('package.json', pkg);
	const lock = read('package-lock.json');
	lock.version = manifest.version;
	if (lock.packages?.['']) lock.packages[''].version = manifest.version;
	write('package-lock.json', lock);
	console.error(
		`version-bump: "${version}" is not an x.y.z release version. ` +
			`package.json restored to ${manifest.version}; nothing was committed or tagged.`,
	);
	process.exit(1);
}

manifest.version = version;
write('manifest.json', manifest);

const versions = read('versions.json');
versions[version] = manifest.minAppVersion;
write('versions.json', versions);

console.log(`version-bump: ${version} (requires Obsidian ${manifest.minAppVersion})`);
