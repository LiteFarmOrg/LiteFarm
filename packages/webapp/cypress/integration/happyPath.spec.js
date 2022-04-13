describe.only('LiteFarm end to end test', () => {
  before(() => {

    cy.task("db:tableCleanup");
  
  })

  it('Happy path', () => {
  
    cy.visit('/');
    cy.get('[data-cy=email]').should('exist');
    cy.get('[data-cy=continue]').should('exist');
    cy.get('[data-cy=continue]').should('be.disabled');
    cy.get('[data-cy=continueGoogle]').should('exist');
    

    //create test data
    const email = 'test@example.com';
    const fullName = 'Test User';
    const password = 'P@ssword123';
    const farmName = 'UBC FARM';
    const location = '49.250833,-123.2410777';
    //type email from the first user in users.json file into email input
    cy.get('[data-cy=email]').type(email);
    //check that the continue button is enabled
    cy.contains('Continue').should('exist').and('be.enabled').click();
  
    //check you are on the create user account page
    cy.contains('Create new user account').should('exist');

    //type a fullName
    cy.get('[data-cy=createUser-fullName]').type(fullName);

    //type a password
    cy.get('[data-cy=createUser-password]').type(password);
    //click create account
    cy.contains('Create Account').should('exist').and('be.enabled').click();

    cy.contains('started').should('exist');

      // Get Started page
    cy.get('[data-cy=getStarted]').should('exist');
    cy.get('[data-cy=getStarted]').click();

    // Ensure test is on the add farm page and continue button is disabled
    cy.url().should('include', '/add_farm');
    cy.get('[data-cy=addFarm-continue]').should('exist');
    cy.get('[data-cy=addFarm-continue]').should('be.disabled');
    cy.get('[data-cy=addFarm-farmName]').should('exist');
    cy.get('[data-cy=addFarm-location]').should('exist');

    // Enter new farm details and click continue which should be enabled
    cy.get('[data-cy=addFarm-farmName]').type(farmName);
    cy.get('[data-cy=addFarm-location]').type(location);
    cy.get('[data-cy=addFarm-continue]').should('not.be.disabled');
    cy.get('[data-cy=addFarm-continue]').click();
    
    //ensure test is on the role selection page
    cy.contains('What is your role on the farm').should('exist');
    cy.url().should('include', '/role_selection');
    cy.get('[data-cy=roleSelection-continue]').should('exist').and('be.disabled');
      
  });

});


