describe.only('Crops flow tests', () => {
  before(() => {});
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
});
