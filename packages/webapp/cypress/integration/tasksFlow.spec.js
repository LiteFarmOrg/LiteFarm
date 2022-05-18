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
    cy.url().should('include', '/read_only');
    //Assignee input should exist and should be.disabled
    //Due date input should exist and be disabled
    //locations map should exist and display here said task will be carried out
    //Task specific data should exist(e.g. cleaning agent and estimated water usage for a cleaning task)
  });

  it('admin user tasks flow tests', () => {
    //         //on tasks view click on the assignee link of a harvest task

    //         //assign task to self and click update task

    //         //click on the task card for the above harvest task

    //         //complete task completion flow and click save task
    //         cy.url().should('include', '/tasks');
    //         cy.contains('Tasks').should('exist');

    //clicking on a task should open the read_only view for said task
    cy.url().should('include', '/read_only');
    //Assignee input should exist and should be.disabled
    //Due date input should exist and be disabled
    //locations map should exist and display here said task will be carried out
    //Task specific data should exist(e.g. cleaning agent and estimated water usage for a cleaning task)
  });

  //       it('tasks filters tests', () => {

  //         //user clicks on the funnel icon on the tasks view to open the tasks filter view

  //         //user clicks on the assignee input

  //         //assert that all active users appear in the dropdown

  //         //assert that the assignee input is searchable

  //         //user types a letter into the assignee input, assert that the filter workspace

  //         //user clicks on one of the users, assert that a pill is generated for said user

  //       });
});
