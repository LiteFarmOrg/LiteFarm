import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import { Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { notificationsSelector } from '../notificationSlice';
import NotificationCard from './NotificationCard';
import { getNotification, readNotification, clearAlerts } from './saga';
import useStringFilteredNotifications from './useStringFilteredNotifications';

/**
 * Renders a list view of notification cards.
 * @param {} param0
 * @returns {ReactComponent}
 */
export default function NotificationPage() {
  const { t } = useTranslation();

  // Get the data.
  const cardContents = useSelector(notificationsSelector);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getNotification());
  }, []);

  const [filterString, setFilterString] = useState('');
  const filterStringOnChange = (e) => setFilterString(e.target.value);
  const notifications = useStringFilteredNotifications(cardContents, filterString);
  const alertIds = notifications
    .filter((notification) => notification.alert)
    .map((notification) => notification.notification_id);
  if (alertIds.length) dispatch(clearAlerts(alertIds));

  return (
    <Layout classes={{ container: { backgroundColor: 'white', width: '100%', padding: '0px' } }}>
      <PageTitle
        title={t('NOTIFICATION.PAGE_TITLE')}
        style={{ paddingBottom: '20px', marginLeft: '24px', marginTop: '24px' }}
      />

      <div style={{ position: 'relative', marginLeft: '24px', marginRight: '24px' }}>
        <PureSearchbarAndFilter
          // onFilterOpen={onFilterOpen}
          value={filterString}
          onChange={filterStringOnChange}
          isFilterActive={false}
          disableFilter={true}
        />
      </div>

      {notifications.length > 0 ? (
        notifications
          .sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          })
          .map((notification) => {
            return (
              <NotificationCard
                key={notification.notification_id}
                variables={notification.variables}
                onClick={() => dispatch(readNotification(notification.notification_id))}
                {...notification}
              />
            );
          })
      ) : (
        <Semibold style={{ color: 'var(--teal700)', marginLeft: '24px' }}>
          {t('NOTIFICATION.NONE_TO_DISPLAY')}
        </Semibold>
      )}
    </Layout>
  );
}

/**
 * @typedef Notification
 * @desc The data for a notification sent to the current user.
 * @type {object}
 * @property {uuid} notification_id - A unique identifier for the object.
 * @property {boolean} alert - Indicates if the notification is being presented to the user for the first time.
 * @property {userNotificationStatusType} status - The notification's status.
 * @property {string} translation_key - The translation key for the notification, which must contain subkeys for the title and body.
 * @property {InterpolationVariable[]} variables - An array of translation interpolation variables.
 * @property {string} entity_type - The type of entity that the notification refers to, e.g., 'task'.
 * @property {string} entity_id - A unique identifier for the specific entity_type instance that the notification refers to.
 * @property {object} context - A dictionary of context-specific data for the notification.
 * @property {string} created_at - The creation time of the notification.
 */
