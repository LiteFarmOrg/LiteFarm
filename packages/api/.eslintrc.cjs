module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  env: {
    es6: true,
    node: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2019,
    babelOptions: {
      plugins: [
        '@babel/plugin-syntax-import-assertions'
      ]
    }
  },
  parser: '@babel/eslint-parser',
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': ['error', { before: false, after: true }],
    'no-multiple-empty-lines': ['error'],
    'no-new-symbol': 'error',
    'no-trailing-spaces': ['error'],
    'no-undef': ['error'],
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
    'object-curly-spacing': ['error', 'always'],
    'object-shorthand': 'error',
    'prefer-const': 2,
    'space-in-parens': ['error', 'never'],
    strict: [2, 'never'],
  },
};
