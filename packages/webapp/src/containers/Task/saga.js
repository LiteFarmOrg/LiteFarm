import { call, put, select, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { axios, getHeader } from '../saga';
import i18n from '../../locales/i18n';
import { loginSelector } from '../userFarmSlice';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';

export const assignTask = createAction('assignTaskSaga');

export function* assignTaskSaga({ payload: { task_id, assignee_user_id, is_admin } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/assign/${task_id}`,
      { assignee_user_id: assignee_user_id, is_admin: is_admin },
      header
    );
    yield put(enqueueSuccessSnackbar(i18n.t('message:ASSIGN_TASK.SUCCESS')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:ASSIGN_TASK.ERROR')));
  }
}

export const assignTasksOnDate = createAction('assignTask');

export default function* taskSaga() {
  yield takeLeading(assignTask.type, assignTaskSaga);
}