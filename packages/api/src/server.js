/*
 *  Copyright 2019-2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const environment = process.env.NODE_ENV || 'development';
let expressOasGenerator;

/*
 When the env var is defined (any value), the OpenAPI files will be overwritten.
 They are generated from an analysis of the code and from network traffic handled by the API.
 Run the Cypress tests to generate API calls that populate documentation examples.
 (Jest tests don't do as much because they mock network requests.)

 For fuller documentation, we need to refactor all middleware and route handlers to call next().
 See https://github.com/mpashkovskiy/express-oas-generator#troubleshooting

 Documentation is always publicly available on this server at /api-docs
 */
if (process.env.GENERATE_OAS) {
  expressOasGenerator = require('express-oas-generator');
  const tags = [
    'contact',
    'crop',
    'disease',
    'document',
    'expense',
    'farm',
    'fertilizer',
    'field',
    'fieldCrop',
    'insight',
    'location',
    'log',
    'management_plan',
    'notification',
    'organic_certifier_survey',
    'password',
    'pesticide',
    'price',
    'product',
    'roles',
    'sale',
    'sensors',
    'shift',
    'signup',
    'spotlight',
    'support',
    'task',
    'task_type',
    'user',
    'userFarm',
    'userFarmData',
    'yield',
  ];

  // This activates some middleware that should come first.
  expressOasGenerator.handleResponses(app, {
    tags,
    specOutputPath: './oas.json',
    alwaysServeDocs: true,
  });
}
const promiseRouter = require('express-promise-router');
const { Model } = require('objection');
const checkJwt = require('./middleware/acl/checkJwt');
const cors = require('cors');

// initialize knex
const knex = require('./util/knex');

// bind all models to a knex instance
Model.knex(knex);

// import routes
const loginRoutes = require('./routes/loginRoute');
const cropRoutes = require('./routes/cropRoute');
const cropVarietyRoutes = require('./routes/cropVarietyRoute');
const fieldRoutes = require('./routes/fieldRoute');
const saleRoutes = require('./routes/saleRoute');
const taskTypeRoutes = require('./routes/taskTypeRoute');
const userRoutes = require('./routes/userRoute');
const farmExpenseRoute = require('./routes/farmExpenseRoute');
const farmExpenseTypeRoute = require('./routes/farmExpenseTypeRoute');
const farmRoutes = require('./routes/farmRoute');
const logRoutes = require('./routes/logRoute');
const shiftRoutes = require('./routes/shiftRoute');
const managementPlanRoute = require('./routes/managementPlanRoute');
const fertilizerRoutes = require('./routes/fertilizerRoute');
const diseaseRoutes = require('./routes/diseaseRoute');
const pesticideRoutes = require('./routes/pesticideRoute');
const yieldRoutes = require('./routes/yieldRoute');
const priceRoutes = require('./routes/priceRoute');
const insightRoutes = require('./routes/insightRoute');
const locationRoute = require('./routes/locationRoute');
const userFarmDataRoute = require('./routes/userFarmDataRoute');
const userFarmRoute = require('./routes/userFarmRoute');
const rolesRoutes = require('./routes/rolesRoute');
const organicCertifierSurveyRoutes = require('./routes/organicCertifierSurveyRoute');
const passwordResetRoutes = require('./routes/passwordResetRoute.js');
const showedSpotlightRoutes = require('./routes/showedSpotlightRoute.js');

// const waterBalanceScheduler = require('./jobs/waterBalance/waterBalance');
// const nitrogenBalanceScheduler = require('./jobs/nitrogenBalance/nitrogenBalance');
// const farmDataScheduler = require('./jobs/sendFarmData/sendFarmData');
const userLogRoute = require('./routes/userLogRoute');
const supportTicketRoute = require('./routes/supportTicketRoute');
const exportRoute = require('./routes/exportRoute');
const farmTokenRoute = require('./routes/farmTokenRoute');
const documentRoute = require('./routes/documentRoute');
const taskRoute = require('./routes/taskRoute');
const productRoute = require('./routes/productRoute');
const notificationUserRoute = require('./routes/notificationUserRoute');
const timeNotificationRoute = require('./routes/timeNotificationRoute');
const sensorRoute = require('./routes/sensorRoute');

// register API
const router = promiseRouter();

app.get('/', (req, res) => {
  res.sendStatus(200);
});

/**
 * Configures Express to send custom JSON for specified object keys (database column names).
 * Postgres `date` type fields, which have no time portion, are retrieved as JS Date objects with midnight UTC time.
 * `JSON.stringify` transforms the Date object to '2020-01-15T00:00:00.000Z' which the API transmits to the client.
 * A Pacific time client using local form, '2020-01-14T16:00:00.000-08:00', and ignoring time, ends up with wrong date.
 * To address this, we make stringify produce '2020-01-15T00:00:00.000', the date with midnight of unspecified timezone.
 * Clients treat this as midnight local time, preserving the correct date value.
 * Note that the code will also handle string values with format YYYY-MM-DD or YYYY-MM-DDT00:00:00.000 --
 *   values that do not come from the database, but occur as "literals", if only in test.
 * Strings that are not dates, have non-midnight times, or timezones other than Z are not changed, with a log message--
 *   these unexpected values will likely lead to errors.
 */
