import { purgeState } from '../store/store';
import { CUSTOM_SIGN_UP } from '../containers/CustomSignUp/constants';
import { useNavigate } from 'react-router';

export const getAccessToken = () => {
  return localStorage.getItem('id_token');
};
export const setAccessToken = (token) => {
  return localStorage.setItem('id_token', token);
};
export const isAuthenticated = () => !!getAccessToken();
export const logout = () => {
  let navigate = useNavigate();
  localStorage.removeItem('id_token');
  purgeState();
  return navigate('/', {
    state: {
      component: CUSTOM_SIGN_UP,
    },
  });
};
