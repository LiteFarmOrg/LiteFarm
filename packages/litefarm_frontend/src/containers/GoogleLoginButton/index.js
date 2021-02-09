import React from 'react';
import GoogleLogin from 'react-google-login';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from './saga';
import styles from './googleLoginButton.scss';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

function GoogleLoginButton({ disabled }) {
  const dispatch = useDispatch();
  const clientId = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;
  const onSuccess = (res) => {
    dispatch(loginWithGoogle(res.tokenObj.id_token));
  };
  const onFailure = (res) => {
    console.log(res);
  };
  const { t } = useTranslation();

  return (
    <GoogleLogin
      buttonText="Login"
      onSuccess={onSuccess}
      onFailure={onFailure}
      disabled={disabled}
      clientId={clientId}
      className={clsx(styles.googleButton, 'google-login-button')}
    >
      {t('SIGNUP.GOOGLE_BUTTON')}
    </GoogleLogin>
  );
}

// Google res shape
// res:{
//   profileObj:{
//     email: "litefarmdev0@gmail.com"
//     familyName: "dev"
//     givenName: "litefarm"
//     googleId: "104942873090979111002"
//     imageUrl: "https://lh5.googleusercontent.com/-ICoPrywDAt0/AAAAAAAAAAI/AAAAAAAAAAA/AMZuuclA_5NvcmJaWZP4UlYtqwMIh8PJUw/s96-c/photo.jpg"
//     name: "litefarm dev"
//   },
//   tokenObj:{
//     access_token: "ya29.a0AfH6SMAzJ7UwkBMxt7HqCRNiYO5EVgtlBbAbPWfqVF2CaM3suld0ZCZSieXrjhh9zhN7_ArqqAaP20-EnXt1EnuqBJqPG5GJNdQPEKCEIJ3yNahso0jlXewTt-drEiYj-_aiUrrpc-KXuQBNVDUkzoJdpJFk9AsDoKjbQ3NCb5KV"
//     expires_at: 1607546106563
//     expires_in: 3599
//     first_issued_at: 1607542507563
//     id_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6ImQ0Y2JhMjVlNTYzNjYwYTkwMDlkODIwYTFjMDIwMjIwNzA1NzRlODIiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiMTA2MjgxNDAwMDIyNy1yZTRnOXQ5cWNhcjFlYWJicmhma2hwYW9qOGtwdjRqNS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjEwNjI4MTQwMDAyMjctcmU0Zzl0OXFjYXIxZWFiYnJoZmtocGFvajhrcHY0ajUuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQ5NDI4NzMwOTA5NzkxMTEwMDIiLCJlbWFpbCI6ImxpdGVmYXJtZGV2MEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6Inh6QjlKNXdMcW1VU255cThYWWFhWEEiLCJuYW1lIjoibGl0ZWZhcm0gZGV2IiwicGljdHVyZSI6Imh0dHBzOi8vbGg1Lmdvb2dsZXVzZXJjb250ZW50LmNvbS8tSUNvUHJ5d0RBdDAvQUFBQUFBQUFBQUkvQUFBQUFBQUFBQUEvQU1adXVjbEFfNU52Y21KYVdaUDRVbFl0cXdNSWg4UEpVdy9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoibGl0ZWZhcm0iLCJmYW1pbHlfbmFtZSI6ImRldiIsImxvY2FsZSI6ImVuLUdCIiwiaWF0IjoxNjA3NTQyNTA3LCJleHAiOjE2MDc1NDYxMDcsImp0aSI6ImU4MjkwYmZhZmM2OWJiMzBhMzdlZjFjZDA2ZmViYWRhMjNmOTRlZGIifQ.AlqFs0GbBOS_ir5qxHYj4XE3HMcuihmYyepPUhn_8yTqFuN1lTZ6q3kbwLBGfIQYAi_a1YMgIcdRMp9nq8sVpy4tElIxouCXfahxvhpQhmKQXJ3Sl91WZNV9L7w0rfCMnXRV1f7KOMUyEwAAjzzWWyUT2yaya-xYAyyLWuvGOdldBHTMIBWtIF94LvCgyYmQqw1XGm86zw1OGPNa9x_lWHnH3SJvKVVRDStEYLey_HI9T2Qfbd2n9PPcqYRETXrzLNCQhMYj2sIH6yE96Bwm_cCmhursQqiyYkcISa1XQEuYXk7WmW-PpQyC3KmW31pN4FKYQnBQwPYJklc3Ki_f1A"
//     idpId: "google"
//     login_hint: "AJDLj6JUa8yxXrhHdWRHIV0S13cAfzUd9_mqXX2hOmOQOH48fV9-ibdj4DsNe9MxdK39uVTNLls4qSIpa0KWHPfnPpznZJqgHA"
//     scope: "email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid"
//     session_state: {extraQueryParams: {…}}
//     token_type: "Bearer"
//   }
// }

export default GoogleLoginButton;
