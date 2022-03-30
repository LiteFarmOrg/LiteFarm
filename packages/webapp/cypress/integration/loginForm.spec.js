import { cyan } from '@material-ui/core/colors';

describe('the login form', () => {
  it('should enable the continue button when a valid email address is input', () => {
    cy.visit(Cypress.env('host'));
    cy.get('[data-cy=continue]').should('be.disabled');
    cy.get('[data-cy=email]').type('test@email.com');
    cy.get('[data-cy=continue]').should('not.be.disabled');
  });
});
