/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (reducer.js) is part of LiteFarm.
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

import {
  SET_CROPS_SOLD_NUTRITION,
  SET_SOLD_OM_DATA,
  SET_LABOUR_HAPPINESS_DATA,
  SET_BIODIVERSITY_DATA,
  SET_PRICES_DATA,
  SET_PRICES_DISTANCE,
  SET_WATER_BALANCE_DATA,
  SET_NITROGEN_BALANCE_DATA,
  SET_FREQUENCY_NITROGEN_BALANCE,
  SET_FREQUENCY_WATER_BALANCE,
} from './constants';

const initialState = {
  cropNutritionData: { preview: 0, data: [] },
  soilOMData: { preview: 0, data: [] },
  labourHappinessData: { preview: 0, data: [] },
  biodiversityData: { preview: 0, data: [] },
  pricesData: { preview: 0, amountOfFarms: 0, data: [] },
  waterBalanceData: { preview: 0, data: [] },
  waterBalanceSchedule: {},
  nitrogenBalanceData: { preview: 0, data: [] },
  nitrogenFrequencyData: {},
  pricesDistance: 5,
};

function insightReducer(state = initialState, action) {
  switch (action.type) {
    case SET_CROPS_SOLD_NUTRITION:
      return Object.assign({}, state, {
        cropNutritionData: action.cropNutritionData,
      });

    case SET_SOLD_OM_DATA:
      return Object.assign({}, state, {
        soilOMData: action.soilOMData,
      });

    case SET_LABOUR_HAPPINESS_DATA:
      return Object.assign({}, state, {
        labourHappinessData: action.labourHappinessData,
      });

    case SET_BIODIVERSITY_DATA:
      return Object.assign({}, state, {
        biodiversityData: action.biodiversityData,
      });

    case SET_PRICES_DATA:
      return Object.assign({}, state, {
        pricesData: action.pricesData,
      });
    case SET_WATER_BALANCE_DATA:
      return Object.assign({}, state, {
        waterBalanceData: action.waterBalanceData,
      });
    case SET_FREQUENCY_WATER_BALANCE:
      return Object.assign({}, state, {
        waterBalanceSchedule: action.waterBalanceSchedule,
      });
    case SET_NITROGEN_BALANCE_DATA:
      return Object.assign({}, state, {
        nitrogenBalanceData: action.nitrogenBalanceData,
      });
    case SET_FREQUENCY_NITROGEN_BALANCE:
      return Object.assign({}, state, {
        nitrogenFrequencyData: action.data,
      });
    case SET_PRICES_DISTANCE:
      return Object.assign({}, state, {
        pricesDistance: action.distance,
      });
    default:
      return state;
  }
}

export default insightReducer;
