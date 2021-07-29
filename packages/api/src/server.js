/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (server.js) is part of LiteFarm.
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

const waterBalanceScheduler = require('./jobs/waterBalance/waterBalance');
const nitrogenBalanceScheduler = require('./jobs/nitrogenBalance/nitrogenBalance');
// const farmDataScheduler = require('./jobs/sendFarmData/sendFarmData');
const userLogRoute = require('./routes/userLogRoute');
const supportTicketRoute = require('./routes/supportTicketRoute');
const exportRoute = require('./routes/exportRoute');
const farmTokenRoute = require('./routes/farmTokenRoute');
const documentRoute = require('./routes/documentRoute');

// register API
const router = promiseRouter();

app.get('/', (req, res) => {
  res.sendStatus(200);
});

app.use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))

  // prevent CORS errors
  .use(cors())
  .use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
      return res.status(200).json({});
    } else if ((req.method === 'DELETE' || req.method === 'GET') && Object.keys(req.body).length > 0) {
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

  // handle errors
  .use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
  })

  .use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
      error: {
        message: error.message,
      },
    });
  });

const port = process.env.PORT || 5000;
if (environment === 'development' || environment === 'production' || environment === 'integration') {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log('LiteFarm Backend listening on port ' + port + '!');
  });
  waterBalanceScheduler.registerHourlyJob();
  waterBalanceScheduler.registerDailyJob();

  nitrogenBalanceScheduler.registerDailyJob();

  // farmDataScheduler.registerJob();
  // eslint-disable-next-line no-console
  console.log('LiteFarm Water Balance Scheduler Enabled');
}

app.on('close', () => {
  knex.destroy();
});

module.exports = app;
