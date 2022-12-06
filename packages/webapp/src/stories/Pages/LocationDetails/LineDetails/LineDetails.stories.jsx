import React from 'react';
import LineDetails from '../../../../components/LocationDetailLayout/LineDetails/LineDetails';
import decorator from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import { FormProvider, useForm } from 'react-hook-form';

export default {
  title: 'Form/Location/Line/LineDetails',
  decorators: decorator,
  component: LineDetails,
};

const Template = (args) => (
  <FormProvider {...useForm()}>
    {' '}
    <LineDetails {...args} />
  </FormProvider>
);

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
  match: { params: { location_id: 1 } },
  onError: (data) => {},
  register: (data) => {},
  disabled: false,
  errors: (data) => {},
};
Post.parameters = {
  ...chromaticSmallScreen,
};
