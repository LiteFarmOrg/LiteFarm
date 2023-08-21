/*
 *  Copyright 2019-2022 LiteFarm.org
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
import { select, takeLatest } from 'redux-saga/effects';

import { createAction } from '@reduxjs/toolkit';
import { userFarmSelector } from '../userFarmSlice';
import i18n from '../../locales/i18n';

export const downloadExport = createAction('downloadExportSaga');

export function* downloadExportSaga({ payload }) {
  const { farm_name } = yield select(userFarmSelector);
  try {
    const fileName = farm_name
      ? `${farm_name} ${i18n.t('CERTIFICATIONS.EXPORT_FILE_TITLE')} ${
          payload.from
        } - ${payload.to}.zip`
      : undefined;

    const url = new URL(payload.file);

    let config = {};

    if (!import.meta.env.DEV) {
      config = {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('farm_token'),
        },
        responseType: 'arraybuffer',
        method: 'GET',
      };

      url.hostname = 'images.litefarm.workers.dev';
    }

    const res = yield fetch(url, config);
    if (res.status !== 403) {
      const blob = yield res.blob();
      downloadBlob(blob, fileName);
    }
  } catch (error) {
    console.log(error);
  }
}

export default function* exportSaga() {
  yield takeLatest(downloadExport.type, downloadExportSaga);
}

function downloadBlob(blob, name = 'export.zip') {
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = name;
  document.body.appendChild(link);
  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  );
  document.body.removeChild(link);
}
