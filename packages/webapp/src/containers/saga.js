/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (saga.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { createAction } from '@reduxjs/toolkit';
import axiosWithoutInterceptors from 'axios';
import produce from 'immer';
import { all, call, delay, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig, { url } from '../apiConfig';
import history from '../history';
import i18n from '../locales/i18n';
import { store } from '../store/store.ts';
import { APP_VERSION } from '../util/constants';
import { logout } from '../util/jwt';
import { handle403 } from './ErrorHandler/saga.js';
import { getRoles } from './InviteUser/saga';
import notificationSaga, { getNotification } from './Notification/saga';
import {
  getAllSupportedCertifications,
  getAllSupportedCertifiers,
  getCertificationSurveys,
} from './OrganicCertifierSurvey/saga';
import { getAllUserFarmsByFarmIDSaga } from './Profile/People/saga';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from './Snackbar/snackbarSlice';
import {
  getHarvestUseTypesSaga,
  getProductsSaga,
  getTaskTypesSaga,
  getTasksSaga,
} from './Task/saga';
import { appVersionSelector, setAppVersion } from './appSettingSlice';
import {
  getBedMethodsSuccess,
  onLoadingBedMethodFail,
  onLoadingBedMethodStart,
} from './bedMethodSlice';
import {
  getBroadcastMethodsSuccess,
  onLoadingBroadcastMethodFail,
  onLoadingBroadcastMethodStart,
} from './broadcastMethodSlice';
import {
  getContainerMethodsSuccess,
  onLoadingContainerMethodFail,
  onLoadingContainerMethodStart,
} from './containerMethodSlice';
import {
  getCropManagementPlansSuccess,
  onLoadingCropManagementPlanFail,
  onLoadingCropManagementPlanStart,
} from './cropManagementPlanSlice';
import { getAllCropsSuccess, onLoadingCropFail, onLoadingCropStart } from './cropSlice';
import {
  getAllCropVarietiesSuccess,
  onLoadingCropVarietyFail,
  onLoadingCropVarietyStart,
} from './cropVarietySlice';
import {
  getAllDocumentsSuccess,
  onLoadingDocumentFail,
  onLoadingDocumentStart,
} from './documentSlice';
import { resetTasksFilter } from './filterSlice';
import { resetDateRange, setIsFetchingData } from './Finances/actions.js';
import { fetchAllData as fetchAllFinanceData } from './Finances/saga';
import {
  getAllManagementPlansSuccess,
  getManagementPlansSuccess,
  onLoadingManagementPlanFail,
  onLoadingManagementPlanStart,
} from './managementPlanSlice';
import {
  getPlantingManagementPlansSuccess,
  onLoadingPlantingManagementPlanFail,
  onLoadingPlantingManagementPlanStart,
} from './plantingManagementPlanSlice';
import {
  getRowMethodsSuccess,
  onLoadingRowMethodFail,
  onLoadingRowMethodStart,
} from './rowMethodSlice';
import { resetTasks } from './taskSlice';
import {
  isAdminSelector,
  loginSelector,
  patchFarmSuccess,
  putUserSuccess,
  selectFarmSuccess,
  userFarmSelector,
  userFarmsByFarmSelector,
} from './userFarmSlice';
import { logUserInfoSuccess, userLogReducerSelector } from './userLogSlice';
import { resetFarmStateReducer } from '../store/actionTypes';
import { api, invalidateTags } from '../store/api/apiSlice';
import { locationApi } from '../store/api/locationApi';
import { FarmLibraryTags, FarmTags } from '../store/api/apiTags';
import { getFieldWorkTypes } from './Task/FieldWorkTask/saga';
import { getIrrigationTaskTypes } from './Task/IrrigationTaskTypes/saga';

axiosWithoutInterceptors.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error?.response?.status === 401 && error?.config?.url?.startsWith(url)) {
      if (localStorage.getItem('id_token')) {
        logout();
      }
    } else if (error?.response?.status === 403 && error?.config?.url?.startsWith(url)) {
      store?.dispatch(handle403());
    }
    return Promise.reject(error);
  },
);
export const axios = axiosWithoutInterceptors;

export function getHeader(user_id, farm_id, { headers, ...props } = {}) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('id_token'),
      user_id,
      farm_id,
      ...headers,
    },
    ...props,
  };
}

export const updateUser = createAction('updateUserSaga');

