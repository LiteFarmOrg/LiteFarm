import React from 'react';
import { useSelector } from 'react-redux';
import PureNotificationReadOnly from '../../../components/Notifications';
import { notificationSelector } from '../../notificationSlice';

export default function NotificationReadOnly({ history, match }) {
  const { notification_id } = match.params;
  const notification = useSelector(notificationSelector(notification_id));
  const onGoBack = () => {
    history.push('/notifications');
  };

  return (
    <>
      <PureNotificationReadOnly onGoBack={onGoBack} notification={notification} />
    </>
  );
}
