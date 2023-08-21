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

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { downloadExport } from './saga';
import i18n from '../../locales/i18n';

export default function DownloadExport({ match }) {
  const { id, from, to } = match.params;
  let fileSrc = window.atob(id);
  const dispatch = useDispatch();

  useEffect(() => {
    const file = import.meta.env.DEV
      ? `http://${import.meta.env.MINIO_ENDPOINT}/${
          import.meta.env.PUBLIC_BUCKET_NAME
        }/${fileSrc}.zip`
      : `https://${
          import.meta.env.DO_BUCKET_NAME
        }.nyc3.digitaloceanspaces.com/${fileSrc}.zip`;

    dispatch(
      downloadExport({
        file,
        from,
        to,
      })
    );
  }, []);

  return (
    <p style={{ marginLeft: '8px', marginTop: '24px' }}>
      {i18n.t('CERTIFICATIONS.EXPORT_DOWNLOADING_MESSAGE')}
    </p>
  );
}
