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

import { all, call, put, race, select, take, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig, { url } from '../apiConfig';
import history from '../history';
import {
  loginSelector,
  patchFarmSuccess,
  putUserSuccess,
  selectFarmSuccess,
  userFarmSelector,
} from './userFarmSlice';
import { createAction } from '@reduxjs/toolkit';
import { logUserInfoSuccess, userLogReducerSelector } from './userLogSlice';
import { getFieldsSuccess, onLoadingFieldFail, onLoadingFieldStart } from './fieldSlice';
import { getBarnsSuccess, onLoadingBarnFail, onLoadingBarnStart } from './barnSlice';
import {
  getNaturalAreasSuccess,
  onLoadingNaturalAreaFail,
  onLoadingNaturalAreaStart,
} from './naturalAreaSlice';
import {
  getCeremonialsSuccess,
  onLoadingCeremonialFail,
  onLoadingCeremonialStart,
} from './ceremonialSlice';
import {
  getFarmSiteBoundarysSuccess,
  onLoadingFarmSiteBoundaryFail,
  onLoadingFarmSiteBoundaryStart,
} from './farmSiteBoundarySlice';
import {
  getResidencesSuccess,
  onLoadingResidenceFail,
  onLoadingResidenceStart,
} from './residenceSlice';
import {
  getGreenhousesSuccess,
  onLoadingGreenhouseFail,
  onLoadingGreenhouseStart,
} from './greenhouseSlice';
import {
  getSurfaceWatersSuccess,
  onLoadingSurfaceWaterFail,
  onLoadingSurfaceWaterStart,
} from './surfaceWaterSlice';
import {
  getBufferZonesSuccess,
  onLoadingBufferZoneFail,
  onLoadingBufferZoneStart,
} from './bufferZoneSlice';
import {
  getWatercoursesSuccess,
  onLoadingWatercourseFail,
  onLoadingWatercourseStart,
} from './watercourseSlice';
import { getFencesSuccess, onLoadingFenceFail, onLoadingFenceStart } from './fenceSlice';
import {
  getWaterValvesSuccess,
  onLoadingWaterValveFail,
  onLoadingWaterValveStart,
} from './waterValveSlice';
import { getGatesSuccess, onLoadingGateFail, onLoadingGateStart } from './gateSlice';
import {
  cropVersionSelector,
  getAllCropsSuccess,
  onLoadingCropFail,
  onLoadingCropStart,
  setCropVersion,
} from './cropSlice';
import {
  getManagementPlansSuccess,
  onLoadingManagementPlanFail,
  onLoadingManagementPlanStart,
} from './managementPlanSlice';
import i18n from '../locales/i18n';
import { getExpense, getSales } from './Finances/actions';
import { logout } from '../util/jwt';
import { getGardensSuccess, onLoadingGardenFail, onLoadingGardenStart } from './gardenSlice';
import { getRoles } from './InviteUser/saga';
import { getAllUserFarmsByFarmId } from './Profile/People/saga';
import {
  getAllSupportedCertifications,
  getAllSupportedCertifiers,
  getCertificationSurveys,
} from './OrganicCertifierSurvey/saga';
import {
  getAllCropVarietiesSuccess,
  onLoadingCropVarietyFail,
  onLoadingCropVarietyStart,
} from './cropVarietySlice';
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
  getBedMethodsSuccess,
  onLoadingBedMethodFail,
  onLoadingBedMethodStart,
} from './bedMethodSlice';
import {
  getRowMethodsSuccess,
  onLoadingRowMethodFail,
  onLoadingRowMethodStart,
} from './rowMethodSlice';
import {
  getAllDocumentsSuccess,
  onLoadingDocumentFail,
  onLoadingDocumentStart,
} from './documentSlice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from './Snackbar/snackbarSlice';
import {
  getCropManagementPlansSuccess,
  onLoadingCropManagementPlanFail,
  onLoadingCropManagementPlanStart,
} from './cropManagementPlanSlice';
import {
  getPlantingManagementPlansSuccess,
  onLoadingPlantingManagementPlanFail,
  onLoadingPlantingManagementPlanStart,
} from './plantingManagementPlanSlice';
import {
  getHarvestUseTypes,
  getHarvestUseTypesSaga,
  getProducts,
  getProductsSaga,
  getTasks,
  getTasksSaga,
  getTaskTypes,
  getTaskTypesSaga,
} from './Task/saga';
import {
  getCertificationSurveysSuccess,
  onLoadingCertifierSurveyFail,
} from './OrganicCertifierSurvey/slice';

const logUserInfoUrl = () => `${url}/userLog`;
const getCropsByFarmIdUrl = (farm_id) => `${url}/crop/farm/${farm_id}`;
const getLocationsUrl = (farm_id) => `${url}/location/farm/${farm_id}`;

