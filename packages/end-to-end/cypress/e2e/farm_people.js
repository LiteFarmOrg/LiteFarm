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

import * as Selectors from '../support/selectorConstants.ts';
import { loadTranslationsAndConfigureUserFarm } from '../support/utilities.js';

describe('Farm People', () => {
  let translation;
  let roles;

  beforeEach(() => {
    loadTranslationsAndConfigureUserFarm({ additionalTranslation: 'role' }).then(
      ([baseTranslation, additionalTranslation]) => {
        translation = baseTranslation;
        roles = additionalTranslation;
      },
    );
  });

  it('should invite a manager user', () => {
    const uniqueSeed = Date.now().toString();
    const uniqueId = Cypress._.uniqueId(uniqueSeed);

    cy.contains(translation['MENU']['PEOPLE'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people1');

    cy.get(Selectors.INVITE_USER).should('exist').and('not.be.disabled').click();

    cy.get(Selectors.INVITE_USER_NAME).click();
    cy.get(Selectors.INVITE_USER_NAME).should('exist').type('Awesome Farm Manager');

    cy.contains(translation['INVITE_USER']['CHOOSE_ROLE']).click({ force: true });
    cy.contains(roles['MANAGER']).click({ force: true });

    cy.get(Selectors.INVITE_USER_EMAIL)
      .should('exist')
      .type('farm_manager' + uniqueId + '@litefarm.com');
    cy.get(Selectors.INVITE_USER_SUBMIT).should('exist').and('not.be.disabled').click();
  });

  it('it should fail to invite an invalid email address', () => {
    cy.contains(translation['MENU']['PEOPLE'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');

    cy.get(Selectors.INVITE_USER).should('exist').and('not.be.disabled').click();

    cy.get(Selectors.INVITE_USER_NAME).click();
    cy.get(Selectors.INVITE_USER_NAME).should('exist').type('Invalid Farm Manager');
    cy.get(Selectors.INVITE_USER_EMAIL).should('exist').type('Invalid email');
    cy.get(Selectors.INVITE_USER_NAME).click();
    cy.get(Selectors.INPUT_ERROR)
      .contains(translation['INVITE_USER']['INVALID_EMAIL_ERROR'])
      .should('exist');
  });

  it('it should fail to invite a duplicate email address', () => {
    const uniqueSeed = Date.now().toString();
    const uniqueId = Cypress._.uniqueId(uniqueSeed);

    cy.contains(translation['MENU']['PEOPLE'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');

    cy.get(Selectors.INVITE_USER).should('exist').and('not.be.disabled').click();

    cy.get(Selectors.INVITE_USER_NAME).click();
    cy.get(Selectors.INVITE_USER_NAME).should('exist').type('Awesome Farm Manager');

    cy.contains(translation['INVITE_USER']['CHOOSE_ROLE']).click({ force: true });
    cy.contains(roles['MANAGER']).click({ force: true });

    cy.get(Selectors.INVITE_USER_EMAIL)
      .should('exist')
      .type('farm_manager' + uniqueId + '@litefarm.com');
    cy.get(Selectors.INVITE_USER_SUBMIT).should('exist').and('not.be.disabled').click();

    // Invite the same user again
    cy.get(Selectors.INVITE_USER).should('exist').and('not.be.disabled').click();

    cy.get(Selectors.INVITE_USER_NAME).click();
    cy.get(Selectors.INVITE_USER_NAME).should('exist').type('Awesome Farm Manager');

    cy.contains(translation['INVITE_USER']['CHOOSE_ROLE']).click({ force: true });
    cy.contains(roles['MANAGER']).click({ force: true });

    cy.get(Selectors.INVITE_USER_EMAIL)
      .should('exist')
      .type('farm_manager' + uniqueId + '@litefarm.com');

    cy.get(Selectors.INVITE_USER_NAME).click();
    cy.get(Selectors.INPUT_ERROR)
      .contains(translation['INVITE_USER']['ALREADY_EXISTING_EMAIL_ERROR'])
      .should('exist');
  });
});
