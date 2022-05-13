const chai = require('chai');
const { userFarmFactory } = require('./mock.factories');
const server = require('./../src/server');
const knex = require('../src/util/knex');
const { tableCleanup } = require('./testEnvironment');
jest.mock('jsdom');
jest.mock('../src/middleware/acl/checkJwt');

describe('Time Based Notification Tests', () => {
  let middleware;

  /* TODO: this authentication will change since we don't want users to access
    these endpoints. So this will need to be changed accordingly. */
  // Set up jwt authentication
  beforeEach(() => {
    middleware = require('../src/middleware/acl/checkJwt');
    middleware.mockImplementation((req, res, next) => {
      req.user = {};
      req.user.user_id = req.get('user_id');
      next();
    });
  });

  // Clean up after test finishes
  afterAll(async (done) => {
    await tableCleanup(knex);
    await knex.destroy();
    done();
  });

  describe('Unassigned Tasks Due This Week Notification Test', () => {
    describe('Notification Sent To All Valid Recipients Tests', () => {
      beforeEach(() => {
        // Set up such that there are unassigned tasks due within the next week
        userFarmFactory();
      });

      test('Farm Owners Should Receive Notification', () => {});

      test('Farm Managers Should Receive Notification', () => {});

      test('Extension Officers Should Receive Notification', () => {});

      test('Farm Worker Should Not Receive Notification', () => {});

      test('Farm Worker Should Not Receive Notification', () => {});

      test('Farm Manager at a Different Farm Should Not Receive Notification', () => {});
    });
    describe('Notification Only Sent Under Correct Conditions Tests', () => {
      test('Not Sent When There Are No Unassigned Tasks', () => {});

      test('Not Sent When The Only Unassigned Tasks Are Due Later Then 7 Days', () => {});

      test('Sent When There Are Unassigned Tasks Due Within The Next 7 days', () => {});
    });
  });
});
