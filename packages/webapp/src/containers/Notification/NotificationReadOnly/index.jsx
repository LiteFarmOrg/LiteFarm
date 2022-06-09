import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PureNotificationReadOnly from '../../../components/Notifications';
import { notificationSelector, relatedNotificationSelector } from '../../notificationSlice';
import { getNotification } from '../saga';

export default function NotificationReadOnly({ history, match }) {
  const dispatch = useDispatch();
  const { notification_id } = match.params;
  const notification = useSelector(notificationSelector(notification_id));
  const relatedNotifications = useSelector(relatedNotificationSelector(notification.ref?.entity));

  useEffect(() => {
    dispatch(getNotification());
  }, []);

  const onGoBack = () => {
    history.push('/notifications');
  };

  return (
    <>
      <PureNotificationReadOnly
        onGoBack={onGoBack}
        notification={notification}
        relatedNotifications={relatedNotifications}
      />
    </>
  );
}