app.set('json replacer', (key, value) => {
  // A list of database column names with Postgres type `date`.
  // (Except as bindings for `date` type database columns, avoid these keys in objects sent via JSON/HTTPS.)
  const pgDateTypeFields = [
    'abandon_date',
    'complete_date',
    'due_date',
    'effective_date',
    'germination_date',
    'harvest_date',
    'plant_date',
    'seed_date',
    'shift_date',
    'start_date',
    'termination_date',
    'transition_date',
    'transplant_date',
    'valid_until',
  ];

  if (value && pgDateTypeFields.includes(key)) {
    // Valid values *must* start YYYY-MM-DD. Time portion of midnight *may* be present. Time zone Z *may* be present.
    const validDateTypeValues = /^(\d{4}-[0-1]\d-[0-3]\d)(T00:00:00\.000)?Z?$/;

    const matches = value.match(validDateTypeValues);
    if (matches) return `${matches[1]}T00:00:00.000`; // YYYY-MM-DD with midnight time, no timezone indicator.

    console.log(
      `JSON payload problem: key '${key}' is reserved for db date fields; unexpected value ${value}.`,
    );
  }
  return value;
});

app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

  // prevent CORS errors
  .use(cors())
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
    } else if (
      (req.method === 'DELETE' || req.method === 'GET') &&
      Object.keys(req.body).length > 0
    ) {
      // TODO: Find new bugs caused by this change
      return res.sendStatus(400);
    }
    next();
  })
  .use(router)
  .set('json spaces', 2)
  .use('/login', loginRoutes)
  .use('/password_reset', passwordResetRoutes)
  // ACL middleware
  .use(checkJwt)

  // routes
  .use('/location', locationRoute)
  .use('/userLog', userLogRoute)
  .use('/crop', cropRoutes)
  .use('/crop_variety', cropVarietyRoutes)
  .use('/field', fieldRoutes)
  // .use('/plan', planRoutes)
  .use('/sale', saleRoutes)
  //.use('/shift_task', shiftTaskRoutes)
  .use('/task_type', taskTypeRoutes)
  // .use('/todo', todoRoutes)
  .use('/user', userRoutes)
  .use('/expense', farmExpenseRoute)
  .use('/expense_type', farmExpenseTypeRoute)
  // .use('/notification', notificationRoutes)
  .use('/farm', farmRoutes)
  .use('/log', logRoutes)
  .use('/shift', shiftRoutes)
  // .use('/notification_setting', notificationSettingRoutes)
  .use('/management_plan', managementPlanRoute)
  .use('/fertilizer', fertilizerRoutes)
  .use('/disease', diseaseRoutes)
  .use('/pesticide', pesticideRoutes)
  .use('/yield', yieldRoutes)
  .use('/price', priceRoutes)
  .use('/insight', insightRoutes)
  .use('/farmdata', userFarmDataRoute)
  .use('/user_farm', userFarmRoute)
  .use('/roles', rolesRoutes)
  .use('/organic_certifier_survey', organicCertifierSurveyRoutes)
  .use('/support_ticket', supportTicketRoute)
  .use('/export', exportRoute)
  .use('/showed_spotlight', showedSpotlightRoutes)
  .use('/farm_token', farmTokenRoute)
  .use('/document', documentRoute)
  .use('/task', taskRoute)
  .use('/product', productRoute)
  .use('/notification_user', notificationUserRoute)
  .use('/time_notification', timeNotificationRoute)
  .use('/sensors', sensorRoute)
  // handle errors
  // .use((req, res, next) => {
  //   const error = new Error('Not found');
  //   error.status = 404;
  //   next(error);
  // })

  .use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message,
      },
    });
  });

const port = process.env.PORT || 5000;
if (
  environment === 'development' ||
  environment === 'production' ||
  environment === 'integration'
) {
  app.listen(port, () => {
    if (process.env.GENERATE_OAS) {
      // This activates some middleware that should come last.
      expressOasGenerator.handleRequests();
    }
    // eslint-disable-next-line no-console
    console.log('LiteFarm Backend listening on port ' + port);
  });
  // waterBalanceScheduler.registerHourlyJob();
  // waterBalanceScheduler.registerDailyJob();
  //
  // nitrogenBalanceScheduler.registerDailyJob();

  // farmDataScheduler.registerJob();
  // eslint-disable-next-line no-console
  // console.log('LiteFarm Water Balance Scheduler Enabled');
}

app.on('close', () => {
  knex.destroy();
});

module.exports = app;
