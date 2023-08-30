const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: '45vid6',
  defaultCommandTimeout: 90 * 1000,
  env: {
    'cypress-react-selector': {
      root: '#root',
    },
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
});
