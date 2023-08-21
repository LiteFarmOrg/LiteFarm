import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import PureSearchbarAndFilter from '../../components/PopupFilter/PureSearchbarAndFilter';
import { Semibold } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useMemo, useState } from 'react';
import { notificationsSelector } from '../notificationSlice';
import NotificationCard from './NotificationCard';
import { getNotification, readNotification, clearAlerts } from './saga';
import useStringFilteredNotifications from './useStringFilteredNotifications';
import { getTasks } from '../Task/saga';

/**
 * Renders a list view of notification cards.
 * @param {} param0
 * @returns {ReactComponent}
 */
export default function NotificationPage() {
  const { t } = useTranslation();

  // Get the data.
  const cardContents = useSelector(notificationsSelector);

  // queue of updates which need to be made to records referenced from notifications
  const [requiredUpdates, setRequiredUpdates] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    // if there are pending notification record updates, we update all the appropriate records
    if (requiredUpdates.length > 0) {
      requiredUpdates.forEach((update) => {
        dispatchUpdate(update, dispatch);
      });
      // clear the queue
      setRequiredUpdates([]);
    }
  }, [requiredUpdates.length]);

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

  const notificationCards = useMemo(() => {
    // only need to dispatch each type of update once, so we use a Set
    const updates = new Set();
    const cards = notifications
      .sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .map((notification) => {
        // this only adds the update if the update is not already in the set
        updates.add(getUpdateFromNotification(notification));
        return (
          <NotificationCard
            key={notification.notification_id}
            variables={notification.variables}
            onClick={() => dispatch(readNotification(notification.notification_id))}
            {...notification}
          />
        );
      });
    // update the queue of pending updates, triggering the dispatch of various update actions
    setRequiredUpdates([...updates]);
    return cards;
  }, [notifications.length]);

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
        notificationCards
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
 * @property {Object} title - An object containing either strings by language (e.g. {en: "english string}), or a translation_key for the title.
 * @property {Object} body - An object containing either strings by language (e.g. {en: "english string}), or a translation_key for the body.
 * @property {InterpolationVariable[]} variables - An array of translation interpolation variables.
 * @property {Object} ref - An object containing the reference for the "take me there" link. This can be flexible, but is often structured as {entity: {type, id}} or {url}.
 * @property {object} context - A dictionary of context-specific data for the notification.
 * @property {string} created_at - The creation time of the notification.
 */

// TODO: extend this to support other ref types as needed
/**
 * Gets the update type for a specific notification (e.g. "task").
 * @param {Notification} notification
 * @returns {string}
 */
const getUpdateFromNotification = (notification) => {
  if (notification?.ref?.entity?.type) {
    return notification.ref.entity.type;
  } else {
    return '';
  }
};

/**
 * This dispatches updates based off the type of update (generated from getUpdateFromNotification).
 * @param {String} updateType
 * @param {Function} dispatch
 */
const dispatchUpdate = (updateType, dispatch) => {
  if (updateType === 'task') {
    dispatch(getTasks());
  }
};
