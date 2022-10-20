import { getDateInputFormat } from '../../src/util/moment';

describe.only('LiteFarm end to end test', () => {
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

  it.only('Happy path', () => {
    cy.visit('/');
    cy.get('[data-cy=email]').should('exist');
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
    cy.wait('@emailLogin', { timeout: 30 * 1000 }).should(({ request, response }) => {
      expect(response.statusCode).to.equal(200);
      //create account
      cy.wait(15 * 1000);
      cy.createAccount(emailOwner, fullName, gender, null, null, password);
    });

    cy.wait('@createUser', { timeout: 30 * 1000 }).should(({ request, response }) => {
      expect(response.statusCode).to.equal(201);
      cy.getStarted();
    });

    // cy.get('@createUser').then(() => {
    //confirm user creation email
    //cy.userCreationEmail();
    //Get Started page

    // });
    //Add farm page
    cy.waitForReact();
    cy.addFarm(farmName, location);
    cy.newUserLogin(emailOwner);
    cy.get('[data-cy="enterPassword-password"]').type(password);
    cy.get('[data-cy="enterPassword-submit"]').click();
    cy.get('[data-cy="chooseFarm-proceed"]').click();
    //role selection page
    cy.roleSelection(role);
    cy.wait(30 * 1000);
    //Consent page
    cy.giveConsent();
    cy.wait(5000);
    //interested in organic
    cy.interestedInOrganic();

    //who is your certifier(select BCARA)
    cy.selectCertifier();
    cy.wait(5000);
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
      cy.wait(5000);
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

    cy.get('[data-cy=areaDetails-name]').should('exist').type(fieldName);
    cy.get('[data-cy=createField-save]').should('exist').and('not.be.disabled').click();
    cy.wait(2000);

    //Add a farm worker to the farm
    cy.goToPeopleView('English');
    cy.url().should('include', '/people');
    cy.get('[data-cy=people-inviteUser]').should('exist').and('not.be.disabled').click();
    cy.inviteUser(
      'Farm Worker',
      workerName,
      emailWorker,
      emailOwner,
      'Female',
      lang,
      25,
      1970,
      180012345,
    );

    cy.url().should('include', '/people');
    //cy.get('.ReactTable').eq(1).should('eq', true);
    cy.contains(workerName).should('exist');

    //logout
    cy.logOut();

    //login as farm worker, create account and join farm
    cy.acceptInviteEmail(lang);

    cy.get('[data-cy=invitedCard-createAccount]').click();

    cy.get('[data-cy=invitedUser-proceed]').click();

    cy.get('[data-cy=invited-password]').type(password);

    cy.get('[data-cy=invited-createAccount]').click();

    //Consent page
    cy.contains('Our Data Policy').should('exist');
    cy.url().should('include', '/consent');
    cy.get('[data-cy=consent-continue]').should('exist').and('be.disabled');
    cy.get('[data-cy=consent-agree]').should('exist').check({ force: true });
    cy.get('[data-cy=consent-continue]').should('not.be.disabled').click();

    cy.get('[data-cy=joinFarm-successContinue]').should('not.be.disabled').click();

    cy.get('[data-cy=chooseFarm-proceed]').should('not.be.disabled').click();

    //farm home page
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
      .contains('Next')
      .should('exist')
      .and('not.be.disabled')
      .click();
    cy.get('[data-cy=spotlight-next]')
      .contains('Got it')
      .should('exist')
      .and('not.be.disabled')
      .click();

    //logout
    cy.get('[data-cy=home-profileButton]').should('exist').click();
    cy.get('[data-cy=navbar-option]')
      .contains('Log Out')
      .should('exist')
      .and('not.be.disabled')
      .click();

    //Login as farm owner
    cy.get('[data-cy=email]').type(emailOwner);
    cy.contains('Continue').should('exist').and('be.enabled').click();
    cy.get('[data-cy=enterPassword-password]').type(password);
    cy.get('[data-cy=enterPassword-submit]').should('exist').and('be.enabled').click();

    cy.get('[data-cy=chooseFarm-proceed]').should('exist').and('be.enabled').click();

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
    cy.get('[data-cy=crop-cropName]').should('exist').type(testCrop);
    cy.contains('Select').should('exist').click({ force: true });
    cy.contains('Cereals').should('exist').click();
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
    cy.get('[data-cy=spotlight-next]')
      .contains('Next')
      .should('exist')
      .and('not.be.disabled')
      .click();
    cy.get('[data-cy=spotlight-next]')
      .contains(`Let's get started`)
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.get('[data-cy=home-taskButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

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
        cy.get('._contentContainer_nkx8u_1').contains('Successfully created task').should('exist');
        //assign all unassigned tasks on date to selected user
        cy.url().should('include', '/tasks');
        cy.get('[data-cy="pill-close"]').click();
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
        cy.get('._contentContainer_nkx8u_1').contains('Successfully created task').should('exist');
        cy.url().should('include', '/tasks');
        cy.get('[data-cy=taskCard]').should('exist');
        cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      } else if (text == 'Harvest') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.get('[data-cy="tasks-noCropPlanContinue"]').click();

        cy.createAHarvestTask(
          daysGermination,
          daysTransplant,
          daysHarvest,
          containers,
          plantsPerContainer,
          rows,
          length,
          lengthUnit,
          spacing,
          spacingUnit,
          harvest,
          harvestUnit,
        );
        cy.get('[data-cy=home-taskButton]').should('exist').and('not.be.disabled').click();
        cy.url().should('include', '/tasks');
        cy.get('[data-cy=taskCard]').should('exist');
        cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      } else if (text == 'Pest Control') {
        cy.get('[data-cy=task-selection]').eq(index).click();
        cy.createAPestControlTask();
        cy.get('._contentContainer_nkx8u_1').contains('Successfully created task').should('exist');
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
        cy.get('._contentContainer_nkx8u_1').contains('Successfully created task').should('exist');
        cy.url().should('include', '/tasks');
      } else if (text == 'Transplant') {
        return;
        // cy.url().should('include', '/tasks');
        // cy.get('[data-cy=taskCard]').should('exist');
        // cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
      }
    });

    cy.get('[data-cy="tasks-taskCount"]').contains('7 tasks');
    cy.get('[data-cy="taskCard"]').each((element, index, list) => {
      expect(Cypress.$(element)).to.be.visible;
      const text = element.text();
      // Returns the index of the loop
      expect(index).to.be.greaterThan(-1);

      // Returns the elements from the cy.get command
      expect(list).to.have.length(7);
      if (text.includes('Transplant')) {
        cy.log(text);
        cy.contains('Transplant').should('exist').click();
        cy.get('[data-cy="rowMethod-rows"]')
          .invoke('val')
          .then(parseInt)
          .should('be.a', 'number')
          .should('equal', rows);
        cy.get('[data-cy="rowMethod-length"]')
          .invoke('val')
          .then(parseInt)
          .should('be.a', 'number')
          .should('equal', length);
        cy.get('.css-3iigni-container')
          .eq(0)
          .then((val) => {
            const unit = val.text();

            expect(unit).to.equal(lengthUnit);
          });
        cy.get('[data-cy="rowMethod-spacing"]')
          .invoke('val')
          .then(parseInt)
          .should('be.a', 'number')
          .should('equal', spacing);
        cy.get('.css-3iigni-container')
          .eq(1)
          .then((val) => {
            const unit = val.text();

            expect(unit).to.equal(spacingUnit);
          });
        cy.get('[data-cy="taskReadOnly-pencil"]').click();
        cy.get('[data-cy="quickAssign-update"]').click();
        cy.get('[data-cy="taskReadOnly-complete"]').click();
        cy.get('[data-cy="beforeComplete-submit"]').click();
        cy.get('[type = "checkbox"]').check({ force: true });
        cy.get('[data-cy="harvestComplete-save"]').click();
        cy.get('[data-cy="status-label"]').eq(6).contains('Completed').should('exist');
      }

      if (text.includes('Planting')) {
        cy.log(text);
        cy.contains('Planting').should('exist').click();
        cy.get('[data-cy="cropPlan-numberContainers"]')
          .invoke('val')
          .then(parseInt)
          .should('be.a', 'number')
          .should('equal', containers);
        cy.get('[data-cy="cropPlan-numberPlants"]')
          .invoke('val')
          .then(parseInt)
          .should('be.a', 'number')
          .should('equal', plantsPerContainer);

        cy.contains('Abandon this task').should('exist').click();
        cy.selectDropdown().click();
        cy.contains('Weather').click();
        cy.get('[data-cy="abandon-save"]').click();
        cy.get('[data-cy="status-label"]').eq(6).contains('Abandoned').should('exist');
      }

      cy.contains('Test Field').should('exist').click({ force: true });
      cy.get('._buttonContainer_ws78e_1').should('exist').click();
    });
    //modify the management plan with quick assign modal
    cy.get('[data-cy=taskCard-dueDate]').eq(0).should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=dateAssign-update]').should('exist').and('be.disabled');

    date.setDate(date.getDate() + 30);
    const dueDate = getDateInputFormat(date);

    cy.get('[data-cy=dateAssign-date]').should('exist').type(dueDate);
    cy.get('[data-cy=dateAssign-update]')
      .should('exist')
      .and('not.be.disabled')
      .click()
      .then(() => {
        function reformatDateString(s) {
          var months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ];
          var parts = s.split('-');
          return months[parts[1] - 1] + ' ' + Number(parts[2]) + ', ' + parts[0];
        }

        const Date = reformatDateString(dueDate);

        cy.get('[data-cy=taskCard-dueDate]').eq(0).contains(Date).should('exist');
      });

    cy.get('[data-cy=taskCard-assignee]').eq(0).should('exist').and('not.be.disabled');
    cy.get('[data-cy=taskCard]').eq(1).should('exist').click('right');
    cy.get('[data-cy=taskReadOnly-pencil]').should('exist').click();
    cy.get('[data-cy=quickAssign-update]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=home-taskButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });

    cy.get('._filter_4bpr4_19').click();

    cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=navbar-option]')
      .contains('Farm map')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]').contains('Barn').should('exist').and('not.be.disabled').click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(656, 372);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(672, 350);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(704, 378);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(656, 372);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="areaDetails-name"]').type('Barn 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Ceremonial')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(414, 411);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(459, 426);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(421, 488);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(414, 411);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="areaDetails-name"]').type('Ceremonial Area 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('boundary')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(169, 130);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(30, 303);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(98, 510);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(406, 361);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(169, 130);
      cy.wait(500);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="areaDetails-name"]').type('Boundary 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Garden')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(422, 375);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(455, 383);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(434, 409);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(422, 375);
      cy.wait(500);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="areaDetails-name"]').type('Garden 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Greenhouse')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(289, 321);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(325, 329);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(295, 363);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(289, 321);
      cy.wait(500);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="areaDetails-name"]').type('Greenhouse 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Natural')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(381, 400);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(330, 352);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(378, 500);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(381, 400);
      cy.wait(500);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="areaDetails-name"]').type('Natural 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Residence')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(184, 400);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(215, 350);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(193, 352);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(184, 400);
      cy.wait(500);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="areaDetails-name"]').type('Farm house');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Surface')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(188, 299);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(203, 301);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(194, 326);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(172, 328);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(188, 299);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="areaDetails-name"]').type('Pond');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Buffer')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.get('[data-cy="mapTutorial-continue"]').click();
    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(180, 400);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(400, 301);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(400, 301);
      cy.get('[data-cy="mapTutorial-continue"]').click();
      cy.contains('Confirm').click();
    });

    cy.get('[data-cy="lineDetails-name"]').type('Buffer 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]').contains('Fence').should('exist').and('not.be.disabled').click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(280, 400);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(400, 400);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(400, 400);
      cy.get('[data-cy="map-drawCompleteContinue"]').click();
    });

    cy.get('[data-cy="lineDetails-name"]').type('Fence 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Watercourse')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(70, 80);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(400, 80);
      cy.wait(500);
      cy.get('[data-cy=map-mapContainer]').click(400, 80);
      cy.contains('Confirm').click();
    });

    cy.get('[data-cy="lineDetails-name"]').type('Watercourse 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]').contains('Gate').should('exist').and('not.be.disabled').click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(95, 95);
      cy.contains('Confirm').click();
    });
    cy.get('[data-cy="pointDetails-name"]').type('Gate 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Water valve')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis

      cy.wait(5000);
      cy.get('[data-cy=map-mapContainer]').click(305, 95);
      cy.contains('Confirm').click();
    });
    cy.get('[data-cy="pointDetails-name"]').type('Valve 1');
    cy.get('[data-cy="createField-save"]').should('be.enabled').click();

    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=map-drawer]')
      .contains('Sensor')
      .should('exist')
      .and('not.be.disabled')
      .click();

    cy.contains('Download this').click();
    cy.get('[data-cy=sensorModal-back]').click();
    cy.get('[data-cy=map-addFeature]').should('exist').and('not.be.disabled').click();

    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains('Document').should('exist').click();
    cy.get('[data-cy="spotlight-next"]').click();
    cy.get('[data-cy="spotlight-next"]').click();

    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains('Crops').should('exist').click();
    cy.url().should('include', '/crop_catalogue');
    cy.get('[data-cy="tasks-filter"]').click();
    cy.selectDropdown().eq(0).click();

    cy.get('.css-1plh46m-MenuList2').eq(0).click();
    cy.contains('Apply').click();

    cy.get('[data-cy=navbar-hamburger]').should('exist').click();
    cy.contains('Finances').should('exist').click();

    //logout
    //cy.get('[data-cy=home-profileButton]').should('exist').click();
    //cy.get('[data-cy=navbar-option]').contains('Log Out').should('exist').and('not.be.disabled').click();
  });

  it('Browser local detection', () => {
    //Test for LF-2368
    cy.visit('/', {
      onBeforeLoad(win) {
        Object.defineProperty(win.navigator, 'languages', {
          value: ['fr-FR'],
        });
      },
    });

    cy.contains('CONTINUER AVEC GOOGLE').should('exist');
    cy.get('[data-cy=email]').type('french@test.com');
    cy.contains('Continue').should('exist').and('be.enabled').click();
    cy.contains('Créer un nouveau compte utilisateur').should('exist');
  });
});
