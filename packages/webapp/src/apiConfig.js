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
const VITE_ENV = import.meta.env.VITE_ENV || 'development';

if (VITE_ENV === 'development') {
  URI = window.location.href.replace(/3000.*/, '5000');
} else if (VITE_ENV === 'production') {
  URI = 'https://api.app.litefarm.org';
} else if (VITE_ENV === 'integration') {
  URI = 'https://api.beta.litefarm.org';
}

export default {
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
  weatherAPIKey: import.meta.env.VITE_WEATHER_API_KEY,
  // userFarm: URI + '/user_farm',
  rolesUrl: URI + '/roles',
  signUpUrl: `${URI}/sign_up`,
  loginUrl: `${URI}/login`,
  resetPasswordUrl: `${URI}/password_reset`,
  spotlightUrl: `${URI}/showed_spotlight`,
  taskUrl: `${URI}/task`,
  productsUrl: `${URI}/product`,
  url: URI,
};

export const userUrl = `${URI}/user`;
export const pseudoUserUrl = `${URI}/user/pseudo`;
export const farmUrl = `${URI}/farm`;
export const inviteUserUrl = `${URI}/user/invite`;
export const fieldURL = `${URI}/field`;
export const locationURL = `${URI}/location`;
export const cropURL = `${URI}/crop`;
export const cropVarietyURL = `${URI}/crop_variety`;
export const logURL = `${URI}/log`;
export const fertUrl = `${URI}/fertilizer`;
export const managementPlanURL = `${URI}/management_plan`;
export const pesticideUrl = `${URI}/pesticide`;
export const diseaseUrl = `${URI}/disease`;
export const taskTypeUrl = `${URI}/task_type`;
export const shiftUrl = `${URI}/shift`;
export const priceURL = `${URI}/price`;
export const yieldURL = `${URI}/yield`;
export const insightUrl = `${URI}/insight`;
export const documentUrl = `${URI}/document`;
export const salesURL = URI + '/sale';
export const cropSalesURL = URI + '/crop_sale';
export const farmShiftUrl = URI + '/shift/farm/';
export const expenseUrl = URI + '/expense';
export const expenseTypeDefaultUrl = URI + '/expense_type';
export const contactURL = URI + '/contact';
export const farmDataUrl = URI + '/farmdata';
export const userFarmUrl = `${URI}/user_farm`;
export const weatherAPIKey = import.meta.env.VITE_WEATHER_API_KEY;
// export const   userFarm = URI + '/user_farm';
export const rolesUrl = URI + '/roles';
export const signUpUrl = `${URI}/sign_up`;
export const loginUrl = `${URI}/login`;
export const resetPasswordUrl = `${URI}/password_reset`;
export const spotlightUrl = `${URI}/showed_spotlight`;
export const taskUrl = `${URI}/task`;
export const productsUrl = `${URI}/product`;
export const url = URI;
