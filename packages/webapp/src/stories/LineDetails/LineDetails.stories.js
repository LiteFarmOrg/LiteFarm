import React from 'react';
import LineDetails from '../../components/LineDetailsLayout';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Components/Line/LineDetails',
  decorators: decorator,
  component: LineDetails,
};

const Template = (args) => <LineDetails {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  name: 'Fence',
  title: 'Add fence',
  submitForm: (data) => {},
  children: (data) => {},
  setValue: (data) => {},
  handleSubmit: (data) => {},
  history: (data) => {},
  onError: (data) => {},
  register: (data) => {},
  disabled: false,
  errors: (data) => {},
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
