import { all, call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { axios, getHeader, getPlantingManagementPlansSuccessSaga } from '../saga';
import i18n from '../../locales/i18n';
import { loginSelector } from '../userFarmSlice';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { addManyTasksFromGetReq, putTasksSuccess, putTaskSuccess } from '../taskSlice';
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
  getCleaningTasksSuccess,
  onLoadingCleaningTaskFail,
  onLoadingCleaningTaskStart,
} from '../slice/taskSlice/cleaningTaskSlice';
import {
  getFieldWorkTasksSuccess,
  onLoadingFieldWorkTaskFail,
  onLoadingFieldWorkTaskStart,
} from '../slice/taskSlice/fieldWorkTaskSlice';
import {
  getPestControlTasksSuccess,
  onLoadingPestControlTaskFail,
  onLoadingPestControlTaskStart,
} from '../slice/taskSlice/pestControlTaskSlice';
import {
  getSoilAmendmentTasksSuccess,
  onLoadingSoilAmendmentTaskFail,
  onLoadingSoilAmendmentTaskStart,
} from '../slice/taskSlice/soilAmendmentTaskSlice';
import {
  getHarvestTasksSuccess,
  onLoadingHarvestTaskFail,
  onLoadingHarvestTaskStart,
} from '../slice/taskSlice/harvestTaskSlice';
import {
  getPlantTasksSuccess,
  onLoadingPlantTaskFail,
  onLoadingPlantTaskStart,
} from '../slice/taskSlice/plantTaskSlice';
import {
  getTransplantTasksSuccess,
  onLoadingTransplantTaskFail,
  onLoadingTransplantTaskStart,
} from '../slice/taskSlice/transplantTaskSlice';
import { getPlantingMethodReqBody } from '../Crop/AddManagementPlan/ManagementPlanName/getManagementPlanReqBody';

import {
  getHarvestUseTypesSuccess,
  onLoadingHarvestUseTypeFail,
  onLoadingHarvestUseTypeStart,
} from '../harvestUseTypeSlice';

const taskTypeEndpoint = [
  'cleaning_task',
  'field_work_task',
  'pest_control_task',
  'soil_amendment_task',
  'harvest_tasks',
];

export const getProducts = createAction('getProductsSaga');

