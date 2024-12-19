import { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { getNotificationCardDate } from '../../../util/moment';
import useTranslationUtil from '../../../util/useTranslationUtil';
import { useTranslation } from 'react-i18next';
import MoreRecentNotificationWarning from '../MoreRecentNotificationWarning';
import { useNavigate } from 'react-router-dom-v5-compat';

function NotificationTimeline({ activeNotificationId, relatedNotifications, style }) {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const { getNotificationTitle } = useTranslationUtil();
  const [sortedRelatedNotifications, setSortedRelatedNotifications] = useState([]);
  const [mostRecentNotification, setMostRecentNotification] = useState(null);

  useEffect(() => {
    setMostRecentNotification(null);
    setSortedRelatedNotifications(
      relatedNotifications.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      }),
    );
  }, [activeNotificationId]);

  useEffect(() => {
    if (
      sortedRelatedNotifications &&
      sortedRelatedNotifications[0]?.notification_id !== activeNotificationId
    ) {
      setMostRecentNotification(sortedRelatedNotifications[0]);
    }
  }, [sortedRelatedNotifications]);

  return (
    <div className={styles.container} style={style}>
      <header className={styles.header}>
        <h2 className={styles.heading}>{t('NOTIFICATION.TIMELINE.HEADING')}</h2>
        <hr className={styles.headerLine} />
      </header>
      {mostRecentNotification && (
        <MoreRecentNotificationWarning
          notificationId={mostRecentNotification.notification_id}
          entityType={mostRecentNotification.ref?.entity?.type}
        />
      )}
      <ul className={styles.timeline}>
        {sortedRelatedNotifications.map((notification) => (
          <li
            role="link"
            tabIndex="0"
            key={notification.notification_id}
            className={clsx(
              styles.timelineItem,
              activeNotificationId === notification.notification_id && styles.activeItem,
            )}
            onClick={() => navigate(`/notifications/${notification.notification_id}/read_only`)}
          >
            {getNotificationCardDate(notification.created_at)} |{' '}
            {getNotificationTitle(notification.title)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationTimeline;
NotificationTimeline.prototype = {
  notificationId: PropTypes.string,
  relatedNotifications: PropTypes.arrayOf(PropTypes.object),
  style: PropTypes.object,
};
