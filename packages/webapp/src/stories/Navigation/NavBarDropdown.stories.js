import React from 'react';
import { PureNotificationFloaterComponent } from '../../components/NotificationFloater';
import { PureMyFarmFloaterComponent } from '../../components/MyFarmFloater';
import { PureProfileFloaterComponent } from '../../components/ProfileFloater';

export default {
  title: 'Components/Navbar/FloaterComponent',
  decorators: [
    (story) => <div style={{ padding: '3rem', backgroundColor: 'gray' }}>{story()}</div>,
  ],
  component: PureProfileFloaterComponent,
};

export const NotificationFloater = (() => <PureNotificationFloaterComponent />).bind({});

export const MyFarmFloater = (() => <PureMyFarmFloaterComponent />).bind({});

export const ProfileFloater = ((args) => <PureProfileFloaterComponent {...args} />).bind({});
ProfileFloater.args = {
  showSwitchFarm: true,
};
