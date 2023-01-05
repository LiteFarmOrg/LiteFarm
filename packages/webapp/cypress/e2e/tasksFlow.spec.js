import { getDateInputFormat } from '../../src/util/moment';

let userEmail;
let userPassword;
let Data;
let fullName;

before(() => {
  cy.getEmail().then((email) => {
    userEmail = email;
    cy.log(userEmail);

    cy.getPassword().then((newpassword) => {
      userPassword = `${newpassword}+1@`;

      cy.fixture('tasks').then((data) => {
        Data = data;
      });
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
      fullName = 'Test Farmer';
      const password = userPassword;
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
    });
  });
});

beforeEach(() => {
  cy.clearLocalStorage();
  cy.visit('/');
  cy.newUserLogin(userEmail);
  cy.get('[data-cy="enterPassword-password"]').type(userPassword);
  cy.get('[data-cy="enterPassword-submit"]').click();
  cy.get('[data-cy="chooseFarm-proceed"]').click();

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
  it('create a cleaning task with all inputs user system of measurement preference metric', () => {
    let productUnit;
    let waterUnit;
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

    cy.get('[data-cy=cleanTask-whatInput]').type(Data.cleanTask.What);
    cy.get('[data-cy=cleanTask-willUseCleaner]').first().check({ force: true });
    cy.get('[data-cy="react-select"]').type(`${Data.cleanTask.Product}{enter}`);
    cy.get('[data-cy=cleanTask-productSupplier]').type(Data.cleanTask.Supplier);
    cy.get('[data-cy=cleanTask-agentPermitted]').first().check({ force: true });
    cy.get('[data-cy=soilAmendment-quantity]').type(Data.cleanTask.Quantity);
    cy.get('.Unit-select')
      .eq(0)
      .then(($elem) => {
        productUnit = $elem.text();
      });
    cy.get('[data-cy=cleanTask-waterUsage]').type(Data.cleanTask.Water_Usage);
    cy.get('.Unit-select')
      .eq(1)
      .then(($elem) => {
        waterUnit = $elem.text();
      });
    cy.get('[data-cy=task-notes]').type(Data.cleanTask.Notes);
    cy.get('[data-cy=addTask-detailsContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy=addTask-assignmentSave]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy="taskCard"]').eq(0).should('exist').click();

    cy.get('[data-cy="task-assignee"]')
      .invoke('val')
      .should('equal', fullName, { matchCase: false });

    cy.get('[data-cy="task-date"]').invoke('val').should('equal', dueDate, { matchCase: false });

    cy.get('[type="radio"]').first().should('be.checked');

    cy.get('[data-cy="cleanTask-whatInput"]')
      .invoke('val')
      .should('equal', Data.cleanTask.What, { matchCase: false });

    cy.get('[data-cy="react-select"]').contains(Data.cleanTask.Product).should('exist');

    cy.get('[data-cy="cleanTask-productSupplier"]')
      .invoke('val')
      .should('equal', Data.cleanTask.Supplier, { matchCase: false });

    cy.get('[data-cy="soilAmendment-quantity"]')
      .invoke('val')
      .should('equal', Data.cleanTask.Quantity, { matchCase: false });
    cy.get('.Unit-select')
      .eq(0)
      .then(($elem) => {
        const text = $elem.text();
        expect(text).to.equal(productUnit);
      });

    cy.get('[data-cy="cleanTask-waterUsage"]')
      .invoke('val')
      .should('equal', Data.cleanTask.Water_Usage, { matchCase: false });
    cy.get('.Unit-select')
      .eq(1)
      .then(($elem) => {
        const text = $elem.text();
        expect(text).to.equal(waterUnit);
      });

    cy.get('[data-cy="task-notesReadOnly"]')
      .invoke('val')
      .should('equal', Data.cleanTask.Notes, { matchCase: false });
  });

  it('create a custom fieldwork task with all options', () => {
    const customTask = 'Custom task';
    const wage = '20';
    cy.contains('Field Work').click();
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

    cy.get('[data-cy="react-select"]').type(`Other{enter}`);
    cy.get('[data-cy=fieldWork-customTask]').should('exist').type(customTask);

    cy.get('[data-cy=task-notes]').type(Data.cleanTask.Notes);

    cy.get('[data-cy=addTask-detailsContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[type="radio"]').first().check({ force: true });

    cy.get('[data-cy="taskDetails-wageOverride"]').should('exist').type(wage);

    cy.get('[data-cy=addTask-assignmentSave]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy="taskCard"]').contains('Field Work').click();

    cy.get('[data-cy="task-assignee"]')
      .invoke('val')
      .should('equal', fullName, { matchCase: false });

    cy.get('[data-cy="task-date"]').invoke('val').should('equal', dueDate, { matchCase: false });

    cy.get('[data-cy="react-select"]').contains(customTask).should('exist');

    cy.get('[data-cy="task-notesReadOnly"]')
      .invoke('val')
      .should('equal', Data.cleanTask.Notes, { matchCase: false });
  });
});
