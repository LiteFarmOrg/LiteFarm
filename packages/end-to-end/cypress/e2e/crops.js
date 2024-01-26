import moment from 'moment';
import {
  COMPLIANCE_NEW_VARIETY_SAVE,
  COMPLIANCE_SEED,
  COMPLIANCE_SEED_AVAILABILITY,
  COMPLIANCE_SEED_ENGINEERED,
  COMPLIANCE_SEED_TREATED,
  CROP_ADD_LINK,
  CROP_ANNUAL,
  CROP_CROP_NAME,
  CROP_PLAN_LOCATION_SUBMIT,
  CROP_PLAN_PLANT_DATE,
  CROP_PLAN_PLANT_HARVEST,
  CROP_PLAN_SAVE,
  CROP_PLAN_SEED_GERMINATION,
  CROP_PLAN_SUBMIT,
  CROP_PLAN_TRANSPLANT_SUBMIT,
  CROP_SUBMIT,
  CROP_SUPPLIER,
  CROP_VARIETY,
  MAP_SELECT_LOCATION,
  PLANTING_METHOD_SUBMIT,
  PLANT_DATE_SUBMIT,
  PLAN_GUIDANCE_SUBMIT,
  RADIO,
  REACT_SELECT,
  ROW_METHOD_EQUAL_LENGTH,
  ROW_METHOD_LENGTH,
  ROW_METHOD_ROWS,
  ROW_METHOD_SPACING,
  ROW_METHOD_SUBMIT,
  ROW_METHOD_YIELD,
  SPOTLIGHT_NEXT,
  VARIETY_SUBMIT,
} from '../support/selectorConstants.ts';

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

  it('AddCropVariety', () => {
    const uniqueSeed = Date.now().toString();
    const uniqueId = Cypress._.uniqueId(uniqueSeed);

    // Add a crop variety
    cy.contains(translation['MENU']['CROPS']).should('exist').click();
    cy.url().should('include', '/crop_catalogue');

    cy.get(CROP_ADD_LINK).should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/crop/new');
    cy.get(CROP_CROP_NAME)
      .should('exist')
      .type('New Crop' + uniqueId);
    // cy.contains(translation['INVITE_USER']['CHOOSE_ROLE'])
    cy.get(REACT_SELECT)
      .find('input')
      .type(crops['CEREALS'] + '{enter}');

    cy.get(RADIO).first().check({ force: true });

    cy.get(CROP_SUBMIT).should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/crop/new/add_crop_variety');
    cy.get(CROP_VARIETY).should('exist').type('New Variety');
    cy.get(CROP_SUPPLIER).should('exist').type('New Supplier');
    cy.get(CROP_ANNUAL).should('exist').check({ force: true });
    cy.get(VARIETY_SUBMIT).should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/crop/new/add_crop_variety/compliance');
    cy.get(COMPLIANCE_NEW_VARIETY_SAVE).should('exist').and('be.disabled');
    cy.get(COMPLIANCE_SEED).eq(1).should('exist').check({ force: true });
    cy.get(COMPLIANCE_SEED).eq(1).should('exist').check({ force: true });
    cy.get(COMPLIANCE_SEED_AVAILABILITY).eq(1).should('exist').check({ force: true });
    cy.get(COMPLIANCE_SEED_ENGINEERED).eq(0).should('exist').check({ force: true });
    cy.get(COMPLIANCE_SEED_TREATED).eq(2).should('exist').check({ force: true });
    cy.get(COMPLIANCE_NEW_VARIETY_SAVE).should('exist').and('not.be.disabled').click();

    // Check if spotlight was shown
    cy.window()
      .its('store')
      .invoke('getState')
      .its('entitiesReducer.showedSpotlightReducer.management_plan_creation')
      .then((managementPlanCreation) => {
        if (!managementPlanCreation) {
          // Checks if the value is false
          cy.get(SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
          cy.get(SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
        }
      });

    // Add Management Plan
    cy.contains(translation['CROP_DETAIL']['ADD_PLAN']).click();
    cy.get(RADIO).first().check();
    cy.get(CROP_PLAN_SUBMIT).should('exist').and('not.be.disabled').click();
    cy.get(CROP_PLAN_TRANSPLANT_SUBMIT).should('exist').and('not.be.disabled').click();

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    const dueDate = getDateInputFormat(date);
    cy.get(CROP_PLAN_PLANT_DATE).should('exist').type(dueDate);
    cy.get(CROP_PLAN_SEED_GERMINATION).should('exist').type('15');
    cy.get(CROP_PLAN_PLANT_HARVEST).should('exist').type('30');
    cy.get(PLANT_DATE_SUBMIT).should('exist').and('not.be.disabled').click();

    // Select field
    cy.contains('First Field').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500, { log: false });
    cy.get(MAP_SELECT_LOCATION).click({ force: false });
    cy.get(CROP_PLAN_LOCATION_SUBMIT).should('exist').and('not.be.disabled').click();

    // Planning Method
    cy.get(RADIO).first().check();
    cy.get(PLANTING_METHOD_SUBMIT).should('exist').and('not.be.disabled').click();

    // Row length
    cy.get(ROW_METHOD_EQUAL_LENGTH).first().check();

    cy.get(ROW_METHOD_ROWS).should('exist').type('15{enter}');
    cy.get(ROW_METHOD_LENGTH).should('exist').type('15{enter}');
    cy.get(ROW_METHOD_SPACING).should('exist').type('15{enter}');
    cy.contains(translation['MANAGEMENT_PLAN']['PLANT_SPACING']).click({ force: true });
    cy.get(ROW_METHOD_YIELD).should('exist').type('15');
    cy.contains(translation['MANAGEMENT_PLAN']['PLANT_SPACING']).click({ force: true });
    cy.get(ROW_METHOD_SUBMIT).should('exist').and('not.be.disabled').click();

    cy.get(PLAN_GUIDANCE_SUBMIT).should('exist').and('not.be.disabled').click();
    cy.get(CROP_PLAN_SAVE).should('exist').and('not.be.disabled').click();

    // Check if spotlight was shown
    cy.window()
      .its('store')
      .invoke('getState')
      .its('entitiesReducer.showedSpotlightReducer.crop_variety_detail')
      .then((managementPlanCreation) => {
        if (!managementPlanCreation) {
          // Checks if the value is false
          cy.get(SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
          cy.get(SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
        }
      });
  });
});
