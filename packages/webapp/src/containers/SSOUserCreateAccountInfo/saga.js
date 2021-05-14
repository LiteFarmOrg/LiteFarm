import { createAction } from '@reduxjs/toolkit';
import { call, takeLeading, select } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { getFirstNameLastName, getLanguageFromLocalStorage } from '../../util';
import history from '../../history';
import { axios } from '../saga';
import { loginSelector } from '../userFarmSlice';

const patchUserUrl = (user_id) => `${url}/user/${user_id}`;

export const patchSSOUserInfo = createAction(`patchSSOUserInfoSaga`);
export function* patchSSOUserInfoSaga({ payload: { user: userForm } }) {
  try {
    let { user_id } = yield select(loginSelector);
    const id_token = localStorage.getItem('id_token');
    const header = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + id_token,
      },
    };
    const user = {
      ...userForm,
      ...getFirstNameLastName(userForm.name),
    };
    delete user.name;
    const result = yield call(axios.put, patchUserUrl(user_id), { ...user }, header);
    history.push('/farm_selection');
  } catch (e) {
    console.log(e);
  }
}

export default function* SSOInfoSaga() {
  yield takeLeading(patchSSOUserInfo.type, patchSSOUserInfoSaga);
}
