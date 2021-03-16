import React from 'react';
import AreaDetailsLayout from '../../components/AreaDetailsLayout';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Components/Area/AreaDetailsLayout',
  decorators: decorator,
  component: AreaDetailsLayout,
};

const Template = (args) => <AreaDetailsLayout {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  name: 'Area asset name',
  title: 'Area asset title',
  submitForm: (data) => {},
  onError: (data) => {},
  isNameRequired: true,
  disabled: false,
  register: (data) => {},
  handleSubmit: (data) => {},
  showPerimeter: true,
  setValue: (data) => {},
  history: (data) => {},
  errors: (data) => {},
  areaType: (data) => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
