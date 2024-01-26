import 'cypress-react-selector';
import {
  CHOOSE_FARM_PROCEED,
  CREATE_USER_NAME,
  CREATE_USER_EMAIL,
  CREATE_USER_PASSWORD,
  CREATE_USER_SUBMIT,
  ENTER_PASSWORD_PASSWORD,
  ENTER_PASSWORD_SUBMIT,
  SIGNUP_CONTINUE,
  SIGNUP_EMAIL,
  SPOTLIGHT_NEXT,
  WELCOME_GET_STARTED,
  ADD_FARM_CONTINUE,
  ADD_FARM_NAME,
  ADD_FARM_LOCATION,
  ROLE_SELECTION_ROLE,
  ROLE_SELECTION_CONTINUE,
  CONSENT_CONTENT,
  CONSENT_CONTINUE,
  CHECKBOX,
  INTERESTED_IN_ORGANIC_CONTINUE,
  INTERESTED_IN_ORGANIC_SELECT,
  CERTIFICATION_SELECTION_CONTINUE,
  CERTIFICATION_SELECTION_TYPE,
  CERTIFIER_SELECTION_PROCEED,
  CERTIFICATION_SELECTION_ITEM,
  CERTIFICATION_SUMMARY_CONTINUE,
  OUTRO_FINISH,
  MAP_ADD_FEATURE,
  MAP_SELECTION,
  MAP_TUTORIAL_CONTINUE,
  MAP_CONTAINER,
  MAP_DRAW_COMPLETE_CONTINUE,
  AREA_DETAILS_NAME,
  CREATE_FIELD_SAVE,
  SNACKBAR,
} from './selectorConstants.ts';

Cypress.Commands.add('waitUntilAnyVisible', (selector1, selector2, timeout = 10000) => {
  const startTime = new Date().getTime();

  const checkVisibility = () => {
    return cy.get('body', { log: false }).then(($body) => {
      if ($body.find(selector1).is(':visible')) {
        return cy.wrap($body.find(selector1), { log: false });
      } else if ($body.find(selector2).is(':visible')) {
        return cy.wrap($body.find(selector2), { log: false });
      } else if (new Date().getTime() - startTime < timeout) {
        // If timeout hasn't passed, recursively call the function
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        return cy.wait(100, { log: false }).then(checkVisibility);
      } else {
        // If timeout has passed, throw an error
        throw new Error(
          `Neither ${selector1} nor ${selector2} became visible within ${timeout}ms.`,
        );
      }
    });
  };

  return checkVisibility();
});

Cypress.Commands.add(
  'loginOrCreateAccount',
  (email, password, fullName, language, crop_menu_name, map_menu_name, fieldString) => {
    //Login page
    cy.get(SIGNUP_EMAIL).type(email);
    cy.intercept('GET', '**/login/user/' + email, (req) => {
      delete req.headers['if-none-match'];
    }).as('emailLogin');
    cy.get(SIGNUP_CONTINUE).should('exist').and('be.enabled').click();

    cy.waitUntilAnyVisible(CREATE_USER_EMAIL, ENTER_PASSWORD_PASSWORD);

    // Check if we are on pasword page or create account and act accordingly
    cy.get(CREATE_USER_EMAIL, { timeout: 0 }).then(($element) => {
      if ($element.is(':visible')) {
        cy.get(CREATE_USER_NAME).type(fullName);

        cy.contains('English').click({ force: true });
        cy.contains(language).click({ force: true });

        cy.get(CREATE_USER_PASSWORD).type(password);
        cy.get(CREATE_USER_SUBMIT).should('exist').and('be.enabled').click();

        cy.intercept('POST', '**/user').as('createUser');
        cy.get(WELCOME_GET_STARTED).should('exist').and('not.be.disabled').click();
        cy.addFarm('UBC FARM', '49.250833, -123.2410777');
        cy.onboardCompleteQuestions('Manager');
        cy.acceptSlideMenuSpotlights(crop_menu_name);
        cy.createFirstLocation(map_menu_name, fieldString);
        cy.visit('/');
      } else {
        cy.get(ENTER_PASSWORD_PASSWORD).type(password);
        cy.get(ENTER_PASSWORD_SUBMIT).should('exist').and('be.enabled').click();

        // Flaky in this sense: www.cypress.io/blog/2019/01/22/when-can-the-test-click
        // May require hard-coded wait if this is insufficient
        cy.waitForReact();
        cy.get(CHOOSE_FARM_PROCEED).should('be.visible').and('be.enabled').click({ force: true });
      }
    });
  },
);

Cypress.Commands.add('addFarm', (farmName, location) => {
  cy.intercept('GET', '**/maps.googleapis.com/maps/api/js/GeocodeService.*').as(
    'googleMapGeocodeCall',
  );
  cy.url().should('include', '/add_farm');

  cy.waitForReact();
  cy.get(ADD_FARM_CONTINUE).should('exist').should('be.disabled');
  cy.get(ADD_FARM_NAME).should('exist').type(farmName);
  cy.get(ADD_FARM_LOCATION).should('exist').type(location);
  cy.wait('@googleMapGeocodeCall');
  cy.waitForReact();
  cy.get(ADD_FARM_CONTINUE).should('not.be.disabled').click();
});

