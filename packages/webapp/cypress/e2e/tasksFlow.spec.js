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
      cy.createAccount(emailOwner, fullName, gender, null, null, password);
      cy.getStarted();

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
      cy.get('[data-cy="home-farmButton"]').click();
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

describe('LiteFarm end to end tests for tasks flow', () => {
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
    cy.selectTaskLocation();

    cy.get('[data-cy=cleanTask-whatInput]').type(Data.cleanTask.What);
    cy.get('[data-cy=cleanTask-willUseCleaner]').first().check({ force: true });
    cy.get('[data-cy="react-select"]').type(`${Data.cleanTask.Product}{enter}`);
    cy.get('[data-cy="addTask-supplier"]').type(Data.cleanTask.Supplier);
    cy.get('[data-cy=cleanTask-agentPermitted]').first().check({ force: true });
    cy.get('[data-cy=soilAmendment-quantity]').type(Data.cleanTask.Quantity);
    cy.get('[data-testid="unit-select"]')
      .eq(0)
      .then(($elem) => {
        productUnit = $elem.text();
      });
    cy.get('[data-cy=cleanTask-waterUsage]').type(Data.cleanTask.Water_Usage);
    cy.get('[data-testid="unit-select"]')
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

    cy.get('[data-cy="addTask-supplier"]')
      .invoke('val')
      .should('equal', Data.cleanTask.Supplier, { matchCase: false });

    cy.get('[data-cy="soilAmendment-quantity"]')
      .invoke('val')
      .should('equal', Data.cleanTask.Quantity, { matchCase: false });
    cy.get('[data-testid="unit-select"]')
      .eq(0)
      .then(($elem) => {
        const text = $elem.text();
        expect(text).to.equal(productUnit);
      });

    cy.get('[data-cy="cleanTask-waterUsage"]')
      .invoke('val')
      .should('equal', Data.cleanTask.Water_Usage, { matchCase: false });
    cy.get('[data-testid="unit-select"]')
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

    cy.selectTaskLocation();

    cy.get('[data-cy="react-select"]').type(`Other{enter}`);
    cy.get('[data-cy=fieldWork-customTask]').should('exist').type(customTask);

    cy.get('[data-cy=task-notes]').type(Data.cleanTask.Notes);

    cy.get('[data-cy=addTask-detailsContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[type="radio"]').first().check({ force: true });

    cy.get('[data-cy="hourlyWageInputs-wage"]').should('exist').type(wage);

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

  // it('create a custom irrigate task with depth measurement type and uses water use calculator', () => {
  //   const flowRate = 100; //l/m
  //   const duration = 60; //m
  //   const usage = flowRate * duration; //l
  //   const customTask = 'Custom task';
  //   const wage = '20';
  //   cy.contains('Irrigation').click();
  //   const date = new Date();
  //   date.setDate(date.getDate() + 1);
  //   const dueDate = getDateInputFormat(date);

  //   cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

  //   cy.get('[data-cy=addTask-continue]')
  //     .should('exist')
  //     .and('not.be.disabled')
  //     .click({ force: true });

  //   cy.selectTaskLocation();
  //   cy.get('[data-cy="addTask-cropsContinue"]').click();
  //   cy.get('[data-cy="react-select"]').type(`Other{enter}`);
  //   cy.get('[data-cy="irrigateTask-type"]').type(customTask);
  //   cy.get('[type = "checkbox"]').eq(0).check({ force: true });
  //   cy.get('[type = "checkbox"]').eq(1).check({ force: true });
  //   cy.get('[data-cy="irrigateTask-calculate"]').click({ force: true });

  //   cy.get('[data-cy="calculator-flowRate"]').type(flowRate);
  //   cy.get('[data-cy="calculator-duration"]').type(duration);
  //   cy.contains('optional').click({ force: true });

  //   cy.get('h5')
  //     .eq(9)
  //     .then(($elem) => {
  //       const text = $elem.text();
  //       expect(text).to.equal(`${usage} l`);
  //     });

  //   cy.contains('Save').click();
  //   cy.get('[data-cy="irrigateTask-usage"]')
  //     .invoke('val')
  //     .should('equal', usage.toString(), { matchCase: false });

  //   cy.get('[data-cy=task-notes]').type(Data.cleanTask.Notes);

  //   cy.get('[data-cy=addTask-detailsContinue]')
  //     .should('exist')
  //     .and('not.be.disabled')
  //     .click({ force: true });

  //   cy.get('[type="radio"]').eq(0).check({ force: true });

  //   cy.get('[data-cy="taskDetails-wageOverride"]').should('exist').type(wage);

  //   cy.get('[data-cy=addTask-assignmentSave]')
  //     .should('exist')
  //     .and('not.be.disabled')
  //     .click({ force: true });

  //   cy.get('[data-cy="taskCard"]').contains('Irrigate').click();

  //   cy.get('[data-cy="task-assignee"]')
  //     .invoke('val')
  //     .should('equal', fullName, { matchCase: false });

  //   cy.get('[data-cy="task-date"]').invoke('val').should('equal', dueDate, { matchCase: false });

  //   cy.get('[data-cy="react-select"]').contains(customTask).should('exist');
  //   cy.get('[type = "checkbox"]').eq(0).should('be.checked');
  //   cy.get('[type="radio"]').first().should('be.checked');
  //   cy.get('[type = "checkbox"]').eq(1).should('be.checked');
  //   cy.get('[data-cy="irrigateTask-usage"]')
  //     .invoke('val')
  //     .should('equal', usage.toString(), { matchCase: false });
  //   cy.get('.Unit-select')
  //     .eq(0)
  //     .then(($elem) => {
  //       const text = $elem.text();
  //       expect(text).to.equal('l');
  //     });
  //   cy.get('[data-cy="task-notesReadOnly"]')
  //     .invoke('val')
  //     .should('equal', Data.cleanTask.Notes, { matchCase: false });
  // });

  it('create a pest control task with a custom method', () => {
    cy.contains('Pest').click();

    let productUnit;
    const pestType = 'caterpillars';
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dueDate = getDateInputFormat(date);

    cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);
    cy.get('[data-cy=addTask-continue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.selectTaskLocation();

    cy.get('[data-cy="pestTask-pest"]').type(Data.pestTask.What);
    cy.get('[data-cy="react-select"]').type(`${Data.pestTask.method}{enter}`);

    cy.get('[data-cy="react-select"]').eq(1).type(`${Data.pestTask.Product}{enter}`);
    cy.get('[data-cy="addTask-supplier"]').type(Data.pestTask.Supplier);
    cy.get('[data-cy=cleanTask-agentPermitted]').first().check({ force: true });
    cy.get('[data-cy=soilAmendment-quantity]').type(Data.pestTask.Quantity);
    cy.get('[data-testid="unit-select"]')
      .eq(0)
      .then(($elem) => {
        productUnit = $elem.text();
      });
    cy.get('[data-cy=task-notes]').type(Data.pestTask.Notes);

    cy.get('[data-cy=addTask-detailsContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy=addTask-assignmentSave]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy="taskCard"]').contains('Pest').should('exist').click();

    cy.get('[data-cy="task-assignee"]')
      .invoke('val')
      .should('equal', fullName, { matchCase: false });

    cy.get('[data-cy="task-date"]').invoke('val').should('equal', dueDate, { matchCase: false });

    cy.get('[data-cy="pestTask-pest"]')
      .invoke('val')
      .should('equal', Data.pestTask.What, { matchCase: false });
    cy.get('[data-cy="react-select"]').contains(Data.pestTask.method).should('exist');

    cy.get('[data-cy="react-select"]').contains(Data.pestTask.Product).should('exist');
    cy.get('[data-cy="addTask-supplier"]')
      .invoke('val')
      .should('equal', Data.pestTask.Supplier, { matchCase: false });
    cy.get('[data-cy=soilAmendment-quantity]')
      .invoke('val')
      .should('equal', Data.pestTask.Quantity, { matchCase: false });
    cy.get('[data-testid="unit-select"]')
      .eq(0)
      .then(($elem) => {
        expect(productUnit).to.equal($elem.text());
      });
    cy.get('[data-cy="task-notesReadOnly"]')
      .invoke('val')
      .should('equal', Data.pestTask.Notes, { matchCase: false });
  });

  it('create a soil amendment task', () => {
    cy.contains('Soil').click();

    let productUnit;
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dueDate = getDateInputFormat(date);

    cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);
    cy.get('[data-cy=addTask-continue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.selectTaskLocation();

    cy.get('[data-cy="react-select"]').eq(0).type(`${Data.soilTask.Purpose}{enter}`);
    cy.get('[data-cy="react-select"]').eq(1).type(`${Data.soilTask.Product}{enter}`);

    cy.get('[data-cy="addTask-supplier"]').type(Data.soilTask.Supplier);
    cy.get('[type= "radio"]').first().check({ force: true });
    cy.get('[data-cy=soilAmendment-quantity]').type(Data.soilTask.Quantity);
    cy.get('[data-testid="unit-select"]')
      .eq(0)
      .then(($elem) => {
        productUnit = $elem.text();
      });
    cy.get('[data-cy=task-notes]').type(Data.soilTask.Notes);

    cy.get('[data-cy=addTask-detailsContinue]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy=addTask-assignmentSave]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy="taskCard"]').contains('Soil').should('exist').click();

    cy.get('[data-cy="task-assignee"]')
      .invoke('val')
      .should('equal', fullName, { matchCase: false });

    cy.get('[data-cy="task-date"]').invoke('val').should('equal', dueDate, { matchCase: false });

    cy.get('[data-cy="react-select"]').eq(0).contains(Data.soilTask.Purpose).should('exist');
    cy.get('[data-cy="react-select"]').eq(1).contains(Data.soilTask.Product).should('exist');

    cy.get('[data-cy="addTask-supplier"]')
      .invoke('val')
      .should('equal', Data.soilTask.Supplier, { matchCase: false });
    cy.get('[data-cy=soilAmendment-quantity]')
      .invoke('val')
      .should('equal', Data.soilTask.Quantity, { matchCase: false });
    cy.get('[data-testid="unit-select"]')
      .eq(0)
      .then(($elem) => {
        expect(productUnit).to.equal($elem.text());
      });
    cy.get('[data-cy="task-notesReadOnly"]')
      .invoke('val')
      .should('equal', Data.soilTask.Notes, { matchCase: false });
  });

  it('Create a crop management plan with equal length row method transplant task and container transplant task', () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dueDate = getDateInputFormat(date);
    let lengthUnit,
      spacingUnit,
      seedUnit,
      harvestUnit,
      depthUnit,
      containerDepthUnit,
      rowWidthUnit,
      spaceBetweenUnit;
    // Add a crop variety
    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
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
    cy.get('[data-cy=crop-addLink]')
      .contains('Add a new crop')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.url().should('include', '/crop/new');
    cy.get('[data-cy=crop-cropName]').should('exist').type('Alfafa');
    cy.contains('Select').should('exist').click({ force: true });
    cy.contains('Cereals').should('exist').click({ force: true });
    cy.get('[type="radio"]').first().check({ force: true });
    cy.get('[data-cy=crop-submit]').should('exist').and('not.be.disabled').click();
    cy.wait(5 * 1000);
    cy.url().should('include', '/crop/new/add_crop_variety');
    cy.get('[data-cy=crop-variety]').should('exist').type('New Variety');
    cy.get('[data-cy=crop-supplier]').should('exist').type('New Supplier');
    cy.get('[type="radio"]').first().check({ force: true });
    cy.get('[data-cy=variety-submit]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/crop/new/add_crop_variety/compliance');
    cy.get('[data-cy=compliance-seed]').eq(1).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-seedAvailability]').eq(1).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-seedEngineered]').eq(0).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-seedTreated]').eq(2).should('exist').check({ force: true });
    cy.get('[data-cy=compliance-newVarietySave]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/management');
    cy.get('[data-cy=spotlight-next]', { timeout: 60 * 1000 })
      .contains('Next')
      .should('exist')
      .and('not.be.disabled')
      .click();
    cy.get('[data-cy=spotlight-next]')
      .contains(`Let's get started`)
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.contains('Add a plan').click();
    cy.get('[type = "radio"]').first().check({ force: true });
    cy.get('[data-cy="cropPlan-submit"]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy="cropPlan-transplanted"]').eq(0).check({ force: true });
    cy.get('[data-cy="cropPlan-coverCrop"]').eq(1).check({ force: true });
    cy.get('[data-cy="cropPlan-transplantSubmit"]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy="cropPlan-plantDate"]').type(dueDate);

    cy.get('[data-cy="cropPlan-seedGermination"]').type(Data.cropPlan.Germination);

    cy.get('[data-cy="cropPlan-plantTransplant"]').type(Data.cropPlan.Transplant);

    cy.get('[data-cy="cropPlan-plantHarvest"]').type(Data.cropPlan.Harvest);

    cy.get('[data-cy="plantDate-submit"]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('[data-cy=spotlight-next]')
      .contains('Got it')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.get('._zoomIn_e5ede_9').should('be.visible');
    cy.get('[data-cy=map-selectLocation]').click(530, 216, {
      force: false,
    });
    cy.get('[data-cy="cropPlan-locationSubmit"]').should('not.be.disabled').click();

    cy.get('[type="radio"]').eq(0).check({ force: true });
    cy.get('[data-cy="cropPlan-numberContainers"]').type(Data.cropPlan.Containers);
    cy.get('[data-cy="cropPlan-numberPlants"]').type(Data.cropPlan.Plants);
    cy.get('[data-cy="cropPlan-plantingDepth"]').type(Data.cropPlan.Planting_Depth);
    cy.get('[data-cy="cropPlan-plantingSoil"]').type(Data.cropPlan.Soil);
    cy.get('[data-cy="cropPlan-containerType"]').type(Data.cropPlan.Container_Type);
    cy.get('[data-cy="cropPlan-estimatedSeed"]').type(Data.cropPlan.Seed);
    cy.get('[data-testid="unit-select"]')
      .eq(0)
      .then(($elem) => {
        containerDepthUnit = $elem.text();
      });
    cy.get('[data-testid="unit-select"]')
      .eq(1)
      .then(($elem) => {
        seedUnit = $elem.text();
      });

    cy.get('[data-cy="cropPlan-containerSubmit"]').should('be.enabled').click({ force: true });

    cy.get('._zoomIn_e5ede_9').should('be.visible');
    cy.get('[data-cy=map-selectLocation]').click(530, 216, {
      force: false,
    });
    cy.get('[data-cy="cropPlan-locationSubmit"]').should('not.be.disabled').click();

    cy.get('[type="radio"]').eq(0).check({ force: true });
    cy.get('[data-cy="plantingMethod-submit"]').click({ force: true });
    cy.wait(5000);
    cy.get('[type="radio"]').first().check({ force: true });

    cy.get('[data-cy="rowMethod-rows"]').type(Data.cropPlan.Rows);
    cy.get('[data-cy="rowMethod-length"]').type(Data.cropPlan.Length);
    cy.get('[data-cy="rowMethod-spacing"]').type(Data.cropPlan.Spacing);
    cy.contains('spacing').click();
    cy.get('[data-cy="rowMethod-yield"]').type(Data.cropPlan.Annual_Harvest);
    cy.contains('spacing').click();
    cy.get('[data-testid="unit-select"]')
      .eq(0)
      .then(($elem) => {
        lengthUnit = $elem.text();
        cy.log(lengthUnit);
      });

    cy.get('[data-testid="unit-select"]')
      .eq(1)
      .then(($elem) => {
        spacingUnit = $elem.text();
        cy.log(spacingUnit);
      });

    cy.get('[data-testid="unit-select"]')
      .eq(2)
      .then(($elem) => {
        harvestUnit = $elem.text();
        cy.log(harvestUnit);
      });
    cy.get('[data-cy="rowMethod-submit"]').click();

    cy.get('[data-cy="plantTask-specifyRow"]').type(Data.cropPlan.Specify_Rows);
    cy.get('[data-cy="plantTask-plantingDepth"]').type(Data.cropPlan.Planting_Depth);
    cy.get('[data-cy="plantTask-rowWidth"]').type(Data.cropPlan.Row_Width);
    cy.get('[data-cy="plantTask-spaceRows"]').type(Data.cropPlan.Space_Between);
    cy.get('[data-cy="plantTask-notes"]').type(Data.cropPlan.Notes);
    cy.get('[data-testid')
      .eq(1)
      .then(($elem) => {
        depthUnit = $elem.text();
        cy.log(depthUnit);
      });

    cy.get('[data-testid')
      .eq(4)
      .then(($elem) => {
        rowWidthUnit = $elem.text();
        cy.log(rowWidthUnit);
      });

    cy.get('[data-testid')
      .eq(7)
      .then(($elem) => {
        spaceBetweenUnit = $elem.text();
        cy.log(spaceBetweenUnit);
      });
    cy.get('[data-cy="planGuidance-submit"]').should('be.enabled').click();

    cy.get('[data-cy="cropPlan-save"]').click();
    cy.get('[data-cy="spotlight-next"]').click();

    cy.get('[data-cy="taskCard"]').contains('Planting').should('exist').click();

    cy.get('[data-cy="task-assignee"]')
      .invoke('val')
      .should('equal', 'Unassigned', { matchCase: false });

    cy.get('[data-cy="task-date"]').invoke('val').should('equal', dueDate, { matchCase: false });

    cy.get('[data-cy="cropPlan-numberContainers"]')
      .invoke('val')
      .should('equal', Data.cropPlan.Containers, { matchCase: false });
    cy.get('[data-cy="cropPlan-numberPlants"]')
      .invoke('val')
      .should('equal', Data.cropPlan.Plants, { matchCase: false });
    cy.get('[data-cy="cropPlan-plantingDepth"]')
      .invoke('val')
      .should('equal', Data.cropPlan.Planting_Depth, { matchCase: false });
    cy.get('[data-cy="cropPlan-plantingSoil"]')
      .invoke('val')
      .should('equal', Data.cropPlan.Soil, { matchCase: false });
    cy.get('[data-cy="cropPlan-containerType"]')
      .invoke('val')
      .should('equal', Data.cropPlan.Container_Type, { matchCase: false });
    cy.get('[data-cy="cropPlan-estimatedSeed"]')
      .invoke('val')
      .should('equal', Data.cropPlan.Seed, { matchCase: false });
    cy.get('[data-testid')
      .eq(1)
      .then(($elem) => {
        expect(containerDepthUnit).to.equal($elem.text());
      });
    cy.wait(3 * 1000);
    cy.get('[data-testid')
      .eq(4)
      .then(($elem) => {
        expect(seedUnit).to.equal($elem.text());
      });

    cy.get('[data-cy="taskReadOnly-pencil"]').click();
    cy.get('[data-cy="quickAssign-update"]').click();
    cy.get('[data-cy="taskReadOnly-complete"]').click();

    cy.get('[data-cy="beforeComplete-changes"]').first().check({ force: true });
    cy.get('[data-cy="beforeComplete-plantingMethod"]').eq(0).check({ force: true });
    let newContainers = 510;
    let newPlants = 6;
    let newDepth = 8;
    let newSoil = 'Slightly alkaline';
    let newContainer = 'pots';
    let newSeed = 12;
    cy.get('[data-cy="cropPlan-numberContainers"]').clear().type(newContainers);
    cy.get('[data-cy="cropPlan-numberPlants"]').clear().type(newPlants);
    cy.get('[data-cy="cropPlan-plantingDepth"]').clear().type(newDepth);
    cy.get('[data-cy="cropPlan-plantingSoil"]').clear().type(newSoil);
    cy.get('[data-cy="cropPlan-containerType"]').clear().type(newContainer);
    cy.get('[data-cy="cropPlan-estimatedSeed"]').clear().type(newSeed);
    cy.get('[data-testid')
      .eq(1)
      .then(($elem) => {
        containerDepthUnit = $elem.text();
      });
    cy.get('[data-testid')
      .eq(4)
      .then(($elem) => {
        seedUnit = $elem.text();
      });
    cy.get('[data-cy="beforeComplete-submit"]').click();

    cy.get('[data-cy="taskComplete-duration"]').type('{rightarrow}');
    cy.get('[data-cy="taskComplete-rating"]').eq(3).click();
    cy.get('[data-cy="harvestComplete-save"]').click();
  });
});
