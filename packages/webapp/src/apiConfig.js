/*
 *  Copyright 2019-2024 LiteFarm.org
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

let URI;
const VITE_ENV = import.meta.env.VITE_ENV || 'development';
const VITE_NGROK_API = import.meta.env.VITE_NGROK_API;
const ENV = import.meta.env;
// handling ngrok
const hostNameSplit = window.location.host.split('.');
if (VITE_NGROK_API && hostNameSplit && hostNameSplit.length > 1 && hostNameSplit[1] === 'ngrok') {
  URI = VITE_NGROK_API;
} else if (import.meta.env.VITE_API_URL?.length) {
  URI = import.meta.env.VITE_API_URL;
} else {
  if (VITE_ENV === 'development') {
    URI = window.location.href.replace(/3000.*/, '5000');
  } else if (VITE_ENV === 'production') {
    URI = 'https://api.app.litefarm.org';
  } else if (VITE_ENV === 'integration') {
    URI = 'https://api.beta.litefarm.org';
  }
}

export const userUrl = `${URI}/user`;
export const pseudoUserUrl = `${URI}/user/pseudo`;
export const farmUrl = `${URI}/farm`;
export const inviteUserUrl = `${URI}/user/invite`;
//export const fieldURL = `${URI}/field`;
export const locationURL = `${URI}/location`;
export const cropURL = `${URI}/crop`;
export const cropVarietyURL = `${URI}/crop_variety`;
export const logURL = `${URI}/log`;
//export const fertUrl = `${URI}/fertilizer`;
export const managementPlanURL = `${URI}/management_plan`;
//export const pesticideUrl = `${URI}/pesticide`;
//export const diseaseUrl = `${URI}/disease`;
export const taskTypeUrl = `${URI}/task_type`;
//export const priceURL = `${URI}/price`;
//export const yieldURL = `${URI}/yield`;
export const insightUrl = `${URI}/insight`;
export const documentUrl = `${URI}/document`;
export const salesURL = URI + '/sale';
//export const cropSalesURL = URI + '/crop_sale';
export const expenseUrl = URI + '/expense';
export const expenseTypeUrl = `${URI}/expense_type`;
export const revenueTypeUrl = URI + '/revenue_type';
export const financeReportUrl = URI + '/export/finances';
//export const contactURL = URI + '/contact';
//export const farmDataUrl = URI + '/farmdata';
export const userFarmUrl = `${URI}/user_farm`;
export const weatherAPIKey = import.meta.env.VITE_WEATHER_API_KEY;
// export const   userFarm = URI + '/user_farm';
export const rolesUrl = URI + '/roles';
//export const signUpUrl = `${URI}/sign_up`;
export const loginUrl = `${URI}/login`;
export const resetPasswordUrl = `${URI}/password_reset`;
export const spotlightUrl = `${URI}/showed_spotlight`;
export const releaseBadgeUrl = `${URI}/release_badge`;
export const taskUrl = `${URI}/task`;
export const productsUrl = `${URI}/product`;
export const alertsUrl = `${URI}/notification_user/subscribe`;
export const notificationsUrl = `${URI}/notification_user`;
export const clearAlertsUrl = `${URI}/notification_user/clear_alerts`;
export const sensorUrl = `${URI}/sensor`;
export const animalsUrl = `${URI}/animals`;
export const animalBatchesUrl = `${URI}/animal_batches`;
export const customAnimalBreedsUrl = `${URI}/custom_animal_breeds`;
export const customAnimalTypesUrl = `${URI}/custom_animal_types`;
export const defaultAnimalBreedsUrl = `${URI}/default_animal_breeds`;
export const defaultAnimalTypesUrl = `${URI}/default_animal_types`;
export const animalSexesUrl = `${URI}/animal_sexes`;
export const animalIdentifierTypesUrl = `${URI}/animal_identifier_types`;
export const animalIdentifierColorsUrl = `${URI}/animal_identifier_colors`;
export const animalMovementPurposesUrl = `${URI}/animal_movement_purposes`;
export const animalOriginsUrl = `${URI}/animal_origins`;
export const animalUsesUrl = `${URI}/animal_uses`;
export const animalRemovalReasonsUrl = `${URI}/animal_removal_reasons`;
export const soilAmendmentMethodsUrl = `${URI}/soil_amendment_methods`;
export const soilAmendmentPurposesUrl = `${URI}/soil_amendment_purposes`;
export const soilAmendmentFertiliserTypesUrl = `${URI}/soil_amendment_fertiliser_types`;
export const productUrl = `${URI}/product`;

export const url = URI;

export default {
  userUrl,
  pseudoUserUrl,
  farmUrl,
  inviteUserUrl,
  //fieldURL,
  locationURL,
  cropURL,
  cropVarietyURL,
  logURL,
  //fertUrl,
  managementPlanURL,
  //pesticideUrl,
  //diseaseUrl,
  taskTypeUrl,
  //priceURL,
  //yieldURL,
  insightUrl,
  documentUrl,
  salesURL,
  //cropSalesURL,
  expenseUrl,
  expenseTypeUrl,
  revenueTypeUrl,
  financeReportUrl,
  //contactURL,
  //farmDataUrl,
  userFarmUrl,
  weatherAPIKey,
  // userFarm,
  rolesUrl,
  //signUpUrl,
  loginUrl,
  resetPasswordUrl,
  spotlightUrl,
  releaseBadgeUrl,
  taskUrl,
  productsUrl,
  alertsUrl,
  notificationsUrl,
  sensorUrl,
  animalsUrl,
  animalBatchesUrl,
  customAnimalBreedsUrl,
  customAnimalTypesUrl,
  defaultAnimalBreedsUrl,
  defaultAnimalTypesUrl,
  animalSexesUrl,
  animalIdentifierTypesUrl,
  animalIdentifierColorsUrl,
  animalMovementPurposesUrl,
  animalOriginsUrl,
  animalUsesUrl,
  animalRemovalReasonsUrl,
  soilAmendmentMethodsUrl,
  soilAmendmentPurposesUrl,
  soilAmendmentFertiliserTypesUrl,
  productUrl,
  url,
};
