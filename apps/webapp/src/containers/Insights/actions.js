/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import {
  GET_SOLD_OM_DATA,
  SET_SOLD_OM_DATA,
  GET_LABOUR_HAPPINESS_DATA,
  SET_LABOUR_HAPPINESS_DATA,
  GET_BIODIVERSITY_DATA,
  SET_BIODIVERSITY_DATA,
  GET_PRICES_DATA,
  SET_PRICES_DATA,
  SET_PRICES_DISTANCE,
  GET_PRICES_WITH_DISTANCE_DATA,
  GET_BIODIVERSITY_LOADING,
  SET_BIODIVERSITY_LOADING,
  GET_BIODIVERSITY_ERROR,
  SET_BIODIVERSITY_ERROR,
} from './constants';

export const getSoilOMData = () => {
  return {
    type: GET_SOLD_OM_DATA,
  };
};

export const setSoilOMData = (soilOMData) => {
  return {
    type: SET_SOLD_OM_DATA,
    soilOMData,
  };
};

export const getLabourHappinessData = () => {
  return {
    type: GET_LABOUR_HAPPINESS_DATA,
  };
};

export const setLabourHappinessData = (labourHappinessData) => {
  return {
    type: SET_LABOUR_HAPPINESS_DATA,
    labourHappinessData,
  };
};

export const getBiodiversityData = () => {
  return {
    type: GET_BIODIVERSITY_DATA,
  };
};

export const setBiodiversityData = (biodiversityData) => {
  return {
    type: SET_BIODIVERSITY_DATA,
    biodiversityData: {
      ...biodiversityData,
      timeFetched: Date.now(),
    },
  };
};

export const getBiodiversityLoading = () => {
  return {
    type: GET_BIODIVERSITY_LOADING,
  };
};

export const setBiodiversityLoading = (biodiversityLoading) => {
  return {
    type: SET_BIODIVERSITY_LOADING,
    biodiversityLoading,
  };
};

export const getBiodiversityError = () => {
  return {
    type: GET_BIODIVERSITY_ERROR,
  };
};

export const setBiodiversityError = (biodiversityError, timeFailed) => {
  return {
    type: SET_BIODIVERSITY_ERROR,
    biodiversityError,
    timeFailed,
  };
};

export const getPricesData = () => {
  return {
    type: GET_PRICES_DATA,
  };
};

export const getPricesWithDistanceData = (location, distance) => {
  return {
    type: GET_PRICES_WITH_DISTANCE_DATA,
    location,
    distance,
  };
};

export const setPricesData = (pricesData) => {
  return {
    type: SET_PRICES_DATA,
    pricesData,
  };
};

export const setPricesDistance = (distance) => {
  return {
    type: SET_PRICES_DISTANCE,
    distance,
  };
};
