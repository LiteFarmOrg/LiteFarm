import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import PureNotificationReadOnly from '../../../components/Notifications';
import { notificationSelector, relatedNotificationSelector } from '../../notificationSlice';

export default function NotificationReadOnly({ history }) {
  const { notification_id } = useParams();
  const notification = useSelector(notificationSelector(notification_id));
  const relatedNotifications = useSelector(relatedNotificationSelector(notification?.ref?.entity));

  const onGoBack = () => {
    history.push('/notifications');
  };

  return (
    <PureNotificationReadOnly
      onGoBack={onGoBack}
      notification={notification}
      relatedNotifications={relatedNotifications}
    />
  );
}
