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

      window.localStorage.setItem('id_token', userItem.token)

      
      
      
    });
  });
});

Cypress.Commands.add('waitForGoogleApi', () => {
  let mapWaitCount = 0
  const mapWaitMax = 5

  cyMapLoad()

  function cyMapLoad() {
    mapWaitCount++

    cy.window().then(win => {
      if (typeof win.google != 'undefined') {
        console.log(`Done at attempt #${mapWaitCount}:`, win)
        return true
      } else if (mapWaitCount <= mapWaitMax) {
        console.log('Waiting attempt #' + mapWaitCount) // just log
        cy.wait(2000)
        cyMapLoad()
      } else if (mapWaitCount > mapWaitMax) {
        console.log('Failed to load google api')
        return false
      }
    })
  }
});
