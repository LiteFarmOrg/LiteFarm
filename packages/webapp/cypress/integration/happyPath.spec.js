describe.only('LiteFarm end to end test', () => {
  before(() => {

    cy.task("db:tableCleanup");
  
  })

  it('Happy path', { defaultCommandTimeout: 5000 }, () => {
  
    cy.visit('/');
    cy.get('[data-cy=email]').should('exist');
    cy.get('[data-cy=continue]').should('exist');
    cy.get('[data-cy=continue]').should('be.disabled');
    cy.get('[data-cy=continueGoogle]').should('exist');
    

    //create test data
    const emailOwner = 'test@example.com';
    const emailWorker = 'worker@example.com';
    const fullName = 'Test Farmer';
    const password = 'P@ssword123';
    const farmName = 'UBC FARM';
    const location = '49.250833,-123.2410777';
    const fieldName = 'Test Field';
    const workerName =  'Test Worker';

    //Login pafe
    cy.get('[data-cy=email]').type(emailOwner);
    cy.contains('Continue').should('exist').and('be.enabled').click();
  
    //check you are on the create user account page
    cy.contains('Create new user account').should('exist');
    cy.get('[data-cy=createUser-fullName]').type(fullName);
    cy.get('[data-cy=createUser-password]').type(password);
    cy.contains('Create Account').should('exist').and('be.enabled').click();

    //Get Started page
    cy.contains('started').should('exist');
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
    cy.get('[data-cy=addFarm-location]').type(location).wait(1000);
    cy.get('[data-cy=addFarm-continue]').should('not.be.disabled')
    .click();
    
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
      certifier = $elem.text();
      let end = certifier.indexOf('(');
      let result = certifier.substring(1, end);
      //click the proceed button and ensure test is on the certification summary view and the certification selected is displayed
      cy.get('[data-cy=certifierSelection-proceed]').should('not.be.disabled').click();
      cy.url().should('include', '/certification/summary');
      cy.contains(result).should('exist');
 });

    //certifacation summary
    cy.get('[data-cy=certificationSummary-continue]').should('exist').and('not.be.disabled').click();

    //onboarding outro
    cy.url().should('include', '/outro');
    cy.get('[data-cy=outro-finish]').should('exist').and('not.be.disabled').click();

    //farm home page
    cy.get('[data-cy=spotlight-next]').contains('Next').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=spotlight-next]').contains('Next').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=spotlight-next]').contains('Got it').should('exist').and('not.be.disabled').click(); 
    cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=navbar-option]').contains('Farm map').should('exist').and('not.be.disabled').click();

    //arrive at farm map page and draw a field
    cy.url().should('include', '/map');
    cy.get('[data-cy=spotlight-next]').contains('Next').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=spotlight-next]').contains('Next').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=spotlight-next]').contains('Got it').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]').contains('Field').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=mapTutorial-continue]').contains('Got it').should('exist').and('not.be.disabled').click();
    cy.wait(1000);
    cy.get('[data-cy=map-mapContainer]').click(558,344);
    cy.wait(500);
    cy.get('[data-cy=map-mapContainer]').click(570,321);
    cy.wait(500);
    cy.get('[data-cy=map-mapContainer]').click(631,355);
    cy.wait(500);
    cy.get('[data-cy=map-mapContainer]').click(605,374);
    cy.wait(1000);
    cy.get('[data-cy=map-mapContainer]').click(558,344);
    cy.wait(500);
    cy.get('[data-cy=mapTutorial-continue]').contains('Got it').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawCompleteContinue]').contains('Confirm').should('exist').and('not.be.disabled').click();

    //Add field view
    cy.get('[data-cy=createField-fieldName]').should('exist').type(fieldName);
    cy.get('[data-cy=createField-save]').should('exist').and('not.be.disabled').click();

    //Add a farm worker to the farm
    cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=navbar-option]').contains('People').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/people');
    cy.get('[data-cy=people-inviteUser]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/invite_user');
    cy.get('[data-cy=invite-fullName]').should('exist').type(workerName);
    cy.contains('Choose Role').should('exist').click({ force: true });
    cy.contains('Farm Worker').should('exist').click();
    cy.get('[data-cy=invite-email]').should('exist').type(emailWorker);
    cy.get('[data-cy=invite-submit]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/people');
    cy.contains(workerName.toLowerCase()).should('exist');
    
    // Add a crop variety
    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains('Crops').should('exist').click();
    cy.get('body').click();

    

    //Add a planting task for the new variety

    //modify the management plan with quick assign modal


    //logout
    //cy.get('[data-cy=home-profileButton]').should('exist').click();
    //cy.get('[data-cy=navbar-option]').contains('Log Out').should('exist').and('not.be.disabled').click();
  });

});