export function* updateUserSaga({ payload: user }) {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  const { userUrl } = apiConfig;
  const data = produce(user, (user) => {
    if (user.wage === null) {
      delete user.wage;
    }
    if (user.phone_number === null) {
      delete user.phone_number;
    }
  });

  try {
    const result = yield call(axios.put, userUrl + '/' + user_id, data, header);
    yield put(putUserSuccess({ ...user, farm_id, user_id }));
    const t = yield call(i18n.changeLanguage, user.language_preference);
    localStorage.setItem('litefarm_lang', user.language_preference);
    yield put(enqueueSuccessSnackbar(t('message:USER.SUCCESS.UPDATE')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.UPDATE')));
  }
}

export const getCrops = createAction(`getCropsSaga`);

export function* getCropsSaga() {
  const { cropURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingCropStart());
    const appVersion = yield select(appVersionSelector);
    const queryString = appVersion === APP_VERSION ? '?fetch_all=false' : '';
    const result = yield call(axios.get, `${cropURL}/farm/${farm_id}${queryString}`, header);
    yield put(getAllCropsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingCropFail());
    console.error('failed to fetch all crops from database');
  }
}

export const getCropVarieties = createAction(`getCropVarietiesSaga`);

export function* getCropVarietiesSaga() {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingCropVarietyStart());
    const result = yield call(axios.get, `${url}/crop_variety/farm/${farm_id}`, header);
    yield put(getAllCropVarietiesSuccess(result.data));
  } catch (e) {
    yield put(onLoadingCropVarietyFail(e));
    console.error('failed to fetch all crop varieties from database');
  }
}

export const getDocuments = createAction(`getDocumentsSaga`);

export function* getDocumentsSaga() {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingDocumentStart());
    const result = yield call(axios.get, `${url}/document/farm/${farm_id}`, header);
    yield put(getAllDocumentsSuccess(result.data));
  } catch (e) {
    console.log(e);
    yield put(onLoadingDocumentFail(e));
    console.error('failed to fetch all documents from database');
  }
}

export const getFarmInfo = createAction(`getFarmInfoSaga`);

export function* getFarmInfoSaga() {
  try {
    let userFarm = yield select(userFarmSelector);

    //TODO potential bug
    if (!userFarm.farm_id) {
      history.push('/add_farm');
      return;
    }
    localStorage.setItem('role_id', userFarm.role_id);
    yield put(locationApi.endpoints.getLocations.initiate());
    yield put(getManagementPlans());
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:FARM.ERROR.FETCH')));
  }
}

/**
 * @type {import('@reduxjs/toolkit').ActionCreatorWithPayload<any, 'putFarmSaga'>}
 */
export const putFarm = createAction('putFarmSaga');

export function* putFarmSaga({ payload: farm }) {
  const { farmUrl } = apiConfig;
  let { user_id, farm_id, units } = yield select(userFarmSelector);
  const { headers } = getHeader(user_id, farm_id);

  // OC: We should never update address information of a farm.
  let { address, grid_points, imageFile, ...data } = farm;
  if (data.farm_phone_number === null) {
    delete data.farm_phone_number;
  }

  data.units = { measurement: data.units.measurement, currency: units.currency };

  const formData = new FormData();

  formData.append('_file_', imageFile);
  formData.append('data', JSON.stringify(data));

  try {
    const result = yield call(axios.put, farmUrl + '/' + farm_id, formData, {
      headers: { ...headers, 'Content-Type': 'multipart/form-data' },
    });

    yield put(patchFarmSuccess({ ...result.data[0], farm_id, user_id }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:FARM.SUCCESS.UPDATE')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:FARM.ERROR.UPDATE')));
  }
}

export function* onLoadingManagementPlanAndPlantingMethodStartSaga() {
  yield put(onLoadingBroadcastMethodStart());
  yield put(onLoadingBedMethodStart());
  yield put(onLoadingRowMethodStart());
  yield put(onLoadingContainerMethodStart());
  yield put(onLoadingPlantingManagementPlanStart());
  yield put(onLoadingCropManagementPlanStart());
  yield put(onLoadingManagementPlanStart());
}

const plantingMethodActionMap = {
  BROADCAST_METHOD: { success: getBroadcastMethodsSuccess, fail: onLoadingBroadcastMethodFail },
  CONTAINER_METHOD: { success: getContainerMethodsSuccess, fail: onLoadingContainerMethodFail },
  BED_METHOD: { success: getBedMethodsSuccess, fail: onLoadingBedMethodFail },
  ROW_METHOD: { success: getRowMethodsSuccess, fail: onLoadingRowMethodFail },
};

export const getManagementPlanAndPlantingMethodSuccess = createAction(
  'getManagementPlanAndPlantingMethodSuccessSaga',
);

