import { getDateInputFormat } from '../../src/util/moment';

describe.only('Notifications flow tests', () => {
  before(() => {
    //Ensure test environment is setup(i.e. farm exists, user accounts exist, tasks exist)
  });

  it('farm worker notifications flow tests', () => {
    //notifications bell exists in the status bar
    cy.get('[data-cy=home-notificationButton]').should('exist').and('not.be.disabled');
    //Notifications bell displays the number of unread notifications,if a user has 10 or more notifications
    //the notifications bell displays 9+

    //On mouse hover over the notifications bell show “Go to Notification Centre”

    //clicking on the notifications bell icon should open the notifications centre
    cy.get('[data-cy=home-notificationButton]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/notifications');
  });

  it('admin user notifications flow tests', () => {
    //Below is the test script for LF-2187 run it after running the happyPath spec
    cy.visit('/');
    cy.loginFarmOwner();
    //notifications bell exists in the status bar
    cy.get('[data-cy=home-notificationButton]').should('exist').and('not.be.disabled');
    //Notifications bell displays the number of unread notifications,if a user has 10 or more notifications
    //the notifications bell displays 9+
    cy.get('[data-cy=notification-alert]').should('exist').and('have.text', '1');
    //On mouse hover over the notifications bell show “Go to Notification Centre”
    cy.get('[data-cy=home-notificationButton').trigger('mouseover');
    //clicking on the notifications bell icon should open the notifications centre
    cy.get('[data-cy=home-notificationButton]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/notifications');
  });

  it.only('Weekly scheduled notifications', () => {
    //Test for LF-2386
    //login as farm manager
    cy.visit('/');
    cy.loginFarmOwner();
    //Create unassigned tasks due this week
    cy.wait(2000);
    cy.visit('/tasks');
    cy.createUnassignedTaskThisWeek(); //creates a task due date to today assigned to the logged in user

    //post request to the api to generate notifications

    let id;
    let authorization;

    cy.window()
      .its('store')
      .invoke('getState')
      .its('entitiesReducer.userFarmReducer.farm_id')
      .then((farm_id) => {
        id = farm_id;
        authorization = 'JWT TOKEN';
        cy.log(authorization);
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/time_notification/weekly_unassigned_tasks/${id}`,
          headers: {
            Authorization: `Bearer ${authorization}`,
          },
        })
          .then((response) => {
            return response;
          })
          .its('status')
          .should('eq', 201);
      });

    cy.visit('/notifications');
    cy.get('[data-cy=notification-card]').eq(0).contains('Unassigned tasks').should('exist');

    cy.get('[data-cy=notification-card]')
      .eq(0)
      .contains('You have unassigned tasks due this week.')
      .should('exist');

    cy.get('[data-cy=notification-card]').eq(0).click();
    cy.contains('Take me there').click();

    const today = new Date();
    const day = today.getDay();
    const Monday = today.setDate(today.getDate() - (day - 1));
    const dispMonday = getDateInputFormat(Monday);
    cy.get('._pillContainer_70or9_15 > :nth-child(2)')
      .contains(`From: ${dispMonday}`)
      .should('exist');
  });

  it('Daily scheduled notifications', () => {
    //Test for LF-2387 run after happyPath
    //login as farm manager
    cy.visit('/');
    cy.loginFarmOwner();
    //Create unassigned tasks due this week
    cy.wait(2000);
    cy.visit('/tasks');
    cy.createTaskToday(); //creates a task due date to today assigned to the logged in user

    //post request to the api to generate notifications

    let id;
    let authorization;

    cy.window()
      .its('store')
      .invoke('getState')
      .its('entitiesReducer.userFarmReducer.farm_id')
      .then((farm_id) => {
        id = farm_id;
        authorization = 'JWT TOKEN';
        cy.log(authorization);
        cy.request({
          method: 'POST',
          url: `${Cypress.env('apiUrl')}/time_notification/daily_due_today_tasks/${id}`,
          headers: {
            Authorization: `Bearer ${authorization}`,
          },
        })
          .then((response) => {
            return response;
          })
          .its('status')
          .should('eq', 201);
      });

    cy.visit('/notifications');
    cy.get('[data-cy=notification-card]').eq(0).contains('Tasks due today').should('exist');

    cy.get('[data-cy=notification-card]').eq(0).click();
    cy.contains('Take me there').click();
  });

  it('Re-assign notification flow', () => {
    //Test for LF-2376
    //Run happy path test
    //login as an admin user

    //Create a task
    cy.visit('/tasks');
    cy.createTask();
    //Assign the task to self
    cy.get('[data-cy=taskCard]').eq(0).should('exist').contains('Test F.').click();
    //Change the assignee of the task to self
    //check that notification bell has incremented by one
    //Navigate to notifications view, assert that the newest notification is a reassignment notification for the task
    //re-assigned task
  });
});
