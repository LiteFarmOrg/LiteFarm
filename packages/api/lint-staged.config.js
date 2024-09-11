export default {
  '*.{js,ts}': [() => 'tsc -p tsconfig.json --noEmit', 'eslint --quiet --fix'],
  '*.{md,yml,json,js,ts}': 'prettier --write',
};
