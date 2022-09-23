import { getDateInputFormat } from '../../src/util/moment';

describe.only('Tasks flow tests', () => {
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

  it('farm worker tasks flow tests', () => {
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

    cy.createAccount(emailOwner, farmerName, gender, null, null, password);

    cy.wait(2000);
    //Get Started page
    cy.getStarted();

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
    cy.get('[data-cy=navbar-option]')
      .contains('Farm map')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/tasks');
    cy.get('[data-cy=pill-close]').should('exist').and('not.be.disabled').click();

    //Unassigned tasks : Farm workers should be able to assign the task to themselves
    cy.contains('Unassigned').should('exist').and('not.be.disabled').click();
    //(the farm worker and “Unassigned” should be the only quick assign options)
    cy.selectDropdown().click();
    cy.selectOptions().contains('Unassigned').should('exist');
    cy.selectOptions().contains('Test Worker').should('exist');
    cy.contains('Cancel').should('exist').click({ force: true });

    //Tasks assigned to the farm worker: Farm workers should be able to Unassign the task
    cy.contains('Test W.').should('exist').and('not.be.disabled').click();
    // (the farm worker and “Unassigned” should be the only quick assign options)
    cy.selectDropdown().click();
    cy.selectOptions().contains('Test Worker').should('exist');
    cy.selectOptions().contains('Unassigned').should('exist').click();
    cy.contains('Update').should('exist').click({ force: true });

    //Tasks assigned to other individuals on the farm: None! Task card should be read-only
    cy.contains('Test F.').should('exist').click();
    cy.contains('Assign').should('not.exist');

    //No visual cue that the user can update due date

    //clicking on a task should open the read_only view for said task(test for LF-2374)
    //cy.url().should('include', '/read_only');

    //Assignee input should exist and should be.disabled, there should not be a pencil next to the input (test for LF-2374)

    //Due date input should exist and be disabled there should not be a pencil next to the input (test for LF-2374)

    //locations map should exist and display here said task will be carried out
    //Task specific data should exist(e.g. cleaning agent and estimated water usage for a cleaning task)
  });

  it.only('Farm owner create tasks flow tests', () => {
    //Test for Lf-2314
    let emailOwner;
    let emailUser;

    const farmerName = 'Frank Phiri';
    const gender = 'Male';
    const firstName = 'john';
    const lastName = 'Smith';
    const password = `${userPassword}+1@`;
    const farmName = 'UBC FARM';
    const location = 'University Endowment Lands, BC V6T 1W5 Canada';
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

    cy.createAccount(emailOwner, farmerName, gender, null, null, password);

    //Get Started page
    cy.get('@createUser').then(() => {
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
    cy.get('[data-cy=navbar-option]')
      .contains('Farm map')
      .should('exist')
      .and('not.be.disabled')
      .click();

    //arrive at farm map page and draw a field
    cy.url().should('include', '/map');
    cy.get('[data-cy=spotlight-next]')
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
    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]').contains('Field').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=mapTutorial-continue]')
      .contains('Got it')
      .should('exist')
      .and('not.be.disabled')
      .click();

    let initialWidth;
    let initialHeight;

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.get('[data-cy=map-mapContainer]').then(($canvas) => {
        initialWidth = $canvas.width();
        initialHeight = $canvas.height();
      });
      cy.wait(1000);
      cy.get('[data-cy=map-mapContainer]').click(558, 344);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(570, 321);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(631, 355);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(605, 374);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(558, 344);
      cy.get('[data-cy=mapTutorial-continue]')
        .contains('Got it')
        .should('exist')
        .and('not.be.disabled')
        .click();
      cy.get('[data-cy=map-drawCompleteContinue]')
        .contains('Confirm')
        .should('exist')
        .and('not.be.disabled')
        .click();
    });

    cy.get('[data-cy=createField-fieldName]').should('exist').type(fieldName);
    cy.get('[data-cy=createField-save]').should('exist').and('not.be.disabled').click();
    cy.wait(2000);

    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();
    cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });

    cy.get('[data-cy=task-selection]').each((element, index, list) => {
      // Returns the current li element
      expect(Cypress.$(element)).to.be.visible;

      // Returns the index of the loop
      expect(index).to.be.greaterThan(-1);

      // Returns the elements from the cy.get command
      expect(list).to.have.length(7);

      const text = element.text();

      if (text == 'Clean') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.createACleaningTask();

        //assign all unassigned tasks on date to selected user
        cy.url().should('include', '/tasks');
        cy.get('[data-cy=taskCard]').should('exist');
        cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
        // cy.get('[data-cy=pill-close]').should('exist').and('not.be.disabled').click();
        // cy.contains('Unassigned').last().should('exist').and('not.be.disabled').click({ force: true });
        // cy.get('[data-cy=quickAssign-assignAll]').should('exist').check({ force: true });
        // cy.get('[data-cy=quickAssign-update]').should('exist').and('not.be.disabled').click();
        // cy.contains('Tasks').should('exist');
      } else if (text == 'Field Work') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.createAFieldWorkTask();
        cy.url().should('include', '/tasks');
        cy.get('[data-cy=taskCard]').should('exist');
        cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      } else if (text == 'Harvest') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.get('[data-cy=tasks-noCropPlanCancel]').click();
        // cy.get('[data-cy=spotlight-next]')
        //   .contains('Next')
        //   .should('exist')
        //   .and('not.be.disabled')
        //   .click();
        // cy.get('[data-cy=spotlight-next]')
        //   .contains('Got it')
        //   .should('exist')
        //   .and('not.be.disabled')
        //   .click();
        // cy.createAHarvestTask();
        // cy.url().should('include', '/tasks');
        // cy.get('[data-cy=taskCard]').should('exist');
        // cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      } else if (text == 'Pest Control') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.createAPestControlTask();
        cy.url().should('include', '/tasks');
        cy.get('[data-cy=taskCard]').should('exist');
        cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      } else if (text == 'Planting') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.get('[data-cy=tasks-plantingModalCheckBox]').click({ force: true });
        cy.get('[data-cy=tasks-plantingModalCancel]').click();
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();
        cy.url().should('include', '/tasks');
        cy.get('[data-cy=taskCard]').should('exist');
        cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
        // cy.url().should('include', '/tasks');
        // cy.get('[data-cy=taskCard]').should('exist');
        // cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      } else if (text == 'Soil Amendment') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.createASoilAmendmentTask();
        cy.url().should('include', '/tasks');
        cy.get('[data-cy=taskCard]').should('exist');
        cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      } else if (text == 'Transplant') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.get('[data-cy=tasks-noCropPlanCancel]').click();
        // cy.url().should('include', '/tasks');
        // cy.get('[data-cy=taskCard]').should('exist');
        // cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      }
    });
  });

  it('Admin user must be able to complete tasks on behalf pseudo users', () => {
    //Test for LF-2230
    cy.visit('/');
    cy.loginFarmOwner();
    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();
    cy.createTask();
    cy.get('[data-cy=pill-close]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=taskCard]').eq(25).should('exist').click('right');
    cy.get('[data-cy=taskReadOnly-pencil]').should('exist').click();
    cy.contains('Test Farmer').should('exist').click({ force: true });
    cy.contains('Sudo').should('exist').click({ force: true });
    cy.get('[data-cy=quickAssign-update]').should('exist').and('not.be.disabled').click();
    cy.contains('Mark Complete').should('exist').click({ force: true });
    cy.contains('Continue').should('exist').click({ force: true });
    cy.get('[data-cy=harvestComplete-rating]').should('exist').check({ force: true });
    cy.get('[data-cy=harvestComplete-save]').should('exist').and('not.be.disabled').click();
  });

  it('harvest task for apricot', () => {
    //tests for LF-2332
    cy.visit('/');
    cy.loginFarmOwner();

    //create a harvest plan for apricot
    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains('Crops').should('exist').click();
    cy.contains('Apricot').should('exist').click();

    cy.contains('New Variety').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=crop-addPlan]')
      .contains('Add a plan')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.get('[data-cy=cropPlan-groundPlanted]').should('exist').eq(1).check({ force: true });
    cy.get('[data-cy=cropPlan-age]').should('exist').type(200);
    cy.get('[data-cy=cropPlan-wildCrop]').should('exist').eq(1).check({ force: true });
    cy.get('[data-cy=cropPlan-submit]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=cropPlan-transplanted]').should('exist').eq(1).check({ force: true });
    cy.get('[data-cy=cropPlan-transplantSubmit]').should('exist').and('not.be.disabled').click();

    const date = new Date();
    date.setDate(date.getDate() + 7);
    const formattedDate = getDateInputFormat(date);
    cy.get('[data-cy=cropPlan-plantDate]').should('exist').type(formattedDate);
    cy.get('[data-cy=plantDate-submit]').should('exist').and('not.be.disabled').click();

    cy.wait(2000);
    cy.get('[data-cy=map-selectLocation]').click(540, 201, {
      force: false,
    });
    cy.contains('Continue').should('exist').and('not.be.disabled').click({ force: true });

    cy.get('[type="radio"]').first().check({ force: true });
    cy.contains('Continue').should('exist').and('not.be.disabled').click({ force: true });
    cy.get('[type="radio"]').first().check({ force: true });

    cy.get('[data-cy=rowMethod-rows]').should('exist').type(10);
    cy.get('[data-cy=rowMethod-length]').should('exist').type(30);
    cy.get('[data-cy=rowMethod-spacing]').should('exist').clear().type('15');
    cy.contains('Estimated').click();
    cy.get('[data-cy=rowMethod-yield]').should('have.value', '1.43');
  });

  it('harvest task completion tests', () => {
    //these are tests for LF2360 run this test script after running the happy path test
    //Action: click on the tasks icon. Expected: The tasks view opens with several task cards visible
    cy.visit('/');
    cy.loginFarmOwner();
    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();

    //Action: Click on a harvest task, task card. Expected: Task read only view for selected harvest task is displayed
    cy.get('[data-cy=taskCard]').eq(0).should('exist').click('right');

    //Action: Click on complete task button Expected: Enter task completion flow
    cy.get('[data-cy=taskReadOnly-complete]').should('exist').and('not.be.disabled').click();

    //Action: Complete harvest task completion flow. Expected: Task read only view displayed
    //with the task card for the just completed harvest task showing the correct details
    cy.get('[data-cy=harvestQuantity-quantity]').should('exist').type(1000);
    cy.get('[data-cy=harvestQuantity-continue]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=harvestUses-quantity]').should('exist').type(1000);
    cy.contains('Select').should('exist').click({ force: true });
    cy.contains('Self').should('exist').click({ force: true });
    cy.get('[data-cy=harvestUses-continue]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=harvestComplete-rating]').should('exist').check({ force: true });
    cy.get('[data-cy=harvestComplete-save]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/tasks');
    cy.get('[data-cy=taskCard]').eq(0).should('exist').click('right');
    cy.contains('completed').should('exist');
  });

  it('tasks filters tests', () => {
    //tests for LF2365, run this test after running the happyPath spec
    cy.visit('/');
    cy.loginFarmOwner();
    cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();

    //         //user clicks on the funnel icon on the tasks view to open the tasks filter view
    cy.get('[data-cy=tasks-filter]').click({ force: true });
    //         //user clicks on the assignee input
    //         //assert that all active users appear in the dropdown (test for LF-2365)
    //         //assert that the assignee input is searchable
    //         //user types a letter into the assignee input, assert that the filter workspace
    //         //user clicks on one of the users, assert that a pill is generated for said user

    // user clicks on the type filter, all 7 task types should appear (test for LF-2364)
  });

  it('Complete crop plan', () => {
    //Test for LF-2178
    //Go to completed crop plan’s detail page, user should see the following:
    //Expect Completed date
    //Expect Plan rating
    // Expect Completion notes
    // Expect Plan notes
    // Expect Estimated annual yield
  });

  it('Abandon task', () => {
    //Test for LF-2391
    //navigate to the read only view of an abandoned tasks
    //expected due date label and input between abandonment date and location
    //Test for F21-588
    //Abandon a task assigned to another user
    //Ensure user not asked to rate the task.
    //Rating not shown on the abandoned task page and it should be assigned as “I prefer not to say”
  });

  it('location tasks tab', () => {
    //test for LF-2199
    //navigate to maps view
    //click on a location task
    //tasks tab should be visible click on tasks tab
    //task cards for selected location should be visible
    //task count should be visible and correct
    // create a task link should exist
  });

  it('Admin user must be able to unassign tasks', () => {
    //Test for LF-2323
    //login as a user with admin rights
    //navigate to the tasks view
    //create a task, ensure an assignee is selected
    //back on the task view, change the assignee for the created task to unassigned and click update
    //ensure task card is updated to reflect the new assignee status
    //change the assignee to another user via quick assign modal
    //click the task card to enter the task readonly view
    //click the pencil next to assignee to open the quick assign modal and change the assignee to unassigned
    //ensure the change to assignee persists for selected task
  });
});
