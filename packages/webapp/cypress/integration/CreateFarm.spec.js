describe('Create farm flow', () => {
    beforeEach(function () {
        cy.loginByGoogleApi()
      })
    
    it('If user has already logged in with google the welcome page should be displayed when they navigate to the base url', function () {
      cy.visit('/');
      cy.get('[data-cy=getStarted]').should('exist');
    });

    it('If user has clicks the lets get started button the add farm view should be displayed', function () {

        cy.get('[data-cy=getStarted]').click();
        cy.get('[data-cy=addFarm-continue]').should('exist');
        cy.get('[data-cy=addFarm-continue]').should('be.disabled');
        cy.get('[data-cy=addFarm-farmName]').should('exist');
        cy.get('[data-cy=addFarm-location]').should('exist');
           
      });

      it('If user enters a valid farm name and location the continue button should be enabled', function () {

        
        cy.get('[data-cy=addFarm-farmName]').type('UBC FARM');
        cy.get('[data-cy=addFarm-location]').type('49.250833,-123.2410777');
        cy.get('[data-cy=addFarm-continue]').should('not.be.disabled');
           
      });

  
  });