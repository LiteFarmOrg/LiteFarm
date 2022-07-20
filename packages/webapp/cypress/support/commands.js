import 'cypress-react-selector';
import { getDateInputFormat } from '../../src/util/moment';

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

Cypress.Commands.add('insights', () => {
  cy.get('._infoTextLine_avdgi_23').should('exist');
});
//<div class=" css-14sfozv-menu" id="react-select-3-listbox"><div class=" css-1plh46m-MenuList2"><div class=" css-19hntng-option" aria-disabled="false" id="react-select-3-option-0" tabindex="-1">Test Worker</div><div class=" css-1n3x1m8-option" aria-disabled="false" id="react-select-3-option-1" tabindex="-1">Unassigned</div></div></div>
Cypress.Commands.add('createTask', () => {
  //Create an unassigned cleaning task due tomorrow
  cy.contains('Create').should('exist').and('not.be.disabled').click({ force: true });
  cy.contains('Clean').should('exist').and('not.be.disabled').click({ force: true });

  const date = new Date();
  date.setDate(date.getDate() + 1);
  const dueDate = getDateInputFormat(date);

  cy.get('[data-cy=addTask-taskDate]').should('exist').type(dueDate);

  cy.get('[data-cy=addTask-continue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.wait(2000);
  cy.get('[data-cy=map-selectLocation]').click(540, 201, {
    force: false,
  });
  cy.get('[data-cy=addTask-locationContinue]')
    .should('exist')
    .and('not.be.disabled')
    .click({ force: true });
  cy.get('[data-cy=addTask-cropsContinue]')
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
  cy.get('[data-cy=map-selectLocation]').click(540, 201, {
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
  cy.get('[data-cy=map-selectLocation]').click(540, 201, {
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
  cy.contains('Continue').should('exist').and('be.enabled').click();
});

Cypress.Commands.add('inviteNewUser', (email, fullName, gender, language, birthYear, password) => {
  //cy.contains('Create new user account').should('exist');
  cy.get('[data-cy=createUser-email]').should('eq', email);
  cy.get('[data-cy=createUser-fullName]').type(fullName);
  cy.get('[data-cy=createUser-password]').type(password);
  cy.contains('Create Account').should('exist').and('be.enabled').click();
});
