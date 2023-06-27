module.exports = {
    env: {
      browser: true,
      node: true,
    },
    extends: ["eslint:recommended", 'plugin:cypress/recommended'],
    plugins: ['cypress'],
    rules: {
      // Add any specific linting rules for your Cypress tests
    },
  };
  