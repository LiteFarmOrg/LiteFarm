import React from 'react';
import { PureProfileFloaterComponent } from '../../components/ProfileFloater';
import { componentDecoratorsWithoutPadding } from '../Pages/config/decorators';
import SlideMenu from '../../components/Navigation/NavBar/slideMenu';

export default {
  title: 'Components/Navbar/Drawer',
  decorators: componentDecoratorsWithoutPadding,
  component: PureProfileFloaterComponent,
};

export const WithManageMenuOpenAndFinance = ((args) => <SlideMenu {...args} />).bind({});
WithManageMenuOpenAndFinance.args = {
  manageOpen: true,
  showFinances: true,
};

export const WithoutManageMenuOpenOrFinance = ((args) => <SlideMenu {...args} />).bind({});
WithoutManageMenuOpenOrFinance.args = {
  manageOpen: false,
  showFinances: false,
};
