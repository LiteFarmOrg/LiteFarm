describe.only('Notifications flow flow tests', () => {
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

  it.only('admin user notifications flow tests', () => {
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

  it.only('admin user notifications flow tests', () => {
    //Test for LF-2386
    //set system time to monday 630am
    //login as farm manager
    //check if there are any unassigned tasks due this week on this farm
    //make sure notifications are generated for all unassigned tasks due this week on this farm
  });
});
