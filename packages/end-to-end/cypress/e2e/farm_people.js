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
            translation['SLIDE_MENU']['CROPS'],
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

    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(2)
      .contains(translation['MY_FARM']['PEOPLE'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');

    cy.get('[data-cy=people-inviteUser]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=invite-fullName]').click();
    cy.get('[data-cy=invite-fullName]').should('exist').type('Awesome Farm Manager');

    cy.contains(translation['INVITE_USER']['CHOOSE_ROLE']).click({ force: true });
    cy.contains(roles['MANAGER']).click({ force: true });

    cy.get('[data-cy=invite-email]')
      .should('exist')
      .type('farm_manager' + uniqueId + '@litefarm.com');
    cy.get('[data-cy=invite-submit]').should('exist').and('not.be.disabled').click();
  });

  it('InviteInvalidEmail', () => {
    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(2)
      .contains(translation['MY_FARM']['PEOPLE'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');

    cy.get('[data-cy=people-inviteUser]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=invite-fullName]').click();
    cy.get('[data-cy=invite-fullName]').should('exist').type('Invalid Farm Manager');
    cy.get('[data-cy=invite-email]').should('exist').type('Invalid email');
    cy.get('[data-cy=invite-fullName]').click();
    cy.get('[data-cy=error]')
      .contains(translation['INVITE_USER']['INVALID_EMAIL_ERROR'])
      .should('exist');
  });

  it('Duplicate email', () => {
    const uniqueSeed = Date.now().toString();
    const uniqueId = Cypress._.uniqueId(uniqueSeed);

    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(2)
      .contains(translation['MY_FARM']['PEOPLE'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');

    cy.get('[data-cy=people-inviteUser]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=invite-fullName]').click();
    cy.get('[data-cy=invite-fullName]').should('exist').type('Awesome Farm Manager');

    cy.contains(translation['INVITE_USER']['CHOOSE_ROLE']).click({ force: true });
    cy.contains(roles['MANAGER']).click({ force: true });

    cy.get('[data-cy=invite-email]')
      .should('exist')
      .type('farm_manager' + uniqueId + '@litefarm.com');
    cy.get('[data-cy=invite-submit]').should('exist').and('not.be.disabled').click();

    // Invite the same user again
    cy.get('[data-cy=people-inviteUser]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=invite-fullName]').click();
    cy.get('[data-cy=invite-fullName]').should('exist').type('Awesome Farm Manager');

    cy.contains(translation['INVITE_USER']['CHOOSE_ROLE']).click({ force: true });
    cy.contains(roles['MANAGER']).click({ force: true });

    cy.get('[data-cy=invite-email]')
      .should('exist')
      .type('farm_manager' + uniqueId + '@litefarm.com');

    cy.get('[data-cy=invite-fullName]').click();
    cy.get('[data-cy=error]')
      .contains(translation['INVITE_USER']['ALREADY_EXISTING_EMAIL_ERROR'])
      .should('exist');
  });
});
