import moment from 'moment';
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
            translation['SLIDE_MENU']['CROPS'],
            translation['FARM_MAP']['MAP_FILTER']['FIELD'],
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
    cy.url().should('include', '/crop/new/add_crop_variety/compliance');
    cy.get('[data-cy=compliance-newVarietySave]').should('exist').and('be.disabled');
    cy.get('[data-cy=compliance-seed]').eq(1).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-seed]').eq(1).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-seedAvailability]').eq(1).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-seedEngineered]').eq(0).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-seedTreated]').eq(2).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-newVarietySave]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();

    // Add Management Plan
    cy.contains(translation['CROP_DETAIL']['ADD_PLAN']).click();
    cy.get('[type="radio"]').first().check();
    cy.get('[data-cy=cropPlan-submit]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy="cropPlan-transplantSubmit"]').should('exist').and('not.be.disabled').click();

    const date = new Date();
    date.setDate(date.getDate() + 1);
    const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    const dueDate = getDateInputFormat(date);
    cy.get('[data-cy="cropPlan-plantDate"]').should('exist').type(dueDate);
    cy.get('[data-cy="cropPlan-seedGermination"]').should('exist').type('15');
    cy.get('[data-cy="cropPlan-plantHarvest"]').should('exist').type('30');
    cy.get('[data-cy="plantDate-submit"]').should('exist').and('not.be.disabled').click();

    // Select field
    cy.contains('First Field').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500, { log: false });
    cy.get('[data-cy=map-selectLocation]').click({ force: false });
    cy.get('[data-cy="cropPlan-locationSubmit"]').should('exist').and('not.be.disabled').click();

    // Planning Method
    cy.get('[type="radio"]').first().check();
    cy.get('[data-cy="plantingMethod-submit"]').should('exist').and('not.be.disabled').click();

    // Row length
    cy.get('[type="radio"]').first().check();
    cy.get('[type="radio"]').first().click();
    cy.get('[data-cy="rowMethod-rows"]').should('exist').type('15{enter}');
    cy.get('[data-cy="rowMethod-length"]').should('exist').type('15{enter}');
    cy.get('[data-cy="rowMethod-spacing"]').should('exist').type('15{enter}');
    // cy.get('[data-cy="rowMethod-spacing"]').trigger('mousedown')
    cy.contains(translation['MANAGEMENT_PLAN']['PLANT_SPACING']).trigger('mousedown');
    cy.contains(translation['MANAGEMENT_PLAN']['PLANT_SPACING']).click({ force: true });

    cy.get('[data-cy="rowMethod-yield"]').should('exist').type('15');

    cy.get('[data-cy="rowMethod-submit"]').should('exist').click();

    cy.get('[data-cy="planGuidance-submit"]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy="cropPlan-save"]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=spotlight-next]').should('exist').and('not.be.disabled').click();
  });
});
