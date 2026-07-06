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

// import moment from 'moment';
// import * as Selectors from '../support/selectorConstants.ts';
import {
  createFarm,
  createUser,
  farmConsent,
  farmToken,
  initApi,
  onboardFarm,
  onboardRole,
  organicCertifierSurvey,
  ownerOperated,
  releseBadge,
  showedSpotlight,
  userAuth
} from '../support/api';
import { loadTranslations } from '../support/utilities';

describe('Crops', () => {
  let ctx;

  beforeEach(async () => {
    initApi(Cypress.env('apiUrl'))
    ctx = await createUser();
    ctx.auth = await userAuth(ctx.user.email, ctx.password)
    
    const [translation, crops] = await loadTranslations({
      additionalTranslation: 'crop_group',
      user: ctx.user,
    });

    ctx.translation = translation;
    ctx.crops = crops;
    ctx.farm = await createFarm(ctx.auth)

    await onboardFarm(ctx.auth, ctx.farm.farm_id, ctx.user.user_id);
    await onboardRole(ctx.auth, ctx.farm.farm_id, ctx.user.user_id, 2);
    await ownerOperated(ctx.auth, ctx.farm.farm_id, ctx.user.user_id);
    await farmConsent(ctx.auth, ctx.farm.farm_id, ctx.user.user_id, true);
    await organicCertifierSurvey(ctx.auth, ctx.farm.farm_id, ctx.user.user_id);
    await releseBadge(ctx.auth, ctx.farm.farm_id, ctx.user.user_id);
    await showedSpotlight(ctx.auth, ctx.user.user_id);
    ctx.farmToken = await farmToken(ctx.auth, ctx.farm.farm_id, ctx.user.user_id);
  });

    // console.log(ctx)
    // cy.pause()
  it('should successfully add a crop variety and crop plan', () => {
    cy.injectTokensToUI(ctx.auth.token, ctx.farmToken.farm_token);
    // cy.visit('/crop_catalogue')
    cy.pause();
    // cy.get('@ctx').then(({ user, translation, crops }) => {
    //   console.log(translation);
    //   console.log(crops);
    //   console.log(user);
    //   cy.pause();
    // });
    // const uniqueSeed = Date.now().toString();
    // const uniqueId = Cypress._.uniqueId(uniqueSeed);

    // // Add a crop variety
    // cy.contains(translation['MENU']['CROPS']).should('exist').click();
    // cy.url().should('include', '/crop_catalogue');

    // cy.get(Selectors.CROP_ADD_LINK).should('exist').and('not.be.disabled').click();

    // cy.url().should('include', '/crop/new');
    // cy.get(Selectors.CROP_CROP_NAME)
    //   .should('exist')
    //   .type('New Crop' + uniqueId);
    // // cy.contains(translation['INVITE_USER']['CHOOSE_ROLE'])
    // cy.getVisible(Selectors.REACT_SELECT)
    //   .find('input')
    //   .type(crops['CEREALS'] + '{enter}');

    // cy.get(Selectors.CAN_BE_COVER_CROP).first().check({ force: true });

    // cy.get(Selectors.CROP_SUBMIT).should('exist').and('not.be.disabled').click();
    // cy.url().should('include', '/crop/new/add_crop_variety');
    // cy.get(Selectors.CROP_VARIETY).should('exist').type('New Variety');
    // cy.get(Selectors.CROP_SUPPLIER).should('exist').type('New Supplier');
    // cy.get(Selectors.CROP_ANNUAL).should('exist').check({ force: true });
    // cy.get(Selectors.VARIETY_SUBMIT).should('exist').and('not.be.disabled').click();
    // cy.url().should('include', '/crop/new/add_crop_variety/compliance');
    // cy.get(Selectors.COMPLIANCE_NEW_VARIETY_SAVE).should('exist').and('be.disabled');
    // cy.get(Selectors.COMPLIANCE_SEED).eq(1).should('exist').check({ force: true });
    // cy.get(Selectors.COMPLIANCE_SEED).eq(1).should('exist').check({ force: true });
    // cy.get(Selectors.COMPLIANCE_SEED_AVAILABILITY).eq(1).should('exist').check({ force: true });
    // cy.get(Selectors.COMPLIANCE_SEED_ENGINEERED).eq(0).should('exist').check({ force: true });
    // cy.get(Selectors.COMPLIANCE_SEED_TREATED).eq(2).should('exist').check({ force: true });
    // cy.get(Selectors.COMPLIANCE_NEW_VARIETY_SAVE).should('exist').and('not.be.disabled').click();

    // // Check if spotlight was shown
    // cy.window()
    //   .its('store')
    //   .invoke('getState')
    //   .its('entitiesReducer.showedSpotlightReducer.management_plan_creation')
    //   .then((managementPlanCreation) => {
    //     if (!managementPlanCreation) {
    //       // Checks if the value is false
    //       cy.get(Selectors.SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
    //       cy.get(Selectors.SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
    //     }
    //   });

    // // Add Management Plan
    // cy.contains(translation['CROP_DETAIL']['ADD_PLAN']).click();
    // cy.get(Selectors.PLANTING_METHOD_GROUND_PLANTED).first().check();
    // cy.get(Selectors.CROP_PLAN_SUBMIT).should('exist').and('not.be.disabled').click();
    // cy.get(Selectors.CROP_PLAN_TRANSPLANT_SUBMIT).should('exist').and('not.be.disabled').click();

    // const date = new Date();
    // date.setDate(date.getDate() + 1);
    // const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    // const dueDate = getDateInputFormat(date);
    // cy.get(Selectors.CROP_PLAN_PLANT_DATE).should('exist').type(dueDate);
    // cy.get(Selectors.CROP_PLAN_SEED_GERMINATION).should('exist').type('15');
    // cy.get(Selectors.CROP_PLAN_PLANT_HARVEST).should('exist').type('30');
    // cy.get(Selectors.PLANT_DATE_SUBMIT).should('exist').and('not.be.disabled').click();

    // // Select field
    // cy.contains('First Field').should('be.visible');
    // // eslint-disable-next-line cypress/no-unnecessary-waiting
    // cy.wait(500, { log: false });
    // cy.get(Selectors.MAP_SELECT_LOCATION).click({ force: false });
    // cy.get(Selectors.CROP_PLAN_LOCATION_SUBMIT).should('exist').and('not.be.disabled').click();

    // // Planning Method
    // cy.get(Selectors.PLANTING_METHOD_ROW).check();
    // cy.get(Selectors.PLANTING_METHOD_SUBMIT).should('exist').and('not.be.disabled').click();

    // // Row length
    // cy.get(Selectors.ROW_METHOD_EQUAL_LENGTH).first().check();

    // cy.get(Selectors.ROW_METHOD_ROWS).should('exist').type('15{enter}');
    // cy.get(Selectors.ROW_METHOD_LENGTH).should('exist').type('15{enter}');
    // cy.get(Selectors.ROW_METHOD_SPACING).should('exist').type('15{enter}');
    // cy.contains(translation['MANAGEMENT_PLAN']['PLANT_SPACING']).click({ force: true });
    // cy.get(Selectors.ROW_METHOD_YIELD).should('exist').type('15');
    // cy.contains(translation['MANAGEMENT_PLAN']['PLANT_SPACING']).click({ force: true });
    // cy.get(Selectors.ROW_METHOD_SUBMIT).should('exist').and('not.be.disabled').click();

    // cy.get(Selectors.PLAN_GUIDANCE_SUBMIT).should('exist').and('not.be.disabled').click();
    // cy.get(Selectors.CROP_PLAN_SAVE).should('exist').and('not.be.disabled').click();

    // // Check if spotlight was shown
    // cy.window()
    //   .its('store')
    //   .invoke('getState')
    //   .its('entitiesReducer.showedSpotlightReducer.crop_variety_detail')
    //   .then((managementPlanCreation) => {
    //     if (!managementPlanCreation) {
    //       // Checks if the value is false
    //       cy.get(Selectors.SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
    //       cy.get(Selectors.SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
    //     }
    //   });
  });
});
