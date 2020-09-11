/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (field.js) is part of LiteFarm.
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

describe('field', function() {
  beforeEach(() => {
    // set up stub requests
    cy.server();
    cy.route("**/user/*", 'fx:user');
    cy.route("**/farm/*", 'fx:farm');
    cy.route('**/field/**', 'fx:fields');
    cy.route('POST', '**/field', 'fx:field');
    cy.route('**/crop/**', 'fx:crops');
    cy.route('DELETE', '**/field_crop/**', 'OK');
    cy.route('POST', '**/field_crop', 'fx:fieldCrop');
    cy.route('**/field_crop/farm/**', 'fx:fieldCropByFarm');
    cy.route('POST', '/price', 'fx:price');
    cy.route('POST', '/yield', 'fx:yield');
    cy.route('PUT', '/field_crop/*', 'OK');

    cy.viewport(410, 730);
    cy.visit('http://localhost:3000');
    // grab token by making api call to auth0
    // https://auth0.com/blog/end-to-end-testing-with-cypress-and-auth0/
    cy.login();
  });

  it('adds a field', function() {
    cy.get('.bm-burger-button').click();
    cy.contains('Fields').should('be.visible').click();
    cy.route('**/field_crop', []);

    cy.contains('Add New Field').click();
    cy.wait(1000);
    cy.get('#polygonButton').click();
    cy.wait(4000);
    cy.get('#root').click(135, 546);
    cy.wait(1000);
    cy.get('#root').click(118, 588);
    cy.wait(1000);
    cy.get('#root').click(181, 596);
    cy.wait(1000);
    cy.get('#root').click(188, 559);
    cy.wait(1000);
    cy.get('#root').click(135, 546);

    cy.contains('Confirm').click();
    cy.get("[placeholder='Enter Field Name']").type('UBC Farm 3');
    cy.contains('Save Field').click();

    cy.contains('UBC Farm 3');
  });

  it('deletes a field crop', function() {
    cy.route('**/field_crop', 'fx:fieldCrop');

    cy.get('.bm-burger-button').click();
    cy.contains('Fields').should('be.visible').click();
    cy.get('.glyphicon-chevron-right').eq(2).click();

    cy.get('[class="panel panel-success"]').contains('Delete').should('be.visible').click();
    cy.get('[class="popup-content "]').contains('Delete').should('be.visible').click();
    cy.contains('Successfully Deleted Crop').should('be.visible');
    cy.get('.close-toastr').click();
  });
});
