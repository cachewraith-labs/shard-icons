import js from '@eslint/js';
import obsidianmd from 'eslint-plugin-obsidianmd';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{ ignores: ['node_modules/', 'main.js', 'src/generated/', 'dist/'] },
	js.configs.recommended,
	tseslint.configs.recommended,
	...obsidianmd.configs.recommended,
	{
		files: ['**/*.ts'],
		languageOptions: {
			parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
		},
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
		},
	},
	{
		// Obsidian 1.13.0 deprecated `PluginSettingTab.display()` and `setWarning()` in favour
		// of APIs that do not exist in the 1.5.0 this plugin still supports.
		files: ['src/settings/SettingsTab.ts', 'src/picker/ConfirmModal.ts'],
		rules: {
			'@typescript-eslint/no-deprecated': 'off',
			'obsidianmd/settings-tab/prefer-setting-definitions': 'off',
		},
	},
	{
		// Build tooling and tests run in Node, not in Obsidian: its mobile-safety and
		// console rules do not apply to code that never ships in main.js.
		files: ['scripts/**/*.{ts,mjs}', 'tests/**/*.ts', '*.mjs', '*.config.ts'],
		rules: {
			'obsidianmd/no-nodejs-modules': 'off',
			'obsidianmd/rule-custom-message': 'off',
			'obsidianmd/sample-names': 'off',
			// Tests build their fixtures in plain jsdom, without Obsidian's DOM extensions.
			'obsidianmd/prefer-create-el': 'off',
			'obsidianmd/no-global-this': 'off',
		},
	},
);