export const axios = require('axios');
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error?.response?.status === 401) {
      if (localStorage.getItem('id_token')) {
        logout();
      }
    }
    return Promise.reject(error);
  },
);

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
  let data = user;
  if (data.wage === null) {
    delete data.wage;
  }
  if (data.phone_number === null) {
    delete data.phone_number;
  }
  try {
    const result = yield call(axios.put, userUrl + '/' + user_id, data, header);
    yield put(putUserSuccess({ ...user, farm_id }));
    i18n.changeLanguage(user.language_preference);
    localStorage.setItem('litefarm_lang', user.language_preference);
    yield put(enqueueSuccessSnackbar(i18n.t('message:USER.SUCCESS.UPDATE')));
  } catch (e) {
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
    const crop_version = yield select(cropVersionSelector);
    const result = yield call(
      axios.get,
      `${cropURL}/farm/${farm_id}?crop_version=${crop_version}`,
      header,
    );
    yield put(getAllCropsSuccess(result.data));
    yield put(setCropVersion());
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
    yield put(getLocations());
    yield put(getManagementPlans());
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:FARM.ERROR.FETCH')));
  }
}

export const putFarm = createAction(`putFarmSaga`);

export function* putFarmSaga({ payload: farm }) {
  const { farmUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  // OC: We should never update address information of a farm.
  let { address, grid_points, ...data } = farm;
  if (data.farm_phone_number === null) {
    delete data.farm_phone_number;
  }
  try {
    const result = yield call(axios.put, farmUrl + '/' + farm_id, data, header);
    yield put(patchFarmSuccess(data));
    yield put(enqueueSuccessSnackbar(i18n.t('message:FARM.SUCCESS.UPDATE')));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:FARM.ERROR.UPDATE')));
  }
}

export const onLoadingLocationStart = createAction('onLoadingLocationStartSaga');

export function* onLoadingLocationStartSaga() {
  yield put(onLoadingFieldStart());
  yield put(onLoadingGardenStart());
  yield put(onLoadingCeremonialStart());
  yield put(onLoadingBarnStart());
  yield put(onLoadingFarmSiteBoundaryStart());
  yield put(onLoadingGreenhouseStart());
  yield put(onLoadingSurfaceWaterStart());
  yield put(onLoadingNaturalAreaStart());
  yield put(onLoadingResidenceStart());
  yield put(onLoadingBufferZoneStart());
  yield put(onLoadingWatercourseStart());
  yield put(onLoadingFenceStart());
  yield put(onLoadingGateStart());
  yield put(onLoadingWaterValveStart());
}

export const getLocations = createAction('getLocationsSaga');

export function* getLocationsSaga() {
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingLocationStart());
    const result = yield call(axios.get, getLocationsUrl(farm_id), header);
    yield put(getLocationsSuccess(result.data));
  } catch (e) {
    console.log('failed to fetch fields from database');
  }
}

export const getLocationsSuccess = createAction('getLocationsSuccessSaga');

export function* getLocationsSuccessSaga({ payload: locations }) {
  const locations_by_figure_type = Object.keys(figureTypeActionMap).reduce(
    (map, locationType) => Object.assign(map, { [locationType]: [] }),
    {},
  );
  for (const location of locations) {
    locations_by_figure_type[location.figure.type].push(location);
  }
  for (const figure_type in figureTypeActionMap) {
    try {
      yield put(figureTypeActionMap[figure_type].success(locations_by_figure_type[figure_type]));
    } catch (e) {
      yield put(figureTypeActionMap[figure_type].fail(e));
      console.log(e);
    }
  }
}

const figureTypeActionMap = {
  field: { success: getFieldsSuccess, fail: onLoadingFieldFail },
  garden: { success: getGardensSuccess, fail: onLoadingGardenFail },
  barn: { success: getBarnsSuccess, fail: onLoadingBarnFail },
  ceremonial_area: { success: getCeremonialsSuccess, fail: onLoadingCeremonialFail },
  farm_site_boundary: { success: getFarmSiteBoundarysSuccess, fail: onLoadingFarmSiteBoundaryFail },
  greenhouse: { success: getGreenhousesSuccess, fail: onLoadingGreenhouseFail },
  surface_water: { success: getSurfaceWatersSuccess, fail: onLoadingSurfaceWaterFail },
  natural_area: { success: getNaturalAreasSuccess, fail: onLoadingNaturalAreaFail },
  residence: { success: getResidencesSuccess, fail: onLoadingResidenceFail },
  buffer_zone: { success: getBufferZonesSuccess, fail: onLoadingBufferZoneFail },
  watercourse: { success: getWatercoursesSuccess, fail: onLoadingWatercourseFail },
  fence: { success: getFencesSuccess, fail: onLoadingFenceFail },
  gate: { success: getGatesSuccess, fail: onLoadingGateFail },
  water_valve: { success: getWaterValvesSuccess, fail: onLoadingWaterValveFail },
};

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
    yield call(getManagementPlanAndPlantingMethodSuccessSaga, { payload: result.data });
  } catch (e) {
    console.log(e);
    yield put(onLoadingManagementPlanFail(e));
    yield put(onLoadingCropManagementPlanFail(e));
    yield put(onLoadingPlantingManagementPlanFail(e));
    console.log('failed to fetch field crops from db');
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
    yield put(onLoadingManagementPlanFail());
    console.log('failed to fetch field crops by date');
  }
}

