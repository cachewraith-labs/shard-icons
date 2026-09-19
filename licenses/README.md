# Third-party icon licenses

The icons bundled into `main.js` are not this plugin's own work.

| Source                                                                                   | Version pinned in `package.json` | License | Notice                                                               |
| ---------------------------------------------------------------------------------------- | -------------------------------- | ------- | -------------------------------------------------------------------- |
| [Material Icon Theme](https://github.com/material-extensions/vscode-material-icon-theme) | `material-icon-theme`            | MIT     | [`material-icon-theme-LICENSE.txt`](material-icon-theme-LICENSE.txt) |
| [Simple Icons](https://github.com/simple-icons/simple-icons)                             | `simple-icons`                   | CC0-1.0 | [`simple-icons-LICENSE.md`](simple-icons-LICENSE.md)                 |

`scripts/build-icons.ts` copies the two notice files here from `node_modules` on every build,
so they always match the versions the icons came from. The brand-logo folders are drawn by
that script: the Material Icon Theme's folder shape, filled with the brand color, with the
Simple Icons glyph as its emblem.

Brand logos are trademarks of their respective owners. Simple Icons' CC0 waiver covers the
icon files, not the trademarks; see the project's
[disclaimer](https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md).
