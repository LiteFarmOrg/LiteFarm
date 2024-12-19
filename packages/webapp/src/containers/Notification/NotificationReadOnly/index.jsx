import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom-v5-compat';
import PureNotificationReadOnly from '../../../components/Notifications';
import { notificationSelector, relatedNotificationSelector } from '../../notificationSlice';

export default function NotificationReadOnly() {
  let navigate = useNavigate();
  const { notification_id } = useParams();
  const notification = useSelector(notificationSelector(notification_id));
  const relatedNotifications = useSelector(relatedNotificationSelector(notification?.ref?.entity));

  const onGoBack = () => {
    navigate('/notifications');
  };

  return (
    <PureNotificationReadOnly
      onGoBack={onGoBack}
      notification={notification}
      relatedNotifications={relatedNotifications}
    />
  );
}
