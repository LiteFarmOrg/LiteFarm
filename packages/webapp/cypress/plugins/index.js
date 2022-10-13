/// <reference types="cypress" />
// cypress/plugins/index.js

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
const axios = require('axios');
const makeEmailAccount = require('./email-account');
const { cypressBrowserPermissionsPlugin } = require('cypress-browser-permissions');

module.exports = async (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  config.env.googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  config.env.googleClientId = process.env.REACT_APP_GOOGLE_CLIENTID;
  config.env.googleClientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

  config = cypressBrowserPermissionsPlugin(on, config);

  const emailAccount = await makeEmailAccount();
  require('@cypress/code-coverage/task')(on, config);

  on('task', {
    getUserEmail() {
      return emailAccount.email;
    },
    getUserPassword() {
      return emailAccount.password;
    },
    async getLastEmail() {
      return await emailAccount.getLastEmail();
    },
  });

  return config;
};
