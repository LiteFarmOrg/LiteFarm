import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from './saga';
import { useTranslation } from 'react-i18next';

function GoogleLoginButton({ disabled }) {
  const dispatch = useDispatch();
  const onSuccess = (res) => {
    dispatch(loginWithGoogle(res.credential));
  };
  const onFailure = (res) => {
    console.log(res);
  };
  const { t } = useTranslation();

  return (
    <GoogleLogin
      buttonText="Login"
      data-cy="continueGoogle"
      onSuccess={onSuccess}
      onFailure={onFailure}
      disabled={disabled}
      text="continue_with"
      width={312}
    >
      {t('SIGNUP.GOOGLE_BUTTON')}
    </GoogleLogin>
  );
}

/* Google response object (from Google Identity Services via @react-oauth/google)
{ 
  credential: <equivalent to previous id_token>,
  clientId: <same as the one imported from .env file above>,
  select_by: "btn"
}
*/

export default GoogleLoginButton;
