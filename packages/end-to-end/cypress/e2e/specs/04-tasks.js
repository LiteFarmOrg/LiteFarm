import moment from 'moment';

describe.only('Tasks', () => {
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
      cy.fixture('../../../webapp/public/locales/' + user.locale + '/task.json').then((data) => {
        // Use the loaded data
        tasks = data;
      });
    });
  });

  after(() => {});

  it('CheckTasksNavigation', () => {
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
    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains(translation['SLIDE_MENU']['TASKS']).should('exist').click();

    cy.contains(translation['TASK']['ADD_TASK']).should('exist').and('not.be.disabled').click();

    cy.contains(tasks['CLEANING_TASK']).should('exist').click();

    //Create an unassigned cleaning task due tomorrow
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    const dueDate = getDateInputFormat(date);
    cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

    cy.get('[data-cy=addTask-continue]').should('exist').and('not.be.disabled').click();

    cy.contains('First Field').should('be.visible');
    cy.get('[data-cy=map-selectLocation]').trigger('mousedown');
    cy.get('[data-cy=map-selectLocation]').trigger('mouseup');
    cy.get('[data-cy=map-selectLocation]').click(530, 216, {
      force: false,
    });

    cy.get('[data-cy=addTask-locationContinue]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=addTask-detailsContinue]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=addTask-assignmentSave]').should('exist').and('not.be.disabled').click();
    cy.waitForReact();
  });
});
