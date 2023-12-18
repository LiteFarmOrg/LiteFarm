import React from 'react';
import ProfileMenu from '../../components/Navigation/Menus/ProfileMenu';
import { componentDecoratorsGreyBackground } from '../Pages/config/Decorators';

export default {
  title: 'Components/Navbar/ProfileMenu',
  decorators: componentDecoratorsGreyBackground,
  component: ProfileMenu,
};

export const NavbarProfileMenu = ((args) => <ProfileMenu {...args} />).bind({});
ProfileMenu.args = {};
