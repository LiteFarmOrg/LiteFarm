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

import { createAction } from '@reduxjs/toolkit';
import { call, put, takeLeading } from 'redux-saga/effects';
import { url } from '../../apiConfig';
import { loginSuccess } from '../userFarmSlice';
import { decodeToken } from 'react-jwt';
import { axios } from '../saga';
import { useNavigate } from 'react-router';

const resetPasswordUrl = () => `${url}/password_reset`;

export const resetPassword = createAction(`resetPasswordSaga`);

export function* resetPasswordSaga({
  payload: { reset_token, password, onPasswordResetSuccess, email },
}) {
  let navigate = useNavigate();
  try {
    const result = yield call(
      axios.put,
      resetPasswordUrl(),
      { password },
      {
        headers: {
          Authorization: `Bearer ${reset_token}`,
        },
      },
    );

    const { id_token } = result.data;
    localStorage.setItem('id_token', id_token);

    const decoded = decodeToken(id_token);
    const { user_id } = decoded;

    yield put(loginSuccess({ user_id }));
    onPasswordResetSuccess();
  } catch (e) {
    navigate('/expired', { state: { translation_key: 'RESET_PASSWORD', email } });
  }
}

export default function* resetUserPasswordSaga() {
  yield takeLeading(resetPassword.type, resetPasswordSaga);
}
