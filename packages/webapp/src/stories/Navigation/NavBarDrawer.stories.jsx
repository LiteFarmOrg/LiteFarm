import React from 'react';
import TopMenu from '../../components/Navigation/Menus/TopMenu';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import SideMenu from '../../components/Navigation/SideMenu';

export default {
  title: 'Components/Navbar/Drawer',
  decorators: componentDecoratorsWithoutPadding,
  component: TopMenu,
};

export const WithFinance = ((args) => <SideMenu {...args} />).bind({});
WithFinance.args = {
  manageOpen: true,
  isAdmin: true,
};

export const WithoutFinance = ((args) => <SideMenu {...args} />).bind({});
WithoutFinance.args = {
  manageOpen: false,
  isAdmin: false,
};
