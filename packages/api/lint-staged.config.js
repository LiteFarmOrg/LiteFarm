export default {
  '*.{js,ts}': ['eslint --quiet --fix'],
  '*.{md,yml,json,js,ts}': 'prettier --write',
  '*.{ts,js}': () => 'tsc -p tsconfig.json --noEmit',
};
