import { GET_FARM_DATA_SCHEDULE, SEND_FARM_DATA_REQUEST } from './constants';
import { setFarmSchedule } from './actions';
import { call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import apiConfig from '../../../apiConfig';
import { loginSelector } from '../../userFarmSlice';
import { axios, getHeader } from '../../saga';
import { enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';

export function* sendRequestSaga() {
  const { farmDataUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.post,
      farmDataUrl + '?farm_id=' + farm_id + '&user_id=' + user_id,
      {},
      header,
    );
    if (result) {
      yield put(enqueueSuccessSnackbar('Request success'));
    }
  } catch (e) {
    console.log('failed to request');
  }
}

export function* getFarmDataScheduleSaga() {
  const { farmDataUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, farmDataUrl + `/${farm_id}`, header);
    if (result.data) {
      yield put(setFarmSchedule(result.data));
    }
  } catch (e) {
    console.log('failed to fetch users from database');
  }
}

export default function* farmDataSaga() {
  yield takeLeading(SEND_FARM_DATA_REQUEST, sendRequestSaga);
  yield takeLatest(GET_FARM_DATA_SCHEDULE, getFarmDataScheduleSaga);
}
