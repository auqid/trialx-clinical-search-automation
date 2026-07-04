import js from '@eslint/js';
import globals from 'globals';
import playwright from 'eslint-plugin-playwright';
import prettier from 'eslint-config-prettier';

/** Flat ESLint config with sensible JS defaults for a Playwright project. */
export default [
  {
    ignores: [
      'node_modules/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'playwright/.cache/',
      '.auth/',
    ],
  },

  // Base recommended JS rules for all source files.
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // Playwright-specific recommended rules for tests.
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.js'],
  },

  // Turn off stylistic rules that Prettier owns (keep this last).
  prettier,
];
