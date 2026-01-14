/*
 *  Copyright 2026 LiteFarm.org
 *  This file is part of LiteFarm.
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

import { takeEvery, put, call } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { serviceWorkerMessageReceived } from './serviceWorkerSlice';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { getTasksSaga } from '../Task/saga';

interface ServiceWorkerMessage {
  type: string;
  payload: {
    area: string;
    url: string;
    error?: any;
    response?: any;
  };
}

function* serviceWorkerMessageRouter({ payload: message }: PayloadAction<ServiceWorkerMessage>) {
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
  yield takeEvery(serviceWorkerMessageReceived.type, serviceWorkerMessageRouter);
}
