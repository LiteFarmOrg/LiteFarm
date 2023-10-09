import 'cypress-react-selector';

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
  (email, password, fullName, language, crop_menu_name) => {
    //Login page
    cy.get('[data-cy=email]').type(email);
    cy.intercept('GET', '**/login/user/' + email, (req) => {
      delete req.headers['if-none-match'];
    }).as('emailLogin');
    cy.get('[data-cy=continue]').should('exist').and('be.enabled').click();

    cy.waitUntilAnyVisible('[data-cy=createUser-email]', '[data-cy=enterPassword-password]');

    // Check if we are on pasword page or create account and act accordingly
    cy.get('[data-cy=createUser-email]', { timeout: 0 }).then(($element) => {
      if ($element.is(':visible')) {
        cy.get('[data-cy=createUser-fullName]').type(fullName);

        // cy.get('[id$=react-select-3-input]').type(language+'{enter}');
        cy.contains('English')
          .parent()
          .find('input')
          .type(language + '{enter}');

        cy.get('[data-cy=createUser-password]').type(password);
        cy.get('[data-cy=createUser-create]').should('exist').and('be.enabled').click();

        cy.intercept('POST', '**/user').as('createUser');
        cy.get('[data-cy=getStarted]').should('exist').and('not.be.disabled').click();

        cy.addFarm('UBC FARM', '49.250833, -123.2410777');
        cy.onboardCompleteQuestions('Manager');
        cy.acceptSlideMenuSpotlights(crop_menu_name);
        cy.createFirstLocation();
        cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled');
        cy.visit('/');
      } else {
        cy.get('[data-cy=enterPassword-password]').type(password);
        cy.get('[data-cy=enterPassword-submit]').should('exist').and('be.enabled').click();

        cy.get('[data-cy=chooseFarm-proceed]').should('exist').and('be.enabled').click();
        cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled');
        cy.visit('/');
      }
    });
  },
);

Cypress.Commands.add('addFarm', (farmName, location) => {
  cy.url().should('include', '/add_farm');

  cy.waitForReact();
  cy.get('[data-cy=addFarm-continue]').should('exist').should('be.disabled');
  cy.get('[data-cy=addFarm-farmName]').should('exist').type(farmName);
  cy.get('[data-cy=addFarm-location]').should('exist').type(location);
  cy.waitForReact();
  cy.get('[data-cy=addFarm-continue]').should('not.be.disabled').click();
});

Cypress.Commands.add('onboardCompleteQuestions', (role) => {
  // cy.clock();
  cy.url().should('include', '/role_selection');
  // cy.tick();
  cy.get('[data-cy=roleSelection-continue]').should('exist').and('be.disabled');
  cy.waitForReact();
  cy.get('[data-cy=roleSelection-role]').should('exist').check(role, { force: true });
  cy.get('[data-cy=roleSelection-continue]').should('not.be.disabled').click();
  // cy.clock().then((clock) => {
  //   clock.restore();
  // });

  // Give Concent
  cy.url().should('include', '/consent');
  cy.get('[data-cy=consentPage-content]', { timeout: 120 * 1000 }).should('exist');
  cy.get('[data-cy=consent-continue]').should('exist').and('be.disabled');
  cy.get('[data-cy=checkbox-component]').should('exist').click();
  cy.get('[data-cy=consent-continue]').should('not.be.disabled').click();

  // Interested in Organic
  cy.log('Interested in Organic');

  cy.url().should('include', '/certification/interested_in_organic');
  cy.get('[data-cy=interestedInOrganic-continue]').should('exist').and('be.disabled');
  cy.get('[data-cy=interestedInOrganic-select]').should('exist');
  cy.get('[type="radio"]').first().check({ force: true });
  cy.get('[data-cy=interestedInOrganic-continue]').should('not.be.disabled').click();

  cy.url().should('include', '/certification/selection');
  cy.get('[data-cy=certificationSelection-continue]').should('exist').and('be.disabled');
  cy.get('[data-cy=certificationSelection-type]').should('exist');
  cy.get('[type="radio"]').first().check({ force: true });
  cy.get('[data-cy=certificationSelection-continue]').should('not.be.disabled').click();

  // Select certifier
  cy.url().should('include', '/certification/certifier/selection');
  cy.get('[data-cy=certifierSelection-proceed]').should('exist').and('be.disabled');
  cy.get('[data-cy=certifierSelection-item]').should('exist').eq(1).click();
  let certifier;
  cy.get('[data-cy=certifierSelection-item]')
    .eq(1)
    .then(function ($elem) {
      certifier = $elem.text();
      let end = certifier.indexOf('(');
      let result = certifier.substring(1, end);
      //click the proceed button and ensure test is on the certification summary view and the certification selected is displayed
      cy.get('[data-cy=certifierSelection-proceed]').should('not.be.disabled').click();
      cy.url().should('include', '/certification/summary');
      cy.contains(result).should('exist');
    });

  //certification summary
  cy.get('[data-cy=certificationSummary-continue]').should('exist').and('not.be.disabled').click();

  // Outro
  cy.url().should('include', '/outro');
  cy.get('[data-cy=outro-finish]').should('exist').and('not.be.disabled').click();
});

