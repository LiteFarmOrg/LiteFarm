import React from 'react';
import { componentDecorators } from '../Pages/config/Decorators';
import DropdownAndFilter from '../../components/PopupFilter/PureTaskDropdownFilter';

export default {
  title: 'Components/DropdownAndFilter',
  component: DropdownAndFilter,
  decorators: componentDecorators,
};

const Template = (args) => <DropdownAndFilter {...args} />;
export const InActive = Template.bind({});
InActive.args = {};

export const Active = Template.bind({});
Active.args = {
  isFilterActive: true,
};

export const DropdownOpen = Template.bind({});
DropdownOpen.args = {
  isFilterActive: true,
  isDropDownOpen: true,
};
