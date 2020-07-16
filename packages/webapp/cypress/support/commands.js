/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (commands.js) is part of LiteFarm.
 *  
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *  
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// command for grabbing token from auth0 for user log in
Cypress.Commands.add('login', (overrides = {}) => {
  Cypress.log({
    name: 'loginViaAuth0',
  });

  const options = {
    method: 'POST',
    url: Cypress.env('auth_url'),
    body: {
      grant_type: 'password',
      username: Cypress.env('auth_username'),
      password: Cypress.env('auth_password'),
      audience: Cypress.env('auth_audience'),
      scope: 'openid profile email',
      client_id: Cypress.env('auth_client_id'),
      client_secret: Cypress.env('auth_client_secret'),
    },
  };
  cy.request(options).then((resp) => {
    return resp.body;
  }).then((body) => {
      const {access_token, expires_in, id_token} = body;
      const auth0State = {
        nonce: '',
        state: 'some-random-state'
      };
      const callbackUrl = `http://localhost:3000/callback#access_token=${access_token}&scope=openid&id_token=${id_token}&expires_in=${expires_in}&token_type=Bearer&state=${auth0State.state}`;
      cy.visit(callbackUrl, {
        onBeforeLoad(win) {
          // set session with information from response
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('id_token', id_token);
          localStorage.setItem('expires_at', JSON.stringify((expires_in * 1000) + new Date().getTime()));
          localStorage.setItem('user_id', Cypress.env('auth_user_id').split('|')[1]);
          localStorage.setItem('is_admin', true);
          localStorage.setItem('farm_id', Cypress.env('user_farm_id'));
          win.document.cookie = 'com.auth0.auth.some-random-state=' + JSON.stringify(auth0State);
        }
      });
    });
});
