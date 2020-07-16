import { GET_USER_IN_NOTIFICATION, SET_USER_IN_NOTIFICATION, SET_NOTIFICATION } from './constants'

export const getUserInfo = () => {
  return {
    type: GET_USER_IN_NOTIFICATION
  }
};

export const setUserInState = (user) => {
  return {
    type: SET_USER_IN_NOTIFICATION,
    user
  }
};

export const setNotification = (user) => {
  return {
    type: SET_NOTIFICATION,
    user
  }
};