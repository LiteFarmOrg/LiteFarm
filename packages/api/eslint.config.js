// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import json from 'eslint-plugin-json';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
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
    },
  },
);
