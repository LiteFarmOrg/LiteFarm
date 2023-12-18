import React from 'react';
import { PureProfileFloaterComponent } from '../../components/Navigation/Floater/ProfileFloater';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import SlideMenu from '../../components/Navigation/NavBar/SlideMenu';

export default {
  title: 'Components/Navbar/Drawer',
  decorators: componentDecoratorsWithoutPadding,
  component: PureProfileFloaterComponent,
};

export const WithFinance = ((args) => <SlideMenu {...args} />).bind({});
WithFinance.args = {
  manageOpen: true,
  isAdmin: true,
};

export const WithoutFinance = ((args) => <SlideMenu {...args} />).bind({});
WithoutFinance.args = {
  manageOpen: false,
  isAdmin: false,
};
