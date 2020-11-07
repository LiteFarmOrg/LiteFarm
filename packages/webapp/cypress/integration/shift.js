/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (shift.js) is part of LiteFarm.
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

describe('shift', function() {
  beforeEach(() => {
    // set up stub requests
    cy.server();
    cy.route("/user/**", 'fx:user');
    cy.route("/farm/**", 'fx:farm');
    cy.route('**/field_crop/farm/**', 'fx:fieldCropByFarm');
    cy.route('**/field/**', 'fx:fields');
    cy.route('**/shift/**', 'fx:shifts');
    cy.route('POST', '**/shift', 'OK');
    cy.route('PUT', '**/shift/**', 'OK');
    cy.route('DELETE', '**/shift/**', 'OK');
    cy.route('**/task_type/**', 'fx:taskTypes');

    cy.viewport(410, 730);
    cy.visit('http://localhost:3000');
    // grab token by making api call to auth0
    // https://auth0.com/blog/end-to-end-testing-with-cypress-and-auth0/
    cy.login();

    cy.get('.bm-burger-button').click();
    cy.contains('Shift').should('be.visible').click();

  });

  it('adds shift', () => {
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').its('length').should('eq', 2);

    cy.contains('Add New Shift').should('be.visible').click();
    cy.get('[data-test="task_type"]').its('length').should('eq', 12);
    cy.contains('Select...').click();
    cy.get('[id*="option-0"]').should('be.visible').click();
    cy.get('[name="new_start"]').type('08:30');
    cy.get('[name="new_end"]').type('16:30');
    cy.get('[name="break_duration"]').type('30');
    cy.get("#5").click();
    cy.contains('Next').should('be.visible').click();

    cy.contains('Fields on your farm').should('be.visible').click();
    cy.contains('Select Fields').click({force: true});
    cy.get('[id*="option-0"]').should('be.visible').click();
    cy.get('#input-field-5').type('450');
    cy.contains('Next').should('be.visible').click();

    cy.contains('😃').should('be.visible').click();

    cy.contains('Finish').click();
    cy.contains('Successfully added new shift!').should('be.visible');
    cy.get('.close-toastr').click();
  });

  it('edits shift', () => {
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(1).click();
    cy.contains('Cypress Runner');
    // FIXME: these times can change depending on timezone, so CI tests can fail
    // FIXME: either show a fixed time in app or fix the tests to account for this
    // cy.contains('8:30 AM');
    // cy.contains('4:10 PM');
    cy.contains('30 min');
    cy.contains('UBC Farm 1');
    cy.contains('7.17 hr');
    cy.contains('Edit').should('be.visible').click();
    cy.get('[role="menuitem"]').eq(0).click();

    cy.get('[name="new_start"]').type('08:30');
    cy.get('[name="new_end"]').type('16:30');
    cy.get('[name="break_duration"]').clear().type('30');
    cy.get("#5").click();
    cy.get("#5").click();
    cy.contains('Next').should('be.visible').click();

    cy.get('#input-field-5').clear().type('450');
    cy.contains('Next').should('be.visible').click();

    cy.contains('😃').should('be.visible').click();

    cy.contains('Finish').click();
    cy.contains('Successfully updated shift!').should('be.visible');
    cy.get('.close-toastr').click();
  });

  it('deletes shift', () => {
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(0).click();

    cy.contains('Edit').should('be.visible').click();
    cy.get('[role="menuitem"]').eq(1).click();

    cy.contains('Are you sure you want to delete this shift?')
    cy.get('[id^=confirmDelete]').click()
    cy.contains('Deleted shift!').should('be.visible');
    cy.get('.close-toastr').click();
  })
});
