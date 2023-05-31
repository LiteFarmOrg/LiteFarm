export default {
  '*.{js, jsx}': ['eslint --quiet --fix'],
  '*.{js,jsx,ts,tsx,json,md,html}': 'prettier --write',
  '*.{ts,tsx}': [() => 'tsc --noEmit'],
};
