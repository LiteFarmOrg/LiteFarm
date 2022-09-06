describe.only('Crops flow tests', () => {
  let userEmail;
  let userPassword;

  before(() => {
    cy.getEmail().then((email) => {
      userEmail = email;
    });

    cy.getPassword().then((password) => {
      userPassword = password;
    });
  });

  it.only('Crop catalogue view', () => {
    //create test data
    let count = 0;
    let emailOwner;
    let emailUser;

    const farmerName = 'Frank Phiri';
    const gender = 'Male';
    const firstName = 'john';
    const lastName = 'Smith';
    const password = `${userPassword}+1@`;
    const farmName = 'UBC FARM';
    const location = '49.250833,-123.2410777';
    const fieldName = 'Test Field';
    let workerName;
    const testCrop = 'New Crop';
    const role = 'Manager';
    const inviteeRole = 'Farm Worker';

    //worker details
    const language = ['English', 'French', 'Portuguese', 'Spanish'];
    const wage = 12;
    const number = 120012432;
    const birthYear = 1987;

    cy.visit('/');
    let usrname = userEmail.indexOf('@');
    emailOwner = userEmail.slice(0, usrname) + '+' + 1 + userEmail.slice(usrname);
    emailUser = null;
    workerName = firstName + ' ' + lastName;

    //Login as a new user
    cy.newUserLogin(emailOwner);

    //create account

    cy.createAccount(emailOwner, farmerName, gender, null, null, password).then(() => {
      cy.getStarted();
    });

    //Add farm page
    cy.addFarm(farmName, location);

    //role selection page
    cy.roleSelection(role);

    //Consent page
    cy.giveConsent();

    //interested in organic
    cy.interestedInOrganic();

    //who is your certifier(select BCARA)
    cy.selectCertifier();

    //onboarding outro
    cy.onboardingOutro();

    //farm home page
    cy.homePageSpotlights();

    cy.wait(2000);
    cy.get('[data-cy=navbar-hamburger]').should('exist').click({ force: true });
    cy.contains('Crops').should('exist').click();
    cy.url().should('include', '/crop_catalogue');

    cy.get('[data-cy=spotlight-next]')
      .contains('Next')
      .should('exist')
      .and('not.be.disabled')
      .click();
    cy.get('[data-cy=spotlight-next]')
      .contains('Got it')
      .should('exist')
      .and('not.be.disabled')
      .click();
    cy.get('[data-cy=crop-name]').as('EnglishCrops');
    cy.get('[data-cy=home-profileButton]').click();
    cy.contains('My info').click();

    cy.contains('Select').click({ force: true });
    cy.contains('Spanish').click({ force: true });
    cy.get('button').contains('Save').click({ force: true });

    cy.get('[data-cy=navbar-hamburger]').should('exist').click({ force: true });
    cy.contains('Crops').should('exist').click();
    cy.url().should('include', '/crop_catalogue');
    cy.get('@EnglishCrops').each(($el, index, $list) => {
      cy.get('[data-cy=crops-search]').type($el.text());
      cy.get('[data-cy=crop-tile]').should('not.exist');
    });
  });

  it('Create a new crop', () => {
    //Test for LF-2237
    cy.visit('/');

    cy.loginFarmOwner();
    //Action: User navigates into new crop flow
    cy.visit('/crop/new');

    //User enters crop name, Expected: Continue button is disabled

    //user select crop group, Expected: Continue button is disabled

    //user selects no as "can this be grown as a cover crop" radio option, Continue button is enabled
  });

  it('Crop variety view', () => {
    //test for LF-2172
    //Ensure status key section exists on crop variety page
    // ensure statuses are displayed on varietal tile
  });

  it('Add a task to a crop plan', () => {
    //test for LF-2392
    //navigate to crop catalogue
    //select a crop with a planned management plan
    //select the variety with the planned management plan
    //select the planned plan
    // click add a task
    //select a cleaning task and click continue
    //select a date and click continue
    //Ensure the initiating location is pre-selected by checking if continue button is enabled and click continue
    // Ensure the crop management plan where add task was initiated is preselected and click continue
    //click continue
    //click save
    //Ensure you are back on the initiating plan view
  });

  it('Complete a crop plan', () => {
    //test for LF-2178
    //Complete a crop plan
    //Open the crop plan's detail page
    //Completed date should exist
    //Plan rating should exist
    //Completion notes should exist
    //Plan notes should exist
    //Estimated annual harvest should exist
  });

  it('Abandon a task in a crop plan', () => {
    //test for LF-2213
    //Abandon a task in a crop plan
    //Once the task in abandoned the displayed view should be the crop plan
    //Ensure an alert is created to notify the user the task was assigned to that the task was abandoned(test for LF-2383)
    //Ensure the notification exists on the notifications page
  });

  it('Complete a task in a crop plan', () => {
    //test for LF-2213
    //Complete a task in a crop plan
    //Once the task in completed the displayed view should be the crop plan
  });

  it('Abandon a crop plan', () => {
    //test for LF-2177
    //Complete all tasks in a crop plan
    //abandon the crop plan
    //click on the abandoned crop plan
    //Click on the details tab
    //Abandonment date, Rating, Abandonment reason If “Something else” is selected, should show “What happened?”
    //as well Abandonment notes Plan notes Estimated annual yield should exist
  });
});
