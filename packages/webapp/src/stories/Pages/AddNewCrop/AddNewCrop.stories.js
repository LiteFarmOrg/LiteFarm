import React from 'react';
import PureAddNewCrop from '../../../components/AddNewCrop';
import decorators from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/AddNewCrop',
  decorators: decorators,
  component: PureAddNewCrop,
};

const Template = (args) => <PureAddNewCrop {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const WithDropdownOpen = Template.bind({});
WithDropdownOpen.args = {
  useHookFormPersist: () => ({}),
  isPhysiologyAnatomyDropDownOpen: true,
};
WithDropdownOpen.parameters = {
  ...chromaticSmallScreen,
};
