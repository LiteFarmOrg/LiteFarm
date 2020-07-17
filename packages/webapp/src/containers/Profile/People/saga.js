import { GET_USER_IN_PEOPLE, GET_ALL_USER_BY_FARM, UPDATE_USER_IN_PEOPLE, ADD_USER_FROM_PEOPLE,
  ADD_PSEUDO_WORKER, DEACTIVATE_USER, UPDATE_USER_FARM, GET_ROLES} from "./constants";
import { setUsersInState, getAllUsers, setFarmID, setRolesInState } from './actions';
import { put, takeEvery, call } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { toastr } from 'react-redux-toastr';
import Auth from "../../../Auth/Auth";
import { getUserInfo } from '../../actions';

const axios = require('axios');

export function* getUserInfoSaga() {
  let user_id = localStorage.getItem('user_id');
  const farm_id = localStorage.getItem('farm_id');
  const { userUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.get, userUrl + '/' + user_id, header);
    const farm = farm_id || result.data[0].farm_id;
    if (result.data && result.data[0] && farm) {
      // TODO: deprecate fetching farm_id from users table - need
      // to ensure farm_id is always available at this point
      yield put(setFarmID(farm));
      yield put(getAllUsers(farm));
    }
  } catch(e) {
    console.log('failed to fetch user from database')
  }
}

export function* getAllUsersByFarmID() {
  let farm_id = localStorage.getItem('farm_id');
  const { userUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    // only non-deleted users
    const result = yield call(axios.get, userUrl + '/farm/' + farm_id, header);
    if (result.data) {
      yield put(setUsersInState(result.data));
    }
  } catch(e) {
    console.log('failed to fetch users from database')
  }
}

export function* updateUser(payload){
  const auth = new Auth();
  let user = payload.user;
  let user_id = user.user_id;
  let is_admin = user.is_admin;
  const { userUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  if(user.phone_number === null){
    delete user.phone_number;
  }
  if(user.address === null){
    delete user.address;
  }
  try {
    const token = yield call(auth.getAPIExplorerToken);
    if (token && token.data) {
      // update the new role for the user, then delete the old role
      yield call(auth.setUserRoleInAuth0, 'auth0|' + user_id, token.data.access_token, is_admin);
      yield call(auth.deleteUserRoleInAuth0, 'auth0|' + user_id, token.data.access_token, is_admin);
      // must make api call for both auth0 and google-oauth2 accounts, since it is not currently
      // known whether user is google account
      yield call(auth.setUserRoleInAuth0, 'google-oauth2|' + user_id, token.data.access_token, is_admin);
      yield call(auth.deleteUserRoleInAuth0, 'google-oauth2|' + user_id, token.data.access_token, is_admin);
    }
    const result = yield call(axios.put, userUrl + '/' + user_id, user, header);
    if (result.data[0] && result.data[0].farm_id) {
      yield put(getAllUsers(result.data[0].farm_id));
      yield put(getUserInfo());
      toastr.success("Successfully updated user!");
    }
  } catch (err) {
    console.error('failed to update setting');
    toastr.error("Failed to update user");
  }
}

export function* addUser(payload){
  let user = payload.user;
  const { createUserUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try{
    const result = yield call(axios.post, createUserUrl, user, header);
    if(result.data){
      yield put(getAllUsers());
      toastr.success("Successfully added user to farm!");
    }
  }
  catch(err){
    //console.log(err.response.status);
    if(err.response.status === 409){
      toastr.error("User already exists in LiteFarm Network");
    }
    else toastr.error("Failed to add user");
  }
}

export function* addPseudoWorkerSaga(payload){
  let user = payload.user;
  const { pseudoUserUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try{
    const result = yield call(axios.post, pseudoUserUrl, user, header);
    if(result.data){
      yield put(getAllUsers());
      toastr.success("Successfully added user to farm!");
    }
  }
  catch(err){
    console.error(err);
    toastr.error("Failed to add user");
  }
}

export function* deactivateUserSaga(payload) {
  const { userUrl } = apiConfig;
  const header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('id_token'),
      user_id: localStorage.getItem('user_id'),
      farm_id: localStorage.getItem('farm_id'),
    },
  };

  try {
    const result = yield call(axios.patch, userUrl + '/deactivate/' + payload.user_id, null, header);
    if (result) {
      console.log('user deactivated');
      yield put(getAllUsers());
      toastr.success("User access revoked!");
    }
  } catch(e) {
    toastr.error("There was an error revoking access!");
  }
}

export function* updateUserFarmSaga(payload) {
  let token = localStorage.getItem('id_token');
  let user_id = payload.user.user_id;
  let farm_id = localStorage.getItem('farm_id');
  let header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  };

  try {
    delete payload.user.user_id;
    const result = yield call(axios.patch, apiConfig.userFarmUrl + '/update/' + `farm/${farm_id}/user/${user_id}`, payload.user, header);
    if (result) {
      console.log('user updated');
      yield put(getAllUsers());
      toastr.success("User updated!");
    }
  } catch(e) {
    toastr.error("There was an error updating this user!");
    console.error(e);
  }
}

export function* getRolesSaga() {
  const token = localStorage.getItem('id_token');
  const user_id = localStorage.getItem('user_id');
  const farm_id = localStorage.getItem('farm_id');
  const { rolesUrl } = apiConfig;
  let header = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
      user_id,
      farm_id,
    },
  };

  try {
    const result = yield call(axios.get, rolesUrl, header);
    if (result.data) {
      yield put(setRolesInState(result.data));
    }
  } catch (e) {
    console.log('failed to fetch roles from database')
  }
}

export default function* peopleSaga() {
  yield takeEvery(GET_USER_IN_PEOPLE, getUserInfoSaga);
  yield takeEvery(GET_ALL_USER_BY_FARM, getAllUsersByFarmID);
  yield takeEvery(UPDATE_USER_IN_PEOPLE, updateUser);
  yield takeEvery(ADD_USER_FROM_PEOPLE, addUser);
  yield takeEvery(ADD_PSEUDO_WORKER, addPseudoWorkerSaga);
  yield takeEvery(DEACTIVATE_USER, deactivateUserSaga);
  yield takeEvery(UPDATE_USER_FARM, updateUserFarmSaga);
  yield takeEvery(GET_ROLES, getRolesSaga);
}
