import { useHistory, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PureNotificationReadOnly from '../../../components/Notifications';
import { notificationSelector, relatedNotificationSelector } from '../../notificationSlice';

export default function NotificationReadOnly() {
  const history = useHistory();
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
