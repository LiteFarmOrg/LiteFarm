import { createAction } from '@reduxjs/toolkit';
import { put, takeLatest, call, select } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { onLoadingUserFarmsStart, onLoadingUserFarmsFail } from '../userFarmSlice';
import history from '../../history';
import { loginSelector, loginSuccess } from '../loginSlice';

const axios = require('axios');
const loginUrl = () => `${url}/login/google`;

export const loginWithGoogle = createAction(`loginWithGoogleSaga`);

export function* loginWithGoogleSaga({ payload: google_id_token }) {
  try {
    yield put(onLoadingUserFarmsStart());
    const header = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + google_id_token,
      },
    };
    const result = yield call(axios.post, loginUrl(), {}, header);
    const { id_token, user } = result.data;
    console.log(result.data, user);
    localStorage.setItem('id_token', id_token);
    yield put(loginSuccess(user));
    const {user_id} = select(loginSelector);
    console.log(user_id);
    history.push('/farm_selection');
  } catch (e) {
    yield put(onLoadingUserFarmsFail());
    console.log('failed to login')
  }
}


export default function* loginSaga() {
  yield takeLatest(loginWithGoogle.type, loginWithGoogleSaga);
}
