/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (finances.js) is part of LiteFarm.
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

describe('finances', function() {
  beforeEach(() => {
    // set up stub requests
    cy.server();
    cy.route("/user/**", 'fx:user');
    cy.route("/farm/**", 'fx:farm');
    cy.route('**/field_crop/farm/**', 'fx:fieldCropByFarm');
    cy.route('**/field/**', 'fx:fields');
    cy.route('**/shift/**', 'fx:shifts');
    cy.route('**/expense/**', 'fx:expenses');
    cy.route('**/sale/**', 'fx:sales');
    cy.route('DELETE', '/sale/*', 'OK');
    cy.route('POST', '**/sale', 'fx:sale');
    cy.route('**/expense_type/**', 'fx:expense_types');
    cy.route('POST', '**/expense', 'fx:expenses');
    cy.route('PATCH', '/sale', 'OK');

    cy.viewport(410, 730);
    cy.visit('http://localhost:3000');
    // grab token by making api call to auth0
    // https://auth0.com/blog/end-to-end-testing-with-cypress-and-auth0/
    cy.login();
    cy.wait(1100);
    cy.get('.bm-burger-button').click();
    cy.contains('Finances').should('be.visible').click();
  });

  it('adds sale', () => {
    cy.contains('Add New Sale').should('be.visible').click();
    cy.get('[name="financeReducer.forms.addSale.name"]').type('Ned');
    cy.contains('select crop').click();
    cy.get('[id*="option-0"]').should('be.visible').click();
    cy.get('[data-test="unit-input"]:first').should('be.visible').type('10');
    cy.get('[data-test="unit-input"]:last').should('be.visible').type('25');

    cy.contains('Save').should('be.visible').click();
    cy.contains('Successfully added new Sale!').should('be.visible');
    cy.get('.close-toastr').click();
  });

  it('edits sale', () => {
    cy.contains('Actual').should('be.visible').click();
    cy.get('[class="glyphicon glyphicon-menu-right"]').first().click();
    cy.get('[data-test="edit-or-delete-sale"]').click();
    cy.get('[data-test="edit-sale"]').click();
    cy.contains('Save').should('be.visible').click();
    cy.contains('Successfully').should('be.visible');
    cy.get('.close-toastr').click();
  });

  it('deletes sale', () => {
    cy.contains('Actual').should('be.visible').click();
    cy.get('[class="glyphicon glyphicon-menu-right"]').first().click();
    cy.get('[data-test="edit-or-delete-sale"]').click();
    cy.get('[data-test="delete-sale"]').click();

    cy.get('[class="popup-content "]').contains('Delete').click();
    cy.contains('Successfully deleted Sale!').should('be.visible');
    cy.get('.close-toastr').click();
  });

  // TODO: add tests for expenses

  it('Add new expense', ()=>{
    cy.contains('Add New Expense').should('be.visible').click();
    cy.get('[id="t-3"]').should('be.visible').click();
    cy.contains('Next').should('be.visible').click();
    cy.get('[name="financeReducer.forms.expenseDetail[33a2418c-b8bd-11e9-b0ec-f40f2420dc43][0].note"]').type('P0 tires');
    cy.get('[name="financeReducer.forms.expenseDetail[33a2418c-b8bd-11e9-b0ec-f40f2420dc43][0].value"]').type('128');
    cy.contains('Add more items').should('be.visible').click();
    cy.get('[name="financeReducer.forms.expenseDetail[33a2418c-b8bd-11e9-b0ec-f40f2420dc43][1].note"]').type('Renault Engine');
    cy.get('[name="financeReducer.forms.expenseDetail[33a2418c-b8bd-11e9-b0ec-f40f2420dc43][1].value"]').type('256');
    cy.contains('Add more items').should('be.visible').click();
    cy.get('[name="financeReducer.forms.expenseDetail[33a2418c-b8bd-11e9-b0ec-f40f2420dc43][2].note"]').type('Russian lug nuts');
    cy.get('[name="financeReducer.forms.expenseDetail[33a2418c-b8bd-11e9-b0ec-f40f2420dc43][2].value"]').type('8');
    cy.contains('Save').should('be.visible').click();
    cy.contains('Successfully added new expenses!').should('be.visible');
    cy.get('.close-toastr').click();
  });

});
