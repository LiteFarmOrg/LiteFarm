import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '45vid6',
  defaultCommandTimeout: 90 * 1000,
  env: {
    'cypress-react-selector': {
      root: '#root',
    },
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return import('./cypress/plugins/index.js').then((cypress) => cypress.default(on, config));
    },
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
  component: {
    setupNodeEvents(on, config) {},
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
