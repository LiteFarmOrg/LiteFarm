import React from 'react';
import TopMenu from '../../components/Navigation/Menus/TopMenu';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import SlideMenu from '../../components/Navigation/slideMenu';

export default {
  title: 'Components/Navbar/Drawer',
  decorators: componentDecoratorsWithoutPadding,
  component: TopMenu,
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
