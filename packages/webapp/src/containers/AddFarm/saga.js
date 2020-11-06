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

import { POST_FARM, PATCH_ROLE } from './constants';
import history from '../../history';
import { takeEvery, call, put, select } from 'redux-saga/effects';
import { farmUrl, userFarmUrl } from '../../apiConfig';
import { toastr } from 'react-redux-toastr';
import { setFarmInState } from '../actions';
import { farmSelector } from '../selector';

const axios = require('axios');

const patchRoleUrl = (farm_id, user_id) => `${userFarmUrl}/role/farm/${farm_id}/user/${user_id}`
const patchStepUrl = (farm_id, user_id) => `${userFarmUrl}/onboarding/farm/${farm_id}/user/${user_id}`;

export function* createFarm(payload) {
  const { farmInfo } = payload;
  const user_id = localStorage.getItem('user_id');

  const getHeader = (user_id, farm_id )=> ({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id,
      farm_id
    },
  });

  let addFarmData = {
    farm_name: farmInfo.farmName,
    address: farmInfo.address,
    grid_points: farmInfo.gridPoints,
    country: farmInfo.country,
  };

  try {
    const addFarmResult = yield call(axios.post, farmUrl, addFarmData, getHeader(user_id));
    if (addFarmResult.data && addFarmResult.data.farm_id) {
      localStorage.setItem('farm_id', addFarmResult.data.farm_id);
      const farm = addFarmResult.data;
      const { farm_id } = farm;
      let step = {
        step_one: true,
        step_one_end: new Date(),
      };
      yield call(axios.patch, patchStepUrl(farm_id, user_id), step, getHeader(user_id, farm_id));
      // redirect to next step (select role)
      yield put(setFarmInState({...farm, ...step}));

      history.push('/role_selection')
    }
  } catch (e) {
    console.error(e);
    toastr.error('Failed to add farm, please contact litefarm for assistance');
  }
}

export function* patchRole(payload) {
  try {
    const { farm_id, user_id } = yield select(farmSelector);
    //TODO refactor header
    const header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
        user_id,
        farm_id,
      },
    };
    const { role, callback } = payload;
    yield call(axios.patch, patchRoleUrl(farm_id, user_id), { role }, header);
    //TODO set date on server
    let step = {
      step_two: true,
      step_two_end: new Date(),
    };
    yield call(axios.patch, patchStepUrl(farm_id, user_id), step, header);
    yield put(setFarmInState({ ...step }));
    callback && callback();
  } catch (e) {
    console.log('fail to update role');
  }

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
  yield takeEvery(POST_FARM, createFarm);
  yield takeEvery(PATCH_ROLE, patchRole);
}
