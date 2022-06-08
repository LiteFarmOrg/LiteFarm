describe.only('Crops flow tests', () => {
  before(() => {});

  it('Crop catalogue view', () => {
    //test for LF-2163
    //Ensure  "needs plan "status key exists on crop catalogue page key section
    // ensure new status is displayed on crop tile
  });

  it('Create a new crop', () => {
    //Test for LF-2237
    cy.visit('/');

    cy.loginFarmOwner();
    //Action: User navigates into new crop flow
    cy.visit('/crop/new');

    //User enters crop name, Expected: Continue button is disabled

    //user select crop group, Expected: Continue button is disabled

    //user selects no as "can this be grown as a cover crop" radio option, Continue button is enabled
  });

  it('Crop variety view', () => {
    //test for LF-2172
    //Ensure status key section exists on crop variety page
    // ensure statuses are displayed on varietal tile
  });

  it('Add a task to a crop plan', () => {
    //test for LF-2392
    //navigate to crop catalogue
    //select a crop with a planned management plan
    //select the variety with the planned management plan
    //select the planned plan
    // click add a task
    //select a cleaning task and click continue
    //select a date and click continue
    //Ensure the initiating location is pre-selected by checking if continue button is enabled and click continue
    // Ensure the crop management plan where add task was initiated is preselected and click continue
    //click continue
    //click save
    //Ensure you are back on the initiating plan view
  });

  it('Complete a crop plan', () => {
    //test for LF-2178
    //Complete a crop plan
    //Open the crop plan's detail page
    //Completed date should exist
    //Plan rating should exist
    //Completion notes should exist
    //Plan notes should exist
    //Estimated annual harvest should exist
  });

  it('Abandon a task in a crop plan', () => {
    //test for LF-2213
    //Abandon a task in a crop plan
    //Once the task in abandoned the displayed view should be the crop plan
    //Ensure an alert is created to notify the user the task was assigned to that the task was abandoned(test for LF-2383)
    //Ensure the notification exists on the notifications page
  });

  it('Complete a task in a crop plan', () => {
    //test for LF-2213
    //Complete a task in a crop plan
    //Once the task in completed the displayed view should be the crop plan
  });

  it('Abandon a crop plan', () => {
    //test for LF-2177
    //Complete all tasks in a crop plan
    //abandon the crop plan
    //click on the abandoned crop plan
    //Click on the details tab
    //Abandonment date, Rating, Abandonment reason If “Something else” is selected, should show “What happened?”
    //as well Abandonment notes Plan notes Estimated annual yield should exist
  });
});
