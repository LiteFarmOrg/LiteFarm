/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (onboarding.js) is part of LiteFarm.
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

describe('onboarding', function () {
  beforeEach(() => {
    // set up stub requests
    cy.server();
    cy.route('**/user/farm/**', 'fx:user');
    cy.route('PATCH', '/user/**', 'OK');
    cy.route('/farm/**', 'fx:farm');
    cy.route('/field_crop/**', 'fx:fieldCropByFarm');
    cy.route('PUT', '**/farm/**', 'fx:farm');
    cy.route('PUT', '**/user/**', 'fx:user');
    cy.route('POST', '/farm', {
      farm_id: '16ce7028-e42b-11e9-9717-9bd9186e761c',
      farm_name: 'Cypress Farm',
      address: null,
      phone_number: {
        number: '',
        country: '',
      },
      units: {
        currency: 'CAD',
        measurement: 'metric',
      },
      grid_points: { lat: 49.2675373, lng: -123.2474431 },
      sandbox_bool: false,
    });

    cy.viewport(360, 640);
    cy.visit('http://localhost:3000');
    // grab token by making api call to auth0
    // https://auth0.com/blog/end-to-end-testing-with-cypress-and-auth0/
    cy.login();
    // remove farm_id from localStorage to enable access to /add_farm route
    cy.window().then((parameters) => {
      return parameters.window.localStorage.removeItem('farm_id');
    });
  });

  it('complete onboarding user story', () => {
    cy.route('/user/**', 'fx:user_not_consented');
    cy.visit('http://localhost:3000/add_farm');
    cy.get('[name="profileForms.farm.farm_name"]').type('Happy Farm');
    cy.get('[name="profileForms.farm.address"]').type('UBC');
    cy.get('[class="pac-item"]').first().click();
    cy.contains('Select...').click();
    cy.get('[id*="option-0"]').should('be.visible').click();
    cy.contains('Next').should('be.visible').click();

    cy.contains('Welcome to LiteFarm!').should('be.visible');
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-chevron-right"]')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.contains('Add your team').should('be.visible');
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-chevron-right"]')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.contains('Design your fields').should('be.visible');
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-chevron-right"]')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.contains('Plan your crops').should('be.visible');
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-chevron-right"]')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.contains('Add logs').should('be.visible');
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-chevron-right"]')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.contains('Track your labour').should('be.visible');
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-chevron-right"]')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.contains('Check profits').should('be.visible');
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-chevron-right"]')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.contains('Gather Insights').should('be.visible');
    cy.get('[class="glyphicon glyphicon-glyphicon glyphicon-chevron-right"]')
      .should('be.visible')
      .click();
    cy.wait(1000);

    cy.contains('Finish').should('be.visible').click();
    cy.wait(2000);
    cy.get('[data-test="consent_form"]').should('be.visible').scrollTo('bottom');
    cy.wait(1000);
    cy.get('[class="btn btn-primary"]').should('be.visible').click();
    cy.route('/user/**', 'fx:user');
  });
});
