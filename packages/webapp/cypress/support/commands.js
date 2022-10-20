import 'cypress-react-selector';
import { getDateInputFormat } from '../../src/util/moment';
let token;
let farm_id;
let user_id;
// cypress/support/commands.js
Cypress.Commands.add('loginByGoogleApi', () => {
  cy.log(process.env.REACT_APP_GOOGLE_CLIENTID);
  cy.log('Logging in to Google');
  cy.request({
    method: 'POST',
    url: 'https://www.googleapis.com/oauth2/v4/token',
    body: {
      grant_type: 'refresh_token',
      client_id: Cypress.env('REACT_APP_GOOGLE_CLIENTID'),
      client_secret: Cypress.env('REACT_APP_GOOGLE_CLIENT_SECRET'),
      refresh_token: Cypress.env('GOOGLE_REFRESH_TOKEN'),
    },
  }).then(({ body }) => {
    const { access_token, id_token } = body;

    cy.request({
      method: 'GET',
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      headers: { Authorization: `Bearer ${access_token}` },
    }).then(({ body }) => {
      cy.log(body);
      const userItem = {
        token: id_token,
        user: {
          googleId: body.sub,
          email: body.email,
          givenName: body.given_name,
          familyName: body.family_name,
          imageUrl: body.picture,
        },
      };

      window.localStorage.setItem('id_token', userItem.token);
    });
  });
});

Cypress.Commands.add('waitForGoogleApi', () => {
  let mapWaitCount = 0;
  const mapWaitMax = 5;

  cyMapLoad();

  function cyMapLoad() {
    mapWaitCount++;

    cy.window().then((win) => {
      if (typeof win.google != 'undefined') {
        console.log(`Done at attempt #${mapWaitCount}:`, win);
        return true;
      } else if (mapWaitCount <= mapWaitMax) {
        console.log('Waiting attempt #' + mapWaitCount); // just log
        cy.wait(2000);
        cyMapLoad();
      } else if (mapWaitCount > mapWaitMax) {
        console.log('Failed to load google api');
        return false;
      }
    });
  }
});

Cypress.Commands.add('loginFarmOwner', () => {
  const emailOwner = 'mbolokonya@litefarm.org';
  const password = 'P@ssword123';

  //Enter password page
  cy.get('[data-cy=email]').type(emailOwner);
  cy.contains('Continue').should('exist').and('be.enabled').click();
  cy.get('[data-cy=enterPassword-password]').type(password);
  cy.get('[data-cy=enterPassword-submit]').should('exist').and('be.enabled').click();

  cy.get('[data-cy=chooseFarm-ubc]').eq(0).should('exist').click('right');
  cy.get('[data-cy="chooseFarm-proceed"]').should('exist').and('be.enabled').click();
});

Cypress.Commands.add('loginFarmWorker', () => {
  const emailOwner = 'worker@example.com';
  const password = 'P@ssword123';

  //Enter password page
  cy.get('[data-cy=email]').type(emailOwner);
  cy.contains('Continue').should('exist').and('be.enabled').click();
  cy.get('[data-cy=enterPassword-password]').type(password);
  cy.get('[data-cy=enterPassword-submit]').should('exist').and('be.enabled').click();

  cy.get('[data-cy=chooseFarm-ubc]').eq(0).should('exist').click('right');
  cy.get('[data-cy=chooseFarm-proceed]').should('exist').and('be.enabled').click();
});

Cypress.Commands.add('createSudoUser', () => {
  cy.get('[data-cy=home-farmButton]').should('exist').and('not.be.disabled').click();
  cy.get('[data-cy=navbar-option]')
    .contains('People')
    .should('exist')
    .and('not.be.disabled')
    .click();
  cy.url().should('include', '/people');
  cy.get('[data-cy=people-inviteUser]').should('exist').and('not.be.disabled').click();

  cy.url().should('include', '/invite_user');
  cy.get('[data-cy=invite-fullName]').should('exist').type('Sudo User');
  cy.contains('Choose Role').should('exist').click({ force: true });
  cy.contains('Farm Worker').should('exist').click();
  cy.get('[data-cy=invite-submit]').should('exist').and('not.be.disabled').click();
});

