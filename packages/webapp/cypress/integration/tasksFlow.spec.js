import { getDateInputFormat } from '../../src/util/moment';

describe.only('Tasks flow tests', () => {
  before(() => {
    //Ensure test environment is setup(i.e. farm exists, user accounts exist, tasks exist)
  });

  it('farm worker tasks flow tests', () => {
    //Unassigned tasks : Farm workers should be able to assign the task to themselves
    //(the farm worker and “Unassigned” should be the only quick assign options)
    //Tasks assigned to the farm worker: Farm workers should be able to Unassign the task
    // (the farm worker and “Unassigned” should be the only quick assign options)
    //Tasks assigned to other individuals on the farm: None! Task card should be read-only
    //No visual cue that the user can update due date
    //clicking on a task should open the read_only view for said task
    //cy.url().should('include', '/read_only');
    //Assignee input should exist and should be.disabled
    //Due date input should exist and be disabled
    //locations map should exist and display here said task will be carried out
    //Task specific data should exist(e.g. cleaning agent and estimated water usage for a cleaning task)
  });

  it.only('admin user tasks flow tests', () => {
    cy.visit('/');
    cy.loginFarmOwner();
    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();

    cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
    cy.contains('Clean').should('exist').and('not.be.disabled').click({ force: true });

    cy.get('[data-cy=addTask-taskDate]').should('exist').type('2022-06-22');

    cy.get('[data-cy=addTask-continue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.wait(2000);
    cy.get('[data-cy=map-selectLocation]').click(540, 201, {
      force: false,
    });
    cy.get('[data-cy=addTask-locationContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=addTask-cropsContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=addTask-detailsContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=addTask-assignmentSave]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.contains('Unassigned').eq(0).should('exist').and('not.be.disabled').click({ force: true });
    cy.get('[data-cy=quickAssign-assignee]').should('exist').click({ force: true });
    cy.get('[data-cy=quickAssign-assignAll]').should('exist').check({ force: true });
    cy.get('[data-cy=quickAssign-update]').should('exist').and('not.be.disabled').click();
    //         //on tasks view click on the assignee link of a harvest task

    //         //assign task to self and click update task

    //         //click on the task card for the above harvest task

    //         //complete task completion flow and click save task
    //         cy.url().should('include', '/tasks');
    //         cy.contains('Tasks').should('exist');

    //clicking on a task should open the read_only view for said task
    //cy.url().should('include', '/read_only');
    //Assignee input should exist and should be.disabled
    //Due date input should exist and be disabled
    //locations map should exist and display here said task will be carried out
    //Task specific data should exist(e.g. cleaning agent and estimated water usage for a cleaning task)
  });

  it('harvest task compeletion tests', () => {
    //these are tests for LF2360 run this test script after running the happy path test
    //Action: click on the tasks icon. Expected: The tasks view opens with several task cards visible
    cy.visit('/');
    cy.loginFarmOwner();
    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();

    //Action: Click on a harvest task, task card. Expected: Task read only view for selected harvest task is displayed
    cy.get('[data-cy=taskCard]').eq(0).should('exist').click('right');

    //Action: Click on complete task button Expected: Enter task completion flow
    cy.get('[data-cy=taskReadOnly-complete]').should('exist').and('not.be.disabled').click();

    //Action: Complete harvest task completion flow. Expected: Task read only view displayed
    //with the task card for the just completed harvest task showing the correct details
    cy.get('[data-cy=harvestQuantity-quantity]').should('exist').type(1000);
    cy.get('[data-cy=harvestQuantity-continue]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=harvestUses-quantity]').should('exist').type(1000);
    cy.contains('Select').should('exist').click({ force: true });
    cy.contains('Self').should('exist').click({ force: true });
    cy.get('[data-cy=harvestUses-continue]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=harvestComplete-rating]').should('exist').check({ force: true });
    cy.get('[data-cy=harvestComplete-save]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/tasks');
    cy.get('[data-cy=taskCard]').eq(0).should('exist').click('right');
    cy.contains('completed').should('exist');
  });

  it('tasks filters tests', () => {
    //tests for LF2365, run this test after running the happyPath spec
    cy.visit('/');
    cy.loginFarmOwner();
    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();

    //         //user clicks on the funnel icon on the tasks view to open the tasks filter view
    cy.get('[data-cy=tasks-filter]').click({ force: true });
    //         //user clicks on the assignee input
    //         //assert that all active users appear in the dropdown
    //         //assert that the assignee input is searchable
    //         //user types a letter into the assignee input, assert that the filter workspace
    //         //user clicks on one of the users, assert that a pill is generated for said user
  });
});
