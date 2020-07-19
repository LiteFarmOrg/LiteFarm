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
  GET_USER_INFO,
  SET_USER_IN_STATE,
  UPDATE_USER_INFO,
  SET_FARM_IN_STATE,
  GET_FARM_INFO,
  UPDATE_FARM,
  GET_FIELDS,
  GET_FIELD_CROPS,
  GET_FIELD_CROPS_BY_DATE,
  SET_FIELD_CROPS_IN_STATE,
  SET_FIELDS_IN_STATE,
  UPDATE_AGREEMENT,
} from "./constants";

export const getUserInfo = (loadFromHome=false) => {
  return {
    type: GET_USER_INFO,
    loadFromHome
  }
};

export const fetchFarmInfo = () => {
  const farm_id = localStorage.getItem('farm_id');
  return {
    type: GET_FARM_INFO,
    farm_id
  }
};


export const updateFarm = (farm) => {
  return {
    type: UPDATE_FARM,
    farm
  }
};

export const setUserInState = (users) => {
  return {
    type: SET_USER_IN_STATE,
    users
  }
};


export const updateUserInfo = (user) => {
  return {
    type: UPDATE_USER_INFO,
    user
  }
};

export const setFarmInState = (farm) => {
  return {
    type: SET_FARM_IN_STATE,
    farm
  }
};


export const getFields = () => {
  return {
    type: GET_FIELDS,
  }
};

export const getFieldCrops = () => {
  return {
    type: GET_FIELD_CROPS,
  }
};

export const getFieldCropsByDate = () => {
  return {
    type: GET_FIELD_CROPS_BY_DATE,
  }
};


export const setFieldsInState = (fields) => {
  return {
    type: SET_FIELDS_IN_STATE,
    fields
  }
};

export const setFieldCropsInState = (fieldCrops) => {
  return {
    type: SET_FIELD_CROPS_IN_STATE,
    fieldCrops
  }
};

export const updateAgreement = (consent_bool, consent_version) => {
  return {
    type: UPDATE_AGREEMENT, 
    consent_bool: consent_bool,
    consent_version,
  }
};