describe('Cypress Studio Demo', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('create new transaction', () => {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('.styles_greetContainer__37jrU').click();
    cy.get('.styles_continueButton__2NuoJ > .input_container__1Y4T3 > .input_input__CebT6').clear();
    cy.get('.styles_continueButton__2NuoJ > .input_container__1Y4T3 > .input_input__CebT6').type(
      'litefarmdev0+Q15@gmail.com',
    );
    cy.get('.styles_bottomButton__23Kn5 > .button_btn__2fckM').click();
    cy.get('#password_input_to_focus').clear();
    cy.get('#password_input_to_focus').type('litefarmdev0+Q15@gmail.com');
    cy.get(
      '[style="display: flex; height: 100%; flex-direction: column; flex: 1 1 0%;"] > .form_form__oKlKm > .footer_footer__11BbJ > .footer_buttonContainer__1bw8n > .button_primary__3zbsq',
    ).click();
    /* ==== End Cypress Studio ==== */
  });
});
