describe.only('Invite user tests', () => {
  before(() => {});
  it('Invite an existing user with a chosen langauge', () => {
    //Test for LF-2301
    //after running happy path test
    //create a user account with language set to Spanish
    //login to the default farm created by the happy path tests
    //invite the spanish user to the default farm
    //Spanish user should receive an invitation email in spanish
    //repeat for all languages
  });

  it.only('Invite a new user and select invitation langauge', () => {
    //Test for LF-2366
    const userName = 'NewUser';
    const uuid = () => Cypress._.random(0, 1e6);
    const id = uuid();
    const userEmail = `${userName}${id}@example.com`;
    let count = 1;
    //after running happy path test
    cy.visit('/');
    //login as an admin user
    cy.loginFarmOwner();
    //navigate to the people view
    cy.visit('/people');
    //Click invite a user
    cy.contains('Invite User').click();
    //Input a name, select a role and an invitation language and click send invitation
    cy.get('[data-cy=invite-fullName]').should('exist').type(userName);
    cy.contains('Choose Role').should('exist').click({ force: true });
    cy.contains('Farm Worker').should('exist').click();
    cy.get('[data-cy=invite-email]').should('exist').type(userEmail);
    count++;
    cy.contains('English').should('exist').click({ force: true });
    cy.contains('Spanish').should('exist').click();
    //cy.intercept('POST', '/user/invite').as('invite');
    cy.get('[data-cy=invite-submit]').should('exist').and('not.be.disabled').click();
    //Ensure invitation is in correct language
    cy.task('getLastEmail', userEmail).then((email) => {
      cy.log(email);
    });
  });
});
