/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import Layout from '../Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../PageTitle/v2';
import { colors } from '../../assets/theme';
import Button from '../../components/Form/Button';
import { Semibold, Text } from '../Typography';
import { getNotificationCardDate } from '../../util/moment.js';
import useTranslationUtil from '../../util/useTranslationUtil';
import NotificationTimeline from './NotificationTimeline';
import { createSensorErrorDownload, SENSOR_BULK_UPLOAD_FAIL } from '../../util/sensor';
import { useNavigate } from 'react-router-dom-v5-compat';

function PureNotificationReadOnly({ onGoBack, notification, relatedNotifications }) {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const { getNotificationTitle, getNotificationBody } = useTranslationUtil();

  const hideTakeMeThere =
    !notification.ref ||
    (!notification.ref?.url &&
      (!notification.ref?.entity ||
        !notification.ref?.entity?.type ||
        !notification.ref?.entity?.id) &&
      (!notification.ref?.error_download ||
        !notification.ref?.error_download?.errors ||
        !notification.ref?.error_download?.file_name)) ||
    notification.body.translation_key === 'NOTIFICATION.TASK_DELETED.BODY';

  const onTakeMeThere = () => {
    let route;
    if (notification.ref.url) {
      route = notification.ref.url;
    } else if (notification.ref.entity) {
      route = `/${notification.ref.entity.type}s/${notification.ref.entity.id}/read_only`;
    } else if (
      notification.ref.error_download &&
      notification.context.notification_type === SENSOR_BULK_UPLOAD_FAIL
    ) {
      const translatedErrors = notification.ref.error_download.errors.map((e) => {
        return {
          row: e.row,
          column: e.column,
          errorMessage: e.variables ? t(e.translation_key, e.variables) : t(e.translation_key),
        };
      });
      createSensorErrorDownload(
        notification.ref.error_download.file_name,
        translatedErrors,
        notification.ref.error_download.error_type,
        notification.ref.error_download.success ?? [],
      );
    } else {
      route = '/';
    }

    navigate(route, { state: notification.context });
  };

  return (
    <Layout>
      <PageTitle
        onGoBack={onGoBack}
        title={t('NOTIFICATION.PAGE_TITLE')}
        style={{ marginBottom: '24px' }}
      />
      <div
        style={{
          width: '49px',
          height: '8px',
          left: '16px',
          top: '313px',
          fontFamily: "'Open Sans', 'Manjari'",
          fontStyle: 'normal',
          fontWeight: '400',
          fontSize: '10px',
          lineHeight: '16px',
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          color: '#66738A',
          marginBottom: '16px',
        }}
      >
        {getNotificationCardDate(notification.created_at)}
      </div>

      <Semibold style={{ color: colors.teal700, marginBottom: '16px' }}>
        {getNotificationTitle(notification.title)}
      </Semibold>
      <Text style={{ fontSize: '16px', marginBottom: '16px' }}>
        {getNotificationBody(notification.body, notification.variables)}
      </Text>
      {!hideTakeMeThere && (
        <Button sm style={{ height: '32px', width: '150px' }} onClick={onTakeMeThere}>
          {t('NOTIFICATION.TAKE_ME_THERE')}
        </Button>
      )}
      {relatedNotifications?.length > 1 && (
        <NotificationTimeline
          style={{ marginTop: '30px' }}
          activeNotificationId={notification.notification_id}
          relatedNotifications={relatedNotifications}
        />
      )}
    </Layout>
  );
}

export default PureNotificationReadOnly;
