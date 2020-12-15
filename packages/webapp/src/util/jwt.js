import { purgeState } from '../index';
import history from '../history';

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
  return history.push('/');
};
