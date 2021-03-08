/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (homePage.js) is part of LiteFarm.
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

describe('homepage', function () {
  it('renders all elements', function () {
    // set up stub requests
    cy.server();
    cy.route('**/user/**', 'fx:user');
    cy.route('**/farm/**', 'fx:farm');

    cy.viewport(360, 640);
    cy.visit('http://localhost:3000');
    // grab token by making api call to auth0
    // https://auth0.com/blog/end-to-end-testing-with-cypress-and-auth0/
    cy.login();

    // check side menu
    cy.get('.bm-burger-button').click();

    cy.contains('Home').should('be.visible');
    cy.contains('Profile').should('be.visible');
    cy.contains('Fields').should('be.visible');
    cy.contains('Log').should('be.visible');
    cy.contains('Shift').should('be.visible');
    cy.contains('Finances').should('be.visible');
    cy.contains('Insights').should('be.visible');
    cy.contains('Log Out').should('be.visible');

    cy.contains('Demos').should('be.visible');
    cy.contains('Contact Us').should('be.visible');
    cy.contains('Terms').should('be.visible');

    cy.wait(1500);
    cy.get('.bm-cross-button').click();

    // check welcome message
    cy.contains('Cypress');
  });
});
