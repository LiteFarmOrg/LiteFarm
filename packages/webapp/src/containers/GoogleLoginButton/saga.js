import { createAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import { loginUrl as url } from '../../apiConfig';
import { loginSuccess, onLoadingUserFarmsFail, onLoadingUserFarmsStart } from '../userFarmSlice';
import history from '../../history';
import { toastr } from 'react-redux-toastr';
import i18n from '../../locales/i18n';
import { axios } from '../saga';

const loginUrl = () => `${url}/google`;

export const loginWithGoogle = createAction(`loginWithGoogleSaga`);

export function* loginWithGoogleSaga({ payload: google_id_token }) {
  try {
    yield put(onLoadingUserFarmsStart());
    const header = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + google_id_token,
      },
    };
    const result = yield call(axios.post, loginUrl(), {}, header);
    const { id_token, user } = result.data;
    localStorage.setItem('id_token', id_token);
    localStorage.setItem('litefarm_lang', user.language_preference);
    if (id_token === '') {
      history.push({
        pathname: '/',
        state: { component: 'PureEnterPasswordPage', user },
      });
    } else {
      yield put(loginSuccess(user));
      history.push('/farm_selection');
    }
  } catch (e) {
    yield put(onLoadingUserFarmsFail(e));
    toastr.error(i18n.t('message:LOGIN.ERROR.LOGIN_FAIL'));
  }
}

export default function* loginSaga() {
  yield takeLatest(loginWithGoogle.type, loginWithGoogleSaga);
}
