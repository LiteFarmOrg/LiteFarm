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

  it.only('Happy path', { defaultCommandTimeout: 7000 }, () => {
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
    const location = 'University Endowment Lands, BC V6T 1W5 Canada';
    const fieldName = 'Test Field';
    const workerName = 'Test Worker';
    const testCrop = 'New Crop';
    const role = 'Manager';
    const lang = 'English';

    //Login as a new user
    cy.newUserLogin(emailOwner);
    cy.wait(5000);
    //create account
    cy.createAccount(emailOwner, fullName, gender, null, null, password);

    cy.wait(5000);
    //Get Started page
    cy.getStarted();

    //Add farm page
    cy.addFarm(farmName, location);

    //role selection page
    cy.roleSelection(role);
    cy.wait(3000);
    //Consent page
    cy.giveConsent();

    //interested in organic
    cy.interestedInOrganic();

    //who is your certifier(select BCARA)
    cy.selectCertifier();

    //onboarding outro
    cy.onboardingOutro();

    cy.confirmationEmail();

    //farm home page
    cy.homePageSpotlights();
    cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled').click();
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
    //Add a management plan for the new variety
    cy.get('[data-cy=crop-addPlan]')
      .contains('Add a plan')
      .should('exist')
      .and('not.be.disabled')
      .click();
    cy.url().should('include', '/add_management_plan');
    cy.get('[data-cy=cropPlan-groundPlanted]').should('exist').first().check({ force: true });
    cy.get('[data-cy=cropPlan-submit]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/add_management_plan/needs_transplant');
    cy.get('[data-cy=cropPlan-transplantSubmit]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/add_management_plan/plant_date');
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const formattedDate = getDateInputFormat(date);
    cy.get('[data-cy=cropPlan-plantDate]').should('exist').type(formattedDate);
    cy.get('[data-cy=cropPlan-seedGermination]').should('exist').type(7);
    cy.get('[data-cy=cropPlan-plantHarvest]').should('exist').type(200);
    cy.get('[data-cy=plantDate-submit]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/add_management_plan/choose_final_planting_location');
    cy.get('[data-cy=map-selectLocation]').should('exist');
    let heightFactor;
    let widthFactor;
    cy.wait(10 * 1000);
    cy.waitForGoogleApi().then(() => {
      // here comes the code to execute after loading the google Apis
      cy.get('[data-cy=map-selectLocation]').then(($canvas) => {
        const canvasWidth = $canvas.width();
        const canvasHeight = $canvas.height();

        heightFactor = canvasHeight / initialHeight;
        widthFactor = canvasWidth / initialWidth;
        cy.contains(fieldName).should('exist');
        cy.wait(8000);
        cy.get('[data-cy=map-selectLocation]').click(widthFactor * 570, heightFactor * 321, {
          force: false,
        });
      });
    });

    cy.get('[data-cy=cropPlan-locationSubmit]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/add_management_plan/final_planting_method');

    cy.get('[data-cy=cropPlan-plantingMethod]').eq(0).should('exist').check({ force: true });

    cy.get('[data-cy=plantingMethod-submit]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/add_management_plan/row_method');

    cy.get('[data-cy=rowMethod-equalLength]').eq(0).should('exist').check({ force: true });

    cy.get('[data-cy=rowMethod-rows]').should('exist').should('have.value', '').type('10');
    cy.get('[data-cy=rowMethod-length]').should('exist').should('have.value', '').type('30');
    cy.get('[data-cy=rowMethod-spacing]').should('exist').should('have.value', '').type('15');
    cy.contains('row').click();
    cy.get('[data-cy=rowMethod-yield]').should('exist').should('have.value', '').type('1500');
    cy.contains('row').click();

    cy.get('[data-cy=rowMethod-submit]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/add_management_plan/row_guidance');
    cy.get('[data-cy=planGuidance-submit]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=cropPlan-save]').should('exist').and('not.be.disabled').click();
    cy.get('[data-cy=spotlight-next]')
      .contains('Got it')
      .should('exist')
      .and('not.be.disabled')
      .click();
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
