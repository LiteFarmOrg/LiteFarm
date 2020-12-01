import { createAction } from '@reduxjs/toolkit';
import { put, takeLatest, call } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import {getUserFarmsSuccess, onLoadingUserFarmsStart, onLoadingUserFarmsFail} from '../userFarmSlice';
const axios = require('axios');
const loginUrl = () => `${url}/login/google`;

export const loginWithGoogle = createAction(`loginWithGoogleSaga`);
export function* loginWithGoogleSaga({payload:id_token}) {
  try {
    yield put(onLoadingUserFarmsStart());
    const header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + id_token,
      },
    };
    const result = yield call(axios.post, loginUrl(), {}, header);
    console.log(result.data);
    localStorage.setItem('id_token',result.data);
  } catch (e) {
    yield put(onLoadingUserFarmsFail());
    console.log('failed to login')
  }
}


export default function* loginSaga() {
  yield takeLatest(loginWithGoogle.type, loginWithGoogleSaga);
}
