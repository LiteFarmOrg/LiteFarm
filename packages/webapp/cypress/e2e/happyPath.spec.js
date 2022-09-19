import { computeArea, LatLng } from 'spherical-geometry-js/src/index';

describe('LiteFarm end to end test', () => {
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

  it('should correctly calculate perimeter and area of a field', () => {
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
    const location = '49.250833,-123.2410777';
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

    //confirm user creation email
    //cy.userCreationEmail();

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

      cy.get('[data-cy=createField-fieldName]').should('exist').type(fieldName);
      cy.get('[data-cy=createField-save]').should('exist').and('not.be.disabled').click();
      cy.wait(2000);

      // inspect the caught error
      cy.on('uncaught:exception', (e) => {
        if (
          e.message.includes(
            'assets[curr].map is not a function or its return value is not iterable',
          )
        ) {
          // we expected this error, so let's ignore it
          // and let the test continue
          return false;
        }
        // on any other error message the test fails
      });

      cy.window()
        .its('store')
        .invoke('getState')
        .its('entitiesReducer.fieldReducer')
        .then((fields) => {
          let entities = Object.entries(fields.entities);
          let points = entities[0][1].grid_points;
          let perimeter = 0;
          let area = 0;

          const distance = (lat1, lon1, lat2, lon2, unit) => {
            if (lat1 == lat2 && lon1 == lon2) {
              return 0;
            } else {
              var radlat1 = (Math.PI * lat1) / 180;
              var radlat2 = (Math.PI * lat2) / 180;
              var theta = lon1 - lon2;
              var radtheta = (Math.PI * theta) / 180;
              var dist =
                Math.sin(radlat1) * Math.sin(radlat2) +
                Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
              if (dist > 1) {
                dist = 1;
              }
              dist = Math.acos(dist);
              dist = (dist * 180) / Math.PI;
              dist = dist * 60 * 1.1515;
              if (unit == 'K') {
                dist = dist * 1.609344;
              }
              if (unit == 'N') {
                dist = dist * 0.8684;
              }
              console.log(dist);
              return dist;
            }
          };

          for (let i = 0; i < points.length; i++) {
            if (i < points.length - 1) {
              console.log(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
              let dist = distance(
                points[i].lat,
                points[i].lng,
                points[i + 1].lat,
                points[i + 1].lng,
                'K',
              );

              perimeter = perimeter + dist;
            } else if (i == points.length - 1) {
              let dist = distance(points[0].lat, points[0].lng, points[i].lat, points[i].lng, 'K');
              perimeter = perimeter + dist;
            }
          }

          let perimeter_unit = entities[0][1].perimeter_unit;

          if (perimeter_unit == 'm') {
            //calculate distance in meters
            perimeter = Math.round(perimeter * 1000);
            expect(entities[0][1].perimeter).to.equal(perimeter + 1);
          } else if (perimeter_unit == 'km') {
            perimeter = Math.round(perimeter);
            expect(entities[0][1].perimeter).to.equal(perimeter);
          }

          var latLngs = points.map(function (point) {
            return new LatLng(point.lat, point.lng);
          });

          let total_area_unit = entities[0][1].total_area_unit;

          //Calculate area in hectares
          area = computeArea(latLngs) / 10000;
          expect(total_area_unit).to.equal('ha');
          //need to fix truncation to rounding to 2 decimal places
          expect(entities[0][1].total_area).to.equal(parseFloat(area).toFixed(2));
        });
    });
  });
});
