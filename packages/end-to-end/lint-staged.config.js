module.exports = {
  '*.{js}': ['eslint --quiet --fix'],
  '*.{js,jsx,ts,tsx,json,md,html}': 'prettier --write',
};
