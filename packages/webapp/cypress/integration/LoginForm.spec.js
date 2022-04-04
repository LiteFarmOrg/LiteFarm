describe('The login form', () => {
  it('should ensure that the continue button becomes enabled when valid email address is input ', () => {
    cy.visit('/');
    cy.get('[data-cy=email]').should('exist');
    cy.get('[data-cy=continue]').should('exist');
    cy.get('[data-cy=continue]').should('be.disabled');
    cy.fixture('users').as('myUserFixture');
    cy.get('@myUserFixture').then((user) => {
      cy.get('[data-cy=email]').type(user[0].email);
    });
    cy.get('[data-cy=continue]').should('be.enabled');
  });
});

describe('Google', function () {
  beforeEach(function () {
    cy.loginByGoogleApi();
  });

  it('shows welcome page', function () {
    cy.get('[data-cy=getStarted]').should('exist');
  });
});
