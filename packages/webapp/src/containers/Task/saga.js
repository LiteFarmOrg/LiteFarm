import { all, call, delay, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { axios, getHeader, getPlantingManagementPlansSuccessSaga, onReqSuccessSaga } from '../saga';
import i18n from '../../locales/i18n';
import { loginSelector, putUserSuccess } from '../userFarmSlice';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import {
  addManyTasksFromGetReq,
  addAllTasksFromGetReq,
  putTasksSuccess,
  putTaskSuccess,
  deleteTaskSuccess,
} from '../taskSlice';
import { getProductsSuccess, onLoadingProductFail, onLoadingProductStart } from '../productSlice';
import {
  deleteTaskTypeSuccess,
  getTaskTypesSuccess,
  taskTypeEntitiesSelector,
  taskTypeSelector,
} from '../taskTypeSlice';
import { pick } from '../../util/pick';
import produce from 'immer';
import { getObjectInnerValues } from '../../util';
import {
  getAllCleaningTasksSuccess,
  getCleaningTasksSuccess,
  onLoadingCleaningTaskFail,
  onLoadingCleaningTaskStart,
} from '../slice/taskSlice/cleaningTaskSlice';
import {
  getAllFieldWorkTasksSuccess,
  getFieldWorkTasksSuccess,
  onLoadingFieldWorkTaskFail,
  onLoadingFieldWorkTaskStart,
} from '../slice/taskSlice/fieldWorkTaskSlice';
import {
  getAllIrrigationTasksSuccess,
  getIrrigationTasksSuccess,
  onLoadingIrrigationTaskFail,
  onLoadingIrrigationTaskStart,
} from '../slice/taskSlice/irrigationTaskSlice';
import {
  getAllPestControlTasksSuccess,
  getPestControlTasksSuccess,
  onLoadingPestControlTaskFail,
  onLoadingPestControlTaskStart,
} from '../slice/taskSlice/pestControlTaskSlice';
import {
  getAllSoilAmendmentTasksSuccess,
  getSoilAmendmentTasksSuccess,
  onLoadingSoilAmendmentTaskFail,
  onLoadingSoilAmendmentTaskStart,
} from '../slice/taskSlice/soilAmendmentTaskSlice';
import {
  getAlllHarvestTasksSuccess,
  getHarvestTasksSuccess,
  onLoadingHarvestTaskFail,
  onLoadingHarvestTaskStart,
} from '../slice/taskSlice/harvestTaskSlice';
import {
  getAllPlantTasksSuccess,
  getPlantTasksSuccess,
  onLoadingPlantTaskFail,
  onLoadingPlantTaskStart,
} from '../slice/taskSlice/plantTaskSlice';
import {
  deleteTransplantTaskSuccess,
  getAllTransplantTasksSuccess,
  getTransplantTasksSuccess,
  onLoadingTransplantTaskFail,
  onLoadingTransplantTaskStart,
} from '../slice/taskSlice/transplantTaskSlice';
import {
  getAllAnimalMovementTasksSuccess,
  getAnimalMovementTasksSuccess,
  onLoadingAnimalMovementTaskFail,
  onLoadingAnimalMovementTaskStart,
} from '../slice/taskSlice/animalMovementTaskSlice';
import {
  getAllSoilSampleTasksSuccess,
  getSoilSampleTasksSuccess,
  onLoadingSoilSampleTaskFail,
  onLoadingSoilSampleTaskStart,
} from '../slice/taskSlice/soilSampleTaskSlice';
import { getPlantingMethodReqBody } from '../Crop/AddManagementPlan/ManagementPlanName/getManagementPlanReqBody';

import {
  getHarvestUseTypesSuccess,
  onLoadingHarvestUseTypeFail,
  onLoadingHarvestUseTypeStart,
} from '../harvestUseTypeSlice';
import { managementPlanWithCurrentLocationEntitiesSelector } from './TaskCrops/managementPlansWithLocationSelector';
import {
  createBeforeCompleteTaskUrl,
  createCompleteHarvestQuantityTaskUrl,
  createCompleteTaskUrl,
} from '../../util/siteMapConstants';
import { setFormData, setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { formatSoilAmendmentProductToDBStructure, getSubtaskName } from '../../util/task';
import {
  formatAnimalIdsForReqBody,
  getCompleteMovementTaskBody,
  getCompleteSoilSampleTaskBody,
  getEndpoint,
  getMovementTaskBody,
  getSoilSampleTaskBody,
} from './sagaUtils';
import { api } from '../../store/api/apiSlice';

const taskTypeEndpoint = [
  'cleaning_task',
  'field_work_task',
  'pest_control_task',
  'soil_amendment_task',
  'harvest_tasks',
  'irrigation_task',
  'animal_movement_task',
];

// TypeScript complains without payload.
// https://redux-toolkit.js.org/api/createAction#using-prepare-callbacks-to-customize-action-contents
export const getProducts = createAction('getProductsSaga', function prepare(payload) {
  return { payload };
});

export function* getProductsSaga({ payload } = {}) {
  const { productsUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingProductStart());
    const result = yield call(axios.get, `${productsUrl}/farm/${farm_id}`, header);
    yield put(getProductsSuccess(result.data));

    if (payload?.callback) {
      yield call(payload.callback, result.data);
    }
  } catch (e) {
    yield put(onLoadingProductFail());
    console.log('failed to fetch products', e);
  }
}

export const assignTask = createAction('assignTaskSaga');

export function* assignTaskSaga({ payload: { task_id, assignee_user_id } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/assign/${task_id}`,
      { assignee_user_id: assignee_user_id },
      header,
    );
    yield put(putTaskSuccess({ assignee_user_id, task_id }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:ASSIGN_TASK.SUCCESS')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:ASSIGN_TASK.ERROR')));
  }
}

export const assignTasksOnDate = createAction('assignTaskOnDateSaga');

export function* assignTaskOnDateSaga({ payload: { task_id, date, assignee_user_id } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/assign_all_tasks_on_date/${task_id}`,
      { assignee_user_id: assignee_user_id, date: date },
      header,
    );
    let modified_tasks = [];
    for (let i = 0; i < result.data.length; i++) {
      modified_tasks.push({
        id: result.data[i].task_id,
        changes: { assignee_user_id },
      });
    }
    yield put(putTasksSuccess(modified_tasks));
    yield put(enqueueSuccessSnackbar(i18n.t('message:ASSIGN_TASK.SUCCESS')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:ASSIGN_TASK.ERROR')));
  }
}

export const changeTaskDate = createAction('changeTaskDateSaga');

export function* changeTaskDateSaga({ payload: { task_id, due_date } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/patch_due_date/${task_id}`,
      { due_date },
      header,
    );

    yield put(putTaskSuccess({ due_date, task_id }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:ASSIGN_TASK.SUCCESS')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:ASSIGN_TASK.ERROR')));
  }
}

export const changeTaskWage = createAction('changeTaskWageSaga');

export function* changeTaskWageSaga({ payload: { task_id, wage_at_moment } }) {
  const { taskUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield call(axios.patch, `${taskUrl}/patch_wage/${task_id}`, { wage_at_moment }, header);
    yield put(putTaskSuccess({ wage_at_moment, task_id }));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK.UPDATE.FAILED')));
  }
}

export const updateUserFarmWage = createAction('updateUserFarmWageSaga');

export function* updateUserFarmWageSaga({ payload: user }) {
  const { userFarmUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const target_user_id = user.user_id;
  const patchWageUrl = `${userFarmUrl}/wage/farm/${farm_id}/user/${target_user_id}`;
  const header = getHeader(user_id, farm_id);
  try {
    yield call(axios.patch, patchWageUrl, user, header);
    yield put(putUserSuccess({ ...user, farm_id }));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.UPDATE')));
    console.error(e);
  }
}

export const setUserFarmWageDoNotAskAgain = createAction('setUserFarmWageDoNotAskAgainSaga');

export function* setUserFarmWageDoNotAskAgainSaga({ payload: user }) {
  const { userFarmUrl } = apiConfig;
  const { user_id, farm_id } = yield select(loginSelector);
  const target_user_id = user.user_id;
  const patchWageDoNotAskAgainUrl = `${userFarmUrl}/wage_do_not_ask_again/farm/${farm_id}/user/${target_user_id}`;
  const header = getHeader(user_id, farm_id);
  try {
    yield call(axios.patch, patchWageDoNotAskAgainUrl, user, header);
    yield put(putUserSuccess({ ...user, farm_id, wage_do_not_ask_again: true }));
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:USER.ERROR.UPDATE')));
    console.error(e);
  }
}

export const getPlantingTasksAndPlantingManagementPlansSuccess = createAction(
  'getPlantingTasksAndPlantingManagementPlansSuccessSaga',
);

export function* getPlantingTasksAndPlantingManagementPlansSuccessSaga({
  payload: { tasks, getAll = false },
}) {
  const getTasksSuccessFunc = getAll ? getAllPlantTasksSuccess : getPlantTasksSuccess;

  yield put(
    getTasksSuccessFunc(
      tasks.map((task) => ({
        ...task,
        planting_management_plan_id:
          task.planting_management_plan_id ||
          task.planting_management_plan.planting_management_plan_id,
      })),
    ),
  );
  yield all([
    getPlantingManagementPlansSuccessSaga({
      payload: tasks
        .map((task) => task.planting_management_plan)
        .filter((planting_management_plan) => planting_management_plan),
    }),
  ]);
}

export const getTransplantTasksAndPlantingManagementPlansSuccess = createAction(
  'getTransplantTasksAndPlantingManagementPlansSuccessSaga',
);

export function* getTransplantTasksAndPlantingManagementPlansSuccessSaga({
  payload: { tasks, getAll = false },
}) {
  const getTasksSuccessFunc = getAll ? getAllTransplantTasksSuccess : getTransplantTasksSuccess;

  yield put(
    getTasksSuccessFunc(
      tasks.map((task) => ({
        ...task,
        planting_management_plan_id:
          task.planting_management_plan_id ||
          task.planting_management_plan.planting_management_plan_id,
      })),
    ),
  );
  yield call(getPlantingManagementPlansSuccessSaga, {
    payload: tasks
      .map((task) => task.planting_management_plan)
      .filter((planting_management_plan) => planting_management_plan),
  });
}

// TODO: fix call(getTransplantTasksAndPlantingManagementPlansSuccessSaga) racing condition walk around
const taskTypeActionMap = {
  CLEANING_TASK: {
    success: (tasks) => put(getCleaningTasksSuccess(tasks)),
    getAllSuccess: (tasks) => put(getAllCleaningTasksSuccess(tasks)),
    fail: onLoadingCleaningTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
  FIELD_WORK_TASK: {
    success: (tasks) => put(getFieldWorkTasksSuccess(tasks)),
    getAllSuccess: (tasks) => put(getAllFieldWorkTasksSuccess(tasks)),
    fail: onLoadingFieldWorkTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
  IRRIGATION_TASK: {
    success: (tasks) => put(getIrrigationTasksSuccess(tasks)),
    getAllSuccess: (tasks) => put(getAllIrrigationTasksSuccess(tasks)),
    fail: onLoadingIrrigationTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
  PEST_CONTROL_TASK: {
    success: (tasks) => put(getPestControlTasksSuccess(tasks)),
    getAllSuccess: (tasks) => put(getAllPestControlTasksSuccess(tasks)),
    fail: onLoadingPestControlTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
  SOIL_AMENDMENT_TASK: {
    success: (tasks) => put(getSoilAmendmentTasksSuccess(tasks)),
    getAllSuccess: (tasks) => put(getAllSoilAmendmentTasksSuccess(tasks)),
    fail: onLoadingSoilAmendmentTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
  HARVEST_TASK: {
    success: (tasks) => put(getHarvestTasksSuccess(tasks)),
    getAllSuccess: (tasks) => put(getAlllHarvestTasksSuccess(tasks)),
    fail: onLoadingHarvestTaskFail,
    completeUrl: (id) => createCompleteHarvestQuantityTaskUrl(id),
  },
  PLANT_TASK: {
    success: (tasks) =>
      call(getPlantingTasksAndPlantingManagementPlansSuccessSaga, { payload: { tasks } }),
    getAllSuccess: (tasks) =>
      call(getPlantingTasksAndPlantingManagementPlansSuccessSaga, {
        payload: { tasks, getAll: true },
      }),
    fail: onLoadingPlantTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
  TRANSPLANT_TASK: {
    success: (tasks) =>
      call(getTransplantTasksAndPlantingManagementPlansSuccessSaga, { payload: { tasks } }),
    getAllSuccess: (tasks) =>
      call(getTransplantTasksAndPlantingManagementPlansSuccessSaga, {
        payload: { tasks, getAll: true },
      }),
    fail: onLoadingTransplantTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
  MOVEMENT_TASK: {
    success: (tasks) => put(getAnimalMovementTasksSuccess(tasks)),
    getAllSuccess: (tasks) => put(getAllAnimalMovementTasksSuccess(tasks)),
    fail: onLoadingAnimalMovementTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
  SOIL_SAMPLE_TASK: {
    success: (tasks) => put(getSoilSampleTasksSuccess(tasks)),
    getAllSuccess: (tasks) => put(getAllSoilSampleTasksSuccess(tasks)),
    fail: onLoadingSoilSampleTaskFail,
    completeUrl: (id) => createBeforeCompleteTaskUrl(id),
  },
};

export const onLoadingTaskStart = createAction('onLoadingTaskStartSaga');

export function* onLoadingTaskStartSaga() {
  yield put(onLoadingCleaningTaskStart());
  yield put(onLoadingFieldWorkTaskStart());
  yield put(onLoadingPestControlTaskStart());
  yield put(onLoadingSoilAmendmentTaskStart());
  yield put(onLoadingHarvestTaskStart());
  yield put(onLoadingPlantTaskStart());
  yield put(onLoadingTransplantTaskStart());
  yield put(onLoadingIrrigationTaskStart());
  yield put(onLoadingAnimalMovementTaskStart());
  yield put(onLoadingSoilSampleTaskStart());
}

function* handleGetTasksSuccess(tasks, isGetAll = false) {
  const successAction = isGetAll ? addAllTasksFromGetReq : addManyTasksFromGetReq;
  const taskTypeSuccessActionKey = isGetAll ? 'getAllSuccess' : 'success';

  const taskTypeEntities = yield select(taskTypeEntitiesSelector);
  const tasksByTranslationKeyDefault = Object.keys(taskTypeActionMap).reduce(
    (tasksByTranslationKeyDefault, task_translation_key) => {
      tasksByTranslationKeyDefault[task_translation_key] = [];
      return tasksByTranslationKeyDefault;
    },
    {},
  );
  const tasksByTranslationKey = tasks.reduce((tasksByTranslationKey, task) => {
    const { task_translation_key } = taskTypeEntities[task.task_type_id];
    if (taskTypeActionMap[task_translation_key]) {
      tasksByTranslationKey[task_translation_key].push(task[getSubtaskName(task_translation_key)]);
    }
    return tasksByTranslationKey;
  }, tasksByTranslationKeyDefault);

  for (const task_translation_key in taskTypeActionMap) {
    try {
      yield taskTypeActionMap[task_translation_key][taskTypeSuccessActionKey](
        tasksByTranslationKey[task_translation_key],
      );
    } catch (e) {
      yield put(taskTypeActionMap[task_translation_key].fail(e));
      console.log(e);
    }
  }

  yield put(successAction(tasks));
}

export function* getTasksSuccessSaga({ payload: tasks }) {
  yield handleGetTasksSuccess(tasks);
}

export const getTasks = createAction('getTasksSaga');

export function* getTasksSaga() {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingTaskStart());
    const result = yield call(axios.get, `${taskUrl}/${farm_id}`, header);
    yield call(getAllTasksSuccessSaga, { payload: result.data });
  } catch (e) {
    console.log(e);
  }
}

export function* getAllTasksSuccessSaga({ payload: tasks }) {
  yield handleGetTasksSuccess(tasks, true);
}

export const getPostTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  return getObjectInnerValues(
    produce(data, (data) => {
      const propertiesToRemove = taskTypeEndpoint.filter((taskType) => taskType !== endpoint);
      for (const key of propertiesToRemove) {
        delete data[key];
      }
      data.wage_at_moment = data.override_hourly_wage ? data.wage_at_moment : null;
      data.managementPlans = data.managementPlans?.map(({ management_plan_id }) => ({
        planting_management_plan_id:
          managementPlanWithCurrentLocationEntities[management_plan_id].planting_management_plan
            .planting_management_plan_id,
      }));
      delete data['show_wild_crop'];
      if (data.animalIds) {
        // Format animalIds for the request body
        const { related_animal_ids, related_batch_ids } = formatAnimalIdsForReqBody(data.animalIds);
        data.related_animal_ids = related_animal_ids;
        data.related_batch_ids = related_batch_ids;
        delete data['animalIds'];
      }
    }),
  );
};

const getPostHarvestTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  return data.harvest_tasks.map((harvest_task) => {
    const { location_id, management_plan_id } = harvest_task;
    return getObjectInnerValues({
      harvest_task: {
        ...harvest_task,
        location_id: undefined,
        management_plan_id: undefined,
        id: undefined,
        notes: undefined,
      },
      ...pick(
        data,
        Object.keys(data).filter((key) => !taskTypeEndpoint.includes(key)),
      ),
      wage_at_moment: data.override_hourly_wage ? data.wage_at_moment : undefined,
      locations: location_id === 'PIN_LOCATION' ? undefined : [{ location_id }],
      managementPlans: [
        {
          planting_management_plan_id:
            managementPlanWithCurrentLocationEntities[management_plan_id].planting_management_plan
              .planting_management_plan_id,
        },
      ],
      notes: harvest_task.notes,
      show_wild_crop: undefined,
    });
  });
};

const getTransplantTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  const management_plan_id = data.managementPlans[0].management_plan_id;
  return produce(
    getPostTaskBody(data, 'transplant_task', managementPlanWithCurrentLocationEntities),
    (data) => {
      data.transplant_task.planting_management_plan.location_id = data.locations[0].location_id;
      data.transplant_task.prev_planting_management_plan_id =
        managementPlanWithCurrentLocationEntities[
          management_plan_id
        ].planting_management_plan.planting_management_plan_id;
      data.transplant_task.planting_management_plan = getPlantingMethodReqBody(
        data.transplant_task.planting_management_plan,
        { management_plan_id },
      );
      delete data.crop_management_plan;
      delete data.managementPlans;
      delete data.locations;
    },
  );
};

const getIrrigationTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  const irrigation_task_type =
    data.irrigation_task?.irrigation_type_name.value === 'OTHER'
      ? data.irrigation_task?.irrigation_task_type_other
      : data.irrigation_task?.irrigation_type_name.value;
  return produce(
    getPostTaskBody(data, 'irrigation_task', managementPlanWithCurrentLocationEntities),
    (data) => {
      data.irrigation_task = {
        ...data.irrigation_task,
        irrigation_type_name: irrigation_task_type,
        location_id: data.locations[0]?.location_id,
      };
      data.location_defaults = data.locations.map((location) => ({
        location_id: location.location_id,
        irrigation_task_type: data.irrigation_task.default_irrigation_task_type_location
          ? irrigation_task_type
          : undefined,
        ...(data.irrigation_task.default_location_application_depth
          ? pick(data.irrigation_task, ['application_depth', 'application_depth_unit'])
          : null),
        ...(data.irrigation_task.default_location_flow_rate
          ? pick(data.irrigation_task, ['estimated_flow_rate', 'estimated_flow_rate_unit'])
          : null),
      }));
      !data.irrigation_task?.estimated_water_usage &&
        delete data.irrigation_task?.estimated_water_usage_unit;
      for (const element in data.irrigation_task) {
        [
          'irrigation_task_type_other',
          'percent_of_location_irrigated_unit',
          'irrigated_area',
          'irrigated_area_unit',
          'location_size',
          'location_size_unit',
        ].includes(element) && delete data.irrigation_task[element];
      }
    },
  );
};

const getSoilAmendmentTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  return {
    ...getPostTaskBody(data, endpoint, managementPlanWithCurrentLocationEntities),
    soil_amendment_task_products: formatSoilAmendmentProductToDBStructure(
      data.soil_amendment_task_products,
    ),
  };
};

const taskTypeGetPostTaskBodyFunctionMap = {
  CLEANING_TASK: getPostTaskBody,
  FIELD_WORK_TASK: getPostTaskBody,
  PEST_CONTROL_TASK: getPostTaskBody,
  SOIL_AMENDMENT_TASK: getSoilAmendmentTaskBody,
  HARVEST_TASK: getPostHarvestTaskBody,
  TRANSPLANT_TASK: getTransplantTaskBody,
  IRRIGATION_TASK: getIrrigationTaskBody,
  MOVEMENT_TASK: getMovementTaskBody,
  SOIL_SAMPLE_TASK: getSoilSampleTaskBody,
};

const getPostTaskReqBody = (
  data,
  endpoint,
  task_translation_key,
  isCustomTask,
  managementPlanWithCurrentLocationEntities,
) => {
  if (isCustomTask)
    return getPostTaskBody(data, endpoint, managementPlanWithCurrentLocationEntities);
  return taskTypeGetPostTaskBodyFunctionMap[task_translation_key](
    data,
    endpoint,
    managementPlanWithCurrentLocationEntities,
  );
};

const getTaskCompletePathname = (
  task_id,
  task_translation_key,
  isCustomTaskWithAnimals = false,
) => {
  if (taskTypeActionMap[task_translation_key]) {
    return taskTypeActionMap[task_translation_key].completeUrl(task_id);
  } else {
    // Custom tasks
    return createCompleteTaskUrl(task_id, isCustomTaskWithAnimals);
  }
};

export const createTask = createAction('createTaskSaga');

export function* createTaskSaga({ payload }) {
  let { alreadyCompleted, returnPath, setShowCannotCreateModal, ...data } = payload;
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_translation_key, farm_id: task_farm_id } = yield select(
    taskTypeSelector(data.task_type_id),
  );
  const header = getHeader(user_id, farm_id);
  const isCustomTask = !!task_farm_id;
  const isHarvest = task_translation_key === 'HARVEST_TASK';
  const endpoint = getEndpoint(isCustomTask, task_translation_key, true);
  try {
    const managementPlanWithCurrentLocationEntities = yield select(
      managementPlanWithCurrentLocationEntitiesSelector,
    );
    data = getCompleteCustomTaskTypeBody(data, task_translation_key);
    const result = yield call(
      axios.post,
      `${taskUrl}/${endpoint}`,
      getPostTaskReqBody(
        data,
        endpoint,
        task_translation_key,
        isCustomTask,
        managementPlanWithCurrentLocationEntities,
      ),
      header,
    );
    if (result) {
      const { task_id, taskType } =
        task_translation_key === 'HARVEST_TASK' ? result.data[0] : result.data;
      yield call(getTasksSuccessSaga, { payload: isHarvest ? result.data : [result.data] });
      if (task_translation_key === 'IRRIGATION_TASK') {
        yield put(api.util.invalidateTags(['IrrigationPrescriptions']));
      }
      if (alreadyCompleted) {
        const isCustomTaskWithAnimals =
          isCustomTask && (result.data.animals?.length || result.data.animal_batches?.length);
        yield call(onReqSuccessSaga, {
          message: i18n.t('message:TASK.CREATE.SUCCESS'),
          pathname: getTaskCompletePathname(task_id, task_translation_key, isCustomTaskWithAnimals),
        });
        if (isCustomTask) {
          yield put(
            setPersistedPaths([`/tasks/${task_id}/complete`, `/tasks/${task_id}/before_complete`]),
          );
          yield delay(500);
          yield put(setFormData({ task_id, taskType }));
        }
      } else {
        yield call(onReqSuccessSaga, {
          message: i18n.t('message:TASK.CREATE.SUCCESS'),
          pathname: returnPath ?? '/tasks',
        });
      }
    }
  } catch (e) {
    console.log(e);
    if (e.response.data === 'location deleted') {
      setShowCannotCreateModal(true);
    } else {
      yield put(enqueueErrorSnackbar(i18n.t('message:TASK.CREATE.FAILED')));
    }
  }
}

const getCompleteCustomTaskTypeBody = (data, task_translation_key) => {
  switch (task_translation_key) {
    case 'FIELD_WORK_TASK': {
      return getCompleteFieldWorkTaskBody(data, task_translation_key);
    }
    default: {
      return data;
    }
  }
};

const getCompleteFieldWorkTaskBody = (data, task_translation_key) => {
  let reqBody = { ...data };
  let field_work_name =
    reqBody?.field_work_task?.field_work_task_type?.field_work_name?.trim() || '';
  let value = reqBody?.field_work_task?.field_work_task_type?.value || '';
  let field_work_type_id = reqBody?.field_work_task?.field_work_task_type?.field_work_type_id || -1;
  let farm_id = reqBody?.field_work_task?.field_work_task_type?.farm_id || null;

  if (value === 'OTHER' && !farm_id) {
    reqBody.field_work_task = {
      field_work_task_type: {
        field_work_name,
        field_work_type_translation_key: field_work_name
          ?.trim()
          ?.toLocaleUpperCase()
          ?.replaceAll(' ', '_'),
      },
    };
  } else {
    reqBody.field_work_task = {
      field_work_type_id,
    };
    delete reqBody.field_work_task.fieldWorkTask;
  }
  return reqBody;
};

//TODO: change req shape to {...task, harvestUses}
const getCompleteHarvestTaskBody = (data) => {
  let taskData = {};
  taskData.task = data.taskData;
  let harvest_uses = [];
  data.harvest_uses.forEach((harvest_use) => {
    harvest_uses.push({
      ...getObjectInnerValues(harvest_use),
    });
  });
  taskData.harvest_uses = harvest_uses;
  return taskData;
};

const getCompletePlantingTaskBody = (task_translation_key) => (data) => {
  return produce(data, (data) => {
    const taskType = task_translation_key.toLowerCase();
    const planting_management_plan = data?.taskData?.[taskType]?.planting_management_plan;
    if (planting_management_plan) {
      data.taskData[taskType].planting_management_plan =
        getPlantingMethodReqBody(planting_management_plan);
      data.taskData[taskType].planting_management_plan.planting_management_plan_id =
        data.taskData[taskType].planting_management_plan_id;
      delete data.taskData[taskType].planting_management_plan_id;
      delete data.taskData[taskType].prev_planting_management_plan;
    }
  }).taskData;
};

const getCompleteIrrigationTaskBody = (task_translation_key) => (data) => {
  return getObjectInnerValues(
    produce(data, (data) => {
      const taskType = task_translation_key.toLowerCase();
      const irrigation_task = data.taskData[taskType];
      if (irrigation_task) {
        if (typeof data.taskData[taskType].irrigation_type_name === 'string') {
          data.taskData[taskType].irrigation_type_name = data.taskData[taskType]
            ?.irrigation_task_type_other
            ? data.taskData[taskType]?.irrigation_task_type_other
            : data.taskData[taskType]?.irrigation_type_name;
        } else {
          data.taskData[taskType].irrigation_type_name =
            data.taskData[taskType].irrigation_type_name.value === 'OTHER'
              ? data.taskData[taskType].irrigation_task_type_other
              : data.taskData[taskType].irrigation_type_name.value;
        }

        data.taskData.location_defaults = [
          {
            location_id: data.location_id,
            irrigation_task_type: data.taskData[taskType].default_irrigation_task_type_location
              ? data.taskData[taskType].irrigation_type_name
              : undefined,
            ...(data.taskData[taskType].default_location_application_depth
              ? pick(data.taskData[taskType], ['application_depth', 'application_depth_unit'])
              : null),
            ...(data.taskData[taskType].default_location_flow_rate
              ? pick(data.taskData[taskType], ['estimated_flow_rate', 'estimated_flow_rate_unit'])
              : null),
          },
        ];

        !data.taskData[taskType].estimated_water_usage &&
          delete data.taskData[taskType]?.estimated_water_usage_unit;

        if (data.location_id) {
          data.taskData[taskType].location_id = data.location_id;
          delete data.location_id;
        }

        for (const element in data.taskData[taskType]) {
          [
            'irrigation_task_type_other',
            'percent_of_location_irrigated_unit',
            'irrigated_area',
            'irrigated_area_unit',
            'location_size',
            'location_size_unit',
            'irrigation_type',
            'irrigation_type_translation_key',
          ].includes(element) && delete data.taskData[taskType][element];
        }
      }
    }).taskData,
  );
};

const getCompleteSoilAmendmentTaskBody = (data) => {
  const soilAmendmentTaskProducts = formatSoilAmendmentProductToDBStructure(
    data.soil_amendment_task_products,
  );
  return {
    ...data.taskData,
    soil_amendment_task_products: soilAmendmentTaskProducts,
  };
};

const taskTypeGetCompleteTaskBodyFunctionMap = {
  HARVEST_TASK: getCompleteHarvestTaskBody,
  TRANSPLANT_TASK: getCompletePlantingTaskBody('TRANSPLANT_TASK'),
  PLANT_TASK: getCompletePlantingTaskBody('PLANT_TASK'),
  IRRIGATION_TASK: getCompleteIrrigationTaskBody('IRRIGATION_TASK'),
  SOIL_AMENDMENT_TASK: getCompleteSoilAmendmentTaskBody,
  MOVEMENT_TASK: getCompleteMovementTaskBody,
  SOIL_SAMPLE_TASK: getCompleteSoilSampleTaskBody,
};

export const completeTask = createAction('completeTaskSaga');

export function* completeTaskSaga({ payload: { task_id, data, returnPath } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_translation_key, isCustomTaskType } = data;
  const header = getHeader(user_id, farm_id);
  const endpoint = getEndpoint(isCustomTaskType, task_translation_key);

  if (data.animalIds) {
    const formattedAnimalIds = formatAnimalIdsForReqBody(data.animalIds);
    data.taskData = { ...data.taskData, ...formattedAnimalIds };
  }

  const taskData = taskTypeGetCompleteTaskBodyFunctionMap[task_translation_key]
    ? taskTypeGetCompleteTaskBodyFunctionMap[task_translation_key](data)
    : data.taskData;

  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/complete/${endpoint}/${task_id}`,
      taskData,
      header,
    );
    if (result) {
      yield put(putTaskSuccess(result.data));

      yield call(onReqSuccessSaga, {
        message: i18n.t('message:TASK.COMPLETE.SUCCESS'),
        pathname: returnPath ?? '/tasks',
      });

      if (task_translation_key === 'MOVEMENT_TASK') {
        yield put(api.util.invalidateTags(['Animals', 'AnimalBatches']));
      }
    }
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK.COMPLETE.FAILED')));
  }
}

export const abandonTask = createAction('abandonTaskSaga');

export function* abandonTaskSaga({ payload: data }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_id, patchData, returnPath } = data;
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.patch, `${taskUrl}/abandon/${task_id}`, patchData, header);
    if (result) {
      yield put(putTaskSuccess(result.data));
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK.ABANDON.SUCCESS')));
      history.push(returnPath ?? '/tasks');
    }
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK.ABANDON.FAILED')));
  }
}

