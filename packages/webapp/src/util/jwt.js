import history from '../history';
import { purgeState } from '../store/store';
import { CUSTOM_SIGN_UP } from '../containers/CustomSignUp/constants';

export const getAccessToken = () => {
  return localStorage.getItem('id_token');
};
export const setAccessToken = (token) => {
  return localStorage.setItem('id_token', token);
};
export const isAuthenticated = () => !!getAccessToken();
export const logout = () => {
  localStorage.removeItem('id_token');
  purgeState();
  return history.push(
    {
      pathname: '/',
    },
    {
      component: CUSTOM_SIGN_UP,
    },
  );
};
