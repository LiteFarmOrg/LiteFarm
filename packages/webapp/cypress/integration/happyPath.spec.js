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

    //Add farm page
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
    
    //role selection page
    cy.contains('What is your role on the farm').should('exist');
    cy.url().should('include', '/role_selection');
    cy.get('[data-cy=roleSelection-continue]').should('exist').and('be.disabled');
    cy.get('[data-cy=roleSelection-role]').should('exist').check('Manager',{ force: true });
    cy.get('[data-cy=roleSelection-continue]').should('not.be.disabled').click();

    //Consent page
    cy.contains('Our Data Policy').should('exist');
    cy.url().should('include', '/consent');
    cy.get('[data-cy=consent-continue]').should('exist').and('be.disabled');
    cy.get('[data-cy=consent-agree]').should('exist').check({ force: true });
    cy.get('[data-cy=consent-continue]').should('not.be.disabled').click();

    //interested in organic
    cy.contains('Interested in certifications').should('exist');
    cy.url().should('include', '/certification/interested_in_organic');
    cy.get('[data-cy=interestedInOrganic-continue]').should('exist').and('be.disabled');
    cy.get('[data-cy=interestedInOrganic-select]').should('exist');
    cy.get('[type="radio"]').first().check({ force: true });
    cy.get('[data-cy=interestedInOrganic-continue]').should('not.be.disabled').click();

    //what type of certification(select organic)
    cy.contains('What type of certification').should('exist');
    cy.url().should('include', '/certification/selection');
    cy.get('[data-cy=certificationSelection-continue]').should('exist').and('be.disabled');
    cy.get('[data-cy=certificationSelection-type]').should('exist');
    cy.get('[type="radio"]').first().check({ force: true });
    cy.get('[data-cy=certificationSelection-continue]').should('not.be.disabled').click();

    //who is your certifier(select the first option)
    cy.contains('Who is your certifier').should('exist');
    cy.url().should('include', '/certification/certifier/selection');
    cy.get('[data-cy=certifierSelection-proceed]').should('exist').and('be.disabled');
    cy.get('[data-cy=certifierSelection-item]').should('exist')
    .first().click();
    let certifier;
    cy.get('[data-cy=certifierSelection-item]').first().then(function($elem) {
      cy.get('[data-cy=certifierSelection-proceed]').should('not.be.disabled').click();
      certifier = $elem.text();
      cy.contains(certifier).should('exist');
      cy.log(certifier);
 })
 
    
      
  });

});


