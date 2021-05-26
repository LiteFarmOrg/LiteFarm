import React from 'react';
import PureAddNewCrop from '../../../components/AddNewCrop';
import decorators from '../config/decorators';

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
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const WithDropdownOpen = Template.bind({});
WithDropdownOpen.args = {
  useHookFormPersist: () => ({}),
  isPhysiologyAnatomyDropDownOpen: true,
};
WithDropdownOpen.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
