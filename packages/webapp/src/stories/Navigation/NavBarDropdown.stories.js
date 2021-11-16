import React from 'react';
import { PureNotificationFloaterComponent } from '../../components/NotificationFloater';
import { PureMyFarmFloaterComponent } from '../../components/MyFarmFloater';
import { PureProfileFloaterComponent } from '../../components/ProfileFloater';
import { componentDecoratorsGreyBackground } from '../Pages/config/decorators';

export default {
  title: 'Components/Navbar/FloaterComponent',
  decorators: componentDecoratorsGreyBackground,
  component: PureProfileFloaterComponent,
};

export const NotificationFloater = (() => <PureNotificationFloaterComponent />).bind({});

export const MyFarmFloater = (() => <PureMyFarmFloaterComponent />).bind({});

export const ProfileFloater = ((args) => <PureProfileFloaterComponent {...args} />).bind({});
ProfileFloater.args = {};
