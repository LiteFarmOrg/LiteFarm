module.exports = {
  '*.{md,yml}': 'prettier --write',
  'packages/end-to-end/**/*.js': 'eslint --quiet --fix'
};
