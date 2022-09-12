describe.only('Login flow tests', () => {
  it('SSO Google Account', () => {
    cy.loginByGoogleApi().then(() => {
      cy.get('[data-cy=continueGoogle]').should('exist').and('not.be.disabled').click();
    });
  });
});