export function* getManagementPlanAndPlantingMethodSuccessSaga({ payload: managementPlans }) {
  yield put(getManagementPlansSuccess(managementPlans));
  yield put(
    getCropManagementPlansSuccess(
      managementPlans.map((managementPlan) => managementPlan.crop_management_plan),
    ),
  );
  const plantingManagementPlans = managementPlans.reduce(
    (plantingManagementPlans, managementPlan) => {
      for (const planting_management_plan of managementPlan?.crop_management_plan
        ?.planting_management_plans || []) {
        plantingManagementPlans.push(planting_management_plan);
      }
      return plantingManagementPlans;
    },
    [],
  );
  yield call(getPlantingManagementPlansSuccessSaga, { payload: plantingManagementPlans });
}

export const getAllManagementPlanAndPlantingMethodSuccess = createAction(
  'getManagementPlanAndPlantingMethodSuccessSaga',
);

export function* getAllManagementPlanAndPlantingMethodSuccessSaga({ payload: managementPlans }) {
  yield put(getAllManagementPlansSuccess(managementPlans));
  yield put(
    getCropManagementPlansSuccess(
      managementPlans.map((managementPlan) => managementPlan.crop_management_plan),
    ),
  );
  const plantingManagementPlans = managementPlans.reduce(
    (plantingManagementPlans, managementPlan) => {
      for (const planting_management_plan of managementPlan?.crop_management_plan
        ?.planting_management_plans || []) {
        plantingManagementPlans.push(planting_management_plan);
      }
      return plantingManagementPlans;
    },
    [],
  );
  yield call(getPlantingManagementPlansSuccessSaga, { payload: plantingManagementPlans });
}

export function* getPlantingManagementPlansSuccessSaga({ payload: plantingManagementPlans }) {
  const plantingMethods = plantingManagementPlans.reduce(
    (plantingMethods, planting_management_plan) => {
      planting_management_plan.planting_method &&
        plantingMethods[planting_management_plan.planting_method].push(
          planting_management_plan[planting_management_plan.planting_method.toLowerCase()],
        );
      return plantingMethods;
    },
    {
      BROADCAST_METHOD: [],
      CONTAINER_METHOD: [],
      BED_METHOD: [],
      ROW_METHOD: [],
    },
  );
  yield put(getPlantingManagementPlansSuccess(plantingManagementPlans));
  for (const planting_method in plantingMethodActionMap) {
    try {
      if (plantingMethods[planting_method]?.length) {
        yield put(
          plantingMethodActionMap[planting_method].success(plantingMethods[planting_method]),
        );
      }
    } catch (e) {
      yield put(plantingMethodActionMap[planting_method].fail(e));
      console.log(e);
    }
  }
}

export const getManagementPlans = createAction('getManagementPlansSaga');

export function* getManagementPlansSaga() {
  const { managementPlanURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield call(onLoadingManagementPlanAndPlantingMethodStartSaga);
    const result = yield call(axios.get, managementPlanURL + '/farm/' + farm_id, header);
    yield call(getAllManagementPlanAndPlantingMethodSuccessSaga, { payload: result.data });
  } catch (e) {
    if (e.response?.status === 404) {
      yield call(getAllManagementPlanAndPlantingMethodSuccessSaga, { payload: [] });
    } else {
      console.log(e);
      yield put(onLoadingManagementPlanFail(e));
      yield put(onLoadingCropManagementPlanFail(e));
      yield put(onLoadingPlantingManagementPlanFail(e));
      console.log('failed to fetch management plans from db');
    }
  }
}

export const getManagementPlansByDate = createAction('getManagementPlansByDateSaga');

export function* getManagementPlansByDateSaga() {
  let currentDate = formatDate(new Date());
  const { managementPlanURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingManagementPlanStart());
    const result = yield call(
      axios.get,
      managementPlanURL + '/farm/date/' + farm_id + '/' + currentDate,
      header,
    );
    yield put(getManagementPlansSuccess(result.data));
  } catch (e) {
    if (e.response?.status === 404) {
      yield put(getManagementPlansSuccess([]));
    } else {
      yield put(onLoadingManagementPlanFail());
      console.log('failed to fetch management plans by date');
    }
  }
}

export const getCropsAndManagementPlans = createAction('getCropsAndManagementPlansSaga');

export function* getCropsAndManagementPlansSaga() {
  try {
    yield all([
      call(openFarmScopedQuery, locationApi.endpoints.getLocations.initiate()),
      call(getCropsSaga),
    ]);
    yield call(getCropVarietiesSaga);
    yield call(getManagementPlansSaga);
  } catch (e) {
    console.log(e);
  }
}

