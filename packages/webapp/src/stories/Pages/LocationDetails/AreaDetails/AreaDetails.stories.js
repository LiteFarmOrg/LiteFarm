import React from 'react';
import AreaDetailsLayout from '../../../../components/LocationDetailLayout/AreaDetailsLayout';
import decorator from '../../config/decorators';
import { useForm } from 'react-hook-form';

export default {
  title: 'Form/Location/Area/AreaDetailsLayout',
  decorators: decorator,
  component: AreaDetailsLayout,
};

const Template = (args) => {
  const { register, errors, watch, setValue, getValues, setError, control, handleSubmit } = useForm(
    {
      mode: 'onChange',
    },
  );
  return (
    <AreaDetailsLayout
      {...args}
      register={register}
      control={control}
      setError={setError}
      errors={errors}
      setValue={setValue}
      getValues={getValues}
      watch={watch}
      handleSubmit={handleSubmit}
    />
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
  children: (data) => {},
  errors: (data) => {},
  areaType: (data) => {},
  system: 'metric',
};
Post.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
