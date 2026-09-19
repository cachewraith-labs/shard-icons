import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		// `obsidian` on npm is a type declaration with no runtime; tests get a small stand-in.
		alias: { obsidian: fileURLToPath(new URL('tests/support/obsidian.ts', import.meta.url)) },
	},
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
	},
});
