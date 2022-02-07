import React from 'react';
import { PureMyFarmFloaterComponent } from '../../components/Navigation/Floater/MyFarmFloater';
import { PureProfileFloaterComponent } from '../../components/Navigation/Floater/ProfileFloater';
import { componentDecoratorsGreyBackground } from '../Pages/config/Decorators';

export default {
  title: 'Components/Navbar/FloaterComponent',
  decorators: componentDecoratorsGreyBackground,
  component: PureProfileFloaterComponent,
};


export const MyFarmFloater = (() => <PureMyFarmFloaterComponent />).bind({});

export const ProfileFloater = ((args) => <PureProfileFloaterComponent {...args} />).bind({});
ProfileFloater.args = {};