export const addCustomTaskType = createAction('addTaskTypeSaga');

export function* addTaskTypeSaga({ payload: data }) {
  const { taskTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  let { task_name } = data;
  const body = {
    task_name,
    farm_id: farm_id,
  };

  try {
    const result = yield call(axios.post, taskTypeUrl, body, header);
    if (result) {
      yield put(getTaskTypes());
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK_TYPE.CREATE.SUCCESS')));
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK_TYPE.CREATE.FAILED')));
  }
}

export const getTaskTypes = createAction('getTaskTypesSaga');

export function* getTaskTypesSaga() {
  const { taskTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, `${taskTypeUrl}/farm/${farm_id}`, header);
    if (result) {
      yield put(getTaskTypesSuccess(result.data));
    }
  } catch (e) {
    console.log('failed to fetch task types from database');
  }
}

export const deleteTaskType = createAction('deleteTaskTypeSaga');

export function* deleteTaskTypeSaga({ payload: id }) {
  const { taskTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.delete, `${taskTypeUrl}/${id}`, header);
    if (result) {
      yield put(deleteTaskTypeSuccess(id));
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK_TYPE.DELETE.SUCCESS')));
      history.back();
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK_TYPE.DELETE.FAILED')));
  }
}

export const getHarvestUseTypes = createAction('getHarvestUseTypesSaga');

export function* getHarvestUseTypesSaga() {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingHarvestUseTypeStart());
    const result = yield call(axios.get, logURL + `/harvest_use_types/farm/${farm_id}`, header);
    if (result) {
      yield put(getHarvestUseTypesSuccess(result.data));
    }
  } catch (e) {
    console.log('failed to get harvest use types');
    yield put(onLoadingHarvestUseTypeFail());
    yield put(enqueueErrorSnackbar(i18n.t('message:LOG_HARVEST.ERROR.GET_TYPES')));
  }
}

