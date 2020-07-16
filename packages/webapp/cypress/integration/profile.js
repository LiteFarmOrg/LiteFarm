/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (profile.js) is part of LiteFarm.
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

describe('profile', function() {
  beforeEach(() => {
    // set up stub requests
    cy.server();
    cy.route("**/user/farm/**", 'fx:user');
    cy.route("/user/**", 'fx:user');
    cy.route("/farm/**", 'fx:farm');
    cy.route("PUT", "**/farm/**", 'fx:farm');
    cy.route("PUT", "**/user/**", 'fx:user');
    cy.route("POST", "**/token", 'OK');
    cy.route("PATCH", "**/roles", 'OK');
    cy.route("DELETE", "**/roles", 'OK');

    cy.viewport(360, 640);
    cy.visit('http://localhost:3000');
    // grab token by making api call to auth0
    // https://auth0.com/blog/end-to-end-testing-with-cypress-and-auth0/
    cy.login();
  });

  it('renders personal information tab', function() {
    cy.get('.bm-burger-button').click();
    cy.contains('Profile').should('be.visible').click();

    cy.contains('Personal Information').should('be.visible');
    cy.contains('First').should('be.visible');
    cy.contains('Name').should('be.visible');
    cy.contains('Last').should('be.visible');
    cy.contains('Name').should('be.visible');
    cy.contains('Email').should('be.visible');
    cy.contains('Phone').should('be.visible');
    cy.contains('Number').should('be.visible');
    cy.contains('Address').should('be.visible');

    cy.get('[name="profileForms.userInfo.first_name"]').should('have.value', 'Cypress');
    cy.get('[name="profileForms.userInfo.last_name"]').should('have.value', 'Runner');
    cy.get('[name="profileForms.userInfo.email"]').should('be.disabled');
    cy.get('[name="profileForms.userInfo.email"]').should('have.value', 'cypressrunner@litefarm.co');

    cy.contains('Save').click();
    cy.contains('Successfully updated user info!').should('be.visible');
    cy.get('.close-toastr').click();
  });

  it('renders people tab', function() {
    cy.get('.bm-burger-button').click();
    cy.contains('Profile').should('be.visible').click();
    cy.contains('People').click();

    cy.contains('Admins').should('be.visible');
    cy.contains('Workers').should('be.visible');
    cy.contains('Workers no-account').should('be.visible');

    // check user info is rendered
    cy.contains('Cypress Runner', { timeout: 10000 }).should('be.visible');

    // check Edit Person
    cy.contains('Edit').click();
    cy.contains('Edit Admin').should('be.visible');
    cy.contains('Save').click();

    cy.contains('Successfully updated user!').should('be.visible');
    cy.get('.close-toastr').click();

    // check modals
    cy.contains('Add Admin').click();
    cy.contains('Add an Admin').should('be.visible');
    // FIXME: should use more specific selector for close button in line below
    cy.get('a img:visible').click();
    cy.contains('Add Worker').click();
    cy.contains('Add a Worker').should('be.visible');

    // Pseudo Worker now has the same button name as worker, will have to update this later
    // FIXME: should use more specific selector for close button in line below
    // cy.get('a img:visible').click();
    // cy.contains('Add Pseudo Worker').click();
    // cy.contains('Add a Person').should('be.visible');
    // FIXME: should use more specific selector for close button in line below
    // cy.get('a img:visible').click();
  });

  it('renders farm tab', function() {
    cy.get('.bm-burger-button').click();
    cy.contains('Profile').should('be.visible').click();
    cy.contains('Farm').click();

    cy.contains('Farm').should('be.visible');
    cy.contains('Name').should('be.visible');
    cy.contains('Phone').should('be.visible');
    cy.contains('Number').should('be.visible');
    cy.contains('Address').should('be.visible');
    cy.contains('Units').should('be.visible');
    cy.get('[name="profileForms.farmInfo.farm_name"]').should('have.value', 'Cypress Farm');

    cy.contains('Save').click();
    cy.wait(500);
    cy.contains('Successfully updated farm info!').should('be.visible');
    cy.get('.close-toastr').click();
  })
});
