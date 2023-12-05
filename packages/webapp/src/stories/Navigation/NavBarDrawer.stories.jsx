import React from 'react';
import { PureProfileFloaterComponent } from '../../components/Navigation/Floater/ProfileFloater';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import MainMenu from '../../components/Navigation/NavBar/MainMenu';

export default {
  title: 'Components/Navbar/Drawer',
  decorators: componentDecoratorsWithoutPadding,
  component: PureProfileFloaterComponent,
};

export const WithFinance = ((args) => <MainMenu {...args} />).bind({});
WithFinance.args = {
  manageOpen: true,
  isAdmin: true,
};

export const WithoutFinance = ((args) => <MainMenu {...args} />).bind({});
WithoutFinance.args = {
  manageOpen: false,
  isAdmin: false,
};