export const addCustomHarvestUse = createAction('addCustomHarvestUseSaga');

export function* addCustomHarvestUseSaga({ payload: data }) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.post,
      logURL + `/harvest_use_types/farm/${farm_id}`,
      data,
      header,
    );
    if (result) {
      // TODO - add postHarvestUseTypeSuccess
      yield put(getHarvestUseTypes());
      yield put(enqueueSuccessSnackbar(i18n.t('message:LOG_HARVEST.SUCCESS.ADD_USE_TYPE')));
    }
  } catch (e) {
    console.log('failed to add custom harvest use type');
    yield put(enqueueErrorSnackbar(i18n.t('message:LOG_HARVEST.ERROR.ADD_USE_TYPE')));
  }
}

export const deleteTask = createAction('deleteTasksSaga');

export function* deleteTaskSaga({ payload: data }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_id } = data;
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.delete, `${taskUrl}/${task_id}`, header);
    if (result) {
      const task_type = yield select(taskTypeSelector(result.data.task_type_id));
      history.back();
      if (task_type.task_translation_key === 'TRANSPLANT_TASK') {
        yield put(deleteTransplantTaskSuccess(result.data.task_id));
      }
      yield put(deleteTaskSuccess(result.data));
      if (task_type.task_translation_key === 'IRRIGATION_TASK') {
        yield put(api.util.invalidateTags(['IrrigationPrescriptions']));
      }
      yield put(enqueueSuccessSnackbar(i18n.t('TASK.DELETE.SUCCESS')));
    }
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('TASK.DELETE.FAILED')));
  }
}

