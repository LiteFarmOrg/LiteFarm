/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
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

import { CREATE_FARM, SET_ROLE } from "./constants";
import { getFarms } from '../ChooseFarm/actions';
import history from '../../history';
import { takeEvery, call, put } from 'redux-saga/effects';
import apiConfig from '../../apiConfig';
import {toastr} from "react-redux-toastr";
import { setFarmInState } from "../actions";
const axios = require('axios');

export function* createFarm(payload) {
  const { farmInfo } = payload;
  const { farm } = apiConfig;

  const addFarmHeader = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
    },
  };

  let addFarmData = {
    farm_name: farmInfo.farmName,
    address: farmInfo.address,
    grid_points: farmInfo.gridPoints,
    country: farmInfo.country
  };

  try {
    const addFarmResult = yield call(axios.post, farm, addFarmData, addFarmHeader);
    if (addFarmResult.data && addFarmResult.data.farm_id) {
      localStorage.setItem('farm_id', addFarmResult.data.farm_id);

      // redirect to next step (select role)
      history.push('/role_selection')
    }
  } catch(e) {
    console.error(e);
    toastr.error('Failed to add farm, please contact litefarm for assistance');
  }
}

export function* setRole(payload) {

}

// export function* addFarm(payload) {
//   let farm_config = payload.farm_config;
//   const { farm } = apiConfig;

//   const addFarmHeader = {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
//       user_id: localStorage.getItem('user_id'),
//     },
//   };

//   let addFarmData = {
//     farm_name: farm_config.farm_name,
//     address: farm_config.address,
//     grid_points: farm_config.gridPoints,
//     units: {
//       currency: farm_config.currency.value,
//       date_format: farm_config.date.value,
//       measurement: farm_config.unit.value,
//     },
//     sandbox_bool: farm_config.sandbox,
//   };

//   try {
//     const addFarmResult = yield call(axios.post, farm, addFarmData, addFarmHeader);
//     if (addFarmResult.data && addFarmResult.data.farm_id) {
//       localStorage.setItem('farm_id', addFarmResult.data.farm_id);

//       const user_id = localStorage.getItem('user_id');
//       const farm_id = addFarmResult.data.farm_id;
//       const updateRoleHeader = {
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
//           user_id,
//           farm_id,
//         },
//       };
//       const { role } = payload;
//       const updateUserRoleData = { role };

//       const updateUserRoleResult = yield call(
//         axios.patch, `${apiConfig.userFarmUrl}/role/farm/${farm_id}/user/${user_id}`,
//         updateUserRoleData,
//         updateRoleHeader,
//       );

//       if (updateUserRoleResult.status >= 200) {
//         yield put(getFarms());
//         yield put(setFarmInState(addFarmResult.data))
//         history.push('/consent')
//       }
//     }
//   } catch(e) {
//     console.error(e);
//     toastr.error('Failed to add farm, please contact litefarm for assistance');
//   }
// }

export default function* addFarmSaga() {
  yield takeEvery(CREATE_FARM, createFarm);
  yield takeEvery(SET_ROLE, setRole);
}
