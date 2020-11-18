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

import { put, takeLatest, call, select } from 'redux-saga/effects';
import apiConfig from './../../apiConfig';
import { onLoadingUserFarmsStart, onLoadingUserFarmsFail, getUserFarmsSuccess } from '../userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { loginSelector, loginSuccess } from '../loginSlice';
import { getHeader } from '../saga';
import Auth from '../../Auth/Auth';
import { toastr } from 'react-redux-toastr';
import { getUserSuccess, onLoadingUsersStart, onLoadingUsersFail } from '../userSlice';

const axios = require('axios');

export const getUserFarms = createAction('getUserFarmsSaga');
export function* getUserFarmsSaga() {
  const { userFarmUrl } = apiConfig;
  try {
    const { user_id } = yield select(loginSelector);
    const header = getHeader(user_id);
    yield put(onLoadingUserFarmsStart());
    const result = yield call(axios.get, userFarmUrl + '/user/' + user_id, header);
    yield put(getUserFarmsSuccess(result.data));

  } catch (error) {
    yield put(onLoadingUserFarmsFail({ error }));
    console.log('failed to fetch task types from database')
  }
}

export const getUser = createAction('getUserSaga');
export function* getUserSaga() {
  try {
    yield put(onLoadingUsersStart());
    let { user_id } = yield select(loginSelector);
    const { userUrl } = apiConfig;
    const header = getHeader(user_id);
    const result = yield call(axios.get, userUrl + '/' + user_id, header);
    const user = result?.data;
    if (user) {
      yield put(getUserSuccess(user));
    } else {
      //If user exist in Auth0 database but not postgres database, get user from auth0 and post to postgres database
      const auth = new Auth();
      auth.getUserInfo(localStorage.getItem('access_token'), localStorage.getItem('id_token'), (user_id) => put(loginSuccess({ user_id })));
      console.log('failed to fetch user from database')
    }
  } catch (error) {
    onLoadingUsersFail({ error });
    toastr.error('Failed to fetch user info');
  }
}

export default function* chooseFarmSaga() {
  yield takeLatest(getUserFarms.type, getUserFarmsSaga);
  yield takeLatest(getUser.type, getUserSaga);
}
