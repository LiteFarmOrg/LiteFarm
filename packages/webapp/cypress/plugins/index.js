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
const ms = require('smtp-tester');

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  config.env.googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  config.env.googleClientId = process.env.REACT_APP_GOOGLE_CLIENTID;
  config.env.googleClientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

  require('@cypress/code-coverage/task')(on, config);

  // starts the SMTP server at localhost:7777
  const port = 465;
  const mailServer = ms.init(port);
  console.log('mail server at port %d', port);

  // process all emails
  mailServer.bind((addr, id, email) => {
    console.log('--- email ---');
    console.log(addr, id, email);
  });

  let lastEmail = {};

  on('task', {
    getLastEmail(email) {
      // cy.task cannot return undefined
      // thus we return null as a fallback
      return lastEmail[email] || null;
    },
  });

  return config;
};
