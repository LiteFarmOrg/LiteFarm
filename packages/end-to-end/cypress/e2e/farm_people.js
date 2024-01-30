import * as Selectors from '../support/selectorConstants.ts';

describe('Farm People', () => {
  let users;
  let translation;
  let roles;

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
      cy.fixture('../../../webapp/public/locales/' + user.locale + '/role.json').then((data) => {
        // Use the loaded data
        roles = data;
      });
    });
  });

  after(() => {});

  it('InviteUserManager', () => {
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
  });

  it('InviteInvalidEmail', () => {
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

  it('Duplicate email', () => {
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
