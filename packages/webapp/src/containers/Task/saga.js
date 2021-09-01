import { call, put, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { axios, getHeader } from '../saga';
import i18n from '../../locales/i18n';
import { loginSelector } from '../userFarmSlice';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { addManyTasksFromGetReq, putTasksSuccess, putTaskSuccess } from '../taskSlice';
import { getProductsSuccess, onLoadingProductFail, onLoadingProductStart } from '../productSlice';
import {
  deleteTaskTypeSuccess,
  getTaskTypesSuccess,
  taskTypeById,
  taskTypeEntitiesSelector,
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
    console.log({ task_id, assignee_user_id });
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

const taskTypeActionMap = {
  CLEANING_TASK: { success: getCleaningTasksSuccess, fail: onLoadingCleaningTaskFail },
  FIELD_WORK_TASK: { success: getFieldWorkTasksSuccess, fail: onLoadingFieldWorkTaskFail },
  PEST_CONTROL_TASK: { success: getPestControlTasksSuccess, fail: onLoadingPestControlTaskFail },
  SOIL_AMENDMENT_TASK: {
    success: getSoilAmendmentTasksSuccess,
    fail: onLoadingSoilAmendmentTaskFail,
  },
  HARVEST_TASK: { success: getHarvestTasksSuccess, fail: onLoadingHarvestTaskFail },
};

export const onLoadingTaskStart = createAction('onLoadingTaskStartSaga');

export function* onLoadingTaskStartSaga() {
  yield put(onLoadingCleaningTaskStart());
  yield put(onLoadingFieldWorkTaskStart());
  yield put(onLoadingPestControlTaskStart());
  yield put(onLoadingSoilAmendmentTaskStart());
  yield put(onLoadingHarvestTaskStart());
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

const defaultProcessFunction = (data, endpoint) => {
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

const harvestProcessFunction = (data, endpoint) => {
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

const taskTypeProcessFunctionMap = {
  CLEANING_TASK: defaultProcessFunction,
  FIELD_WORK_TASK: defaultProcessFunction,
  PEST_CONTROL_TASK: defaultProcessFunction,
  SOIL_AMENDMENT_TASK: defaultProcessFunction,
  HARVEST_TASK: harvestProcessFunction,
};

export const createTask = createAction('createTaskSaga');

export function* createTaskSaga({ payload: data }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_translation_key } = yield select(taskTypeById(data.task_type_id));

  const header = getHeader(user_id, farm_id);
  const isHarvest = task_translation_key === 'HARVEST_TASK';
  const endpoint = isHarvest ? 'harvest_tasks' : task_translation_key.toLowerCase();
  try {
    const result = yield call(
      axios.post,
      `${taskUrl}/${endpoint}`,
      taskTypeProcessFunctionMap[task_translation_key](data, endpoint),
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

export const completeTask = createAction('completeTaskSaga');

export function* completeTaskSaga({ payload: { task_id, data } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const task_translation_key = data.task_translation_key;
  const taskData = data.taskData;
  const header = getHeader(user_id, farm_id);
  const endpoint = task_translation_key.toLowerCase();
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

export const addCustomTask = createAction('addTaskTypeSaga');

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

export default function* taskSaga() {
  yield takeLeading(addCustomTask.type, addTaskTypeSaga);
  yield takeLeading(assignTask.type, assignTaskSaga);
  yield takeLeading(createTask.type, createTaskSaga);
  yield takeLeading(getTaskTypes.type, getTaskTypesSaga);
  yield takeLeading(assignTasksOnDate.type, assignTaskOnDateSaga);
  yield takeLeading(getTasks.type, getTasksSaga);
  yield takeLeading(getTasksSuccess.type, getTasksSuccessSaga);
  yield takeLeading(postTasksSuccess.type, getTasksSuccessSaga);
  yield takeLeading(onLoadingTaskStart.type, onLoadingTaskStartSaga);
  yield takeLeading(getProducts.type, getProductsSaga);
  yield takeLeading(completeTask.type, completeTaskSaga);
  yield takeLeading(abandonTask.type, abandonTaskSaga);
  yield takeLeading(deleteTaskType.type, deleteTaskTypeSaga);
}
