export default {
  '*.{ts}': [() => 'tsc'],
  '*.{md,yml,json,js,ts}': 'prettier --write',
  '*.{js,ts}': 'eslint --quiet --fix',
};
