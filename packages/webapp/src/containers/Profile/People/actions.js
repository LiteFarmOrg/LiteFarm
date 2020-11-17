import {
  ADD_PSEUDO_WORKER,
  ADD_USER_FROM_PEOPLE,
  DEACTIVATE_USER,
  GET_ALL_USER_BY_FARM,
  GET_ROLES,
  GET_USER_IN_PEOPLE,
  REACTIVATE_USER,
  SET_FARM_ID_IN_PEOPLE,
  SET_ROLES_IN_PEOPLE,
  SET_USERS_IN_PEOPLE,
  UPDATE_USER_FARM,
  UPDATE_USER_IN_PEOPLE,
} from './constants';

export const getUserInfo = () => {
  return {
    type: GET_USER_IN_PEOPLE
  }
};

export const setUsersInState = (users) => {
  return {
    type: SET_USERS_IN_PEOPLE,
    users
  }
};

export const getAllUsers = () => {
  return {
    type: GET_ALL_USER_BY_FARM,
  }
};

export const deactivateUser = (user_id) => {
  return {
    type: DEACTIVATE_USER,
    user_id
  }
};

export const reactivateUser = (user_id) => {
  return {
    type: REACTIVATE_USER,
    user_id
  }
};

export const updateUser = (user) => {
  return {
    type: UPDATE_USER_IN_PEOPLE,
    user
  }
};

export const addUser = (user) => {
  return {
    type: ADD_USER_FROM_PEOPLE,
    user
  }
};

export const setFarmID = (farm_id) => {
  return {
    type: SET_FARM_ID_IN_PEOPLE,
    farm_id
  }
};

export const addPseudoWorker = (user) => {
  return {
    type: ADD_PSEUDO_WORKER,
    user
  }
};

export const updateUserFarm = (user) => {
  return {
    type: UPDATE_USER_FARM,
    user
  }
};

export const getRoles = () => {
  return {
    type: GET_ROLES,
  };
};

export const setRolesInState = (roles) => {
  return {
    type: SET_ROLES_IN_PEOPLE,
    roles,
  };
};
