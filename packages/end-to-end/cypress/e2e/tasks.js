import moment from 'moment';
import * as Selectors from '../support/selectorConstants.ts';

// Utility function to check Redux state with a retry mechanism
const checkReduxState = (endTime) => {
  const currentTime = new Date().getTime();

  if (currentTime > endTime) {
    throw new Error('Timed out waiting for Redux state to populate');
  }
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
            translation['MENU']['CROPS'],
            translation['MENU']['MAP'],
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

  it('CreateCleanTask', () => {
    // Confirm that location exists
    cy.contains(translation['MENU']['MAP'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.contains('First Field').should('be.visible');

    cy.contains(translation['MENU']['TASKS']).should('exist').click();
    cy.waitForReact();

    cy.contains(translation['TASK']['ADD_TASK']).should('exist').and('not.be.disabled').click();
    cy.waitForReact();
    cy.get(Selectors.TASK_SELECTION).contains(tasks['CLEANING_TASK']).should('exist').click();

    //Create an unassigned cleaning task due tomorrow
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    const dueDate = getDateInputFormat(date);
    cy.get(Selectors.ADD_TASK_TASK_DATE).should('exist').type(dueDate);

    cy.get(Selectors.ADD_TASK_CONTINUE).should('exist').and('not.be.disabled').click();

    cy.contains('First Field').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500, { log: false });
    cy.get(Selectors.MAP_SELECT_LOCATION).click({ force: false });

    cy.get(Selectors.ADD_TASK_LOCATION_CONTINUE).should('exist').and('not.be.disabled').click();

    // This screen only present when this test file is run after crops.js
    cy.get(Selectors.ADD_TASK_CROPS_CONTINUE).should('exist').and('not.be.disabled').click();

    cy.get(Selectors.ADD_TASK_DETAILS_CONTINUE).should('exist').and('not.be.disabled').click();
    cy.get(Selectors.ADD_TASK_ASSIGNMENT_SAVE).should('exist').and('not.be.disabled').click();
    cy.waitForReact();

    // Open the card and mark as complete
    cy.get(Selectors.TASK_CARD).first().click();
    cy.get(Selectors.TASK_READ_ONLY_COMPLETE).scrollIntoView();
    cy.get(Selectors.TASK_READ_ONLY_COMPLETE).click();
    cy.get(Selectors.BEFORE_COMPLETE_SUBMIT).click();
    cy.get(Selectors.HARVEST_COMPLETE_RATING).check({ force: true });
    cy.get(Selectors.HARVEST_COMPLETE_SAVE).click();
  });

  it('CreateFieldWorkTask', () => {
    cy.contains(translation['MENU']['TASKS']).should('exist').click();
    cy.waitForReact();
    cy.contains(translation['TASK']['ADD_TASK']).should('exist').and('not.be.disabled').click();
    cy.waitForReact();
    cy.get(Selectors.TASK_SELECTION)
      .contains(tasks['FIELD_WORK_TASK'])
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    //Create an unassigned cleaning task due tomorrow
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const getDateInputFormat = (date) => moment(date).format('YYYY-MM-DD');
    const dueDate = getDateInputFormat(date);
    cy.get(Selectors.ADD_TASK_TASK_DATE).should('exist').type(dueDate);
    cy.get(Selectors.ADD_TASK_CONTINUE).should('exist').and('not.be.disabled').click();

    cy.contains('First Field').should('be.visible');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500, { log: false });
    cy.get(Selectors.MAP_SELECT_LOCATION).click({ force: false });
    cy.get(Selectors.ADD_TASK_LOCATION_CONTINUE).should('exist').and('not.be.disabled').click();

    // This screen only present when this test file is run after crops.js
    cy.get(Selectors.ADD_TASK_CROPS_CONTINUE).should('exist').and('not.be.disabled').click();

    // Select type of work
    cy.get(Selectors.REACT_SELECT).find('input').click({ force: true });
    cy.contains(translation['ADD_TASK']['FIELD_WORK_VIEW']['TYPE']['PRUNING']).click({
      force: true,
    });

    cy.get(Selectors.ADD_TASK_DETAILS_CONTINUE).should('exist').and('not.be.disabled').click();
    cy.get(Selectors.ADD_TASK_ASSIGNMENT_SAVE).should('exist').and('not.be.disabled').click();
    cy.waitForReact();

    // Open the card and mark as complete
    cy.get(Selectors.TASK_CARD).first().click();
    cy.get(Selectors.TASK_READ_ONLY_COMPLETE).scrollIntoView();
    cy.get(Selectors.TASK_READ_ONLY_COMPLETE).click();
    cy.get(Selectors.BEFORE_COMPLETE_SUBMIT).click();
    cy.get(Selectors.HARVEST_COMPLETE_RATING).check({ force: true });
    cy.get(Selectors.HARVEST_COMPLETE_SAVE).click();
  });
});
