import React from 'react';
import NotificationTimeline from '../../components/Notifications/NotificationTimeline';

export default {
  title: 'Components/NotificationTimeline',
  component: NotificationTimeline,
};

const Template = (args) => <NotificationTimeline {...args} />;

export const Primary = Template.bind({});
localStorage.setItem('litefarm_lang', 'en');
Primary.args = {
  activeNotificationId: 4,
  relatedNotifications: [
    {
      created_at: new Date(2022, 6, 9).toISOString(),
      title: { en: 'Assigned Task' },
      notification_id: 1,
    },
    {
      created_at: new Date(2022, 6, 11).toISOString(),
      title: { en: 'Unassigned Task' },
      notification_id: 2,
    },
    {
      created_at: new Date(2022, 6, 10).toISOString(),
      title: { en: 'Assigned Task' },
      notification_id: 3,
    },
    {
      created_at: new Date(2022, 6, 13).toISOString(),
      title: { en: 'Completed Task' },
      notification_id: 4,
    },
  ],
};
