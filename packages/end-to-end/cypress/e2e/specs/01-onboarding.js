describe.only('Onboarding', () => {
  let users;

  beforeEach(() => {
    // Load the users fixture before the tests
    cy.fixture('e2e-test-users.json').then((loadedUsers) => {
      users = loadedUsers;
      const user = users[Cypress.env('USER')];

      cy.visit('/');
      cy.get('[data-cy=email]').should('exist');
      cy.get('[data-cy=continue]').should('exist');
      cy.get('[data-cy=continue]').should('be.disabled');
      cy.get('[data-cy=continueGoogle]').should('exist');
      cy.loginOrCreateAccount(user.email, user.password, user.name, user.language);
    });
  });

  it.only('01_Onboard new user if not already created', () => {});
});
