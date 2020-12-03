export const getAccessToken = () => {
  return localStorage.getItem('id_token');
}
export const setAccessToken = (token) => {
  return localStorage.setItem('id_token', token);
}
export const isAuthenticated = () => !!getAccessToken();