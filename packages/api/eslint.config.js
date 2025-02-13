// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import json from 'eslint-plugin-json';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    files: ['**/*.json'],
    ...json.configs['recommended'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
  },
  {
    languageOptions: {
      ecmaVersion: 2019,
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    // Before adding new rules check https://typescript-eslint.io/rules/
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'comma-dangle': ['error', 'always-multiline'],
      'comma-spacing': ['error', { before: false, after: true }],
      'no-multiple-empty-lines': ['error'],
      'no-new-symbol': 'error',
      'no-trailing-spaces': ['error'],
      'no-undef': ['error'],
      'object-curly-spacing': ['error', 'always'],
      'object-shorthand': 'error',
      'prefer-const': 2,
      'space-in-parens': ['error', 'never'],
      strict: [2, 'never'],
    },
  },
);
