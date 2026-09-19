# Releasing

## Cutting a release

`npm version <x.y.z>` bumps `package.json`, then the `version` script copies that into
`manifest.json` and records the minimum Obsidian version in `versions.json`, and npm commits
and tags the three together. The tag is the **bare version with no `v` prefix** — that is what
Obsidian expects, and `.npmrc` sets `tag-version-prefix=""` so npm does not add one.

```bash
npm version 0.5.0
git push --follow-tags
```

Only plain `x.y.z` is accepted. Obsidian's manifest has no notion of a prerelease, so
`version-bump.mjs` rejects anything else and puts `package.json` back as it was.

Pushing the tag runs [`release.yml`](../.github/workflows/release.yml): lint, tests, build, a
check that the tag matches `manifest.json`, then a GitHub release with `main.js`,
`manifest.json` and `styles.css` attached. That release is what Obsidian's updater and BRAT
read.

## Keeping icons up to date

[`update-icons.yml`](../.github/workflows/update-icons.yml) bumps the two icon packages weekly,
rebuilds, runs the tests and opens a PR, so new icons arrive on their own. Dependabot handles
the rest of the toolchain.

## Community plugin submission checklist

- [x] `manifest.json` at the repository root with `id`, `name`, `version`, `minAppVersion`,
      `description`, `author`, `isDesktopOnly`
- [x] `id` (`shard-icons`) and `name` do not contain "Obsidian" or "plugin"
- [x] `versions.json` maps each version to its minimum Obsidian version
- [x] A GitHub release tagged with the bare version, with `main.js`, `manifest.json` and
      `styles.css` as assets
- [x] `LICENSE` at the repository root
- [x] `main.js` and `src/generated/` are git-ignored, not committed
- [x] No network requests, no telemetry, no bundled analytics
- [x] Styling through Obsidian's CSS variables; no hard-coded colors outside the icon art
- [x] `isDesktopOnly: false`, and no Node or Electron API in the shipped bundle
- [x] Everything the plugin injects is removed in `onunload`
- [x] Submit the plugin at [community.obsidian.md](https://community.obsidian.md) — sign in,
      link the GitHub account, add the repository. Submission is no longer a pull request to
      `obsidianmd/obsidian-releases`; that repository has pull requests disabled.