Cypress.Commands.add('selectDropdown', () => {
  cy.get('.css-tj5bde-Svg').should('exist');
});
Cypress.Commands.add('selectOptions', () => {
  cy.get('.css-1plh46m-MenuList2').should('exist');
});

Cypress.Commands.add('genderOptions', () => {
  cy.get('.css-14sfozv-menu').should('exist');
});

Cypress.Commands.add('insights', () => {
  cy.get('._infoTextLine_avdgi_23').should('exist');
});

Cypress.Commands.add('createUserGender', () => {
  cy.get(
    ':nth-child(4) > .css-1e28hxc-container > .css-oi28ju-Control2 > .css-1pfr3d8-IndicatorsContainer2 > .css-1rtg9lh-indicatorContainer > .css-tj5bde-Svg',
  );
});

Cypress.Commands.add('createUserGenderOptions', () => {
  cy.get('#react-select-2-listbox');
});

Cypress.Commands.add('createACleaningTask', () => {
  //Create an unassigned cleaning task due tomorrow

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
  cy.get('[data-cy=addTask-detailsContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy=addTask-assignmentSave]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
});

Cypress.Commands.add('createAFieldWorkTask', () => {
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
  cy.contains('Select') // find react-select component
    .click({ force: true }); // click to open dropdown
  cy.get('.css-1plh46m-MenuList2') // find all options
    .eq(0)
    .click(); // click on first option

  cy.get('[data-cy=addTask-detailsContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy=addTask-assignmentSave]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
});

Cypress.Commands.add(
  'createAHarvestTask',
  (
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
  ) => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dueDate = getDateInputFormat(date);

    cy.get('[data-cy="crop-tile"]').eq(0).click();
    cy.get('[data-cy="crop-name"]').contains('New Variety').click();

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
    cy.get('[type = "radio"]').eq(0).check({ force: true });
    cy.get('[type = "radio"]').eq(3).check({ force: true });
    cy.get('[data-cy=cropPlan-transplantSubmit]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/add_management_plan/plant_date');
    cy.get('[data-cy="cropPlan-plantDate"]').should('exist').type(dueDate);
    cy.get('[data-cy="cropPlan-seedGermination"]').type(daysGermination);
    cy.get('[data-cy="cropPlan-plantTransplant"]').type(daysTransplant);
    cy.get('[data-cy="cropPlan-plantHarvest"]').type(daysHarvest);

    cy.get('[data-cy="plantDate-submit"]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy="spotlight-next"]').click({ force: true });
    cy.wait(7000);
    cy.get('[data-cy=map-selectLocation]').click(530, 216, {
      force: false,
    });
    cy.get('[data-cy="cropPlan-locationSubmit"]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[type = "radio"]').eq(0).check({ force: true });
    cy.get('[data-cy=cropPlan-numberContainers]').type(containers);
    cy.get('[data-cy=cropPlan-numberPlants]').type(plantsPerContainer);
    cy.get('[data-cy=cropPlan-containerSubmit]').click();
    cy.wait(7000);
    cy.get('[data-cy=map-selectLocation]').click(530, 216, {
      force: false,
    });
    cy.get('[data-cy="cropPlan-locationSubmit"]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=cropPlan-plantingMethod]').eq(0).should('exist').check({ force: true });

    cy.get('[data-cy=plantingMethod-submit]').should('exist').and('not.be.disabled').click();
    cy.url().should('include', '/add_management_plan/row_method');

    cy.get('[data-cy=rowMethod-equalLength]').eq(0).should('exist').check({ force: true });

    cy.get('[data-cy=rowMethod-rows]').should('exist').should('have.value', '').type(rows);
    cy.get('[data-cy=rowMethod-length]').should('exist').should('have.value', '').type(length);
    cy.get('.css-15ndcg3-SingleValue2')
      .eq(0)
      .then((val) => {
        const unit = val.text();

        expect(unit).to.equal(lengthUnit);
      });
    cy.get('[data-cy=rowMethod-spacing]').should('exist').should('have.value', '').type(spacing);
    cy.get('.css-15ndcg3-SingleValue2')
      .eq(1)
      .then((val) => {
        const unit = val.text();

        expect(unit).to.equal(spacingUnit);
      });
    cy.contains('row').click();
    cy.get('[data-cy=rowMethod-yield]').should('exist').should('have.value', '').type(harvest);
    cy.get('.css-15ndcg3-SingleValue2')
      .eq(2)
      .then((val) => {
        const unit = val.text();

        expect(unit).to.equal(harvestUnit);
      });
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
  },
);

Cypress.Commands.add('createAPestControlTask', () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const dueDate = getDateInputFormat(date);

  cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

  cy.get('[data-cy=addTask-continue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.wait(7000);
  cy.get('[data-cy=map-selectLocation]').click(530, 216, {
    force: false,
  });
  cy.get('[data-cy=addTask-locationContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy="addTask-cropsContinue"]').click();
  cy.selectDropdown() // find all options
    .eq(0)
    .click(); // click on first option

  cy.get('.css-9p5joy-MenuList2').eq(0).click();
  cy.get('[data-cy=addTask-detailsContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy=addTask-assignmentSave]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
});

Cypress.Commands.add('createASoilAmendmentTask', () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const dueDate = getDateInputFormat(date);

  cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

  cy.get('[data-cy=addTask-continue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.wait(7000);
  cy.get('[data-cy=map-selectLocation]').click(530, 216, {
    force: false,
  });
  cy.get('[data-cy=addTask-locationContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy="addTask-cropsContinue"]').click();
  cy.selectDropdown().eq(0).click();
  cy.contains('pH').click();
  cy.selectDropdown().eq(1).click();
  cy.get('.css-s115vr-Control2 > .css-b4qs0x-ValueContainer2 > .css-ujecln-Input2').type(
    'Lime{enter}',
  );
  cy.get('._input_ugk5b_1').type('New Supplier');
  cy.get('[type = "radio"]').eq(1).check({ force: true });
  cy.get('._input_12pgn_1').type('30');
  cy.contains('Notes').click();
  cy.get('[data-cy=addTask-detailsContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy=addTask-assignmentSave]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
});

Cypress.Commands.add('createTaskToday', () => {
  //Create an unassigned cleaning task due today
  cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
  cy.contains('Clean').should('exist').and('not.be.disabled').click({ force: true });

  const date = new Date();
  const dueDate = getDateInputFormat(date);

  cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

  cy.get('[data-cy=addTask-continue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.wait(2000);
  cy.get('[data-cy=map-selectLocation]').click(530, 216, {
    force: false,
  });
  cy.get('[data-cy=addTask-locationContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy="addTask-cropsContinue"]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy=addTask-detailsContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('.css-ujecln-Input2').click();
  cy.contains('Test Farmer').click({ force: true });
  cy.get('[data-cy=addTask-assignmentSave]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
});

Cypress.Commands.add('createUnassignedTaskThisWeek', () => {
  //Create an unassigned cleaning task due today
  cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
  cy.contains('Clean').should('exist').and('not.be.disabled').click({ force: true });

  const date = new Date();
  const dueDate = getDateInputFormat(date);

  cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

  cy.get('[data-cy=addTask-continue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.wait(2000);
  cy.get('[data-cy=map-selectLocation]').click(530, 216, {
    force: false,
  });
  cy.get('[data-cy=addTask-locationContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy="addTask-cropsContinue"]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy=addTask-detailsContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy=addTask-assignmentSave]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
});

Cypress.Commands.add('getEmail', () => {
  // get and check the test email only once before the tests
  cy.task('getUserEmail').then((email) => {
    expect(email).to.be.a('string');
    return email;
  });
}) /
  Cypress.Commands.add('getPassword', () => {
    // get and check the test password only once before the tests
    cy.task('getUserPassword').then((password) => {
      expect(password).to.be.a('string');
      return password;
    });
  });

Cypress.Commands.add('newUserLogin', (email) => {
  //Login page
  cy.get('[data-cy=email]').type(email);
  cy.intercept('GET', '**/login/user/' + email, (req) => {
    delete req.headers['if-none-match'];
  }).as('emailLogin');
  cy.contains('Continue').should('exist').and('be.enabled').click();
});

Cypress.Commands.add('createAccount', (email, fullName, gender, language, birthYear, password) => {
  cy.contains('Create new user account', { timeout: 60 * 1000 }).should('exist');
  //cy.get('[data-cy=createUser-email]').should('eq', email);
  cy.get('[data-cy=createUser-fullName]').type(fullName);
  cy.get('[data-cy=createUser-password]').type(password);
  //cy.createUserGender().click();
  //cy.createUserGenderOptions().eq(1).contains(gender).click();

  cy.intercept('POST', '**/user').as('createUser');
  cy.contains('Create Account').should('exist').and('be.enabled').click();
});

Cypress.Commands.add('userCreationEmail', () => {
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
});

Cypress.Commands.add('addFarm', (farmName, location) => {
  cy.url().should('include', '/add_farm');
  // cy.get('[data-cy=addFarm-continue]').should('exist').should('be.disabled');
  // cy.intercept({
  //   method: 'GET',
  //   url: 'https://maps.googleapis.com/maps/api/mapsjs/gen_204?csp_test=true',
  // }).as('loadMap');
  // // Enter new farm details and click continue which should be enabled
  // cy.waitForGoogleApi().then(() => {
  //   cy.wait(3000);

  //   cy.wait('@loadMap', { timeout: 15000 }).then(() => {
  //     //cy.get('svg').eq(0).click();
  //     cy.get('[data-cy=addFarm-location]').should('exist').type(location).wait(1000);
  //     //cy.get('.pac-item').should('exist').click({ force: true });
  //     cy.get('[data-cy=addFarm-farmName]').should('exist').type(farmName);
  //   });

  //   cy.get('[data-cy=addFarm-continue]').should('not.be.disabled').click();
  //   cy.getReact('PureAddFarm').getProps('map').getProps('gridPoints');
  //   cy.wait(5 * 1000);
  // });
  token = localStorage.getItem('id_token');
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/farm', // baseUrl is prepend to URL
    headers: { Authorization: 'Bearer ' + token },
    body: {
      farm_name: farmName,
      address: 'University Blvd, Vancouver, BC V6T, Canada',
      grid_points: { lat: 49.2657793, lng: -123.2359185 },
      country: 'Canada',
    },
  }).then((response) => {
    // response.body is automatically serialized into JSON
    expect(response.body).to.have.property('farm_name', farmName); // true
    farm_id = response.body.farm_id;
    user_id = response.body.user_id;
    const now = new Date();
    cy.request({
      method: 'PATCH',
      url: 'http://localhost:5000/user_farm/onboarding/farm/' + farm_id + '/user/' + user_id,
      headers: { Authorization: 'Bearer ' + token },
      body: {
        step_one: true,
        step_one_end: now,
      },
    }).then((response) => {
      expect(response.status).to.equal(200); // true
    });

    // cy.request({
    //   method: 'GET',
    //   url: 'http://localhost:5000/farm_token/farm/' + farm_id, // baseUrl is prepend to URL
    //   headers: { Authorization: 'Bearer ' + token, user_id, farm_id },
    // }).then((response) => {
    //   const farm_token = response.body;
    //   expect(response.status).to.equal(200); // true
    //   cy.log(farm_token);
    //   localStorage.setItem('farm_token', farm_token);
    // });

    cy.clearLocalStorage();
    cy.visit('/');
  });
});

Cypress.Commands.add('getStarted', () => {
  cy.contains('started').should('exist');
  cy.get('[data-cy=getStarted]').should('exist').and('not.be.disabled').click();
});

Cypress.Commands.add('roleSelection', (role) => {
  cy.contains('What is your role on the farm').should('exist');
  cy.url().should('include', '/role_selection');
  cy.get('[data-cy=roleSelection-continue]').should('exist').and('be.disabled');
  cy.get('[data-cy=roleSelection-role]').should('exist').check(role, { force: true });
  cy.get('[data-cy=roleSelection-continue]').should('not.be.disabled').click();
});

Cypress.Commands.add('giveConsent', () => {
  //cy.contains('Our Data Policy').should('exist');
  cy.url().should('include', '/consent');
  cy.get('[data-cy=consentPage-content]', { timeout: 60 * 1000 }).should('exist');
  cy.get('[data-cy=consent-continue]').should('exist').and('be.disabled');
  cy.get('[data-cy=consent-agree]').should('exist').check({ force: true });
  cy.get('[data-cy=consent-continue]').should('not.be.disabled').click();
});

Cypress.Commands.add('interestedInOrganic', () => {
  cy.contains('Interested in certifications').should('exist');
  cy.url().should('include', '/certification/interested_in_organic');
  cy.get('[data-cy=interestedInOrganic-continue]').should('exist').and('be.disabled');
  cy.get('[data-cy=interestedInOrganic-select]').should('exist');
  cy.get('[type="radio"]').first().check({ force: true });
  cy.get('[data-cy=interestedInOrganic-continue]').should('not.be.disabled').click();

  cy.contains('What type of certification').should('exist');
  cy.url().should('include', '/certification/selection');
  cy.get('[data-cy=certificationSelection-continue]').should('exist').and('be.disabled');
  cy.get('[data-cy=certificationSelection-type]').should('exist');
  cy.get('[type="radio"]').first().check({ force: true });
  cy.get('[data-cy=certificationSelection-continue]').should('not.be.disabled').click();
});

Cypress.Commands.add('selectCertifier', () => {
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
  cy.get('[data-cy=certificationSummary-continue]').should('exist').and('not.be.disabled').click();
});

Cypress.Commands.add('onboardingOutro', () => {
  cy.url().should('include', '/outro');
  cy.get('[data-cy=outro-finish]').should('exist').and('not.be.disabled').click();
});

Cypress.Commands.add('confirmationEmail', () => {
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
});

Cypress.Commands.add('homePageSpotlights', () => {
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
});

Cypress.Commands.add('addField', () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/location/field',
    headers: { Authorization: 'Bearer ' + token, user_id, farm_id },
    body: {
      figure: {
        type: 'field',
        area: {
          total_area: 16931,
          total_area_unit: 'ha',
          grid_points: [
            {
              lat: 49.26395897685993,
              lng: -123.23342941003418,
            },
            { lat: 49.26460309887879, lng: -123.23291442590332 },
            { lat: 49.263650915530825, lng: -123.23029658990478 },
            { lat: 49.26311880506887, lng: -123.23141238885498 },
          ],
          perimeter: 573,
          perimeter_unit: 'm',
        },
      },
      field: {
        organic_status: 'Non-Organic',
        organic_history: {
          effective_date: '2022-10-20',
          organic_status: 'Non-Organic',
        },
      },
      farm_id: farm_id,
      name: 'Test Field',
      notes: '',
    },
  }).then((response) => {
    expect(response.status).to.equal(200); // true
  });
});

Cypress.Commands.add('goToPeopleView', (lang) => {
  if (lang == 'English') {
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
  } else if (lang == 'French') {
    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(2)
      .contains('Personnes')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');
  } else if (lang == 'Spanish') {
    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(2)
      .contains('Personas')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');
  } else if (lang == 'Portuguese') {
    cy.get('[data-cy=home-farmButton]')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.get('[data-cy=navbar-option]')
      .eq(2)
      .contains('Pessoas')
      .should('exist')
      .and('not.be.disabled')
      .click({ force: true });
    cy.url().should('include', '/people');
  }
});

Cypress.Commands.add(
  'inviteUser',
  (role, fullName, email, existingUser, gender, language, wage, birthYear, phoneNumber) => {
    //from people view
    const invalidEmail = 'Invalid email';
    cy.url().should('include', '/invite_user');
    cy.get('[data-cy=invite-fullName]').click();
    cy.contains('Full name').click();
    cy.get('[data-cy=error]').contains('Required').should('exist');

    cy.get('[data-cy=invite-fullName]').should('exist').type(fullName);
    cy.contains('Choose Role').should('exist').click({ force: true });
    cy.contains(role).should('exist').click({ force: true });

    if (email != null) {
      cy.get('[data-cy=invite-email]').should('exist').type(invalidEmail);
      cy.contains('Email').click();
      cy.get('[data-cy=error]').contains('Please enter a valid email').should('exist');

      cy.get('[data-cy=invite-email]').should('exist').clear().type(existingUser);
      cy.contains('Email').click();
      cy.get('[data-cy=error]')
        .contains('A user with that email already has access to this farm')
        .should('exist');

      cy.get('[data-cy=invite-email]').should('exist').clear().type(email);
    }

    cy.contains('Prefer not to say').should('exist').click({ force: true });
    cy.contains(gender).should('exist').click({ force: true });
    cy.contains('English').should('exist').click({ force: true });
    cy.contains(language).should('exist').click({ force: true });
    cy.get('[data-cy=invite-wage]').should('exist').type(wage);
    cy.get('[data-cy=invite-phoneNumber]').should('exist').type(phoneNumber);
    cy.get('[data-cy=invite-birthYear]').should('exist').type(birthYear);

    cy.get('[data-cy=invite-submit]').should('exist').and('not.be.disabled').click();
  },
);

Cypress.Commands.add('logOut', () => {
  cy.get('[data-cy=home-profileButton]').should('exist').click();
  cy.get('[data-cy=navbar-option]')
    .contains('Log Out')
    .should('exist')
    .and('not.be.disabled')
    .click();
});

Cypress.Commands.add('acceptInviteEmail', (lang) => {
  cy.task('getLastEmail', { timeout: 60 * 1000 })
    .its('html', { timeout: 60 * 1000 })
    .then((html) => {
      cy.document({ log: false }).invoke({ log: false }, 'write', html);
    });

  if (lang == 'English') {
    cy.get('[data-cy=invite-joinButton]').contains('Join');
    cy.get('[data-cy=invite-joinButton]')
      .invoke('attr', 'href')
      .then((href) => {
        cy.visit(href);
      });
  } else if (lang == 'French') {
    cy.get('[data-cy=invite-joinButton]').contains('Rejoindre');
    cy.get('[data-cy=invite-joinButton]')
      .invoke('attr', 'href')
      .then((href) => {
        cy.visit(href);
      });
  } else if (lang == 'Spanish') {
    cy.get('[data-cy=invite-joinButton]').contains('Unete');
    cy.get('[data-cy=invite-joinButton]')
      .invoke('attr', 'href')
      .then((href) => {
        cy.visit(href);
      });
  } else if (lang == 'Portuguese') {
    cy.get('[data-cy=invite-joinButton]').contains('Junte');
    cy.get('[data-cy=invite-joinButton]')
      .invoke('attr', 'href')
      .then((href) => {
        cy.visit(href);
      });
  }
});
