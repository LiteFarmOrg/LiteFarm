import React from 'react';
import PointDetails from '../../../../components/LocationDetailLayout/PointDetails/PointDetails';
import decorator from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import { FormProvider, useForm } from 'react-hook-form';

export default {
  title: 'Form/Location/Point/PointDetails',
  decorators: decorator,
  component: PointDetails,
};

const Template = (args) => (
  <FormProvider {...useForm()}>
    <PointDetails {...args} />
  </FormProvider>
);

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
  match: { params: { location_id: 1 } },
  onError: (data) => {},
  register: (data) => {},
  disabled: false,
  errors: (data) => {},
};
Post.parameters = {
  ...chromaticSmallScreen,
};
