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
  DELETE_FIELD,
  DELETE_FIELD_CROP,
  GET_CROPS,
  GET_EXPIRED_CROPS,
  GET_PRICE,
  GET_YIELD,
  SET_CROPS_IN_STATE,
  SET_EXPIRED_CROPS_IN_STATE,
  SET_PRICE_IN_STATE,
  SET_YIELD_IN_STATE,
} from './constants';

export const getCrops = () => {
  return {
    type: GET_CROPS,
  }
};

export const getExpiredCrops = () => {
  return {
    type: GET_EXPIRED_CROPS,
  }
};

export const getPrices = () => {
  return {
    type: GET_PRICE
  }
};

export const getYield = () => {
  return {
    type: GET_YIELD
  }
};

export const setCropsInState = (crops) => {
  return {
    type: SET_CROPS_IN_STATE,
    crops
  }
};

export const setExpiredCropsInState = (expiredCrops) => {
  return {
    type: SET_EXPIRED_CROPS_IN_STATE,
    expiredCrops
  }
};

export const deleteFieldCrop = (fieldCropId, fieldId) => {
  return {
    type: DELETE_FIELD_CROP,
    fieldCropId,
    fieldId,
  }
};

export const setYieldInState = (yieldData) => {
  return {
    type: SET_YIELD_IN_STATE,
    yieldData,
  }
};

export const setPriceInState = (price) => {
  return {
    type: SET_PRICE_IN_STATE,
    price,
  }
};

export const deleteField = (fieldId) => {
  return {
    type: DELETE_FIELD,
    fieldId,
  }
};