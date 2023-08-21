import React from 'react';
import AreaDetails from '../../../../components/LocationDetailLayout/AreaDetails/AreaDetails';
import decorator from '../../config/Decorators';
import { FormProvider, useForm } from 'react-hook-form';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Location/Area/AreaDetails',
  decorators: decorator,
  component: AreaDetails,
};

const Template = (args) => {
  const {
    register,
    watch,
    setValue,
    getValues,
    setError,
    control,
    handleSubmit,

    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });
  const formMethods = {
    register,
    watch,
    setValue,
    getValues,
    setError,
    control,
    handleSubmit,
    formState: { errors },
  };
  return (
    <FormProvider {...formMethods}>
      <AreaDetails {...args} />
    </FormProvider>
  );
};

export const Post = Template.bind({});
Post.args = {
  isCreateLocationPage: true,
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
  match: { params: { location_id: 1 } },
  children: (data) => {},
  errors: (data) => {},
  areaType: (data) => {},
  system: 'metric',
};
Post.parameters = {
  ...chromaticSmallScreen,
};
