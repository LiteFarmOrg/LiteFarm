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
  });

  it('Complete a task in a crop plan', () => {
    //test for LF-2213
    //Complete a task in a crop plan
    //Once the task in completed the displayed view should be the crop plan
  });
});
