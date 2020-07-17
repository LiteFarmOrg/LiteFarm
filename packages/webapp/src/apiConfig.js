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
  URI = 'http://localhost:5000';
} else if (NODE_ENV === 'production') {
  if (REACT_APP_ENV === 'production') {
    URI = 'https://litefarm-api-production.herokuapp.com';
  } else if (REACT_APP_ENV === 'integration') {
    URI = 'https://litefarm-api-integration.herokuapp.com';
  }
}

const apiConfig = {
  userUrl: `${URI}/user`,
  pseudoUserUrl: `${URI}/user/pseudo`,
  farm: `${URI}/farm`,
  createUserUrl: `${URI}/create_user`,
  fieldURL: `${URI}/field`,
  cropURL: `${URI}/crop`,
  logURL: `${URI}/log`,
  fertUrl: `${URI}/fertilizer`,
  fieldCropURL: `${URI}/field_crop`,
  pesticideUrl: `${URI}/pesticide`,
  diseaseUrl: `${URI}/disease`,
  taskTypeUrl: `${URI}/task_type`,
  shiftUrl: `${URI}/shift`,
  priceURL: `${URI}/price`,
  yieldURL: `${URI}/yield`,
  insightUrl: `${URI}/insight`,
  salesURL: URI + '/sale',
  cropSalesURL: URI + '/crop_sale',
  farmShiftUrl: URI + '/shift/farm/',
  expenseUrl: URI + '/expense',
  expenseTypeDefaultUrl: URI + '/expense/expense_type/default',
  contactURL: URI + '/contact',
  farmDataUrl: URI + '/farmdata',
  userFarmUrl: `${URI}/user_farm`,
  weatherAPIKey: process.env.REACT_APP_WEATHER_API_KEY,
  userFarm: URI + '/user_farm',
  rolesUrl: URI + '/roles',
  signUpUrl: `${URI}/sign_up`,
};

module.exports = apiConfig;
