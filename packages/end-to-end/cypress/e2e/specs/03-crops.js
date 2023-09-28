describe.only('Crops', () => {
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
          cy.get('[data-cy=email]', { timeout: 60 * 1000 }).should('exist');
          cy.get('[data-cy=continue]').should('exist');
          cy.get('[data-cy=continue]').should('be.disabled');
          cy.get('[data-cy=continueGoogle]').should('exist');
          cy.loginOrCreateAccount(
            user.email,
            user.password,
            user.name,
            user.language,
            translation['SLIDE_MENU']['CROPS'],
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
    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains(translation['SLIDE_MENU']['CROPS']).should('exist').click();
    cy.url().should('include', '/crop_catalogue');

    // cy.get('[data-cy=spotlight-next]')
    // .contains('Next')
    // .should('exist')
    // .and('not.be.disabled')
    // .click();
    // cy.get('[data-cy=spotlight-next]')
    // .contains('Got it')
    // .should('exist')
    // .and('not.be.disabled')
    // .click();

    cy.get('[data-cy=crop-addLink]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/crop/new');
    cy.get('[data-cy=crop-cropName]')
      .should('exist')
      .type('New Crop' + uniqueId);
    // cy.contains(translation['INVITE_USER']['CHOOSE_ROLE'])
    cy.get('[data-cy="react-select')
      .find('input')
      .type(crops['CEREALS'] + '{enter}');

    cy.get('[type="radio"]').first().check({ force: true });

    cy.get('[data-cy=crop-submit]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/crop/new/add_crop_variety');
    cy.get('[data-cy=crop-variety]').should('exist').type('New Variety');
    cy.get('[data-cy=crop-supplier]').should('exist').type('New Supplier');
    cy.get('[data-cy=crop-annual]').should('exist').check({ force: true });
    cy.get('[data-cy=variety-submit]').should('exist').and('not.be.disabled').click();
    // cy.url().should('include', '/crop/new/add_crop_variety/compliance');
    // cy.get('[data-cy=compliance-newVarietySave]').should('exist').and('be.disabled');
    // cy.waitForReact();
    // cy.get('[data-cy=compliance-seed]').eq(1).should('exist').check({ force: true });
    // cy.get('[data-cy=compliance-seed]').eq(1).should('exist').check({ force: true });
    // cy.get('[data-cy=compliance-seedAvailability]').eq(1).should('exist').check({ force: true });
    // cy.get('[data-cy=compliance-seedEngineered]').eq(0).should('exist').check({ force: true });
    // cy.get('[data-cy=compliance-seedTreated]').eq(2).should('exist').check({ force: true });
    // cy.get('[data-cy=compliance-newVarietySave]').should('exist').and('not.be.disabled').click();
    // cy.waitForReact();
    // cy.url().should('include', '/management');
    // cy.waitForReact();
    // cy.get('[data-cy=spotlight-next]')
    // .contains('Next')
    // .should('exist')
    // .and('not.be.disabled')
    // .click();
    // cy.get('[data-cy=spotlight-next]')
    // .contains(`Let's get started`)
    // .should('exist')
    // .and('not.be.disabled')
    // .click();
  });
});
