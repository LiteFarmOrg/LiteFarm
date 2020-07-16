/* 
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>   
 *  This file (actions.js) is part of LiteFarm.
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
  GET_CROPS_SOLD_NUTRITION,
  SET_CROPS_SOLD_NUTRITION,
  GET_SOLD_OM_DATA,
  SET_SOLD_OM_DATA,
  GET_LABOUR_HAPPINESS_DATA,
  SET_LABOUR_HAPPINESS_DATA,
  GET_BIODIVERSITY_DATA,
  SET_BIODIVERSITY_DATA,
  GET_PRICES_DATA,
  SET_PRICES_DATA,
  GET_WATER_BALANCE_DATA,
  SET_WATER_BALANCE_DATA,
  SET_NITROGEN_BALANCE_DATA,
  GET_NITROGEN_BALANCE_DATA,
  CREATE_FREQUENCY_NITROGEN_BALANCE,
  GET_FREQUENCY_NITROGEN_BALANCE,
  SET_FREQUENCY_NITROGEN_BALANCE,
  DEL_FREQUENCY_NITROGEN_BALANCE,
  SET_PRICES_DISTANCE,
  GET_PRICES_WITH_DISTANCE_DATA,
  GET_FREQUENCY_WATER_BALANCE,
  SET_FREQUENCY_WATER_BALANCE,
  CREATE_FREQUENCY_WATER_BALANCE,
} from "./constants";

export const getCropsSoldNutrition = () => {
  return {
    type: GET_CROPS_SOLD_NUTRITION
  }
};

export const setCropsSoldNutritionInState = (cropNutritionData) => {
  return {
    type: SET_CROPS_SOLD_NUTRITION,
    cropNutritionData
  }
};

export const getSoilOMData = () => {
  return {
    type: GET_SOLD_OM_DATA
  }
};

export const setSoilOMData = (soilOMData) => {
  return {
    type: SET_SOLD_OM_DATA,
    soilOMData
  }
};

export const getLabourHappinessData = () => {
  return {
    type: GET_LABOUR_HAPPINESS_DATA
  }
};

export const setLabourHappinessData = (labourHappinessData) => {
  return {
    type: SET_LABOUR_HAPPINESS_DATA,
    labourHappinessData
  }
};

export const getBiodiversityData = () => {
  return {
    type: GET_BIODIVERSITY_DATA
  }
};

export const setBiodiversityData = (biodiversityData) => {
  return {
    type: SET_BIODIVERSITY_DATA,
    biodiversityData
  }
};

export const getPricesData = () => {
  return {
    type: GET_PRICES_DATA
  }
};

export const getPricesWithDistanceData = (location, distance) => {
  return {
    type: GET_PRICES_WITH_DISTANCE_DATA,
    location,
    distance,
  }
};

export const setPricesData = (pricesData) => {
  return {
    type: SET_PRICES_DATA,
    pricesData
  }
};

export const setPricesDistance = (distance) => {
  return {
    type: SET_PRICES_DISTANCE,
    distance
  }
};

export const getWaterBalanceData = () => {
  return {
    type: GET_WATER_BALANCE_DATA,
  }
};

export const setWaterBalanceData = (waterBalanceData) => {
  return {
    type: SET_WATER_BALANCE_DATA,
    waterBalanceData,
  }
};

export const getWaterBalanceSchedule = () => {
  return {
    type: GET_FREQUENCY_WATER_BALANCE,
  }
};

export const setWaterBalanceSchedule = (waterBalanceSchedule) => {
  return {
    type: SET_FREQUENCY_WATER_BALANCE,
    waterBalanceSchedule,
  }
};

export const createWaterBalanceSchedule = () => {
  return {
    type: CREATE_FREQUENCY_WATER_BALANCE
  }
};

export const getNitrogenBalanceData = () => {
  return {
    type: GET_NITROGEN_BALANCE_DATA,
  }
};

export const setNitrogenBalanceData = (nitrogenBalanceData) => {
  return {
    type: SET_NITROGEN_BALANCE_DATA,
    nitrogenBalanceData,
  }
};

export const getFrequencyNitrogenBalance = () => {
  return {
    type: GET_FREQUENCY_NITROGEN_BALANCE,
  }
};

export const setFrequencyNitrogenBalance = (data) => {
  return {
    type: SET_FREQUENCY_NITROGEN_BALANCE,
    data,
  }
};

export const createFrequencyNitrogenBalance = (nitrogenFrequency) => {
  return {
    type: CREATE_FREQUENCY_NITROGEN_BALANCE,
    nitrogenFrequency,
  }
};

export const delFrequencyNitrogenBalance = (nitrogenBalanceID) => {
  return {
    type: DEL_FREQUENCY_NITROGEN_BALANCE,
    nitrogenBalanceID,
  }
};
