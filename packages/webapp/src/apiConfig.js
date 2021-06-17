/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (apiConfig.js) is part of LiteFarm.
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

let URI;
const NODE_ENV = process.env.NODE_ENV || 'development';
const REACT_APP_ENV = process.env.REACT_APP_ENV || 'development';

if (NODE_ENV === 'development') {
  URI = window.location.href.replace(/3000.*/, '5000');
} else if (NODE_ENV === 'production') {
  if (REACT_APP_ENV === 'production') {
    URI = 'https://api.app.litefarm.org';
  } else if (REACT_APP_ENV === 'integration') {
    URI = 'https://api.beta.litefarm.org';
  }
}

const apiConfig = {
  userUrl: `${URI}/user`,
  pseudoUserUrl: `${URI}/user/pseudo`,
  farmUrl: `${URI}/farm`,
  inviteUserUrl: `${URI}/user/invite`,
  fieldURL: `${URI}/field`,
  locationURL: `${URI}/location`,
  cropURL: `${URI}/crop`,
  cropVarietyURL: `${URI}/crop_variety`,
  logURL: `${URI}/log`,
  fertUrl: `${URI}/fertilizer`,
  managementPlanURL: `${URI}/management_plan`,
  pesticideUrl: `${URI}/pesticide`,
  diseaseUrl: `${URI}/disease`,
  taskTypeUrl: `${URI}/task_type`,
  shiftUrl: `${URI}/shift`,
  priceURL: `${URI}/price`,
  yieldURL: `${URI}/yield`,
  insightUrl: `${URI}/insight`,
  documentUrl: `${URI}/document`,
  salesURL: URI + '/sale',
  cropSalesURL: URI + '/crop_sale',
  farmShiftUrl: URI + '/shift/farm/',
  expenseUrl: URI + '/expense',
  expenseTypeDefaultUrl: URI + '/expense_type',
  contactURL: URI + '/contact',
  farmDataUrl: URI + '/farmdata',
  userFarmUrl: `${URI}/user_farm`,
  weatherAPIKey: process.env.REACT_APP_WEATHER_API_KEY,
  // userFarm: URI + '/user_farm',
  rolesUrl: URI + '/roles',
  signUpUrl: `${URI}/sign_up`,
  loginUrl: `${URI}/login`,
  resetPasswordUrl: `${URI}/password_reset`,
  spotlightUrl: `${URI}/showed_spotlight`,
  url: URI,
};

module.exports = apiConfig;