export const getCropsAndManagementPlans = createAction('getCropsAndManagementPlansSaga');

export function* getCropsAndManagementPlansSaga() {
  try {
    yield all([call(getLocationsSaga), call(getCropsSaga)]);
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
  let { user_id, farm_id } = yield select(loginSelector);
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
      yield call(axios.post, logUserInfoUrl(), data, header);
    } else if (prev_farm_id !== farm_id) {
      yield put(logUserInfoSuccess(farm_id));
      yield call(axios.post, logUserInfoUrl(), data, header);
    }
  } catch (e) {
    console.log('failed to fetch field crops by date');
  }
}

export const selectFarmAndFetchAll = createAction('selectFarmAndFetchAllSaga');

export function* selectFarmAndFetchAllSaga({ payload: userFarm }) {
  try {
    yield put(selectFarmSuccess(userFarm));
    const { has_consent, user_id, farm_id } = yield select(userFarmSelector);
    if (!has_consent) return;

    const tasks = [
      put(getCertificationSurveys()),
      put(getAllSupportedCertifications()),
      put(getAllSupportedCertifiers()),
      put(getCrops()),
      put(getCropVarieties()),
      put(getLocations()),
      put(getManagementPlans()),
      put(getRoles()),
      put(getAllUserFarmsByFarmId()),
      put(getTaskTypes()),
      put(getTasks()),
      put(getHarvestUseTypes()),
      put(getProducts()),
    ];

    yield all([
      ...tasks,
      // put(getLogs()),
      // put(getAllShifts()),
      put(getSales()),
      put(getExpense()),
      // put(resetLogFilter()),
      // put(resetShiftFilter()),
    ]);

    const {
      data: { farm_token },
    } = yield call(axios.get, `${url}/farm_token/farm/${farm_id}`, getHeader(user_id, farm_id));
    localStorage.setItem('farm_token', farm_token);
  } catch (e) {
    console.error('failed to fetch farm info', e);
  }
}

export const waitForCertificationSurveyResultAndPushToHome = createAction(
  'waitForCertificationSurveyResultAndPushToHomeSaga',
);

export function* waitForCertificationSurveyResultAndPushToHomeSaga() {
  console.log('waitForCertificationSurveyResultAndPushSaga');
  yield race([take(getCertificationSurveysSuccess.type), take(onLoadingCertifierSurveyFail.type)]);
  history.push({ pathname: '/' });
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
  yield takeLeading(updateUser.type, updateUserSaga);
  yield takeLatest(getFarmInfo.type, getFarmInfoSaga);
  yield takeLeading(putFarm.type, putFarmSaga);
  yield takeLatest(getLocations.type, getLocationsSaga);
  yield takeLatest(getManagementPlansByDate.type, getManagementPlansSaga);
  yield takeLatest(getManagementPlans.type, getManagementPlansSaga);
  yield takeLatest(getCrops.type, getCropsSaga);
  yield takeLatest(getCropVarieties.type, getCropVarietiesSaga);
  yield takeLatest(selectFarmAndFetchAll.type, selectFarmAndFetchAllSaga);
  yield takeLatest(onLoadingLocationStart.type, onLoadingLocationStartSaga);
  yield takeLatest(getLocationsSuccess.type, getLocationsSuccessSaga);
  yield takeLatest(getDocuments.type, getDocumentsSaga);
  yield takeLatest(
    getManagementPlanAndPlantingMethodSuccess.type,
    getManagementPlanAndPlantingMethodSuccessSaga,
  );
  yield takeLatest(
    waitForCertificationSurveyResultAndPushToHome.type,
    waitForCertificationSurveyResultAndPushToHomeSaga,
  );
  yield takeLatest(getManagementPlansAndTasks.type, getManagementPlansAndTasksSaga);
  yield takeLatest(getCropsAndManagementPlans.type, getCropsAndManagementPlansSaga);
}
