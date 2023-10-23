import moment from 'moment';

// Utility function to check Redux state with a retry mechanism
const checkReduxState = (endTime) => {
  const currentTime = new Date().getTime();

  if (currentTime > endTime) {
    throw new Error('Timed out waiting for Redux state to populate');
  }

  cy.window()
    .its('store')
    .invoke('getState')
    .its('entitiesReducer')
    .its('gardenReducer')
    .its('ids')
    .then((ids) => {
      if (ids.length === 0) {
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(500); // Wait for 500ms before retrying
        checkReduxState(endTime);
      }
    });
};

describe('Tasks', () => {
  let users;
  let translation;
  let tasks;

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

          const endTime = new Date().getTime() + 15000; // Set the end time to 15 seconds from now
          checkReduxState(endTime);
        },
      );

      // Load the locale fixture by reusing translations file
      cy.fixture('../../../webapp/public/locales/' + user.locale + '/task.json').then((data) => {
        // Use the loaded data
        tasks = data;
      });
    });
  });

  after(() => {});

  it('CheckTasksNavigation', () => {
    // Confirm that location exists
    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(1)
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.contains('First Field').should('be.visible');

    // Add a crop variety
    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains(translation['SLIDE_MENU']['TASKS']).should('exist').click();
    cy.contains(translation['TASK']['ADD_TASK']).should('exist').and('not.be.disabled');
    cy.visit('/');

    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();

    cy.contains(translation['TASK']['ADD_TASK']).should('exist').and('not.be.disabled');
    cy.visit('/');
  });

  it('CreateCleanTask', () => {
    // Confirm that location exists
    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(1)
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.contains('First Field').should('be.visible');

    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains(translation['SLIDE_MENU']['TASKS']).should('exist').click();
    cy.waitForReact();

    // Check that field it in REDUX
    cy.window()
      .its('store')
      .invoke('getState')
      .its('entitiesReducer')
      .its('gardenReducer')
      .its('ids')
      .should('not.be.empty');

    cy.contains(translation['TASK']['ADD_TASK']).should('exist').and('not.be.disabled').click();
    cy.waitForReact();
    cy.contains(tasks['CLEANING_TASK']).should('exist').click();

    //Create an unassigned cleaning task due tomorrow
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    const dueDate = getDateInputFormat(date);
    cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

    cy.get('[data-cy=addTask-continue]').should('exist').and('not.be.disabled').click();

    cy.contains('First Field').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500, { log: false });
    cy.get('[data-cy=map-selectLocation]').click({ force: false });

    cy.get('[data-cy=addTask-locationContinue]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=addTask-cropsContinue]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=addTask-detailsContinue]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=addTask-assignmentSave]').should('exist').and('not.be.disabled').click();
    cy.waitForReact();
  });

  it('CreateFieldWorkTask', () => {
    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains(translation['SLIDE_MENU']['TASKS']).should('exist').click();
    cy.waitForReact();
    cy.contains(translation['TASK']['ADD_TASK']).should('exist').and('not.be.disabled').click();
    cy.waitForReact();
    cy.contains(tasks['FIELD_WORK_TASK'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    //Create an unassigned cleaning task due tomorrow
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    const dueDate = getDateInputFormat(date);
    cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);
    cy.get('[data-cy=addTask-continue]').should('exist').and('not.be.disabled').click();

    cy.contains('First Field').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500, { log: false });
    cy.get('[data-cy=map-selectLocation]').click({ force: false });
    cy.get('[data-cy=addTask-locationContinue]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=addTask-cropsContinue]').should('exist').and('not.be.disabled').click();

    // Select type of work
    cy.get('[data-cy="react-select').find('input').click();
    cy.contains(translation['ADD_TASK']['FIELD_WORK_VIEW']['TYPE']['PRUNING']).click();

    cy.get('[data-cy=addTask-detailsContinue]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=addTask-assignmentSave]').should('exist').and('not.be.disabled').click();
    cy.waitForReact();
  });
});
