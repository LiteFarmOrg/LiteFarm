import React from 'react';
import ProfileMenu from '../../components/Navigation/Menus/ProfileMenu';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';
import SlideMenu from '../../components/Navigation/NavBar/slideMenu';

export default {
  title: 'Components/Navbar/Drawer',
  decorators: componentDecoratorsWithoutPadding,
  component: ProfileMenu,
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
