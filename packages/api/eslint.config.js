// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import json from 'eslint-plugin-json';
import jestPlugin from 'eslint-plugin-jest';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  { plugins: { jest: jestPlugin } },
  {
    files: ['tests/**'],
    ...jestPlugin.configs['flat/recommended'],
    rules: {
      // should be removed when jest version is upgraded
      'jest/no-done-callback': 'off',
    },
  },
  {
    files: ['**/*.json'],
    ...json.configs['recommended'],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
  },
  {
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
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
);
