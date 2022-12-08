import { getDateInputFormat } from '../../src/util/moment';

let userEmail;
let userPassword;

before(() => {
  cy.getEmail().then((email) => {
    userEmail = email;
    cy.log(userEmail);
  });

  cy.getPassword().then((password) => {
    userPassword = password;
  });
});

before(() => {
  cy.visit('/');
  cy.get('[data-cy=email]', { timeout: 60 * 1000 }).should('exist');
  cy.get('[data-cy=continue]').should('exist');
  cy.get('[data-cy=continue]').should('be.disabled');
  cy.get('[data-cy=continueGoogle]').should('exist');

  //create test data
  const emailOwner = userEmail;
  const usrname = emailOwner.indexOf('@');
  const emailWorker = emailOwner.slice(0, usrname) + '+1' + emailOwner.slice(usrname);
  const gender = 'Male';
  const fullName = 'Test Farmer';
  const password = `${userPassword}+1@`;
  const farmName = 'UBC FARM';
  const location = '49.250833, -123.2410777';
  const fieldName = 'Test Field';
  const workerName = 'John Worker';
  const testCrop = 'New Crop';
  const role = 'Manager';
  const lang = 'English';
  let taskType_id;

  const date = new Date();
  //Inputs for crop plan
  const daysGermination = 10;
  const daysTransplant = 20;
  const daysHarvest = 40;

  //Planting task inputs
  const containers = 50;
  const plantsPerContainer = 10;

  //Transplant task inputs
  const rows = 10;
  const length = 30;
  const lengthUnit = 'm';
  const spacing = 15;
  const spacingUnit = 'cm';
  const harvest = 1500;
  const harvestUnit = 'kg';

  //Login as a new user
  cy.newUserLogin(emailOwner);
  cy.wait('@emailLogin').should(({ request, response }) => {
    expect(response.statusCode).to.equal(200);
    //create account
    cy.createAccount(emailOwner, fullName, gender, null, null, password);
  });

  cy.wait('@createUser').should(({ request, response }) => {
    expect(response.statusCode).to.equal(201);
    cy.getStarted();
  });

  //Add farm page
  cy.addFarm(farmName, location);
  cy.newUserLogin(emailOwner);
  cy.get('[data-cy="enterPassword-password"]').type(password);
  cy.get('[data-cy="enterPassword-submit"]').click();
  cy.get('[data-cy="chooseFarm-proceed"]').click();
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

  //cy.confirmationEmail();

  //farm home page
  cy.homePageSpotlights();
  cy.get('[data-cy=navbar-option]')
    .contains('Farm map')
    .should('exist')
    .and('not.be.disabled')
    .click();

  //arrive at farm map page and draw a field
  cy.url().should('include', '/map');
  cy.get('[data-cy=spotlight-next]', { timeout: 60 * 1000 })
    .contains('Next')
    .should('exist')
    .and('not.be.disabled')
    .click();
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

  let initialWidth;
  let initialHeight;

  cy.addField();
  cy.visit('/map');
  cy.wait(15 * 1000);

  cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click({ force: true });
  cy.intercept('GET', '**/task_type/farm/**', (req) => {
    delete req.headers['if-none-match'];
  }).as('getTaskTypes');
  cy.contains('Create', { timeout: 60 * 1000 })
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
});

describe.only('LiteFarm end to end tests for tasks flow', () => {
  it('create a cleaning task with all inputs', () => {
    cy.contains('Clean').click();
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dueDate = getDateInputFormat(date);

    cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

    cy.get('[data-cy=addTask-continue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.wait(20 * 1000);
    cy.get('[data-cy=map-selectLocation]').click(530, 216, {
      force: false,
    });
    cy.get('[data-cy=addTask-locationContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy=cleanTask-whatInput]').type('channels on the field');
    cy.get('[data-cy=cleanTask-willUseCleaner]').first().check({ force: true });
    cy.get('#react-select-3-input').type('Weed killer{enter}');
    cy.get('[data-cy=cleanTask-productSupplier]').type('Self');
    cy.get('[data-cy=cleanTask-agentPermitted]').first().check({ force: true });
    cy.get('[data-cy=soilAmendment-quantity]').type('30');
    cy.get('[data-cy=cleanTask-waterUsage]').type('3000');
    cy.get('[data-cy=task-notes]').type('this is a test');
    cy.get('[data-cy=addTask-detailsContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy=addTask-assignmentSave]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
  });
});
