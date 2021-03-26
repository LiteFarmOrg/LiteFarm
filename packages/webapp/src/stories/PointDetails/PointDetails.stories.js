import React from 'react';
import PointDetails from '../../components/PointDetailsLayout';
import decorator from '../Pages/config/decorators';

export default {
  title: 'Form/Point/PointDetails',
  decorators: decorator,
  component: PointDetails,
};

const Template = (args) => <PointDetails {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  name: 'Gate',
  title: 'Add gate',
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
