// `npm version <x.y.z>` runs this: package.json is already bumped, so copy that version into
// manifest.json and record the minimum Obsidian version in versions.json. Obsidian's updater
// reads both from the repository root.

import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const read = (file) => JSON.parse(readFileSync(file, 'utf8'));
const write = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const { version } = read('package.json');
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
	console.error(`version-bump: "${version}" is not a release version`);
	process.exit(1);
}

const manifest = read('manifest.json');
manifest.version = version;
write('manifest.json', manifest);

const versions = read('versions.json');
versions[version] = manifest.minAppVersion;
write('versions.json', versions);

console.log(`version-bump: ${version} (requires Obsidian ${manifest.minAppVersion})`);
