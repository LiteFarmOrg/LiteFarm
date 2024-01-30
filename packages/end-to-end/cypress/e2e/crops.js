/*
 *  Copyright 2023, 2024 LiteFarm.org
 *  This file is part of LiteFarm.
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

import moment from 'moment';
import * as Selectors from '../support/selectorConstants.ts';

describe('Crops', () => {
  let users;
  let translation;
  let crops;

  beforeEach(() => {
    // Load the users fixture before the tests
    cy.fixture('e2e-test-users.json').then((loadedUsers) => {
      users = loadedUsers;
      const user = users[Cypress.env('USER')];

      // Load the locale fixture by reusing translations file
      cy.fixture('../../../webapp/public/locales/' + user.locale + '/translation.json').then(
        (data) => {
          // Use the loaded data
          translation = data;

          cy.visit('/');
          cy.loginOrCreateAccount(
            user.email,
            user.password,
            user.name,
            user.language,
            translation['MENU']['CROPS'],
            translation['MENU']['MAP'],
            translation['FARM_MAP']['MAP_FILTER']['GARDEN'],
          );
        },
      );

      // Load the locale fixture by reusing translations file
      cy.fixture('../../../webapp/public/locales/' + user.locale + '/crop_group.json').then(
        (data) => {
          // Use the loaded data
          crops = data;
        },
      );
    });
  });

  after(() => {});

  it('should successfully add a crop variety and crop plan', () => {
    cy.intercept('GET', '**/maps.googleapis.com/maps/api/**').as('googleMapsApiCall');

    const uniqueSeed = Date.now().toString();
    const uniqueId = Cypress._.uniqueId(uniqueSeed);

    // Add a crop variety
    cy.contains(translation['MENU']['CROPS']).should('exist').click();
    cy.url().should('include', '/crop_catalogue');

    cy.get(Selectors.CROP_ADD_LINK).should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/crop/new');
    cy.get(Selectors.CROP_CROP_NAME)
      .should('exist')
      .type('New Crop' + uniqueId);
    // cy.contains(translation['INVITE_USER']['CHOOSE_ROLE'])
    cy.get(Selectors.REACT_SELECT)
      .find('input')
      .type(crops['CEREALS'] + '{enter}');

    cy.get(Selectors.RADIO).first().check({ force: true });

    cy.get(Selectors.CROP_SUBMIT).should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/crop/new/add_crop_variety');
    cy.get(Selectors.CROP_VARIETY).should('exist').type('New Variety');
    cy.get(Selectors.CROP_SUPPLIER).should('exist').type('New Supplier');
    cy.get(Selectors.CROP_ANNUAL).should('exist').check({ force: true });
    cy.get(Selectors.VARIETY_SUBMIT).should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/crop/new/add_crop_variety/compliance');
    cy.get(Selectors.COMPLIANCE_NEW_VARIETY_SAVE).should('exist').and('be.disabled');
    cy.get(Selectors.COMPLIANCE_SEED).eq(1).should('exist').check({ force: true });
    cy.get(Selectors.COMPLIANCE_SEED).eq(1).should('exist').check({ force: true });
    cy.get(Selectors.COMPLIANCE_SEED_AVAILABILITY).eq(1).should('exist').check({ force: true });
    cy.get(Selectors.COMPLIANCE_SEED_ENGINEERED).eq(0).should('exist').check({ force: true });
    cy.get(Selectors.COMPLIANCE_SEED_TREATED).eq(2).should('exist').check({ force: true });
    cy.get(Selectors.COMPLIANCE_NEW_VARIETY_SAVE).should('exist').and('not.be.disabled').click();

    // Check if spotlight was shown
    cy.window()
      .its('store')
      .invoke('getState')
      .its('entitiesReducer.showedSpotlightReducer.management_plan_creation')
      .then((managementPlanCreation) => {
        if (!managementPlanCreation) {
          // Checks if the value is false
          cy.get(Selectors.SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
          cy.get(Selectors.SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
        }
      });

    // Add Management Plan
    cy.contains(translation['CROP_DETAIL']['ADD_PLAN']).click();
    cy.get(Selectors.RADIO).first().check();
    cy.get(Selectors.CROP_PLAN_SUBMIT).should('exist').and('not.be.disabled').click();
    cy.get(Selectors.CROP_PLAN_TRANSPLANT_SUBMIT).should('exist').and('not.be.disabled').click();

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    const dueDate = getDateInputFormat(date);
    cy.get(Selectors.CROP_PLAN_PLANT_DATE).should('exist').type(dueDate);
    cy.get(Selectors.CROP_PLAN_SEED_GERMINATION).should('exist').type('15');
    cy.get(Selectors.CROP_PLAN_PLANT_HARVEST).should('exist').type('30');
    cy.get(Selectors.PLANT_DATE_SUBMIT).should('exist').and('not.be.disabled').click();

    // Select field
    cy.contains('First Field').should('be.visible');
    cy.wait('@googleMapsApiCall');
    cy.waitForReact();
    cy.get(Selectors.MAP_SELECT_LOCATION).click({ force: false });
    cy.get(Selectors.CROP_PLAN_LOCATION_SUBMIT).should('exist').and('not.be.disabled').click();

    // Planning Method
    cy.get(Selectors.RADIO).first().check();
    cy.get(Selectors.PLANTING_METHOD_SUBMIT).should('exist').and('not.be.disabled').click();

    // Row length
    cy.get(Selectors.ROW_METHOD_EQUAL_LENGTH).first().check();

    cy.get(Selectors.ROW_METHOD_ROWS).should('exist').type('15{enter}');
    cy.get(Selectors.ROW_METHOD_LENGTH).should('exist').type('15{enter}');
    cy.get(Selectors.ROW_METHOD_SPACING).should('exist').type('15{enter}');
    cy.contains(translation['MANAGEMENT_PLAN']['PLANT_SPACING']).click({ force: true });
    cy.get(Selectors.ROW_METHOD_YIELD).should('exist').type('15');
    cy.contains(translation['MANAGEMENT_PLAN']['PLANT_SPACING']).click({ force: true });
    cy.get(Selectors.ROW_METHOD_SUBMIT).should('exist').and('not.be.disabled').click();

    cy.get(Selectors.PLAN_GUIDANCE_SUBMIT).should('exist').and('not.be.disabled').click();
    cy.get(Selectors.CROP_PLAN_SAVE).should('exist').and('not.be.disabled').click();

    // Check if spotlight was shown
    cy.window()
      .its('store')
      .invoke('getState')
      .its('entitiesReducer.showedSpotlightReducer.crop_variety_detail')
      .then((managementPlanCreation) => {
        if (!managementPlanCreation) {
          // Checks if the value is false
          cy.get(Selectors.SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
          cy.get(Selectors.SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
        }
      });
  });
});