Cypress.Commands.add('onboardCompleteQuestions', (role) => {
  // cy.clock();
  cy.url().should('include', '/role_selection');
  // cy.tick();
  cy.get(ROLE_SELECTION_CONTINUE).should('exist').and('be.disabled');
  cy.waitForReact();
  cy.get(ROLE_SELECTION_ROLE).should('exist').check(role, { force: true });
  cy.get(ROLE_SELECTION_CONTINUE).should('not.be.disabled').click();
  // cy.clock().then((clock) => {
  //   clock.restore();
  // });

  // Give consent
  cy.url().should('include', '/consent');
  cy.get(CONSENT_CONTENT, { timeout: 180 * 1000 }).should('exist');
  cy.get(CONSENT_CONTINUE).should('exist').and('be.disabled');
  cy.get(CHECKBOX).should('exist').click();
  cy.get(CONSENT_CONTINUE).should('not.be.disabled').click();

  // Interested in Organic
  cy.log('Interested in Organic');

  cy.url().should('include', '/certification/interested_in_organic');
  cy.get(INTERESTED_IN_ORGANIC_CONTINUE, { timeout: 180 * 1000 })
    .should('exist')
    .and('be.disabled');
  cy.get(INTERESTED_IN_ORGANIC_SELECT).should('exist');
  cy.get('[type="radio"]').first().check();
  cy.get(INTERESTED_IN_ORGANIC_CONTINUE).should('not.be.disabled').click();

  cy.url().should('include', '/certification/selection');
  cy.get(CERTIFICATION_SELECTION_CONTINUE).should('exist').and('be.disabled');
  cy.get(CERTIFICATION_SELECTION_TYPE).should('exist');
  cy.get('[type="radio"]').first().check();
  cy.get(CERTIFICATION_SELECTION_CONTINUE).should('not.be.disabled').click();

  // Select certifier
  cy.get(CERTIFIER_SELECTION_PROCEED).should('exist').and('be.disabled');
  cy.get(CERTIFICATION_SELECTION_ITEM).should('exist').eq(1).click();
  let certifier;
  cy.get(CERTIFICATION_SELECTION_ITEM)
    .eq(1)
    .then(function ($elem) {
      certifier = $elem.text();
      let end = certifier.indexOf('(');
      let result = certifier.substring(1, end);
      //click the proceed button and ensure test is on the certification summary view and the certification selected is displayed
      cy.get(CERTIFIER_SELECTION_PROCEED).should('not.be.disabled').click();
      cy.url().should('include', '/certification/summary');
      cy.contains(result).should('exist');
    });

  //certification summary
  cy.get(CERTIFICATION_SUMMARY_CONTINUE).should('exist').and('not.be.disabled').click();

  // Outro
  cy.url().should('include', '/outro');
  cy.get(OUTRO_FINISH).should('exist').and('not.be.disabled').click();
});

Cypress.Commands.add('createFirstLocation', (map_menu_name, fieldString) => {
  cy.intercept('GET', '**/maps.googleapis.com/maps/api/**').as('googleMapsApiCall');

  cy.contains(map_menu_name).should('exist').click();

  //arrive at farm map page and draw a field
  cy.url().should('include', '/map');

  cy.get(SPOTLIGHT_NEXT, { timeout: 60 * 1000 })
    .should('exist')
    .and('not.be.disabled')
    .click();
  cy.get(SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
  cy.get(SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
  cy.get(MAP_ADD_FEATURE).should('exist').and('not.be.disabled').click();

  cy.wait('@googleMapsApiCall');
  cy.waitForReact();

  // Select "Field"
  cy.contains(fieldString).click();

  cy.get(MAP_SELECTION).should('be.visible');
  cy.get(MAP_TUTORIAL_CONTINUE).should('exist').and('not.be.disabled').click();

  cy.get(MAP_CONTAINER).click(500, 300);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(400, { log: false });
  cy.get(MAP_CONTAINER).click(700, 300);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(400, { log: false });
  cy.get(MAP_CONTAINER).click(700, 400);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(400, { log: false });
  cy.get(MAP_CONTAINER).click(500, 400);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(400, { log: false });
  cy.get(MAP_CONTAINER).click(500, 300);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(400, { log: false });
  cy.get(MAP_TUTORIAL_CONTINUE).should('exist').and('not.be.disabled').click();
  cy.get(MAP_DRAW_COMPLETE_CONTINUE).should('exist').and('not.be.disabled').click();

  cy.get(AREA_DETAILS_NAME).should('exist').type('First Field');
  cy.get(CREATE_FIELD_SAVE).should('exist').and('not.be.disabled').click();

  cy.get(SNACKBAR).should('exist').and('be.visible');

  cy.waitForReact();

  // Confirm that location exists
  cy.visit('/');
  cy.contains(map_menu_name).should('exist').click();
  cy.contains('First Field').should('be.visible');

  // Check that it is in Redux
  cy.window()
    .its('store')
    .invoke('getState')
    .its('entitiesReducer')
    .its('gardenReducer')
    .its('ids')
    .should('not.be.empty');
});

Cypress.Commands.add('acceptSlideMenuSpotlights', (crop_menu_name) => {
  // Check the spotlights
  cy.get(SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();
  cy.get(SPOTLIGHT_NEXT).should('exist').and('not.be.disabled').click();

  // Mark spotlights in crops
  cy.contains(crop_menu_name).should('exist').click();
  cy.url().should('include', '/crop_catalogue');

  cy.get(SPOTLIGHT_NEXT, { timeout: 120 * 1000 })
    .should('exist')
    .and('not.be.disabled')
    .click();
  cy.get(SPOTLIGHT_NEXT, { timeout: 120 * 1000 })
    .should('exist')
    .and('not.be.disabled')
    .click();
});
