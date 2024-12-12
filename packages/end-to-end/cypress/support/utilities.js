/*
 *  Copyright 2024 LiteFarm.org
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

export const loadTranslationsAndConfigureUserFarm = ({ additionalTranslation }) => {
  return cy.fixture('e2e-test-users.json').then((loadedUsers) => {
    const users = loadedUsers;
    const user = users[Cypress.env('USER')];

    return cy
      .fixture('../../../webapp/public/locales/' + user.locale + '/translation.json')
      .then((translation) => {
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

        return cy
          .fixture(
            '../../../webapp/public/locales/' + user.locale + `/${additionalTranslation}.json`,
          )
          .then((additionalTranslationData) => {
            return [translation, additionalTranslationData];
          });
      });
  });
};
