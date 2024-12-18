import { createAction } from '@reduxjs/toolkit';
import { call, put, takeLeading } from 'redux-saga/effects';
import { loginUrl as url } from '../../apiConfig';
import { loginSuccess } from '../userFarmSlice';
import i18n from '../../locales/i18n';
import { axios } from '../saga';
import { ENTER_PASSWORD_PAGE } from '../CustomSignUp/constants';
import { enqueueErrorSnackbar } from '../Snackbar/snackbarSlice';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { setCustomSignUpErrorKey } from '../customSignUpSlice';
import { inlineErrors } from '../CustomSignUp/constants';
import { useNavigate } from 'react-router-dom';

const loginUrl = () => `${url}/google`;

export const loginWithGoogle = createAction(`loginWithGoogleSaga`);

export function* loginWithGoogleSaga({ payload: google_id_token }) {
  let navigate = useNavigate();
  try {
    const header = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + google_id_token,
      },
    };
    const result = yield call(
      axios.post,
      loginUrl(),
      { language_preference: getLanguageFromLocalStorage() },
      header,
    );
    const { id_token, user, isSignUp, isInvited } = result.data;
    localStorage.setItem('id_token', id_token);
    localStorage.setItem('litefarm_lang', user.language_preference);
    if (i18n.language !== getLanguageFromLocalStorage()) {
      i18n.changeLanguage(getLanguageFromLocalStorage());
    }
    if (isInvited) {
      yield put(setCustomSignUpErrorKey({ key: inlineErrors.invited }));
    } else if (id_token === '') {
      // The user has an account with a password
      navigate('/', { state: { component: ENTER_PASSWORD_PAGE, user } });
    } else {
      yield put(loginSuccess(user));
      if (isSignUp) {
        navigate('/welcome');
      } else {
        navigate('/farm_selection');
      }
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:LOGIN.ERROR.LOGIN_FAIL')));
  }
}

export default function* loginSaga() {
  yield takeLeading(loginWithGoogle.type, loginWithGoogleSaga);
}
