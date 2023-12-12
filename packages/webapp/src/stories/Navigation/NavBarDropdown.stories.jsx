import React from 'react';
import { PureProfileFloaterComponent } from '../../components/Navigation/Floater/ProfileFloater';
import { componentDecoratorsGreyBackground } from '../Pages/config/Decorators';

export default {
  title: 'Components/Navbar/FloaterComponent',
  decorators: componentDecoratorsGreyBackground,
  component: PureProfileFloaterComponent,
};

export const ProfileFloater = ((args) => <PureProfileFloaterComponent {...args} />).bind({});
ProfileFloater.args = {};
