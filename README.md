# Shard Icons

Folder and file icons for the Obsidian file explorer, in the style of VS Code's Material Icon Theme.

Right-click any folder → **Change icon…**, and pick from two sets:

| Tab         | Examples                         | What it is                                                          |
| ----------- | -------------------------------- | ------------------------------------------------------------------- |
| **Folders** | src, docs, tasks, server, …      | 285 of the Material Icon Theme's own folder icons                   |
| **Logos**   | FastAPI, Kafka, Jira, Grafana, … | 355 folders in a brand's color with the Simple Icons logo as emblem |

Right-click a file → **Change icon…** to pick from the theme's 586 file icons (TypeScript,
Python, Markdown, …) for that one file.

Folders you have not touched can be matched automatically: `src`, `docs`, `images`, `.github`,
`task`, `workers` and a few thousand other names get the icon the theme would give them. Files
can do the same, by name and extension, if you turn that on. An icon you chose yourself always
wins.

## Install

### With BRAT (now)

1. Install **BRAT** from Community Plugins.
2. _BRAT → Add beta plugin_ → `https://github.com/cachewraith-labs/shard-icons`.
3. Enable **Shard Icons** in _Settings → Community plugins_.

BRAT follows GitHub releases, so it picks up new versions the same way the official installer
does.

### Manually

Download `main.js`, `manifest.json` and `styles.css` from the
[latest release](https://github.com/cachewraith-labs/shard-icons/releases/latest) into
`<your vault>/.obsidian/plugins/shard-icons/`, then reload Obsidian.

### From Community Plugins (later)

Once the plugin is accepted, _Settings → Community plugins → Browse → Shard Icons_.

## Using it

- **Change an icon** — right-click a folder or file in the file explorer → _Change icon…_.
  Search, or switch tabs with the mouse; the arrow keys move through the grid,
  <kbd>Enter</kbd> picks and <kbd>Esc</kbd> closes. The icon the theme would have guessed from
  the name is shown first, badged `match`.
- **Reset one folder or file** — right-click → _Reset icon to default_, or _Reset to default_ in
  the dialog.
- **From the keyboard** — the commands _Change icon of the active file_ and _Change icon of the
  active file's folder_ open the same dialog for whatever note you are in.
- **Renaming and moving** keeps icons, including everything inside a folder. Deleting drops
  them.
- **Themes** — the icon takes the place of the folder or file icon your theme draws, rather than
  sitting beside it.

## Settings

| Setting                | Default | What it does                                                |
| ---------------------- | ------- | ----------------------------------------------------------- |
| Automatic folder icons | on      | Folders with no chosen icon get one matched from their name |
| File icons             | off     | Files with no chosen icon get one from name and extension   |
| Icon size              | 16 px   | Between 12 and 28                                           |
| Clear all custom icons | —       | Asks first; cannot be undone                                |

## Your data

Everything lives in `.obsidian/plugins/shard-icons/data.json`: your settings and which folder
or file has which icon. Nothing else is stored, and the plugin makes no network requests and
collects nothing.

An icon this version does not recognise — from a newer release, from a vault synced the other
way, or a symbol icon from before 0.4.0 — shows as a plain folder or file and is **kept**, not
deleted.

## Contributing

Building, testing and releasing are covered in [`docs/`](docs/):
[development](docs/development.md) and [releasing](docs/releasing.md).

## Licenses

This plugin is MIT (see [`LICENSE`](LICENSE)). The icons it bundles are not:

- **Material Icon Theme** — MIT, © Philipp Kief and contributors.
  [`licenses/material-icon-theme-LICENSE.txt`](licenses/material-icon-theme-LICENSE.txt)
- **Simple Icons** — CC0-1.0. [`licenses/simple-icons-LICENSE.md`](licenses/simple-icons-LICENSE.md)

Brand logos are trademarks of their respective owners; the CC0 waiver covers the icon files,
not the marks. See [`licenses/`](licenses/) for the full notices.