export function* getProductsSaga() {
  const { productsUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingProductStart());
    const result = yield call(axios.get, `${productsUrl}/farm/${farm_id}`, header);
    yield put(getProductsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingProductFail());
    console.log('failed to fetch field crops by date');
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
    yield put(putTaskSuccess({ id: task_id, changes: { assignee_user_id } }));
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
        id: result.data[i],
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

export const getPlantingTasksAndPlantingManagementPlansSuccess = createAction(
  'getPlantingTasksAndPlantingManagementPlansSuccessSaga',
);

export function* getPlantingTasksAndPlantingManagementPlansSuccessSaga({ payload: tasks }) {
  yield put(
    getPlantTasksSuccess(
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

export function* getTransplantTasksAndPlantingManagementPlansSuccessSaga({ payload: tasks }) {
  yield put(
    getTransplantTasksSuccess(
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

const taskTypeActionMap = {
  CLEANING_TASK: { success: getCleaningTasksSuccess, fail: onLoadingCleaningTaskFail },
  FIELD_WORK_TASK: { success: getFieldWorkTasksSuccess, fail: onLoadingFieldWorkTaskFail },
  PEST_CONTROL_TASK: { success: getPestControlTasksSuccess, fail: onLoadingPestControlTaskFail },
  SOIL_AMENDMENT_TASK: {
    success: getSoilAmendmentTasksSuccess,
    fail: onLoadingSoilAmendmentTaskFail,
  },
  HARVEST_TASK: { success: getHarvestTasksSuccess, fail: onLoadingHarvestTaskFail },
  PLANT_TASK: {
    success: getPlantingTasksAndPlantingManagementPlansSuccess,
    fail: onLoadingPlantTaskFail,
  },
  TRANSPLANT_TASK: {
    success: getTransplantTasksAndPlantingManagementPlansSuccess,
    fail: onLoadingTransplantTaskFail,
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
}

export const postTasksSuccess = createAction('postTasksSuccessSaga');
export const getTasksSuccess = createAction('getTasksSuccessSaga');

export function* getTasksSuccessSaga({ payload: tasks }) {
  yield put(addManyTasksFromGetReq(tasks));
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
      tasksByTranslationKey[task_translation_key].push(task[task_translation_key.toLowerCase()]);
    }
    return tasksByTranslationKey;
  }, tasksByTranslationKeyDefault);
  for (const task_translation_key in taskTypeActionMap) {
    try {
      yield put(
        taskTypeActionMap[task_translation_key].success(
          tasksByTranslationKey[task_translation_key],
        ),
      );
    } catch (e) {
      yield put(taskTypeActionMap[task_translation_key].fail(e));
      console.log(e);
    }
  }
}

export const getTasks = createAction('getTasksSaga');

export function* getTasksSaga() {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingTaskStart());
    const result = yield call(axios.get, `${taskUrl}/${farm_id}`, header);
    yield put(getTasksSuccess(result.data));
  } catch (e) {
    console.log(e);
  }
}

const getPostTaskBody = (data, endpoint) => {
  return getObjectInnerValues(
    produce(data, (data) => {
      const propertiesToRemove = taskTypeEndpoint.filter((taskType) => taskType !== endpoint);
      for (const key of propertiesToRemove) {
        delete data[key];
      }
      data.wage_at_moment = data.override_hourly_wage ? data.wage_at_moment : undefined;
      delete data['override_hourly_wage'];
    }),
  );
};

const getPostHavestTaskBody = (data, endpoint) => {
  return data.harvest_tasks.map((harvest_task) => {
    const [location_id, management_plan_id] = harvest_task.id.split('.');
    return getObjectInnerValues({
      harvest_task: { ...harvest_task, id: undefined, notes: undefined },
      ...pick(
        data,
        Object.keys(data).filter(
          (key) => ![...taskTypeEndpoint, 'override_hourly_wage'].includes(key),
        ),
      ),
      wage_at_moment: data.override_hourly_wage ? data.wage_at_moment : undefined,
      locations: [{ location_id }],
      managementPlans: [{ management_plan_id: Number(management_plan_id) }],
      notes: harvest_task.notes,
    });
  });
};

const getTransplantTaskBody = (data) => {
  return produce(getPostTaskBody(data, 'transplant_task'), (data) => {
    data.transplant_task.planting_management_plan.location_id = data.locations[0].location_id;
    data.transplant_task.planting_management_plan = getPlantingMethodReqBody(
      data.transplant_task.planting_management_plan,
      { management_plan_id: data.managementPlans[0].management_plan_id },
    );
    delete data.managementPlans;
    delete data.locations;
  });
};

const taskTypeGetPostTaskBodyFunctionMap = {
  CLEANING_TASK: getPostTaskBody,
  FIELD_WORK_TASK: getPostTaskBody,
  PEST_CONTROL_TASK: getPostTaskBody,
  SOIL_AMENDMENT_TASK: getPostTaskBody,
  HARVEST_TASK: getPostHavestTaskBody,
  TRANSPLANT_TASK: getTransplantTaskBody,
};

const getPostTaskReqBody = (data, endpoint, task_translation_key, isCustomTask) => {
  if (isCustomTask) return getPostTaskBody(data, endpoint);
  return taskTypeGetPostTaskBodyFunctionMap[task_translation_key](data, endpoint);
};

export const createTask = createAction('createTaskSaga');

export function* createTaskSaga({ payload: data }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_translation_key, farm_id: task_farm_id } = yield select(
    taskTypeSelector(data.task_type_id),
  );

  const header = getHeader(user_id, farm_id);
  const isCustomTask = !!task_farm_id;
  const isHarvest = task_translation_key === 'HARVEST_TASK';
  const endpoint = isCustomTask
    ? 'custom_task'
    : isHarvest
    ? 'harvest_tasks'
    : task_translation_key.toLowerCase();
  try {
    const result = yield call(
      axios.post,
      `${taskUrl}/${endpoint}`,
      getPostTaskReqBody(data, endpoint, task_translation_key, isCustomTask),
      header,
    );
    if (result) {
      yield put(postTasksSuccess(isHarvest ? result.data : [result.data]));
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK.CREATE.SUCCESS')));
      history.push('/tasks');
    }
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK.CREATE.FAILED')));
  }
}

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
      data.taskData[taskType].planting_management_plan = getPlantingMethodReqBody(
        planting_management_plan,
      );
      data.taskData[taskType].planting_management_plan.planting_management_plan_id =
        data.taskData[taskType].planting_management_plan_id;
      delete data.taskData[taskType].planting_management_plan_id;
    }
  }).taskData;
};

const taskTypeGetCompleteTaskBodyFunctionMap = {
  HARVEST_TASK: getCompleteHarvestTaskBody,
  TRANSPLANT_TASK: getCompletePlantingTaskBody('TRANSPLANT_TASK'),
  PLANT_TASK: getCompletePlantingTaskBody('PLANT_TASK'),
};

export const completeTask = createAction('completeTaskSaga');

export function* completeTaskSaga({ payload: { task_id, data } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_translation_key, isCustomTaskType } = data;
  const header = getHeader(user_id, farm_id);
  const endpoint = isCustomTaskType ? 'custom_task' : task_translation_key.toLowerCase();
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
      yield put(putTaskSuccess({ id: task_id, changes: result.data }));
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK.COMPLETE.SUCCESS')));
      history.push('/tasks');
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
  const { task_id, patchData } = data;
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.patch, `${taskUrl}/abandon/${task_id}`, patchData, header);
    if (result) {
      // yield put(putTaskSuccess({ id: task_id, changes: patchData }));
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK.ABANDON.SUCCESS')));
      history.push('/tasks');
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
      history.push('/add_task/manage_custom_tasks');
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
    const result = yield call(axios.post, logURL + `/harvest_use_types/farm/${farm_id}`, data, header);
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

export default function* taskSaga() {
  yield takeLeading(addCustomTaskType.type, addTaskTypeSaga);
  yield takeLeading(assignTask.type, assignTaskSaga);
  yield takeLeading(createTask.type, createTaskSaga);
  yield takeLatest(getTaskTypes.type, getTaskTypesSaga);
  yield takeLeading(assignTasksOnDate.type, assignTaskOnDateSaga);
  yield takeLatest(getTasks.type, getTasksSaga);
  yield takeLatest(getTasksSuccess.type, getTasksSuccessSaga);
  yield takeLeading(postTasksSuccess.type, getTasksSuccessSaga);
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
}
