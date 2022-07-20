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
    const fullName = 'Test Farmer';
    const password = `${userPassword}+@`;
    const farmName = 'UBC FARM';
    const location = '49.250833,-123.2410777';
    const fieldName = 'Test Field';
    const workerName = 'Test Worker';
    const testCrop = 'New Crop';

    //Login as a new user
    cy.newUserLogin(emailOwner);

    //invite the new user
    cy.inviteNewUser(emailOwner, fullName, null, null, null, password);

    cy.wait(10 * 1000);
    cy.task('getLastEmail')
      .its('html')
      .then((html) => {
        cy.document({ log: false }).invoke({ log: false }, 'write', html);
      });
    cy.get('[data-cy=button-logIn]')
      .invoke('attr', 'href')
      .then((href) => {
        cy.visit(href);
      });
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
    cy.waitForGoogleApi().then(() => {
      cy.get('[data-cy=addFarm-farmName]').type(farmName);
      cy.get('[data-cy=addFarm-location]').type(location).wait(1000);
      cy.get('[data-cy=addFarm-continue]').should('not.be.disabled').click();
    });

    //role selection page
    cy.contains('What is your role on the farm').should('exist');
    cy.url().should('include', '/role_selection');
    cy.get('[data-cy=roleSelection-continue]').should('exist').and('be.disabled');
    cy.get('[data-cy=roleSelection-role]').should('exist').check('Manager', { force: true });
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

    //who is your certifier(select BCARA)
    cy.contains('Who is your certifier').should('exist');
    cy.url().should('include', '/certification/certifier/selection');
    cy.get('[data-cy=certifierSelection-proceed]').should('exist').and('be.disabled');
    cy.get('[data-cy=certifierSelection-item]').should('exist').eq(1).click();
    let certifier;
    cy.get('[data-cy=certifierSelection-item]')
      .eq(1)
      .then(function ($elem) {
        certifier = $elem.text();
        let end = certifier.indexOf('(');
        let result = certifier.substring(1, end);
        //click the proceed button and ensure test is on the certification summary view and the certification selected is displayed
        cy.get('[data-cy=certifierSelection-proceed]').should('not.be.disabled').click();
        cy.url().should('include', '/certification/summary');
        cy.contains(result).should('exist');
      });

    //certification summary
    cy.get('[data-cy=certificationSummary-continue]')
      .should('exist')
      .and('not.be.disabled')
      .click();

    //onboarding outro
    cy.url().should('include', '/outro');
    cy.get('[data-cy=outro-finish]').should('exist').and('not.be.disabled').click();

    cy.wait(10 * 1000);
    cy.task('getLastEmail')
      .its('html')
      .then((html) => {
        cy.document({ log: false }).invoke({ log: false }, 'write', html);
      });

    cy.get('[data-cy=congrats-email-logIn]')
      .invoke('attr', 'href')
      .then((href) => {
        cy.visit(href);
      });
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
    //Add field view
    cy.get('[data-cy=createField-fieldName]').should('exist').type(fieldName);
    cy.get('[data-cy=createField-save]').should('exist').and('not.be.disabled').click();
    cy.wait(2000);
    //Add a farm worker to the farm
    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(2)
      .contains('People')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');
    cy.get('[data-cy=people-inviteUser]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/invite_user');
    cy.get('[data-cy=invite-fullName]').should('exist').type(workerName);
    cy.contains('Choose Role').should('exist').click({ force: true });
    cy.contains('Farm Worker').should('exist').click();
    cy.get('[data-cy=invite-email]').should('exist').type(emailWorker);
    cy.get('[data-cy=invite-submit]').should('exist').and('not.be.disabled').click();

    cy.url().should('include', '/people');
    cy.contains(workerName).should('exist');

    //logout
    cy.get('[data-cy=home-profileButton]').should('exist').click();
    cy.get('[data-cy=navbar-option]')
      .contains('Log Out')
      .should('exist')
      .and('not.be.disabled')
      .click();

    //login as farm worker, create account and join farm
    cy.task('getLastEmail')
      .its('html')
      .then((html) => {
        cy.document({ log: false }).invoke({ log: false }, 'write', html);
      });

    cy.get('[data-cy=invite-joinButton]')
      .invoke('attr', 'href')
      .then((href) => {
        cy.visit(href);
      });

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
        cy.wait(500);
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
  });

  it('Browser local detection', () => {
    //Test for LF-2368
    cy.visit('/', {
      onBeforeLoad(win) {
        // solution is here
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