export const getManagementPlansAndTasks = createAction('getManagementPlansAndTasksSaga');

export function* getManagementPlansAndTasksSaga() {
  try {
    yield all([
      call(getCropsAndManagementPlansSaga),
      call(getProductsSaga),
      call(getHarvestUseTypesSaga),
      call(getTaskTypesSaga),
    ]);
    yield call(getTasksSaga);
  } catch (e) {
    console.log(e);
  }
}

export function* logUserInfoSaga() {
  const { logUserInfoUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  if (!user_id) return;
  const header = getHeader(user_id, farm_id);
  try {
    const hour = 1000 * 3600;
    const { lastActiveDatetime, farm_id: prev_farm_id } = yield select(userLogReducerSelector);
    const currentDateAsNumber = new Date().getTime();
    const data = {
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      farm_id,
    };
    if (!lastActiveDatetime || currentDateAsNumber - lastActiveDatetime > hour) {
      yield put(logUserInfoSuccess(farm_id));
      yield call(axios.post, logUserInfoUrl, data, header);
    } else if (prev_farm_id !== farm_id) {
      yield put(logUserInfoSuccess(farm_id));
      yield call(axios.post, logUserInfoUrl, data, header);
    }
  } catch (e) {
    console.log('failed to log user info');
  }
}

export function* checkAppVersionSaga() {
  const appVersion = yield select(appVersionSelector);
  const isStoreOutdated = appVersion && appVersion !== APP_VERSION;
  if (isStoreOutdated) logout();
}

// Subscription handles for farm-scoped RTK Query queries
// Retained so clearOldFarmStateSaga can release them before invalidating tags;
// with no remaining subscriber, invalidateTags removes each cached entry
// (removeQueryResult) instead of refetching it.
let farmScopedQuerySubscriptions = [];

function* openFarmScopedQuery(initiateThunk) {
  // Starting a query with `.initiate()` returns a handle for that query — an object of shape
  //  ({ requestId, unsubscribe, refetch, ... })
  // https://redux-toolkit.js.org/rtk-query/usage/usage-without-react-hooks#removing-a-subscription
  const subscription = yield put(initiateThunk);
  farmScopedQuerySubscriptions.push(subscription);
}

function releaseFarmScopedQuerySubscriptions() {
  farmScopedQuerySubscriptions.forEach((subscription) => subscription?.unsubscribe?.());
  farmScopedQuerySubscriptions = [];
}

export function* fetchAllSaga() {
  const { has_consent, user_id, farm_id } = yield select(userFarmSelector);
  if (!has_consent) return history.push('/consent');

  yield call(openFarmScopedQuery, api.endpoints.getSensors.initiate());

  const isAdmin = yield select(isAdminSelector);
  const adminTasks = [
    put(getCertificationSurveys()),
    put(getAllSupportedCertifications()),
    put(getAllSupportedCertifiers()),
  ];
  const tasks = [
    put(getRoles()),
    put(getManagementPlansAndTasks()),
    call(getAllUserFarmsByFarmIDSaga),
    put(getFieldWorkTypes()),
    put(getIrrigationTaskTypes()),
    put(api.endpoints.getSoilAmendmentMethods.initiate()),
    put(api.endpoints.getSoilAmendmentPurposes.initiate()),
    put(api.endpoints.getSoilAmendmentFertiliserTypes.initiate()),
    put(api.endpoints.getAnimalMovementPurposes.initiate()),
    //Todo: LF-4672 Remove once refactor to rtk is complete
    call(openFarmScopedQuery, locationApi.endpoints.getLocations.initiate()),
  ];

  yield all(isAdmin ? [...tasks, ...adminTasks] : tasks);

  yield put(fetchAllFinanceData());

  // Animals
  // Open farm-scoped queries through openFarmScopedQuery so their subscriptions can be released on farm switch
  yield all([
    call(openFarmScopedQuery, api.endpoints.getAnimals.initiate()),
    call(openFarmScopedQuery, api.endpoints.getAnimalBatches.initiate()),
    call(openFarmScopedQuery, api.endpoints.getDefaultAnimalTypes.initiate()),
    put(api.endpoints.getDefaultAnimalBreeds.initiate()),
    call(openFarmScopedQuery, api.endpoints.getCustomAnimalTypes.initiate()),
    call(openFarmScopedQuery, api.endpoints.getCustomAnimalBreeds.initiate()),
    put(api.endpoints.getAnimalSexes.initiate()),
    put(api.endpoints.getAnimalIdentifierTypes.initiate()),
    put(api.endpoints.getAnimalIdentifierColors.initiate()),
    put(api.endpoints.getAnimalMovementPurposes.initiate()),
    put(api.endpoints.getAnimalOrigins.initiate()),
    put(api.endpoints.getAnimalUses.initiate()),
  ]);

  const appVersion = yield select(appVersionSelector);
  if (appVersion !== APP_VERSION) {
    yield put(setAppVersion());
  }
  const userFarms = yield select(userFarmsByFarmSelector);
  yield put(resetTasksFilter({ user_id, userFarms }));
}

export function* clearOldFarmStateSaga() {
  yield put(resetFarmStateReducer());
  yield put(resetTasks());
  yield put(resetDateRange());
  releaseFarmScopedQuerySubscriptions();
  // RTK Query tracks subscriptions in two places: a live copy that `unsubscribe` updates right
  // away, and the redux store, which catches up one microtask later. `invalidateTags` reads the
  // store copy, so `delay(0)` lets it catch up first
  yield delay(0);
  yield put(invalidateTags([...FarmTags, ...FarmLibraryTags]));

  // Reset finance loading state
  yield put(setIsFetchingData(true));
}

export const selectFarm = createAction('selectFarmSaga');

export function* selectFarmSaga({ payload: { farm_id } }) {
  yield put(selectFarmSuccess({ farm_id }));
  try {
    const { user_id } = yield select(loginSelector);
    const header = getHeader(user_id, farm_id);
    const {
      data: { farm_token },
    } = yield call(axios.get, `${url}/farm_token/farm/${farm_id}`, header);
    localStorage.setItem('farm_token', farm_token);
  } catch (e) {
    console.error('failed to fetch farm token', e);
  }
}

export const selectFarmAndFetchAll = createAction('selectFarmAndFetchAllSaga');

export function* selectFarmAndFetchAllSaga({ payload: farm }) {
  try {
    yield call(selectFarmSaga, { payload: farm });
    const userFarm = yield select(userFarmSelector);
    yield call(clearOldFarmStateSaga);
    if (!userFarm.has_consent) {
      // has_consent is derived in the userFarmSelector from DB has_consent && consent_version === CONSENT_VERSION
      // Reachable when CONSENT_VERSION was bumped and the user hasn't re-accepted, or when an admin has changed the user's role (userFarmController.updateRole resets has_consent but leaves status='Active')
      // Status 'Invited' farms do not use selectFarmAndFetchAllSaga, but instead use patchUserFarmStatusWithIdTokenUrl
      return history.push('/consent');
    }
    history.push({ pathname: '/' });
    yield call(fetchAllSaga);
  } catch (e) {
    console.error('failed to fetch farm info', e);
  }
}

export function* onReqSuccessSaga({ pathname, state, message }) {
  history.push(pathname, state);
  yield delay(100);
  if (message) {
    yield put(enqueueSuccessSnackbar(message));
  }
}

const formatDate = (currDate) => {
  const d = currDate;
  let year = d.getFullYear(),
    month = '' + (d.getMonth() + 1),
    day = '' + d.getDate();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export default function* getFarmIdSaga() {
  yield takeLeading('*', logUserInfoSaga);
  yield takeLeading('*', checkAppVersionSaga);
  yield takeLeading(updateUser.type, updateUserSaga);
  yield takeLatest(getFarmInfo.type, getFarmInfoSaga);
  yield takeLeading(putFarm.type, putFarmSaga);
  yield takeLatest(getManagementPlansByDate.type, getManagementPlansSaga);
  yield takeLatest(getManagementPlans.type, getManagementPlansSaga);
  yield takeLatest(getCrops.type, getCropsSaga);
  yield takeLatest(getCropVarieties.type, getCropVarietiesSaga);
  yield takeLatest(selectFarm.type, selectFarmSaga);
  yield takeLeading(selectFarmAndFetchAll.type, selectFarmAndFetchAllSaga);
  yield takeLatest(getDocuments.type, getDocumentsSaga);
  yield takeLatest(
    getManagementPlanAndPlantingMethodSuccess.type,
    getManagementPlanAndPlantingMethodSuccessSaga,
  );
  yield takeLeading(getManagementPlansAndTasks.type, getManagementPlansAndTasksSaga);
  yield takeLatest(getCropsAndManagementPlans.type, getCropsAndManagementPlansSaga);
  yield takeLatest(getNotification.type, notificationSaga);
}
