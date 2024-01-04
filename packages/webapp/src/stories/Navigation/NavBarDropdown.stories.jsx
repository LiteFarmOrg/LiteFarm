import React from 'react';
import TopMenu from '../../components/Navigation/TopMenu/TopMenu';
import { componentDecoratorsGreyBackground } from '../Pages/config/Decorators';

export default {
  title: 'Components/Navbar/TopMenu',
  decorators: componentDecoratorsGreyBackground,
  component: TopMenu,
};

export const NavbarTopMenu = ((args) => <TopMenu {...args} />).bind({});
TopMenu.args = {};
