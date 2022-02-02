import React from 'react';
import PureAddNewCrop from '../../../components/AddNewCrop';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Crop/AddNewCrop',
  decorators: decorators,
  component: PureAddNewCrop,
};

const Template = (args) => <PureAddNewCrop {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  useHookFormPersist: () => ({}),
  handleGoBack: () => {},
  handleCancel: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const WithDropdownOpen = Template.bind({});
WithDropdownOpen.args = {
  useHookFormPersist: () => ({}),
  isPhysiologyAnatomyDropDownOpen: true,
  handleGoBack: () => {},
  handleCancel: () => {},
};
WithDropdownOpen.parameters = {
  ...chromaticSmallScreen,
};
