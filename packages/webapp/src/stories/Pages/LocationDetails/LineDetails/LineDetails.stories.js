import React from 'react';
import LineDetails from '../../../../components/LocationDetailLayout/LineDetails';
import decorator from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Location/Line/LineDetails',
  decorators: decorator,
  component: LineDetails,
};

const Template = (args) => <LineDetails {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
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
Post.parameters = {
  ...chromaticSmallScreen,
};
