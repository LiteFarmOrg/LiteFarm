const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'wzcbom',
  defaultCommandTimeout: 15 * 1000,
  video: true,
  env: {
    'cypress-react-selector': {
      root: '#root',
    },
    USER: 0, // for local use; in CI the CYPRESS_USER variable defined in the GitHub workflow will override this, see docs.cypress.io/guides/guides/environment-variables#Option-3-CYPRESS_
  },
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      // include any other plugin code...

      // It's IMPORTANT to return the config object
      // with any changed environment variables
      return config;
    },
  },
});
