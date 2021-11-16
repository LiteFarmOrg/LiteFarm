import React from 'react';
import PointDetails from '../../../../components/LocationDetailLayout/PointDetails';
import decorator from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Location/Point/PointDetails',
  decorators: decorator,
  component: PointDetails,
};

const Template = (args) => <PointDetails {...args} />;

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
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
Post.parameters = {
  ...chromaticSmallScreen,
};
