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
  name: 'Field',
  title: 'Add field',
  submitForm: (data) => {},
  onError: (data) => {},
  disabled: false,
  register: (data) => {},
  handleSubmit: (data) => {},
  showPerimeter: true,
  setValue: (data) => {},
  getValues: (data) => {},
  setError: (data) => {},
  control: (data) => {},
  history: (data) => {},
  children: (data) => {},
  errors: (data) => {},
  system: (data) => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