export default function* taskSaga() {
  yield takeLeading(addCustomTaskType.type, addTaskTypeSaga);
  yield takeLeading(assignTask.type, assignTaskSaga);
  yield takeLeading(changeTaskDate.type, changeTaskDateSaga);
  yield takeLeading(changeTaskWage.type, changeTaskWageSaga);
  yield takeLeading(updateUserFarmWage.type, updateUserFarmWageSaga);
  yield takeLeading(setUserFarmWageDoNotAskAgain.type, setUserFarmWageDoNotAskAgainSaga);
  yield takeLeading(createTask.type, createTaskSaga);
  yield takeLatest(getTaskTypes.type, getTaskTypesSaga);
  yield takeLeading(assignTasksOnDate.type, assignTaskOnDateSaga);
  yield takeLatest(getTasks.type, getTasksSaga);
  yield takeLeading(onLoadingTaskStart.type, onLoadingTaskStartSaga);
  yield takeLatest(getProducts.type, getProductsSaga);
  yield takeLeading(completeTask.type, completeTaskSaga);
  yield takeLeading(abandonTask.type, abandonTaskSaga);
  yield takeLeading(deleteTaskType.type, deleteTaskTypeSaga);
  yield takeLatest(getHarvestUseTypes.type, getHarvestUseTypesSaga);
  yield takeLeading(addCustomHarvestUse.type, addCustomHarvestUseSaga);
  yield takeLatest(
    getTransplantTasksAndPlantingManagementPlansSuccess.type,
    getTransplantTasksAndPlantingManagementPlansSuccessSaga,
  );
  yield takeLatest(
    getPlantingTasksAndPlantingManagementPlansSuccess.type,
    getPlantingTasksAndPlantingManagementPlansSuccessSaga,
  );
  yield takeLeading(deleteTask.type, deleteTaskSaga);
}
