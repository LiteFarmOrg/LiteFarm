/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (log.js) is part of LiteFarm.
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

describe('log', function () {
  beforeEach(() => {
    // set up stub requests
    cy.server();
    cy.route('/user/**', 'fx:user');
    cy.route('/farm/**', 'fx:farm');
    cy.route('**/field_crop/farm/**', 'fx:fieldCropByFarm');
    cy.route('**/field/**', 'fx:fields');
    cy.route('/log**', 'fx:logs');
    cy.route('POST', '/log', 'OK');
    cy.route('PUT', '/log/*', 'OK');
    cy.route('DELETE', '/log/*', 'OK');
    cy.route('/fertilizer/**', 'fx:fertilizers');
    cy.route('/pesticide/**', 'fx:pesticides');
    cy.route('/disease/**', 'fx:diseases');

    cy.viewport(410, 730);
    cy.visit('http://localhost:3000');
    // grab token by making api call to auth0
    // https://auth0.com/blog/end-to-end-testing-with-cypress-and-auth0/
    cy.login();

    cy.wait(1100);
    cy.get('.bm-burger-button').click();
    cy.contains('Log').should('be.visible').click();
  });

  it('renders summary page', function () {
    // renders all logs
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]')
      .its('length')
      .should('eq', 9);
    cy.contains('Pest Control');
    cy.contains('Harvest');
    cy.contains('Seeding');
    cy.contains('Field Work');
    cy.contains('Soil Data');
    cy.contains('Irrigation');
    cy.contains('Scouting');
    cy.contains('Other');
    cy.contains('Fertilizing');

    // check filters
    cy.contains('All').click({ force: true });
    cy.contains('Harvest').should('be.visible').click();
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]')
      .its('length')
      .should('eq', 1);

    cy.contains('All Crops').click();
    cy.contains('Apple').should('be.visible').click();
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]')
      .its('length')
      .should('eq', 1);

    cy.contains('All Fields').click();
    cy.contains('UBC Farm 1').should('be.visible').click();
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').should('not.exist');

    // TODO: add test for date filters
  });

  // TODO: uncomment when tests for logs are updated
  // it('adds logs', function() {
  //   // add fertilizer log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Fertilizing').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Field Crop').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.contains('Select Product').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.fertLog.quantity_kg"]').type('25');
  //   cy.get('[name="logReducer.forms.fertLog.notes"]').type('test');
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // add pesticide log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Pest Control').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Field Crop').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.contains('Search Target').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.contains('Select Type').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.contains('Select Product').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.pestControlLog.quantity_kg"]').type('25');
  //   cy.get('[name="logReducer.forms.pestControlLog.notes"]').type('test');
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // add harvest log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Harvest').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Field Crop').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.harvestLog.quantity_kg"]').type('25');
  //   cy.get('[name="logReducer.forms.harvestLog.notes"]').type('test');
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added new Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // add seeding log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Seeding').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Field Crop').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.seedLog.space_depth_cm"]').type('2');
  //   cy.get('[name="logReducer.forms.seedLog.space_length_cm"]').type('2');
  //   cy.get('[name="logReducer.forms.seedLog.space_width_cm"]').type('2');
  //   cy.get('[name="logReducer.forms.seedLog.rate_seeds/m2"]').type('2');
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added new Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // add field work log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Field Work').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Type').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.fieldWorkLog.notes"]').type('test');
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added new Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // add soil analysis log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Soil Analysis').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Depth').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.contains('Select Texture').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   // FIXME: fill out all inputs in soil analysis log
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added new Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // add irrigation log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Irrigation').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Field Crop').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.contains('Select Type').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.irrigationLog.flow_rate_l/min"]').type('25');
  //   cy.get('[name="logReducer.forms.irrigationLog.hours"]').type('2');
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added new Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // add scouting log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Scouting').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Field Crop').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.contains('Select Type').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.scoutingLog.action_needed"]').check();
  //   cy.get('[name="logReducer.forms.scoutingLog.notes"]').type('test');
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added new Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // add other log
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Other').click();
  //
  //   cy.contains('Select Field').click();
  //   cy.contains('UBC Farm 3').should('be.visible').click();
  //   cy.contains('Select Field Crop').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.otherLog.notes"]').type('test');
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully added new Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  // });
  //
  // it('adds fertilizer', function() {
  //   cy.contains('Add New Log').should('be.visible').click();
  //   cy.contains('Fertilizing').click();
  //
  //   cy.contains('Add a custom product').should('be.visible').click();
  //   cy.contains('select product template').should('be.visible').click();
  //   cy.get('[id*="option-0"]').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.fertLog.product"]').type('secret');
  //   cy.get('[name="logReducer.forms.fertLog.n_percentage"]').type('1');
  //   cy.get('[name="logReducer.forms.fertLog.nh4_n_ppm"]').type('1');
  //   cy.get('[name="logReducer.forms.fertLog.k_percentage"]').type('1');
  //   cy.get('[name="logReducer.forms.fertLog.p_percentage"]').type('1');
  //   cy.get('[name="logReducer.forms.fertLog.moisture_percentage"]').type('1');
  //   cy.get('[class="popup-content "]').contains('Save').should('be.visible').click();
  //
  //   // check if form is reset
  //   cy.contains('Add a custom product').should('be.visible').click();
  //   cy.get('[name="logReducer.forms.fertLog.n_percentage"]').should('have.value', '');
  // });

  it('adds pesticide', function () {
    cy.contains('Add New Log').should('be.visible').click();
    cy.contains('Pest Control').click();

    cy.contains('Add a Custom Product').should('be.visible').click();
    // cy.contains('Choose a target').should('be.visible').click();
    // cy.get('[id*="option-0"]').should('be.visible').click();
    cy.get('[name="logReducer.forms.pestControlLog.custom_pesticide_name"]').type('secret');
    cy.get('[class="popup-content "]').contains('Save').should('be.visible').click();

    // check if form is reset
    cy.contains('Add a Custom Product').should('be.visible').click();
    cy.get('[name="logReducer.forms.pestControlLog.custom_pesticide_name"]').should(
      'have.value',
      '',
    );
  });

  it('adds disease', function () {
    cy.contains('Add New Log').should('be.visible').click();
    cy.contains('Pest Control').click();

    cy.contains('Add a Target').should('be.visible').click();
    cy.contains('Add a target').should('be.visible').click();
    cy.get('[id*="option-0"]').should('be.visible').click();
    cy.get('[name="logReducer.forms.pestControlLog.custom_disease_common_name"]').type('secret');
    cy.get('[class="popup-content "]').contains('Save').should('be.visible').click();

    // check if form is reset
    cy.contains('Add a Target').should('be.visible').click();
    cy.get('[name="logReducer.forms.pestControlLog.custom_disease_common_name"]').should(
      'have.value',
      '',
    );
  });

  // TODO: uncomment when tests for logs are updated
  // it('edits logs', function() {
  //   // edit fertilizer log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').first().click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // edit pest control log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(1).click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // edit harvest log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(2).click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   //edit seeding log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(3).click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   //edit field work log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(4).click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // edit soil data log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(5).click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // edit irrigation log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(6).click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // edit scouting log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(7).click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // edit other log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(8).click();
  //
  //   cy.contains('Save').should('be.visible').click();
  //   cy.contains('Successfully edited Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  // });
  //
  // it('deletes logs', function() {
  //   // delete fertilizer log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').first().click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // delete pest control log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(1).click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // delete harvest log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(2).click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   //delete seeding log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(3).click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   //delete field work log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(4).click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // delete soil data log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(5).click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // delete irrigation log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(6).click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // delete scouting log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(7).click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  //
  //   // delete other log
  //   cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-menu-right"]').eq(8).click();
  //
  //   cy.contains('Delete').should('be.visible').click();
  //   cy.get('[class="popup-content "]').contains('Delete').click();
  //   cy.contains('Successfully deleted Log!').should('be.visible');
  //   cy.get('.close-toastr').click();
  // })
});
