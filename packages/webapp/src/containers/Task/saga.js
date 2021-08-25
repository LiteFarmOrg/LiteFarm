import { call, put, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { axios, getHeader } from '../saga';
import i18n from '../../locales/i18n';
import { loginSelector } from '../userFarmSlice';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { getTasksSuccess, putTaskSuccess, putTasksSuccess, createTaskSuccess } from '../taskSlice';
import { getProductsSuccess, onLoadingProductFail, onLoadingProductStart } from '../productSlice';
import { getTaskTypesSuccess } from '../taskTypeSlice';

const taskTypeToEndpointMap = {
  CLEANING: 'cleaning_task',
  PEST_CONTROL: 'pest_control_task',
  SOIL_AMENDMENT: 'soil_amendment_task',
};

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
    console.log(modified_tasks);
    yield put(putTasksSuccess(modified_tasks));
    yield put(enqueueSuccessSnackbar(i18n.t('message:ASSIGN_TASK.SUCCESS')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:ASSIGN_TASK.ERROR')));
  }
}

export const getTasks = createAction('getTasksSaga');

export function* getTasksSaga() {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.get, `${taskUrl}/${farm_id}`, header);
    yield put(getTasksSuccess(result.data));
  } catch (e) {
    console.log(e);
  }
}
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

export const createTask = createAction('createTaskSaga');

export function* createTaskSaga({ payload: data }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_translation_key, ...taskData } = data;
  const header = getHeader(user_id, farm_id);
  const endpoint = taskTypeToEndpointMap[task_translation_key];
  try {
    const result = yield call(axios.post, `${taskUrl}/${endpoint}`, taskData, header);
    if (result) {
      yield put(createTaskSuccess(result.data));
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK.CREATE.SUCCESS')));
      history.push('/tasks');
    }
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK.CREATE.FAILED')));
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
    }
  } catch (e) {
    console.error('failed to add task type');
  }
}

export const completeTask = createAction('completeTaskSaga');

export function* completeTaskSaga({ payload: { task_id, data } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const task_translation_key = data.task_translation_key;
  const taskData = data.taskData;
  const header = getHeader(user_id, farm_id);
  const endpoint = taskTypeToEndpointMap[task_translation_key];
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

export default function* taskSaga() {
  yield takeLeading(addCustomTask.type, addTaskTypeSaga);
  yield takeLeading(assignTask.type, assignTaskSaga);
  yield takeLeading(createTask.type, createTaskSaga);
  yield takeLeading(getTaskTypes.type, getTaskTypesSaga);
  yield takeLeading(assignTasksOnDate.type, assignTaskOnDateSaga);
  yield takeLeading(getTasks.type, getTasksSaga);
  yield takeLeading(getProducts.type, getProductsSaga);
  yield takeLeading(completeTask.type, completeTaskSaga);
  yield takeLeading(abandonTask.type, abandonTaskSaga);
}
