describe.only('Insights flow tests', () => {
  before(() => {});

  it('Biodiversity insights', () => {
    //Test for LF-2014
    cy.visit('/');

    cy.loginFarmOwner();
    //Action: User navigates to the biodiversity insights page
    cy.visit('/Insights/Biodiversity');

    cy.window()
      .its('store')
      .invoke('getState')
      .its('insightReducer.biodiversityError')
      .should('equal', false);
    //view a modal (using the standard modal pattern) with the following attributes:
    //Title: “Generating the latest biodiversity insights…”
    //Body: “We’re generating the latest biodiversity insights for your farm. This can take up to 60 seconds.
    //”Button: “Cancel”, Action click returns user to insights page

    //If no results are returned within the time-out period (60 sec), replace the “Loading…” modal with the following modal:
    //Title: “<Hazard_symbol> There was a problem”

    //Body: “LiteFarm generates biodiversity insights based on several sources and was unable to do so at this time.
    //Please try again after 30 minutes.”

    //Button: “OK” Action click returns user to insights page

    //expected:Mammals should be the top section of the visualization
    cy.insights().eq(0).contains('Mammals').should('exist');

    //clicking "<" returns user to the insights page
  });
});