Cypress.Commands.add('createFirstLocation', () => {
  cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled').click({ force: true });
  cy.get('[data-cy=navbar-option]')
    .eq(1)
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });

  //arrive at farm map page and draw a field
  cy.url().should('include', '/map');
  cy.get('[data-cy=spotlight-next]', { timeout: 60 * 1000 })
    .should('exist')
    .and('not.be.disabled')
    .click();
  cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
  cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
  cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();

  cy.contains('Field').should('be.visible').click();

  cy.get('[data-cy="map-selection"]').should('be.visible');

  // cy.get('[data-cy=map-drawer]').should('exist').and('not.be.disabled').click();

  // cy.get('[data-cy=map-mapContainer]', { timeout: 60 * 1000 })
  //   .find('button', { timeout: 60 * 1000 })
  //   .eq(2)
  //   .should('exist')
  //   .and('be.visible');
  cy.get('[data-cy=mapTutorial-continue]').should('exist').and('not.be.disabled').click();

  cy.get('[data-cy=map-mapContainer]').click(500, 300);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(300, { log: false });
  cy.get('[data-cy=map-mapContainer]').click(700, 300);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(300, { log: false });
  cy.get('[data-cy=map-mapContainer]').click(700, 400);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(300, { log: false });
  cy.get('[data-cy=map-mapContainer]').click(500, 400);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(300, { log: false });
  cy.get('[data-cy=map-mapContainer]').click(500, 300);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(300, { log: false });
  cy.get('[data-cy=mapTutorial-continue]').should('exist').and('not.be.disabled').click();
  cy.get('[data-cy=map-drawCompleteContinue]').should('exist').and('not.be.disabled').click();

  cy.get('[data-cy=areaDetails-name]').should('exist').type('First Field');
  cy.get('[data-cy=createField-save]').should('exist').and('not.be.disabled').click();

  cy.get('[data-cy=snackBar').should('exist').and('be.visible');
  cy.get('div[data-cy="snackBar"]').find('[class*="button"]:first').click();

  cy.waitForReact();

  // Confirm that location exists
  cy.visit('/');
  cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled').click({ force: true });
  cy.get('[data-cy=navbar-option]')
    .eq(1)
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.contains('First Field').should('be.visible');
});

Cypress.Commands.add('acceptSlideMenuSpotlights', (crop_menu_name) => {
  // Check the spotlights
  cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
  cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
  cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
  cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();

  // Mark spotlights in crops
  cy.get('[data-cy=navbar-hamburger]').should('exist').click();
  cy.contains(crop_menu_name).should('exist').click();
  cy.url().should('include', '/crop_catalogue');

  cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
  cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
});
