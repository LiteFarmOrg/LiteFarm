import React from 'react';
import GoogleLogin from 'react-google-login';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from './saga';
import styles from './googleLoginButton.scss';

function GoogleLoginButton({ disabled }) {
  const dispatch = useDispatch();
  const clientId = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;
  const onSuccess = (res) => {
    dispatch(loginWithGoogle(res.tokenObj.id_token));
  };
  const onFailure = (res) => {
    console.log(res);
  };
  return (
    <GoogleLogin
      buttonText="Login"
      onSuccess={onSuccess}
      onFailure={onFailure}
      disabled={disabled}
      // style={{ width: '312px', height: '48px', fontWeight: 5000 }}
      // style={{ theme: 'dark'}}
      clientId={clientId}
      className={styles.googleButton}
    >
      Login with google
    </GoogleLogin>
  );
}

export default GoogleLoginButton;
