import { takeEvery, put, call } from 'redux-saga/effects';
import { serviceWorkerMessageReceived } from './offlineDetectorSlice';
import { enqueueSuccessSnackbar, enqueueErrorSnackbar } from '../../Snackbar/snackbarSlice';

// Feature‐specific sagas
import { getTasksSaga } from '../../Task/saga';

function* serviceWorkerMessageRouter({ payload: message }) {
  const { type, payload } = message;
  const { area, url, error, response } = payload;

  if (type === 'SYNC_ITEM_SUCCESS') {
    switch (area) {
      case 'tasks.create':
        // Note: Responses can succeed in the queue sense, but still return an error from the API
        if (response?.error) {
          yield put(
            enqueueErrorSnackbar(
              `Failed to sync new task: ${response.error.message ?? 'Unknown error'}`,
            ),
          );
          break;
        }

        yield put(enqueueSuccessSnackbar('New task synced'));
        yield call(getTasksSaga);
        break;

      //   case 'tasks.update':
      //     yield put(enqueueSuccessSnackbar('Task update synced'));
      //     yield call(getTasksSaga);
      //     break;

      // …handle other areas here…

      default:
        // Generic “success” for unknown areas
        yield put(enqueueSuccessSnackbar(`Sync succeeded for “${area}”`));
    }
  } else if (type === 'SYNC_ITEM_FAILURE') {
    switch (area) {
      case 'tasks.create':
        yield put(enqueueErrorSnackbar('Failed to sync new task'));
        break;

      //   case 'tasks.update':
      //     yield put(enqueueErrorSnackbar('Failed to sync task update'));
      //     break;

      //   case 'products':
      //     yield put(enqueueErrorSnackbar('Failed to sync products'));
      //     break;

      // …handle other areas here…

      default:
        // Generic “failure” for unknown areas
        yield put(enqueueErrorSnackbar(`Sync failed for “${area}”${error ? `: ${error}` : ''}`));
    }
  }
}

export default function* offlineSyncSaga() {
  // whenever your hook dispatches serviceWorkerMessageReceived(msg),
  // this saga runs the router above
  yield takeEvery(serviceWorkerMessageReceived.type, serviceWorkerMessageRouter);
}
